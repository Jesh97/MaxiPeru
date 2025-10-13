package sistema.Servlet.Venta;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sistema.Controller.Venta.VentaController;
import sistema.Controller.Producto.ArticuloController;
import sistema.Controller.Venta.ClienteController;
import sistema.Ejecucion.Conexion;
import sistema.Modelo.Cliente.Cliente;
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
    private final ArticuloController articuloController = new ArticuloController();
    private final ClienteController clienteController = new ClienteController();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        String action = request.getParameter("action");

        if ("buscarArticulos".equals(action)) {
            String busqueda = request.getParameter("query");

            if (busqueda == null || busqueda.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print(gson.toJson(Map.of("error","Parámetro 'query' es requerido para la búsqueda de artículos.")));
                out.flush();
                return;
            }

            Connection con = null;
            try {
                con = Conexion.obtenerConexion();
                List<Map<String, Object>> articulos = ventaController.buscarArticulosParaVenta(con, busqueda);
                out.print(gson.toJson(articulos));
            } catch (SQLException e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print(gson.toJson(Map.of("error", "Error de base de datos en la búsqueda de artículos: " + e.getMessage())));
            } finally {
                Conexion.cerrarConexion(con);
            }
        } else if ("buscarCliente".equals(action)) {
            String busqueda = request.getParameter("query");

            if (busqueda == null || busqueda.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print(gson.toJson(Map.of("error","Parámetro 'query' es requerido para la búsqueda de clientes.")));
                out.flush();
                return;
            }

            try {
                List<Cliente> clientes = clienteController.buscar(busqueda);
                out.print(gson.toJson(clientes));
            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print(gson.toJson(Map.of("error", "Error en la búsqueda de clientes: " + e.getMessage())));
            }
        }
        else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print(gson.toJson(Map.of("error", "Acción GET no reconocida.")));
        }
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        Connection con = null;

        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = request.getReader().readLine()) != null) {
            sb.append(line);
        }

        Map<String, Object> ventaData = gson.fromJson(sb.toString(), new TypeToken<Map<String, Object>>(){}.getType());

        try {
            con = Conexion.obtenerConexion();
            con.setAutoCommit(false);

            // Conversiones robustas
            int idCliente = ((Double) ventaData.getOrDefault("idCliente", 0.0)).intValue();
            int idTipoComprobante = ((Double) ventaData.getOrDefault("idTipoComprobante", 0.0)).intValue();
            int idMoneda = ((Double) ventaData.getOrDefault("idMoneda", 0.0)).intValue();
            int idTipoPago = ((Double) ventaData.getOrDefault("idTipoPago", 0.0)).intValue();

            String fechaEmision = (String) ventaData.getOrDefault("fechaEmision", "");
            String fechaVencimiento = (String) ventaData.getOrDefault("fechaVencimiento", "");
            String estadoVenta = (String) ventaData.getOrDefault("estadoVenta", "Emitida");
            String tipoDescuento = (String) ventaData.getOrDefault("tipoDescuento", "global");
            String observaciones = (String) ventaData.getOrDefault("observaciones", "");

            boolean aplicaIgv = (Boolean) ventaData.getOrDefault("aplicaIgv", false);
            double subtotal = (Double) ventaData.getOrDefault("subtotal", 0.0);
            double igv = (Double) ventaData.getOrDefault("igv", 0.0);
            double descuentoTotal = (Double) ventaData.getOrDefault("descuentoTotal", 0.0);
            double totalFinal = (Double) ventaData.getOrDefault("totalFinal", 0.0);
            double totalPeso = (Double) ventaData.getOrDefault("totalPeso", 0.0);
            boolean hayTraslado = (Boolean) ventaData.getOrDefault("hayTraslado", false);

            int idVenta = ventaController.registrarVenta(
                    con, idCliente, idTipoComprobante, idMoneda, fechaEmision, fechaVencimiento,
                    idTipoPago, estadoVenta, tipoDescuento, aplicaIgv, observaciones,
                    subtotal, igv, descuentoTotal, totalFinal, totalPeso, hayTraslado
            );

            if (idVenta <= 0) {
                throw new Exception("No se pudo obtener el ID de Venta. Abortando.");
            }

            if ("global".equals(tipoDescuento)) {
                Map<String, Object> descuentoGlobal = (Map<String, Object>) ventaData.get("descuentoGlobal");
                ventaController.agregarDescuentoGlobalVenta(
                        con, idVenta,
                        (String) descuentoGlobal.getOrDefault("motivo", "Descuento General"),
                        (String) descuentoGlobal.getOrDefault("tipoValor", "soles"),
                        (Double) descuentoGlobal.getOrDefault("valor", 0.0)
                );
            }

            Type detalleListType = new TypeToken<List<Map<String, Object>>>(){}.getType();
            List<Map<String, Object>> detalles = gson.fromJson(gson.toJson(ventaData.get("detalles")), detalleListType);

            for (Map<String, Object> detalle : detalles) {
                int idArticulo = ((Double) detalle.getOrDefault("idArticulo", 0.0)).intValue();
                double cantidad = (Double) detalle.getOrDefault("cantidad", 0.0);
                double descuentoMonto = (Double) detalle.getOrDefault("descuentoMonto", 0.0);
                double pesoUnitario = (Double) detalle.getOrDefault("pesoUnitario", 0.0);
                double precioUnitario = (Double) detalle.getOrDefault("precioUnitario", 0.0);
                double subtotalDetalle = (Double) detalle.getOrDefault("subtotal", 0.0);
                double totalDetalle = (Double) detalle.getOrDefault("total", 0.0);

                int idDetalleVenta = ventaController.agregarDetalleVenta(
                        con, idVenta, idArticulo, (String) detalle.getOrDefault("descripcion", ""), cantidad,
                        pesoUnitario, precioUnitario, descuentoMonto, subtotalDetalle, totalDetalle
                );

                // Lógica de consumo de lotes (Corregido)
                Type loteListType = new TypeToken<List<Map<String, Object>>>(){}.getType();
                List<Map<String, Object>> lotesConsumidos = gson.fromJson(gson.toJson(detalle.get("lotesConsumidos")), loteListType);

                for (Map<String, Object> lote : lotesConsumidos) {
                    double cantidadLote = (Double) lote.getOrDefault("cantidad", 0.0);
                    String numeroLote = (String) lote.getOrDefault("lote", "");
                    String vencimiento = (String) lote.getOrDefault("vencimiento", null);

                    if (cantidadLote > 0) {
                        ventaController.registrarLoteConsumido(
                                con,
                                idDetalleVenta,
                                idArticulo,
                                numeroLote,
                                cantidadLote,
                                vencimiento
                        );
                    }
                }
                // Fin Lógica de lotes

                if ("porItem".equals(tipoDescuento) && descuentoMonto > 0) {
                    Map<String, Object> descItem = (Map<String, Object>) detalle.get("detalleDescuento");
                    ventaController.agregarDescuentoItemVenta(
                            con, idDetalleVenta,
                            (String) descItem.getOrDefault("motivo", "Descuento por ítem"),
                            (String) descItem.getOrDefault("tipoValor", "soles"),
                            (Double) descItem.getOrDefault("valor", 0.0)
                    );
                }
            }

            if (hayTraslado) {
                Map<String, Object> traslado = (Map<String, Object>) ventaData.get("datosTraslado");
                ventaController.registrarGuiaTransporteVenta(
                        con, idVenta,
                        (String) traslado.getOrDefault("modalidadTransporte", ""),
                        (Double) traslado.getOrDefault("peso", 0.0),
                        (String) traslado.getOrDefault("rucEmpresa", ""),
                        (String) traslado.getOrDefault("razonSocialEmpresa", ""),
                        (String) traslado.getOrDefault("marcaVehiculo", ""),
                        (String) traslado.getOrDefault("dniConductor", ""),
                        (String) traslado.getOrDefault("nombreConductor", ""),
                        (String) traslado.getOrDefault("puntoPartida", ""),
                        (String) traslado.getOrDefault("puntoLlegada", ""),
                        (String) traslado.getOrDefault("fechaTraslado", ""),
                        (String) traslado.getOrDefault("observaciones", ""),
                        (String) traslado.getOrDefault("conformidadNombre", ""),
                        (String) traslado.getOrDefault("conformidadDni", "")
                );
            } else {
                Map<String, Object> conformidad = (Map<String, Object>) ventaData.get("conformidadTienda");
                ventaController.registrarConformidadTienda(
                        con, idVenta,
                        (String) conformidad.getOrDefault("nombre", ""),
                        (String) conformidad.getOrDefault("dni", "")
                );
            }

            con.commit();

            response.getWriter().write(gson.toJson(Map.of("success", true, "message", "Venta registrada con éxito. ID: " + idVenta)));

        } catch (SQLException e) {
            if (con != null) {
                try {
                    con.rollback();
                } catch (SQLException ex) { }
            }
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(gson.toJson(Map.of("success", false, "message", "Error de base de datos: " + e.getMessage())));
        } catch (Exception e) {
            if (con != null) {
                try {
                    con.rollback();
                } catch (SQLException ex) { }
            }
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(gson.toJson(Map.of("success", false, "message", "Error Inesperado: " + e.getMessage())));
        } finally {
            if (con != null) {
                try {
                    con.setAutoCommit(true);
                    Conexion.cerrarConexion(con);
                } catch (SQLException e) { }
            }
        }
    }
}