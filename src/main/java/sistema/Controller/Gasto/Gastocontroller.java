package sistema.Controller.Gasto;

import sistema.Ejecucion.Conexion;
import sistema.Modelo.Gasto.DetalleGasto;
import sistema.Modelo.Gasto.Gasto;

import java.sql.*;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;

public class Gastocontroller {

    private Connection getConnection() throws SQLException {
        Connection conn = Conexion.obtenerConexion();
        if (conn == null) {
            throw new SQLException("No se pudo abrir la conexion con la base de datos.");
        }
        return conn;
    }

    public int buscarProveedorIdPorRucONombre(String valorProveedor) throws SQLException {
        if (valorProveedor == null) {
            return 0;
        }

        String valor = valorProveedor.trim();
        if (valor.isEmpty()) {
            return 0;
        }

        // Si viene formato "RUC - Razon Social", intenta primero por RUC.
        if (valor.contains("-")) {
            String posibleRuc = valor.split("-", 2)[0].trim();
            int idPorRuc = buscarProveedorIdPorRuc(posibleRuc);
            if (idPorRuc > 0) {
                return idPorRuc;
            }
        }

        // Si ingresa solo numero, puede ser ID o RUC.
        if (valor.matches("\\d+")) {
            int idPorNumero = buscarProveedorIdPorIdOPorRuc(valor);
            if (idPorNumero > 0) {
                return idPorNumero;
            }
        }

        String sqlNombre = """
                SELECT id
                FROM proveedor
                WHERE UPPER(razonSocial) = UPPER(?)
                   OR UPPER(razonSocial) LIKE CONCAT('%', UPPER(?), '%')
                LIMIT 1
                """;
        try (Connection conn = getConnection();
                PreparedStatement ps = conn.prepareStatement(sqlNombre)) {
            ps.setString(1, valor);
            ps.setString(2, valor);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id");
                }
            }
        }
        return 0;
    }

    public int buscarOCrearProveedorPorTexto(String valorProveedor) throws SQLException {
        int id = buscarProveedorIdPorRucONombre(valorProveedor);
        if (id > 0) {
            return id;
        }

        String valor = valorProveedor == null ? "" : valorProveedor.trim();
        // Solo autocrear cuando viene un RUC numerico (8 a 20 digitos).
        if (valor.matches("\\d{8,20}")) {
            String sql = """
                    INSERT INTO proveedor (ruc, razonSocial, direccion, telefono, correo, ciudad)
                    VALUES (?, ?, '', '', '', '')
                    """;
            try (Connection conn = getConnection();
                    PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, valor);
                ps.setString(2, "PROVEEDOR " + valor);
                ps.executeUpdate();
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        return rs.getInt(1);
                    }
                }
            }
        }

        return 0;
    }

    private int buscarProveedorIdPorRuc(String ruc) throws SQLException {
        String sql = "SELECT id FROM proveedor WHERE ruc = ? LIMIT 1";
        try (Connection conn = getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, ruc);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id");
                }
            }
        }
        return 0;
    }

    private int buscarProveedorIdPorIdOPorRuc(String numero) throws SQLException {
        String sql = """
                SELECT id
                FROM proveedor
                WHERE id = ? OR ruc = ?
                LIMIT 1
                """;
        try (Connection conn = getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            int idIngresado;
            try {
                idIngresado = Integer.parseInt(numero);
            } catch (NumberFormatException e) {
                idIngresado = -1;
            }
            ps.setInt(1, idIngresado);
            ps.setString(2, numero);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id");
                }
            }
        }
        return 0;
    }

    public int buscarTipoGastoIdPorNombre(String nombreTipo) throws SQLException {
        String nombreNormalizado = normalizarTexto(nombreTipo);
        if (nombreNormalizado.isEmpty()) {
            return 0;
        }

        String sql = """
                SELECT id_tipo_gasto
                FROM tipo_gasto
                WHERE UPPER(nombre) = UPPER(?)
                   OR UPPER(nombre) LIKE CONCAT('%', UPPER(?), '%')
                LIMIT 1
                """;
        try (Connection conn = getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, nombreTipo);
            ps.setString(2, nombreTipo);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id_tipo_gasto");
                }
            }
        }

        // Fallback tolerante para variaciones como "Gasto/Gastos", acentos, etc.
        String sqlAll = "SELECT id_tipo_gasto, nombre FROM tipo_gasto";
        try (Connection conn = getConnection();
                PreparedStatement ps = conn.prepareStatement(sqlAll);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                String nombreDb = rs.getString("nombre");
                String dbNormalizado = normalizarTexto(nombreDb);
                if (dbNormalizado.equals(nombreNormalizado)
                        || dbNormalizado.contains(nombreNormalizado)
                        || nombreNormalizado.contains(dbNormalizado)) {
                    return rs.getInt("id_tipo_gasto");
                }
            }
        }
        return 0;
    }

    public int buscarOCrearTipoGastoPorNombre(String nombreTipo) throws SQLException {
        int id = buscarTipoGastoIdPorNombre(nombreTipo);
        if (id > 0) {
            return id;
        }

        String limpio = nombreTipo == null ? "" : nombreTipo.trim();
        if (limpio.isEmpty()) {
            return 0;
        }

        String sqlInsert = "INSERT INTO tipo_gasto (nombre) VALUES (?)";
        try (Connection conn = getConnection();
                PreparedStatement ps = conn.prepareStatement(sqlInsert, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, limpio);
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            // Si ya existia (race/constraint), reintenta buscar.
            int reintento = buscarTipoGastoIdPorNombre(limpio);
            if (reintento > 0) {
                return reintento;
            }
            throw e;
        }
        return 0;
    }

    public int buscarTipoComprobanteIdPorNombre(String nombreComprobante) throws SQLException {
        String limpio = nombreComprobante == null ? "" : nombreComprobante.trim();
        if (limpio.isEmpty()) {
            return 0;
        }

        String canonico = normalizarTipoComprobante(limpio);

        String sql = """
                SELECT id
                FROM tipo_comprobante
                WHERE UPPER(nombre) = UPPER(?)
                   OR UPPER(nombre) LIKE CONCAT('%', UPPER(?), '%')
                LIMIT 1
                """;
        try (Connection conn = getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, limpio);
            ps.setString(2, limpio);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id");
                }
            }
        }

        String sqlAll = "SELECT id, nombre FROM tipo_comprobante";
        try (Connection conn = getConnection();
                PreparedStatement ps = conn.prepareStatement(sqlAll);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                String db = rs.getString("nombre");
                String dbCanon = normalizarTipoComprobante(db);
                if (dbCanon.equals(canonico) || dbCanon.contains(canonico) || canonico.contains(dbCanon)) {
                    return rs.getInt("id");
                }
            }
        }
        return 0;
    }

    public int buscarOCrearTipoComprobantePorNombre(String nombreComprobante) throws SQLException {
        int id = buscarTipoComprobanteIdPorNombre(nombreComprobante);
        if (id > 0) {
            return id;
        }

        String limpio = nombreComprobante == null ? "" : nombreComprobante.trim();
        if (limpio.isEmpty()) {
            return 0;
        }

        String nombreInsert = nombreComprobanteCanonicoParaBD(limpio);
        String sqlInsert = "INSERT INTO tipo_comprobante (nombre) VALUES (?)";
        try (Connection conn = getConnection();
                PreparedStatement ps = conn.prepareStatement(sqlInsert, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, nombreInsert);
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            int reintento = buscarTipoComprobanteIdPorNombre(limpio);
            if (reintento > 0) {
                return reintento;
            }
            throw e;
        }

        return 0;
    }

    public int buscarUnidadIdPorAbreviatura(String abreviatura) throws SQLException {
        String valor = abreviatura == null ? "" : abreviatura.trim();
        if (valor.isEmpty()) {
            return 0;
        }

        String canonica = normalizarUnidad(valor);
        String sql = """
                SELECT id_unidad
                FROM unidad_medida
                WHERE UPPER(abreviatura) = UPPER(?)
                LIMIT 1
                """;
        try (Connection conn = getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, valor);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id_unidad");
                }
            }
        }

        String sqlFlexible = """
                SELECT id_unidad, nombre, abreviatura
                FROM unidad_medida
                """;
        try (Connection conn = getConnection();
                PreparedStatement ps = conn.prepareStatement(sqlFlexible);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                String dbAbrev = rs.getString("abreviatura");
                String dbNombre = rs.getString("nombre");
                String dbCanon = normalizarUnidad(dbAbrev + " " + dbNombre);
                if (dbCanon.equals(canonica) || dbCanon.contains(canonica) || canonica.contains(dbCanon)) {
                    return rs.getInt("id_unidad");
                }
            }
        }

        // Autocrea la unidad para no bloquear el registro del gasto.
        String nombreNueva = nombreUnidadCanonico(valor);
        String abrevNueva = abreviaturaUnidadCanonica(valor);
        String sqlInsert = """
                INSERT INTO unidad_medida (nombre, abreviatura, factor_a_kg)
                VALUES (?, ?, 1.00000000)
                """;
        try (Connection conn = getConnection();
                PreparedStatement ps = conn.prepareStatement(sqlInsert, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, nombreNueva);
            ps.setString(2, abrevNueva);
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            // Si choca por UNIQUE, reintenta la búsqueda.
            String sqlRetry = """
                    SELECT id_unidad
                    FROM unidad_medida
                    WHERE UPPER(abreviatura) = UPPER(?)
                       OR UPPER(nombre) = UPPER(?)
                    LIMIT 1
                    """;
            try (Connection conn = getConnection();
                    PreparedStatement ps = conn.prepareStatement(sqlRetry)) {
                ps.setString(1, abrevNueva);
                ps.setString(2, nombreNueva);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        return rs.getInt("id_unidad");
                    }
                }
            }
            throw e;
        }
        return 0;
    }

    public List<Gasto> listarTodos() throws SQLException {
        List<Gasto> lista = new ArrayList<>();

        String sql = "SELECT * FROM gasto ORDER BY id_gasto DESC";

        try (Connection conn = getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Gasto g = new Gasto();

                g.setIdGasto(rs.getInt("id_gasto"));
                g.setIdProveedor(rs.getInt("id_proveedor"));
                g.setIdTipoGasto(rs.getInt("id_tipo_gasto"));
                g.setMotivo(rs.getString("motivo"));
                g.setPlaca(rs.getString("placa"));
                g.setFecha(rs.getDate("fecha").toLocalDate());
                g.setIdMoneda(rs.getInt("id_moneda"));
                g.setSubtotal(rs.getDouble("subtotal"));
                g.setIgv(rs.getDouble("igv"));
                g.setTotal(rs.getDouble("total"));
                g.setObservacion(rs.getString("observacion"));
                g.setTotalPeso(rs.getDouble("total_peso"));

                lista.add(g);
            }
        }

        return lista;
    }

    public int resolverMonedaIdValida(int idMonedaSolicitada) throws SQLException {
        int idSolicitado = idMonedaSolicitada > 0 ? idMonedaSolicitada : 1;

        String sqlExiste = "SELECT id_moneda FROM moneda WHERE id_moneda = ? LIMIT 1";
        try (Connection conn = getConnection();
                PreparedStatement ps = conn.prepareStatement(sqlExiste)) {
            ps.setInt(1, idSolicitado);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id_moneda");
                }
            }
        }

        String sqlPrimera = "SELECT id_moneda FROM moneda ORDER BY id_moneda ASC LIMIT 1";
        try (Connection conn = getConnection();
                PreparedStatement ps = conn.prepareStatement(sqlPrimera);
                ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getInt("id_moneda");
            }
        }

        String sqlInsert = """
                INSERT INTO moneda (id_moneda, nombre, simbolo)
                VALUES (?, 'Soles', 'S/')
                """;
        try (Connection conn = getConnection();
                PreparedStatement ps = conn.prepareStatement(sqlInsert)) {
            ps.setInt(1, idSolicitado);
            ps.executeUpdate();
            return idSolicitado;
        } catch (SQLException e) {
            // Si hubo conflicto al insertar, intenta recuperar una moneda existente.
            try (Connection conn = getConnection();
                    PreparedStatement ps = conn.prepareStatement(sqlPrimera);
                    ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id_moneda");
                }
            }
            throw e;
        }
    }

    private String normalizarTexto(String texto) {
        if (texto == null) {
            return "";
        }
        String t = texto.trim().toLowerCase();
        t = Normalizer.normalize(t, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        t = t.replaceAll("\\bgastos\\b", "gasto");
        t = t.replaceAll("\\s+", " ");
        return t;
    }

    private String normalizarTipoComprobante(String texto) {
        String t = normalizarTexto(texto);
        if (t.contains("boleta")) {
            return "boleta";
        }
        if (t.contains("factura")) {
            return "factura";
        }
        if (t.contains("recibo")) {
            return "recibo";
        }
        return t;
    }

    private String nombreComprobanteCanonicoParaBD(String texto) {
        String t = normalizarTipoComprobante(texto);
        if ("boleta".equals(t)) {
            return "Boleta de Venta";
        }
        if ("factura".equals(t)) {
            return "Factura";
        }
        if ("recibo".equals(t)) {
            return "Recibo por Honorarios";
        }
        return texto.trim();
    }

    private String normalizarUnidad(String texto) {
        String t = normalizarTexto(texto);
        t = t.replace("unidad", "und");
        t = t.replace("unidades", "und");
        t = t.replace("unds", "und");
        if (t.equals("un")) {
            return "und";
        }
        return t;
    }

    private String nombreUnidadCanonico(String texto) {
        String t = normalizarUnidad(texto);
        if (t.contains("kg"))
            return "Kilogramo";
        if (t.contains("lt"))
            return "Litro";
        if (t.contains("gl"))
            return "Galon";
        if (t.contains("und"))
            return "Unidad";
        return "Unidad";
    }

    private String abreviaturaUnidadCanonica(String texto) {
        String t = normalizarUnidad(texto);
        if (t.contains("kg"))
            return "Kg";
        if (t.contains("lt"))
            return "Lt";
        if (t.contains("gl"))
            return "Gl";
        if (t.contains("und"))
            return "Und";
        return "Und";
    }

    /**
     * Registra un gasto cabecera + sus detalles en una sola transacción.
     * 
     * @return ID del gasto recién insertado.
     */
    public int registrarGasto(Gasto gasto, List<DetalleGasto> detalles) throws SQLException {
        String sqlGasto = """
                INSERT INTO gasto
                    (id_proveedor, id_tipo_gasto, motivo, placa, fecha, id_moneda,
                    subtotal, igv, total, observacion, total_peso)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

        String sqlDetalle = """
                INSERT INTO detalle_gasto
                    (id_gasto, descripcion, cantidad, id_unidad, peso_unitario, precio_unitario, subtotal, igv, total)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

        String sqlDocumento = """
                INSERT INTO documento_gasto
                    (id_gasto, id_tipo_comprobante, serie, correlativo, fecha_emision)
                VALUES (?, ?, ?, ?, ?)
                """;

        Connection conn = getConnection();
        try {
            conn.setAutoCommit(false);

            int idGasto;
            try (PreparedStatement ps = conn.prepareStatement(sqlGasto, Statement.RETURN_GENERATED_KEYS)) {

                ps.setInt(1, gasto.getIdProveedor());
                ps.setInt(2, gasto.getIdTipoGasto());
                ps.setString(3, gasto.getMotivo());
                ps.setString(4, gasto.getPlaca());
                ps.setDate(5, Date.valueOf(gasto.getFecha()));
                ps.setInt(6, gasto.getIdMoneda());

                ps.setDouble(7, gasto.getSubtotal());
                ps.setDouble(8, gasto.getIgv());
                ps.setDouble(9, gasto.getTotal());
                ps.setString(10, gasto.getObservacion());

                ps.setDouble(11, gasto.getTotalPeso());

                ps.executeUpdate();

                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        idGasto = rs.getInt(1);
                    } else {
                        throw new SQLException("No se pudo obtener el ID del gasto registrado.");
                    }
                }
            }

            try (PreparedStatement ps = conn.prepareStatement(sqlDocumento)) {
                ps.setInt(1, idGasto);
                ps.setInt(2, gasto.getIdTipoComprobante());
                ps.setString(3, gasto.getSerieComprobante());
                ps.setString(4, gasto.getCorrelativoComprobante());
                ps.setDate(5, Date.valueOf(gasto.getFecha()));
                ps.executeUpdate();
            }

            try (PreparedStatement ps = conn.prepareStatement(sqlDetalle)) {
                for (DetalleGasto d : detalles) {
                    ps.setInt(1, idGasto);
                    ps.setString(2, d.getDescripcion());
                    ps.setDouble(3, d.getCantidad());
                    ps.setInt(4, d.getIdUnidad());
                    ps.setDouble(5, d.getPesoUnitario());
                    ps.setDouble(6, d.getPrecioUnitario());
                    ps.setDouble(7, d.getSubtotal());
                    ps.setDouble(8, d.getIgv());
                    ps.setDouble(9, d.getTotal());

                    ps.addBatch();
                }
                ps.executeBatch();
            }
            conn.commit();
            return idGasto;

        } catch (SQLException e) {
            conn.rollback();
            throw e;
        } finally {
            conn.setAutoCommit(true);
            conn.close();
        }
    }
}