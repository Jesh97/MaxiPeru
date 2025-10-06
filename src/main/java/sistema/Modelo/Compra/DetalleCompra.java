package sistema.Modelo.Compra;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public class DetalleCompra {

    @JsonProperty("id_detalle")
    private int idDetalle;
    @JsonProperty("id_compra")
    private int idCompra;
    @JsonProperty("id_articulo")
    private int idArticulo;
    @JsonProperty("cantidad")
    private BigDecimal cantidad;
    @JsonProperty("precio_unitario")
    private BigDecimal precioUnitario;
    @JsonProperty("bonificacion") // Mapeo para el nuevo campo 'bonificacion'
    private BigDecimal bonificacion;
    @JsonProperty("coste_unitario_transporte")
    private BigDecimal costeUnitarioTransporte;
    @JsonProperty("coste_total_transporte")
    private BigDecimal costeTotalTransporte;
    @JsonProperty("precio_con_descuento")
    private BigDecimal precioConDescuento;
    @JsonProperty("igv_insumo") // Mapeo para 'igv_insumo'
    private BigDecimal igvInsumo;
    @JsonProperty("total")
    private BigDecimal total;
    @JsonProperty("peso_total")
    private BigDecimal pesoTotal;

    public DetalleCompra(int idDetalle, int idCompra, int idArticulo, BigDecimal cantidad, BigDecimal precioUnitario,
                         BigDecimal bonificacion, BigDecimal costeUnitarioTransporte, BigDecimal costeTotalTransporte,
                         BigDecimal precioConDescuento, BigDecimal igvInsumo, BigDecimal total, BigDecimal pesoTotal) {
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

    public BigDecimal getCantidad() {
        return cantidad;
    }

    public void setCantidad(BigDecimal cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    public BigDecimal getBonificacion() {
        return bonificacion;
    }

    public void setBonificacion(BigDecimal bonificacion) {
        this.bonificacion = bonificacion;
    }

    public BigDecimal getCosteUnitarioTransporte() {
        return costeUnitarioTransporte;
    }

    public void setCosteUnitarioTransporte(BigDecimal costeUnitarioTransporte) {
        this.costeUnitarioTransporte = costeUnitarioTransporte;
    }

    public BigDecimal getCosteTotalTransporte() {
        return costeTotalTransporte;
    }

    public void setCosteTotalTransporte(BigDecimal costeTotalTransporte) {
        this.costeTotalTransporte = costeTotalTransporte;
    }

    public BigDecimal getPrecioConDescuento() {
        return precioConDescuento;
    }

    public void setPrecioConDescuento(BigDecimal precioConDescuento) {
        this.precioConDescuento = precioConDescuento;
    }

    public BigDecimal getIgvInsumo() {
        return igvInsumo;
    }

    public void setIgvInsumo(BigDecimal igvInsumo) {
        this.igvInsumo = igvInsumo;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public BigDecimal getPesoTotal() {
        return pesoTotal;
    }

    public void setPesoTotal(BigDecimal pesoTotal) {
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