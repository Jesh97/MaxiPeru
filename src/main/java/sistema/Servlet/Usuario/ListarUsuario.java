package sistema.Servlet.Usuario;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import sistema.Controller.Usuario.UsuarioController;
import sistema.Modelo.Usuario.Usuario;
import sistema.Modelo.Usuario.ActividadUsuario;

@WebServlet("/listarUsuario")
public class ListarUsuario extends HttpServlet {

    private final UsuarioController usuarioController = new UsuarioController();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String accion = request.getParameter("accion");
        if (accion == null) accion = "";

        response.setContentType("application/json;charset=UTF-8");
        ObjectMapper mapper = new ObjectMapper();
        PrintWriter out = response.getWriter();

        switch (accion) {
            case "listar":
                List<Usuario> usuarios = usuarioController.listarUsuarios();
                String jsonListar = mapper.writeValueAsString(usuarios);
                out.print(jsonListar);
                break;

            case "listarActividades":
                try {
                    int usuarioId = Integer.parseInt(request.getParameter("id"));
                    List<ActividadUsuario> actividades = usuarioController.listarPorUsuario(usuarioId);
                    String jsonActividades = mapper.writeValueAsString(actividades);
                    out.print(jsonActividades);
                } catch (NumberFormatException e) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.print("{\"error\": \"ID de usuario inválido.\"}");
                } catch (Exception e) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.print("{\"error\": \"Error al listar actividades.\"}");
                }
                break;

            default:
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"error\": \"Acción no encontrada o método no soportado.\"}");
                break;
        }
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String accion = request.getParameter("accion");
        if (accion == null) accion = "";

        response.setContentType("text/plain;charset=UTF-8");
        PrintWriter out = response.getWriter();

        int adminId = 1;

        switch (accion) {
            case "login":
                handleLogin(request, response, out);
                break;

            case "aceptar":
                handleAceptar(request, response, out, adminId);
                break;

            case "deshabilitar":
                handleDeshabilitar(request, response, out, adminId);
                break;

            case "permisoIrrestricto":
                handlePermisoIrrestricto(request, response, out, adminId);
                break;

            case "editar":
                handleEditar(request, response, out, adminId);
                break;

            default:
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("Acción no encontrada o método no soportado.");
                break;
        }
        out.flush();
    }

    private void handleLogin(HttpServletRequest request, HttpServletResponse response, PrintWriter out) throws IOException {
        UsuarioController controller = new UsuarioController();
        String username = request.getParameter("username");
        String password = request.getParameter("password");

        Usuario usuario = controller.obtenerUsuario(username, password);
        String tipoRegistro;

        if (usuario == null || usuario.getId() == 0) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("Credenciales incorrectas.");
            tipoRegistro = "LOGIN_FALLO";
        } else if (usuario.getEstado() == 1) {
            HttpSession session = request.getSession();
            session.setAttribute("usuario", usuario);
            session.setAttribute("userId", usuario.getId());

            response.setStatus(HttpServletResponse.SC_OK);
            out.print("ÉXITO");
            tipoRegistro = "LOGIN_EXITO";
        } else if (usuario.getEstado() == 0) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("Su cuenta está pendiente de aprobación por un administrador.");
            tipoRegistro = "LOGIN_FALLO_PENDIENTE";
        } else if (usuario.getEstado() == -1) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("Acceso restringido. Intente nuevamente en el horario permitido.");
            tipoRegistro = "LOGIN_FALLO_RESTRICCION";
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("Error de validación desconocido.");
            tipoRegistro = "LOGIN_FALLO_DESCONOCIDO";
        }

        int usuarioIdRegistro = (usuario != null && usuario.getId() > 0) ? usuario.getId() : 0;
        String descripcion = "Intento de login para usuario: " + username;
        controller.registrarAccion(usuarioIdRegistro, tipoRegistro, descripcion, request);
    }

    private void handleAceptar(HttpServletRequest request, HttpServletResponse response, PrintWriter out, int adminId) throws IOException {
        UsuarioController controller = new UsuarioController();
        try {
            int usuarioId = Integer.parseInt(request.getParameter("id"));
            if (controller.aceptarUsuario(usuarioId, adminId)) {
                out.print("Cuenta aprobada correctamente.");
                controller.registrarAccion(adminId, "APROBAR_CUENTA", "Aprobación de cuenta para Usuario ID: " + usuarioId, request);
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("Error al aprobar la cuenta.");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("ID de usuario inválido.");
        }
    }

    private void handleDeshabilitar(HttpServletRequest request, HttpServletResponse response, PrintWriter out, int adminId) throws IOException {
        UsuarioController controller = new UsuarioController();
        try {
            int usuarioId = Integer.parseInt(request.getParameter("id"));
            int estado = Integer.parseInt(request.getParameter("estado"));

            if (controller.cambiarEstadoUsuario(usuarioId, estado)) {
                out.print("Usuario deshabilitado correctamente.");
                controller.registrarAccion(adminId, "DESHABILITAR_USUARIO", "Deshabilitación de Usuario ID: " + usuarioId, request);
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("Error al deshabilitar el usuario.");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("Parámetros de entrada inválidos.");
        }
    }

    private void handlePermisoIrrestricto(HttpServletRequest request, HttpServletResponse response, PrintWriter out, int adminId) throws IOException {
        UsuarioController controller = new UsuarioController();
        try {
            int usuarioId = Integer.parseInt(request.getParameter("id"));
            int permisoNuevo = Integer.parseInt(request.getParameter("permiso"));

            if (controller.cambiarPermisoIrrestricto(usuarioId, adminId, permisoNuevo)) {
                String accion = (permisoNuevo == 1) ? "OTORGAR" : "REVOCAR";
                out.print("Permiso irrestricto " + accion + " correctamente.");
                controller.registrarAccion(adminId, accion + "_ACCESO_IRRESTRICTO", accion + " acceso irrestricto a Usuario ID: " + usuarioId, request);
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("Error al actualizar el permiso irrestricto.");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("Parámetros de entrada inválidos.");
        }
    }

    private void handleEditar(HttpServletRequest request, HttpServletResponse response, PrintWriter out, int adminId) throws IOException {
        UsuarioController controller = new UsuarioController();

        try {
            Usuario usuario = new Usuario();
            usuario.setId(Integer.parseInt(request.getParameter("id")));
            usuario.setNombre(request.getParameter("nombre"));
            usuario.setCorreo(request.getParameter("correo"));
            usuario.setUsername(request.getParameter("username"));
            usuario.setPassword(request.getParameter("password"));
            usuario.setRol(request.getParameter("rol"));
            usuario.setPermiteAccesoIrrestricto(Integer.parseInt(request.getParameter("permiteAccesoIrrestricto")));

            int resultado = controller.editarUsuario(usuario);

            if (resultado == 1) {
                out.print("Usuario editado correctamente.");
                controller.registrarAccion(adminId, "EDITAR_USUARIO", "Usuario ID " + usuario.getId() + " editado por admin.", request);
            } else if (resultado == 0) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("Error: El ID del usuario a editar no existe.");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("Error desconocido al intentar editar el usuario.");
            }

        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("Parámetros de ID o permiso irrestricto inválidos.");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("Error interno al procesar la edición: " + e.getMessage());
        }
    }
}