package sistema.Controller.Venta;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class VentaController {

    public int registrarVenta(Connection con, int idCliente, int idTipoComprobante, int idMoneda, String fechaEmision,
                              String fechaVencimiento, int idTipoPago, String estadoVenta, String tipoDescuento,
                              boolean aplicaIgv, String observaciones, double subtotal, double igv,
                              double descuentoTotal, double totalFinal, double totalPeso, boolean hayTraslado,
                              String serie, String correlativo)
            throws SQLException {
        CallableStatement cs = null;
        int idVenta = 0;
        try {
            cs = con.prepareCall("{CALL sp_registrar_venta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}");
            cs.setInt(1, idCliente);
            cs.setInt(2, idTipoComprobante);
            cs.setInt(3, idMoneda);
            cs.setString(4, fechaEmision);
            cs.setString(5, fechaVencimiento);
            cs.setInt(6, idTipoPago);
            cs.setString(7, estadoVenta);
            cs.setString(8, tipoDescuento);
            cs.setBoolean(9, aplicaIgv);
            cs.setString(10, observaciones);
            cs.setDouble(11, subtotal);
            cs.setDouble(12, igv);
            cs.setDouble(13, descuentoTotal);
            cs.setDouble(14, totalFinal);
            cs.setDouble(15, totalPeso);
            cs.setBoolean(16, hayTraslado);
            cs.setString(17, serie);
            cs.setString(18, correlativo);
            cs.registerOutParameter(19, Types.INTEGER);
            cs.execute();
            idVenta = cs.getInt(19);
        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
        return idVenta;
    }

    public int agregarDetalleVenta(Connection con, int idVenta, int idArticulo, String descripcion, double cantidad, double pesoUnitario, double precioUnitario, double descuentoMonto, double subtotal, double total) throws SQLException {
        CallableStatement cs = null;
        int idDetalleVenta = 0;
        try {
            cs = con.prepareCall("{CALL sp_agregar_detalle_venta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}");
            cs.setInt(1, idVenta);
            cs.setInt(2, idArticulo);
            cs.setString(3, descripcion);
            cs.setDouble(4, cantidad);
            cs.setDouble(5, pesoUnitario);
            cs.setDouble(6, precioUnitario);
            cs.setDouble(7, descuentoMonto);
            cs.setDouble(8, subtotal);
            cs.setDouble(9, total);
            cs.registerOutParameter(10, Types.INTEGER);
            cs.execute();
            idDetalleVenta = cs.getInt(10);
        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
        return idDetalleVenta;
    }

    public void agregarDescuentoGlobalVenta(Connection con, int idVenta, String motivo, String tipoValor, double valor) throws SQLException {
        CallableStatement cs = null;
        try {
            cs = con.prepareCall("{CALL sp_agregar_descuento_global_venta(?, ?, ?, ?, ?)}");
            cs.setInt(1, idVenta);
            cs.setString(2, motivo);
            cs.setString(3, tipoValor);
            cs.setDouble(4, valor);
            cs.setNull(5, Types.DECIMAL);
            cs.execute();
        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
    }

    public void agregarDescuentoItemVenta(Connection con, int idDetalleVenta, String motivo, String tipoValor, double valor) throws SQLException {
        CallableStatement cs = null;
        try {
            cs = con.prepareCall("{CALL sp_agregar_descuento_item_venta(?, ?, ?, ?, ?)}");
            cs.setInt(1, idDetalleVenta);
            cs.setString(2, motivo);
            cs.setString(3, tipoValor);
            cs.setDouble(4, valor);
            cs.setNull(5, Types.DECIMAL);
            cs.execute();
        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
    }

    public void registrarGuiaTransporteVenta(Connection con, int idVenta, String modalidadTransporte, double peso, String rucEmpresa, String razonSocialEmpresa, String marcaVehiculo, String dniConductor, String nombreConductor, String puntoPartida, String puntoLlegada, String fechaTraslado, String observaciones, String conformidadNombre, String conformidadDni) throws SQLException {
        CallableStatement cs = null;
        try {
            cs = con.prepareCall("{CALL sp_registrar_guia_transporte_venta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}");
            cs.setInt(1, idVenta);
            cs.setString(2, modalidadTransporte);
            cs.setDouble(3, peso);
            cs.setString(4, rucEmpresa);
            cs.setString(5, razonSocialEmpresa);
            cs.setString(6, marcaVehiculo);
            cs.setString(7, dniConductor);
            cs.setString(8, nombreConductor);
            cs.setString(9, puntoPartida);
            cs.setString(10, puntoLlegada);
            cs.setString(11, fechaTraslado);
            cs.setString(12, observaciones);
            cs.setString(13, conformidadNombre);
            cs.setString(14, conformidadDni);
            cs.execute();
        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
    }

    public void registrarConformidadTienda(Connection con, int idVenta, String nombre, String dni) throws SQLException {
        CallableStatement cs = null;
        try {
            cs = con.prepareCall("{CALL sp_registrar_conformidad_tienda(?, ?, ?)}");
            cs.setInt(1, idVenta);
            cs.setString(2, nombre);
            cs.setString(3, dni);
            cs.execute();
        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
    }

    public List<Map<String, Object>> buscarClientes(Connection con, String query) throws SQLException {
        CallableStatement cs = null;
        ResultSet rs = null;
        List<Map<String, Object>> clientes = new ArrayList<>();
        try {
            cs = con.prepareCall("{CALL sp_buscar_cliente(?)}");
            cs.setString(1, "%" + query + "%");
            rs = cs.executeQuery();

            while (rs.next()) {
                Map<String, Object> cliente = new HashMap<>();
                cliente.put("id", rs.getInt("id"));
                cliente.put("n_Documento", rs.getString("n_documento"));
                cliente.put("razonSocial", rs.getString("razonSocial"));
                clientes.add(cliente);
            }
        } catch (SQLException e) {
            throw e;
        } finally {
            if (rs != null) rs.close();
            if (cs != null) cs.close();
        }
        return clientes;
    }

    public List<Map<String, Object>> buscarArticulos(Connection con, String query) throws SQLException {
        CallableStatement cs = null;
        ResultSet rs = null;
        List<Map<String, Object>> articulos = new ArrayList<>();
        try {
            cs = con.prepareCall("{CALL sp_buscar_articulos_para_venta(?)}");
            cs.setString(1, "%" + query + "%");
            rs = cs.executeQuery();

            while (rs.next()) {
                Map<String, Object> articulo = new HashMap<>();
                articulo.put("id", rs.getInt("id"));
                articulo.put("codigo", rs.getString("codigo"));
                articulo.put("descripcion", rs.getString("descripcion"));
                articulo.put("precioUnitario", rs.getDouble("precio_venta"));
                articulo.put("pesoUnitario", rs.getDouble("peso_unitario"));
                articulo.put("cantidad", rs.getDouble("cantidad"));
                articulos.add(articulo);
            }
        } catch (SQLException e) {
            throw e;
        } finally {
            if (rs != null) rs.close();
            if (cs != null) cs.close();
        }
        return articulos;
    }

    public List<Map<String, Object>> buscarLotesDisponibles(Connection con, int idArticulo) throws SQLException {
        CallableStatement cs = null;
        ResultSet rs = null;
        List<Map<String, Object>> lotes = new ArrayList<>();

        try {
            cs = con.prepareCall("{CALL SP_VerLotesPorArticulo(?)}");
            cs.setInt(1, idArticulo);

            rs = cs.executeQuery();

            while (rs.next()) {
                Map<String, Object> lote = new HashMap<>();
                lote.put("lote", rs.getString("Codigo_Lote"));
                lote.put("cantidadDisponible", rs.getDouble("Cantidad_Disponible"));
                lote.put("vencimiento", rs.getString("Fecha_Vencimiento"));
                lotes.add(lote);
            }
        } catch (SQLException e) {
            throw e;
        } finally {
            if (rs != null) rs.close();
            if (cs != null) cs.close();
        }
        return lotes;
    }

    public void registrarConsumoLoteVenta(Connection con, int idDetalleVenta, int idArticulo, double cantidadAConsumir) throws SQLException {
        CallableStatement cs = null;
        try {
            cs = con.prepareCall("{CALL sp_gestionar_consumo_stock_venta(?, ?, ?)}");
            cs.setInt(1, idDetalleVenta);
            cs.setInt(2, idArticulo);
            cs.setDouble(3, cantidadAConsumir);
            cs.execute();
        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
    }
}