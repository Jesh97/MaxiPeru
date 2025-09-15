package sistema.Modelo.Compra;

public class TipoPago {

    private int id;
    private String nombre;

    public TipoPago(int id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public TipoPago() {
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
