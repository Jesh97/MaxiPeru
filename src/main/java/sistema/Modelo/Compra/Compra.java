package sistema.Modelo.Compra;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.sql.Timestamp;
import java.time.LocalDate;

public class Compra {

    @JsonProperty("id_compra")
    private int idCompra;

    @JsonProperty("id_proveedor")
    private int idProveedor;

    @JsonProperty("tipo_comprobante")
    private String tipoComprobante;

    @JsonProperty("serie")
    private String serie;

    @JsonProperty("correlativo")
    private String correlativo;

    @JsonProperty("fecha_emision")
    private LocalDate fechaEmision;

    @JsonProperty("fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @JsonProperty("tipo_pago")
    private String tipoPago;

    @JsonProperty("forma_pago")
    private String formaPago;

    @JsonProperty("moneda")
    private String moneda;

    @JsonProperty("tipo_cambio")
    private double tipoCambio;

    @JsonProperty("incluye_igv")
    private boolean incluyeIgv;

    @JsonProperty("hay_bonificacion")
    private boolean hayBonificacion;

    @JsonProperty("hay_descuento")
    private boolean hayDescuento;

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
    private String observation;

    @JsonProperty("fecha_registro")
    private Timestamp fechaRegistro;

    public Compra(int idCompra, int idProveedor, String tipoComprobante, String serie, String correlativo,
                  LocalDate fechaEmision, LocalDate fechaVencimiento, String tipoPago, String formaPago,
                  String moneda, double tipoCambio, boolean incluyeIgv, boolean hayBonificacion, boolean hayDescuento,
                  boolean hayTraslado, double subtotal, double igv, double total, double totalPeso,
                  double costeTransporte, String observacion, Timestamp fechaRegistro) {
        this.idCompra = idCompra;
        this.idProveedor = idProveedor;
        this.tipoComprobante = tipoComprobante;
        this.serie = serie;
        this.correlativo = correlativo;
        this.fechaEmision = fechaEmision;
        this.fechaVencimiento = fechaVencimiento;
        this.tipoPago = tipoPago;
        this.formaPago = formaPago;
        this.moneda = moneda;
        this.tipoCambio = tipoCambio;
        this.incluyeIgv = incluyeIgv;
        this.hayBonificacion = hayBonificacion;
        this.hayDescuento = hayDescuento;
        this.hayTraslado = hayTraslado;
        this.subtotal = subtotal;
        this.igv = igv;
        this.total = total;
        this.totalPeso = totalPeso;
        this.costeTransporte = costeTransporte;
        this.observation = observacion;
        this.fechaRegistro = fechaRegistro;
    }

    public Compra() {
    }

    public int getIdCompra() {
        return idCompra;
    }

    public void setIdCompra(int idCompra) {
        this.idCompra = idCompra;
    }

    public int getIdProveedor() {
        return idProveedor;
    }

    public void setIdProveedor(int idProveedor) {
        this.idProveedor = idProveedor;
    }

    public String getTipoComprobante() {
        return tipoComprobante;
    }

    public void setTipoComprobante(String tipoComprobante) {
        this.tipoComprobante = tipoComprobante;
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

    public String getTipoPago() {
        return tipoPago;
    }

    public void setTipoPago(String tipoPago) {
        this.tipoPago = tipoPago;
    }

    public String getFormaPago() {
        return formaPago;
    }

    public void setFormaPago(String formaPago) {
        this.formaPago = formaPago;
    }

    public String getMoneda() {
        return moneda;
    }

    public void setMoneda(String moneda) {
        this.moneda = moneda;
    }

    public double getTipoCambio() {
        return tipoCambio;
    }

    public void setTipoCambio(double tipoCambio) {
        this.tipoCambio = tipoCambio;
    }

    public boolean isIncluyeIgv() {
        return incluyeIgv;
    }

    public void setIncluyeIgv(boolean incluyeIgv) {
        this.incluyeIgv = incluyeIgv;
    }

    public boolean isHayBonificacion() {
        return hayBonificacion;
    }

    public void setHayBonificacion(boolean hayBonificacion) {
        this.hayBonificacion = hayBonificacion;
    }

    public boolean isHayDescuento() {
        return hayDescuento;
    }

    public void setHayDescuento(boolean hayDescuento) {
        this.hayDescuento = hayDescuento;
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

    public String getObservation() {
        return observation;
    }

    public void setObservation(String observation) {
        this.observation = observation;
    }

    public Timestamp getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(Timestamp fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    @Override
    public String toString() {
        return "Compra{" +
                "idCompra=" + idCompra +
                ", idProveedor=" + idProveedor +
                ", tipoComprobante=" + tipoComprobante +
                ", serie='" + serie + '\'' +
                ", correlativo='" + correlativo + '\'' +
                ", fechaEmision=" + fechaEmision +
                ", fechaVencimiento=" + fechaVencimiento +
                ", tipoPago='" + tipoPago + '\'' +
                ", formaPago='" + formaPago + '\'' +
                ", moneda=" + moneda +
                ", tipoCambio=" + tipoCambio +
                ", incluyeIgv=" + incluyeIgv +
                ", hayBonificacion=" + hayBonificacion +
                ", hayDescuento=" + hayDescuento +
                ", hayTraslado=" + hayTraslado +
                ", subtotal=" + subtotal +
                ", igv=" + igv +
                ", total=" + total +
                ", totalPeso=" + totalPeso +
                ", costeTransporte=" + costeTransporte +
                ", observacion='" + observation + '\'' +
                ", fechaRegistro=" + fechaRegistro +
                '}';
    }
}
