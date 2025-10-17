package sistema.Servlet.Compra;

import com.fasterxml.jackson.databind.JsonNode;
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
import java.io.StringWriter;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
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

            String descripcion = "Búsqueda de artículos para compra: '" + busqueda + "'. Resultados: " + lista.size();
            Auditoria.registrar(request, "LECTURA", descripcion);

            out.print(gson.toJson(lista));
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print(gson.toJson(Map.of("error","Parámetro 'buscarArticulo' es requerido.")));
        }
        out.flush();
    }

    private LocalDate parseDate(JsonNode node, String fieldName) {
        if (node.hasNonNull(fieldName)) {
            String dateStr = node.get(fieldName).asText();
            if (!dateStr.isBlank()) {
                try {
                    return LocalDate.parse(dateStr);
                } catch (Exception e) {
                }
            }
        }
        return null;
    }

    private String readJsonBody(HttpServletRequest request) throws IOException {
        StringBuilder jsonBuffer = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                jsonBuffer.append(line);
            }
        }
        return jsonBuffer.toString();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json;charset=UTF-8");

        Compra compra = new Compra();
        GuiaTransporte guia = null;
        DocumentoReferencia docRef = null;
        ReglaAplicada regla = null;
        List<DetalleCompra> detalles = new ArrayList<>();
        List<Descuento> descuentos = new ArrayList<>();
        List<Caja> cajasCompra = new ArrayList<>();
        Map<Integer, List<DetalleCaja>> detallesCajaMap = new HashMap<>();

        String jsonBody;
        try {
            jsonBody = readJsonBody(request);
        } catch (IOException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(gson.toJson(Map.of("success", false, "message", "Error al leer datos JSON: " + e.getMessage())));
            return;
        }

        try {
            JsonNode root = mapper.readTree(jsonBody);

            int proveedorId = root.path("proveedorId").asInt(0);
            if (proveedorId <= 0) {
                throw new IllegalArgumentException("El ID de Proveedor es inválido o no se ha seleccionado un proveedor.");
            }
            compra.setIdProveedor(proveedorId);

            compra.setIdMoneda(root.path("monedaId").asInt(0));
            if (compra.getIdMoneda() <= 0) {
                throw new IllegalArgumentException("El ID de Moneda es inválido.");
            }

            compra.setIdTipoComprobante(root.path("tipoComprobanteId").asInt());
            compra.setSerie(root.path("serie").asText("").trim());
            compra.setCorrelativo(root.path("correlativo").asText("").trim());

            compra.setFechaEmision(parseDate(root, "fechaEmision"));
            if (compra.getFechaEmision() == null) {
                compra.setFechaEmision(LocalDate.now());
            }
            compra.setFechaVencimiento(parseDate(root, "fechaVencimiento"));
            compra.setIdTipoPago(root.path("tipoPagoId").asInt());
            compra.setIdFormaPago(root.path("formaPagoId").asInt());
            compra.setTipoCambio(BigDecimal.valueOf(root.path("tipoCambio").asDouble(1.0)));
            compra.setIncluyeIgv(root.path("incluyeIgv").asBoolean(true));
            compra.setHayBonificacion(root.path("hayBonificacion").asBoolean(false));

            boolean hayTraslado = root.path("hayTraslado").asBoolean(false);
            compra.setHayTraslado(hayTraslado);

            compra.setObservacion(root.path("observation").asText("").trim());
            compra.setSubtotal(BigDecimal.valueOf(root.path("subtotalSinIgv").asDouble(0)));
            compra.setIgv(BigDecimal.valueOf(root.path("totalIgv").asDouble(0)));
            compra.setTotal(BigDecimal.valueOf(root.path("totalAPagar").asDouble(0)));
            compra.setTotalPeso(BigDecimal.valueOf(root.path("totalPeso").asDouble(0)));
            compra.setCosteTransporte(BigDecimal.valueOf(root.path("costeTransporte").asDouble(0)));

            if (root.has("reglaAplicada") && root.get("reglaAplicada").isObject()) {
                var ra = root.get("reglaAplicada");
                regla = new ReglaAplicada();
                regla.setAplicaCostoAdicional(ra.path("aplicaCostoAdicional").asBoolean(false));
                regla.setMontoMinimo(BigDecimal.valueOf(ra.path("montoMinimo").asDouble(0)));
                regla.setCostoAdicional(BigDecimal.valueOf(ra.path("costoAdicional").asDouble(0)));
            }

            if (root.has("referencia") && root.get("referencia").isObject()) {
                var dr = root.get("referencia");
                docRef = new DocumentoReferencia();
                docRef.setNumeroCotizacion(dr.path("numeroCotizacion").asText("").trim());
                docRef.setNumeroPedido(dr.path("numeroPedido").asText("").trim());
            }

            if (root.has("guiaTransporte") && root.get("guiaTransporte").isObject()) {
                guia = new GuiaTransporte();
                var gt = root.get("guiaTransporte");

                String rucOrRazonSocial = gt.path("rucGuia").asText("").trim();
                guia.setRucGuia(rucOrRazonSocial);
                guia.setTipoComprobante(gt.path("tipoComprobante").asText("").trim());
                guia.setSerie(gt.path("serie").asText("").trim());
                guia.setCorrelativo(gt.path("correlativo").asText("").trim());
                guia.setSerieGuiaTransporte(gt.path("serieGuiaTransporte").asText("").trim());
                guia.setCorrelativoGuiaTransporte(gt.path("correlativoGuiaTransporte").asText("").trim());
                guia.setCiudadTraslado(gt.path("ciudadTraslado").asText("").trim());
                guia.setPuntoPartida(gt.path("puntoPartida").asText("").trim());
                guia.setPuntoLlegada(gt.path("puntoLlegada").asText("").trim());
                guia.setCosteTotalTransporte(BigDecimal.valueOf(gt.path("costeTotalTransporte").asDouble(0)));
                guia.setPeso(BigDecimal.valueOf(gt.path("peso").asDouble(0)));
                guia.setFechaEmision(parseDate(gt, "fechaEmision"));
                guia.setFechaPedido(parseDate(gt, "fechaPedido"));
                guia.setFechaEntrega(parseDate(gt, "fechaEntrega"));
            }

            if (root.has("detalles")) {
                int tempId = 1;
                for (var d : root.get("detalles")) {
                    if (!d.has("idArticulo") || d.path("idArticulo").asInt() == 0) continue;

                    DetalleCompra detalle = new DetalleCompra();
                    detalle.setIdDetalle(tempId);
                    int idArticulo = d.path("idArticulo").asInt();
                    detalle.setIdArticulo(idArticulo);
                    detalle.setIdUnidad(d.path("idUnidad").asInt(0)); // Asegurando que idUnidad se lea
                    detalle.setCantidad(BigDecimal.valueOf(d.path("cantidad").asDouble(0)));
                    detalle.setPrecioUnitario(BigDecimal.valueOf(d.path("precioUnitario").asDouble(0)));
                    detalle.setBonificacion(BigDecimal.valueOf(d.path("bonificacion").asDouble(0)));
                    detalle.setCosteUnitarioTransporte(BigDecimal.valueOf(d.path("costeUnitarioTransporte").asDouble(0)));
                    detalle.setCosteTotalTransporte(BigDecimal.valueOf(d.path("costeTotalTransporte").asDouble(0)));
                    detalle.setPrecioConDescuento(BigDecimal.valueOf(d.path("precioConDescuento").asDouble(0)));
                    detalle.setIgvInsumo(BigDecimal.valueOf(d.path("igvInsumo").asDouble(0)));
                    detalle.setTotal(BigDecimal.valueOf(d.path("total").asDouble(0)));
                    detalle.setPesoTotal(BigDecimal.valueOf(d.path("pesoTotal").asDouble(0)));

                    List<Lote> lotes = new ArrayList<>();
                    if (d.has("lotes") && d.get("lotes").isArray()) {
                        for (var l : d.get("lotes")) {
                            Lote lote = new Lote();
                            lote.setIdArticulo(idArticulo);
                            lote.setNumeroLote(l.path("numeroLote").asText("").trim());
                            lote.setFechaVencimiento(parseDate(l, "fechaVencimiento"));
                            lote.setCantidadLote(BigDecimal.valueOf(l.path("cantidadLote").asDouble(0)));
                            lotes.add(lote);
                        }
                    }
                    detalle.setLotes(lotes);

                    detalles.add(detalle);

                    if (d.has("descuentos")) {
                        for (var desc : d.get("descuentos")) {
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
                    Descuento descuento = new Descuento();
                    descuento.setNivel("global");
                    descuento.setMotivo(desc.path("motivo").asText("Descuento Global").trim());
                    descuento.setTipoValor(desc.path("tipoValor").asText("monto").trim());
                    descuento.setValor(BigDecimal.valueOf(desc.path("valor").asDouble(0)));
                    descuento.setTasaIgv(BigDecimal.valueOf(desc.path("tasaIgv").asDouble(0.18)));
                    descuentos.add(descuento);
                }
            }

            int tempIdCaja = 1;
            if (root.has("cajasCompra")) {
                for (var c : root.get("cajasCompra")) {
                    Caja caja = new Caja();
                    caja.setIdCajaCompra(tempIdCaja);

                    String nombreCajaRaw = c.path("nombreCaja").asText("").trim();
                    caja.setNombreCaja(nombreCajaRaw.isEmpty() ? "CAJA " + tempIdCaja : nombreCajaRaw);
                    caja.setCantidad(0);
                    caja.setCostoCaja(BigDecimal.valueOf(c.path("costoCaja").asDouble(0)));

                    List<DetalleCaja> listaDetalles = new ArrayList<>();
                    int cantidadTotalCaja = 0;

                    if (c.has("detalles")) {
                        for (var dc : c.get("detalles")) {
                            DetalleCaja detCaja = new DetalleCaja();
                            detCaja.setIdCajaCompra(tempIdCaja);
                            detCaja.setIdArticulo(dc.path("idArticulo").asInt(0));

                            int cantidadDetalle = dc.path("cantidad").asInt(0);
                            detCaja.setCantidad(BigDecimal.valueOf(cantidadDetalle));

                            cantidadTotalCaja += cantidadDetalle;
                            listaDetalles.add(detCaja);
                        }
                    }

                    caja.setCantidad(cantidadTotalCaja);
                    cajasCompra.add(caja);
                    detallesCajaMap.put(tempIdCaja, listaDetalles);
                    tempIdCaja++;
                }
            }

            int idCompra = compraController.registrarCompra(
                    compra, guia, docRef, detalles, descuentos, cajasCompra, detallesCajaMap, regla
            );

            String tipoComprobante = root.path("tipoComprobanteId").asText();
            String serie = compra.getSerie();
            String correlativo = compra.getCorrelativo();
            String descripcion = String.format("Registro de nueva COMPRA exitoso. ID: %d. Comprobante: %s-%s (TipoID: %s). ProveedorID: %d. Total: %.2f",
                    idCompra, serie, correlativo, tipoComprobante, compra.getIdProveedor(), compra.getTotal().doubleValue());
            Auditoria.registrar(request, "CREACION", descripcion);

            response.getWriter().write(gson.toJson(Map.of("success", true, "idCompra", idCompra, "message", "Compra registrada con ID: " + idCompra)));

        } catch (IllegalArgumentException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(gson.toJson(Map.of("success", false, "message", e.getMessage())));
        } catch (SQLIntegrityConstraintViolationException e) {
            response.setStatus(HttpServletResponse.SC_CONFLICT);
            response.getWriter().write(gson.toJson(Map.of("success", false, "message", "Error de Integridad SQL: Verifique que no exista un comprobante duplicado (Serie/Correlativo) o que una clave foránea no esté fallando.")));
        }
        catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);

            String errorMessage = "Error de Base de Datos: " + e.getMessage();
            Throwable cause = e.getCause();
            if (cause != null) {
                errorMessage += " [Causa Raíz: " + cause.getMessage() + "]";
            }

            StringWriter sw = new StringWriter();
            PrintWriter pw = new PrintWriter(sw);
            e.printStackTrace(pw);
            String stackTrace = sw.toString();

            response.getWriter().write(gson.toJson(Map.of(
                    "success", false,
                    "message", errorMessage,
                    "details", "StackTrace: " + stackTrace
            )));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(gson.toJson(Map.of("success", false, "message", "Error Inesperado: " + e.getMessage())));
        }
    }
}