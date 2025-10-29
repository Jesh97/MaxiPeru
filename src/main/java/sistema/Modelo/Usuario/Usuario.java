package sistema.Modelo.Usuario;

public class Usuario {

    private int id;
    private String nombre;
    private String correo;
    private String username;
    private String password;
    private String rol;
    private int estado;
    private int permiteAccesoIrrestricto;

    public Usuario(int id, String nombre, String correo, String username, String password, String rol,
                   int estado, int permiteAccesoIrrestricto) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.username = username;
        this.password = password;
        this.rol = rol;
        this.estado = estado;
        this.permiteAccesoIrrestricto = permiteAccesoIrrestricto;
    }

    public Usuario() {
    }

    public Usuario(String nombre, String correo, String username, String password, String rol, String estado) {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public int getEstado() {
        return estado;
    }

    public void setEstado(int estado) {
        this.estado = estado;
    }

    public int getPermiteAccesoIrrestricto() {
        return permiteAccesoIrrestricto;
    }

    public void setPermiteAccesoIrrestricto(int permiteAccesoIrrestricto) {
        this.permiteAccesoIrrestricto = permiteAccesoIrrestricto;
    }

    @Override
    public String toString() {
        return "Usuario{" +
                "id=" + id +
                ", nombre='" + nombre + '\'' +
                ", correo='" + correo + '\'' +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", rol='" + rol + '\'' +
                ", estado=" + estado +
                ", permiteAccesoIrrestricto=" + permiteAccesoIrrestricto +
                '}';
    }
}
