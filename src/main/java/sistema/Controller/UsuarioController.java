package sistema.Controller;

import jakarta.servlet.http.HttpServletRequest;
import sistema.Ejecucion.Conexion;
import ActividadUsuario;
import sistema.Modelo.Usuario.Usuario;
import sistema.repository.UsuarioRepository;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class UsuarioController implements UsuarioRepository {

    @Override
    public Usuario obtenerUsuario(String username, String password) {
        String sql = "SELECT * FROM usuario WHERE username = ? AND password = ?";
        try (Connection conn = Conexion.obtenerConexion();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, username);
            stmt.setString(2, password);

            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                Usuario usuario = new Usuario();
                usuario.setId(rs.getInt("id"));
                usuario.setNombre(rs.getString("nombre"));
                usuario.setCorreo(rs.getString("correo"));
                usuario.setUsername(rs.getString("username"));
                usuario.setPassword(rs.getString("password"));
                usuario.setRol(rs.getString("rol"));
                usuario.setEstado(rs.getInt("estado"));
                return usuario;
            }

        } catch (SQLException e) {
            System.out.println("Error al obtener usuario: " + e.getMessage());
        }
        return null;
    }

    @Override
    public boolean registrarUsuario(Usuario usuario) {
        String sql = "INSERT INTO usuario (nombre, correo, username, password, rol, estado) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = Conexion.obtenerConexion();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, usuario.getNombre());
            ps.setString(2, usuario.getCorreo());
            ps.setString(3, usuario.getUsername());
            ps.setString(4, usuario.getPassword());
            ps.setString(5, usuario.getRol());
            ps.setInt(6, usuario.getEstado());

            int filas = ps.executeUpdate();
            return filas > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }

    @Override
    public void registrarActividad(ActividadUsuario actividad) {
        try (Connection conn = Conexion.obtenerConexion()) {
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
        String sql = "SELECT * FROM usuario";

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
                usuarios.add(u);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return usuarios;
    }

    @Override
    public boolean cambiarEstadoUsuario(int id, int estado) {
        String sql = "UPDATE usuario SET estado = ? WHERE id = ?";
        try (Connection conn = Conexion.obtenerConexion();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, estado);
            ps.setInt(2, id);
            int filasAfectadas = ps.executeUpdate();
            return filasAfectadas > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}