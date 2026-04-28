package sistema.Servlet.Costo;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import sistema.Controller.Costo.CostoController;
import sistema.Controller.Produccion.ProduccionController;
import sistema.Modelo.Usuario.Usuario;
import sistema.repository.ProducionRepository;

@WebServlet("/CostoServlet")
public class CostoServlet extends HttpServlet {

    private static final ProducionRepository produccionDao = new ProduccionController();
    private final CostoController costoController = new CostoController();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!isSesionValida(request)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().print("{\"error\":\"No autorizado\"}");
            return;
        }
        String action = request.getParameter("action");
        if (action == null) {
            action = "";
        }
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        try {
            switch (action) {
                case "productos_terminados" -> {
                    String b = request.getParameter("busqueda");
                    if (b == null) {
                        b = "";
                    }
                    var resultados = produccionDao.buscarArticulosTerminadosConReceta(b);
                    for (Map<String, Object> row : resultados) {
                        if (row.get("id") != null) {
                            row.put("idCatalogo", "art_" + row.get("id"));
                        }
                    }
                    mapper.writeValue(out, resultados);
                }
                case "cargar" -> {
                    int id = Integer.parseInt(request.getParameter("id"));
                    String json = costoController.cargarConfig(id);
                    if (json == null) {
                        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                        out.print("{\"error\":\"Configuración no encontrada\"}");
                    } else {
                        out.print(json);
                    }
                }
                case "listar" -> {
                    var lista = costoController.listarResumenes();
                    mapper.writeValue(out, lista);
                }
                case "insumos_desde_receta" -> {
                    String idStr = request.getParameter("id_articulo");
                    if (idStr == null || idStr.isBlank()) {
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        out.print("{\"error\":\"Falta id_articulo\"}");
                        break;
                    }
                    int idArt = Integer.parseInt(idStr.trim());
                    Map<String, Object> payload = costoController.insumosParaCostoPorArticulo(idArt);
                    mapper.writeValue(out, payload);
                }
                case "cargar_inicial" -> {
                    Map<String, Object> primero = costoController.primerArticuloTerminadoConReceta();
                    if (primero == null || primero.get("id") == null) {
                        Map<String, Object> vacio = new HashMap<>();
                        vacio.put("ok", false);
                        vacio.put("mensaje", "No hay artículos terminados con receta activa en la base de datos.");
                        mapper.writeValue(out, vacio);
                    } else {
                        int idArt = ((Number) primero.get("id")).intValue();
                        Map<String, Object> payload = costoController.insumosParaCostoPorArticulo(idArt);
                        payload.put("id_articulo_sugerido", idArt);
                        payload.put("descripcion_articulo", primero.get("descripcion"));
                        mapper.writeValue(out, payload);
                    }
                }
                default -> {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.print("{\"error\":\"Acción no válida\"}");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\":\"" + e.getMessage().replace("\"", "'") + "\"}");
        }
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!isSesionValida(request)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("text/plain;charset=UTF-8");
            response.getWriter().print("No autorizado");
            return;
        }
        String action = request.getParameter("action");
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        if (!"guardar".equals(action)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Acción no válida\"}");
            out.flush();
            return;
        }
        try {
            String nombre = request.getParameter("nombre");
            String data = request.getParameter("data");
            if (nombre == null || data == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"error\":\"Faltan nombre o data\"}");
                out.flush();
                return;
            }
            int id = costoController.guardarConfig(nombre, data);
            Map<String, Object> ok = new HashMap<>();
            ok.put("ok", true);
            ok.put("id", id);
            ok.put("mensaje", "Guardado correctamente. ID: " + id);
            mapper.writeValue(out, ok);
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\":\"" + e.getMessage().replace("\"", "'") + "\"}");
        }
        out.flush();
    }

    private static boolean isSesionValida(HttpServletRequest request) {
        HttpSession s = request.getSession(false);
        if (s == null || s.getAttribute("usuario") == null) {
            return false;
        }
        return s.getAttribute("usuario") instanceof Usuario;
    }
}
