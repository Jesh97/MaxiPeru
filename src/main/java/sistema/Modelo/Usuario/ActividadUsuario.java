package sistema.Modelo.Usuario;

public class ActividadUsuario {

    private int id;
    private int usuarioId;
    private String tipo;
    private String description;
    private String fecha;

    public ActividadUsuario(int id, int usuarioId, String tipo, String descripcion, String fecha) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.tipo = tipo;
        this.description = descripcion;
        this.fecha = fecha;
    }

    public ActividadUsuario() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(int usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    @Override
    public String toString() {
        return "ActividadUsuario{" +
                "id=" + id +
                ", usuarioId=" + usuarioId +
                ", tipo='" + tipo + '\'' +
                ", description='" + description + '\'' +
                ", fecha=" + fecha +
                '}';
    }
}
