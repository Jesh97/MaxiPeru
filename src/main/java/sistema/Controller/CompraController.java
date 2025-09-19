package sistema.Controller;

import sistema.Ejecucion.Conexion;
import sistema.Modelo.Compra.*;
import sistema.repository.CompraRepository;
import java.sql.*;
import java.sql.Date;
import java.util.*;

public class CompraController implements CompraRepository {

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

                // 1. Registrar cabecera de compra
                idCompra = registrarCompraCabecera(conn, compra);

                // 2. Registrar guía
                if (compra.isHayTraslado() && guia != null) {
                    registrarGuia(conn, idCompra, guia);
                }

                // 3. Registrar referencia
                if (docRef != null &&
                        (docRef.getNumeroCotizacion() != null || docRef.getNumeroPedido() != null)) {
                    registrarReferencia(conn, idCompra, docRef);
                }

                // 4. Registrar detalles
                Map<Integer, Integer> tempIdToRealIdMap = new HashMap<>();
                if (detalles != null) {
                    for (DetalleCompra detalle : detalles) {
                        int tempDetalleId = detalle.getIdDetalle();
                        detalle.setIdCompra(idCompra);
                        int idDetalleReal = registrarDetalleCompra(conn, detalle);
                        tempIdToRealIdMap.put(tempDetalleId, idDetalleReal);
                    }
                }

                // 5. Registrar descuentos
                if (descuentos != null) {
                    for (Descuento d : descuentos) {
                        if ("item".equalsIgnoreCase(d.getNivel())) {
                            int realIdDetalle = tempIdToRealIdMap.getOrDefault(d.getIdDetalle(), -1);
                            if (realIdDetalle != -1) {
                                d.setIdCompra(idCompra);
                                d.setIdDetalle(realIdDetalle);
                                registrarDescuento(conn, d);
                            }
                        } else if ("global".equalsIgnoreCase(d.getNivel())) {
                            d.setIdCompra(idCompra);
                            registrarDescuento(conn, d);
                        }
                    }
                }

