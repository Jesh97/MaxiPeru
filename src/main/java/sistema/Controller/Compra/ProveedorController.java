package sistema.Controller.Compra;

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
        String sql = "{call sp_agregar_proveedor(?, ?, ?, ?, ?, ?)}";
        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setString(1, proveedor.getRuc());
            cs.setString(2, proveedor.getRazonSocial());
            cs.setString(3, proveedor.getDireccion());
            cs.setString(4, proveedor.getTelefono());
            cs.setString(5, proveedor.getCorreo());
            cs.setString(6, proveedor.getCiudad());

            cs.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void actualizar(Proveedor proveedor) {
        String sql = "{call sp_actualizar_proveedor(?, ?, ?, ?, ?, ?, ?)}";
        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, proveedor.getId());
            cs.setString(2, proveedor.getRuc());
            cs.setString(3, proveedor.getRazonSocial());
            cs.setString(4, proveedor.getDireccion());
            cs.setString(5, proveedor.getTelefono());
            cs.setString(6, proveedor.getCorreo());
            cs.setString(7, proveedor.getCiudad());

            cs.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void eliminar(int id) {
        String sql = "{call sp_eliminar_proveedor(?)}";
        try (Connection conn = getConnection(); CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, id);
            cs.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public Proveedor obtenerPorId(int id) {
        String sql = "SELECT id, ruc, razonSocial, ciudad, direccion, telefono, correo FROM proveedor WHERE id=?";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapearProveedor(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public List<Proveedor> listarTodos() {
        List<Proveedor> lista = new ArrayList<>();
        String sql = "{call sp_listar_proveedores()}";
        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql);
             ResultSet rs = cs.executeQuery()) {
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
        try {
            return buscarProveedor(filtro);
        } catch (SQLException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public List<Proveedor> buscarProveedor(String busqueda) throws SQLException {
        List<Proveedor> proveedores = new ArrayList<>();
        String sql = "{call sp_buscar_proveedor(?)}";

        try (Connection conn = getConnection(); CallableStatement cs = conn.prepareCall(sql)) {

            cs.setString(1, busqueda);

            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    proveedores.add(mapearProveedor(rs));
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
        p.setDireccion(rs.getString("direccion"));
        p.setTelefono(rs.getString("telefono"));
        p.setCorreo(rs.getString("correo"));
        p.setCiudad(rs.getString("ciudad"));
        return p;
    }
}