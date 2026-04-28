package sistema.Controller.Usuario;

import jakarta.servlet.http.HttpServletRequest;
import sistema.Ejecucion.Conexion;
import sistema.Modelo.Usuario.ActividadUsuario;
import sistema.Modelo.Usuario.Usuario;
import sistema.repository.UsuarioRepository;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class UsuarioController implements UsuarioRepository {

    /**
     * MySQL deja resultsets pendientes tras CALL hasta agotar getMoreResults();
     * si no se hace, la misma conexión puede bloquearse al ejecutar otra sentencia.
     */
    private static void agotarResultadosProcedure(CallableStatement cs) throws SQLException {
        while (cs.getMoreResults()) {
            try (ResultSet rs = cs.getResultSet()) {
                if (rs != null) {
                    while (rs.next()) {
                        // descartar filas adicionales
                    }
                }
            }
        }
    }

    @Override
    public Usuario obtenerUsuario(String username, String password) {
        String sqlValidacion = "{CALL sp_validar_inicio_sesion(?, ?)}";
        int resultadoValidacion = -99;
        int usuarioIdDesdeSP = 0;

        Connection connRaw = Conexion.obtenerConexion();
        if (connRaw == null) {
            return null;
        }

        try (Connection conn = connRaw;
             CallableStatement cs = conn.prepareCall(sqlValidacion)) {

            cs.setString(1, username);
            cs.setString(2, password);

            if (cs.execute()) {
                try (ResultSet rs = cs.getResultSet()) {
                    if (rs != null && rs.next()) {
                        resultadoValidacion = rs.getInt("resultado_validacion");
                    }
                }
            }
            agotarResultadosProcedure(cs);

            if (resultadoValidacion == 1) {
                String sqlDatos = "SELECT id, nombre, correo, username, password, rol, estado, permite_acceso_irrestricto FROM usuario WHERE username = ?";
                try (PreparedStatement stmt = conn.prepareStatement(sqlDatos)) {
                    stmt.setString(1, username);
                    ResultSet rsDatos = stmt.executeQuery();

                    if (rsDatos.next()) {
                        Usuario usuario = new Usuario();
                        usuario.setId(rsDatos.getInt("id"));
                        usuario.setNombre(rsDatos.getString("nombre"));
                        usuario.setCorreo(rsDatos.getString("correo"));
                        usuario.setUsername(rsDatos.getString("username"));
                        usuario.setPassword(rsDatos.getString("password"));
                        usuario.setRol(rsDatos.getString("rol"));
                        usuario.setEstado(rsDatos.getInt("estado"));
                        usuario.setPermiteAccesoIrrestricto(rsDatos.getInt("permite_acceso_irrestricto"));
                        return usuario;
                    }
                }
            } else if (resultadoValidacion == -1) {
                String sqlGetId = "SELECT id FROM usuario WHERE username = ?";
                try (PreparedStatement psId = conn.prepareStatement(sqlGetId)) {
                    psId.setString(1, username);
                    ResultSet rsId = psId.executeQuery();
                    if (rsId.next()) {
                        usuarioIdDesdeSP = rsId.getInt("id");
                    }
                }
                Usuario estadoUsuario = new Usuario();
                estadoUsuario.setEstado(-1);
                estadoUsuario.setId(usuarioIdDesdeSP);
                return estadoUsuario;
            } else if (resultadoValidacion == 0) {
                // Sin login permitido: solo devolver el estado real si la contraseña coincide (mismo criterio que el SP);
                // si no coincide, tratarlo como credenciales incorrectas (el SP solo devuelve 0 y no distingue).
                String sqlEstado = "SELECT id, estado, password FROM usuario WHERE username = ?";
                try (PreparedStatement ps = conn.prepareStatement(sqlEstado)) {
                    ps.setString(1, username);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) {
                            String pwdBd = rs.getString("password");
                            if (pwdBd == null || !pwdBd.equals(password)) {
                                return null;
                            }
                            Usuario estadoUsuario = new Usuario();
                            estadoUsuario.setId(rs.getInt("id"));
                            estadoUsuario.setEstado(rs.getInt("estado"));
                            return estadoUsuario;
                        }
                    }
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public boolean registrarUsuario(Usuario usuario) {
        String sql = "{CALL sp_crear_usuario(?, ?, ?, ?, ?)}";
        try (Connection conn = Conexion.obtenerConexion();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setString(1, usuario.getNombre());
            cs.setString(2, usuario.getCorreo());
            cs.setString(3, usuario.getUsername());
            cs.setString(4, usuario.getPassword());
            cs.setString(5, usuario.getRol());

            cs.execute();
            return true;

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean habilitarUsuario(int usuarioId, int adminPrincipalId) {
        String sql = "{CALL sp_aceptar_usuario(?, ?)}";
        try (Connection conn = Conexion.obtenerConexion();
             CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, usuarioId);
            cs.setInt(2, adminPrincipalId);
            cs.execute();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean deshabilitarUsuario(int usuarioId, int adminPrincipalId) {
        String sql = "{CALL sp_deshabilitar_usuario(?, ?)}";
        try (Connection conn = Conexion.obtenerConexion();
             CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, usuarioId);
            cs.setInt(2, adminPrincipalId);
            cs.execute();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Rechaza una solicitud de registro pendiente (marca estado = 3 en BD).
     * @return true si se actualizó; false si no aplica o falló
     */
    public boolean rechazarSolicitudUsuario(int usuarioId, int adminPrincipalId) {
        Connection connRaw = Conexion.obtenerConexion();
        if (connRaw == null) {
            return false;
        }
        String sql = "{CALL sp_rechazar_solicitud_usuario(?, ?)}";
        try (Connection conn = connRaw;
             CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, usuarioId);
            cs.setInt(2, adminPrincipalId);
            if (cs.execute()) {
                try (ResultSet rs = cs.getResultSet()) {
                    if (rs != null) {
                        while (rs.next()) { }
                    }
                }
            }
            agotarResultadosProcedure(cs);
            String verificar = "SELECT estado FROM usuario WHERE id = ?";
            try (PreparedStatement ps = conn.prepareStatement(verificar)) {
                ps.setInt(1, usuarioId);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        return rs.getInt("estado") == 3;
                    }
                }
            }
            return false;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean cambiarPermisoIrrestricto(int usuarioId, int adminPrincipalId, int permisoNuevo) {
        if (permisoNuevo == 1) {
            String sql = "{CALL sp_otorgar_acceso_irrestricto(?, ?)}";
            try (Connection conn = Conexion.obtenerConexion();
                 CallableStatement cs = conn.prepareCall(sql)) {
                cs.setInt(1, usuarioId);
                cs.setInt(2, adminPrincipalId);
                cs.execute();
                return true;
            } catch (SQLException e) {
                e.printStackTrace();
                return false;
            }
        } else {
            String sql = "UPDATE usuario SET permite_acceso_irrestricto = 0 WHERE id = ?";
            try (Connection conn = Conexion.obtenerConexion();
                 PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setInt(1, usuarioId);
                int filas = ps.executeUpdate();
                return filas > 0;
            } catch (SQLException e) {
                e.printStackTrace();
                return false;
            }
        }
    }

    @Override
    public void registrarActividad(ActividadUsuario actividad) {
        Connection conn = Conexion.obtenerConexion();
        if (conn == null) {
            return;
        }
        try (conn) {
            String sql = "INSERT INTO actividad_usuario (usuario_id, tipo, descripcion) VALUES (?, ?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setInt(1, actividad.getUsuarioId());
                ps.setString(2, actividad.getTipo());
                ps.setString(3, actividad.getDescription());
                ps.executeUpdate();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void registrarAccion(int usuarioId, String tipo, String descripcion, HttpServletRequest request) {
        ActividadUsuario actividad = new ActividadUsuario();
        actividad.setUsuarioId(usuarioId);
        actividad.setTipo(tipo);
        actividad.setDescription(descripcion);
        registrarActividad(actividad);
    }

    @Override
    public List<ActividadUsuario> listarPorUsuario(int usuarioId) {
        List<ActividadUsuario> lista = new ArrayList<>();
        try (Connection conn = Conexion.obtenerConexion()) {
            String sql = "SELECT * FROM actividad_usuario WHERE usuario_id = ? ORDER BY fecha DESC";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setInt(1, usuarioId);
                ResultSet rs = ps.executeQuery();
                while (rs.next()) {
                    ActividadUsuario act = new ActividadUsuario();
                    act.setId(rs.getInt("id"));
                    act.setUsuarioId(rs.getInt("usuario_id"));
                    act.setTipo(rs.getString("tipo"));
                    act.setDescription(rs.getString("descripcion"));
                    act.setFecha(rs.getString("fecha"));
                    lista.add(act);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    @Override
    public List<Usuario> listarUsuarios() {
        List<Usuario> usuarios = new ArrayList<>();
        String sql = "SELECT id, nombre, correo, username, rol, estado, permite_acceso_irrestricto FROM usuario";

        try (Connection conn = Conexion.obtenerConexion();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Usuario u = new Usuario();
                u.setId(rs.getInt("id"));
                u.setNombre(rs.getString("nombre"));
                u.setCorreo(rs.getString("correo"));
                u.setUsername(rs.getString("username"));
                u.setRol(rs.getString("rol"));
                u.setEstado(rs.getInt("estado"));
                u.setPermiteAccesoIrrestricto(rs.getInt("permite_acceso_irrestricto"));
                usuarios.add(u);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return usuarios;
    }

    @Override
    public boolean cambiarEstadoUsuario(int id, int estado) {
        throw new UnsupportedOperationException("Usar habilitarUsuario o deshabilitarUsuario en su lugar.");
    }

    public int editarUsuario(Usuario usuario) {
        String sql = "{CALL sp_editar_usuario(?, ?, ?, ?, ?, ?)}";
        int resultado = 0;

        try (Connection conn = Conexion.obtenerConexion();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setInt(1, usuario.getId());
            cs.setString(2, usuario.getNombre());
            cs.setString(3, usuario.getCorreo());
            cs.setString(4, usuario.getUsername());
            cs.setString(5, usuario.getPassword());
            cs.setString(6, usuario.getRol());

            try (ResultSet rs = cs.executeQuery()) {
                if (rs.next()) {
                    resultado = rs.getInt("resultado");
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return 0;
        }
        return resultado;
    }
}