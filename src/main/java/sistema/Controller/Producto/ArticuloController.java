package sistema.Controller.Producto;

import sistema.Ejecucion.Conexion;
import sistema.Modelo.Articulo.*;
import sistema.Modelo.Compra.Lote;
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
        a.setPrecioCompra(rs.getDouble("precio_compra"));
        a.setPrecioVenta(rs.getDouble("precio_venta"));
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
        try {a.setPrecioCompra(rs.getDouble("precio_compra"));} catch (SQLException e) {a.setPrecioCompra(0.0);}
        try {a.setPrecioVenta(rs.getDouble("precio_venta"));} catch (SQLException e) {a.setPrecioVenta(0.0);}
        a.setPesoUnitario(rs.getDouble("peso_unitario"));
        try {a.setDensidad(rs.getDouble("densidad"));} catch (SQLException e) {a.setDensidad(0.0);}
        a.setAroma(rs.getString("aroma"));
        a.setColor(rs.getString("color"));
        return a;
    }

    private Lote mapearLote(ResultSet rs) throws SQLException {
        Lote lote = new Lote();
        lote.setIdLote(rs.getInt("ID_Lote"));
        lote.setCodigoLote(rs.getString("Codigo_Lote"));
        lote.setCantidadLote(rs.getBigDecimal("Cantidad_Disponible"));
        java.sql.Date fechaVencimientoSql = rs.getDate("Fecha_Vencimiento");
        if (fechaVencimientoSql != null) {
            lote.setFechaVencimiento(fechaVencimientoSql.toLocalDate());
        }
        return lote;
    }

    @Override
    public boolean agregarArticulo(Articulo articulo) {
        Connection conn = null;
        CallableStatement cs = null;
        boolean exito = false;
        try {
            conn = Conexion.obtenerConexion();
            cs = conn.prepareCall("{CALL sp_agregar_articulo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}");
            cs.setString(1, articulo.getCodigo());
            cs.setString(2, articulo.getDescripcion());
            cs.setInt(3, articulo.getCantidad());
            cs.setDouble(4, articulo.getPrecioCompra());
            cs.setDouble(5, articulo.getPrecioVenta());
            cs.setDouble(6, articulo.getPesoUnitario());
            cs.setDouble(7, articulo.getDensidad());
            cs.setString(8, articulo.getAroma());
            cs.setString(9, articulo.getColor());
            cs.setInt(10, articulo.getMarca().getIdMarca());
            cs.setInt(11, articulo.getCategoria().getIdCategoria());
            cs.setInt(12, articulo.getUnidad().getIdUnidad());
            cs.setInt(13, articulo.getTipoArticulo().getId());
            exito = cs.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error al agregar artículo: " + e.getMessage());
        } finally {
            try { if (cs != null) cs.close(); } catch (SQLException e) { }
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
            cs.setDouble(4, articulo.getPrecioCompra());
            cs.setDouble(5, articulo.getPrecioVenta());
            cs.setDouble(6, articulo.getPesoUnitario());
            cs.setDouble(7, articulo.getDensidad());
            cs.setString(8, articulo.getAroma());
            cs.setString(9, articulo.getColor());
            cs.setInt(10, articulo.getMarca().getIdMarca());
            cs.setInt(11, articulo.getCategoria().getIdCategoria());
            cs.setInt(12, articulo.getUnidad().getIdUnidad());
            cs.setInt(13, articulo.getTipoArticulo().getId());
            exito = cs.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error al actualizar artículo: " + e.getMessage());
        } finally {
            try { if (cs != null) cs.close(); } catch (SQLException e) { }
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
            try { if (cs != null) cs.close(); } catch (SQLException e) { }
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
            try { if (rs != null) rs.close(); } catch (SQLException e) { }
            try { if (cs != null) cs.close(); } catch (SQLException e) { }
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
            try { if (rs != null) rs.close(); } catch (SQLException e) { }
            try { if (cs != null) cs.close(); } catch (SQLException e) { }
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
            try { if (rs != null) rs.close(); } catch (SQLException e) { }
            try { if (cs != null) cs.close(); } catch (SQLException e) { }
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
            cs = conn.prepareCall("{CALL sp_buscar_articulos_para_produccion(?)}");
            cs.setString(1, busqueda);
            rs = cs.executeQuery();
            while (rs.next()) {
                articulos.add(mapearArticuloSimple(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error al buscar insumos: " + e.getMessage());
        } finally {
            try { if (rs != null) rs.close(); } catch (SQLException e) { }
            try { if (cs != null) cs.close(); } catch (SQLException e) { }
            Conexion.cerrarConexion(conn);
        }
        return articulos;
    }

    @Override
    public List<Lote> verLotesPorArticulo(int idArticulo) {
        List<Lote> lotes = new ArrayList<>();
        Connection conn = null;
        CallableStatement cs = null;
        ResultSet rs = null;
        try {
            conn = Conexion.obtenerConexion();
            cs = conn.prepareCall("{CALL SP_VerLotesPorArticulo(?)}");
            cs.setInt(1, idArticulo);
            rs = cs.executeQuery();
            while (rs.next()) {
                lotes.add(mapearLote(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error al ver lotes por artículo: " + e.getMessage());
        } finally {
            try { if (rs != null) rs.close(); } catch (SQLException e) { }
            try { if (cs != null) cs.close(); } catch (SQLException e) { }
            Conexion.cerrarConexion(conn);
        }
        return lotes;
    }

    @Override
    public List<Categoria> listarCategoriasDinamicas(Integer idMarca, Integer idTipoArticulo) {
        List<Categoria> categorias = new ArrayList<>();
        Connection conn = null;
        CallableStatement cs = null;
        ResultSet rs = null;
        try {
            conn = Conexion.obtenerConexion();
            cs = conn.prepareCall("{CALL SP_GetOpcionesCategorias(?, ?)}");
            cs.setObject(1, idMarca, java.sql.Types.INTEGER);
            cs.setObject(2, idTipoArticulo, java.sql.Types.INTEGER);
            rs = cs.executeQuery();
            while (rs.next()) {
                categorias.add(new Categoria(rs.getInt("id_categoria"), rs.getString("nombre")));
            }
        } catch (SQLException e) {
            System.err.println("Error al listar categorías dinámicas: " + e.getMessage());
        } finally {
            try { if (rs != null) rs.close(); } catch (SQLException e) { }
            try { if (cs != null) cs.close(); } catch (SQLException e) { }
            Conexion.cerrarConexion(conn);
        }
        return categorias;
    }

    @Override
    public List<Marca> listarMarcasDinamicas(Integer idCategoria, Integer idTipoArticulo) {
        List<Marca> marcas = new ArrayList<>();
        Connection conn = null;
        CallableStatement cs = null;
        ResultSet rs = null;
        try {
            conn = Conexion.obtenerConexion();
            cs = conn.prepareCall("{CALL SP_GetOpcionesMarcas(?, ?)}");
            cs.setObject(1, idCategoria, java.sql.Types.INTEGER);
            cs.setObject(2, idTipoArticulo, java.sql.Types.INTEGER);
            rs = cs.executeQuery();
            while (rs.next()) {
                marcas.add(new Marca(rs.getInt("id_marca"), rs.getString("nombre")));
            }
        } catch (SQLException e) {
            System.err.println("Error al listar marcas dinámicas: " + e.getMessage());
        } finally {
            try { if (rs != null) rs.close(); } catch (SQLException e) { }
            try { if (cs != null) cs.close(); } catch (SQLException e) { }
            Conexion.cerrarConexion(conn);
        }
        return marcas;
    }

    @Override
    public List<TipoArticulo> listarTiposArticulosDinamicos(Integer idMarca, Integer idCategoria) {
        List<TipoArticulo> tipos = new ArrayList<>();
        Connection conn = null;
        CallableStatement cs = null;
        ResultSet rs = null;
        try {
            conn = Conexion.obtenerConexion();
            cs = conn.prepareCall("{CALL SP_GetOpcionesTipoArticulo(?, ?)}");
            cs.setObject(1, idMarca, java.sql.Types.INTEGER);
            cs.setObject(2, idCategoria, java.sql.Types.INTEGER);
            rs = cs.executeQuery();
            while (rs.next()) {
                tipos.add(new TipoArticulo(rs.getInt("id"), rs.getString("nombre")));
            }
        } catch (SQLException e) {
            System.err.println("Error al listar tipos de artículo dinámicos: " + e.getMessage());
        } finally {
            try { if (rs != null) rs.close(); } catch (SQLException e) { }
            try { if (cs != null) cs.close(); } catch (SQLException e) { }
            Conexion.cerrarConexion(conn);
        }
        return tipos;
    }
}