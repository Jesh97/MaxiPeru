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

        int adminPrincipalId = obtenerAdminPrincipalId(request);

        switch (accion) {
            case "habilitar":
                handleHabilitar(request, response, out, adminPrincipalId);
                break;

            case "deshabilitar":
                handleDeshabilitar(request, response, out, adminPrincipalId);
                break;

            case "permisoIrrestricto":
                handlePermisoIrrestricto(request, response, out, adminPrincipalId);
                break;

            case "editar":
                handleEditar(request, response, out, adminPrincipalId);
                break;

            default:
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("Acción no encontrada o método no soportado.");
                break;
        }
        out.flush();
    }

    private int obtenerAdminPrincipalId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("userId") != null) {
            return (int) session.getAttribute("userId");
        }
        return 0;
    }

    private void handleHabilitar(HttpServletRequest request, HttpServletResponse response, PrintWriter out, int adminPrincipalId) throws IOException {
        UsuarioController controller = new UsuarioController();
        if (adminPrincipalId == 0) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.print("Acceso denegado. Se requiere un Administrador Principal activo.");
            return;
        }
        try {
            int usuarioId = Integer.parseInt(request.getParameter("id"));
            if (controller.habilitarUsuario(usuarioId, adminPrincipalId)) {
                out.print("Cuenta habilitada/aceptada correctamente.");
                controller.registrarAccion(adminPrincipalId, "HABILITAR_CUENTA", "Habilitación de cuenta para Usuario ID: " + usuarioId, request);
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("Error al habilitar la cuenta. Verifique el rol del administrador principal.");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("ID de usuario inválido.");
        }
    }

    private void handleDeshabilitar(HttpServletRequest request, HttpServletResponse response, PrintWriter out, int adminPrincipalId) throws IOException {
        UsuarioController controller = new UsuarioController();
        if (adminPrincipalId == 0) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.print("Acceso denegado. Se requiere un Administrador Principal activo.");
            return;
        }
        try {
            int usuarioId = Integer.parseInt(request.getParameter("id"));
            if (controller.deshabilitarUsuario(usuarioId, adminPrincipalId)) {
                out.print("Usuario deshabilitado correctamente.");
                controller.registrarAccion(adminPrincipalId, "DESHABILITAR_USUARIO", "Deshabilitación de Usuario ID: " + usuarioId, request);
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("Error al deshabilitar el usuario. Verifique el rol del administrador principal.");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("Parámetros de entrada inválidos.");
        }
    }

    private void handlePermisoIrrestricto(HttpServletRequest request, HttpServletResponse response, PrintWriter out, int adminPrincipalId) throws IOException {
        UsuarioController controller = new UsuarioController();
        if (adminPrincipalId == 0) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.print("Acceso denegado. Se requiere un Administrador Principal activo.");
            return;
        }
        try {
            int usuarioId = Integer.parseInt(request.getParameter("id"));
            int permisoNuevo = Integer.parseInt(request.getParameter("permiso"));

            if (controller.cambiarPermisoIrrestricto(usuarioId, adminPrincipalId, permisoNuevo)) {
                String accion = (permisoNuevo == 1) ? "OTORGAR" : "REVOCAR";
                out.print("Permiso irrestricto " + accion + " correctamente.");
                controller.registrarAccion(adminPrincipalId, accion + "_ACCESO_IRRESTRICTO", accion + " acceso irrestricto a Usuario ID: " + usuarioId, request);
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("Error al actualizar el permiso irrestricto. Verifique el rol del administrador principal.");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("Parámetros de entrada inválidos.");
        }
    }

    private void handleEditar(HttpServletRequest request, HttpServletResponse response, PrintWriter out, int adminPrincipalId) throws IOException {
        UsuarioController controller = new UsuarioController();
        if (adminPrincipalId == 0) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.print("Acceso denegado. Se requiere un Administrador Principal activo.");
            return;
        }
        try {
            Usuario usuario = new Usuario();
            usuario.setId(Integer.parseInt(request.getParameter("id")));
            usuario.setNombre(request.getParameter("nombre"));
            usuario.setCorreo(request.getParameter("correo"));
            usuario.setUsername(request.getParameter("username"));
            usuario.setPassword(request.getParameter("password"));
            usuario.setRol(request.getParameter("rol"));

            int resultado = controller.editarUsuario(usuario);

            if (resultado == 1) {
                out.print("Usuario editado correctamente.");
                controller.registrarAccion(adminPrincipalId, "EDITAR_USUARIO", "Usuario ID " + usuario.getId() + " editado por admin principal.", request);
            } else if (resultado == 0) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("Error: El ID del usuario a editar no existe.");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("Error desconocido al intentar editar el usuario.");
            }

        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("Parámetros de ID inválidos.");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("Error interno al procesar la edición: " + e.getMessage());
        }
    }
}