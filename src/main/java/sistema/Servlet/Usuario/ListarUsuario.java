package sistema.Servlet.Usuario;

import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import sistema.Controller.UsuarioController;
import sistema.Ejecucion.Auditoria;
import sistema.Modelo.Usuario.Usuario;
import sistema.repository.UsuarioRepository;
import java.io.IOException;
import java.util.List;

@WebServlet("/listarUsuario")
public class ListarUsuario extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        UsuarioRepository dao = new UsuarioController();
        List<Usuario> usuarios = dao.listarUsuarios();

        // Registrar acción
        Auditoria.registrar(request, "Consulta", "Listó todos los usuarios");

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String json = new Gson().toJson(usuarios);
        response.getWriter().write(json);
    }
}
