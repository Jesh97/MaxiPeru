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

        // Verificar si ya existe una sesión
        HttpSession sessionExistente = request.getSession(false);
        if (sessionExistente != null && sessionExistente.getAttribute("usuario") != null) {
            Usuario usuarioSesion = (Usuario) sessionExistente.getAttribute("usuario");
            String rolSesion = usuarioSesion.getRol().trim().toLowerCase();
            redirigirSegunRol(rolSesion, request, response);
            return;
        }

        // Obtener credenciales del formulario
        String username = request.getParameter("username");
        String password = request.getParameter("password");

        // Validación básica
        if (username == null || password == null || username.isEmpty() || password.isEmpty()) {
            response.sendRedirect("index.html?error=credenciales");
            return;
        }

        // Buscar usuario en la base de datos
        UsuarioRepository usuarioRepository = new UsuarioController();
        Usuario usuario = usuarioRepository.obtenerUsuario(username, password);

        if (usuario != null) {

            // Verificar si el usuario está habilitado (estado = 1)
            if (usuario.getEstado() == 0) {  // Cambiado de usuario.isEstado() a usuario.getEstado() == 0
                response.sendRedirect("index.html?error=deshabilitado");
                return;
            }

            // Iniciar sesión
            String rol = usuario.getRol().trim().toLowerCase();
            HttpSession session = request.getSession(true);
            session.setAttribute("usuario", usuario);

            // Registrar acción de login
            UsuarioRepository actividadDAO = new UsuarioController();
            actividadDAO.registrarAccion(usuario.getId(), "login", "Inicio de sesión exitoso", request);

            redirigirSegunRol(rol, request, response);

        } else {
            // Usuario o contraseña incorrectos
            response.sendRedirect("index.html?error=credenciales");
        }
    }

    private void redirigirSegunRol(String rol, HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        switch (rol) {
            case "administrador":
                response.sendRedirect(request.getContextPath() + "/HTML/Administrador/dashboardAdmin.html");
                break;
            case "producción":
                response.sendRedirect(request.getContextPath() + "/HTML/Produccion/dashboardProduccion.html");
                break;
            default:
                response.getWriter().println("Rol de usuario no reconocido: " + rol);
                break;
        }
    }
}
