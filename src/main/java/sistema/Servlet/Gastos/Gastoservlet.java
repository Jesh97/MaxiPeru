package sistema.Servlet.Gastos;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sistema.Controller.Gasto.Gastocontroller;
import sistema.Modelo.Gasto.DetalleGasto;
import sistema.Modelo.Gasto.Gasto;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@WebServlet("/GastoServlet")
public class Gastoservlet extends HttpServlet {

    private final Gastocontroller gastoController = new Gastocontroller();
    private final ObjectMapper mapper = new ObjectMapper();
    private final Gson gson = new Gson();

    private String readJsonBody(HttpServletRequest request) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) sb.append(line);
        }
        return sb.toString();
    }

    private LocalDate parseDate(JsonNode node, String field) {
        if (node.hasNonNull(field)) {
            String s = node.get(field).asText("").trim();
            if (!s.isEmpty()) {
                try { return LocalDate.parse(s); } catch (Exception ignored) {}
            }
        }
        return LocalDate.now();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        String jsonBody;
        try {
            jsonBody = readJsonBody(request);
        } catch (IOException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print(gson.toJson(Map.of("success", false, "message", "Error al leer datos: " + e.getMessage())));
            return;
        }

        try {
            JsonNode root = mapper.readTree(jsonBody);

            // ── Validaciones ─────────────────────────────────────────────────
            String proveedorTexto = root.path("proveedor").asText("").trim();
            if (proveedorTexto.isEmpty()) {
                throw new IllegalArgumentException("Ingrese un proveedor (RUC o razon social).");
            }

            int idProveedor = gastoController.buscarOCrearProveedorPorTexto(proveedorTexto);
            if (idProveedor <= 0) {
                throw new IllegalArgumentException("Proveedor no valido. Ingrese un RUC numerico o un proveedor existente.");
            }

            String tipoGastoNombre = root.path("categoria_gasto").asText("").trim();
            if (tipoGastoNombre.isEmpty()) {
                throw new IllegalArgumentException("Seleccione un tipo de gasto.");
            }
            int idTipoGasto = gastoController.buscarOCrearTipoGastoPorNombre(tipoGastoNombre);
            if (idTipoGasto <= 0) {
                throw new IllegalArgumentException("El tipo de gasto no existe en la base de datos.");
            }

            String tipoComprobanteNombre = root.path("tipo_comprobante").asText("").trim();
            if (tipoComprobanteNombre.isEmpty()) {
                throw new IllegalArgumentException("Seleccione un tipo de comprobante.");
            }
            int idTipoComprobante = gastoController.buscarOCrearTipoComprobantePorNombre(tipoComprobanteNombre);
            if (idTipoComprobante <= 0) {
                throw new IllegalArgumentException("El tipo de comprobante no existe en la base de datos.");
            }

            String serie = root.path("serie_comprobante").asText("").trim();
            String correlativo = root.path("correlativo_comprobante").asText("").trim();
            String motivo = root.path("motivo").asText("").trim();
            String placa = root.path("placa").asText("").trim();

            if (serie.isEmpty()) {
                throw new IllegalArgumentException("La serie del comprobante es obligatoria.");
            }
            if (correlativo.isEmpty()) {
                throw new IllegalArgumentException("El correlativo del comprobante es obligatorio.");
            }
            if (motivo.isEmpty()) {
                throw new IllegalArgumentException("Seleccione el motivo del gasto.");
            }

            if (!root.has("items") || !root.get("items").isArray() || root.get("items").size() == 0) {
                throw new IllegalArgumentException("Debe agregar al menos un ítem al detalle del gasto.");
            }

            // ── Armar Gasto ───────────────────────────────────────────────────
            Gasto gasto = new Gasto();
            gasto.setIdProveedor(idProveedor);
            gasto.setIdTipoGasto(idTipoGasto);
            gasto.setIdTipoComprobante(idTipoComprobante);
            gasto.setSerieComprobante(serie);
            gasto.setCorrelativoComprobante(correlativo);
            gasto.setMotivo(motivo);
            gasto.setPlaca(placa);
            int idMonedaValida = gastoController.resolverMonedaIdValida(root.path("id_moneda").asInt(1));
            gasto.setIdMoneda(idMonedaValida);
            gasto.setFecha(parseDate(root, "fecha"));
            gasto.setSubtotal(root.path("subtotal").asDouble(0));
            gasto.setIgv(root.path("igv").asDouble(0));
            gasto.setTotal(root.path("total").asDouble(0));
            gasto.setObservacion(root.path("observacion").asText("").trim());
            gasto.setTotalPeso(root.path("total_peso").asDouble(0));

            // ── Armar Detalles ────────────────────────────────────────────────
            List<DetalleGasto> detalles = new ArrayList<>();
            for (JsonNode item : root.get("items")) {
                String desc     = item.path("descripcion").asText("").trim();
                String unidad   = item.path("unidad").asText("").trim();
                double cantidad = item.path("cantidad").asDouble(0);
                double peso     = item.path("peso_unitario").asDouble(0);
                double precio   = item.path("precio_unitario").asDouble(0);

                if (desc.isEmpty() || unidad.isEmpty() || cantidad <= 0 || precio <= 0) {
                    throw new IllegalArgumentException(
                        "Cada ítem debe tener descripcion, unidad, cantidad y precio validos.");
                }

                int idUnidad = gastoController.buscarUnidadIdPorAbreviatura(unidad);
                if (idUnidad <= 0) {
                    throw new IllegalArgumentException("Unidad no reconocida: " + unidad);
                }

                double subtotal = Math.round(cantidad * precio * 100.0) / 100.0;
                double igv      = Math.round(subtotal * 0.18 * 100.0) / 100.0;
                double total    = Math.round((subtotal + igv) * 100.0) / 100.0;

                DetalleGasto d = new DetalleGasto();
                d.setDescripcion(desc);
                d.setCantidad(cantidad);
                d.setIdUnidad(idUnidad);
                d.setPesoUnitario(peso);
                d.setPrecioUnitario(precio);
                d.setSubtotal(subtotal);
                d.setIgv(igv);
                d.setTotal(total);
                detalles.add(d);
            }

            // ── Guardar ───────────────────────────────────────────────────────
            int idGasto = gastoController.registrarGasto(gasto, detalles);

            out.print(gson.toJson(Map.of(
                "success", true,
                "idGasto", idGasto,
                "message", "Gasto registrado correctamente con ID: " + idGasto
            )));

        } catch (IllegalArgumentException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print(gson.toJson(Map.of("success", false, "message", e.getMessage())));
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(Map.of("success", false,
                "message", "Error de base de datos: " + e.getMessage())));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(Map.of("success", false,
                "message", "Error inesperado: " + e.getMessage())));
        }

        out.flush();
    }
}