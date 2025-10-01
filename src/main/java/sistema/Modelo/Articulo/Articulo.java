package sistema.Modelo.Articulo;

public class Articulo {

    private int idProducto;
    private String codigo;
    private String descripcion;
    private int cantidad;
    private double precioUnitario;
    private double pesoUnitario;
    private double densidad;
    private String aroma;
    private String color;
    private int idMarca;
    private int idCategoria;
    private int idUnidad;
    private int idTipoArticulo;

    public Articulo(int idProducto, String codigo, String descripcion, int cantidad, double precioUnitario,
                    double pesoUnitario, double densidad, String aroma, String color, int idMarca,
                    int idCategoria, int idUnidad, int idTipoArticulo) {
        this.idProducto = idProducto;
        this.codigo = codigo;
        this.descripcion = descripcion;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.pesoUnitario = pesoUnitario;
        this.densidad = densidad;
        this.aroma = aroma;
        this.color = color;
        this.idMarca = idMarca;
        this.idCategoria = idCategoria;
        this.idUnidad = idUnidad;
        this.idTipoArticulo = idTipoArticulo;
    }

    public Articulo() {
    }

    public int getIdProducto() {
        return idProducto;
    }

    public void setIdProducto(int idProducto) {
        this.idProducto = idProducto;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public double getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(double precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    public double getPesoUnitario() {
        return pesoUnitario;
    }

    public void setPesoUnitario(double pesoUnitario) {
        this.pesoUnitario = pesoUnitario;
    }

    public double getDensidad() {
        return densidad;
    }

    public void setDensidad(double densidad) {
        this.densidad = densidad;
    }

    public String getAroma() {
        return aroma;
    }

    public void setAroma(String aroma) {
        this.aroma = aroma;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public int getIdMarca() {
        return idMarca;
    }

    public void setIdMarca(int idMarca) {
        this.idMarca = idMarca;
    }

    public int getIdCategoria() {
        return idCategoria;
    }

    public void setIdCategoria(int idCategoria) {
        this.idCategoria = idCategoria;
    }

    public int getIdUnidad() {
        return idUnidad;
    }

    public void setIdUnidad(int idUnidad) {
        this.idUnidad = idUnidad;
    }

    public int getIdTipoArticulo() {
        return idTipoArticulo;
    }

    public void setIdTipoArticulo(int idTipoArticulo) {
        this.idTipoArticulo = idTipoArticulo;
    }

    @Override
    public String toString() {
        return "Articulo{" +
                "idProducto=" + idProducto +
                ", codigo='" + codigo + '\'' +
                ", descripcion='" + descripcion + '\'' +
                ", cantidad=" + cantidad +
                ", precioUnitario=" + precioUnitario +
                ", pesoUnitario=" + pesoUnitario +
                ", densidad=" + densidad +
                ", aroma='" + aroma + '\'' +
                ", color='" + color + '\'' +
                ", idMarca=" + idMarca +
                ", idCategoria=" + idCategoria +
                ", idUnidad=" + idUnidad +
                ", idTipoArticulo=" + idTipoArticulo +
                '}';
    }
}