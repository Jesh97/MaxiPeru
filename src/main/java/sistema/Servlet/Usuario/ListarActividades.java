package sistema.Servlet.Usuario;

import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import sistema.Controller.UsuarioController;
import sistema.Modelo.ActividadUsuario;
import sistema.Modelo.Usuario;
import sistema.repository.UsuarioRepository;
import java.io.IOException;
import java.util.List;

@WebServlet("/ListarActividad")
public class ListarActividades extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false);
        Usuario usuarioSesion = (Usuario) session.getAttribute("usuario");

        if (usuarioSesion != null) {
            String idParam = request.getParameter("id");

            if (idParam == null) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Falta el parámetro id");
                return;
            }

            int usuarioId;
            try {
                usuarioId = Integer.parseInt(idParam);
            } catch (NumberFormatException e) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "ID inválido");
                return;
            }

            UsuarioRepository dao = new UsuarioController();
            List<ActividadUsuario> actividades = dao.listarPorUsuario(usuarioId);

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            new Gson().toJson(actividades, response.getWriter());
        } else {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        }
    }
}

