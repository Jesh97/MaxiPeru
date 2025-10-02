package sistema.Controller.Producto;

import sistema.Ejecucion.Conexion;
import sistema.Modelo.Articulo.*;
import sistema.repository.ArticuloRepository;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ArticuloController implements ArticuloRepository {

    private Articulo mapearArticuloConObjetos(ResultSet rs) throws SQLException {
        Articulo a = new Articulo();
        a.setIdProducto(rs.getInt("id"));
        a.setCodigo(rs.getString("codigo"));
        a.setDescripcion(rs.getString("descripcion"));
        a.setCantidad(rs.getInt("cantidad"));
        a.setPrecioUnitario(rs.getDouble("precio_unitario"));
        a.setPesoUnitario(rs.getDouble("peso_unitario"));
        a.setDensidad(rs.getDouble("densidad"));
        a.setAroma(rs.getString("aroma"));
        a.setColor(rs.getString("color"));
        a.setMarca(new Marca(rs.getInt("id_marca"), rs.getString("marca_nombre")));
        a.setCategoria(new Categoria(rs.getInt("id_categoria"), rs.getString("categoria_nombre")));
        a.setUnidad(new UnidadMedida(rs.getInt("id_unidad"), rs.getString("unidad_nombre"), null));
        a.setTipoArticulo(new TipoArticulo(rs.getInt("id_tipo_articulo"), rs.getString("tipo_nombre")));
        return a;
    }

    private Articulo mapearArticuloSimple(ResultSet rs) throws SQLException {
        Articulo a = new Articulo();
        a.setIdProducto(rs.getInt("id"));
        a.setCodigo(rs.getString("codigo"));
        a.setDescripcion(rs.getString("descripcion"));
        a.setCantidad(rs.getInt("cantidad"));
        a.setPrecioUnitario(rs.getDouble("precio_unitario"));
        a.setPesoUnitario(rs.getDouble("peso_unitario"));
        a.setAroma(rs.getString("aroma"));
        a.setColor(rs.getString("color"));
        return a;
    }

    @Override
    public boolean agregarArticulo(Articulo articulo) {
        Connection conn = null;
        CallableStatement cs = null;
        boolean exito = false;
        try {
            conn = Conexion.obtenerConexion();
            cs = conn.prepareCall("{CALL sp_agregar_articulo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}");

            cs.setString(1, articulo.getCodigo());
            cs.setString(2, articulo.getDescripcion());
            cs.setInt(3, articulo.getCantidad());
            cs.setDouble(4, articulo.getPrecioUnitario());
            cs.setDouble(5, articulo.getPesoUnitario());
            cs.setDouble(6, articulo.getDensidad());
            cs.setString(7, articulo.getAroma());
            cs.setString(8, articulo.getColor());
            cs.setInt(9, articulo.getMarca().getIdMarca());
            cs.setInt(10, articulo.getCategoria().getIdCategoria());
            cs.setInt(11, articulo.getUnidad().getIdUnidad());
            cs.setInt(12, articulo.getTipoArticulo().getId());

            exito = cs.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error al agregar artículo: " + e.getMessage());
        } finally {
            try { if (cs != null) cs.close(); } catch (SQLException e) { /* log error */ }
            Conexion.cerrarConexion(conn);
        }
        return exito;
    }

    @Override
    public boolean actualizarArticulo(Articulo articulo) {
        Connection conn = null;
        CallableStatement cs = null;
        boolean exito = false;
        try {
            conn = Conexion.obtenerConexion();
            cs = conn.prepareCall("{CALL sp_actualizar_articulo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}");

            cs.setInt(1, articulo.getIdProducto());
            cs.setString(2, articulo.getDescripcion());
            cs.setInt(3, articulo.getCantidad());
            cs.setDouble(4, articulo.getPrecioUnitario());
            cs.setDouble(5, articulo.getPesoUnitario());
            cs.setDouble(6, articulo.getDensidad());
            cs.setString(7, articulo.getAroma());
            cs.setString(8, articulo.getColor());
            cs.setInt(9, articulo.getMarca().getIdMarca());
            cs.setInt(10, articulo.getCategoria().getIdCategoria());
            cs.setInt(11, articulo.getUnidad().getIdUnidad());
            cs.setInt(12, articulo.getTipoArticulo().getId());

            exito = cs.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error al actualizar artículo: " + e.getMessage());
        } finally {
            try { if (cs != null) cs.close(); } catch (SQLException e) { /* log error */ }
            Conexion.cerrarConexion(conn);
        }
        return exito;
    }

    @Override
    public boolean eliminarArticulo(int idArticulo) {
        Connection conn = null;
        CallableStatement cs = null;
        boolean exito = false;
        try {
            conn = Conexion.obtenerConexion();
            cs = conn.prepareCall("{CALL sp_eliminar_articulo(?)}");
            cs.setInt(1, idArticulo);
            exito = cs.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error al eliminar artículo: " + e.getMessage());
        } finally {
            try { if (cs != null) cs.close(); } catch (SQLException e) { /* log error */ }
            Conexion.cerrarConexion(conn);
        }
        return exito;
    }

    @Override
    public List<Articulo> listarArticulos() {
        List<Articulo> articulos = new ArrayList<>();
        Connection conn = null;
        CallableStatement cs = null;
        ResultSet rs = null;
        try {
            conn = Conexion.obtenerConexion();
            cs = conn.prepareCall("{CALL sp_listar_articulos()}");
            rs = cs.executeQuery();
            while (rs.next()) {
                articulos.add(mapearArticuloConObjetos(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error al listar artículos: " + e.getMessage());
        } finally {
            try { if (rs != null) rs.close(); } catch (SQLException e) { /* log error */ }
            try { if (cs != null) cs.close(); } catch (SQLException e) { /* log error */ }
            Conexion.cerrarConexion(conn);
        }
        return articulos;
    }

    @Override
    public List<Articulo> buscarArticulosParaCompra(String busqueda) {
        List<Articulo> articulos = new ArrayList<>();
        Connection conn = null;
        CallableStatement cs = null;
        ResultSet rs = null;
        try {
            conn = Conexion.obtenerConexion();
            cs = conn.prepareCall("{CALL sp_buscar_articulos_para_compra(?)}");
            cs.setString(1, busqueda);
            rs = cs.executeQuery();
            while (rs.next()) {
                articulos.add(mapearArticuloSimple(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error al buscar artículos para compra: " + e.getMessage());
        } finally {
            try { if (rs != null) rs.close(); } catch (SQLException e) { /* log error */ }
            try { if (cs != null) cs.close(); } catch (SQLException e) { /* log error */ }
            Conexion.cerrarConexion(conn);
        }
        return articulos;
    }

    @Override
    public List<Articulo> buscarArticulosParaVenta(String busqueda) {
        List<Articulo> articulos = new ArrayList<>();
        Connection conn = null;
        CallableStatement cs = null;
        ResultSet rs = null;
        try {
            conn = Conexion.obtenerConexion();
            cs = conn.prepareCall("{CALL sp_buscar_articulos_para_venta(?)}");
            cs.setString(1, busqueda);
            rs = cs.executeQuery();
            while (rs.next()) {
                articulos.add(mapearArticuloSimple(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error al buscar artículos para venta: " + e.getMessage());
        } finally {
            try { if (rs != null) rs.close(); } catch (SQLException e) { /* log error */ }
            try { if (cs != null) cs.close(); } catch (SQLException e) { /* log error */ }
            Conexion.cerrarConexion(conn);
        }
        return articulos;
    }

    @Override
    public List<Articulo> buscarInsumos(String busqueda) {
        List<Articulo> articulos = new ArrayList<>();
        Connection conn = null;
        CallableStatement cs = null;
        ResultSet rs = null;
        try {
            conn = Conexion.obtenerConexion();
            cs = conn.prepareCall("{CALL sp_buscar_insumos(?)}");
            cs.setString(1, busqueda);
            rs = cs.executeQuery();
            while (rs.next()) {
                articulos.add(mapearArticuloSimple(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error al buscar insumos: " + e.getMessage());
        } finally {
            try { if (rs != null) rs.close(); } catch (SQLException e) { /* log error */ }
            try { if (cs != null) cs.close(); } catch (SQLException e) { /* log error */ }
            Conexion.cerrarConexion(conn);
        }
        return articulos;
    }
}