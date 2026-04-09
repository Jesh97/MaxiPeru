package sistema.Controller.Compra;

import sistema.Ejecucion.Conexion;
import sistema.Modelo.Compra.*;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class AdicionalController {

    private Connection getConnection() throws SQLException {
        return Conexion.obtenerConexion();
    }

    public void guardar(TipoComprobante comprobante) throws SQLException {
        String sql = "INSERT INTO tipo_comprobante (nombre) VALUES (?)";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, comprobante.getNombre());
            ps.executeUpdate();
        }
    }

    public List<TipoComprobante> listarTipoComprobante() throws SQLException {
        List<TipoComprobante> lista = new ArrayList<>();
        String sql = "SELECT * FROM tipo_comprobante";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                lista.add(new TipoComprobante(rs.getInt("id"), rs.getString("nombre")));
            }
        }
        return lista;
    }

    public void actualizar(TipoComprobante comprobante) throws SQLException {
        String sql = "UPDATE tipo_comprobante SET nombre=? WHERE id=?";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, comprobante.getNombre());
            ps.setInt(2, comprobante.getId());
            ps.executeUpdate();
        }
    }

    public void eliminarTipoComprobante(int id) throws SQLException {
        String sql = "DELETE FROM tipo_comprobante WHERE id=?";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }

    public void guardar(FormaPago forma) throws SQLException {
        String sql = "INSERT INTO forma_pago (nombre) VALUES (?)";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, forma.getNombre());
            ps.executeUpdate();
        }
    }

    public List<FormaPago> listarFormaPago() throws SQLException {
        List<FormaPago> lista = new ArrayList<>();
        String sql = "SELECT * FROM forma_pago";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                lista.add(new FormaPago(rs.getInt("id"), rs.getString("nombre")));
            }
        }
        return lista;
    }

    public void actualizar(FormaPago forma) throws SQLException {
        String sql = "UPDATE forma_pago SET nombre=? WHERE id=?";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, forma.getNombre());
            ps.setInt(2, forma.getId());
            ps.executeUpdate();
        }
    }

    public void eliminarFormaPago(int id) throws SQLException {
        String sql = "DELETE FROM forma_pago WHERE id=?";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }

    // ---------- TIPO DE PAGO ----------
    public void guardar(TipoPago tipo) throws SQLException {
        String sql = "INSERT INTO tipo_pago (nombre) VALUES (?)";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, tipo.getNombre());
            ps.executeUpdate();
        }
    }

    public List<TipoPago> listarTipoPago() throws SQLException {
        List<TipoPago> lista = new ArrayList<>();
        String sql = "SELECT * FROM tipo_pago";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                lista.add(new TipoPago(rs.getInt("id"), rs.getString("nombre")));
            }
        }
        return lista;
    }

    public void actualizar(TipoPago tipo) throws SQLException {
        String sql = "UPDATE tipo_pago SET nombre=? WHERE id=?";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, tipo.getNombre());
            ps.setInt(2, tipo.getId());
            ps.executeUpdate();
        }
    }

    public void eliminarTipoPago(int id) throws SQLException {
        String sql = "DELETE FROM tipo_pago WHERE id=?";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }
}
