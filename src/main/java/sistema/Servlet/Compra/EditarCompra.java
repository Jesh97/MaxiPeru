package sistema.Servlet.Compra;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
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
import java.sql.SQLIntegrityConstraintViolationException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/editarCompra")
public class EditarCompra extends HttpServlet {

    private final CompraController compraController = new CompraController();
    private final ObjectMapper mapper = new ObjectMapper();
    private final Gson gson = new Gson();

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
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json;charset=UTF-8");

        Compra compra = new Compra();
        GuiaTransporte guia = null;
        List<DetalleCompra> detallesEditados = new ArrayList<>();
        Map<Integer, Lote> lotesEditados = new HashMap<>();

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

            int idCompra = root.path("idCompra").asInt(0);
            if (idCompra <= 0) {
                throw new IllegalArgumentException("El ID de la Compra a editar es inválido.");
            }
            compra.setIdCompra(idCompra);

            int proveedorId = root.path("proveedorId").asInt(0);
            if (proveedorId <= 0) {
                throw new IllegalArgumentException("El ID de Proveedor es inválido.");
            }
            compra.setIdProveedor(proveedorId);
            compra.setIdMoneda(root.path("monedaId").asInt(0));
            compra.setIdTipoComprobante(root.path("tipoComprobanteId").asInt());
            compra.setSerie(root.path("serie").asText("").trim());
            compra.setCorrelativo(root.path("correlativo").asText("").trim());
            compra.setFechaEmision(parseDate(root, "fechaEmision"));
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

            if (hayTraslado && root.has("guiaTransporte") && root.get("guiaTransporte").isObject()) {
                guia = new GuiaTransporte();
                var gt = root.get("guiaTransporte");

                String rucOrRazonSocial = gt.path("rucGuia").asText("").trim();

                guia.setRucGuia(rucOrRazonSocial);
                guia.setRazonSocialGuia(gt.path("razonSocialGuia").asText(rucOrRazonSocial).trim());

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
                for (var d : root.get("detalles")) {
                    int idDetalle = d.path("idDetalle").asInt(0);
                    if (idDetalle <= 0) continue;

                    DetalleCompra detalle = new DetalleCompra();
                    detalle.setIdDetalle(idDetalle);
                    detalle.setIdCompra(idCompra);

                    detalle.setCantidad(BigDecimal.valueOf(d.path("cantidad").asDouble(0)));
                    detalle.setPrecioUnitario(BigDecimal.valueOf(d.path("precioUnitario").asDouble(0)));
                    detalle.setBonificacion(BigDecimal.valueOf(d.path("bonificacion").asDouble(0)));
                    detalle.setCosteUnitarioTransporte(BigDecimal.valueOf(d.path("costeUnitarioTransporte").asDouble(0)));
                    detalle.setCosteTotalTransporte(BigDecimal.valueOf(d.path("costeTotalTransporte").asDouble(0)));
                    detalle.setPrecioConDescuento(BigDecimal.valueOf(d.path("precioConDescuento").asDouble(0)));
                    detalle.setIgvInsumo(BigDecimal.valueOf(d.path("igvInsumo").asDouble(0)));
                    detalle.setTotal(BigDecimal.valueOf(d.path("total").asDouble(0)));
                    detalle.setPesoTotal(BigDecimal.valueOf(d.path("pesoTotal").asDouble(0)));

                    detallesEditados.add(detalle);

                    if (d.has("loteEditado") && d.get("loteEditado").isObject()) {
                        var l = d.get("loteEditado");
                        Lote lote = new Lote();
                        lote.setCodigoLote(l.path("numeroLote").asText("").trim());
                        lote.setFechaVencimiento(parseDate(l, "fechaVencimiento"));
                        lotesEditados.put(idDetalle, lote);
                    }
                }
            }

            boolean success = compraController.editarCompra(compra, guia, detallesEditados, lotesEditados);

            if (success) {

                String descripcion = String.format("Edición de COMPRA exitosa. ID: %d",
                        idCompra, compra.getSerie(), compra.getCorrelativo(), compra.getIdProveedor(), compra.getTotal().doubleValue());
                Auditoria.registrar(request, "ACTUALIZACION", descripcion);

                response.getWriter().write(gson.toJson(Map.of("success", true, "idCompra", idCompra, "message", "Compra ID " + idCompra + " editada exitosamente.")));
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write(gson.toJson(Map.of("success", false, "message", "La edición de la compra falló por una razón desconocida.")));
            }

        } catch (IllegalArgumentException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(gson.toJson(Map.of("success", false, "message", e.getMessage())));
        } catch (SQLIntegrityConstraintViolationException e) {
            response.setStatus(HttpServletResponse.SC_CONFLICT);
            response.getWriter().write(gson.toJson(Map.of("success", false, "message", "Error de Integridad SQL: Verifique RUC/Correlativo.")));
        }
        catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(gson.toJson(Map.of("success", false, "message", "Error de Base de Datos: " + e.getMessage())));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(gson.toJson(Map.of("success", false, "message", "Error Inesperado: " + e.getMessage())));
        }
    }
}