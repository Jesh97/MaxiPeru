package sistema.Servlet.Produccion;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import sistema.Controller.Produccion.ProduccionController;
import sistema.repository.ProduccionRepository;
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

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        String action = request.getParameter("action");
        String mensaje;
        HttpSession session = request.getSession();

        Integer idRecetaActiva = (Integer) session.getAttribute("idRecetaActiva");
        Integer idOrdenActiva = (Integer) session.getAttribute("idOrdenActiva");

        if (action == null || action.trim().isEmpty()) {
            action = "error_accion_no_especificada";
        }

        try {

            if (action.equals("crear_receta_y_componentes")) {

                String idProdMaestroStr = request.getParameter("p_id_prod_maestro_hidden");
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

                mensaje = "Fórmula y sus " + componentesGuardados + " componentes guardados con éxito en Receta ID: " + idRecetaActiva;

                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                Map<String, Object> jsonResponse = new LinkedHashMap<>();
                jsonResponse.put("success", true);
                jsonResponse.put("message", mensaje);
                jsonResponse.put("id_receta", idRecetaActiva);
                response.getWriter().write(gson.toJson(jsonResponse));
                return;

            } else if (action.equals("crear_orden")) {
                String idRecetaStr = request.getParameter("p_id_receta_orden_hidden");
                if (idRecetaStr == null || idRecetaStr.isEmpty()) throw new IllegalArgumentException("El ID de la Receta es requerido.");
                idRecetaActiva = Integer.parseInt(idRecetaStr);
                session.setAttribute("idRecetaActiva", idRecetaActiva);

                BigDecimal cantProd = new BigDecimal(request.getParameter("p_cant_prod_orden"));
                String fechaIni = request.getParameter("p_fecha_ini_orden");
                String obs = request.getParameter("p_obs_orden");

                int idArticuloProducido = Integer.parseInt(request.getParameter("p_id_art_producido_orden_hidden"));

                idOrdenActiva = dao.crearOrden(idRecetaActiva, idArticuloProducido, cantProd, fechaIni, obs);
                session.setAttribute("idOrdenActiva", idOrdenActiva);
                mensaje = "Orden de Producción " + idOrdenActiva + " creada. Ejecute el consumo de MP.";

            } else if (action.equals("ejecutar_consumo")) {
                if (idOrdenActiva == null) throw new IllegalArgumentException("No hay una Orden Activa.");

                dao.gestionarConsumoMateriaPrima(idOrdenActiva);
                mensaje = "Consumo de Materia Prima ejecutado. Orden en estado 'En Proceso'.";

            } else if (action.equals("registrar_consumo_componente")) {
                String idOrdenStr = request.getParameter("p_id_orden");
                if (idOrdenStr == null) throw new IllegalArgumentException("No hay una Orden Activa.");

                int idArticuloConsumido = Integer.parseInt(request.getParameter("p_id_articulo_consumido"));
                BigDecimal cantidadAConsumir = new BigDecimal(request.getParameter("p_cantidad_consumida"));
                int idUnidad = Integer.parseInt(request.getParameter("p_id_unidad"));
                boolean esEnvase = "true".equalsIgnoreCase(request.getParameter("p_es_envase"));
                int ordenId = Integer.parseInt(idOrdenStr);

                dao.registrarConsumoComponente(ordenId, idArticuloConsumido, cantidadAConsumir, idUnidad, esEnvase);
                mensaje = "Consumo manual registrado en la Orden " + ordenId + ".";

                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                Map<String, Object> jsonResponse = new LinkedHashMap<>();
                jsonResponse.put("success", true);
                jsonResponse.put("message", mensaje);
                response.getWriter().write(gson.toJson(jsonResponse));
                return;

            } else if (action.equals("registrar_merma_y_cierre_empaque")) {
                if (idOrdenActiva == null) throw new IllegalArgumentException("No hay una Orden Activa.");

                BigDecimal mermaCantidad = new BigDecimal(request.getParameter("p_merma_cantidad"));
                BigDecimal envasesSueltos = new BigDecimal(request.getParameter("p_envases_sueltos"));

                dao.gestionarConsumoEnvase(idOrdenActiva, mermaCantidad, envasesSueltos);
                mensaje = "Merma (" + mermaCantidad + ") y envases sueltos registrados. Etapa de empaque cerrada.";

                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                Map<String, Object> jsonResponse = new LinkedHashMap<>();
                jsonResponse.put("success", true);
                jsonResponse.put("message", mensaje);
                response.getWriter().write(gson.toJson(jsonResponse));
                return;

            } else if (action.equals("registrar_lote")) {
                if (idOrdenActiva == null) throw new IllegalArgumentException("No hay una Orden Activa para registrar lotes.");

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
                mensaje = "Se registró el Lote: " + codigoStr + " para la Orden " + idOrdenActiva;

                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                Map<String, Object> jsonResponse = new LinkedHashMap<>();
                jsonResponse.put("success", true);
                jsonResponse.put("message", mensaje);
                response.getWriter().write(gson.toJson(jsonResponse));
                return;

            } else if (action.equals("finalizar_orden")) {
                if (idOrdenActiva == null) throw new IllegalArgumentException("No hay una Orden Activa para finalizar.");
                dao.finalizarOrden(idOrdenActiva);
                session.removeAttribute("idRecetaActiva");
                session.removeAttribute("idOrdenActiva");
                mensaje = "Orden de Producción " + idOrdenActiva + " **FINALIZADA** con éxito.";

                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                Map<String, Object> jsonResponse = new LinkedHashMap<>();
                jsonResponse.put("success", true);
                jsonResponse.put("message", mensaje);
                response.getWriter().write(gson.toJson(jsonResponse));
                return;

            } else if (action.equals("error_accion_no_especificada")) {
                throw new IllegalArgumentException("Error: La solicitud POST no especificó ninguna acción (parámetro 'action' nulo).");

            } else {
                throw new IllegalArgumentException("Acción desconocida: " + action);
            }

            response.setContentType("text/html;charset=UTF-8");
            response.getWriter().println("<script>alert('" + mensaje.replace("'", "\\'") + "'); window.history.back();</script>");

        } catch (SQLException e) {
            String errorDetalle = "Error de Base de Datos al procesar la acción: **" + action + "**. Detalle: " + e.getMessage() + ". Código SQL: " + e.getSQLState();
            mensaje = errorDetalle;

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            Map<String, Object> jsonResponse = new LinkedHashMap<>();
            jsonResponse.put("success", false);
            jsonResponse.put("message", mensaje);
            response.getWriter().write(gson.toJson(jsonResponse));
            return;

        } catch (Exception e) {
            String errorDetalle = "Error inesperado en la Aplicación. Tipo de error: **" + e.getClass().getSimpleName() + "**. Detalle: " + e.getMessage();
            mensaje = errorDetalle;

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            Map<String, Object> jsonResponse = new LinkedHashMap<>();
            jsonResponse.put("success", false);
            jsonResponse.put("message", mensaje);
            response.getWriter().write(gson.toJson(jsonResponse));
            return;
        }
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String action = request.getParameter("action");
        String busqueda = request.getParameter("busqueda");

        if (action == null || action.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Acción no especificada en GET.\"}");
            return;
        }

        try {
            List<Map<String, Object>> resultados = new ArrayList<>();

            if (action.equals("buscar_articulos_terminados")) {
                resultados = dao.buscarArticulosTerminados(busqueda);

            } else if (action.equals("buscar_articulos_insumos")) {
                resultados = dao.buscarArticulosInsumos(busqueda);

            } else if (action.equals("buscar_articulos_embalado_y_embalaje")) {
                resultados = dao.buscarArticulosEmbalaje(busqueda);

            } else if (action.equals("obtener_presentaciones_pm")) {
                String idPmStr = request.getParameter("id_pm");
                if (idPmStr == null || idPmStr.isEmpty()) {
                    throw new IllegalArgumentException("ID de Producto Maestro no especificado.");
                }
                int idProductoMaestro = Integer.parseInt(idPmStr);

                List<String> presentaciones = dao.obtenerPresentacionesPorProductoMaestro(idProductoMaestro);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write(gson.toJson(presentaciones));
                return;

            } else if (action.equals("obtener_receta_por_nombre_generico")) {
                String nombreGenerico = request.getParameter("nombre_generico");
                if (nombreGenerico == null || nombreGenerico.isEmpty()) {
                    throw new IllegalArgumentException("El nombre genérico es requerido.");
                }

                resultados = dao.obtenerRecetaPorNombreGenerico(nombreGenerico);

            } else if (action.equals("obtener_insumos_orden_activa")) {
                String idRecetaStr = request.getParameter("id_receta");
                if (idRecetaStr == null || idRecetaStr.isEmpty()) {
                    throw new IllegalArgumentException("ID de Receta no especificado.");
                }
                int idReceta = Integer.parseInt(idRecetaStr);

                resultados = dao.obtenerInsumosPorIdReceta(idReceta);
            }

            else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"error\": \"Acción de consulta no válida: **" + action + "**\"}");
                return;
            }

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(gson.toJson(resultados));

        } catch (Exception e) {
            String errorDetalle;
            if (e instanceof IllegalArgumentException) {
                errorDetalle = "Error de datos: " + e.getMessage();
            } else if (e instanceof SQLException) {
                SQLException sqlE = (SQLException) e;
                errorDetalle = "Error de DB: " + sqlE.getMessage() + " (SQL State: " + sqlE.getSQLState() + ")";
            } else {
                errorDetalle = "Error Inesperado: " + e.getMessage();
            }

            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"Error al procesar la solicitud GET (" + action + "): **" + errorDetalle.replace("\"", "\\\"") + "**\"}");
        }
    }
}