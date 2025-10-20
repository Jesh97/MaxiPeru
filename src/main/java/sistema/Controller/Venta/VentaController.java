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

    public int registrarVenta(Connection con, int idCliente, int idTipoComprobante, int idMoneda, String fechaEmision,
                              String fechaVencimiento, int idTipoPago, String estadoVenta, String tipoDescuento,
                              boolean aplicaIgv, String observaciones, double subtotal, double igv,
                              double descuentoTotal, double totalFinal, double totalPeso, boolean hayTraslado,
                              String serie, String correlativo)
            throws SQLException {
        CallableStatement cs = null;
        int idVenta = 0;
        try {
            cs = con.prepareCall("{CALL sp_registrar_venta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}");
            cs.setInt(1, idCliente);
            cs.setInt(2, idTipoComprobante);
            cs.setInt(3, idMoneda);
            cs.setString(4, fechaEmision);
            if (fechaVencimiento == null || fechaVencimiento.isEmpty()) {
                cs.setNull(5, Types.DATE);
            } else {
                cs.setString(5, fechaVencimiento);
            }
            cs.setInt(6, idTipoPago);
            cs.setString(7, estadoVenta);
            cs.setString(8, tipoDescuento);
            cs.setBoolean(9, aplicaIgv);
            cs.setString(10, observaciones);
            cs.setDouble(11, subtotal);
            cs.setDouble(12, igv);
            cs.setDouble(13, descuentoTotal);
            cs.setDouble(14, totalFinal);
            cs.setDouble(15, totalPeso);
            cs.setBoolean(16, hayTraslado);
            cs.setString(17, serie);
            cs.setString(18, correlativo);
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

    public void agregarDescuentoGlobalVenta(Connection con, int idVenta, String motivo, String tipoValor, double valor) throws SQLException {
        CallableStatement cs = null;
        try {
            cs = con.prepareCall("{CALL sp_agregar_descuento_global_venta(?, ?, ?, ?, ?)}");
            cs.setInt(1, idVenta);
            cs.setString(2, motivo);
            cs.setString(3, tipoValor);
            cs.setDouble(4, valor);
            cs.setNull(5, Types.DECIMAL);
            cs.execute();
        } catch (SQLException e) {
            throw e;
        } finally {
            if (cs != null) cs.close();
        }
    }

    public void agregarDescuentoItemVenta(Connection con, int idDetalleVenta, String motivo, String tipoValor, double valor) throws SQLException {
        CallableStatement cs = null;
        try {
            cs = con.prepareCall("{CALL sp_agregar_descuento_item_venta(?, ?, ?, ?, ?)}");
            cs.setInt(1, idDetalleVenta);
            cs.setString(2, motivo);
            cs.setString(3, tipoValor);
            cs.setDouble(4, valor);
            cs.setNull(5, Types.DECIMAL);
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

    public void registrarConsumoLoteVenta(Connection con, int idDetalleVenta, int idArticulo, double cantidadAConsumir) throws SQLException {
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
                    venta.put("tipo_descuento_cabecera", rs.getString("tipo_descuento_cabecera"));
                    venta.put("aplica_igv", rs.getBoolean("aplica_igv"));
                    venta.put("hay_traslado", rs.getBoolean("hay_traslado"));
                    venta.put("observaciones", rs.getString("observaciones"));
                    venta.put("subtotal", rs.getBigDecimal("subtotal"));
                    venta.put("igv", rs.getBigDecimal("igv"));
                    venta.put("descuento_total", rs.getBigDecimal("descuento_total"));
                    venta.put("total_final", rs.getBigDecimal("total_final"));
                    venta.put("total_peso", rs.getBigDecimal("total_peso"));
                    venta.put("id_tipo_comprobante", rs.getInt("id_tipo_comprobante"));
                    venta.put("tipo_comprobante", rs.getString("tipo_comprobante"));
                    venta.put("id_moneda", rs.getInt("id_moneda"));
                    venta.put("moneda", rs.getString("moneda"));
                    venta.put("id_tipo_pago", rs.getInt("id_tipo_pago"));
                    venta.put("tipo_pago", rs.getString("tipo_pago"));

                    Map<String, Object> cliente = new HashMap<>();
                    cliente.put("id", rs.getInt("id_cliente"));
                    cliente.put("n_documento", rs.getString("cliente_documento"));
                    cliente.put("razon_social", rs.getString("cliente_razon_social"));
                    cliente.put("tipo_documento", rs.getString("cliente_tipo_documento"));
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

                int idDetalle = rs.getInt("id_detalle");
                if (idDetalle > 0) {
                    Map<String, Object> detalle = currentDetalleMap.get(idDetalle);
                    if (detalle == null) {
                        detalle = new LinkedHashMap<>();
                        detalle.put("id_detalle", idDetalle);
                        detalle.put("cantidad", rs.getBigDecimal("cantidad_detalle"));
                        detalle.put("precio_unitario", rs.getBigDecimal("precio_unitario"));
                        detalle.put("descuento_monto_item", rs.getBigDecimal("descuento_monto_item"));
                        detalle.put("subtotal_detalle", rs.getBigDecimal("subtotal_detalle"));
                        detalle.put("total_detalle", rs.getBigDecimal("total_detalle"));

                        Map<String, Object> articulo = new HashMap<>();
                        articulo.put("id", rs.getInt("id_articulo"));
                        articulo.put("codigo", rs.getString("codigo_articulo"));
                        articulo.put("descripcion", rs.getString("descripcion_articulo"));
                        articulo.put("id_unidad", rs.getInt("id_unidad_medida"));
                        articulo.put("unidad_medida", rs.getString("unidad_medida"));
                        detalle.put("articulo", articulo);

                        detalle.put("lotes_consumidos", new ArrayList<>());
                        detalle.put("descuentos_item", new ArrayList<>());

                        ((List<Map<String, Object>>) venta.get("detalles")).add(detalle);
                        currentDetalleMap.put(idDetalle, detalle);
                    }

                    int idLoteVenta = rs.getInt("id_lote_venta");
                    if (idLoteVenta > 0) {
                        List<Map<String, Object>> lotesList = (List<Map<String, Object>>) detalle.get("lotes_consumidos");
                        if (lotesList.stream().noneMatch(l -> l.get("id_lote_venta").equals(idLoteVenta))) {
                            Map<String, Object> lote = new LinkedHashMap<>();
                            lote.put("id_lote_venta", idLoteVenta);
                            lote.put("id_lote_inventario", rs.getInt("id_lote"));
                            lote.put("codigo_lote", rs.getString("codigo_lote"));
                            lote.put("cantidad_consumida", rs.getBigDecimal("cantidad_consumida_lote"));
                            java.sql.Date fechaVencimientoLote = rs.getDate("fecha_vencimiento_lote");
                            lote.put("fecha_vencimiento", fechaVencimientoLote != null ? DATE_FORMATTER.format(fechaVencimientoLote) : null);
                            lotesList.add(lote);
                        }
                    }
                }

                int idDescuento = rs.getInt("id_descuento");
                String tipoAplicacion = rs.getString("tipo_aplicacion");
                if (idDescuento > 0 && tipoAplicacion != null) {
                    Map<String, Object> descuento = new LinkedHashMap<>();
                    descuento.put("id_descuento", idDescuento);
                    descuento.put("motivo", rs.getString("motivo_descuento"));
                    descuento.put("tipo_valor", rs.getString("tipo_valor_descuento"));
                    descuento.put("valor", rs.getBigDecimal("valor_descuento"));
                    descuento.put("tasa_igv", rs.getBigDecimal("tasa_igv_descuento"));

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

                String serieGuia = rs.getString("serie_guia_transporte");
                if (serieGuia != null && !serieGuia.trim().isEmpty() && venta.get("guia_transporte") == null) {
                    Map<String, Object> guiaMap = new HashMap<>();
                    guiaMap.put("serie_guia_transporte", serieGuia);
                    guiaMap.put("correlativo_guia_transporte", rs.getString("correlativo_guia_transporte"));
                    guiaMap.put("modalidad_transporte", rs.getString("modalidad_transporte"));
                    guiaMap.put("ruc_empresa", rs.getString("ruc_empresa"));
                    guiaMap.put("razon_social_empresa", rs.getString("razon_social_empresa"));
                    guiaMap.put("dni_conductor", rs.getString("dni_conductor"));
                    guiaMap.put("nombre_conductor", rs.getString("nombre_conductor"));
                    guiaMap.put("punto_partida", rs.getString("punto_partida"));
                    guiaMap.put("punto_llegada", rs.getString("punto_llegada"));
                    java.sql.Date fechaTraslado = rs.getDate("fecha_traslado");
                    guiaMap.put("fecha_traslado", fechaTraslado != null ? DATE_FORMATTER.format(fechaTraslado) : null);
                    guiaMap.put("peso_guia", rs.getBigDecimal("peso_guia"));
                    venta.put("guia_transporte", guiaMap);
                }

                if (rs.getInt("id_conformidad") > 0 && venta.get("conformidad") == null) {
                    Map<String, Object> conformidadMap = new HashMap<>();
                    conformidadMap.put("id_conformidad", rs.getInt("id_conformidad"));
                    conformidadMap.put("nombre_cliente_confirma", rs.getString("nombre_cliente_confirma"));
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