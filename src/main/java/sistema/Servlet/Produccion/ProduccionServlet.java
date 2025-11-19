package sistema.Servlet.Produccion;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import sistema.Controller.Produccion.ProduccionController;
import sistema.repository.ProduccionRepository;
import sistema.Ejecucion.Auditoria;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import com.google.gson.Gson;

@WebServlet("/ProduccionServlet")
public class ProduccionServlet extends HttpServlet {

    private ProduccionRepository dao;
    private final Gson gson = new Gson();

    @Override
    public void init() {
        dao = new ProduccionController();
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        String action = request.getParameter("action");
        String mensaje = "";
        HttpSession session = request.getSession();

        int idRecetaActiva;
        Integer idOrdenActiva = (Integer) session.getAttribute("idOrdenActiva");

        if (action == null || action.trim().isEmpty()) {
            action = "error_accion_no_especificada";
        }

        Map<String, Object> jsonResponse = new LinkedHashMap<>();

        try {
            switch (action) {
                case "crear_receta_y_componentes" -> {
                    String idProdMaestroStr = request.getParameter("p_id_art_ter_hidden");
                    String cantProdStr = request.getParameter("p_cant_prod");
                    String idUniProdStr = request.getParameter("p_id_unidad_producir");

                    if (idProdMaestroStr == null || idUniProdStr == null || cantProdStr == null) {
                        throw new IllegalArgumentException("Datos principales de la receta (ID de producto maestro, cantidad o ID de unidad) están ausentes.");
                    }

                    int idProductoMaestro = Integer.parseInt(idProdMaestroStr);
                    BigDecimal cantProd = new BigDecimal(cantProdStr);
                    int idUniProd = Integer.parseInt(idUniProdStr);

                    idRecetaActiva = dao.crearReceta(idProductoMaestro, cantProd, idUniProd);
                    session.setAttribute("idRecetaActiva", idRecetaActiva);

                    String[] idArtInsumoArr = request.getParameterValues("p_id_art_insumo_hidden[]");
                    String[] cantReqArr = request.getParameterValues("p_cant_req[]");
                    String[] idUniInsumoArr = request.getParameterValues("p_id_uni_insumo_hidden[]");

                    int componentesGuardados = 0;
                    if (idArtInsumoArr != null) {
                        for (int i = 0; i < idArtInsumoArr.length; i++) {
                            int idArtInsumo = Integer.parseInt(idArtInsumoArr[i]);
                            int idUniInsumo = Integer.parseInt(idUniInsumoArr[i]);
                            BigDecimal cantReq = new BigDecimal(cantReqArr[i]);

                            dao.agregarDetalleReceta(idRecetaActiva, idArtInsumo, cantReq, idUniInsumo);
                            componentesGuardados++;
                        }
                    }

                    Auditoria.registrar(request, "CREACION", "Receta de Producción creada. ID: " + idRecetaActiva + ". Componentes: " + componentesGuardados);
                    mensaje = "Fórmula y sus " + componentesGuardados + " componentes guardados con éxito en Receta ID: " + idRecetaActiva;
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", mensaje);
                    jsonResponse.put("id_receta", idRecetaActiva);
                }
                case "actualizar_detalle_receta" -> {
                    String idDetalleRecetaStr = request.getParameter("p_id_detalle_receta");
                    String cantReqStr = request.getParameter("p_cant_req");
                    String idUniInsumoStr = request.getParameter("p_id_uni_insumo");

                    if (idDetalleRecetaStr == null || cantReqStr == null || idUniInsumoStr == null) {
                        throw new IllegalArgumentException("Datos para actualizar el detalle de la receta están incompletos.");
                    }

                    int idDetalleReceta = Integer.parseInt(idDetalleRecetaStr);
                    BigDecimal cantReq = new BigDecimal(cantReqStr);
                    int idUniInsumo = Integer.parseInt(idUniInsumoStr);

                    dao.actualizarInsumoReceta(idDetalleReceta, cantReq, idUniInsumo);
                    Auditoria.registrar(request, "MODIFICACION", "Insumo de Receta actualizado. Detalle ID: " + idDetalleReceta + ". Nueva Cantidad: " + cantReqStr);
                    mensaje = "Detalle de Receta ID " + idDetalleReceta + " actualizado correctamente.";
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", mensaje);
                }
                case "eliminar_detalle_receta" -> {
                    String idDetalleRecetaStr = request.getParameter("p_id_detalle_receta");

                    if (idDetalleRecetaStr == null) {
                        throw new IllegalArgumentException("ID de Detalle de Receta para eliminar está ausente.");
                    }

                    int idDetalleReceta = Integer.parseInt(idDetalleRecetaStr);
                    dao.eliminarDetalleRecetaIndividual(idDetalleReceta);
                    Auditoria.registrar(request, "ELIMINACION", "Insumo de Receta eliminado. Detalle ID: " + idDetalleReceta);
                    mensaje = "Insumo (Detalle ID " + idDetalleReceta + ") eliminado de la receta.";
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", mensaje);
                }
                case "desactivar_receta" -> {
                    String idRecetaStr = request.getParameter("p_id_receta");

                    if (idRecetaStr == null) {
                        throw new IllegalArgumentException("ID de Receta para desactivar está ausente.");
                    }

                    int idReceta = Integer.parseInt(idRecetaStr);
                    dao.desactivarReceta(idReceta);
                    Auditoria.registrar(request, "MODIFICACION", "Receta desactivada. ID: " + idReceta);
                    mensaje = "Receta ID " + idReceta + " desactivada correctamente.";
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", mensaje);
                }
                case "crear_orden" -> {
                    String idRecetaStr = request.getParameter("p_id_receta_orden_hidden");
                    String cantProdStr = request.getParameter("p_cant_prod_orden");
                    String idArtProducidoStr = request.getParameter("p_id_art_producido_orden_hidden");
                    String cantProdFinalRealStr = request.getParameter("p_cant_prod_final_real");

                    if (idRecetaStr == null || idRecetaStr.isEmpty())
                        throw new IllegalArgumentException("El ID de la Receta es requerido.");
                    if (cantProdStr == null || cantProdStr.isEmpty())
                        throw new IllegalArgumentException("La Cantidad a Producir es requerida.");
                    if (idArtProducidoStr == null || idArtProducidoStr.isEmpty())
                        throw new IllegalArgumentException("El ID del Artículo Producido es requerido.");
                    if (cantProdFinalRealStr == null || cantProdFinalRealStr.isEmpty())
                        throw new IllegalArgumentException("La Cantidad Producida Final es requerida.");

                    idRecetaActiva = Integer.parseInt(idRecetaStr);
                    session.setAttribute("idRecetaActiva", idRecetaActiva);

                    BigDecimal cantProd = new BigDecimal(cantProdStr);
                    BigDecimal cantProdFinalReal = new BigDecimal(cantProdFinalRealStr);
                    String fechaIni = request.getParameter("p_fecha_ini_orden");
                    String obs = request.getParameter("p_obs_orden");

                    if (fechaIni == null) fechaIni = "";
                    if (obs == null) obs = "";

                    int idArticuloProducido = Integer.parseInt(idArtProducidoStr);

                    idOrdenActiva = dao.crearOrden(idRecetaActiva, idArticuloProducido, cantProd, cantProdFinalReal, fechaIni, obs);
                    session.setAttribute("idOrdenActiva", idOrdenActiva);

                    Auditoria.registrar(request, "CREACION", "Orden de Producción creada. ID: " + idOrdenActiva + ". Receta ID: " + idRecetaActiva);

                    String nombreArticulo = "";
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", "Orden de Producción " + idOrdenActiva + " creada. Ejecute el consumo de MP.");
                    jsonResponse.put("id_orden", idOrdenActiva);
                    jsonResponse.put("id_articulo_terminado", idArticuloProducido);
                    jsonResponse.put("nombre_articulo_terminado", nombreArticulo);
                }

                case "ejecutar_consumo" -> {
                    if (idOrdenActiva == null) throw new IllegalArgumentException("No hay una Orden Activa.");
                    dao.gestionarConsumoMateriaPrima(idOrdenActiva);
                    Auditoria.registrar(request, "PROCESO", "Consumo automático de Materia Prima ejecutado para Orden ID: " + idOrdenActiva);
                    mensaje = "Consumo de Materia Prima ejecutado. Orden en estado 'En Proceso'.";
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", mensaje);
                }

                case "registrar_consumo_componente" -> {
                    String idOrdenStr = request.getParameter("p_id_orden");
                    if (idOrdenStr == null) throw new IllegalArgumentException("No hay una Orden Activa.");
                    int idArticuloConsumido = Integer.parseInt(request.getParameter("p_id_articulo_consumido"));
                    BigDecimal cantidadAConsumir = new BigDecimal(request.getParameter("p_cantidad_consumida"));
                    int idUnidad = Integer.parseInt(request.getParameter("p_id_unidad"));
                    boolean esEnvase = "true".equalsIgnoreCase(request.getParameter("p_es_envase"));
                    String comentarioConsumo = request.getParameter("p_comentario_consumo");
                    int ordenId = Integer.parseInt(idOrdenStr);
                    dao.registrarConsumoComponente(ordenId, idArticuloConsumido, cantidadAConsumir, idUnidad, esEnvase, comentarioConsumo);
                    Auditoria.registrar(request, "OPERACION", "Consumo manual en Orden ID: " + ordenId + ". Artículo: " + idArticuloConsumido + ". Cantidad: " + cantidadAConsumir);
                    mensaje = "Consumo manual registrado en la Orden " + ordenId + ".";
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", mensaje);
                }

                case "consumo_envase_tapa_etiqueta_multiple_step" -> {
                    String ordenCode = request.getParameter("p_codigo_orden");
                    String idArtTerStr = request.getParameter("p_id_art_ter_empaque");
                    String loteCode = request.getParameter("p_codigo_lote_generado");
                    String idEtiquetaStr = request.getParameter("p_id_etiqueta_principal");

                    if (ordenCode == null || idArtTerStr == null || loteCode == null || idEtiquetaStr == null) {
                        throw new IllegalArgumentException("Datos de empaque incompletos: Orden, Artículo Terminado, Lote o Etiqueta faltantes.");
                    }

                    String[] idContainerArr = request.getParameterValues("p_id_componente_container[]");
                    String[] capacidadNumericArr = request.getParameterValues("p_capacidad_numeric[]");
                    String[] capacidadUnidadArr = request.getParameterValues("p_capacidad_unidad[]");
                    String[] cantEnvaseArr = request.getParameterValues("p_cant_a_empacar_final[]");
                    String[] idTapaArr = request.getParameterValues("p_id_componente_cap[]");

                    if (idContainerArr == null || idContainerArr.length == 0) {
                        throw new IllegalArgumentException("No se recibieron detalles de envases.");
                    }

                    List<Map<String, Object>> detallesEnvase = new ArrayList<>();
                    int totalContainers = 0;

                    for (int i = 0; i < idContainerArr.length; i++) {
                        int idContainer = Integer.parseInt(idContainerArr[i]);
                        BigDecimal capacidadNum = new BigDecimal(capacidadNumericArr[i]);
                        String capacidadUni = capacidadUnidadArr[i];
                        int cantidad = Integer.parseInt(cantEnvaseArr[i]);
                        int idTapa = Integer.parseInt(idTapaArr[i]);

                        Map<String, Object> detalle = new LinkedHashMap<>();
                        detalle.put("idContainer", idContainer);
                        detalle.put("capacidadNum", capacidadNum);
                        detalle.put("capacidadUni", capacidadUni);
                        detalle.put("cantidad", cantidad);
                        detalle.put("idTapa", idTapa);
                        detallesEnvase.add(detalle);

                        totalContainers += cantidad;
                    }

                    Auditoria.registrar(request, "OPERACION", "Registro de empaque múltiple (Envases/Tapas/Etiquetas) para Orden: " + ordenCode);

                    mensaje = "Consumo de " + totalContainers + " envases (múltiples tipos) y etiqueta registrado para la Orden " + ordenCode;
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", mensaje);

                }
                case "consumo_empaque_step" -> {
                    String ordenCode = request.getParameter("p_codigo_orden");
                    String idComponenteStr = request.getParameter("p_id_componente_seleccionado");
                    String cantEmpacadaStr = request.getParameter("p_cant_a_empacar_final");

                    if (ordenCode == null || idComponenteStr == null || cantEmpacadaStr == null) {
                        throw new IllegalArgumentException("Datos de empaque secundario incompletos.");
                    }

                    int idComponente = Integer.parseInt(idComponenteStr);
                    Auditoria.registrar(request, "OPERACION", "Consumo de empaque secundario ID: " + idComponente + " para Orden: " + ordenCode);
                    mensaje = "Consumo de empaque secundario (ID " + idComponente + ") registrado para la Orden " + ordenCode;
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", mensaje);
                }
                case "registrar_merma_y_cierre_empaque" -> {
                    if (idOrdenActiva == null) throw new IllegalArgumentException("No hay una Orden Activa.");

                    BigDecimal mermaCantidad = new BigDecimal(request.getParameter("p_merma_cantidad"));
                    BigDecimal envasesSueltos = new BigDecimal(request.getParameter("p_envases_sueltos"));

                    dao.gestionarConsumoEnvase(idOrdenActiva, mermaCantidad, envasesSueltos);
                    Auditoria.registrar(request, "PROCESO", "Merma (" + mermaCantidad + ") y envases sueltos registrados. Cierre de empaque para Orden ID: " + idOrdenActiva);
                    mensaje = "Merma (" + mermaCantidad + ") y envases sueltos registrados. Etapa de empaque cerrada.";
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", mensaje);
                }
                case "registrar_lote" -> {
                    if (idOrdenActiva == null)
                        throw new IllegalArgumentException("No hay una Orden Activa para registrar lotes.");

                    String cantidadStr = request.getParameter("p_cant_lote");
                    String codigoStr = request.getParameter("p_cod_lote");
                    String fechaVencimientoStr = request.getParameter("p_fecha_vencimiento");

                    if (cantidadStr == null || codigoStr == null || fechaVencimientoStr == null) {
                        throw new IllegalArgumentException("Faltan datos del lote (cantidad, código o fecha de vencimiento).");
                    }

                    BigDecimal cantidad = new BigDecimal(cantidadStr);

                    Map<String, Object> loteUnico = new LinkedHashMap<>();
                    loteUnico.put("cantidad", cantidad);
                    loteUnico.put("codigo_lote", codigoStr);
                    loteUnico.put("fecha_vencimiento", fechaVencimientoStr);

                    List<Map<String, Object>> lotes = new ArrayList<>();
                    lotes.add(loteUnico);

                    dao.registrarLotes(idOrdenActiva, lotes);

                    Auditoria.registrar(request, "OPERACION", "Lote registrado. Código: " + codigoStr + " para Orden ID: " + idOrdenActiva);

                    mensaje = "Se registró el Lote: " + codigoStr + " para la Orden " + idOrdenActiva;

                    jsonResponse.put("success", true);
                    jsonResponse.put("message", mensaje);
                }
                case "finalizar_orden" -> {
                    if (idOrdenActiva == null)
                        throw new IllegalArgumentException("No hay una Orden Activa para finalizar.");
                    dao.finalizarOrden(idOrdenActiva);

                    Auditoria.registrar(request, "FINALIZACION", "Orden de Producción FINALIZADA. ID: " + idOrdenActiva);

                    session.removeAttribute("idRecetaActiva");
                    session.removeAttribute("idOrdenActiva");
                    mensaje = "Orden de Producción " + idOrdenActiva + " **FINALIZADA** con éxito.";

                    jsonResponse.put("success", true);
                    jsonResponse.put("message", mensaje);
                }
                case "error_accion_no_especificada" ->
                        throw new IllegalArgumentException("Error: La solicitud POST no especificó ninguna acción (parámetro 'action' nulo).");
                default -> throw new IllegalArgumentException("Acción desconocida: " + action);
            }

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(gson.toJson(jsonResponse));

        } catch (SQLException e) {
            mensaje = "Error de Base de Datos al procesar la acción: **" + action + "**. Detalle: " + e.getMessage() + ". Código SQL: " + e.getSQLState();
            jsonResponse.put("success", false);
            jsonResponse.put("message", mensaje);

            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(gson.toJson(jsonResponse));

        } catch (Exception e) {
            mensaje = "Error inesperado en la Aplicación. Tipo de error: **" + e.getClass().getName() + "**. Detalle: " + e.getMessage();
            jsonResponse.put("success", false);
            jsonResponse.put("message", mensaje);

            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(gson.toJson(jsonResponse));
        }
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String action = request.getParameter("action");
        String busqueda = request.getParameter("busqueda");

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        if (action == null || action.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Acción no especificada en GET.\"}");
            return;
        }

