package sistema.Controller.Compra;

import sistema.Ejecucion.Conexion;
import sistema.Modelo.Compra.*;
import sistema.repository.CompraRepository;
import java.sql.*;
import java.sql.Date;
import java.util.*;
import java.text.SimpleDateFormat;

public class CompraController implements CompraRepository {

    private static final SimpleDateFormat DATE_FORMATTER = new SimpleDateFormat("dd-MM-yyyy");

    private Connection getConnection() throws SQLException {
        Connection conn = Conexion.obtenerConexion();
        if (conn == null) {
            throw new SQLException("No se pudo establecer la conexión a la base de datos.");
        }
        return conn;
    }

    @Override
    public int registrarCompra(Compra compra, GuiaTransporte guia, DocumentoReferencia docRef,
                               List<DetalleCompra> detalles, List<Descuento> descuentos,
                               List<Caja> cajas, Map<Integer, List<DetalleCaja>> detallesCaja) throws SQLException {
        int idCompra = -1;

        try (Connection conn = getConnection()) {
            try {
                conn.setAutoCommit(false);

                idCompra = registrarCompraCabecera(conn, compra);
                if (idCompra <= 0) {
                    throw new SQLException("El registro de la cabecera de compra falló, se obtuvo un ID inválido: " + idCompra);
                }

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
                        if (idDetalleReal <= 0) {
                            throw new SQLException("No se pudo registrar el detalle de compra y obtener su ID.");
                        }
                        tempIdToRealIdMap.put(tempDetalleId, idDetalleReal);

                        if (detalle.getLotes() != null && !detalle.getLotes().isEmpty()) {
                            for (Lote lote : detalle.getLotes()) {
                                registrarLoteCompra(conn, idDetalleReal, detalle.getIdArticulo(), lote);
                            }
                        } else {
                            registrarLoteCompra(conn, idDetalleReal, detalle.getIdArticulo(), crearLoteVirtual(detalle));
                        }
                    }
                }

                if (descuentos != null) {
                    for (Descuento d : descuentos) {
                        if ("item".equalsIgnoreCase(d.getNivel())) {
                            int realIdDetalle = tempIdToRealIdMap.getOrDefault(d.getIdDetalle(), -1);
                            if (realIdDetalle != -1) {
                                registrarDescuentoItem(conn, realIdDetalle, d);
                            }
                        } else if ("global".equalsIgnoreCase(d.getNivel())) {
                            registrarDescuentoGlobal(conn, idCompra, d);
                        }
                    }
                }

                if (cajas != null) {
                    for (Caja caja : cajas) {
                        int tempIdCaja = caja.getIdCajaCompra();
                        caja.setIdCompra(idCompra);
                        int idCajaReal = registrarCajaCompra(conn, caja);

                        if (idCajaReal > 0 && detallesCaja != null && detallesCaja.containsKey(tempIdCaja)) {
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
                throw new SQLException("Error al registrar la compra. Transacción revertida.", e);
            } finally {
                conn.setAutoCommit(true);
            }
        }
        return idCompra;
    }

    @Override
    public List<Map<String, Object>> listarComprasConDetalles() throws SQLException {
        List<Map<String, Object>> compras = new ArrayList<>();
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
                    java.sql.Date fechaEmision = rs.getDate("fecha_emision");
                    compra.put("fecha_emision", fechaEmision != null ? DATE_FORMATTER.format(fechaEmision) : null);
                    java.sql.Date fechaVencimiento = rs.getDate("fecha_vencimiento");
                    compra.put("fecha_vencimiento", fechaVencimiento != null ? DATE_FORMATTER.format(fechaVencimiento) : null);
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

                    Map<String, Object> proveedor = new HashMap<>();
                    proveedor.put("id", rs.getInt("id_proveedor"));
                    proveedor.put("ruc", rs.getString("ruc"));
                    proveedor.put("razon_social", rs.getString("RAZON_FINAL"));
                    proveedor.put("direccion", rs.getString("direccion"));
                    proveedor.put("telefono", rs.getString("telefono"));
                    proveedor.put("correo", rs.getString("correo"));
                    proveedor.put("ciudad", rs.getString("ciudad"));
                    compra.put("proveedor", proveedor);

                    compra.put("detalles", new ArrayList<>());
                    compra.put("guia", null);
                    compra.put("referencia", null);
                    compraMap.put(idCompra, compra);
                }

                if (rs.getInt("id_detalle") > 0) {
                    List<Map<String, Object>> detalles = (List<Map<String, Object>>) compra.get("detalles");
                    int currentDetalleId = rs.getInt("id_detalle");

                    boolean detalleExiste = detalles.stream()
                            .anyMatch(d -> d.get("id_detalle").equals(currentDetalleId));

                    if (!detalleExiste) {
                        Map<String, Object> detalle = new HashMap<>();
                        detalle.put("id_detalle", currentDetalleId);
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

                if (rs.getInt("id_guia") > 0 && compra.get("guia") == null) {
                    Map<String, Object> guiaMap = new HashMap<>();
                    guiaMap.put("id_guia", rs.getInt("id_guia"));
                    guiaMap.put("ruc_guia", rs.getString("ruc_guia"));
                    java.sql.Date fechaEmisionGuia = rs.getDate("fecha_emision_guia");
                    guiaMap.put("fecha_emision_guia", fechaEmisionGuia != null ? DATE_FORMATTER.format(fechaEmisionGuia) : null);
                    java.sql.Date fechaPedido = rs.getDate("fecha_pedido");
                    guiaMap.put("fecha_pedido", fechaPedido != null ? DATE_FORMATTER.format(fechaPedido) : null);
                    java.sql.Date fechaEntrega = rs.getDate("fecha_entrega");
                    guiaMap.put("fecha_entrega", fechaEntrega != null ? DATE_FORMATTER.format(fechaEntrega) : null);
                    guiaMap.put("tipo_comprobante_guia", rs.getString("tipo_comprobante_guia"));
                    guiaMap.put("serie_guia", rs.getString("serie_guia"));
                    guiaMap.put("correlativo_guia", rs.getString("correlativo_guia"));
                    guiaMap.put("serie_guia_transporte", rs.getString("serie_guia_transporte"));
                    guiaMap.put("correlativo_guia_transporte", rs.getString("correlativo_guia_transporte"));
                    guiaMap.put("ciudad_traslado", rs.getString("ciudad_traslado"));
                    guiaMap.put("coste_transporte_guia", rs.getBigDecimal("coste_transporte_guia"));
                    guiaMap.put("peso_guia", rs.getBigDecimal("peso_guia"));
                    compra.put("guia", guiaMap);
                }

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

    @Override
    public boolean editarCompra(Compra compra, GuiaTransporte guia, List<DetalleCompra> detallesEditados,
                                Map<Integer, Lote> lotesEditados) throws SQLException {

        if (compra.getIdCompra() <= 0) {
            throw new IllegalArgumentException("ID de compra inválido para la edición.");
        }

        try (Connection conn = getConnection()) {
            try {
                conn.setAutoCommit(false);

                if (detallesEditados != null) {
                    for (DetalleCompra detalle : detallesEditados) {
                        editarDetalleCompra(conn, detalle);

                        if (lotesEditados != null && lotesEditados.containsKey(detalle.getIdDetalle())) {
                            Lote lote = lotesEditados.get(detalle.getIdDetalle());
                            actualizarLote(conn, detalle.getIdDetalle(), lote);
                        }
                    }
                }

                editarCompraCabecera(conn, compra);

                if (compra.isHayTraslado() && guia != null) {
                    editarGuiaTransporte(conn, compra.getIdCompra(), guia);
                }

                conn.commit();
                return true;

            } catch (SQLException e) {
                conn.rollback();
                throw new SQLException("Error al editar la compra. Transacción revertida.", e);
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    private void editarCompraCabecera(Connection conn, Compra compra) throws SQLException {
        String sql = "{call sp_editar_compra(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            int i = 1;
            cs.setInt(i++, compra.getIdCompra());
            cs.setInt(i++, compra.getIdProveedor());
            cs.setInt(i++, compra.getIdTipoComprobante());
            cs.setString(i++, compra.getSerie());
            cs.setString(i++, compra.getCorrelativo());
            cs.setDate(i++, compra.getFechaEmision() != null ? Date.valueOf(compra.getFechaEmision()) : null);
            cs.setDate(i++, compra.getFechaVencimiento() != null ? Date.valueOf(compra.getFechaVencimiento()) : null);
            cs.setInt(i++, compra.getIdTipoPago());
            cs.setInt(i++, compra.getIdFormaPago());
            cs.setInt(i++, compra.getIdMoneda());
            cs.setBigDecimal(i++, compra.getTipoCambio());
            cs.setBoolean(i++, compra.isIncluyeIgv());
            cs.setBoolean(i++, compra.isHayBonificacion());
            cs.setBoolean(i++, compra.isHayTraslado());
            cs.setString(i++, compra.getObservacion());
            cs.setBigDecimal(i++, compra.getSubtotal());
            cs.setBigDecimal(i++, compra.getIgv());
            cs.setBigDecimal(i++, compra.getTotal());
            cs.setBigDecimal(i++, compra.getTotalPeso());
            cs.setBigDecimal(i++, compra.getCosteTransporte());
            cs.execute();
        }
    }

    private void editarDetalleCompra(Connection conn, DetalleCompra detalle) throws SQLException {
        String sql = "{call sp_editar_articulo_detalle(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            int i = 1;
            cs.setInt(i++, detalle.getIdDetalle());
            cs.setBigDecimal(i++, detalle.getCantidad());
            cs.setBigDecimal(i++, detalle.getPrecioUnitario());
            cs.setBigDecimal(i++, detalle.getBonificacion());
            cs.setBigDecimal(i++, detalle.getCosteUnitarioTransporte());
            cs.setBigDecimal(i++, detalle.getCosteTotalTransporte());
            cs.setBigDecimal(i++, detalle.getPrecioConDescuento());
            cs.setBigDecimal(i++, detalle.getIgvInsumo());
            cs.setBigDecimal(i++, detalle.getTotal());
            cs.setBigDecimal(i++, detalle.getPesoTotal());
            cs.execute();
        }
    }

    private void actualizarLote(Connection conn, int idDetalleCompra, Lote lote) throws SQLException {
        String sql = "{call sp_actualizar_lote(?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idDetalleCompra);
            cs.setString(2, lote.getNumeroLote());
            cs.setDate(3, lote.getFechaVencimiento() != null ? Date.valueOf(lote.getFechaVencimiento()) : null);
            cs.execute();
        }
    }

    private void editarGuiaTransporte(Connection conn, int idCompra, GuiaTransporte guia) throws SQLException {
        String sql = "{call sp_editar_guia_transporte(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            int i = 1;
            cs.setInt(i++, idCompra);
            cs.setString(i++, guia.getRucGuia());
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

    private int registrarCompraCabecera(Connection conn, Compra compra) throws SQLException {
        int idCompra = -1;
        String sql = "{call sp_registrar_compra(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            int i = 1;
            cs.setInt(i++, compra.getIdProveedor());
            cs.setInt(i++, compra.getIdTipoComprobante());
            cs.setString(i++, compra.getSerie());
            cs.setString(i++, compra.getCorrelativo());
            cs.setDate(i++, compra.getFechaEmision() != null ? Date.valueOf(compra.getFechaEmision()) : null);
            cs.setDate(i++, compra.getFechaVencimiento() != null ? Date.valueOf(compra.getFechaVencimiento()) : null);
            cs.setInt(i++, compra.getIdTipoPago());
            cs.setInt(i++, compra.getIdFormaPago());
            cs.setInt(i++, compra.getIdMoneda());
            cs.setBigDecimal(i++, compra.getTipoCambio());
            cs.setBoolean(i++, compra.isIncluyeIgv());
            cs.setBoolean(i++, compra.isHayBonificacion());
            cs.setBoolean(i++, compra.isHayTraslado());
            cs.setString(i++, compra.getObservacion());
            cs.setBigDecimal(i++, compra.getSubtotal());
            cs.setBigDecimal(i++, compra.getIgv());
            cs.setBigDecimal(i++, compra.getTotal());
            cs.setBigDecimal(i++, compra.getTotalPeso());
            cs.setBigDecimal(i++, compra.getCosteTransporte());
            cs.registerOutParameter(i, Types.INTEGER);
            cs.execute();
            idCompra = cs.getInt(i);
        }
        return idCompra;
    }

    private int registrarDetalleCompra(Connection conn, DetalleCompra detalle) throws SQLException {
        int idDetalleReal = -1;
        String sql = "{call sp_agregar_detalle_compra(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            int i = 1;
            cs.setInt(i++, detalle.getIdCompra());
            cs.setInt(i++, detalle.getIdArticulo());
            cs.setBigDecimal(i++, detalle.getCantidad());
            cs.setBigDecimal(i++, detalle.getPrecioUnitario());
            cs.setBigDecimal(i++, detalle.getBonificacion());
            cs.setBigDecimal(i++, detalle.getCosteUnitarioTransporte());
            cs.setBigDecimal(i++, detalle.getCosteTotalTransporte());
            cs.setBigDecimal(i++, detalle.getPrecioConDescuento());
            cs.setBigDecimal(i++, detalle.getIgvInsumo());
            cs.setBigDecimal(i++, detalle.getTotal());
            cs.setBigDecimal(i++, detalle.getPesoTotal());
            cs.registerOutParameter(i, Types.INTEGER);
            cs.execute();
            idDetalleReal = cs.getInt(i);
        }
        return idDetalleReal;
    }

    private void registrarLoteCompra(Connection conn, int idDetalleCompra, int idArticulo, Lote lote) throws SQLException {
        String sql = "{call sp_registrar_lote_compra(?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            int i = 1;
            cs.setInt(i++, idDetalleCompra);
            cs.setInt(i++, idArticulo);
            cs.setString(i++, lote.getNumeroLote());
            cs.setDate(i++, lote.getFechaVencimiento() != null ? Date.valueOf(lote.getFechaVencimiento()) : null);
            cs.setBigDecimal(i++, lote.getCantidadLote());
            cs.execute();
        }
    }

    private Lote crearLoteVirtual(DetalleCompra detalle) {
        Lote loteVirtual = new Lote();
        loteVirtual.setNumeroLote(null);
        loteVirtual.setFechaVencimiento(null);
        loteVirtual.setCantidadLote(detalle.getCantidad());
        loteVirtual.setIdArticulo(detalle.getIdArticulo());
        return loteVirtual;
    }

    private void registrarDescuentoGlobal(Connection conn, int idCompra, Descuento descuento) throws SQLException {
        String sql = "{call sp_agregar_descuento_global(?, ?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            int i = 1;
            cs.setInt(i++, idCompra);
            cs.setNull(i++, Types.INTEGER);
            cs.setString(i++, descuento.getMotivo());
            cs.setString(i++, descuento.getTipoValor());
            cs.setBigDecimal(i++, descuento.getValor());
            cs.setBigDecimal(i++, descuento.getTasaIgv());
            cs.execute();
        }
    }

    private void registrarDescuentoItem(Connection conn, int idDetalleCompra, Descuento descuento) throws SQLException {
        String sql = "{call sp_agregar_descuento_item(?, ?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            int i = 1;
            cs.setInt(i++, idDetalleCompra);
            cs.setNull(i++, Types.INTEGER);
            cs.setString(i++, descuento.getMotivo());
            cs.setString(i++, descuento.getTipoValor());
            cs.setBigDecimal(i++, descuento.getValor());
            cs.setBigDecimal(i++, descuento.getTasaIgv());
            cs.execute();
        }
    }

    private void registrarGuia(Connection conn, int idCompra, GuiaTransporte guia) throws SQLException {
        String sql = "{call sp_agregar_guia_transporte_compra(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            int i = 1;
            cs.setInt(i++, idCompra);
            cs.setString(i++, guia.getRucGuia());
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
            int i = 1;
            cs.setInt(i++, caja.getIdCompra());
            cs.setString(i++, caja.getNombreCaja());
            cs.setInt(i++, caja.getCantidad());
            cs.setBigDecimal(i++, caja.getCostoCaja());
            cs.registerOutParameter(i, Types.INTEGER);
            cs.execute();
            idCajaCompra = cs.getInt(i);
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