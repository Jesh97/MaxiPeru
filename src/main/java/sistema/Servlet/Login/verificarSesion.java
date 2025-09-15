package sistema.Servlet.Login;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import sistema.Modelo.Usuario.Usuario;

import java.io.IOException;

@WebServlet("/verificarSesion")
public class verificarSesion extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");

        HttpSession session = request.getSession(false);
        boolean activa = false;
        String rol = null;

        if (session != null && session.getAttribute("usuario") != null) {
            Usuario usuario = (Usuario) session.getAttribute("usuario");
            activa = true;
            rol = usuario.getRol().trim().toLowerCase();
        }

        String json = String.format("{\"activa\": %s, \"rol\": \"%s\"}", activa, rol != null ? rol : "");
        response.getWriter().write(json);
    }
}

