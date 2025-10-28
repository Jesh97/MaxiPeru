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
        int sufijo = 100 + random.nextInt(899);
        return "LOTE-" + fecha + "-" + sufijo;
    }

    @Override
    public int crearReceta(int idArtTer, String descripcion, BigDecimal cantProd, int idUniProd) throws SQLException {
        int idReceta = -1;
        String sql = "{CALL sp_crear_receta(?, ?, ?, ?)}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, idArtTer);
            cs.setString(2, descripcion);
            cs.setBigDecimal(3, cantProd);
            cs.setInt(4, idUniProd);

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

    @Override
    public int crearOrden(int idReceta, BigDecimal cantProd, String fechaIni, String obs) throws SQLException {
        int idOrden = -1;
        String sql = "{CALL sp_crear_orden(?, ?, ?, ?)}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, idReceta);
            cs.setBigDecimal(2, cantProd);

            cs.setDate(3, fechaIni != null ? java.sql.Date.valueOf(fechaIni) : null);

            cs.setString(4, obs);

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
    public void gestionarConsumoEnvase(int idOrden, BigDecimal cantAEmpacar) throws SQLException {
        String sql = "{CALL sp_gestionar_consumo_envase(?, ?)}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, idOrden);
            cs.setBigDecimal(2, cantAEmpacar);
            cs.execute();
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
                    String fechaVencimiento = (String) lote.get("fecha_vencimiento");

                    if (codigoLote == null || codigoLote.isEmpty()) {
                        codigoLote = generarCodigoLote();
                    }

                    cs.setInt(1, idOrden);
                    cs.setBigDecimal(2, cantidad);
                    cs.setString(3, codigoLote);

                    cs.setDate(4, fechaVencimiento != null ? java.sql.Date.valueOf(fechaVencimiento) : null);

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

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, idOrden);
            cs.execute();
        }
    }

    private List<Map<String, Object>> ejecutarBusqueda(String sql, String busqueda) throws SQLException {
        List<Map<String, Object>> articulos = new ArrayList<>();

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setString(1, busqueda);

            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> articulo = new LinkedHashMap<>();

                    try {
                        articulo.put("id", rs.getInt("id"));
                    } catch (SQLException e) {
                        try {
                            articulo.put("id", rs.getInt("id_articulo"));
                        } catch (SQLException e2) {
                            articulo.put("id", 0);
                        }
                    }

                    try {
                        articulo.put("codigo", rs.getString("codigo"));
                    } catch (SQLException e) { articulo.put("codigo", ""); }

                    try {
                        articulo.put("nombre", rs.getString("descripcion"));
                    } catch (SQLException e) { articulo.put("nombre", "Artículo Desconocido"); }

                    try {
                        articulo.put("unidad", rs.getString("unidad"));
                    } catch (SQLException e) {
                        articulo.put("unidad", "UND");
                    }

                    try {
                        articulo.put("densidad", rs.getDouble("densidad"));
                    } catch (SQLException e) {
                        articulo.put("densidad", 1.0);
                    }

                    try {
                        articulo.put("peso_unitario", rs.getDouble("peso_unitario"));
                    } catch (SQLException e) { }

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