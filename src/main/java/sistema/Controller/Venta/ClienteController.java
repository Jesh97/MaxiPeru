package sistema.Controller.Venta;

import sistema.Ejecucion.Conexion;
import sistema.Modelo.Cliente.Cliente;
import sistema.repository.ClienteRepository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ClienteController implements ClienteRepository {

    private Connection getConnection() throws SQLException {
        Connection conn = Conexion.obtenerConexion();
        if (conn == null) {
            throw new SQLException("No se pudo establecer la conexión a la base de datos.");
        }
        return conn;
    }

    @Override
    public void insertar(Cliente cliente) {
        String sql = "{call sp_agregar_cliente(?, ?, ?, ?, ?, ?)}";
        String tipoDoc = cliente.getN_Documento().length() == 8 ? "DNI" : "RUC";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setString(1, tipoDoc);
            cs.setString(2, cliente.getN_Documento());
            cs.setString(3, cliente.getRazonSocial());
            cs.setString(4, cliente.getDireccion());
            cs.setString(5, cliente.getTelefono());
            cs.setString(6, cliente.getCorreo());

            cs.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void actualizar(Cliente cliente) {
        String sql = "{call sp_actualizar_cliente(?, ?, ?, ?, ?, ?, ?)}";
        String tipoDoc = cliente.getN_Documento().length() == 8 ? "DNI" : "RUC";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, cliente.getId());
            cs.setString(2, tipoDoc);
            cs.setString(3, cliente.getN_Documento());
            cs.setString(4, cliente.getRazonSocial());
            cs.setString(5, cliente.getDireccion());
            cs.setString(6, cliente.getTelefono());
            cs.setString(7, cliente.getCorreo());

            cs.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void eliminar(int id) {
        String sql = "{call sp_eliminar_cliente(?)}";
        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, id);

            cs.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public Cliente obtenerPorId(int id) {
        String sql = "SELECT id, tipoDocumento, n_documento, razonSocial, direccion, telefono, correo FROM cliente WHERE id=?";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapearCliente(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public List<Cliente> listarTodos() {
        List<Cliente> lista = new ArrayList<>();
        String sql = "{call sp_listar_clientes()}";
        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql);
             ResultSet rs = cs.executeQuery()) {
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
        String sql = "{call sp_buscar_cliente(?)}";
        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {
            cs.setString(1, filtro);
            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    lista.add(mapearCliente(rs));
                }
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