package sistema.Ejecucion;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import sistema.Controller.Usuario.UsuarioController;
import sistema.Modelo.Usuario.Usuario;

public class Auditoria {

    public static void registrar(HttpServletRequest request, String tipo, String description) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            Usuario usuario = (Usuario) session.getAttribute("usuario");
            if (usuario != null) {
                UsuarioController dao = new UsuarioController();
                dao.registrarAccion(usuario.getId(), tipo, description, request);
            }
        }
    }
}
