package sistema.Controller;

import sistema.Ejecucion.Conexion;
import sistema.Modelo.Proveedor.Proveedor;
import sistema.repository.ProveedorRepository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ProveedorController implements ProveedorRepository {

    private Connection getConnection() throws SQLException {
        Connection conn = Conexion.obtenerConexion();
        if (conn == null) {
            throw new SQLException("No se pudo establecer la conexión a la base de datos.");
        }
        return conn;
    }

    @Override
    public void insertar(Proveedor proveedor) {
        String sql = "INSERT INTO proveedor (ruc, razonSocial, ciudad, direccion) VALUES (?, ?, ?,?)";
        try (Connection conn = Conexion.obtenerConexion();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, proveedor.getRuc());
            stmt.setString(2, proveedor.getRazonSocial());
            stmt.setString(3, proveedor.getCiudad());
            stmt.setString(4, proveedor.getDireccion());
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void actualizar(Proveedor proveedor) {
        String sql = "UPDATE proveedor SET ruc=?, razonSocial=?, ciudad=?, direccion=? WHERE id=?";
        try (Connection conn = Conexion.obtenerConexion();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, proveedor.getRuc());
            stmt.setString(2, proveedor.getRazonSocial());
            stmt.setString(3, proveedor.getCiudad());
            stmt.setString(4, proveedor.getDireccion());
            stmt.setInt(5, proveedor.getId());
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void eliminar(int id) {
        String sql = "DELETE FROM proveedor WHERE id=?";
        try (Connection conn = Conexion.obtenerConexion();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public Proveedor obtenerPorId(int id) {
        String sql = "SELECT * FROM proveedor WHERE id=?";
        try (Connection conn = Conexion.obtenerConexion();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapearProveedor(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public List<Proveedor> listarTodos() {
        List<Proveedor> lista = new ArrayList<>();
        String sql = "SELECT * FROM proveedor";
        try (Connection conn = Conexion.obtenerConexion();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                lista.add(mapearProveedor(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    @Override
    public List<Proveedor> buscar(String filtro) {
        List<Proveedor> lista = new ArrayList<>();
        String sql = "SELECT * FROM proveedor WHERE razonSocial LIKE ? OR ruc LIKE ? OR ciudad LIKE ?";
        try (Connection conn = Conexion.obtenerConexion();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            String like = "%" + filtro + "%";
            stmt.setString(1, like);
            stmt.setString(2, like);
            stmt.setString(3, like);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                lista.add(mapearProveedor(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    @Override
    public List<Proveedor> buscarProveedor(String busqueda) throws SQLException {
        List<Proveedor> proveedores = new ArrayList<>();
        String sql = "{call sp_buscar_proveedor(?)}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setString(1, busqueda);

            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    Proveedor proveedor = new Proveedor();
                    proveedor.setId(rs.getInt("id"));
                    proveedor.setRuc(rs.getString("ruc"));
                    proveedor.setRazonSocial(rs.getString("razon_social"));
                    proveedor.setDireccion(rs.getString("direccion"));
                    proveedor.setTelefono(rs.getString("telefono"));
                    proveedor.setCorreo(rs.getString("correo"));
                    proveedor.setCiudad(rs.getString("ciudad"));
                    proveedores.add(proveedor);
                }
            }
        }
        return proveedores;
    }

    private Proveedor mapearProveedor(ResultSet rs) throws SQLException {
        Proveedor p = new Proveedor();
        p.setId(rs.getInt("id"));
        p.setRuc(rs.getString("ruc"));
        p.setRazonSocial(rs.getString("razonSocial"));
        p.setCiudad(rs.getString("ciudad"));
        p.setDireccion(rs.getString("direccion"));
        return p;
    }
}
