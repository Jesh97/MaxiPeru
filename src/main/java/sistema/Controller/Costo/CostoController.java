package sistema.Controller.Costo;

import sistema.Ejecucion.Conexion;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class CostoController {

    public int guardarConfig(String nombre, String dataJson) throws SQLException {
        if (nombre == null || nombre.isBlank() || dataJson == null) {
            throw new SQLException("Datos inválidos");
        }
        Connection c = Conexion.obtenerConexion();
        if (c == null) {
            throw new SQLException("Sin conexión");
        }
        try (c) {
            String sql = "INSERT INTO costo_config (nombre, data_json) VALUES (?, ?)";
            try (PreparedStatement ps = c.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, nombre.trim());
                ps.setString(2, dataJson);
                ps.executeUpdate();
                try (ResultSet g = ps.getGeneratedKeys()) {
                    if (g.next()) {
                        return g.getInt(1);
                    }
                }
            }
        }
        return 0;
    }

    public String cargarConfig(int id) throws SQLException {
        Connection c = Conexion.obtenerConexion();
        if (c == null) {
            throw new SQLException("Sin conexión");
        }
        try (c) {
            String sql = "SELECT data_json FROM costo_config WHERE id = ?";
            try (PreparedStatement ps = c.prepareStatement(sql)) {
                ps.setInt(1, id);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        return rs.getString("data_json");
                    }
                }
            }
        }
        return null;
    }

    public List<Map<String, Object>> listarResumenes() throws SQLException {
        List<Map<String, Object>> lista = new ArrayList<>();
        Connection c = Conexion.obtenerConexion();
        if (c == null) {
            throw new SQLException("Sin conexión");
        }
        try (c) {
            String sql = "SELECT id, nombre, fecha_creacion FROM costo_config ORDER BY id DESC LIMIT 100";
            try (PreparedStatement ps = c.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", rs.getInt("id"));
                    row.put("nombre", rs.getString("nombre"));
                    row.put("fecha", rs.getTimestamp("fecha_creacion") != null
                            ? rs.getTimestamp("fecha_creacion").toString() : "");
                    lista.add(row);
                }
            }
        }
        return lista;
    }

    /** Primer artículo terminado (tipo 1) con producto maestro y receta activa, para precargar la pantalla. */
    public Map<String, Object> primerArticuloTerminadoConReceta() throws SQLException {
        Map<String, Object> row = new LinkedHashMap<>();
        Connection c = Conexion.obtenerConexion();
        if (c == null) {
            throw new SQLException("Sin conexión");
        }
        try (c) {
            String sql = "SELECT a.id, a.descripcion FROM articulo a "
                    + "WHERE a.id_tipo_articulo = 1 AND a.id_producto_maestro IS NOT NULL "
                    + "AND EXISTS (SELECT 1 FROM receta_producto rp "
                    + "  INNER JOIN detalle_receta dr ON dr.id_receta = rp.id_receta "
                    + "  WHERE rp.id_producto_maestro = a.id_producto_maestro AND rp.estado = 'Activa') "
                    + "ORDER BY a.id ASC LIMIT 1";
            try (PreparedStatement ps = c.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    row.put("id", rs.getInt("id"));
                    row.put("descripcion", rs.getString("descripcion"));
                }
            }
        }
        return row.isEmpty() ? null : row;
    }

    /**
     * Insumos de la receta activa del artículo terminado + litros de lote base para costo granel.
     */
    public Map<String, Object> insumosParaCostoPorArticulo(int idArticulo) throws SQLException {
        Map<String, Object> result = new LinkedHashMap<>();
        List<Map<String, Object>> insumos = new ArrayList<>();
        result.put("insumos", insumos);
        result.put("id_receta", 0);
        result.put("litros_lote_base", 240.0);
        result.put("nombre_producto", "");
        result.put("ok", true);

        Connection c = Conexion.obtenerConexion();
        if (c == null) {
            throw new SQLException("Sin conexión");
        }
        try (c) {
            String qReceta = "SELECT art.descripcion AS nombre_producto, rp.id_receta, rp.cantidad_producir, "
                    + "up.abreviatura AS ab_prod, up.nombre AS nom_prod_unidad "
                    + "FROM articulo art "
                    + "INNER JOIN receta_producto rp ON rp.id_producto_maestro = art.id_producto_maestro AND rp.estado = 'Activa' "
                    + "INNER JOIN unidad_medida up ON up.id_unidad = rp.id_unidad_producir "
                    + "WHERE art.id = ? AND art.id_producto_maestro IS NOT NULL "
                    + "AND rp.id_receta = (SELECT MAX(rp2.id_receta) FROM receta_producto rp2 "
                    + "  WHERE rp2.id_producto_maestro = art.id_producto_maestro AND rp2.estado = 'Activa')";

            int idReceta = 0;
            double litrosBase = 240.0;
            String nombreProducto = "";

            try (PreparedStatement ps = c.prepareStatement(qReceta)) {
                ps.setInt(1, idArticulo);
                try (ResultSet rs = ps.executeQuery()) {
                    if (!rs.next()) {
                        result.put("ok", false);
                        result.put("mensaje", "No hay receta activa para este artículo. Defínala en Producción.");
                        return result;
                    }
                    nombreProducto = rs.getString("nombre_producto");
                    idReceta = rs.getInt("id_receta");
                    double cantProd = rs.getDouble("cantidad_producir");
                    String abProd = rs.getString("ab_prod");
                    String nomU = rs.getString("nom_prod_unidad");
                    String upTxt = ((abProd != null ? abProd : "") + " " + (nomU != null ? nomU : "")).toUpperCase().trim();
                    if (upTxt.contains("LITRO") || upTxt.equals("L") || upTxt.startsWith("LT ")
                            || upTxt.endsWith(" L") || upTxt.contains(" LT")) {
                        litrosBase = cantProd > 0 ? cantProd : 240.0;
                    }
                }
            }

            result.put("id_receta", idReceta);
            result.put("litros_lote_base", litrosBase);
            result.put("nombre_producto", nombreProducto != null ? nombreProducto : "");

            String qDet = "SELECT a.codigo, a.descripcion, COALESCE(NULLIF(a.densidad, 0), 1) AS dens, "
                    + "COALESCE(a.precio_compra, 0) AS precio_compra, dr.cantidad_requerida, "
                    + "um.abreviatura AS u_ins, um.nombre AS u_ins_nombre "
                    + "FROM detalle_receta dr "
                    + "INNER JOIN articulo a ON a.id = dr.id_articulo_insumo "
                    + "INNER JOIN unidad_medida um ON um.id_unidad = dr.id_unidad_insumo "
                    + "WHERE dr.id_receta = ? ORDER BY dr.id_detalle_receta";

            try (PreparedStatement ps = c.prepareStatement(qDet)) {
                ps.setInt(1, idReceta);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        double dens = rs.getDouble("dens");
                        if (dens <= 0) {
                            dens = 1.0;
                        }
                        double precioKg = rs.getDouble("precio_compra");
                        double cantReq = rs.getDouble("cantidad_requerida");
                        String uIns = rs.getString("u_ins");
                        if (uIns == null) {
                            uIns = "";
                        }
                        String uNom = rs.getString("u_ins_nombre");
                        if (uNom == null) {
                            uNom = "";
                        }
                        String ul = (uIns + " " + uNom).toLowerCase();
                        double cilL;
                        if (ul.contains("ml") && !ul.contains("kg") && !ul.contains("kilo")) {
                            cilL = cantReq / 1000.0;
                        } else if (ul.contains("litro") || ul.trim().equals("l")
                                || ul.startsWith("l ") || ul.contains(" lt") || ul.endsWith(" l")) {
                            cilL = cantReq;
                        } else {
                            cilL = cantReq / dens;
                        }

                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("cod", rs.getString("codigo"));
                        row.put("nombre", rs.getString("descripcion"));
                        row.put("dens", dens);
                        row.put("costoKg", precioKg);
                        row.put("cilL", cilL);
                        insumos.add(row);
                    }
                }
            }
        }
        return result;
    }
}