                // 6. Registrar cajas
                Map<Integer, Integer> tempCajaToRealId = new HashMap<>();
                if (cajas != null) {
                    for (Caja caja : cajas) {
                        int tempIdCaja = caja.getIdCajaCompra();
                        caja.setIdCompra(idCompra);
                        int idCajaReal = registrarCajaCompra(conn, caja);
                        tempCajaToRealId.put(tempIdCaja, idCajaReal);

                        // Detalles de la caja
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
        String sql = "{CALL sp_listar_compras_completas()}";

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
                    compra.put("fecha_emision", rs.getDate("fecha_emision") != null ? rs.getDate("fecha_emision").toString() : null);
                    compra.put("fecha_vencimiento", rs.getDate("fecha_vencimiento") != null ? rs.getDate("fecha_vencimiento").toString() : null);
                    compra.put("tipo_comprobante", rs.getString("tipo_comprobante"));
                    compra.put("serie", rs.getString("serie"));
                    compra.put("correlativo", rs.getString("correlativo"));
                    compra.put("moneda", rs.getString("moneda"));
                    compra.put("tipo_cambio", rs.getDouble("tipo_cambio"));
                    compra.put("subtotal", rs.getDouble("subtotal"));
                    compra.put("igv", rs.getDouble("igv"));
                    compra.put("total", rs.getDouble("total"));
                    compra.put("total_peso", rs.getDouble("total_peso"));
                    compra.put("coste_transporte", rs.getObject("coste_transporte") != null ? rs.getDouble("coste_transporte") : null);
                    compra.put("observacion", rs.getString("observacion"));

                    // Proveedor
                    Map<String, Object> proveedor = new HashMap<>();
                    proveedor.put("id", rs.getInt("id_proveedor"));
                    proveedor.put("ruc", rs.getString("ruc"));
                    proveedor.put("razon_social", rs.getString("razon_social"));
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

                // Detalle
                Map<String, Object> detalle = new HashMap<>();
                detalle.put("id_detalle", rs.getInt("id_detalle"));
                detalle.put("id_producto", rs.getInt("id_producto"));
                detalle.put("codigo_producto", rs.getString("codigo_producto"));
                detalle.put("descripcion_producto", rs.getString("descripcion_producto"));
                detalle.put("cantidad", rs.getDouble("cantidad"));
                detalle.put("precio_unitario", rs.getDouble("precio_unitario"));
                detalle.put("coste_unitario_transporte", rs.getObject("coste_unitario_transporte") != null ? rs.getDouble("coste_unitario_transporte") : null);
                detalle.put("coste_total_transporte", rs.getObject("coste_total_transporte") != null ? rs.getDouble("coste_total_transporte") : null);
                detalle.put("precio_con_descuento", rs.getObject("precio_con_descuento") != null ? rs.getDouble("precio_con_descuento") : null);
                detalle.put("igv_producto", rs.getObject("igv_producto") != null ? rs.getDouble("igv_producto") : null);
                detalle.put("total_detalle", rs.getDouble("total_detalle"));
                detalle.put("peso_total", rs.getObject("peso_total") != null ? rs.getDouble("peso_total") : null);

                ((List<Map<String, Object>>) compra.get("detalles")).add(detalle);

                // Guía
                if (rs.getObject("id_guia") != null) {
                    Map<String, Object> guia = new HashMap<>();
                    guia.put("id_guia", rs.getInt("id_guia"));
                    guia.put("ruc_guia", rs.getString("ruc_guia"));
                    guia.put("fecha_emision_guia", rs.getDate("fecha_emision_guia") != null ? rs.getDate("fecha_emision_guia").toString() : null);
                    guia.put("tipo_comprobante_guia", rs.getString("tipo_comprobante_guia"));
                    guia.put("serie_guia", rs.getString("serie_guia"));
                    guia.put("correlativo_guia", rs.getString("correlativo_guia"));
                    guia.put("numero_guia", rs.getString("numero_guia"));
                    guia.put("serie_guia_transporte", rs.getString("serie_guia_transporte"));
                    guia.put("correlativo_guia_transporte", rs.getString("correlativo_guia_transporte"));
                    guia.put("ciudad_traslado", rs.getString("ciudad_traslado"));
                    guia.put("coste_transporte_guia", rs.getObject("coste_transporte_guia") != null ? rs.getDouble("coste_transporte_guia") : null);
                    guia.put("peso_guia", rs.getObject("peso_guia") != null ? rs.getDouble("peso_guia") : null);
                    guia.put("fecha_pedido", rs.getDate("fecha_pedido") != null ? rs.getDate("fecha_pedido").toString() : null);
                    guia.put("fecha_entrega", rs.getDate("fecha_entrega") != null ? rs.getDate("fecha_entrega").toString() : null);

                    compra.put("guia", guia);
                }

                // Referencia
                if (rs.getObject("id_referencia") != null) {
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
        String sql = "{call sp_registrar_compra(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, compra.getIdProveedor());
            cs.setString(2, compra.getTipoComprobante());
            cs.setString(3, compra.getSerie());
            cs.setString(4, compra.getCorrelativo());
            cs.setDate(5, compra.getFechaEmision() != null ? Date.valueOf(compra.getFechaEmision()) : null);
            cs.setDate(6, compra.getFechaVencimiento() != null ? Date.valueOf(compra.getFechaVencimiento()) : null);
            cs.setString(7, compra.getTipoPago());
            cs.setString(8, compra.getFormaPago());
            cs.setString(9, compra.getMoneda());
            cs.setDouble(10, compra.getTipoCambio());
            cs.setBoolean(11, compra.isIncluyeIgv());
            cs.setBoolean(12, compra.isHayBonificacion());
            cs.setBoolean(13, compra.isHayDescuento());
            cs.setBoolean(14, compra.isHayTraslado());
            cs.setString(15, compra.getObservation());
            cs.setDouble(16, compra.getSubtotal());
            cs.setDouble(17, compra.getIgv());
            cs.setDouble(18, compra.getTotal());
            cs.setDouble(19, compra.getTotalPeso());
            cs.setDouble(20, compra.getCosteTransporte());
            cs.registerOutParameter(21, Types.INTEGER);
            cs.execute();
            idCompra = cs.getInt(21);
        }
        return idCompra;
    }

    private int registrarDetalleCompra(Connection conn, DetalleCompra detalle) throws SQLException {
        int idDetalle = -1;
        String sql = "{call sp_registrar_detalle_compra(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, detalle.getIdCompra());
            cs.setInt(2, detalle.getIdProducto());
            cs.setDouble(3, detalle.getCantidad());
            cs.setDouble(4, detalle.getPrecioUnitario());
            cs.setDouble(5, detalle.getCosteUnitarioTransporte());
            cs.setDouble(6, detalle.getCosteTotalTransporte());
            cs.setDouble(7, detalle.getPrecioConDescuento());
            cs.setDouble(8, detalle.getIgvProducto());
            cs.setDouble(9, detalle.getTotal());
            cs.setDouble(10, detalle.getPesoTotal());
            cs.registerOutParameter(11, Types.INTEGER);
            cs.execute();
            idDetalle = cs.getInt(11);
        }
        return idDetalle;
    }

    private void registrarDescuento(Connection conn, Descuento descuento) throws SQLException {
        String sql = "{call sp_registrar_descuento(?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, descuento.getIdCompra());
            if (descuento.getIdDetalle() == 0) {
                cs.setNull(2, Types.INTEGER);
            } else {
                cs.setInt(2, descuento.getIdDetalle());
            }
            cs.setString(3, descuento.getNivel());
            cs.setString(4, descuento.getTipo());
            cs.setDouble(5, descuento.getValor());
            cs.execute();
        }
    }

    private void registrarGuia(Connection conn, int idCompra, GuiaTransporte guia) throws SQLException {
        String sql = "{call sp_registrar_guia(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idCompra);
            cs.setString(2, guia.getRucGuia());
            cs.setDate(3, guia.getFechaEmision() != null ? Date.valueOf(guia.getFechaEmision()) : null);
            cs.setString(4, guia.getTipoComprobante());
            cs.setString(5, guia.getSerie());
            cs.setString(6, guia.getCorrelativo());
            cs.setString(7, guia.getNumeroGuia());
            cs.setString(8, guia.getCiudadTraslado());
            cs.setDouble(9, guia.getCosteTotalTransporte());
            cs.setDouble(10, guia.getPeso());
            cs.setDate(11, guia.getFechaPedido() != null ? Date.valueOf(guia.getFechaPedido()) : null);
            cs.setDate(12, guia.getFechaEntrega() != null ? Date.valueOf(guia.getFechaEntrega()) : null);
            cs.execute();
        }
    }

    private void registrarReferencia(Connection conn, int idCompra, DocumentoReferencia docRef) throws SQLException {
        String sql = "{call sp_registrar_referencia(?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idCompra);
            cs.setString(2, docRef.getNumeroCotizacion());
            cs.setString(3, docRef.getNumeroPedido());
            cs.execute();
        }
    }

    // ================== MÉTODOS NUEVOS PARA CAJAS ==================

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
