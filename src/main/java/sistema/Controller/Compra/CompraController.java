package sistema.Controller.Compra;

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

                idCompra = registrarCompraCabecera(conn, compra);

                if (compra.isHayTraslado() && guia != null) {
                    registrarGuia(conn, idCompra, 0, "compra", guia);
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
                    compra.put("detalles", new ArrayList<>());
                    compra.put("guia", null);
                    compra.put("referencia", null);
                    compraMap.put(idCompra, compra);
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

    private void registrarGuia(Connection conn, int idCompra, int idVenta, String tipoDocumentoRef, GuiaTransporte guia) throws SQLException {
        String sql = "{call sp_agregar_guia_transporte(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
        try (CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idCompra);
            cs.setNull(2, Types.INTEGER);
            cs.setString(3, tipoDocumentoRef);
            cs.setString(4, guia.getRucGuia());
            cs.setString(5, guia.getRazonSocialGuia());
            cs.setDate(6, guia.getFechaEmision() != null ? Date.valueOf(guia.getFechaEmision()) : null);
            cs.setString(7, guia.getTipoComprobante());
            cs.setString(8, guia.getSerie());
            cs.setString(9, guia.getCorrelativo());
            cs.setString(10, guia.getSerieGuiaTransporte());
            cs.setString(11, guia.getCorrelativoGuiaTransporte());
            cs.setString(12, guia.getCiudadTraslado());
            cs.setString(13, guia.getPuntoPartida());
            cs.setString(14, guia.getPuntoLlegada());
            cs.setBigDecimal(15, guia.getCosteTotalTransporte());
            cs.setBigDecimal(16, guia.getPeso());
            cs.setDate(17, guia.getFechaPedido() != null ? Date.valueOf(guia.getFechaPedido()) : null);
            cs.setDate(18, guia.getFechaEntrega() != null ? Date.valueOf(guia.getFechaEntrega()) : null);
            cs.setDate(19, guia.getFechaTraslado() != null ? Date.valueOf(guia.getFechaTraslado()) : null);
            cs.setString(20, guia.getObservaciones());
            cs.setString(21, guia.getModalidadTransporte());
            cs.setString(22, guia.getRucEmpresa());
            cs.setString(23, guia.getRazonSocialEmpresa());
            cs.setString(24, guia.getMarcaVehiculo());
            cs.setString(25, guia.getDniConductor());
            cs.setString(26, guia.getNombreConductor());
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