package sistema.Controller.Compra;

import sistema.Ejecucion.Conexion;
import sistema.Modelo.Compra.*;
import sistema.repository.CompraRepository;
import java.sql.*;
import java.sql.Date;
import java.util.*;
import java.text.SimpleDateFormat; // Necesario para formatear fechas

public class CompraController implements CompraRepository {

    private Connection getConnection() throws SQLException {
        Connection conn = Conexion.obtenerConexion();
        if (conn == null) {
            throw new SQLException("No se pudo establecer la conexión a la base de datos.");
        }
        return conn;
    }

    // Formateador de fecha para dd-MM-yyyy
    private static final SimpleDateFormat DATE_FORMATTER = new SimpleDateFormat("dd-MM-yyyy");

    @Override
    public int registrarCompra(Compra compra, GuiaTransporte guia, DocumentoReferencia docRef,
                               List<DetalleCompra> detalles, List<Descuento> descuentos,
                               List<Caja> cajas, Map<Integer, List<DetalleCaja>> detallesCaja) throws SQLException {
        int idCompra = -1;

        try (Connection conn = getConnection()) {
            try {
                conn.setAutoCommit(false);

                idCompra = registrarCompraCabecera(conn, compra);

                if (compra.isHayTraslado() && guia != null) {
                    registrarGuia(conn, idCompra, guia);
                }

                if (docRef != null &&
                        (docRef.getNumeroCotizacion() != null || docRef.getNumeroPedido() != null)) {
                    registrarReferencia(conn, idCompra, docRef);
                }

                Map<Integer, Integer> tempIdToRealIdMap = new HashMap<>();
                if (detalles != null) {
                    for (DetalleCompra detalle : detalles) {
                        int tempDetalleId = detalle.getIdDetalle();
                        detalle.setIdCompra(idCompra);
                        int idDetalleReal = registrarDetalleCompra(conn, detalle);
                        tempIdToRealIdMap.put(tempDetalleId, idDetalleReal);
                    }
                }

                if (descuentos != null) {
                    for (Descuento d : descuentos) {
                        if ("item".equalsIgnoreCase(d.getNivel())) {
                            int realIdDetalle = tempIdToRealIdMap.getOrDefault(d.getIdDetalle(), -1);
                            if (realIdDetalle != -1) {
                                registrarDescuentoItem(conn, realIdDetalle, 0, d);
                            }
                        } else if ("global".equalsIgnoreCase(d.getNivel())) {
                            registrarDescuentoGlobal(conn, idCompra, 0, d);
                        }
                    }
                }

                if (cajas != null) {
                    for (Caja caja : cajas) {
                        int tempIdCaja = caja.getIdCajaCompra();
                        caja.setIdCompra(idCompra);
                        int idCajaReal = registrarCajaCompra(conn, caja);

                        if (detallesCaja != null && detallesCaja.containsKey(tempIdCaja)) {
                            for (DetalleCaja detCaja : detallesCaja.get(tempIdCaja)) {
                                detCaja.setIdCajaCompra(idCajaReal);
                                registrarDetalleCajaCompra(conn, detCaja);
                            }
                        }
                    }
                }

                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }

        return idCompra;
    }

    @Override
    public List<Map<String, Object>> listarComprasConDetalles() throws SQLException {
        List<Map<String, Object>> compras = new ArrayList<>();

        // ¡LLAMADA AL NUEVO SP!
        String sql = "{CALL sp_listar_compras_final()}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql);
             ResultSet rs = cs.executeQuery()) {

            Map<Integer, Map<String, Object>> compraMap = new LinkedHashMap<>();

            while (rs.next()) {
                int idCompra = rs.getInt("id_compra");
                Map<String, Object> compra = compraMap.get(idCompra);

                if (compra == null) {
                    compra = new LinkedHashMap<>();
                    compra.put("id_compra", idCompra);

                    // --- CONVERSIÓN DE FECHAS A STRING EN EL FORMATO DESEADO EN CABECERA ---
                    java.sql.Date fechaEmision = rs.getDate("fecha_emision");
                    compra.put("fecha_emision", fechaEmision != null ? DATE_FORMATTER.format(fechaEmision) : null);

                    java.sql.Date fechaVencimiento = rs.getDate("fecha_vencimiento");
                    compra.put("fecha_vencimiento", fechaVencimiento != null ? DATE_FORMATTER.format(fechaVencimiento) : null);
                    // ----------------------------------------------------------------------

                    compra.put("tipo_comprobante", rs.getString("tipo_comprobante"));
                    compra.put("serie", rs.getString("serie"));
                    compra.put("correlativo", rs.getString("correlativo"));
                    compra.put("moneda", rs.getString("moneda"));
                    compra.put("total", rs.getBigDecimal("total"));
                    compra.put("subtotal", rs.getBigDecimal("subtotal"));
                    compra.put("igv", rs.getBigDecimal("igv"));
                    compra.put("coste_transporte", rs.getBigDecimal("coste_transporte"));
                    compra.put("total_peso", rs.getBigDecimal("total_peso"));
                    compra.put("observacion", rs.getString("observacion"));

                    // --- Mapeo Definitivo: LECTURA POR ALIAS RAZON_FINAL ---
                    Map<String, Object> proveedor = new HashMap<>();
                    proveedor.put("id", rs.getInt("id_proveedor"));
                    proveedor.put("ruc", rs.getString("ruc"));
                    proveedor.put("razon_social", rs.getString("RAZON_FINAL"));
                    proveedor.put("direccion", rs.getString("direccion"));
                    proveedor.put("telefono", rs.getString("telefono"));
                    proveedor.put("correo", rs.getString("correo"));
                    proveedor.put("ciudad", rs.getString("ciudad"));
                    compra.put("proveedor", proveedor);
                    // ------------------------------------

                    compra.put("detalles", new ArrayList<>());
                    compra.put("guia", null);
                    compra.put("referencia", null);
                    compraMap.put(idCompra, compra);
                }

                // Mapeo de Detalles
                if (rs.getInt("id_detalle") > 0) {
                    List<Map<String, Object>> detalles = (List<Map<String, Object>>) compra.get("detalles");

                    // Evitar duplicados si el resultado del SP es un JOIN
                    boolean detalleExiste = detalles.stream()
                            .anyMatch(d -> {
                                try {
                                    return d.get("id_detalle").equals(rs.getInt("id_detalle"));
                                } catch (SQLException e) {
                                    throw new RuntimeException(e);
                                }
                            });

                    if (!detalleExiste) {
                        Map<String, Object> detalle = new HashMap<>();
                        detalle.put("id_detalle", rs.getInt("id_detalle"));
                        detalle.put("codigo_articulo", rs.getString("codigo_articulo"));
                        detalle.put("descripcion_articulo", rs.getString("descripcion_articulo"));
                        detalle.put("cantidad", rs.getBigDecimal("cantidad"));
                        detalle.put("precio_unitario", rs.getBigDecimal("precio_unitario"));
                        detalle.put("peso_total", rs.getBigDecimal("peso_total"));
                        detalle.put("precio_con_descuento", rs.getBigDecimal("precio_con_descuento"));
                        detalle.put("igv_insumo", rs.getBigDecimal("igv_insumo"));
                        detalle.put("total_detalle", rs.getBigDecimal("total_detalle"));
                        detalle.put("coste_unitario_transporte", rs.getBigDecimal("coste_unitario_transporte"));
                        detalle.put("coste_total_transporte", rs.getBigDecimal("coste_total_transporte"));
                        detalles.add(detalle);
                    }
                }

                // Mapeo de Guía
                if (rs.getInt("id_guia") > 0 && compra.get("guia") == null) {
                    Map<String, Object> guia = new HashMap<>();
                    guia.put("id_guia", rs.getInt("id_guia"));
                    guia.put("ruc_guia", rs.getString("ruc_guia"));
                    guia.put("razon_social_guia", rs.getString("razon_social_guia"));

                    // --- CONVERSIÓN DE FECHAS A STRING EN EL FORMATO DESEADO EN GUÍA ---
                    java.sql.Date fechaEmisionGuia = rs.getDate("fecha_emision_guia");
                    guia.put("fecha_emision_guia", fechaEmisionGuia != null ? DATE_FORMATTER.format(fechaEmisionGuia) : null);

                    java.sql.Date fechaPedido = rs.getDate("fecha_pedido");
                    guia.put("fecha_pedido", fechaPedido != null ? DATE_FORMATTER.format(fechaPedido) : null);

                    java.sql.Date fechaEntrega = rs.getDate("fecha_entrega");
                    guia.put("fecha_entrega", fechaEntrega != null ? DATE_FORMATTER.format(fechaEntrega) : null);
                    // -------------------------------------------------------------------

                    guia.put("tipo_comprobante_guia", rs.getString("tipo_comprobante_guia"));
                    guia.put("serie_guia", rs.getString("serie_guia"));
                    guia.put("correlativo_guia", rs.getString("correlativo_guia"));
                    guia.put("serie_guia_transporte", rs.getString("serie_guia_transporte"));
                    guia.put("correlativo_guia_transporte", rs.getString("correlativo_guia_transporte"));
                    guia.put("ciudad_traslado", rs.getString("ciudad_traslado"));
                    guia.put("coste_transporte_guia", rs.getBigDecimal("coste_transporte_guia"));
                    guia.put("peso_guia", rs.getBigDecimal("peso_guia"));
                    compra.put("guia", guia);
                }

                // Mapeo de Referencia
                if (rs.getInt("id_referencia") > 0 && compra.get("referencia") == null) {
                    Map<String, Object> referencia = new HashMap<>();
                    referencia.put("id_referencia", rs.getInt("id_referencia"));
                    referencia.put("numero_cotizacion", rs.getString("numero_cotizacion"));
                    referencia.put("numero_pedido", rs.getString("numero_pedido"));
                    compra.put("referencia", referencia);
                }
            }
            compras.addAll(compraMap.values());
        }
        return compras;
    }

