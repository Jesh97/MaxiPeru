package sistema.Modelo.Articulo;

public class Categoria {

    private int idCategoria;
    private String nombre;

    public Categoria(int idCategoria, String nombreCategoria) {
        this.idCategoria = idCategoria;
        this.nombre = nombreCategoria;
    }

    public Categoria() {
    }

    public int getIdCategoria() {
        return idCategoria;
    }

    public void setIdCategoria(int idCategoria) {
        this.idCategoria = idCategoria;
    }

    public String getNombreCategoria() {
        return nombre;
    }

    public void setNombreCategoria(String nombreCategoria) {
        this.nombre = nombreCategoria;
    }

    @Override
    public String toString() {
        return "Categoria{" +
                "idCategoria=" + idCategoria +
                ", nombreCategoria='" + nombre + '\'' +
                '}';
    }
}
