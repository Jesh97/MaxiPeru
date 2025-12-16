package sistema.Modelo.Articulo;

public class Articulo {

    private int idProducto;
    private String codigo;
    private String descripcion;
    private double cantidad; // Cambiado a double/BigDecimal en el SP/Controller, reflejando DECIMAL(12,8) en BD
    private double precioCompra;
    private double precioVenta;
    private double pesoUnitario;
    private double densidad;
    private String aroma;
    private String color;
    private Marca marca;
    private Categoria categoria;
    private UnidadMedida unidad;
    private TipoArticulo tipoArticulo;
    private double capacidad; // NUEVO CAMPO AÑADIDO

    public Articulo(int idProducto, String codigo, String descripcion, double cantidad, double precioCompra,
                    double precioVenta, double pesoUnitario, double densidad, String aroma, String color,
                    Marca marca, Categoria categoria, UnidadMedida unidad, TipoArticulo tipoArticulo, double capacidad) {
        this.idProducto = idProducto;
        this.codigo = codigo;
        this.descripcion = descripcion;
        this.cantidad = cantidad;
        this.precioCompra = precioCompra;
        this.precioVenta = precioVenta;
        this.pesoUnitario = pesoUnitario;
        this.densidad = densidad;
        this.aroma = aroma;
        this.color = color;
        this.marca = marca;
        this.categoria = categoria;
        this.unidad = unidad;
        this.tipoArticulo = tipoArticulo;
        this.capacidad = capacidad;
    }

    // Constructor sin capacidad (para compatibilidad)
    public Articulo(int idProducto, String codigo, String descripcion, double cantidad, double precioCompra,
                    double precioVenta, double pesoUnitario, double densidad, String aroma, String color,
                    Marca marca, Categoria categoria, UnidadMedida unidad, TipoArticulo tipoArticulo) {
        this(idProducto, codigo, descripcion, cantidad, precioCompra, precioVenta, pesoUnitario, densidad, aroma, color,
                marca, categoria, unidad, tipoArticulo, 0.0); // Capacidad por defecto
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

    public double getCantidad() {
        return cantidad;
    }

    public void setCantidad(double cantidad) {
        this.cantidad = cantidad;
    }

    // Nuevo Getter y Setter para capacidad
    public double getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(double capacidad) {
        this.capacidad = capacidad;
    }

    public double getPrecioCompra() {
        return precioCompra;
    }

    public void setPrecioCompra(double precioCompra) {
        this.precioCompra = precioCompra;
    }

    public double getPrecioVenta() {
        return precioVenta;
    }

    public void setPrecioVenta(double precioVenta) {
        this.precioVenta = precioVenta;
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
                ", precioCompra=" + precioCompra +
                ", precioVenta=" + precioVenta +
                ", pesoUnitario=" + pesoUnitario +
                ", densidad=" + densidad +
                ", aroma='" + aroma + '\'' +
                ", color='" + color + '\'' +
                ", marca=" + marca +
                ", categoria=" + categoria +
                ", unidad=" + unidad +
                ", tipoArticulo=" + tipoArticulo +
                ", capacidad=" + capacidad + // Incluido en toString
                '}';
    }
}