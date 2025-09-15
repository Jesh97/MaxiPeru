package sistema.Servlet.Compra;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sistema.Controller.CompraController;
import sistema.Modelo.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/CompraServlet")
public class CompraServlet extends HttpServlet {

    private final CompraController compraController = new CompraController();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/plain;charset=UTF-8");
        ObjectMapper mapper = new ObjectMapper();
        StringBuilder jsonBuffer = new StringBuilder();

        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                jsonBuffer.append(line);
            }
        }

        try {
            JsonNode root = mapper.readTree(jsonBuffer.toString());

            // ---------- 1. Parsear Compra ----------
            Compra compra = new Compra();
            compra.setIdProveedor(root.path("idProveedor").asInt());
            compra.setTipoComprobante(root.path("tipo_comprobante").asText("").trim());
            compra.setSerie(root.path("serie").asText("").trim());
            compra.setCorrelativo(root.path("correlativo").asText("").trim());

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

            // ---------- 2. Parsear DocumentoReferencia ----------
            DocumentoReferencia docRef = null;
            if (root.has("referencia")) {
                docRef = new DocumentoReferencia();
                JsonNode dr = root.get("referencia");
                docRef.setNumeroCotizacion(dr.path("numeroCotizacion").asText("").trim());
                docRef.setNumeroPedido(dr.path("numeroPedido").asText("").trim());
            }

            // ---------- 3. Parsear GuiaTransporte ----------
            GuiaTransporte guia = null;
            if (root.has("guia")) {
                guia = new GuiaTransporte();
                JsonNode gt = root.get("guia");
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
            }

            // ---------- 4. Parsear Detalles ----------
            List<DetalleCompra> detalles = new ArrayList<>();
            if (root.has("detalles")) {
                int tempId = 1; // ID temporal para vincular con descuentos
                for (JsonNode d : root.get("detalles")) {
                    if (!d.has("idProducto") || d.path("idProducto").asInt() == 0) continue; // FIX: Omitir productos sin ID válido
                    DetalleCompra detalle = new DetalleCompra();
                    detalle.setIdDetalle(tempId++); // Asignar un ID temporal
                    detalle.setIdProducto(d.path("idProducto").asInt());
                    detalle.setCantidad(d.path("cantidad").asDouble(0));
                    detalle.setPrecioUnitario(d.path("precioUnitario").asDouble(0));

                    // Usar los valores calculados que ya vienen en el JSON
                    detalle.setCosteUnitarioTransporte(d.path("costeUnitarioTransporte").asDouble(0));
                    detalle.setCosteTotalTransporte(d.path("costeTotalTransporte").asDouble(0));
                    detalle.setPrecioConDescuento(d.path("precioConDescuento").asDouble(0));
                    detalle.setIgvProducto(d.path("igvProducto").asDouble(0));
                    detalle.setTotal(d.path("total").asDouble(0));
                    detalle.setPesoTotal(d.path("pesoTotal").asDouble(0));

                    detalles.add(detalle);
                }
            }

            // ---------- 5. Parsear Descuentos (unificados) ----------
            List<Descuento> descuentos = new ArrayList<>();
            if (root.has("descuentosGlobales")) {
                for (JsonNode desc : root.get("descuentosGlobales")) {
                    Descuento descuento = new Descuento();
                    descuento.setNivel("global");
                    descuento.setTipo(desc.path("tipo").asText("").trim());
                    descuento.setValor(desc.path("valor").asDouble(0));
                    descuentos.add(descuento);
                }
            }

            // Parsear descuentos por ítem
            if (root.has("detalles")) {
                int tempId = 1;
                for (JsonNode d : root.get("detalles")) {
                    if (!d.has("idProducto") || d.path("idProducto").asInt() == 0) continue;
                    if (d.has("descuentos")) {
                        for (JsonNode desc : d.get("descuentos")) {
                            Descuento descuento = new Descuento();
                            descuento.setNivel("item");
                            descuento.setTipo(desc.path("tipo").asText("").trim());
                            descuento.setValor(desc.path("valor").asDouble(0));
                            descuento.setIdDetalle(tempId); // Asignar el ID temporal
                            descuentos.add(descuento);
                        }
                    }
                    tempId++;
                }
            }

            // ---------- 6. Registrar Compra con todo ----------
            int idCompra = compraController.registrarCompra(compra, guia, docRef, detalles, descuentos);

            response.getWriter().write("Compra registrada con éxito. ID: " + idCompra);

        } catch (SQLException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error SQL: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Error procesando JSON: " + e.getMessage());
        }
    }
}