    private int registrarCompraCabecera(Connection conn, Compra compra) throws SQLException {
        int idCompra = -1;
        String sql = "{call sp_registrar_compra(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, compra.getIdProveedor());
            cs.setInt(2, compra.getIdTipoComprobante());
            cs.setString(3, compra.getSerie());
            cs.setString(4, compra.getCorrelativo());
            cs.setDate(5, compra.getFechaEmision() != null ? Date.valueOf(compra.getFechaEmision()) : null);
            cs.setDate(6, compra.getFechaVencimiento() != null ? Date.valueOf(compra.getFechaVencimiento()) : null);
            cs.setInt(7, compra.getIdTipoPago());
            cs.setInt(8, compra.getIdFormaPago());
            cs.setInt(9, compra.getIdMoneda());
            cs.setBigDecimal(10, compra.getTipoCambio());
            cs.setBoolean(11, compra.isIncluyeIgv());
            cs.setBoolean(12, compra.isHayBonificacion());
            cs.setBoolean(13, compra.isHayTraslado());
            cs.setString(14, compra.getObservacion());
            cs.setBigDecimal(15, compra.getSubtotal());
            cs.setBigDecimal(16, compra.getIgv());
            cs.setBigDecimal(17, compra.getTotal());
            cs.setBigDecimal(18, compra.getTotalPeso());
            cs.setBigDecimal(19, compra.getCosteTransporte());
            cs.registerOutParameter(20, Types.INTEGER);
            cs.execute();
            idCompra = cs.getInt(20);
        }
        return idCompra;
    }

    private int registrarDetalleCompra(Connection conn, DetalleCompra detalle) throws SQLException {
        String sql = "{call sp_agregar_detalle_compra(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, detalle.getIdCompra());
            cs.setInt(2, detalle.getIdArticulo());
            cs.setBigDecimal(3, detalle.getCantidad());
            cs.setBigDecimal(4, detalle.getPrecioUnitario());
            cs.setBigDecimal(5, detalle.getBonificacion());
            cs.setBigDecimal(6, detalle.getCosteUnitarioTransporte());
            cs.setBigDecimal(7, detalle.getCosteTotalTransporte());
            cs.setBigDecimal(8, detalle.getPrecioConDescuento());
            cs.setBigDecimal(9, detalle.getIgvInsumo());
            cs.setBigDecimal(10, detalle.getTotal());
            cs.setBigDecimal(11, detalle.getPesoTotal());
            cs.execute();
        }
        return detalle.getIdDetalle();
    }

    private void registrarDescuentoGlobal(Connection conn, int idCompra, int idVenta, Descuento descuento) throws SQLException {
        String sql = "{call sp_agregar_descuento_global(?, ?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idCompra);
            cs.setNull(2, Types.INTEGER);
            cs.setString(3, descuento.getMotivo());
            cs.setString(4, descuento.getTipoValor());
            cs.setBigDecimal(5, descuento.getValor());
            cs.setBigDecimal(6, descuento.getTasaIgv());
            cs.execute();
        }
    }

    private void registrarDescuentoItem(Connection conn, int idDetalleCompra, int idDetalleVenta, Descuento descuento) throws SQLException {
        String sql = "{call sp_agregar_descuento_item(?, ?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idDetalleCompra);
            cs.setNull(2, Types.INTEGER);
            cs.setString(3, descuento.getMotivo());
            cs.setString(4, descuento.getTipoValor());
            cs.setBigDecimal(5, descuento.getValor());
            cs.setBigDecimal(6, descuento.getTasaIgv());
            cs.execute();
        }
    }

    private void registrarGuia(Connection conn, int idCompra, GuiaTransporte guia) throws SQLException {
        String sql = "{call sp_agregar_guia_transporte_compra(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            int i = 1;
            cs.setInt(i++, idCompra);

            cs.setString(i++, guia.getRucGuia());
            cs.setString(i++, guia.getRazonSocialGuia());
            cs.setDate(i++, guia.getFechaEmision() != null ? Date.valueOf(guia.getFechaEmision()) : null);
            cs.setString(i++, guia.getTipoComprobante());
            cs.setString(i++, guia.getSerie());
            cs.setString(i++, guia.getCorrelativo());
            cs.setString(i++, guia.getCiudadTraslado());
            cs.setString(i++, guia.getPuntoPartida());
            cs.setString(i++, guia.getPuntoLlegada());
            cs.setString(i++, guia.getSerieGuiaTransporte());
            cs.setString(i++, guia.getCorrelativoGuiaTransporte());
            cs.setBigDecimal(i++, guia.getCosteTotalTransporte());
            cs.setBigDecimal(i++, guia.getPeso());
            cs.setDate(i++, guia.getFechaPedido() != null ? Date.valueOf(guia.getFechaPedido()) : null);
            cs.setDate(i++, guia.getFechaEntrega() != null ? Date.valueOf(guia.getFechaEntrega()) : null);

            cs.execute();
        }
    }

    private void registrarReferencia(Connection conn, int idCompra, DocumentoReferencia docRef) throws SQLException {
        String sql = "{call sp_agregar_referencia_compra(?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idCompra);
            cs.setString(2, docRef.getNumeroCotizacion());
            cs.setString(3, docRef.getNumeroPedido());
            cs.execute();
        }
    }

    private int registrarCajaCompra(Connection conn, Caja caja) throws SQLException {
        int idCajaCompra;
        String sql = "{call sp_agregar_caja_compra(?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, caja.getIdCompra());
            cs.setString(2, caja.getNombreCaja());
            cs.setInt(3, caja.getCantidad());
            cs.setBigDecimal(4, caja.getCostoCaja());
            cs.registerOutParameter(5, Types.INTEGER);
            cs.execute();
            idCajaCompra = cs.getInt(5);
        }
        return idCajaCompra;
    }

    private void registrarDetalleCajaCompra(Connection conn, DetalleCaja detalle) throws SQLException {
        String sql = "{call sp_agregar_detalle_caja_compra(?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, detalle.getIdCajaCompra());
            cs.setInt(2, detalle.getIdArticulo());
            cs.setBigDecimal(3, detalle.getCantidad());
            cs.execute();
        }
    }
}
