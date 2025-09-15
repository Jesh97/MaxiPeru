package sistema.Modelo.Compra;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DetalleCompra {

    @JsonProperty("id_detalle")
    private int idDetalle;

    @JsonProperty("id_compra")
    private int idCompra;

    @JsonProperty("id_articulo")
    private int idArticulo;

    @JsonProperty("cantidad")
    private double cantidad;

    @JsonProperty("precio_unitario")
    private double precioUnitario;

    @JsonProperty("bonificacion")
    private double bonificacion;

    @JsonProperty("coste_unitario_transporte")
    private double costeUnitarioTransporte;

    @JsonProperty("coste_total_transporte")
    private double costeTotalTransporte;

    @JsonProperty("precio_con_descuento")
    private double precioConDescuento;

    @JsonProperty("igv_insumo")
    private double igvInsumo;

    @JsonProperty("total")
    private double total;

    @JsonProperty("peso_total")
    private double pesoTotal;

    public DetalleCompra(int idDetalle, int idCompra, int idArticulo, double cantidad, double precioUnitario,
                         double bonificacion, double costeUnitarioTransporte, double costeTotalTransporte,
                         double precioConDescuento, double igvInsumo, double total, double pesoTotal) {
        this.idDetalle = idDetalle;
        this.idCompra = idCompra;
        this.idArticulo = idArticulo;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.bonificacion = bonificacion;
        this.costeUnitarioTransporte = costeUnitarioTransporte;
        this.costeTotalTransporte = costeTotalTransporte;
        this.precioConDescuento = precioConDescuento;
        this.igvInsumo = igvInsumo;
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

    public int getIdArticulo() {
        return idArticulo;
    }

    public void setIdArticulo(int idArticulo) {
        this.idArticulo = idArticulo;
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

    public double getBonificacion() {
        return bonificacion;
    }

    public void setBonificacion(double bonificacion) {
        this.bonificacion = bonificacion;
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

    public double getIgvInsumo() {
        return igvInsumo;
    }

    public void setIgvInsumo(double igvInsumo) {
        this.igvInsumo = igvInsumo;
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
                ", idArticulo=" + idArticulo +
                ", cantidad=" + cantidad +
                ", precioUnitario=" + precioUnitario +
                ", bonificacion=" + bonificacion +
                ", costeUnitarioTransporte=" + costeUnitarioTransporte +
                ", costeTotalTransporte=" + costeTotalTransporte +
                ", precioConDescuento=" + precioConDescuento +
                ", igvInsumo=" + igvInsumo +
                ", total=" + total +
                ", pesoTotal=" + pesoTotal +
                '}';
    }
}