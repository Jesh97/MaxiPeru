package sistema.Servlet.Produccion;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import sistema.Controller.Produccion.ProduccionController;
import sistema.Ejecucion.Auditoria;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import com.google.gson.Gson;
import sistema.repository.ProducionRepository;

@WebServlet("/ProduccionServlet")
public class ProduccionServlet extends HttpServlet {

    private ProducionRepository dao;
    private final Gson gson = new Gson();

    @Override
    public void init(){ dao = new ProduccionController(); }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        String action = request.getParameter("action");
        String mensaje;
        HttpSession session = request.getSession();

        int idRecetaActiva;
        Integer idOrdenActiva = (Integer) session.getAttribute("idOrdenActiva");
        String nombreArticuloActivo = (String) session.getAttribute("nombreArticuloActivo");

        if (nombreArticuloActivo == null) {
            nombreArticuloActivo = "Artículo Desconocido";
        }

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
                    String nombreProductoReceta = request.getParameter("p_nombre_art_ter_receta");

                    if (idProdMaestroStr == null || idUniProdStr == null || cantProdStr == null) {
                        throw new IllegalArgumentException("Datos principales de la receta están ausentes.");
                    }

                    int idProductoMaestro = Integer.parseInt(idProdMaestroStr);
                    double cantProd = Double.parseDouble(cantProdStr);
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
                            double cantReq = Double.parseDouble(cantReqArr[i]);

