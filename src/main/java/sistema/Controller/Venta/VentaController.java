package sistema.Controller.Venta;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class VentaController {

    public int registrarVenta(Connection con, int idCliente, int idTipoComprobante, int idMoneda, String fechaEmision, String fechaVencimiento,
                              int idTipoPago, String estadoVenta, String tipoDescuento, boolean aplicaIgv, String observaciones,
                              double subtotal, double igv, double descuentoTotal, double totalFinal, double totalPeso,
                              boolean hayTraslado) throws SQLException {

        CallableStatement cs = null;
        int idVenta = -1;

        try {
            cs = con.prepareCall("{CALL sp_registrar_venta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}");

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

            cs.registerOutParameter(17, Types.INTEGER);

            cs.execute();

            idVenta = cs.getInt(17);

        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
        return idVenta;
    }

    public void agregarDescuentoGlobalVenta(Connection con, int idVenta, String motivo, String tipoValor, double valor) throws SQLException {
        CallableStatement cs = null;

        try {
            cs = con.prepareCall("{CALL sp_agregar_descuento_global_venta(?, ?, ?, ?)}");
            cs.setInt(1, idVenta);
            cs.setString(2, motivo);
            cs.setString(3, tipoValor);
            cs.setDouble(4, valor);
            cs.execute();
        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
    }

    public int agregarDetalleVenta(Connection con, int idVenta, int idArticulo, String descripcion, double cantidad, double pesoUnitario,
                                   double precioUnitario, double descuentoMonto, double subtotal, double total) throws SQLException {

        CallableStatement cs = null;
        int idDetalleVenta = -1;

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

    public void agregarDescuentoItemVenta(Connection con, int idDetalleVenta, String motivo, String tipoValor, double valor) throws SQLException {
        CallableStatement cs = null;
        try {
            cs = con.prepareCall("{CALL sp_agregar_descuento_item_venta(?, ?, ?, ?)}");
            cs.setInt(1, idDetalleVenta);
            cs.setString(2, motivo);
            cs.setString(3, tipoValor);
            cs.setDouble(4, valor);
            cs.execute();
        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
    }

    public void registrarLoteConsumido(Connection con, int idDetalleVenta, int idArticulo, String numeroLote, double cantidad, String fechaVencimiento) throws SQLException {
        CallableStatement cs = null;
        try {
            cs = con.prepareCall("{CALL sp_registrar_lote_consumido(?, ?, ?, ?, ?)}");
            cs.setInt(1, idDetalleVenta);
            cs.setInt(2, idArticulo);
            cs.setString(3, numeroLote);
            cs.setDouble(4, cantidad);
            cs.setString(5, fechaVencimiento);
            cs.execute();
        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
    }

    public void registrarGuiaTransporteVenta(Connection con, int idVenta, String modalidadTransporte, double peso,
                                             String rucEmpresa, String razonSocialEmpresa, String marcaVehiculo,
                                             String dniConductor, String nombreConductor, String puntoPartida,
                                             String puntoLlegada, String fechaTraslado, String observaciones,
                                             String conformidadNombre, String conformidadDni) throws SQLException {

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

    public List<Map<String, Object>> buscarArticulosParaVenta(Connection con, String busqueda) throws SQLException {
        CallableStatement cs = null;
        ResultSet rs = null;
        List<Map<String, Object>> articulos = new ArrayList<>();

        try {
            cs = con.prepareCall("{CALL sp_buscar_articulos_para_venta(?)}");
            cs.setString(1, busqueda);

            cs.execute();
            rs = cs.getResultSet();

            while (rs.next()) {
                Map<String, Object> articulo = new HashMap<>();
                articulo.put("id", rs.getInt("id"));
                articulo.put("codigo", rs.getString("codigo"));
                articulo.put("descripcion", rs.getString("descripcion"));
                articulo.put("cantidad", rs.getDouble("cantidad"));
                articulo.put("precioUnitario", rs.getDouble("precio_unitario"));
                articulo.put("pesoUnitario", rs.getDouble("peso_unitario"));
                articulo.put("aroma", rs.getString("aroma"));
                articulo.put("color", rs.getString("color"));
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
}