package sistema.Servlet.Login;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import sistema.Controller.Usuario.UsuarioController;
import sistema.Modelo.Usuario.Usuario;
import sistema.repository.UsuarioRepository;
import java.io.IOException;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        HttpSession sessionExistente = request.getSession(false);
        if (sessionExistente != null && sessionExistente.getAttribute("usuario") != null) {
            Usuario usuarioSesion = (Usuario) sessionExistente.getAttribute("usuario");

            String rolSesion = (usuarioSesion.getRol() != null)
                    ? usuarioSesion.getRol().trim().toLowerCase()
                    : "";

            if (!rolSesion.isEmpty()) {
                redirigirSegunRol(rolSesion, request, response);
                return;
            }
        }

        String username = request.getParameter("username");
        String password = request.getParameter("password");

        if (username == null || password == null || username.isEmpty() || password.isEmpty()) {
            response.sendRedirect("index.html?error=credenciales");
            return;
        }

        UsuarioController usuarioController = new UsuarioController();
        Usuario usuario = usuarioController.obtenerUsuario(username, password);

        if (usuario != null) {
            if (usuario.getEstado() == 1) {
                String rol = usuario.getRol().trim().toLowerCase();
                HttpSession session = request.getSession(true);
                session.setAttribute("usuario", usuario);

                usuarioController.registrarAccion(usuario.getId(), "LOGIN_EXITO", "Inicio de sesión exitoso", request);
                redirigirSegunRol(rol, request, response);

            } else if (usuario.getEstado() == 0) {
                usuarioController.registrarAccion(usuario.getId(), "LOGIN_FALLO_INACTIVO", "Intento de login. Cuenta deshabilitada o pendiente.", request);
                response.sendRedirect("index.html?error=deshabilitado");

            } else if (usuario.getEstado() == -1) {
                usuarioController.registrarAccion(usuario.getId(), "LOGIN_FALLO_RESTRICCION", "Intento de login. Acceso restringido por horario.", request);
                response.sendRedirect("index.html?error=horario");

            } else {
                usuarioController.registrarAccion(0, "LOGIN_FALLO_DESCONOCIDO", "Intento de login con estado desconocido.", request);
                response.sendRedirect("index.html?error=credenciales");
            }

        } else {
            usuarioController.registrarAccion(0, "LOGIN_FALLO", "Intento de login con credenciales incorrectas.", request);
            response.sendRedirect("index.html?error=credenciales");
        }
    }

    private void redirigirSegunRol(String rol, HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        switch (rol) {
            case "administrador principal":
                response.sendRedirect(request.getContextPath() + "/HTML/Administrador/dashboardAdmin.html");
                break;

            case "administrador":
                response.sendRedirect(request.getContextPath() + "/HTML/Administrador/dashboardAdmin.html");
                break;
            case "produccion":
                response.sendRedirect(request.getContextPath() + "/HTML/Produccion/dashboardProduccion.html");
                break;
            default:
                response.getWriter().println("Rol de usuario no reconocido: " + rol);
                break;
        }
    }
}