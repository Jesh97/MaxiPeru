package sistema.Controller.Produccion;

import sistema.Ejecucion.Conexion;
import sistema.repository.ProduccionRepository;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.sql.Date;

public class ProduccionController implements ProduccionRepository {

    private Connection getConnection() throws SQLException {
        Connection conn = Conexion.obtenerConexion();
        if (conn == null) throw new SQLException("No se pudo establecer la conexión a la base de datos.");
        return conn;
    }

    private String generarCodigoLoteDB(int idArticulo) throws SQLException {
        String codigoLote;
        String sql = "{CALL sp_generar_siguiente_codigo_lote(?, ?)}";

        try (Connection conn = getConnection(); CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idArticulo);
            cs.registerOutParameter(2, java.sql.Types.VARCHAR);
            cs.execute();

            codigoLote = cs.getString(2);
        }
        if (codigoLote == null || codigoLote.isEmpty()) {
            throw new SQLException("Error: El SP de generación de lote devolvió un código inválido.");
        }
        return codigoLote;
    }

    private int obtenerIdArticuloProducidoPorOrden(int idOrden) throws SQLException {
        int idArticulo = -1;
        String sql = "SELECT id_articulo_producido FROM orden_produccion WHERE id_orden = ?";

        try (Connection conn = getConnection(); CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idOrden);

            try (ResultSet rs = cs.executeQuery()) {
                if (rs.next()) {
                    idArticulo = rs.getInt("id_articulo_producido");
                }
            }
        }
        if (idArticulo <= 0) {
            throw new SQLException("Error: No se pudo obtener el ID del artículo producido para la orden " + idOrden);
        }
        return idArticulo;
    }

    @Override
    public String generarCodigoLote(int idOrden) throws SQLException {
        int idArticuloProducido = obtenerIdArticuloProducidoPorOrden(idOrden);
        return generarCodigoLoteDB(idArticuloProducido);
    }

    @Override
    public int crearReceta(int idProductoMaestro, double cantProd, int idUniProd) throws SQLException {
        int idReceta = -1;
        String sql = "{CALL sp_crear_receta(?, ?, ?)}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, idProductoMaestro);
            cs.setDouble(2, cantProd);
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
    public void agregarDetalleReceta(int idReceta, int idArtInsumo, double cantReq, int idUniInsumo) throws SQLException {
        String sql = "{CALL sp_detalle_receta(?, ?, ?, ?)}";

        try (Connection conn = getConnection(); CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idReceta);
            cs.setInt(2, idArtInsumo);
            cs.setDouble(3, cantReq);
            cs.setInt(4, idUniInsumo);
            cs.execute();
        }
    }

    @Override
    public List<Map<String, Object>> listarRecetasConDetalles() throws SQLException {
        List<Map<String, Object>> recetas = new ArrayList<>();
        String sql = "{CALL sp_listar_recetas_con_detalles()}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql);
             ResultSet rs = cs.executeQuery()) {

            while (rs.next()) {
                Map<String, Object> receta = new LinkedHashMap<>();
                receta.put("id_receta", rs.getInt("id_receta"));
                receta.put("id_producto_maestro", rs.getInt("id_producto_maestro"));
                receta.put("nombre_generico", rs.getString("nombre_generico"));
                receta.put("receta_cantidad_base", rs.getDouble("receta_cantidad_base"));
                receta.put("unidad_producir_nombre", rs.getString("unidad_producir_nombre"));
                receta.put("fecha_creacion", rs.getString("fecha_creacion"));
                receta.put("estado", rs.getString("estado"));

                recetas.add(receta);
            }
        }
        return recetas;
    }

    @Override
    public void actualizarInsumoReceta(int idDetalleReceta, double cantReq, int idUniInsumo) throws SQLException {
        String sql = "{CALL sp_actualizar_insumo_receta(?, ?, ?)}";

        try (Connection conn = getConnection(); CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idDetalleReceta);
            cs.setDouble(2, cantReq);
            cs.setInt(3, idUniInsumo);
            cs.execute();
        }
    }

    @Override
    public void eliminarDetalleRecetaIndividual(int idDetalleReceta) throws SQLException {
        String sql = "{CALL sp_eliminar_detalle_receta_individual(?)}";

        try (Connection conn = getConnection(); CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idDetalleReceta);
            cs.execute();
        }
    }

    @Override
    public void desactivarReceta(int idReceta) throws SQLException {
        String sql = "{CALL sp_desactivar_receta(?)}";

        try (Connection conn = getConnection(); CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idReceta);
            cs.execute();
        }
    }

    @Override
    public List<Map<String, Object>> obtenerRecetaPorNombreGenerico(String nombreGenerico) throws SQLException {
        List<Map<String, Object>> detallesReceta = new ArrayList<>();
        String sql = "{CALL sp_obtener_receta_por_nombre_generico(?)}";

        try (Connection conn = getConnection(); CallableStatement cs = conn.prepareCall(sql)) {
            cs.setString(1, nombreGenerico);

            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> detalle = new LinkedHashMap<>();
                    detalle.put("id_producto_maestro", rs.getInt("id_producto_maestro"));
                    detalle.put("nombre_generico", rs.getString("nombre_generico"));
                    detalle.put("id_receta", rs.getInt("id_receta"));
                    detalle.put("receta_cantidad_base", rs.getDouble("receta_cantidad_base"));
                    detalle.put("unidad_producir_nombre", rs.getString("unidad_producir_nombre"));
                    detallesReceta.add(detalle);
                }
            }
        }
        return detallesReceta;
    }

    @Override
    public List<Map<String, Object>> obtenerInsumosPorIdReceta(int idReceta) throws SQLException {
        List<Map<String, Object>> insumos = new ArrayList<>();
        String sql = "{CALL sp_obtener_insumos_por_id_receta(?)}";

        try (Connection conn = getConnection(); CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idReceta);

            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> insumo = new LinkedHashMap<>();
                    insumo.put("id_articulo", rs.getInt("id_articulo"));
                    insumo.put("codigo", rs.getString("codigo"));
                    insumo.put("nombre_articulo", rs.getString("nombre_articulo"));
                    insumo.put("cantidad_requerida", rs.getDouble("cantidad_requerida"));
                    insumo.put("id_unidad", rs.getInt("id_unidad"));
                    insumo.put("unidad_nombre", rs.getString("unidad_nombre"));
                    insumos.add(insumo);
                }
            }
        }
        return insumos;
    }

    @Override
    public List<Map<String, Object>> obtenerDetalleInsumoReceta(int idDetalleReceta) throws SQLException {
        List<Map<String, Object>> insumoDetalle = new ArrayList<>();
        String sql = "{CALL sp_obtener_detalle_insumo_receta(?)}";

        try (Connection conn = getConnection(); CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idDetalleReceta);

            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> insumo = new LinkedHashMap<>();
                    insumo.put("id_articulo", rs.getInt("id_articulo"));
                    insumo.put("nombre_articulo", rs.getString("nombre_articulo"));
                    insumo.put("cantidad_requerida", rs.getDouble("cantidad_requerida"));
                    insumo.put("id_unidad", rs.getInt("id_unidad"));
                    insumo.put("unidad_nombre", rs.getString("unidad_nombre"));

                    try {
                        insumo.put("densidad", rs.getDouble("densidad"));
                    } catch (SQLException e) {
                        insumo.put("densidad", 1.0);
                    }

                    insumoDetalle.add(insumo);
                }
            }
        }
        return insumoDetalle;
    }

    @Override
    public int crearOrden(int idReceta, int idArticuloProducido, double cantProd, double cantProdFinalReal, String fechaIni, String obs) throws SQLException {
        int idOrden = -1;
        String sql = "{CALL sp_crear_orden(?, ?, ?, ?, ?, ?)}";

        try (Connection conn = getConnection(); CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idReceta);
            cs.setInt(2, idArticuloProducido);
            cs.setDouble(3, cantProd);
            cs.setDouble(4, cantProdFinalReal);
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

        try (Connection conn = getConnection(); CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, idOrden);
            cs.execute();
        }
    }

    @Override
    public void registrarConsumoComponente(int idOrden, int idArticuloConsumido, double cantidadAConsumir, int idUnidad, boolean esEnvase, String comentarioConsumo) throws SQLException {
        String sql = "{CALL sp_registrar_consumo_produccion_componente(?, ?, ?, ?, ?, ?)}";

        try (Connection conn = getConnection(); CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, idOrden);
            cs.setInt(2, idArticuloConsumido);
            cs.setDouble(3, cantidadAConsumir);
            cs.setInt(4, idUnidad);
            cs.setBoolean(5, esEnvase);
            cs.setString(6, comentarioConsumo);
            cs.execute();
        }
    }

    @Override
    public List<Map<String, Object>> obtenerConsumoTotalPorOrden(int idOrden) throws SQLException {
        List<Map<String, Object>> consumoTotal = new ArrayList<>();
        String sql = "{CALL sp_obtener_consumo_total_por_orden(?)}";

        try (Connection conn = getConnection(); CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idOrden);

            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> consumo = new LinkedHashMap<>();
                    consumo.put("id_articulo_consumido", rs.getInt("id_articulo_consumido"));
                    consumo.put("nombre_articulo", rs.getString("nombre_articulo"));
                    consumo.put("cantidad_total_consumida_kg", rs.getDouble("cantidad_total_consumida_kg"));
                    consumo.put("cantidad_requerida_kg", rs.getDouble("cantidad_requerida_kg"));
                    consumo.put("desviacion_neta_kg", rs.getDouble("desviacion_neta_kg"));
                    consumo.put("unidad_medida_base", rs.getString("unidad_medida_base"));
                    consumo.put("ultimo_comentario_desviacion", rs.getString("ultimo_comentario_desviacion"));
                    consumoTotal.add(consumo);
                }
            }
        }
        return consumoTotal;
    }

    @Override
    public void gestionarConsumoEnvase(int idOrden, double mermaCantidad, double envasesSueltos) throws SQLException {
        String sql = "{CALL sp_gestionar_consumo_envase(?, ?, ?)}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, idOrden);
            cs.setDouble(2, mermaCantidad);
            cs.setDouble(3, envasesSueltos);

            cs.execute();
        }
    }

    @Override
    public void registrarLotes(int idOrden, List<Map<String, Object>> lotes) throws SQLException {
        String sql = "{CALL sp_reg_lote(?, ?, ?, ?)}";

        int idArticuloProducido = obtenerIdArticuloProducidoPorOrden(idOrden);

        try (Connection conn = getConnection()) {
            conn.setAutoCommit(false);
            try (CallableStatement cs = conn.prepareCall(sql)) {

                for (Map<String, Object> lote : lotes) {
                    double cantidad = ((Number) lote.get("cantidad")).doubleValue();
                    String codigoLote = (String) lote.get("codigo_lote");
                    String fechaVencimientoStr = (String) lote.get("fecha_vencimiento");
                    Date fechaVencimientoSql = fechaVencimientoStr != null ? Date.valueOf(fechaVencimientoStr) : null;

                    if (codigoLote == null || codigoLote.isEmpty()) {
                        codigoLote = generarCodigoLoteDB(idArticuloProducido);
                    }

                    cs.setInt(1, idOrden);
                    cs.setDouble(2, cantidad);
                    cs.setString(3, codigoLote);
                    cs.setDate(4, fechaVencimientoSql);
                    cs.execute();
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

        try (Connection conn = getConnection(); CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idOrden);
            cs.execute();
        }
    }

    @Override
    public List<String> obtenerPresentacionesPorProductoMaestro(int idProductoMaestro) throws SQLException {
        List<String> presentaciones = new ArrayList<>();
        String sql = "{CALL sp_obtener_presentaciones_por_pm(?)}";

        try (Connection conn = getConnection(); CallableStatement cs = conn.prepareCall(sql)) {
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

        try (Connection conn = getConnection(); CallableStatement cs = conn.prepareCall(sql)) {
            cs.setString(1, busqueda);

            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> articulo = new LinkedHashMap<>();
                    try { articulo.put("id", rs.getInt("id")); } catch (SQLException e) { try { articulo.put("id", rs.getInt("id_articulo")); } catch (SQLException e2) { articulo.put("id", 0); } }
                    try { articulo.put("codigo", rs.getString("codigo")); } catch (SQLException e) { articulo.put("codigo", ""); }
                    try { articulo.put("descripcion", rs.getString("descripcion")); } catch (SQLException e) { articulo.put("descripcion", "Artículo Desconocido"); }
                    try { articulo.put("nombre_generico", rs.getString("nombre_generico")); } catch (SQLException e) { }
                    try { articulo.put("id_producto_maestro", rs.getInt("id_producto_maestro")); } catch (SQLException e) { }
                    try { articulo.put("id_unidad", rs.getInt("id_unidad")); } catch (SQLException e) { articulo.put("id_unidad", 0); }
                    try { articulo.put("unidad_nombre", rs.getString("unidad_nombre")); } catch (SQLException e) {
                        try { articulo.put("unidad_nombre", rs.getString("unidad")); } catch (SQLException e2) {
                            articulo.put("unidad_nombre", "UND");
                        }
                    }

                    try { articulo.put("presentacion_detalle", rs.getString("presentacion_detalle")); } catch (SQLException e) { }
                    try { articulo.put("cantidad", rs.getInt("cantidad")); } catch (SQLException e) { }
                    try { articulo.put("precio_compra", rs.getDouble("precio_compra")); } catch (SQLException e) { }
                    try { articulo.put("precio_venta", rs.getDouble("precio_venta")); } catch (SQLException e) { }
                    try { articulo.put("peso_unitario", rs.getDouble("peso_unitario")); } catch (SQLException e) { }
                    try { articulo.put("aroma", rs.getString("aroma")); } catch (SQLException e) { }
                    try { articulo.put("color", rs.getString("color")); } catch (SQLException e) { }

                    try { articulo.put("densidad", rs.getDouble("densidad")); } catch (SQLException e) { articulo.put("densidad", 1.0); }
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