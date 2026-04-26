package sistema.Controller.Gasto;

import sistema.Ejecucion.Conexion;
import sistema.Modelo.Gasto.Gasto;
import sistema.Modelo.Gasto.DetalleGasto;

import java.sql.*;
import java.util.List;

public class Gastocontroller {

    private Connection getConnection() throws SQLException {
        return Conexion.obtenerConexion();
    }

    /**
     * Registra un gasto cabecera + sus detalles en una sola transacción.
     * @return ID del gasto recién insertado.
     */
    public int registrarGasto(Gasto gasto, List<DetalleGasto> detalles) throws SQLException {
        String sqlGasto = """
            INSERT INTO gasto
                (id_proveedor, id_tipo_gasto, fecha, id_moneda,
                subtotal, igv, total, observacion, total_peso)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;

       String sqlDetalle = """
            INSERT INTO detalle_gasto
                (id_gasto, descripcion, cantidad, precio_unitario, subtotal, igv, total)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """;

        Connection conn = getConnection();
        try {
            conn.setAutoCommit(false);

            int idGasto;
           try (PreparedStatement ps = conn.prepareStatement(sqlGasto, Statement.RETURN_GENERATED_KEYS)) {

                ps.setInt(1, gasto.getIdProveedor());
                ps.setInt(2, gasto.getIdTipoGasto());
                ps.setDate(3, Date.valueOf(gasto.getFecha()));
                ps.setInt(4, gasto.getIdMoneda());

                ps.setDouble(5, gasto.getSubtotal());
                ps.setDouble(6, gasto.getIgv());
                ps.setDouble(7, gasto.getTotal());
                ps.setString(8, gasto.getObservacion());

                ps.setDouble(9, 0.0); // o calcularlo

                 ps.executeUpdate();

                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        idGasto = rs.getInt(1);
                    } else {
                        throw new SQLException("No se pudo obtener el ID del gasto registrado.");
                    }
                }
            }
            try (PreparedStatement ps = conn.prepareStatement(sqlDetalle)) {
                for (DetalleGasto d : detalles) {

                    ps.setInt(1, idGasto);
                    ps.setString(2, d.getDescripcion());
                    ps.setDouble(3, d.getCantidad());
                    ps.setDouble(4, d.getPrecioUnitario());
                    ps.setDouble(5, d.getSubtotal());
                    ps.setDouble(6, d.getIgv());
                    ps.setDouble(7, d.getTotal());

                    ps.addBatch();
                }
                ps.executeBatch();
}
            conn.commit();
            return idGasto;

        } catch (SQLException e) {
            conn.rollback();
            throw e;
        } finally {
            conn.setAutoCommit(true);
            conn.close();
        }
    }
}