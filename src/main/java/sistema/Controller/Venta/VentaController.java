package sistema.Controller.Venta;

import sistema.Ejecucion.Conexion;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.text.SimpleDateFormat;

public class VentaController {

    private static final SimpleDateFormat DATE_FORMATTER = new SimpleDateFormat("yyyy-MM-dd");

    private Connection getConnection() throws SQLException {
        Connection conn = Conexion.obtenerConexion();
        if (conn == null) throw new SQLException("No se pudo establecer la conexión a la base de datos.");
        return conn;
    }

    public int registrarVenta(Connection con, int idCliente, int idTipoComprobante, String serie, String correlativo, int idMoneda,
                              String fechaEmision, String fechaVencimiento, int idTipoPago, String estadoVenta,
                              String tipoDescuento, boolean aplicaIgv, String observaciones, double subtotal,
                              double igv, double descuentoTotal, double totalFinal, double totalPeso, boolean hayTraslado)
            throws SQLException {
        CallableStatement cs = null;
        int idVenta = 0;
        try {
            cs = con.prepareCall("{CALL sp_registrar_venta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}");
            cs.setInt(1, idCliente);
            cs.setInt(2, idTipoComprobante);
            cs.setString(3, serie);
            cs.setString(4, correlativo);
            cs.setInt(5, idMoneda);
            cs.setString(6, fechaEmision);
            if (fechaVencimiento == null || fechaVencimiento.isEmpty()) {
                cs.setNull(7, Types.DATE);
            } else {
                cs.setString(7, fechaVencimiento);
            }
            cs.setInt(8, idTipoPago);
            cs.setString(9, estadoVenta);
            cs.setString(10, tipoDescuento);
            cs.setBoolean(11, aplicaIgv);
            cs.setString(12, observaciones);
            cs.setDouble(13, subtotal);
            cs.setDouble(14, igv);
            cs.setDouble(15, descuentoTotal);
            cs.setDouble(16, totalFinal);
            cs.setDouble(17, totalPeso);
            cs.setBoolean(18, hayTraslado);
            cs.registerOutParameter(19, Types.INTEGER);
            cs.execute();
            idVenta = cs.getInt(19);
        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
        return idVenta;
    }

    public int agregarDetalleVenta(Connection con, int idVenta, int idArticulo, int idUnidad, String descripcion, double cantidad, double pesoUnitario, double precioUnitario, double descuentoMonto, double subtotal, double total) throws SQLException {
        CallableStatement cs = null;
        int idDetalleVenta = 0;
        try {
            cs = con.prepareCall("{CALL sp_agregar_detalle_venta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}");
            cs.setInt(1, idVenta);
            cs.setInt(2, idArticulo);
            cs.setInt(3, idUnidad);
            cs.setString(4, descripcion);
            cs.setDouble(5, cantidad);
            cs.setDouble(6, pesoUnitario);
            cs.setDouble(7, precioUnitario);
            cs.setDouble(8, descuentoMonto);
            cs.setDouble(9, subtotal);
            cs.setDouble(10, total);
            cs.registerOutParameter(11, Types.INTEGER);
            cs.execute();
            idDetalleVenta = cs.getInt(11);
        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
        return idDetalleVenta;
    }

    public void agregarDescuentoGlobalVenta(Connection con, int idVenta, String motivo, String tipoValor, double valor, Double tasaIgv) throws SQLException {
        CallableStatement cs = null;
        try {
            cs = con.prepareCall("{CALL sp_agregar_descuento_global_venta(?, ?, ?, ?, ?)}");
            cs.setInt(1, idVenta);
            cs.setString(2, motivo);
            cs.setString(3, tipoValor);
            cs.setDouble(4, valor);
            if (tasaIgv == null) {
                cs.setNull(5, Types.DECIMAL);
            } else {
                cs.setDouble(5, tasaIgv);
            }
            cs.execute();
        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
    }

    public void agregarDescuentoItemVenta(Connection con, int idDetalleVenta, String motivo, String tipoValor, double valor, Double tasaIgv) throws SQLException {
        CallableStatement cs = null;
        try {
            cs = con.prepareCall("{CALL sp_agregar_descuento_item_venta(?, ?, ?, ?, ?)}");
            cs.setInt(1, idDetalleVenta);
            cs.setString(2, motivo);
            cs.setString(3, tipoValor);
            cs.setDouble(4, valor);
            if (tasaIgv == null) {
                cs.setNull(5, Types.DECIMAL);
            } else {
                cs.setDouble(5, tasaIgv);
            }
            cs.execute();
        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
    }

    public void gestionarConsumoStockVenta(Connection con, int idDetalleVenta, int idArticulo, double cantidadAConsumir) throws SQLException {
        CallableStatement cs = null;
        try {
            cs = con.prepareCall("{CALL sp_gestionar_consumo_stock_venta(?, ?, ?)}");
            cs.setInt(1, idDetalleVenta);
            cs.setInt(2, idArticulo);
            cs.setDouble(3, cantidadAConsumir);
            cs.execute();
        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
    }

    public void registrarGuiaTransporteVenta(Connection con, int idVenta, String modalidadTransporte, double peso, String rucEmpresa, String razonSocialEmpresa, String marcaVehiculo, String dniConductor, String nombreConductor, String puntoPartida, String puntoLlegada, String fechaTraslado, String observaciones, String conformidadNombre, String conformidadDni) throws SQLException {
        CallableStatement cs = null;
        try {
            cs = con.prepareCall("{CALL sp_registrar_guia_transporte_venta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}");
            cs.setInt(1, idVenta);
            cs.setString(2, modalidadTransporte);
            cs.setDouble(3, peso);
            cs.setString(4, rucEmpresa);
            cs.setString(5, razonSocialEmpresa);
            cs.setString(6, marcaVehiculo);
            cs.setString(7, dniConductor);
            cs.setString(8, nombreConductor);
            cs.setString(9, puntoPartida);
            cs.setString(10, puntoLlegada);
            cs.setString(11, fechaTraslado);
            cs.setString(12, observaciones);
            cs.setString(13, conformidadNombre);
            cs.setString(14, conformidadDni);
            cs.execute();
        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
    }

    public void registrarConformidadTienda(Connection con, int idVenta, String nombre, String dni) throws SQLException {
        CallableStatement cs = null;
        try {
            cs = con.prepareCall("{CALL sp_registrar_conformidad_tienda(?, ?, ?)}");
            cs.setInt(1, idVenta);
            cs.setString(2, nombre);
            cs.setString(3, dni);
            cs.execute();
        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
    }

    public List<Map<String, Object>> buscarClientes(Connection con, String query) throws SQLException {
        CallableStatement cs = null;
        ResultSet rs = null;
        List<Map<String, Object>> clientes = new ArrayList<>();
        try {
            cs = con.prepareCall("{CALL sp_buscar_cliente(?)}");
            cs.setString(1, "%" + query + "%");
            rs = cs.executeQuery();

            while (rs.next()) {
                Map<String, Object> cliente = new HashMap<>();
                cliente.put("id", rs.getInt("id"));
                cliente.put("n_Documento", rs.getString("n_documento"));
                cliente.put("razonSocial", rs.getString("razonSocial"));
                clientes.add(cliente);
            }
        } catch (SQLException e) {
            throw e;
        } finally {
            if (rs != null) rs.close();
            if (cs != null) cs.close();
        }
        return clientes;
    }

    public List<Map<String, Object>> buscarArticulos(Connection con, String query) throws SQLException {
        CallableStatement cs = null;
        ResultSet rs = null;
        List<Map<String, Object>> articulos = new ArrayList<>();
        try {
            cs = con.prepareCall("{CALL sp_buscar_articulos_para_venta(?)}");
            cs.setString(1, "%" + query + "%");
            rs = cs.executeQuery();

            while (rs.next()) {
                Map<String, Object> articulo = new HashMap<>();
                articulo.put("id", rs.getInt("id"));
                articulo.put("codigo", rs.getString("codigo"));
                articulo.put("descripcion", rs.getString("descripcion"));
                articulo.put("precioUnitario", rs.getDouble("precio_venta"));
                articulo.put("pesoUnitario", rs.getDouble("peso_unitario"));
                articulo.put("cantidad", rs.getDouble("cantidad"));
                articulos.add(articulo);
            }
        } catch (SQLException e) {
            throw e;
        } finally {
            if (rs != null) rs.close();
            if (cs != null) cs.close();
        }
        return articulos;
    }

    public List<Map<String, Object>> buscarLotesDisponibles(Connection con, int idArticulo) throws SQLException {
        CallableStatement cs = null;
        ResultSet rs = null;
        List<Map<String, Object>> lotes = new ArrayList<>();

        try {
            cs = con.prepareCall("{CALL SP_VerLotesPorArticulo(?)}");
            cs.setInt(1, idArticulo);

            rs = cs.executeQuery();

            while (rs.next()) {
                Map<String, Object> lote = new HashMap<>();
                lote.put("lote", rs.getString("Codigo_Lote"));
                lote.put("cantidadDisponible", rs.getDouble("Cantidad_Disponible"));
                lote.put("vencimiento", rs.getString("Fecha_Vencimiento"));
                lotes.add(lote);
            }
        } catch (SQLException e) {
            throw e;
        } finally {
            if (rs != null) rs.close();
            if (cs != null) cs.close();
        }
        return lotes;
    }

    public List<Map<String, Object>> listarVentasConDetalles() throws SQLException {
        List<Map<String, Object>> ventas = new ArrayList<>();
        String sql = "{CALL sp_listar_ventas_final()}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql);
             ResultSet rs = cs.executeQuery()) {

            Map<Integer, Map<String, Object>> ventaMap = new LinkedHashMap<>();
            Map<Integer, Map<Integer, Map<String, Object>>> detalleTracker = new HashMap<>();
            Map<Integer, Map<Integer, Map<String, Object>>> descuentoGlobalTracker = new HashMap<>();
            Map<Integer, Map<Integer, Map<String, Object>>> descuentoItemTracker = new HashMap<>();

            while (rs.next()) {
                int idVenta = rs.getInt("id_venta");
                Map<String, Object> venta = ventaMap.get(idVenta);

                if (venta == null) {
                    venta = new LinkedHashMap<>();
                    venta.put("id_venta", idVenta);
                    java.sql.Date fechaEmision = rs.getDate("fecha_emision");
                    venta.put("fecha_emision", fechaEmision != null ? DATE_FORMATTER.format(fechaEmision) : null);
                    java.sql.Date fechaVencimiento = rs.getDate("fecha_vencimiento");
                    venta.put("fecha_vencimiento", fechaVencimiento != null ? DATE_FORMATTER.format(fechaVencimiento) : null);
                    venta.put("serie", rs.getString("serie"));
                    venta.put("correlativo", rs.getString("correlativo"));
                    venta.put("estado_venta", rs.getString("estado_venta"));
                    venta.put("tipo_descuento_cabecera", rs.getString("venta_tipo_descuento"));
                    venta.put("aplica_igv", rs.getBoolean("aplica_igv"));
                    venta.put("hay_traslado", rs.getBoolean("hay_traslado"));
                    venta.put("observaciones", rs.getString("venta_observaciones"));
                    venta.put("subtotal", rs.getBigDecimal("venta_subtotal"));
                    venta.put("igv", rs.getBigDecimal("venta_igv"));
                    venta.put("descuento_total", rs.getBigDecimal("venta_descuento_total"));
                    venta.put("total_final", rs.getBigDecimal("total_final"));
                    venta.put("total_peso", rs.getBigDecimal("venta_total_peso"));
                    venta.put("tipo_comprobante", rs.getString("tipo_comprobante"));
                    venta.put("moneda_nombre", rs.getString("moneda_nombre"));
                    venta.put("moneda_simbolo", rs.getString("moneda_simbolo"));
                    venta.put("tipo_pago_nombre", rs.getString("tipo_pago_nombre"));

                    Map<String, Object> cliente = new HashMap<>();
                    cliente.put("id", rs.getInt("id_cliente"));
                    cliente.put("n_documento", rs.getString("cliente_documento"));
                    cliente.put("razon_social", rs.getString("cliente_razon_social"));
                    cliente.put("direccion", rs.getString("cliente_direccion"));
                    cliente.put("telefono", rs.getString("cliente_telefono"));
                    venta.put("cliente", cliente);

                    venta.put("detalles", new ArrayList<>());
                    venta.put("descuentos_globales", new ArrayList<>());
                    venta.put("guia_transporte", null);
                    venta.put("conformidad", null);

                    ventaMap.put(idVenta, venta);
                    detalleTracker.put(idVenta, new LinkedHashMap<>());
                    descuentoGlobalTracker.put(idVenta, new LinkedHashMap<>());
                    descuentoItemTracker.put(idVenta, new LinkedHashMap<>());
                }

                Map<Integer, Map<String, Object>> currentDetalleMap = detalleTracker.get(idVenta);
                Map<Integer, Map<String, Object>> currentDescuentoGlobalMap = descuentoGlobalTracker.get(idVenta);
                Map<Integer, Map<String, Object>> currentDescuentoItemMap = descuentoItemTracker.get(idVenta);

                int idDetalle = rs.getInt("id_detalle_venta");
                if (idDetalle > 0) {
                    Map<String, Object> detalle = currentDetalleMap.get(idDetalle);
                    if (detalle == null) {
                        detalle = new LinkedHashMap<>();
                        detalle.put("id_detalle", idDetalle);
                        detalle.put("descripcion", rs.getString("detalle_descripcion"));
                        detalle.put("cantidad", rs.getBigDecimal("detalle_cantidad"));
                        detalle.put("peso_unitario", rs.getBigDecimal("detalle_peso_unitario"));
                        detalle.put("precio_unitario", rs.getBigDecimal("detalle_precio_unitario"));
                        detalle.put("descuento_monto", rs.getBigDecimal("detalle_descuento_monto"));
                        detalle.put("subtotal", rs.getBigDecimal("detalle_subtotal"));
                        detalle.put("total", rs.getBigDecimal("detalle_total"));

                        Map<String, Object> articulo = new HashMap<>();
                        articulo.put("id", rs.getInt("id_articulo"));
                        articulo.put("codigo", rs.getString("articulo_codigo"));
                        articulo.put("unidad_medida_nombre", rs.getString("unidad_medida_nombre"));
                        detalle.put("articulo", articulo);

                        detalle.put("lotes_consumidos", new ArrayList<>());
                        detalle.put("descuentos_item", new ArrayList<>());

                        ((List<Map<String, Object>>) venta.get("detalles")).add(detalle);
                        currentDetalleMap.put(idDetalle, detalle);
                    }

                    int idLoteVenta = rs.getInt("id_lote_venta");
                    if (idLoteVenta > 0) {
                        List<Map<String, Object>> lotesList = (List<Map<String, Object>>) detalle.get("lotes_consumidos");
                        if (lotesList.stream().noneMatch(l -> ((Integer) l.get("id_lote_venta")).equals(idLoteVenta))) {
                            Map<String, Object> lote = new LinkedHashMap<>();
                            lote.put("id_lote_venta", idLoteVenta);
                            lote.put("id_lote_inventario", rs.getInt("id_lote"));
                            lote.put("codigo_lote", rs.getString("codigo_lote"));
                            lote.put("cantidad_consumida", rs.getBigDecimal("lote_cantidad_consumida"));
                            java.sql.Date fechaVencimientoLote = rs.getDate("lote_fecha_vencimiento");
                            lote.put("fecha_vencimiento", fechaVencimientoLote != null ? DATE_FORMATTER.format(fechaVencimientoLote) : null);
                            lotesList.add(lote);
                        }
                    }
                }

                int idDescuento = rs.getInt("id_descuento");
                String tipoAplicacion = rs.getString("descuento_aplicacion");
                if (idDescuento > 0 && tipoAplicacion != null) {
                    Map<String, Object> descuento = new LinkedHashMap<>();
                    descuento.put("id_descuento", idDescuento);
                    descuento.put("motivo", rs.getString("descuento_motivo"));
                    descuento.put("tipo_valor", rs.getString("descuento_tipo_valor"));
                    descuento.put("valor", rs.getBigDecimal("descuento_valor"));
                    descuento.put("tasa_igv", rs.getBigDecimal("descuento_tasa_igv"));

                    if ("global".equals(tipoAplicacion)) {
                        if (currentDescuentoGlobalMap.get(idDescuento) == null) {
                            ((List<Map<String, Object>>) venta.get("descuentos_globales")).add(descuento);
                            currentDescuentoGlobalMap.put(idDescuento, descuento);
                        }
                    } else if ("item".equals(tipoAplicacion) && idDetalle > 0) {
                        int claveCompuesta = idDetalle * 10000 + idDescuento;
                        if (currentDescuentoItemMap.get(claveCompuesta) == null) {
                            Map<String, Object> detalleActual = currentDetalleMap.get(idDetalle);
                            if (detalleActual != null) {
                                ((List<Map<String, Object>>) detalleActual.get("descuentos_item")).add(descuento);
                                currentDescuentoItemMap.put(claveCompuesta, descuento);
                            }
                        }
                    }
                }

                int idGuia = rs.getInt("id_guia");
                if (idGuia > 0 && venta.get("guia_transporte") == null) {
                    Map<String, Object> guiaMap = new HashMap<>();
                    guiaMap.put("id_guia", idGuia);
                    guiaMap.put("modalidad_transporte", rs.getString("modalidad_transporte"));
                    guiaMap.put("ruc_empresa", rs.getString("transporte_ruc_empresa"));
                    guiaMap.put("razon_social_empresa", rs.getString("transporte_razon_social"));
                    guiaMap.put("dni_conductor", rs.getString("transporte_dni_conductor"));
                    guiaMap.put("nombre_conductor", rs.getString("transporte_nombre_conductor"));
                    guiaMap.put("punto_partida", rs.getString("punto_partida"));
                    guiaMap.put("punto_llegada", rs.getString("punto_llegada"));
                    java.sql.Date fechaTraslado = rs.getDate("fecha_traslado");
                    guiaMap.put("fecha_traslado", fechaTraslado != null ? DATE_FORMATTER.format(fechaTraslado) : null);
                    venta.put("guia_transporte", guiaMap);
                }

                String nombreConformidad = rs.getString("nombre_cliente_confirma");
                if (nombreConformidad != null && venta.get("conformidad") == null) {
                    Map<String, Object> conformidadMap = new HashMap<>();
                    conformidadMap.put("nombre_cliente_confirma", nombreConformidad);
                    conformidadMap.put("dni_cliente_confirma", rs.getString("dni_cliente_confirma"));
                    conformidadMap.put("tipo_entrega", rs.getString("tipo_entrega"));
                    venta.put("conformidad", conformidadMap);
                }
            }
            ventas.addAll(ventaMap.values());
        }
        return ventas;
    }
}