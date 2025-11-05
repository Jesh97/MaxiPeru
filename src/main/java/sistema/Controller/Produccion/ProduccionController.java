package sistema.Controller.Produccion;

import sistema.Ejecucion.Conexion;
import sistema.repository.ProduccionRepository;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.Random;
import java.text.SimpleDateFormat;
import java.sql.Date;

public class ProduccionController implements ProduccionRepository {

    private Connection getConnection() throws SQLException {
        Connection conn = Conexion.obtenerConexion();
        if (conn == null) throw new SQLException("No se pudo establecer la conexión a la base de datos.");
        return conn;
    }

    private String generarCodigoLote() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyMMdd");
        String fecha = sdf.format(new java.util.Date());
        Random random = new Random();
        int sufijo = 100 + random.nextInt(900);
        return "LOTE-" + fecha + "-" + sufijo;
    }

    @Override
    public int crearReceta(int idProductoMaestro, String descripcion, BigDecimal cantProd, int idUniProd) throws SQLException {
        int idReceta = -1;
        String sql = "{CALL sp_crear_receta(?, ?, ?)}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, idProductoMaestro);
            cs.setBigDecimal(2, cantProd);
            cs.setInt(3, idUniProd);

            try (ResultSet rs = cs.executeQuery()) {
                if (rs.next()) {
                    idReceta = rs.getInt("id_receta");
                }
            }
        }
        if (idReceta <= 0) throw new SQLException("Error: El registro de la receta falló, se obtuvo un ID inválido.");
        return idReceta;
    }

    @Override
    public void agregarDetalleReceta(int idReceta, int idArtInsumo, BigDecimal cantReq, int idUniInsumo) throws SQLException {
        String sql = "{CALL sp_detalle_receta(?, ?, ?, ?)}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, idReceta);
            cs.setInt(2, idArtInsumo);
            cs.setBigDecimal(3, cantReq);
            cs.setInt(4, idUniInsumo);
            cs.execute();
        }
    }

    public List<Map<String, Object>> obtenerRecetaPorNombreGenerico(String nombreGenerico) throws SQLException {
        List<Map<String, Object>> detallesReceta = new ArrayList<>();
        String sql = "{CALL sp_obtener_receta_por_nombre_generico(?)}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setString(1, nombreGenerico);

            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> detalle = new LinkedHashMap<>();
                    detalle.put("id_producto_maestro", rs.getInt("id_producto_maestro"));
                    detalle.put("nombre_generico", rs.getString("nombre_generico"));
                    detalle.put("id_receta", rs.getInt("id_receta"));
                    detalle.put("receta_cantidad_base", rs.getBigDecimal("receta_cantidad_base"));
                    detalle.put("unidad_producir_nombre", rs.getString("unidad_producir_nombre"));
                    detalle.put("insumo_nombre", rs.getString("insumo_nombre"));
                    detalle.put("insumo_cantidad_requerida", rs.getBigDecimal("insumo_cantidad_requerida"));
                    detalle.put("insumo_unidad_nombre", rs.getString("insumo_unidad_nombre"));
                    detallesReceta.add(detalle);
                }
            }
        }
        return detallesReceta;
    }

    @Override
    public int crearOrden(int idReceta, int idArticuloProducido, BigDecimal cantProd, String fechaIni, String obs) throws SQLException {
        int idOrden = -1;
        String sql = "{CALL sp_crear_orden(?, ?, ?, ?, ?, ?)}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, idReceta);
            cs.setInt(2, idArticuloProducido);
            cs.setBigDecimal(3, cantProd);
            cs.setBigDecimal(4, BigDecimal.ZERO);
            cs.setDate(5, fechaIni != null ? Date.valueOf(fechaIni) : null);
            cs.setString(6, obs);

            try (ResultSet rs = cs.executeQuery()) {
                if (rs.next()) {
                    idOrden = rs.getInt("id_orden");
                }
            }
        }
        if (idOrden <= 0) throw new SQLException("Error: La creación de la orden falló, se obtuvo un ID inválido.");
        return idOrden;
    }

    @Override
    public void gestionarConsumoMateriaPrima(int idOrden) throws SQLException {
        String sql = "{CALL sp_gestionar_consumo_mp(?)}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, idOrden);
            cs.execute();
        }
    }

    @Override
    public void registrarConsumoComponente(int idOrden, int idArticuloConsumido, BigDecimal cantidadAConsumir, int idUnidad, boolean esEnvase) throws SQLException {
        String sql = "{CALL sp_registrar_consumo_produccion_componente(?, ?, ?, ?, ?)}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, idOrden);
            cs.setInt(2, idArticuloConsumido);
            cs.setBigDecimal(3, cantidadAConsumir);
            cs.setInt(4, idUnidad);
            cs.setBoolean(5, esEnvase);

            try (ResultSet rs = cs.executeQuery()) {
                if (rs.next()) {
                }
            }
        }
    }

    @Override
    public void gestionarConsumoEnvase(int idOrden, BigDecimal mermaCantidad, BigDecimal envasesSueltos) throws SQLException {
        String sql = "{CALL sp_gestionar_consumo_envase(?, ?, ?)}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, idOrden);
            cs.setBigDecimal(2, mermaCantidad);
            cs.setBigDecimal(3, envasesSueltos);

            try (ResultSet rs = cs.executeQuery()) {
                if (rs.next()) {
                }
            }
        }
    }

    @Override
    public void registrarLotes(int idOrden, List<Map<String, Object>> lotes) throws SQLException {
        String sql = "{CALL sp_reg_lote(?, ?, ?, ?)}";

        try (Connection conn = getConnection()) {
            conn.setAutoCommit(false);
            try (CallableStatement cs = conn.prepareCall(sql)) {

                for (Map<String, Object> lote : lotes) {
                    BigDecimal cantidad = (BigDecimal) lote.get("cantidad");
                    String codigoLote = (String) lote.get("codigo_lote");
                    String fechaVencimientoStr = (String) lote.get("fecha_vencimiento");
                    Date fechaVencimientoSql = fechaVencimientoStr != null ? Date.valueOf(fechaVencimientoStr) : null;

                    if (codigoLote == null || codigoLote.isEmpty()) {
                        codigoLote = generarCodigoLote();
                    }

                    cs.setInt(1, idOrden);
                    cs.setBigDecimal(2, cantidad);
                    cs.setString(3, codigoLote);
                    cs.setDate(4, fechaVencimientoSql);

                    try (ResultSet rs = cs.executeQuery()) {
                        if (rs.next()) {
                        }
                    }
                }
                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw new SQLException("Error al registrar los lotes. Transacción revertida.", e);
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    @Override
    public void finalizarOrden(int idOrden) throws SQLException {
        String sql = "{CALL sp_finalizar_orden(?)}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, idOrden);

            try (ResultSet rs = cs.executeQuery()) {
                if (rs.next()) {
                }
            }
        }
    }

    @Override
    public List<String> obtenerPresentacionesPorProductoMaestro(int idProductoMaestro) throws SQLException {
        List<String> presentaciones = new ArrayList<>();
        String sql = "{CALL sp_obtener_presentaciones_por_pm(?)}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, idProductoMaestro);

            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    String presentacion = rs.getString("presentacion_detalle");
                    presentaciones.add(presentacion);
                }
            }
        }
        return presentaciones;
    }

    private List<Map<String, Object>> ejecutarBusqueda(String sql, String busqueda) throws SQLException {
        List<Map<String, Object>> articulos = new ArrayList<>();

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setString(1, busqueda);

            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> articulo = new LinkedHashMap<>();
                    try { articulo.put("id", rs.getInt("id")); } catch (SQLException e) { try { articulo.put("id", rs.getInt("id_articulo")); } catch (SQLException e2) { articulo.put("id", 0); } }
                    try { articulo.put("codigo", rs.getString("codigo")); } catch (SQLException e) { articulo.put("codigo", ""); }
                    try { articulo.put("nombre", rs.getString("nombre_producto")); } catch (SQLException e) { try { articulo.put("nombre", rs.getString("descripcion")); } catch (SQLException e2) { articulo.put("nombre", "Artículo Desconocido"); } }
                    try { articulo.put("presentacion_detalle", rs.getString("presentacion_detalle")); } catch (SQLException e) { }
                    try { articulo.put("cantidad", rs.getInt("cantidad")); } catch (SQLException e) { }
                    try { articulo.put("precio_compra", rs.getBigDecimal("precio_compra")); } catch (SQLException e) { }
                    try { articulo.put("precio_venta", rs.getBigDecimal("precio_venta")); } catch (SQLException e) { }
                    try { articulo.put("peso_unitario", rs.getDouble("peso_unitario")); } catch (SQLException e) { }
                    try { articulo.put("aroma", rs.getString("aroma")); } catch (SQLException e) { }
                    try { articulo.put("color", rs.getString("color")); } catch (SQLException e) { }
                    try { articulo.put("densidad", rs.getDouble("densidad")); } catch (SQLException e) { articulo.put("densidad", 1.0); }
                    try { articulo.put("unidad", rs.getString("unidad")); } catch (SQLException e) { articulo.put("unidad", "UND"); }

                    articulos.add(articulo);
                }
            }
        }
        return articulos;
    }

    @Override
    public List<Map<String, Object>> buscarArticulosTerminados(String busqueda) throws SQLException {
        String sql = "{CALL sp_buscar_articulos_terminados(?)}";
        return ejecutarBusqueda(sql, busqueda);
    }

    @Override
    public List<Map<String, Object>> buscarArticulosInsumos(String busqueda) throws SQLException {
        String sql = "{CALL sp_buscar_articulos_insumos(?)}";
        return ejecutarBusqueda(sql, busqueda);
    }

    @Override
    public List<Map<String, Object>> buscarArticulosEmbalaje(String busqueda) throws SQLException {
        String sql = "{CALL sp_buscar_articulos_embalado_y_embalaje(?)}";
        return ejecutarBusqueda(sql, busqueda);
    }
}