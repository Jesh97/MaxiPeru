package sistema.Servlet.Usuario;

import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sistema.Controller.UsuarioController;
import sistema.Ejecucion.Auditoria;
import sistema.Modelo.Usuario;
import sistema.repository.UsuarioRepository;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/registrarUsuario")
public class RegistrarUsuario extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        String nombre = request.getParameter("nombre");
        String correo = request.getParameter("correo");
        String username = request.getParameter("username");
        String password = request.getParameter("password");
        System.out.println("Contraseña recibida: " + password);
        String rol = request.getParameter("rol");
        String estado = request.getParameter("estado");

        List<String> errores = new ArrayList<>();

        if (nombre == null || nombre.trim().isEmpty()) errores.add("El nombre es obligatorio.");
        if (correo == null || !correo.matches("^\\S+@\\S+\\.\\S+$")) errores.add("Correo electrónico no válido.");
        if (username == null || username.trim().isEmpty()) errores.add("El nombre de usuario es obligatorio.");
        if (password == null || !password.matches("^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"))
            errores.add("La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.");
        if (rol == null || rol.isEmpty()) errores.add("Debe seleccionar un rol.");
        if (estado == null || estado.isEmpty()) errores.add("Debe seleccionar un estado.");

        if (!errores.isEmpty()) {
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(new Gson().toJson(errores));
            return;
        }

        Usuario nuevoUsuario = new Usuario(nombre, correo, username, password, rol, estado);
        UsuarioRepository dao = new UsuarioController();

        if (dao.registrarUsuario(nuevoUsuario)) {
            Auditoria.registrar(request, "Creación", "Registró un nuevo usuario: " + username);
            response.sendRedirect("index.html");
        } else {
            errores.add("Error interno al registrar el usuario. Intente nuevamente.");
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(new Gson().toJson(errores));
        }
    }
}

