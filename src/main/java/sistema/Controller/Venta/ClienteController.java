package sistema.Controller.Venta;

import sistema.Ejecucion.Conexion;
import sistema.Modelo.Cliente.Cliente;
import sistema.repository.ClienteRepository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ClienteController implements ClienteRepository {

    @Override
    public void insertar(Cliente cliente) {
        String sql = "INSERT INTO cliente (tipoDocumento, n_documento, razonSocial, direccion, telefono, correo) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = Conexion.obtenerConexion();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, cliente.getN_Documento().length() == 8 ? "DNI" : "RUC");
            stmt.setString(2, cliente.getN_Documento());
            stmt.setString(3, cliente.getRazonSocial());
            stmt.setString(4, cliente.getDireccion());
            stmt.setString(5, cliente.getTelefono());
            stmt.setString(6, cliente.getCorreo());
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void actualizar(Cliente cliente) {
        String sql = "UPDATE cliente SET tipoDocumento=?, n_documento=?, razonSocial=?, direccion=?, telefono=?, correo=? WHERE id=?";
        try (Connection conn = Conexion.obtenerConexion();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, cliente.getN_Documento().length() == 8 ? "DNI" : "RUC");
            stmt.setString(2, cliente.getN_Documento());
            stmt.setString(3, cliente.getRazonSocial());
            stmt.setString(4, cliente.getDireccion());
            stmt.setString(5, cliente.getTelefono());
            stmt.setString(6, cliente.getCorreo());
            stmt.setInt(7, cliente.getId());
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void eliminar(int id) {
        String sql = "DELETE FROM cliente WHERE id=?";
        try (Connection conn = Conexion.obtenerConexion();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public Cliente obtenerPorId(int id) {
        String sql = "SELECT * FROM cliente WHERE id=?";
        try (Connection conn = Conexion.obtenerConexion();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapearCliente(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public List<Cliente> listarTodos() {
        List<Cliente> lista = new ArrayList<>();
        String sql = "SELECT * FROM cliente";
        try (Connection conn = Conexion.obtenerConexion();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                lista.add(mapearCliente(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    @Override
    public List<Cliente> buscar(String filtro) {
        List<Cliente> lista = new ArrayList<>();
        String sql = "SELECT * FROM cliente WHERE razonSocial LIKE ? OR n_documento LIKE ?";
        try (Connection conn = Conexion.obtenerConexion();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            String filtroLike = "%" + filtro + "%";
            stmt.setString(1, filtroLike);
            stmt.setString(2, filtroLike);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                lista.add(mapearCliente(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    private Cliente mapearCliente(ResultSet rs) throws SQLException {
        Cliente c = new Cliente();
        c.setId(rs.getInt("id"));
        c.setN_Documento(rs.getString("n_documento"));
        c.setRazonSocial(rs.getString("razonSocial"));
        c.setDireccion(rs.getString("direccion"));
        c.setCorreo(rs.getString("correo"));
        c.setTelefono(rs.getString("telefono"));
        return c;
    }
}
