package sistema.Modelo.Compra;

public class FormaPago {

    private int id;
    private String nombre;

    public FormaPago(int id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public FormaPago() {
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

    @Override
    public String toString() {
        return "TipoPago{" +
                "id=" + id +
                ", nombre='" + nombre + '\'' +
                '}';
    }
}
