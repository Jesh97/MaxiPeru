package sistema.Modelo.Gasto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DetalleGasto {
    @JsonProperty("id_detalle_gasto")
    private int idDetalleGasto;

    @JsonProperty("id_gasto")
    private int idGasto;

    @JsonProperty("descripcion")
    private String descripcion;

    @JsonProperty("cantidad")
    private double cantidad;

    @JsonProperty("precio_unitario")
    private double precioUnitario;

    @JsonProperty("subtotal")
    private double subtotal;

    @JsonProperty("igv")
    private double igv;

    @JsonProperty("total")
    private double total;

    public DetalleGasto(int idDetalleGasto, int idGasto, String descripcion, double cantidad, double precioUnitario,
                        double subtotal, double igv, double total) {
        this.idDetalleGasto = idDetalleGasto;
        this.idGasto = idGasto;
        this.descripcion = descripcion;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal = subtotal;
        this.igv = igv;
        this.total = total;
    }

    public DetalleGasto() {
    }

    public int getIdDetalleGasto() {
        return idDetalleGasto;
    }

    public void setIdDetalleGasto(int idDetalleGasto) {
        this.idDetalleGasto = idDetalleGasto;
    }

    public int getIdGasto() {
        return idGasto;
    }

    public void setIdGasto(int idGasto) {
        this.idGasto = idGasto;
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

    public double getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(double precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    public double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(double subtotal) {
        this.subtotal = subtotal;
    }

    public double getIgv() {
        return igv;
    }

    public void setIgv(double igv) {
        this.igv = igv;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    @Override
    public String toString() {
        return "DetalleGasto{" +
                "idDetalleGasto=" + idDetalleGasto +
                ", idGasto=" + idGasto +
                ", descripcion='" + descripcion + '\'' +
                ", cantidad=" + cantidad +
                ", precioUnitario=" + precioUnitario +
                ", subtotal=" + subtotal +
                ", igv=" + igv +
                ", total=" + total +
                '}';
    }
}