                            dao.agregarDetalleReceta(idRecetaActiva, idArtInsumo, cantReq, idUniInsumo);
                            componentesGuardados++;
                        }
                    }

                    Auditoria.registrar(request, "CREACION", "Receta de Producción creada. ID: " + idRecetaActiva);
                    mensaje = "Fórmula para " + (nombreProductoReceta != null ? nombreProductoReceta : "Receta ID: " + idRecetaActiva) + " guardada con éxito.";
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", mensaje);
                    jsonResponse.put("id_receta", idRecetaActiva);
                }

                case "agregar_detalle_receta" -> {
                    idRecetaActiva = Integer.parseInt(request.getParameter("p_id_receta"));
                    int idArtInsumo = Integer.parseInt(request.getParameter("p_id_articulo"));
                    int idUniInsumo = Integer.parseInt(request.getParameter("p_id_unidad"));
                    double cantReq = Double.parseDouble(request.getParameter("p_cantidad_requerida"));
                    String nombreArticulo = request.getParameter("p_nombre_articulo");

                    dao.agregarDetalleReceta(idRecetaActiva, idArtInsumo, cantReq, idUniInsumo);

                    Auditoria.registrar(request, "MODIFICACION", "Insumo agregado a Receta ID: " + idRecetaActiva);
                    mensaje = "Insumo " + (nombreArticulo != null ? nombreArticulo : "ID: " + idArtInsumo) + " agregado.";
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", mensaje);
                    jsonResponse.put("id_receta", idRecetaActiva);
                }

                case "actualizar_detalle_receta", "modificar_detalle_receta" -> {
                    String idDetalleRecetaStr = request.getParameter("p_id_detalle_receta");
                    String cantReqStr = request.getParameter("p_cantidad_requerida");
                    String idUniInsumoStr = request.getParameter("p_id_unidad");
                    String nombreInsumo = request.getParameter("p_nombre_articulo");

                    if (idDetalleRecetaStr == null || cantReqStr == null || idUniInsumoStr == null) {
                        throw new IllegalArgumentException("Datos incompletos para actualizar.");
                    }

                    int idDetalleReceta = Integer.parseInt(idDetalleRecetaStr);
                    double cantReq = Double.parseDouble(cantReqStr);
                    int idUniInsumo = Integer.parseInt(idUniInsumoStr);

                    dao.actualizarInsumoReceta(idDetalleReceta, cantReq, idUniInsumo);
                    Auditoria.registrar(request, "MODIFICACION", "Insumo actualizado. Detalle ID: " + idDetalleReceta);
                    mensaje = "Insumo " + (nombreInsumo != null ? nombreInsumo : "ID " + idDetalleReceta) + " actualizado.";
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", mensaje);
                }

                case "eliminar_detalle_receta", "quitar_detalle_receta" -> {
                    String idDetalleRecetaStr = request.getParameter("p_id_detalle_receta");
                    String nombreInsumo = request.getParameter("p_nombre_insumo");

                    if (idDetalleRecetaStr == null) {
                        throw new IllegalArgumentException("ID de detalle ausente.");
                    }

                    int idDetalleReceta = Integer.parseInt(idDetalleRecetaStr);
                    dao.eliminarDetalleRecetaIndividual(idDetalleReceta);
                    Auditoria.registrar(request, "ELIMINACION", "Insumo eliminado. Detalle ID: " + idDetalleReceta);
                    mensaje = "Insumo " + (nombreInsumo != null ? nombreInsumo : "ID " + idDetalleReceta) + " eliminado.";
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", mensaje);
                }

                case "desactivar_receta" -> {
                    String idRecetaStr = request.getParameter("p_id_receta");
                    String nombreReceta = request.getParameter("p_nombre_receta");

                    if (idRecetaStr == null) {
                        throw new IllegalArgumentException("ID de receta ausente.");
                    }

                    int idReceta = Integer.parseInt(idRecetaStr);
                    dao.desactivarReceta(idReceta);
                    Auditoria.registrar(request, "MODIFICACION", "Receta desactivada. ID: " + idReceta);
                    mensaje = "Receta " + (nombreReceta != null ? nombreReceta : "ID " + idReceta) + " desactivada.";
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", mensaje);
                }

                case "crear_orden" -> {
                    String idRecetaStr = request.getParameter("p_id_receta_orden_hidden");
                    String cantProdStr = request.getParameter("p_cant_prod_orden");
                    String idArtProducidoStr = request.getParameter("p_id_art_producido_orden_hidden");
                    String cantProdFinalRealStr = request.getParameter("p_cant_prod_final_real");
                    String nombreArticulo = request.getParameter("p_nombre_art_producido_orden_hidden");

                    if (idRecetaStr == null || cantProdStr == null || idArtProducidoStr == null || cantProdFinalRealStr == null)
                        throw new IllegalArgumentException("Faltan datos requeridos para crear la orden.");

                    idRecetaActiva = Integer.parseInt(idRecetaStr);
                    session.setAttribute("idRecetaActiva", idRecetaActiva);

                    double cantProd = Double.parseDouble(cantProdStr);
                    double cantProdFinalReal = Double.parseDouble(cantProdFinalRealStr);
                    String fechaIni = request.getParameter("p_fecha_ini_orden");
                    String obs = request.getParameter("p_obs_orden");

                    if (fechaIni == null) fechaIni = "";
                    if (obs == null) obs = "";

                    int idArticuloProducido = Integer.parseInt(idArtProducidoStr);

                    idOrdenActiva = dao.crearOrden(idRecetaActiva, idArticuloProducido, cantProd, cantProdFinalReal, fechaIni, obs);
                    session.setAttribute("idOrdenActiva", idOrdenActiva);
                    session.setAttribute("nombreArticuloActivo", nombreArticulo);

                    Auditoria.registrar(request, "CREACION", "Orden creada. ID: " + idOrdenActiva);

                    jsonResponse.put("success", true);
                    jsonResponse.put("message", "Orden " + idOrdenActiva + " creada correctamente.");
                    jsonResponse.put("id_orden", idOrdenActiva);
                    jsonResponse.put("id_articulo_terminado", idArticuloProducido);
                    jsonResponse.put("nombre_articulo_terminado", nombreArticulo);
                }

                case "ejecutar_consumo" -> {
                    String idOrdenParam = request.getParameter("p_id_orden");
                    if (idOrdenParam != null && !idOrdenParam.isEmpty()) {
                        try {
                            idOrdenActiva = Integer.parseInt(idOrdenParam);
                            session.setAttribute("idOrdenActiva", idOrdenActiva);
                        } catch (NumberFormatException e) {
                            throw new IllegalArgumentException("ID de orden inválido.");
                        }
                    }

                    if (idOrdenActiva == null) throw new IllegalArgumentException("No hay una Orden Activa para procesar.");

                    dao.gestionarConsumoMateriaPrima(idOrdenActiva);
                    Auditoria.registrar(request, "PROCESO", "Consumo automático ejecutado para Orden ID: " + idOrdenActiva);
                    mensaje = "Consumo de Materia Prima ejecutado correctamente para la Orden " + idOrdenActiva + ".";
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", mensaje);
                }

                case "registrar_consumo_componente" -> {
                    String idOrdenStr = request.getParameter("p_id_orden");
                    if (idOrdenStr == null) throw new IllegalArgumentException("ID de orden ausente.");

                    int idArticuloConsumido = Integer.parseInt(request.getParameter("p_id_articulo_consumido"));
                    double cantidadAConsumir = Double.parseDouble(request.getParameter("p_cantidad_consumida"));
                    int idUnidad = Integer.parseInt(request.getParameter("p_id_unidad"));
                    boolean esEnvase = "true".equalsIgnoreCase(request.getParameter("p_es_envase"));
                    String comentarioConsumo = request.getParameter("p_comentario_consumo");
                    int ordenId = Integer.parseInt(idOrdenStr);

                    dao.registrarConsumoComponente(ordenId, idArticuloConsumido, cantidadAConsumir, idUnidad, esEnvase, comentarioConsumo);
                    Auditoria.registrar(request, "OPERACION", "Consumo manual en Orden ID: " + ordenId);
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", "Consumo manual registrado.");
                }

                case "consumo_envase_tapa_etiqueta_multiple_step" -> {
                    String ordenCode = request.getParameter("p_codigo_orden");
                    String[] idContainerArr = request.getParameterValues("p_id_componente_container[]");

                    if (ordenCode == null || idContainerArr == null) {
                        throw new IllegalArgumentException("Datos de empaque incompletos.");
                    }

                    Auditoria.registrar(request, "OPERACION", "Registro de empaque múltiple para Orden: " + ordenCode);
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", "Empaque registrado correctamente.");
                }

                case "consumo_empaque_step" -> {
                    String ordenCode = request.getParameter("p_codigo_orden");
                    String idComponenteStr = request.getParameter("p_id_componente_seleccionado");

                    if (ordenCode == null || idComponenteStr == null) {
                        throw new IllegalArgumentException("Datos de empaque secundario incompletos.");
                    }

                    Auditoria.registrar(request, "OPERACION", "Consumo empaque secundario para Orden: " + ordenCode);
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", "Empaque secundario registrado.");
                }

                case "registrar_merma_y_cierre_empaque" -> {
                    String idOrdenParam = request.getParameter("p_codigo_orden");
                    if (idOrdenParam != null && !idOrdenParam.isEmpty()) {
                        idOrdenActiva = Integer.parseInt(idOrdenParam);
                    }
                    if (idOrdenActiva == null) throw new IllegalArgumentException("No hay una Orden Activa.");

                    double mermaCantidad = Double.parseDouble(request.getParameter("p_merma_cantidad"));
                    double envasesSueltos = Double.parseDouble(request.getParameter("p_envases_sueltos"));

                    dao.gestionarConsumoEnvase(idOrdenActiva, mermaCantidad, envasesSueltos);
                    Auditoria.registrar(request, "PROCESO", "Cierre de empaque para Orden ID: " + idOrdenActiva);
                    jsonResponse.put("success", true);
                    jsonResponse.put("message", "Etapa de empaque cerrada.");
                }

                case "registrar_lote", "registrar_lote_final" -> {
                    String idOrdenParam = request.getParameter("hidden_orden_lote_submit");
                    if (idOrdenParam != null && !idOrdenParam.isEmpty()) {
                        idOrdenActiva = Integer.parseInt(idOrdenParam);
                    }
                    if (idOrdenActiva == null) throw new IllegalArgumentException("No hay una Orden Activa.");

                    String cantidadStr = request.getParameter("cant_envases_final");
                    if (cantidadStr == null) cantidadStr = request.getParameter("p_cant_lote");

                    String codigoStr = request.getParameter("p_cod_lote");
                    if (codigoStr == null) codigoStr = request.getParameter("p_cod_lote_lote_hidden");

                    String fechaVencimientoStr = request.getParameter("p_fecha_vencimiento");

                    if (cantidadStr == null || codigoStr == null || fechaVencimientoStr == null) {
                        throw new IllegalArgumentException("Faltan datos del lote.");
                    }

                    double cantidad = Double.parseDouble(cantidadStr);

                    Map<String, Object> loteUnico = new LinkedHashMap<>();
                    loteUnico.put("cantidad", cantidad);
                    loteUnico.put("codigo_lote", codigoStr);
                    loteUnico.put("fecha_vencimiento", fechaVencimientoStr);

                    List<Map<String, Object>> lotes = new ArrayList<>();
                    lotes.add(loteUnico);

                    dao.registrarLotes(idOrdenActiva, lotes);
                    dao.finalizarOrden(idOrdenActiva);

                    Auditoria.registrar(request, "FINALIZACION", "Orden finalizada. ID: " + idOrdenActiva);

                    session.removeAttribute("idRecetaActiva");
                    session.removeAttribute("idOrdenActiva");
                    session.removeAttribute("nombreArticuloActivo");

                    jsonResponse.put("success", true);
                    jsonResponse.put("message", "Lote registrado y Orden Finalizada.");
                }

                case "finalizar_orden" -> {
                    if (idOrdenActiva == null) throw new IllegalArgumentException("No hay una Orden Activa.");
                    dao.finalizarOrden(idOrdenActiva);
                    Auditoria.registrar(request, "FINALIZACION", "Orden finalizada manual ID: " + idOrdenActiva);

                    session.removeAttribute("idRecetaActiva");
                    session.removeAttribute("idOrdenActiva");
                    session.removeAttribute("nombreArticuloActivo");

                    jsonResponse.put("success", true);
                    jsonResponse.put("message", "Orden finalizada.");
                }

                case "error_accion_no_especificada" -> throw new IllegalArgumentException("Acción no especificada.");
                default -> throw new IllegalArgumentException("Acción desconocida: " + action);
            }

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(gson.toJson(jsonResponse));

        } catch (SQLException e) {
            mensaje = "Error de Base de Datos: " + e.getMessage();
            jsonResponse.put("success", false);
            jsonResponse.put("message", mensaje);

            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(gson.toJson(jsonResponse));

        } catch (Exception e) {
            mensaje = "Error inesperado: " + e.getMessage();
            jsonResponse.put("success", false);
            jsonResponse.put("message", mensaje);

            response.setStatus(HttpServletResponse.SC_OK);
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
            response.getWriter().write("{\"success\":false,\"message\":\"Acción no especificada.\"}");
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
                    if (idPmStr != null) {
                        int idProductoMaestro = Integer.parseInt(idPmStr);
                        List<String> presentaciones = dao.obtenerPresentacionesPorProductoMaestro(idProductoMaestro);
                        response.getWriter().write(gson.toJson(presentaciones));
                        return;
                    }
                }
                case "obtener_receta_por_nombre_generico" -> {
                    String nombreGenerico = request.getParameter("nombre_generico");
                    if (nombreGenerico != null) resultados = dao.obtenerRecetaPorNombreGenerico(nombreGenerico);
                }
                case "listar_recetas" -> resultados = dao.listarRecetasConDetalles();
                case "generar_codigo_lote" -> {
                    String idOrdenStr = request.getParameter("id_orden");
                    if (idOrdenStr == null) throw new IllegalArgumentException("ID de Orden requerido.");
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
                    if (idRecetaStr != null) {
                        int idReceta = Integer.parseInt(idRecetaStr);
                        resultados = dao.obtenerInsumosPorIdReceta(idReceta);
                    }
                }
                case "obtener_detalle_insumo_receta" -> {
                    String idDetalleRecetaStr = request.getParameter("p_id_detalle_receta");
                    if (idDetalleRecetaStr != null) {
                        int idDetalleReceta = Integer.parseInt(idDetalleRecetaStr);
                        resultados = dao.obtenerDetalleInsumoReceta(idDetalleReceta);
                    }
                }
                case "obtener_consumo_total_orden", "obtener_consumos_orden" -> {
                    String idOrdenStr = request.getParameter("p_codigo_orden");
                    if (idOrdenStr == null) idOrdenStr = request.getParameter("id_orden");
                    if (idOrdenStr != null) {
                        int idOrden = Integer.parseInt(idOrdenStr);
                        resultados = dao.obtenerConsumoTotalPorOrden(idOrden);
                    }
                }
                case "obtener_ordenes_activas" -> resultados = dao.listarOrdenesActivas();
                default -> throw new IllegalArgumentException("Acción inválida.");
            }

            response.getWriter().write(gson.toJson(resultados));

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_OK);
            Map<String, Object> jsonErrorResponse = new LinkedHashMap<>();
            jsonErrorResponse.put("success", false);
            jsonErrorResponse.put("message", "Error: " + e.getMessage());
            response.getWriter().write(gson.toJson(jsonErrorResponse));
        }
    }
}