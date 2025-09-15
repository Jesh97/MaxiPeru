package sistema.Modelo.Compra;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class Compra {

    @JsonProperty("id_compra")
    private int idCompra;

    @JsonProperty("serie")
    private String serie;

    @JsonProperty("correlativo")
    private String correlativo;

    @JsonProperty("fecha_emision")
    private LocalDate fechaEmision;

    @JsonProperty("fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @JsonProperty("id_moneda")
    private int idMoneda;

    @JsonProperty("tipo_cambio")
    private double tipoCambio;

    @JsonProperty("incluye_igv")
    private boolean incluyeIGV;

    @JsonProperty("hay_bonificacion")
    private boolean hayBonificacion;

    @JsonProperty("hay_traslado")
    private boolean hayTraslado;

    @JsonProperty("subtotal")
    private double subtotal;

    @JsonProperty("igv")
    private double igv;

    @JsonProperty("total")
    private double total;

    @JsonProperty("total_peso")
    private double totalPeso;

    @JsonProperty("coste_transporte")
    private double costeTransporte;

    @JsonProperty("observacion")
    private String observacion;

    @JsonProperty("fecha_registro")
    private LocalDateTime fechaRegistro;

    @JsonProperty("id_proveedor")
    private int idProveedor;

    @JsonProperty("id_tipo_comprobante")
    private int idTipoComprobante;

    @JsonProperty("id_tipo_pago")
    private int idTipoPago;

    @JsonProperty("id_forma_pago")
    private int idFormaPago;

    public Compra(int idCompra, String serie, String correlativo, LocalDate fechaEmision, LocalDate fechaVencimiento,
                  int idMoneda, double tipoCambio, boolean incluyeIGV, boolean hayBonificacion,
                  boolean hayTraslado, double subtotal, double igv, double total, double totalPeso,
                  double costeTransporte, String observacion, LocalDateTime fechaRegistro, int idProveedor,
                  int idTipoComprobante, int idTipoPago, int idFormaPago) {
        this.idCompra = idCompra;
        this.serie = serie;
        this.correlativo = correlativo;
        this.fechaEmision = fechaEmision;
        this.fechaVencimiento = fechaVencimiento;
        this.idMoneda = idMoneda;
        this.tipoCambio = tipoCambio;
        this.incluyeIGV = incluyeIGV;
        this.hayBonificacion = hayBonificacion;
        this.hayTraslado = hayTraslado;
        this.subtotal = subtotal;
        this.igv = igv;
        this.total = total;
        this.totalPeso = totalPeso;
        this.costeTransporte = costeTransporte;
        this.observacion = observacion;
        this.fechaRegistro = fechaRegistro;
        this.idProveedor = idProveedor;
        this.idTipoComprobante = idTipoComprobante;
        this.idTipoPago = idTipoPago;
        this.idFormaPago = idFormaPago;
    }

    public Compra() {
    }

    public int getIdCompra() {
        return idCompra;
    }

    public void setIdCompra(int idCompra) {
        this.idCompra = idCompra;
    }

    public String getSerie() {
        return serie;
    }

    public void setSerie(String serie) {
        this.serie = serie;
    }

    public String getCorrelativo() {
        return correlativo;
    }

    public void setCorrelativo(String correlativo) {
        this.correlativo = correlativo;
    }

    public LocalDate getFechaEmision() {
        return fechaEmision;
    }

    public void setFechaEmision(LocalDate fechaEmision) {
        this.fechaEmision = fechaEmision;
    }

    public LocalDate getFechaVencimiento() {
        return fechaVencimiento;
    }

    public void setFechaVencimiento(LocalDate fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }

    public int getIdMoneda() {
        return idMoneda;
    }

    public void setIdMoneda(int idMoneda) {
        this.idMoneda = idMoneda;
    }

    public double getTipoCambio() {
        return tipoCambio;
    }

    public void setTipoCambio(double tipoCambio) {
        this.tipoCambio = tipoCambio;
    }

    public boolean isIncluyeIGV() {
        return incluyeIGV;
    }

    public void setIncluyeIGV(boolean incluyeIGV) {
        this.incluyeIGV = incluyeIGV;
    }

    public boolean isHayBonificacion() {
        return hayBonificacion;
    }

    public void setHayBonificacion(boolean hayBonificacion) {
        this.hayBonificacion = hayBonificacion;
    }

    public boolean isHayTraslado() {
        return hayTraslado;
    }

    public void setHayTraslado(boolean hayTraslado) {
        this.hayTraslado = hayTraslado;
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

    public double getTotalPeso() {
        return totalPeso;
    }

    public void setTotalPeso(double totalPeso) {
        this.totalPeso = totalPeso;
    }

    public double getCosteTransporte() {
        return costeTransporte;
    }

    public void setCosteTransporte(double costeTransporte) {
        this.costeTransporte = costeTransporte;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public int getIdProveedor() {
        return idProveedor;
    }

    public void setIdProveedor(int idProveedor) {
        this.idProveedor = idProveedor;
    }

    public int getIdTipoComprobante() {
        return idTipoComprobante;
    }

    public void setIdTipoComprobante(int idTipoComprobante) {
        this.idTipoComprobante = idTipoComprobante;
    }

    public int getIdTipoPago() {
        return idTipoPago;
    }

    public void setIdTipoPago(int idTipoPago) {
        this.idTipoPago = idTipoPago;
    }

    public int getIdFormaPago() {
        return idFormaPago;
    }

    public void setIdFormaPago(int idFormaPago) {
        this.idFormaPago = idFormaPago;
    }

    @Override
    public String toString() {
        return "Compra{" +
                "idCompra=" + idCompra +
                ", serie='" + serie + '\'' +
                ", correlativo='" + correlativo + '\'' +
                ", fechaEmision=" + fechaEmision +
                ", fechaVencimiento=" + fechaVencimiento +
                ", idMoneda=" + idMoneda +
                ", tipoCambio=" + tipoCambio +
                ", incluyeIGV=" + incluyeIGV +
                ", hayBonificacion=" + hayBonificacion +
                ", hayTraslado=" + hayTraslado +
                ", subtotal=" + subtotal +
                ", igv=" + igv +
                ", total=" + total +
                ", totalPeso=" + totalPeso +
                ", costeTransporte=" + costeTransporte +
                ", observacion='" + observacion + '\'' +
                ", fechaRegistro=" + fechaRegistro +
                ", idProveedor=" + idProveedor +
                ", idTipoComprobante=" + idTipoComprobante +
                ", idTipoPago=" + idTipoPago +
                ", idFormaPago=" + idFormaPago +
                '}';
    }
}
