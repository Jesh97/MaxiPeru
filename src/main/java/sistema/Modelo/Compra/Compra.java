package sistema.Modelo.Compra;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Compra {

    @JsonProperty("id_compra")
    private int idCompra;
    @JsonProperty("id_proveedor")
    private int idProveedor;
    @JsonProperty("id_tipo_comprobante")
    private int idTipoComprobante;
    @JsonProperty("id_tipo_pago")
    private int idTipoPago;
    @JsonProperty("id_forma_pago")
    private int idFormaPago;
    @JsonProperty("id_moneda")
    private int idMoneda;
    @JsonProperty("nombre_tipo_comprobante")
    private String nombreTipoComprobante;
    @JsonProperty("nombre_tipo_pago")
    private String nombreTipoPago;
    @JsonProperty("nombre_forma_pago")
    private String nombreFormaPago;
    @JsonProperty("nombre_moneda")
    private String nombreMoneda;
    @JsonProperty("serie")
    private String serie;
    @JsonProperty("correlativo")
    private String correlativo;
    @JsonProperty("fecha_emision")
    private LocalDate fechaEmision;
    @JsonProperty("fecha_vencimiento")
    private LocalDate fechaVencimiento;
    @JsonProperty("tipo_cambio")
    private BigDecimal tipoCambio;
    @JsonProperty("incluye_igv")
    private boolean incluyeIgv;
    @JsonProperty("hay_bonificacion")
    private boolean hayBonificacion;
    @JsonProperty("hay_traslado")
    private boolean hayTraslado;
    @JsonProperty("observacion")
    private String observacion;
    @JsonProperty("subtotal")
    private BigDecimal subtotal;
    @JsonProperty("igv")
    private BigDecimal igv;
    @JsonProperty("total")
    private BigDecimal total;
    @JsonProperty("total_peso")
    private BigDecimal totalPeso;
    @JsonProperty("coste_transporte")
    private BigDecimal costeTransporte;

    // Constructor completo actualizado
    public Compra(int idCompra, int idProveedor, int idTipoComprobante, String serie, String correlativo,
                  LocalDate fechaEmision, LocalDate fechaVencimiento, int idTipoPago, int idFormaPago,
                  int idMoneda, BigDecimal tipoCambio, boolean incluyeIgv, boolean hayBonificacion,
                  boolean hayTraslado, String observacion, BigDecimal subtotal, BigDecimal igv,
                  BigDecimal total, BigDecimal totalPeso, BigDecimal costeTransporte) {
        this.idCompra = idCompra;
        this.idProveedor = idProveedor;
        this.idTipoComprobante = idTipoComprobante;
        this.serie = serie;
        this.correlativo = correlativo;
        this.fechaEmision = fechaEmision;
        this.fechaVencimiento = fechaVencimiento;
        this.idTipoPago = idTipoPago;
        this.idFormaPago = idFormaPago;
        this.idMoneda = idMoneda;
        this.tipoCambio = tipoCambio;
        this.incluyeIgv = incluyeIgv;
        this.hayBonificacion = hayBonificacion;
        this.hayTraslado = hayTraslado;
        this.observacion = observacion;
        this.subtotal = subtotal;
        this.igv = igv;
        this.total = total;
        this.totalPeso = totalPeso;
        this.costeTransporte = costeTransporte;
    }

    public Compra() {
    }

    // Getters y Setters
    public int getIdCompra() { return idCompra; }
    public void setIdCompra(int idCompra) { this.idCompra = idCompra; }
    public int getIdProveedor() { return idProveedor; }
    public void setIdProveedor(int idProveedor) { this.idProveedor = idProveedor; }
    public int getIdTipoComprobante() { return idTipoComprobante; }
    public void setIdTipoComprobante(int idTipoComprobante) { this.idTipoComprobante = idTipoComprobante; }
    public String getSerie() { return serie; }
    public void setSerie(String serie) { this.serie = serie; }
    public String getCorrelativo() { return correlativo; }
    public void setCorrelativo(String correlativo) { this.correlativo = correlativo; }
    public LocalDate getFechaEmision() { return fechaEmision; }
    public void setFechaEmision(LocalDate fechaEmision) { this.fechaEmision = fechaEmision; }
    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(LocalDate fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }
    public int getIdTipoPago() { return idTipoPago; }
    public void setIdTipoPago(int idTipoPago) { this.idTipoPago = idTipoPago; }
    public int getIdFormaPago() { return idFormaPago; }
    public void setIdFormaPago(int idFormaPago) { this.idFormaPago = idFormaPago; }
    public int getIdMoneda() { return idMoneda; }
    public void setIdMoneda(int idMoneda) { this.idMoneda = idMoneda; }
    public BigDecimal getTipoCambio() { return tipoCambio; }
    public void setTipoCambio(BigDecimal tipoCambio) { this.tipoCambio = tipoCambio; }
    public boolean isIncluyeIgv() { return incluyeIgv; }
    public void setIncluyeIgv(boolean incluyeIgv) { this.incluyeIgv = incluyeIgv; }
    public boolean isHayBonificacion() { return hayBonificacion; }
    public void setHayBonificacion(boolean hayBonificacion) { this.hayBonificacion = hayBonificacion; }
    public boolean isHayTraslado() { return hayTraslado; }
    public void setHayTraslado(boolean hayTraslado) { this.hayTraslado = hayTraslado; }
    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public BigDecimal getIgv() { return igv; }
    public void setIgv(BigDecimal igv) { this.igv = igv; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public BigDecimal getTotalPeso() { return totalPeso; }
    public void setTotalPeso(BigDecimal totalPeso) { this.totalPeso = totalPeso; }
    public BigDecimal getCosteTransporte() { return costeTransporte; }
    public void setCosteTransporte(BigDecimal costeTransporte) { this.costeTransporte = costeTransporte; }

    @Override
    public String toString() {
        return "Compra{" +
                "idCompra=" + idCompra +
                ", idProveedor=" + idProveedor +
                ", idTipoComprobante=" + idTipoComprobante +
                ", idTipoPago=" + idTipoPago +
                ", idFormaPago=" + idFormaPago +
                ", idMoneda=" + idMoneda +
                ", serie='" + serie + '\'' +
                ", correlativo='" + correlativo + '\'' +
                ", fechaEmision=" + fechaEmision +
                ", fechaVencimiento=" + fechaVencimiento +
                ", tipoCambio=" + tipoCambio +
                ", incluyeIgv=" + incluyeIgv +
                ", hayBonificacion=" + hayBonificacion +
                ", hayTraslado=" + hayTraslado +
                ", observacion='" + observacion + '\'' +
                ", subtotal=" + subtotal +
                ", igv=" + igv +
                ", total=" + total +
                ", totalPeso=" + totalPeso +
                ", costeTransporte=" + costeTransporte +
                '}';
    }
}