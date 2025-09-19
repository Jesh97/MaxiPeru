package sistema.Modelo.Compra;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class Compra {

    private int idCompra;
    private int idProveedor;
    private String tipoComprobante;
    private String serie;
    private String correlativo;
    private LocalDate fechaEmision;
    private LocalDate fechaVencimiento;
    private String tipoPago;
    private String formaPago;
    private String moneda;
    private double tipoCambio;
    private boolean incluyeIgv;
    private boolean hayBonificacion;
    private boolean hayDescuento;
    private boolean hayTraslado;
    private String observation;
    private double subtotal;
    private double igv;
    private double total;
    private double totalPeso;
    private double costeTransporte;

    public Compra(int idCompra, int idProveedor, String tipoComprobante, String serie, String correlativo,
                  LocalDate fechaEmision, LocalDate fechaVencimiento, String tipoPago, String formaPago,
                  String moneda, double tipoCambio, boolean incluyeIgv, boolean hayBonificacion,
                  boolean hayDescuento, boolean hayTraslado, String observation, double subtotal, double igv,
                  double total, double totalPeso, double costeTransporte) {
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
        this.observation = observation;
        this.subtotal = subtotal;
        this.igv = igv;
        this.total = total;
        this.totalPeso = totalPeso;
        this.costeTransporte = costeTransporte;
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

    public String getObservation() {
        return observation;
    }

    public void setObservation(String observation) {
        this.observation = observation;
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

    @Override
    public String toString() {
        return "Compra{" +
                "idCompra=" + idCompra +
                ", idProveedor=" + idProveedor +
                ", tipoComprobante='" + tipoComprobante + '\'' +
                ", serie='" + serie + '\'' +
                ", correlativo='" + correlativo + '\'' +
                ", fechaEmision=" + fechaEmision +
                ", fechaVencimiento=" + fechaVencimiento +
                ", tipoPago='" + tipoPago + '\'' +
                ", formaPago='" + formaPago + '\'' +
                ", moneda='" + moneda + '\'' +
                ", tipoCambio=" + tipoCambio +
                ", incluyeIgv=" + incluyeIgv +
                ", hayBonificacion=" + hayBonificacion +
                ", hayDescuento=" + hayDescuento +
                ", hayTraslado=" + hayTraslado +
                ", observation='" + observation + '\'' +
                ", subtotal=" + subtotal +
                ", igv=" + igv +
                ", total=" + total +
                ", totalPeso=" + totalPeso +
                ", costeTransporte=" + costeTransporte +
                '}';
    }
}
