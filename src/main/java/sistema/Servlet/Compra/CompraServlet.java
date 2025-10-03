package sistema.Servlet.Compra;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sistema.Controller.Compra.CompraController;
import sistema.Ejecucion.Auditoria;
import sistema.Modelo.Compra.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.*;

@WebServlet("/CompraServlet")
public class CompraServlet extends HttpServlet {

    private final CompraController compraController = new CompraController();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("text/plain;charset=UTF-8");
        StringBuilder jsonBuffer = new StringBuilder();

        String tipoAccionAuditoria = "COMPRA_REGISTRO";
        String descripcionAuditoria = "Inicio de procesamiento de datos para el registro de una Compra.";

        // Inicializar Compra fuera del try para que esté disponible en los catch blocks
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

            // ---------- 1. Parsear Compra (Datos principales) ----------
            compra.setIdProveedor(root.path("idProveedor").asInt());
            compra.setTipoComprobante(root.path("tipo_comprobante").asText("").trim());
            compra.setSerie(root.path("serie").asText("").trim());
            compra.setCorrelativo(root.path("correlativo").asText("").trim());

            // AUDITORÍA PASO 1: Inicio del parseo de datos principales
            descripcionAuditoria = "Procesando datos principales | Comprobante: " + compra.getTipoComprobante() + " " + compra.getSerie() + "-" + compra.getCorrelativo() + " | Proveedor ID: " + compra.getIdProveedor();
            Auditoria.registrar(request, tipoAccionAuditoria + "_INICIO_PARSEO", descripcionAuditoria);

            String fechaEmisionStr = root.path("fecha_emision").asText();
            if (!fechaEmisionStr.isBlank()) {
                compra.setFechaEmision(LocalDate.parse(fechaEmisionStr));
            }
            String fechaVencimientoStr = root.path("fecha_vencimiento").asText();
            if (!fechaVencimientoStr.isBlank()) {
                compra.setFechaVencimiento(LocalDate.parse(fechaVencimientoStr));
            }

            compra.setTipoPago(root.path("tipo_pago").asText("").trim());
            compra.setFormaPago(root.path("forma_pago").asText("").trim());
            compra.setMoneda(root.path("moneda").asText("Soles").trim());
            compra.setTipoCambio(root.path("tipo_cambio").asDouble(1.0));
            compra.setIncluyeIgv(root.path("incluyeIgv").asBoolean(true));
            compra.setHayBonificacion(root.path("hayBonificacion").asBoolean(false));
            compra.setHayDescuento(root.path("hayDescuento").asBoolean(false));
            compra.setHayTraslado(root.path("hayTraslado").asBoolean(false));
            compra.setObservation(root.path("observation").asText("").trim());
            compra.setSubtotal(root.path("subtotal").asDouble(0));
            compra.setIgv(root.path("igv").asDouble(0));
            compra.setTotal(root.path("total").asDouble(0));
            compra.setTotalPeso(root.path("totalPeso").asDouble(0));
            compra.setCosteTransporte(root.path("costeTransporte").asDouble(0));

            // ---------- 2. DocumentoReferencia ----------
            DocumentoReferencia docRef = null;
            if (root.has("referencia")) {
                docRef = new DocumentoReferencia();
                var dr = root.get("referencia");
                docRef.setNumeroCotizacion(dr.path("numeroCotizacion").asText("").trim());
                docRef.setNumeroPedido(dr.path("numeroPedido").asText("").trim());

                // AUDITORÍA PASO 2: Documento de Referencia
                Auditoria.registrar(request, tipoAccionAuditoria + "_REF_COTIZACION", "Procesada Documentación de Referencia | Cotización: " + docRef.getNumeroCotizacion() + ", Pedido: " + docRef.getNumeroPedido());
            }

            // ---------- 3. GuiaTransporte ----------
            GuiaTransporte guia = null;
            if (root.has("guia")) {
                guia = new GuiaTransporte();
                var gt = root.get("guia");
                guia.setRucGuia(gt.path("ruc").asText("").trim());
                guia.setTipoComprobante(gt.path("tipoComprobante").asText("").trim());
                guia.setSerie(gt.path("serie").asText("").trim());
                guia.setCorrelativo(gt.path("correlativo").asText("").trim());
                guia.setNumeroGuia(gt.path("numeroGuia").asText("").trim());
                guia.setCiudadTraslado(gt.path("ciudadTraslado").asText("").trim());
                guia.setCosteTotalTransporte(gt.path("costeTotalTransporte").asDouble(0));
                guia.setPeso(gt.path("peso").asDouble(0));
                guia.setSerieGuia(gt.path("serieGuiaTransporte").asText("").trim());
                guia.setCorrelativoGuia(gt.path("correlativoGuiaTransporte").asText("").trim());

                if (gt.hasNonNull("fechaEmision") && !gt.get("fechaEmision").asText().isBlank()) {
                    guia.setFechaEmision(LocalDate.parse(gt.get("fechaEmision").asText()));
                }
                if (gt.hasNonNull("fechaPedido") && !gt.get("fechaPedido").asText().isBlank()) {
                    guia.setFechaPedido(LocalDate.parse(gt.get("fechaPedido").asText()));
                }
                if (gt.hasNonNull("fechaEntrega") && !gt.get("fechaEntrega").asText().isBlank()) {
                    guia.setFechaEntrega(LocalDate.parse(gt.get("fechaEntrega").asText()));
                }

                // AUDITORÍA PASO 3: Guía de Transporte
                Auditoria.registrar(request, tipoAccionAuditoria + "_REF_GUIA", "Procesada Guía de Transporte | N° Guía: " + guia.getNumeroGuia() + ", Peso Total: " + guia.getPeso());
            }

