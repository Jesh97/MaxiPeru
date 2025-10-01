package sistema.Servlet.Usuario;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sistema.Controller.Usuario.UsuarioController;
import sistema.Ejecucion.Auditoria;
import sistema.repository.UsuarioRepository;
import java.io.IOException;

@WebServlet("/usuario/deshabilitar")
public class DeshabilitarUsuario extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String idParam = request.getParameter("id");
        String estadoParam = request.getParameter("estado");

        if (idParam != null && estadoParam != null) {
            try {
                int id = Integer.parseInt(idParam);
                int estado = Integer.parseInt(estadoParam);

                UsuarioRepository usuarioDAO = new UsuarioController();
                boolean exito = usuarioDAO.cambiarEstadoUsuario(id, estado);

                if (exito) {
                    // Registrar acción
                    String accion = estado == 1 ? "habilitó" : "deshabilitó";
                    Auditoria.registrar(request, "Modificación", "El usuario " + accion + " al usuario con ID: " + id);

                    response.setStatus(200);
                    response.getWriter().write("Estado actualizado");
                } else {
                    response.setStatus(500);
                    response.getWriter().write("Error al actualizar el estado");
                }

            } catch (NumberFormatException e) {
                response.setStatus(400);
                response.getWriter().write("Parámetro id inválido");
            }
        } else {
            response.setStatus(400);
            response.getWriter().write("Faltan parámetros");
        }
    }
}

