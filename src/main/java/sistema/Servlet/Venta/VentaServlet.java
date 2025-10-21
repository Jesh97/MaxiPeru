package sistema.Servlet.Venta;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.google.gson.JsonSyntaxException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sistema.Controller.Venta.VentaController;
import sistema.Ejecucion.Conexion;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Type;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@WebServlet("/VentaServlet")
public class VentaServlet extends HttpServlet {

    private final VentaController ventaController = new VentaController();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        String action = request.getParameter("action");
        Connection con = null;

        try {
            con = Conexion.obtenerConexion();

            if ("buscarArticulos".equals(action)) {
                String query = request.getParameter("query");
                if (query == null || query.trim().isEmpty()) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.print(gson.toJson(Map.of("error","Parámetro 'query' es requerido para la búsqueda de artículos.")));
                    return;
                }
                List<Map<String, Object>> articulos = ventaController.buscarArticulos(con, query);
                out.print(gson.toJson(articulos));
            } else if ("buscarCliente".equals(action)) {
                String query = request.getParameter("query");
                if (query == null || query.trim().isEmpty()) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.print(gson.toJson(Map.of("error","Parámetro 'query' es requerido para la búsqueda de clientes.")));
                    return;
                }
                List<Map<String, Object>> clientes = ventaController.buscarClientes(con, query);
                out.print(gson.toJson(clientes));
            } else if ("buscarLotes".equals(action)) {
                String idArticuloStr = request.getParameter("idArticulo");
                if (idArticuloStr == null || idArticuloStr.trim().isEmpty()) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.print(gson.toJson(Map.of("error", "Parámetro 'idArticulo' es requerido para la búsqueda de lotes.")));
                    return;
                }
                int idArticulo = Integer.parseInt(idArticuloStr);
                List<Map<String, Object>> lotes = ventaController.buscarLotesDisponibles(con, idArticulo);
                out.print(gson.toJson(lotes));
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print(gson.toJson(Map.of("error", "Acción no válida.")));
            }

        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print(gson.toJson(Map.of("error", "ID de Artículo inválido.")));
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(Map.of("error", "Error de base de datos: " + e.getMessage())));
        } finally {
            Conexion.cerrarConexion(con);
            out.flush();
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        Connection con = null;
        int idVenta = 0;

        try (BufferedReader reader = request.getReader()) {
            Type mapType = new TypeToken<Map<String, Object>>() {}.getType();
            Map<String, Object> ventaData = gson.fromJson(reader, mapType);

            con = Conexion.obtenerConexion();
            con.setAutoCommit(false);

            int idCliente = ((Double) ventaData.getOrDefault("idCliente", 0.0)).intValue();
            int idTipoComprobante = ((Double) ventaData.getOrDefault("idTipoComprobante", 0.0)).intValue();
            int idMoneda = ((Double) ventaData.getOrDefault("idMoneda", 0.0)).intValue();
            String fechaEmision = (String) ventaData.getOrDefault("fechaEmision", "");

            String fechaVencimiento = (String) ventaData.getOrDefault("fechaVencimiento", null);
            if (fechaVencimiento != null && fechaVencimiento.isEmpty()) {
                fechaVencimiento = null;
            }

            int idTipoPago = ((Double) ventaData.getOrDefault("idTipoPago", 0.0)).intValue();
            String estadoVenta = (String) ventaData.getOrDefault("estadoVenta", "Pendiente");
            String tipoDescuento = (String) ventaData.getOrDefault("tipoDescuento", "global");
            boolean aplicaIgv = (Boolean) ventaData.getOrDefault("aplicaIgv", false);
            String observaciones = (String) ventaData.getOrDefault("observaciones", "");
            double subtotal = (Double) ventaData.getOrDefault("subtotal", 0.0);
            double igv = (Double) ventaData.getOrDefault("igv", 0.0);
            double descuentoTotal = (Double) ventaData.getOrDefault("descuentoTotal", 0.0);
            double totalFinal = (Double) ventaData.getOrDefault("totalFinal", 0.0);
            double totalPeso = (Double) ventaData.getOrDefault("totalPeso", 0.0);
            boolean hayTraslado = (Boolean) ventaData.getOrDefault("hayTraslado", false);
            String serie = (String) ventaData.getOrDefault("serie", "");
            String correlativo = (String) ventaData.getOrDefault("correlativo", "");

            Double tasaIgvDescGlobal = (Double) ventaData.getOrDefault("tasaIgvDescGlobal", null);
            Double tasaIgvDescItem = (Double) ventaData.getOrDefault("tasaIgvDescItem", null);

            idVenta = ventaController.registrarVenta(con, idCliente, idTipoComprobante, serie, correlativo, idMoneda, fechaEmision, fechaVencimiento, idTipoPago, estadoVenta, tipoDescuento, aplicaIgv, observaciones, subtotal, igv, descuentoTotal, totalFinal, totalPeso, hayTraslado);

            if (idVenta == 0) throw new SQLException("Fallo al obtener ID de Venta.");

            if ("global".equals(tipoDescuento) && ventaData.containsKey("descuentoGlobal")) {
                Map<String, Object> descGlobal = (Map<String, Object>) ventaData.get("descuentoGlobal");
                String motivo = (String) descGlobal.getOrDefault("motivo", "Descuento General");
                String tipoValor = (String) descGlobal.getOrDefault("tipoValor", "monto");
                double valor = (Double) descGlobal.getOrDefault("valor", 0.0);

                String tipoValorSP = tipoValor.equals("monto") ? "soles" : "porcentaje";
                ventaController.agregarDescuentoGlobalVenta(con, idVenta, motivo, tipoValorSP, valor, tasaIgvDescGlobal);
            }

            Type detalleListType = new TypeToken<List<Map<String, Object>>>(){}.getType();
            List<Map<String, Object>> detalles = gson.fromJson(gson.toJson(ventaData.get("detalles")), detalleListType);

            for (Map<String, Object> detalle : detalles) {
                int idArticulo = ((Double) detalle.getOrDefault("idArticulo", 0.0)).intValue();
                int idUnidad = ((Double) detalle.getOrDefault("idUnidad", 0.0)).intValue();
                double cantidad = (Double) detalle.getOrDefault("cantidad", 0.0);
                double pesoUnitario = (Double) detalle.getOrDefault("pesoUnitario", 0.0);
                double precioUnitario = (Double) detalle.getOrDefault("precioUnitario", 0.0);
                double descuentoMonto = (Double) detalle.getOrDefault("descuentoMonto", 0.0);
                double subtotalDetalle = (Double) detalle.getOrDefault("subtotal", 0.0);
                double totalDetalle = (Double) detalle.getOrDefault("total", 0.0);
                String descripcion = (String) detalle.getOrDefault("descripcion", "");

                int idDetalleVenta = ventaController.agregarDetalleVenta(con, idVenta, idArticulo, idUnidad, descripcion, cantidad, pesoUnitario, precioUnitario, descuentoMonto, subtotalDetalle, totalDetalle);

                if (idDetalleVenta == 0) throw new SQLException("Fallo al obtener ID de Detalle Venta.");

                double cantidadConsumir = (Double) detalle.getOrDefault("cantidad", 0.0);
                ventaController.gestionarConsumoStockVenta(con, idDetalleVenta, idArticulo, cantidadConsumir);

                if ("porItem".equals(tipoDescuento) && detalle.containsKey("detalleDescuento")) {
                    Map<String, Object> descItem = (Map<String, Object>) detalle.get("detalleDescuento");
                    String motivo = (String) descItem.getOrDefault("motivo", "Descuento por ítem");
                    String tipoValor = (String) descItem.getOrDefault("tipoValor", "monto");
                    double valor = (Double) descItem.getOrDefault("valor", 0.0);

                    String tipoValorSP = tipoValor.equals("monto") ? "soles" : "porcentaje";
                    ventaController.agregarDescuentoItemVenta(con, idDetalleVenta, motivo, tipoValorSP, valor, tasaIgvDescItem);
                }
            }

            if (hayTraslado && ventaData.containsKey("datosTraslado")) {
                Map<String, Object> datosTraslado = (Map<String, Object>) ventaData.get("datosTraslado");

                String modalidadTransporte = (String) datosTraslado.getOrDefault("modalidadTransporte", "");
                double peso = (Double) datosTraslado.getOrDefault("peso", 0.0);
                String rucEmpresa = (String) datosTraslado.getOrDefault("rucEmpresa", "");
                String razonSocialEmpresa = (String) datosTraslado.getOrDefault("razonSocialEmpresa", "");
                String marcaVehiculo = (String) datosTraslado.getOrDefault("placaVehiculo", "");
                String dniConductor = (String) datosTraslado.getOrDefault("dniConductor", "");
                String nombreConductor = (String) datosTraslado.getOrDefault("nombreConductor", "");
                String puntoPartida = (String) datosTraslado.getOrDefault("puntoPartida", "");
                String puntoLlegada = (String) datosTraslado.getOrDefault("puntoLlegada", "");
                String fechaTrasladoStr = (String) datosTraslado.getOrDefault("fechaTraslado", "");
                String observacionesTraslado = (String) datosTraslado.getOrDefault("observaciones", "");
                String conformidadNombre = (String) datosTraslado.getOrDefault("conformidadNombre", "");
                String conformidadDni = (String) datosTraslado.getOrDefault("conformidadDni", "");

                ventaController.registrarGuiaTransporteVenta(con, idVenta, modalidadTransporte, peso, rucEmpresa, razonSocialEmpresa, marcaVehiculo, dniConductor, nombreConductor, puntoPartida, puntoLlegada, fechaTrasladoStr, observacionesTraslado, conformidadNombre, conformidadDni);

            } else if (!hayTraslado && ventaData.containsKey("conformidadTienda")) {
                Map<String, Object> conformidadTienda = (Map<String, Object>) ventaData.get("conformidadTienda");
                ventaController.registrarConformidadTienda(con, idVenta, (String) conformidadTienda.getOrDefault("nombre", ""), (String) conformidadTienda.getOrDefault("dni", ""));
            }

            con.commit();
            out.print(gson.toJson(Map.of("success", true, "message", "Venta N°" + idVenta + " registrada con éxito.")));

        } catch (JsonSyntaxException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print(gson.toJson(Map.of("success", false, "message", "Error en el formato JSON de la solicitud: " + e.getMessage())));
        } catch (SQLException e) {
            try {
                if (con != null) con.rollback();
            } catch (SQLException ex) {}
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(Map.of("success", false, "message", "Error de base de datos: " + e.getMessage())));
        } catch (Exception e) {
            try {
                if (con != null) con.rollback();
            } catch (SQLException ignored) {}
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(Map.of("success", false, "message", "Error interno del servidor: " + e.getMessage())));
        } finally {
            Conexion.cerrarConexion(con);
            out.flush();
        }
    }
}