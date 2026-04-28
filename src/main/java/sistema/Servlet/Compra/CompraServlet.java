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

    private static final int MAX_RETRIES = 3;
    private static final long RETRY_DELAY_MS = 300;
    private static final int DEADLOCK_ERROR_CODE = 1213;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        String busqueda = request.getParameter("buscarArticulo");

        if (busqueda != null && !busqueda.trim().isEmpty()) {
            List<Articulo> lista = articuloDAO.buscarArticulosParaCompra(busqueda);
            out.print(gson.toJson(lista));
        } else if (request.getParameter("listarCompras") != null) {
            try {
                List<Map<String, Object>> compras = compraController.listarComprasConDetalles();
                out.print(gson.toJson(compras));
            } catch (SQLException e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print(gson.toJson(Map.of("success", false, "message", "Error al listar compras: " + e.getMessage())));
            }
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print(gson.toJson(Map.of("error","Parámetro 'buscarArticulo' o 'listarCompras' es requerido.")));
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
                throw new IllegalArgumentException("El ID de Moneda es inválido o no se ha seleccionado una moneda.");
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
                    detalle.setIdUnidad(d.path("idUnidad").asInt(0));
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

                            String numeroLote = l.path("numeroLote").asText("").trim();
                            if (numeroLote.isEmpty()) {
                                throw new IllegalArgumentException("El campo Número de Lote no puede estar vacío para el artículo con ID: " + idArticulo + ".");
                            }

                            lote.setCodigoLote(numeroLote);
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

                            double cantidadDetalleDouble = dc.path("cantidad").asDouble(0.0);
                            detCaja.setCantidad(BigDecimal.valueOf(cantidadDetalleDouble));

                            int cantidadDetalleInt = (int) cantidadDetalleDouble;

                            cantidadTotalCaja += cantidadDetalleInt;
                            listaDetalles.add(detCaja);
                        }
                    }

                    caja.setCantidad(cantidadTotalCaja);
                    cajasCompra.add(caja);
                    detallesCajaMap.put(tempIdCaja, listaDetalles);
                    tempIdCaja++;
                }
            }

            int retryCount = 0;
            boolean success = false;
            int idCompra = 0;

            while (retryCount < MAX_RETRIES && !success) {
                try {
                    idCompra = compraController.registrarCompra(
                            compra, guia, docRef, detalles, descuentos, cajasCompra, detallesCajaMap, regla
                    );
                    success = true;
                } catch (SQLException e) {
                    boolean isDeadlock = (e.getErrorCode() == DEADLOCK_ERROR_CODE) ||
                            (e.getMessage() != null && e.getMessage().toLowerCase().contains("deadlock found"));

                    if (isDeadlock && retryCount < MAX_RETRIES - 1) {
                        retryCount++;
                        try {
                            Thread.sleep(RETRY_DELAY_MS);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw e;
                        }
                    } else {
                        throw e;
                    }
                }
            }

            if (success) {
                String tipoComprobante = root.path("tipoComprobanteId").asText();
                String serie = compra.getSerie();
                String correlativo = compra.getCorrelativo();
                String descripcion = String.format("Registro de nueva COMPRA exitoso. ID: %d. Comprobante: %s-%s (TipoID: %s). ProveedorID: %d. Total: %.2f",
                        idCompra, serie, correlativo, tipoComprobante, compra.getIdProveedor(), compra.getTotal().doubleValue());
                Auditoria.registrar(request, "CREACION", descripcion);

                response.getWriter().write(gson.toJson(Map.of("success", true, "idCompra", idCompra, "message", "Compra registrada exitosamente")));
                return;
            }

        } catch (IllegalArgumentException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(gson.toJson(Map.of("success", false, "message", e.getMessage())));
        } catch (SQLIntegrityConstraintViolationException e) {
            response.setStatus(HttpServletResponse.SC_CONFLICT);
            String specificMessage = "Error de Integridad SQL: Verifique que no exista un comprobante duplicado (Serie/Correlativo) o un código de Lote duplicado.";
            if (e.getMessage() != null) {
                if (e.getMessage().toLowerCase().contains("compra_ibfk_5") || e.getMessage().toLowerCase().contains("id_moneda")) {
                    specificMessage = "El ID de Moneda seleccionado no es válido o no existe en la base de datos.";
                } else if (e.getMessage().toLowerCase().contains("duplicate entry")) {
                    specificMessage = "Error de Clave Única: Se intentó registrar un valor duplicado (ej. Número de Lote o Comprobante ya existente).";
                }
            }
            response.getWriter().write(gson.toJson(Map.of("success", false, "message", specificMessage)));
        }
        catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);

            String errorMessage = "Error de Base de Datos: La transacción falló permanentemente tras " + MAX_RETRIES + " intentos. " + e.getMessage();
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