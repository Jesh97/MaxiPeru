package sistema.repository;

import jakarta.servlet.http.HttpServletRequest;
import sistema.Modelo.Usuario.ActividadUsuario;
import sistema.Modelo.Usuario.Usuario;
import java.util.List;

public interface UsuarioRepository {

    Usuario obtenerUsuario(String username, String password);
    boolean registrarUsuario(Usuario usuario);
    void registrarActividad(ActividadUsuario actividad);
    void registrarAccion(int usuarioId, String tipo, String descripcion, HttpServletRequest request);
    List<ActividadUsuario> listarPorUsuario(int usuarioId);
    List<Usuario> listarUsuarios();
    boolean cambiarEstadoUsuario(int id, int estado);
}
