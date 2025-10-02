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
    private Marca marca;
    private Categoria categoria;
    private UnidadMedida unidad;
    private TipoArticulo tipoArticulo;

    public Articulo(int idProducto, String codigo, String descripcion, int cantidad, double precioUnitario,
                    double pesoUnitario, double densidad, String aroma, String color, Marca marca, Categoria categoria,
                    UnidadMedida unidad, TipoArticulo tipoArticulo) {
        this.idProducto = idProducto;
        this.codigo = codigo;
        this.descripcion = descripcion;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.pesoUnitario = pesoUnitario;
        this.densidad = densidad;
        this.aroma = aroma;
        this.color = color;
        this.marca = marca;
        this.categoria = categoria;
        this.unidad = unidad;
        this.tipoArticulo = tipoArticulo;
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

    public Marca getMarca() {
        return marca;
    }

    public void setMarca(Marca marca) {
        this.marca = marca;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public UnidadMedida getUnidad() {
        return unidad;
    }

    public void setUnidad(UnidadMedida unidad) {
        this.unidad = unidad;
    }

    public TipoArticulo getTipoArticulo() {
        return tipoArticulo;
    }

    public void setTipoArticulo(TipoArticulo tipoArticulo) {
        this.tipoArticulo = tipoArticulo;
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
                ", marca=" + marca +
                ", categoria=" + categoria +
                ", unidad=" + unidad +
                ", tipoArticulo=" + tipoArticulo +
                '}';
    }
}