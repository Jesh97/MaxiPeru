package sistema.Controller.Dashboard;

import sistema.Ejecucion.Conexion;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class DashboardResumenController {

    public Map<String, Object> construirResumen() {
        Map<String, Object> root = new LinkedHashMap<>();
        Connection conn = Conexion.obtenerConexion();
        if (conn == null) {
            root.put("error", "Sin conexión a la base de datos.");
            return root;
        }
        try (conn) {
            boolean tieneStockMinimo = columnaExiste(conn, "articulo", "stock_minimo");
            if (!tieneStockMinimo) {
                root.put("aviso",
                        "Para ver alertas de stock mínimo, ejecute en MySQL el script: migrations/articulo_stock_minimo.sql "
                                + "(añade la columna stock_minimo a la tabla articulo).");
            }
            root.put("kpis", leerKpis(conn, tieneStockMinimo));
            root.put("stockMinimo", leerStockMinimo(conn, tieneStockMinimo));
            root.put("lotesPorVencer", leerLotesPorVencer(conn));
        } catch (SQLException e) {
            e.printStackTrace();
            root.put("error", "Error al leer el dashboard: " + e.getMessage());
        }
        return root;
    }

    private boolean columnaExiste(Connection conn, String tabla, String columna) throws SQLException {
        String sql = "SELECT COUNT(*) FROM information_schema.COLUMNS "
                + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, tabla);
            ps.setString(2, columna);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() && rs.getInt(1) > 0;
            }
        }
    }

    private Map<String, Object> leerKpis(Connection conn, boolean tieneStockMinimo) throws SQLException {
        Map<String, Object> k = new LinkedHashMap<>();
        int critico = 0;
        int bajo = 0;
        if (tieneStockMinimo) {
            critico = contar(conn,
                    "SELECT COUNT(*) FROM articulo WHERE COALESCE(stock_minimo,0) > 0 AND cantidad < (stock_minimo * 0.5)");
            bajo = contar(conn,
                    "SELECT COUNT(*) FROM articulo WHERE COALESCE(stock_minimo,0) > 0 "
                            + "AND cantidad >= (stock_minimo * 0.5) AND cantidad < stock_minimo");
        }
        int lotes = contar(conn,
                "SELECT COUNT(*) FROM inventario_lote WHERE fecha_vencimiento IS NOT NULL "
                        + "AND fecha_vencimiento > CURDATE() AND fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) "
                        + "AND COALESCE(cantidad_disponible,0) > 0");

        BigDecimal ventasMes = sumaDecimal(conn,
                "SELECT COALESCE(SUM(total_final),0) FROM venta WHERE fecha_emision >= DATE_FORMAT(CURDATE(), '%Y-%m-01') "
                        + "AND fecha_emision < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH) "
                        + "AND (estado_venta IS NULL OR UPPER(TRIM(estado_venta)) NOT LIKE '%ANUL%')");
        BigDecimal ventasMesAnt = sumaDecimal(conn,
                "SELECT COALESCE(SUM(total_final),0) FROM venta WHERE fecha_emision >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH) "
                        + "AND fecha_emision < DATE_FORMAT(CURDATE(), '%Y-%m-01') "
                        + "AND (estado_venta IS NULL OR UPPER(TRIM(estado_venta)) NOT LIKE '%ANUL%')");

        k.put("stockCritico", critico);
        k.put("stockCriticoSub", tieneStockMinimo ? "Bajo el 50% del stock mínimo" : "Requiere columna stock_minimo");
        k.put("stockBajo", bajo);
        k.put("stockBajoSub", tieneStockMinimo ? "Por debajo del mínimo (sin ser crítico)" : "Requiere columna stock_minimo");
        k.put("lotesVencer", lotes);
        k.put("lotesVencerSub", "En los próximos 30 días");
        k.put("ventasMes", ventasMes);
        k.put("ventasMesFormatted", formatSoles(ventasMes));
        k.put("ventasMesSub", textoVariacionVentas(ventasMes, ventasMesAnt));
        return k;
    }

    private String textoVariacionVentas(BigDecimal actual, BigDecimal anterior) {
        if (anterior == null || anterior.compareTo(BigDecimal.ZERO) == 0) {
            if (actual != null && actual.compareTo(BigDecimal.ZERO) > 0) {
                return "Sin ventas el mes anterior para comparar";
            }
            return "Sin ventas registradas este mes";
        }
        BigDecimal pct = actual.subtract(anterior)
                .multiply(new BigDecimal("100"))
                .divide(anterior, 0, RoundingMode.HALF_UP);
        if (pct.compareTo(BigDecimal.ZERO) >= 0) {
            return "+" + pct.intValue() + "% vs mes anterior";
        }
        return pct.intValue() + "% vs mes anterior";
    }

    private static String formatSoles(BigDecimal m) {
        if (m == null) {
            m = BigDecimal.ZERO;
        }
        DecimalFormatSymbols sym = DecimalFormatSymbols.getInstance(new Locale("es", "PE"));
        DecimalFormat df = new DecimalFormat("#,##0", sym);
        return "S/ " + df.format(m.setScale(0, RoundingMode.HALF_UP));
    }

    private List<Map<String, Object>> leerStockMinimo(Connection conn, boolean tieneStockMinimo) throws SQLException {
        List<Map<String, Object>> rows = new ArrayList<>();
        if (!tieneStockMinimo) {
            return rows;
        }
        String sql = "SELECT a.descripcion, COALESCE(c.nombre,'—') AS categoria, COALESCE(u.abreviatura, u.nombre, '—') AS unidad, "
                + "CAST(a.cantidad AS DECIMAL(14,4)) AS actual, CAST(a.stock_minimo AS DECIMAL(14,4)) AS minimo, "
                + "CASE WHEN COALESCE(a.stock_minimo,0) <= 0 THEN 'Sin mínimo' "
                + "WHEN a.cantidad < (a.stock_minimo * 0.5) THEN 'Crítico' "
                + "WHEN a.cantidad < a.stock_minimo THEN 'Bajo' ELSE 'OK' END AS estado "
                + "FROM articulo a "
                + "LEFT JOIN categoria c ON a.id_categoria = c.id_categoria "
                + "LEFT JOIN unidad_medida u ON a.id_unidad = u.id_unidad "
                + "WHERE COALESCE(a.stock_minimo,0) > 0 "
                + "ORDER BY (a.cantidad / NULLIF(a.stock_minimo,0)) ASC, a.descripcion ASC LIMIT 40";
        try (PreparedStatement ps = conn.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("descripcion", rs.getString("descripcion"));
                row.put("categoria", rs.getString("categoria"));
                row.put("unidad", rs.getString("unidad"));
                row.put("actual", rs.getBigDecimal("actual"));
                row.put("minimo", rs.getBigDecimal("minimo"));
                row.put("estado", rs.getString("estado"));
                rows.add(row);
            }
        }
        return rows;
    }

    private List<Map<String, Object>> leerLotesPorVencer(Connection conn) throws SQLException {
        String sql = "SELECT art.descripcion, il.codigo_lote, CAST(il.cantidad_disponible AS DECIMAL(14,4)) AS cantidad, "
                + "COALESCE(u.abreviatura, u.nombre, '') AS unidad, il.fecha_vencimiento, "
                + "DATEDIFF(il.fecha_vencimiento, CURDATE()) AS dias "
                + "FROM inventario_lote il "
                + "INNER JOIN articulo art ON il.id_articulo = art.id "
                + "LEFT JOIN unidad_medida u ON art.id_unidad = u.id_unidad "
                + "WHERE il.fecha_vencimiento IS NOT NULL "
                + "AND il.fecha_vencimiento > CURDATE() AND il.fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) "
                + "AND COALESCE(il.cantidad_disponible,0) > 0 "
                + "ORDER BY il.fecha_vencimiento ASC LIMIT 30";
        List<Map<String, Object>> rows = new ArrayList<>();
        try (PreparedStatement ps = conn.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("descripcion", rs.getString("descripcion"));
                row.put("codigoLote", rs.getString("codigo_lote"));
                row.put("cantidad", rs.getBigDecimal("cantidad"));
                row.put("unidad", rs.getString("unidad"));
                row.put("dias", rs.getInt("dias"));
                row.put("fechaVencimiento", rs.getDate("fecha_vencimiento") != null
                        ? rs.getDate("fecha_vencimiento").toString() : null);
                rows.add(row);
            }
        }
        return rows;
    }

    private int contar(Connection conn, String sql) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getInt(1);
            }
        }
        return 0;
    }

    private BigDecimal sumaDecimal(Connection conn, String sql) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                BigDecimal v = rs.getBigDecimal(1);
                return v != null ? v : BigDecimal.ZERO;
            }
        }
        return BigDecimal.ZERO;
    }
}
