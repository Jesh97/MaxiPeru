package sistema.Servlet.Compra;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sistema.Controller.Compra.CompraController;
import sistema.Controller.Producto.ArticuloController;
import sistema.Ejecucion.Auditoria;
import sistema.Modelo.Articulo.Articulo;
import sistema.Modelo.Compra.*;
import sistema.repository.ArticuloRepository;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.*;

@WebServlet("/CompraServlet")
public class CompraServlet extends HttpServlet {

    private final CompraController compraController = new CompraController();
    private final ArticuloRepository articuloDAO = new ArticuloController();
    private final ObjectMapper mapper = new ObjectMapper();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        String busqueda = request.getParameter("buscarArticulo");

        if (busqueda != null && !busqueda.trim().isEmpty()) {
            List<Articulo> lista = articuloDAO.buscarArticulosParaCompra(busqueda);
            out.print(gson.toJson(lista));
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Parámetro 'buscarArticulo' es requerido.\"}");
        }
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("text/plain;charset=UTF-8");
        StringBuilder jsonBuffer = new StringBuilder();

        String tipoAccionAuditoria = "COMPRA_REGISTRO";
        String descripcionAuditoria;

        Compra compra = new Compra();

        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                jsonBuffer.append(line);
            }
        } catch (IOException e) {
            Auditoria.registrar(request, tipoAccionAuditoria + "_ERROR_LECTURA", "ERROR DE I/O: Fallo al leer el cuerpo de la solicitud JSON. Detalle: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Error al leer datos JSON: " + e.getMessage());
            return;
        }

        try {
            var root = mapper.readTree(jsonBuffer.toString());

            compra.setIdProveedor(root.path("proveedorId").asInt());
            compra.setIdTipoComprobante(root.path("tipoComprobanteId").asInt());
            compra.setSerie(root.path("serie").asText("").trim());
            compra.setCorrelativo(root.path("correlativo").asText("").trim());

            descripcionAuditoria = "Procesando datos principales | Comprobante: " + compra.getSerie() + "-" + compra.getCorrelativo() + " | Proveedor ID: " + compra.getIdProveedor();
            Auditoria.registrar(request, tipoAccionAuditoria + "_INICIO_PARSEO", descripcionAuditoria);

            // 🛠️ INICIO DE LA CORRECCIÓN: Manejo de fechaEmision
            String fechaEmisionStr = root.path("fechaEmision").asText();
            if (!fechaEmisionStr.isBlank()) {
                compra.setFechaEmision(LocalDate.parse(fechaEmisionStr));
            } else {
                // Si la fecha es nula o vacía (causa del error), se usa la fecha actual
                compra.setFechaEmision(LocalDate.now());
            }
            // 🛠️ FIN DE LA CORRECCIÓN

            String fechaVencimientoStr = root.path("fechaVencimiento").asText();
            if (!fechaVencimientoStr.isBlank()) {
                compra.setFechaVencimiento(LocalDate.parse(fechaVencimientoStr));
            }

            compra.setIdTipoPago(root.path("tipoPagoId").asInt());
            compra.setIdFormaPago(root.path("formaPagoId").asInt());
            compra.setIdMoneda(root.path("monedaId").asInt());
            compra.setTipoCambio(BigDecimal.valueOf(root.path("tipoCambio").asDouble(1.0)));
            compra.setIncluyeIgv(root.path("incluyeIgv").asBoolean(true));
            compra.setHayBonificacion(root.path("hayBonificacion").asBoolean(false));
            compra.setHayTraslado(root.path("hayTraslado").asBoolean(false));
            compra.setObservacion(root.path("observation").asText("").trim());

            compra.setSubtotal(BigDecimal.valueOf(root.path("subtotalSinIgv").asDouble(0)));
            compra.setIgv(BigDecimal.valueOf(root.path("totalIgv").asDouble(0)));
            compra.setTotal(BigDecimal.valueOf(root.path("totalAPagar").asDouble(0)));
            compra.setTotalPeso(BigDecimal.valueOf(root.path("totalPeso").asDouble(0)));
            compra.setCosteTransporte(BigDecimal.valueOf(root.path("costeTransporte").asDouble(0)));


            DocumentoReferencia docRef = null;
            if (root.has("referencia")) {
                docRef = new DocumentoReferencia();
                var dr = root.get("referencia");
                docRef.setNumeroCotizacion(dr.path("numeroCotizacion").asText("").trim());
                docRef.setNumeroPedido(dr.path("numeroPedido").asText("").trim());

                Auditoria.registrar(request, tipoAccionAuditoria + "_REF_COTIZACION", "Procesada Documentación de Referencia | Cotización: " + docRef.getNumeroCotizacion() + ", Pedido: " + docRef.getNumeroPedido());
            }

            GuiaTransporte guia = null;
            if (root.has("guiaTransporte")) {
                guia = new GuiaTransporte();
                var gt = root.get("guiaTransporte");

                // Campos principales de Guía
                guia.setRucGuia(gt.path("rucGuia").asText("").trim());
                guia.setRazonSocialGuia(gt.path("razonSocialGuia").asText("").trim());
                guia.setTipoComprobante(gt.path("tipoComprobante").asText("").trim());
                guia.setSerie(gt.path("serie").asText("").trim());
                guia.setCorrelativo(gt.path("correlativo").asText("").trim());
                guia.setSerieGuiaTransporte(gt.path("serieGuiaTransporte").asText("").trim());
                guia.setCorrelativoGuiaTransporte(gt.path("correlativoGuiaTransporte").asText("").trim());

                // Campos de Traslado
                guia.setCiudadTraslado(gt.path("ciudadTraslado").asText("").trim());
                guia.setPuntoPartida(gt.path("puntoPartida").asText("").trim());
                guia.setPuntoLlegada(gt.path("puntoLlegada").asText("").trim());
                guia.setCosteTotalTransporte(BigDecimal.valueOf(gt.path("costeTotalTransporte").asDouble(0)));
                guia.setPeso(BigDecimal.valueOf(gt.path("peso").asDouble(0)));
                guia.setObservaciones(gt.path("observaciones").asText("").trim());
                guia.setModalidadTransporte(gt.path("modalidadTransporte").asText("").trim());

                // Información de Empresa y Conductor (Campos extendidos)
                guia.setRucEmpresa(gt.path("rucEmpresa").asText("").trim());
                guia.setRazonSocialEmpresa(gt.path("razonSocialEmpresa").asText("").trim());
                guia.setMarcaVehiculo(gt.path("marcaVehiculo").asText("").trim());
                guia.setDniConductor(gt.path("dniConductor").asText("").trim());
                guia.setNombreConductor(gt.path("nombreConductor").asText("").trim());

                // Fechas
                guia.setFechaEmision(gt.hasNonNull("fechaEmision") && !gt.get("fechaEmision").asText().isBlank() ? LocalDate.parse(gt.get("fechaEmision").asText()) : null);
                guia.setFechaPedido(gt.hasNonNull("fechaPedido") && !gt.get("fechaPedido").asText().isBlank() ? LocalDate.parse(gt.get("fechaPedido").asText()) : null);
                guia.setFechaEntrega(gt.hasNonNull("fechaEntrega") && !gt.get("fechaEntrega").asText().isBlank() ? LocalDate.parse(gt.get("fechaEntrega").asText()) : null);
                guia.setFechaTraslado(gt.hasNonNull("fechaTraslado") && !gt.get("fechaTraslado").asText().isBlank() ? LocalDate.parse(gt.get("fechaTraslado").asText()) : null);


                Auditoria.registrar(request, tipoAccionAuditoria + "_REF_GUIA", "Procesada Guía de Transporte | Ciudad: " + guia.getCiudadTraslado() + ", Peso Total: " + guia.getPeso());
            }


            List<DetalleCompra> detalles = new ArrayList<>();
            List<Descuento> descuentos = new ArrayList<>();
            int itemCount = 0;
            int discountCount = 0;

            if (root.has("detalles")) {
                int tempId = 1;
                for (var d : root.get("detalles")) {
                    if (!d.has("idArticulo") || d.path("idArticulo").asInt() == 0) continue;
                    itemCount++;
                    DetalleCompra detalle = new DetalleCompra();
                    detalle.setIdDetalle(tempId);
                    detalle.setIdArticulo(d.path("idArticulo").asInt());

                    detalle.setCantidad(BigDecimal.valueOf(d.path("cantidad").asDouble(0)));
                    detalle.setPrecioUnitario(BigDecimal.valueOf(d.path("precioUnitario").asDouble(0)));
                    detalle.setBonificacion(BigDecimal.valueOf(d.path("bonificacion").asDouble(0)));
                    detalle.setCosteUnitarioTransporte(BigDecimal.valueOf(d.path("costeUnitarioTransporte").asDouble(0)));
                    detalle.setCosteTotalTransporte(BigDecimal.valueOf(d.path("costeTotalTransporte").asDouble(0)));
                    detalle.setPrecioConDescuento(BigDecimal.valueOf(d.path("precioConDescuento").asDouble(0)));
                    detalle.setIgvInsumo(BigDecimal.valueOf(d.path("igvInsumo").asDouble(0)));
                    detalle.setTotal(BigDecimal.valueOf(d.path("total").asDouble(0)));
                    detalle.setPesoTotal(BigDecimal.valueOf(d.path("pesoTotal").asDouble(0)));
                    detalles.add(detalle);

                    if (d.has("descuentos")) {
                        for (var desc : d.get("descuentos")) {
                            discountCount++;
                            Descuento descuento = new Descuento();
                            descuento.setNivel("item");
                            descuento.setMotivo(desc.path("motivo").asText("Descuento Item").trim());
                            descuento.setTipoValor(desc.path("tipoValor").asText("monto").trim());
                            descuento.setValor(BigDecimal.valueOf(desc.path("valor").asDouble(0)));
                            descuento.setTasaIgv(BigDecimal.valueOf(desc.path("tasaIgv").asDouble(0.18)));
                            descuento.setIdDetalle(tempId);
                            descuentos.add(descuento);
                        }
                    }
                    tempId++;
                }
            }


            if (root.has("descuentosGlobales")) {
                for (var desc : root.get("descuentosGlobales")) {
                    discountCount++;
                    Descuento descuento = new Descuento();
                    descuento.setNivel("global");
                    descuento.setMotivo(desc.path("motivo").asText("Descuento Global").trim());
                    descuento.setTipoValor(desc.path("tipoValor").asText("monto").trim());
                    descuento.setValor(BigDecimal.valueOf(desc.path("valor").asDouble(0)));
                    descuento.setTasaIgv(BigDecimal.valueOf(desc.path("tasaIgv").asDouble(0.18)));
                    descuentos.add(descuento);
                }
            }
            Auditoria.registrar(request, tipoAccionAuditoria + "_PROCESO_DETALLES", "Detalles y Descuentos procesados | Ítems: " + itemCount + ", Descuentos aplicados: " + discountCount);


            List<Caja> cajasCompra = new ArrayList<>();
            Map<Integer, List<DetalleCaja>> detallesCajaMap = new HashMap<>();
            int cajaCount = 0;

            int tempIdCaja = 1;
            if (root.has("cajasCompra")) {
                for (var c : root.get("cajasCompra")) {
                    cajaCount++;
                    Caja caja = new Caja();
                    caja.setIdCajaCompra(tempIdCaja);
                    caja.setNombreCaja(c.path("nombreCaja").asText("").trim());
                    caja.setCantidad(c.path("cantidad").asInt(0));
                    caja.setCostoCaja(c.path("costoCaja").decimalValue());
                    cajasCompra.add(caja);

                    List<DetalleCaja> listaDetalles = new ArrayList<>();
                    if (c.has("detalles")) {
                        for (var dc : c.get("detalles")) {
                            DetalleCaja detCaja = new DetalleCaja();
                            detCaja.setIdCajaCompra(tempIdCaja);
                            detCaja.setIdArticulo(dc.path("idArticulo").asInt(0));
                            detCaja.setCantidad(dc.path("cantidad").decimalValue());
                            listaDetalles.add(detCaja);
                        }
                    }
                    detallesCajaMap.put(tempIdCaja, listaDetalles);
                    tempIdCaja++;
                }
                Auditoria.registrar(request, tipoAccionAuditoria + "_PROCESO_CAJAS", "Procesadas Cajas de Compra | Cantidad de cajas: " + cajaCount);
            }

            Auditoria.registrar(request, tipoAccionAuditoria + "_EJECUCION_CONTROLLER", "Iniciando la transacción en el Controller para la Compra " + compra.getSerie() + "-" + compra.getCorrelativo() + ". (Fase Crítica)");

            int idCompra = compraController.registrarCompra(
                    compra, guia, docRef, detalles, descuentos, cajasCompra, detallesCajaMap
            );

            String descExito = "Registro exitoso: Compra " + compra.getSerie() + "-" + compra.getCorrelativo() + " ha sido **registrada con ID " + idCompra + "** y Total $" + compra.getTotal() + ".";
            Auditoria.registrar(request, tipoAccionAuditoria + "_EXITO", descExito);

            response.getWriter().write("Compra registrada con ID: " + idCompra);

        } catch (SQLException e) {
            String comprobanteInfo = compra.getSerie() != null && !compra.getSerie().isEmpty() ? compra.getSerie() + "-" + compra.getCorrelativo() : "sin comprobante definido";
            String descError = "ERROR BASE DE DATOS: Fallo al registrar Compra (" + comprobanteInfo + "). Detalle técnico: " + e.getMessage();
            Auditoria.registrar(request, tipoAccionAuditoria + "_ERROR_SQL", descError);

            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error SQL: " + e.getMessage());
        } catch (Exception e) {
            String comprobanteInfo = compra.getSerie() != null && !compra.getSerie().isEmpty() ? compra.getSerie() + "-" + compra.getCorrelativo() : "sin comprobante definido";

            String descError = "ERROR DE PROCESAMIENTO: Fallo al procesar la Compra (" + comprobanteInfo + "). Detalle: " + e.getMessage();
            Auditoria.registrar(request, tipoAccionAuditoria + "_ERROR_INESPERADO", descError);

            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Error: " + e.getMessage());
        }
    }
}