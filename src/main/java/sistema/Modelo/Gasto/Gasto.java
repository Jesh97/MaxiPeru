package sistema.Modelo.Gasto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class Gasto {

    @JsonProperty("id_gasto")
    private int idGasto;

    @JsonProperty("id_proveedor")
    private int idProveedor;

    @JsonProperty("id_tipo_gasto")
    private int idTipoGasto;

    @JsonProperty("motivo")
    private String motivo;

    @JsonProperty("placa")
    private String placa;

    @JsonProperty("id_tipo_comprobante")
    private int idTipoComprobante;

    @JsonProperty("serie_comprobante")
    private String serieComprobante;

    @JsonProperty("correlativo_comprobante")
    private String correlativoComprobante;

    @JsonProperty("fecha")
    private LocalDate fecha;

    @JsonProperty("id_moneda")
    private int idMoneda;

    @JsonProperty("subtotal")
    private double subtotal;

    @JsonProperty("igv")
    private double igv;

    @JsonProperty("total")
    private double total;

    @JsonProperty("observacion")
    private String observacion;

    @JsonProperty("total_peso")
    private double totalPeso;

    @JsonProperty("fecha_registro")
    private LocalDateTime fechaRegistro;

    public Gasto(int idGasto, int idProveedor, int idTipoGasto, String motivo, String placa, int idTipoComprobante,
                 String serieComprobante, String correlativoComprobante, LocalDate fecha, int idMoneda, double subtotal,
                 double igv, double total, String observacion, double totalPeso, LocalDateTime fechaRegistro) {
        this.idGasto = idGasto;
        this.idProveedor = idProveedor;
        this.idTipoGasto = idTipoGasto;
        this.motivo = motivo;
        this.placa = placa;
        this.idTipoComprobante = idTipoComprobante;
        this.serieComprobante = serieComprobante;
        this.correlativoComprobante = correlativoComprobante;
        this.fecha = fecha;
        this.idMoneda = idMoneda;
        this.subtotal = subtotal;
        this.igv = igv;
        this.total = total;
        this.observacion = observacion;
        this.totalPeso = totalPeso;
        this.fechaRegistro = fechaRegistro;
    }

    public Gasto() {
    }

    public int getIdGasto() {
        return idGasto;
    }

    public void setIdGasto(int idGasto) {
        this.idGasto = idGasto;
    }

    public int getIdProveedor() {
        return idProveedor;
    }

    public void setIdProveedor(int idProveedor) {
        this.idProveedor = idProveedor;
    }

    public int getIdTipoGasto() {
        return idTipoGasto;
    }

    public void setIdTipoGasto(int idTipoGasto) {
        this.idTipoGasto = idTipoGasto;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public int getIdTipoComprobante() {
        return idTipoComprobante;
    }

    public void setIdTipoComprobante(int idTipoComprobante) {
        this.idTipoComprobante = idTipoComprobante;
    }

    public String getSerieComprobante() {
        return serieComprobante;
    }

    public void setSerieComprobante(String serieComprobante) {
        this.serieComprobante = serieComprobante;
    }

    public String getCorrelativoComprobante() {
        return correlativoComprobante;
    }

    public void setCorrelativoComprobante(String correlativoComprobante) {
        this.correlativoComprobante = correlativoComprobante;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public int getIdMoneda() {
        return idMoneda;
    }

    public void setIdMoneda(int idMoneda) {
        this.idMoneda = idMoneda;
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

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }

    public double getTotalPeso() {
        return totalPeso;
    }

    public void setTotalPeso(double totalPeso) {
        this.totalPeso = totalPeso;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    @Override
    public String toString() {
        return "Gasto{" +
                "idGasto=" + idGasto +
                ", idProveedor=" + idProveedor +
                ", idTipoGasto=" + idTipoGasto +
                ", motivo='" + motivo + '\'' +
                ", placa='" + placa + '\'' +
                ", idTipoComprobante=" + idTipoComprobante +
                ", serieComprobante='" + serieComprobante + '\'' +
                ", correlativoComprobante='" + correlativoComprobante + '\'' +
                ", fecha=" + fecha +
                ", idMoneda=" + idMoneda +
                ", subtotal=" + subtotal +
                ", igv=" + igv +
                ", total=" + total +
                ", observacion='" + observacion + '\'' +
                ", totalPeso=" + totalPeso +
                ", fechaRegistro=" + fechaRegistro +
                '}';
    }
}
