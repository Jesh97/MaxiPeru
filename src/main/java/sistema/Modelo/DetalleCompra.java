package sistema.Modelo;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DetalleCompra {

    @JsonProperty("id_detalle")
    private int idDetalle;

    @JsonProperty("id_compra")
    private int idCompra;

    @JsonProperty("id_producto")
    private int idProducto;

    @JsonProperty("cantidad")
    private double cantidad;

    @JsonProperty("precio_unitario")
    private double precioUnitario;

    @JsonProperty("coste_unitario_transporte")
    private double costeUnitarioTransporte;

    @JsonProperty("coste_total_transporte")
    private double costeTotalTransporte;

    @JsonProperty("precio_con_descuento")
    private double precioConDescuento;

    @JsonProperty("igv_producto")
    private double igvProducto;

    @JsonProperty("total")
    private double total;

    @JsonProperty("peso_total")
    private double pesoTotal;

    public DetalleCompra(int idDetalle, int idCompra, int idProducto, double cantidad, double precioUnitario,
                         double costeUnitarioTransporte, double costeTotalTransporte, double precioConDescuento,
                         double igvProducto, double total, double pesoTotal) {
        this.idDetalle = idDetalle;
        this.idCompra = idCompra;
        this.idProducto = idProducto;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.costeUnitarioTransporte = costeUnitarioTransporte;
        this.costeTotalTransporte = costeTotalTransporte;
        this.precioConDescuento = precioConDescuento;
        this.igvProducto = igvProducto;
        this.total = total;
        this.pesoTotal = pesoTotal;
    }

    public DetalleCompra() {
    }

    public int getIdDetalle() {
        return idDetalle;
    }

    public void setIdDetalle(int idDetalle) {
        this.idDetalle = idDetalle;
    }

    public int getIdCompra() {
        return idCompra;
    }

    public void setIdCompra(int idCompra) {
        this.idCompra = idCompra;
    }

    public int getIdProducto() {
        return idProducto;
    }

    public void setIdProducto(int idProducto) {
        this.idProducto = idProducto;
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

    public double getCosteUnitarioTransporte() {
        return costeUnitarioTransporte;
    }

    public void setCosteUnitarioTransporte(double costeUnitarioTransporte) {
        this.costeUnitarioTransporte = costeUnitarioTransporte;
    }

    public double getCosteTotalTransporte() {
        return costeTotalTransporte;
    }

    public void setCosteTotalTransporte(double costeTotalTransporte) {
        this.costeTotalTransporte = costeTotalTransporte;
    }

    public double getPrecioConDescuento() {
        return precioConDescuento;
    }

    public void setPrecioConDescuento(double precioConDescuento) {
        this.precioConDescuento = precioConDescuento;
    }

    public double getIgvProducto() {
        return igvProducto;
    }

    public void setIgvProducto(double igvProducto) {
        this.igvProducto = igvProducto;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public double getPesoTotal() {
        return pesoTotal;
    }

    public void setPesoTotal(double pesoTotal) {
        this.pesoTotal = pesoTotal;
    }

    @Override
    public String toString() {
        return "DetalleCompra{" +
                "idDetalle=" + idDetalle +
                ", idCompra=" + idCompra +
                ", idProducto=" + idProducto +
                ", cantidad=" + cantidad +
                ", precioUnitario=" + precioUnitario +
                ", costeUnitarioTransporte=" + costeUnitarioTransporte +
                ", costeTotalTransporte=" + costeTotalTransporte +
                ", precioConDescuento=" + precioConDescuento +
                ", igvProducto=" + igvProducto +
                ", total=" + total +
                ", pesoTotal=" + pesoTotal +
                '}';
    }
}