        try {
            List<Map<String, Object>> resultados = new ArrayList<>();

            switch (action) {
                case "buscar_articulos_terminados" -> resultados = dao.buscarArticulosTerminados(busqueda);
                case "buscar_articulos_insumos" -> resultados = dao.buscarArticulosInsumos(busqueda);
                case "buscar_articulos_embalado_y_embalaje" -> resultados = dao.buscarArticulosEmbalaje(busqueda);
                case "obtener_presentaciones_pm" -> {
                    String idPmStr = request.getParameter("id_pm");
                    if (idPmStr == null || idPmStr.isEmpty()) {
                        throw new IllegalArgumentException("ID de Producto Maestro no especificado.");
                    }
                    int idProductoMaestro = Integer.parseInt(idPmStr);

                    List<String> presentaciones = dao.obtenerPresentacionesPorProductoMaestro(idProductoMaestro);
                    response.getWriter().write(gson.toJson(presentaciones));
                    return;
                }
                case "obtener_receta_por_nombre_generico" -> {
                    String nombreGenerico = request.getParameter("nombre_generico");
                    if (nombreGenerico == null || nombreGenerico.isEmpty()) {
                        throw new IllegalArgumentException("El nombre genérico es requerido.");
                    }

                    resultados = dao.obtenerRecetaPorNombreGenerico(nombreGenerico);
                }
                case "listar_recetas" -> resultados = dao.listarRecetasConDetalles();
                case "generar_codigo_lote" -> {
                    String idOrdenStr = request.getParameter("id_orden");
                    if (idOrdenStr == null || idOrdenStr.isEmpty()) {
                        throw new IllegalArgumentException("ID de Orden no especificado para generar lote.");
                    }
                    int idOrden = Integer.parseInt(idOrdenStr);

                    String codigoLoteGenerado = dao.generarCodigoLote(idOrden);

                    Map<String, Object> jsonResponse = new LinkedHashMap<>();
                    jsonResponse.put("success", true);
                    jsonResponse.put("codigo_lote", codigoLoteGenerado);
                    response.getWriter().write(gson.toJson(jsonResponse));
                    return;
                }
                case "obtener_insumos_receta" -> {
                    String idRecetaStr = request.getParameter("id_receta");
                    if (idRecetaStr == null || idRecetaStr.isEmpty()) {
                        throw new IllegalArgumentException("ID de Receta no especificado.");
                    }
                    int idReceta = Integer.parseInt(idRecetaStr);

                    resultados = dao.obtenerInsumosPorIdReceta(idReceta);
                }
                case "obtener_consumo_total_orden" -> {
                    String idOrdenStr = request.getParameter("id_orden");
                    if (idOrdenStr == null || idOrdenStr.isEmpty()) {
                        throw new IllegalArgumentException("ID de Orden no especificado.");
                    }
                    int idOrden = Integer.parseInt(idOrdenStr);
                    resultados = dao.obtenerConsumoTotalPorOrden(idOrden);
                }
                default -> throw new IllegalArgumentException("Acción de consulta no válida: **" + action + "**");
            }

            response.getWriter().write(gson.toJson(resultados));

        } catch (Exception e) {
            String errorDetalle;
            if (e instanceof IllegalArgumentException) {
                errorDetalle = "Error de Datos/Argumento: " + e.getMessage();
            } else if (e instanceof SQLException sqlE) {
                errorDetalle = "Error de Base de Datos: " + sqlE.getMessage() + " (SQL State: " + sqlE.getSQLState() + ")";
            } else {
                errorDetalle = "Error Inesperado (" + e.getClass().getName() + "): " + e.getMessage();
            }

            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"Error al procesar la solicitud GET (" + action + "): **" + errorDetalle.replace("\"", "\\\"") + "**\"}");
        }
    }
}