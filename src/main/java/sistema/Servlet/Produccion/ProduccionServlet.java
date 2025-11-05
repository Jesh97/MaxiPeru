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

        try {
            if (action == null) {
                throw new IllegalArgumentException("Error: Acción no especificada.");
            }

            if (action.equals("crear_receta_y_componentes")) {

                int idArtTer = Integer.parseInt(request.getParameter("p_id_art_ter"));
                int idUniProd = Integer.parseInt(request.getParameter("p_id_uni_prod"));
                String desc = request.getParameter("p_desc");
                BigDecimal cantProd = new BigDecimal(request.getParameter("p_cant_prod"));

                idRecetaActiva = dao.crearReceta(idArtTer, desc, cantProd, idUniProd);
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

            } else if (action.equals("crear_orden")) {
                if (idRecetaActiva == null) throw new IllegalArgumentException("Debe haber una Receta Activa.");

                BigDecimal cantProd = new BigDecimal(request.getParameter("p_cant_prod"));
                String fechaIni = request.getParameter("p_fecha_ini");
                String obs = request.getParameter("p_obs");

                int idArticuloProducido = Integer.parseInt(request.getParameter("p_id_art_producido"));

                idOrdenActiva = dao.crearOrden(idRecetaActiva, idArticuloProducido, cantProd, fechaIni, obs);
                session.setAttribute("idOrdenActiva", idOrdenActiva);
                mensaje = "Orden de Producción " + idOrdenActiva + " creada. Ejecute el consumo de MP.";

            } else if (action.equals("ejecutar_consumo")) {
                if (idOrdenActiva == null) throw new IllegalArgumentException("No hay una Orden Activa.");

                dao.gestionarConsumoMateriaPrima(idOrdenActiva);
                mensaje = "Consumo de Materia Prima ejecutado. Orden en estado 'En Proceso'.";

            } else if (action.equals("registrar_consumo_componente")) {
                if (idOrdenActiva == null) throw new IllegalArgumentException("No hay una Orden Activa.");

                int idArticuloConsumido = Integer.parseInt(request.getParameter("p_id_articulo_consumido"));
                BigDecimal cantidadAConsumir = new BigDecimal(request.getParameter("p_cantidad_consumida"));
                int idUnidad = Integer.parseInt(request.getParameter("p_id_unidad"));
                boolean esEnvase = "true".equalsIgnoreCase(request.getParameter("p_es_envase"));

                dao.registrarConsumoComponente(idOrdenActiva, idArticuloConsumido, cantidadAConsumir, idUnidad, esEnvase);
                mensaje = "Consumo manual registrado en la Orden " + idOrdenActiva + ".";

            } else if (action.equals("registrar_merma_y_cierre_empaque")) {
                if (idOrdenActiva == null) throw new IllegalArgumentException("No hay una Orden Activa.");

                BigDecimal mermaCantidad = new BigDecimal(request.getParameter("p_merma_cantidad"));
                BigDecimal envasesSueltos = new BigDecimal(request.getParameter("p_envases_sueltos"));

                dao.gestionarConsumoEnvase(idOrdenActiva, mermaCantidad, envasesSueltos);
                mensaje = "Merma (" + mermaCantidad + ") y envases sueltos registrados. Etapa de empaque cerrada.";

            } else if (action.equals("registrar_multiples_lotes")) {
                if (idOrdenActiva == null) throw new IllegalArgumentException("No hay una Orden Activa para registrar lotes.");

                String[] cantidadesArr = request.getParameterValues("p_cant_lote[]");
                String[] codigosArr = request.getParameterValues("p_cod_lote[]");
                String[] fechasVencimientoArr = request.getParameterValues("p_fecha_vencimiento[]");

                List<Map<String, Object>> lotes = new ArrayList<>();
                if (cantidadesArr != null) {
                    for (int i = 0; i < cantidadesArr.length; i++) {
                        Map<String, Object> lote = new LinkedHashMap<>();
                        lote.put("cantidad", new BigDecimal(cantidadesArr[i]));
                        lote.put("codigo_lote", codigosArr[i]);
                        lote.put("fecha_vencimiento", fechasVencimientoArr[i]);
                        lotes.add(lote);
                    }
                }

                dao.registrarLotes(idOrdenActiva, lotes);
                mensaje = "Se registraron " + lotes.size() + " lote(s) con códigos generados por el sistema.";

            } else if (action.equals("finalizar_orden")) {
                if (idOrdenActiva == null) throw new IllegalArgumentException("No hay una Orden Activa para finalizar.");

                dao.finalizarOrden(idOrdenActiva);

                session.removeAttribute("idRecetaActiva");
                session.removeAttribute("idOrdenActiva");

                mensaje = "Orden de Producción " + idOrdenActiva + " **FINALIZADA** con éxito.";

            } else {
                throw new IllegalArgumentException("Acción desconocida: " + action);
            }

            response.setContentType("text/html;charset=UTF-8");
            response.getWriter().println("<script>alert('" + mensaje.replace("'", "\\'") + "'); window.history.back();</script>");

        } catch (SQLException e) {
            mensaje = "Error de Base de Datos: " + e.getMessage();
            response.setContentType("text/html;charset=UTF-8");
            response.getWriter().println("<script>alert('" + mensaje.replace("'", "\\'") + "'); window.history.back();</script>");

        } catch (Exception e) {
            mensaje = "Error de la Aplicación: " + e.getMessage();
            response.setContentType("text/html;charset=UTF-8");
            response.getWriter().println("<script>alert('" + mensaje.replace("'", "\\'") + "'); window.history.back();</script>");
        }
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String action = request.getParameter("action");
        String busqueda = request.getParameter("busqueda");

        if (action != null && action.startsWith("buscar_") || action != null && action.startsWith("obtener_")) {

            try {
                if (action.equals("buscar_articulos_terminados")) {
                    List<Map<String, Object>> resultados = dao.buscarArticulosTerminados(busqueda);
                    if (resultados.size() > 5) {
                        resultados = resultados.subList(0, 5);
                    }
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write(gson.toJson(resultados));

                } else if (action.equals("buscar_articulos_insumos")) {
                    List<Map<String, Object>> resultados = dao.buscarArticulosInsumos(busqueda);
                    if (resultados.size() > 5) {
                        resultados = resultados.subList(0, 5);
                    }
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write(gson.toJson(resultados));

                } else if (action.equals("buscar_articulos_embalado_y_embalaje")) {
                    List<Map<String, Object>> resultados = dao.buscarArticulosEmbalaje(busqueda);
                    if (resultados.size() > 5) {
                        resultados = resultados.subList(0, 5);
                    }
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write(gson.toJson(resultados));

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

                } else if (action.equals("obtener_receta_por_nombre_generico")) {
                    String nombreGenerico = request.getParameter("nombre_generico");
                    if (nombreGenerico == null || nombreGenerico.isEmpty()) {
                        throw new IllegalArgumentException("El nombre genérico es requerido.");
                    }

                    List<Map<String, Object>> detalles = dao.obtenerRecetaPorNombreGenerico(nombreGenerico);

                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write(gson.toJson(detalles));

                } else {
                    throw new IllegalArgumentException("Acción de búsqueda o consulta no válida.");
                }


            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"error\": \"Error al procesar la solicitud: " + e.getMessage().replace("\"", "\\\"") + "\"}");
            }
        } else {
            doPost(request, response);
        }
    }
}