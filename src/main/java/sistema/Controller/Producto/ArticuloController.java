package sistema.Controller.Producto;

import sistema.Ejecucion.Conexion;
import sistema.Modelo.Articulo.Articulo;
import sistema.repository.ArticuloRepository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ArticuloController implements ArticuloRepository {

    private Connection getConnection() throws SQLException {
        Connection conn = Conexion.obtenerConexion();
        if (conn == null) {
            throw new SQLException("No se pudo establecer la conexión a la base de datos.");
        }
        return conn;
    }

    @Override
    public boolean insertar(Articulo a) {
        String sql = "{call sp_agregar_articulo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setString(1, a.getCodigo());
            cs.setString(2, a.getDescripcion());
            cs.setInt(3, a.getCantidad());
            cs.setDouble(4, a.getPrecioUnitario());
            cs.setDouble(5, a.getPesoUnitario());
            cs.setString(6, a.getAroma());
            cs.setString(7, a.getColor());
            cs.setInt(8, a.getIdMarca());
            cs.setInt(9, a.getIdCategoria());
            cs.setInt(10, a.getIdUnidad());
            // ⚠️ Si necesitas id_tipo_articulo, deberías modificar el SP para incluirlo

            return cs.executeUpdate() > 0;

        } catch (SQLException ex) {
            ex.printStackTrace();
        }
        return false;
    }

    @Override
    public boolean actualizar(Articulo a) {
        String sql = "{call sp_actualizar_articulo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, a.getIdProducto());
            cs.setString(2, a.getDescripcion());
            cs.setInt(3, a.getCantidad());
            cs.setDouble(4, a.getPrecioUnitario());
            cs.setDouble(5, a.getPesoUnitario());
            cs.setString(6, a.getAroma());
            cs.setString(7, a.getColor());
            cs.setInt(8, a.getIdMarca());
            cs.setInt(9, a.getIdCategoria());
            cs.setInt(10, a.getIdUnidad());

            return cs.executeUpdate() > 0;

        } catch (SQLException ex) {
            ex.printStackTrace();
        }
        return false;
    }

    @Override
    public boolean eliminar(int id) {
        String sql = "{call sp_eliminar_articulo(?)}";
        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, id);
            return cs.executeUpdate() > 0;

        } catch (SQLException ex) {
            ex.printStackTrace();
        }
        return false;
    }

    @Override
    public Articulo obtenerPorId(int id) {
        String sql = "SELECT * FROM articulo WHERE id=?";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return mapArticulo(rs);
            }

        } catch (SQLException ex) {
            ex.printStackTrace();
        }
        return null;
    }

    @Override
    public List<Articulo> listar() {
        List<Articulo> lista = new ArrayList<>();
        String sql = "SELECT * FROM articulo";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                lista.add(mapArticulo(rs));
            }

        } catch (SQLException ex) {
            ex.printStackTrace();
        }
        return lista;
    }

    public List<Articulo> buscarParaCompra(String busqueda) throws SQLException {
        return buscarConSP("{call sp_buscar_articulos_para_compra(?)}", busqueda);
    }

    public List<Articulo> buscarParaVenta(String busqueda) throws SQLException {
        return buscarConSP("{call sp_buscar_articulos_para_venta(?)}", busqueda);
    }

    public List<Articulo> buscarInsumos(String busqueda) throws SQLException {
        return buscarConSP("{call sp_buscar_insumos(?)}", busqueda);
    }

    private List<Articulo> buscarConSP(String sql, String busqueda) throws SQLException {
        List<Articulo> productos = new ArrayList<>();

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setString(1, busqueda);

            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    productos.add(mapArticulo(rs));
                }
            }
        }
        return productos;
    }

    private Articulo mapArticulo(ResultSet rs) throws SQLException {
        Articulo a = new Articulo();
        a.setIdProducto(rs.getInt("id"));
        a.setCodigo(rs.getString("codigo"));
        a.setDescripcion(rs.getString("descripcion"));
        a.setCantidad(rs.getInt("cantidad"));
        a.setPrecioUnitario(rs.getDouble("precio_unitario"));
        a.setPesoUnitario(rs.getDouble("peso_unitario"));
        a.setAroma(rs.getString("aroma"));
        a.setColor(rs.getString("color"));

        // Si los SELECT incluyen más columnas en algún SP, acá también puedes mapearlas
        try { a.setIdMarca(rs.getInt("id_marca")); } catch (SQLException ignored) {}
        try { a.setIdCategoria(rs.getInt("id_categoria")); } catch (SQLException ignored) {}
        try { a.setIdUnidad(rs.getInt("id_unidad")); } catch (SQLException ignored) {}
        try { a.setIdTipoArticulo(rs.getInt("id_tipo_articulo")); } catch (SQLException ignored) {}

        return a;
    }
}
