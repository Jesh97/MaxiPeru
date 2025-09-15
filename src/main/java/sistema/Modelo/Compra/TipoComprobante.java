package sistema.Modelo.Compra;

public class TipoComprobante {

    private int id;
    private String nombre;

    public TipoComprobante(int id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public TipoComprobante() {
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
}