            // ---------- 4. Detalles y 5. Descuentos (se procesan juntos para el conteo) ----------
            List<DetalleCompra> detalles = new ArrayList<>();
            List<Descuento> descuentos = new ArrayList<>();
            int itemCount = 0;
            int discountCount = 0;

            if (root.has("detalles")) {
                int tempId = 1;
                for (var d : root.get("detalles")) {
                    if (!d.has("idProducto") || d.path("idProducto").asInt() == 0) continue;
                    itemCount++;
                    DetalleCompra detalle = new DetalleCompra();
                    detalle.setIdDetalle(tempId);
                    detalle.setIdProducto(d.path("idProducto").asInt());
                    detalle.setCantidad(d.path("cantidad").asDouble(0));
                    detalle.setPrecioUnitario(d.path("precioUnitario").asDouble(0));
                    detalle.setCosteUnitarioTransporte(d.path("costeUnitarioTransporte").asDouble(0));
                    detalle.setCosteTotalTransporte(d.path("costeTotalTransporte").asDouble(0));
                    detalle.setPrecioConDescuento(d.path("precioConDescuento").asDouble(0));
                    detalle.setIgvProducto(d.path("igvProducto").asDouble(0));
                    detalle.setTotal(d.path("total").asDouble(0));
                    detalle.setPesoTotal(d.path("pesoTotal").asDouble(0));
                    detalles.add(detalle);

                    // Descuentos por ítem
                    if (d.has("descuentos")) {
                        for (var desc : d.get("descuentos")) {
                            discountCount++;
                            Descuento descuento = new Descuento();
                            descuento.setNivel("item");
                            descuento.setTipo(desc.path("tipo").asText("").trim());
                            descuento.setValor(desc.path("valor").asDouble(0));
                            descuento.setIdDetalle(tempId);
                            descuentos.add(descuento);
                        }
                    }
                    tempId++;
                }
            }

            // Descuentos Globales
            if (root.has("descuentosGlobales")) {
                for (var desc : root.get("descuentosGlobales")) {
                    discountCount++;
                    Descuento descuento = new Descuento();
                    descuento.setNivel("global");
                    descuento.setTipo(desc.path("tipo").asText("").trim());
                    descuento.setValor(desc.path("valor").asDouble(0));
                    descuentos.add(descuento);
                }
            }
            // AUDITORÍA PASO 4: Detalles y Descuentos
            Auditoria.registrar(request, tipoAccionAuditoria + "_PROCESO_DETALLES", "Detalles y Descuentos procesados | Ítems: " + itemCount + ", Descuentos aplicados: " + discountCount);


            // ---------- 6. CajasCompra ----------
            List<Caja> cajasCompra = new ArrayList<>();
            Map<Integer, List<DetalleCaja>> detallesCajaMap = new HashMap<>();
            int cajaCount = 0;

            int tempIdCaja = 1;
            if (root.has("cajasCompra")) {
                for (var c : root.get("cajasCompra")) {
                    cajaCount++;
                    Caja caja = new Caja();
                    caja.setIdCajaCompra(tempIdCaja); // ID temporal
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
                            detCaja.setCantidad(BigDecimal.valueOf(dc.path("cantidad").asInt(0)));
                            listaDetalles.add(detCaja);
                        }
                    }
                    detallesCajaMap.put(tempIdCaja, listaDetalles);
                    tempIdCaja++;
                }
                // AUDITORÍA PASO 5: Cajas de Compra
                Auditoria.registrar(request, tipoAccionAuditoria + "_PROCESO_CAJAS", "Procesadas Cajas de Compra | Cantidad de cajas: " + cajaCount);
            }

            // ---------- 7. Llamar Controller ----------
            // AUDITORÍA PASO 6: Antes de la ejecución final
            Auditoria.registrar(request, tipoAccionAuditoria + "_EJECUCION_CONTROLLER", "Iniciando la transacción en el Controller para la Compra " + compra.getSerie() + "-" + compra.getCorrelativo() + ". (Fase Crítica)");

            int idCompra = compraController.registrarCompra(
                    compra, guia, docRef, detalles, descuentos, cajasCompra, detallesCajaMap
            );

            // AUDITORÍA FINAL: ÉXITO
            String descExito = "Registro exitoso: Compra " + compra.getTipoComprobante() + " " + compra.getSerie() + "-" + compra.getCorrelativo() + " ha sido **registrada con ID " + idCompra + "** y Total $" + compra.getTotal() + ".";
            Auditoria.registrar(request, tipoAccionAuditoria + "_EXITO", descExito);

            response.getWriter().write("Compra registrada con ID: " + idCompra);

        } catch (SQLException e) {
            // AUDITORÍA FINAL: ERROR SQL
            String descError = "ERROR BASE DE DATOS: Fallo al registrar Compra " + compra.getSerie() + "-" + compra.getCorrelativo() + ". Detalle técnico: " + e.getMessage();
            Auditoria.registrar(request, tipoAccionAuditoria + "_ERROR_SQL", descError);

            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error SQL: " + e.getMessage());
        } catch (Exception e) {
            // AUDITORÍA FINAL: ERROR INESPERADO (Parseo, etc.)
            String comprobanteInfo = compra.getSerie() != null && !compra.getSerie().isEmpty() ? compra.getTipoComprobante() + " " + compra.getSerie() + "-" + compra.getCorrelativo() : "sin comprobante definido";

            String descError = "ERROR DE PROCESAMIENTO: Fallo al procesar la Compra (" + comprobanteInfo + "). Detalle: " + e.getMessage();
            Auditoria.registrar(request, tipoAccionAuditoria + "_ERROR_INESPERADO", descError);

            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Error: " + e.getMessage());
        }
    }
}
