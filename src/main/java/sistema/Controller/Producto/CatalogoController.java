package sistema.Controller.Producto;

import sistema.Ejecucion.Conexion;
import sistema.Modelo.Articulo.Categoria;
import sistema.Modelo.Articulo.Marca;
import sistema.Modelo.Articulo.UnidadMedida;
import sistema.Modelo.Articulo.TipoArticulo;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CatalogoController {

    private Connection getConnection() throws SQLException {
        Connection conn = Conexion.obtenerConexion();
        if (conn == null) throw new SQLException("No se pudo conectar a la base de datos.");
        return conn;
    }

    // ====================== CATEGORÍAS ======================
    public List<Categoria> listarCategorias() {
        List<Categoria> lista = new ArrayList<>();
        String sql = "SELECT * FROM categoria";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                lista.add(new Categoria(rs.getInt("id_categoria"), rs.getString("nombre")));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return lista;
    }

    public boolean insertarCategoria(Categoria c) {
        String sql = "INSERT INTO categoria(nombre) VALUES(?)";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, c.getNombreCategoria());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    public boolean actualizarCategoria(Categoria c) {
        String sql = "UPDATE categoria SET nombre=? WHERE id_categoria=?";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, c.getNombreCategoria());
            ps.setInt(2, c.getIdCategoria());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    public boolean eliminarCategoria(int id) {
        String sql = "DELETE FROM categoria WHERE id_categoria=?";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    // ====================== MARCAS ======================
    public List<Marca> listarMarcas() {
        List<Marca> lista = new ArrayList<>();
        String sql = "SELECT * FROM marca";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                lista.add(new Marca(rs.getInt("id_marca"), rs.getString("nombre")));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return lista;
    }

    public boolean insertarMarca(Marca m) {
        String sql = "INSERT INTO marca(nombre) VALUES(?)";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, m.getNombre());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    public boolean actualizarMarca(Marca m) {
        String sql = "UPDATE marca SET nombre=? WHERE id_marca=?";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, m.getNombre());
            ps.setInt(2, m.getIdMarca());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    public boolean eliminarMarca(int id) {
        String sql = "DELETE FROM marca WHERE id_marca=?";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    // ====================== UNIDADES ======================
    public List<UnidadMedida> listarUnidades() {
        List<UnidadMedida> lista = new ArrayList<>();
        String sql = "SELECT * FROM unidad_medida";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                lista.add(new UnidadMedida(rs.getInt("id_unidad"), rs.getString("nombre"), rs.getString("abreviatura")));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return lista;
    }

    public boolean insertarUnidad(UnidadMedida u) {
        String sql = "INSERT INTO unidad_medida(nombre, abreviatura) VALUES(?, ?)";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, u.getNombre());
            ps.setString(2, u.getAbreviatura());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    public boolean actualizarUnidad(UnidadMedida u) {
        String sql = "UPDATE unidad_medida SET nombre=?, abreviatura=? WHERE id_unidad=?";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, u.getNombre());
            ps.setString(2, u.getAbreviatura());
            ps.setInt(3, u.getIdUnidad());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    public boolean eliminarUnidad(int id) {
        String sql = "DELETE FROM unidad_medida WHERE id_unidad=?";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    // ====================== TIPOS DE ARTÍCULO ======================
    public List<TipoArticulo> listarTipos() {
        List<TipoArticulo> lista = new ArrayList<>();
        String sql = "SELECT * FROM tipo_articulo";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                lista.add(new TipoArticulo(rs.getInt("id"), rs.getString("nombre")));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return lista;
    }

    public boolean insertarTipo(TipoArticulo t) {
        String sql = "INSERT INTO tipo_articulo(nombre) VALUES(?)";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, t.getNombre());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    public boolean actualizarTipo(TipoArticulo t) {
        String sql = "UPDATE tipo_articulo SET nombre=? WHERE id=?";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, t.getNombre());
            ps.setInt(2, t.getId());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    public boolean eliminarTipo(int id) {
        String sql = "DELETE FROM tipo_articulo WHERE id=?";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }
}
