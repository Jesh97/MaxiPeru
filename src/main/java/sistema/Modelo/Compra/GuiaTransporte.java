package sistema.Modelo.Compra;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

public class GuiaTransporte {

    @JsonProperty("id_guia")
    private int idGuia;

    @JsonProperty("id_compra")
    private int idCompra;

    @JsonProperty("ruc_guia")
    private String rucGuia;

    @JsonProperty("fecha_emision")
    private LocalDate fechaEmision;

    @JsonProperty("tipo_comprobante")
    private String tipoComprobante;

    @JsonProperty("serie")
    private String serie;

    @JsonProperty("correlativo")
    private String correlativo;

    @JsonProperty("numero_guia")
    private String numeroGuia;

    @JsonProperty("serie_guia")
    private String serieGuia;

    @JsonProperty("correlativo_guia")
    private String correlativoGuia;

    @JsonProperty("ciudad_traslado")
    private String ciudadTraslado;

    @JsonProperty("coste_total_transporte")
    private double costeTotalTransporte;

    @JsonProperty("peso")
    private double peso;

    @JsonProperty("fecha_pedido")
    private LocalDate fechaPedido;

    @JsonProperty("fecha_entrega")
    private LocalDate fechaEntrega;

    public GuiaTransporte(int idGuia, int idCompra, String rucGuia, LocalDate fechaEmision, String tipoComprobante,
                          String serie, String correlativo, String numeroGuia, String serieGuia, String correlativoGuia,
                          String ciudadTraslado, double costeTotalTransporte, double peso, LocalDate fechaPedido,
                          LocalDate fechaEntrega) {
        this.idGuia = idGuia;
        this.idCompra = idCompra;
        this.rucGuia = rucGuia;
        this.fechaEmision = fechaEmision;
        this.tipoComprobante = tipoComprobante;
        this.serie = serie;
        this.correlativo = correlativo;
        this.numeroGuia = numeroGuia;
        this.serieGuia = serieGuia;
        this.correlativoGuia = correlativoGuia;
        this.ciudadTraslado = ciudadTraslado;
        this.costeTotalTransporte = costeTotalTransporte;
        this.peso = peso;
        this.fechaPedido = fechaPedido;
        this.fechaEntrega = fechaEntrega;
    }

    public GuiaTransporte() {
    }

    public int getIdGuia() {
        return idGuia;
    }

    public void setIdGuia(int idGuia) {
        this.idGuia = idGuia;
    }

    public int getIdCompra() {
        return idCompra;
    }

    public void setIdCompra(int idCompra) {
        this.idCompra = idCompra;
    }

    public String getRucGuia() {
        return rucGuia;
    }

    public void setRucGuia(String rucGuia) {
        this.rucGuia = rucGuia;
    }

    public LocalDate getFechaEmision() {
        return fechaEmision;
    }

    public void setFechaEmision(LocalDate fechaEmision) {
        this.fechaEmision = fechaEmision;
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

    public String getNumeroGuia() {
        return numeroGuia;
    }

    public void setNumeroGuia(String numeroGuia) {
        this.numeroGuia = numeroGuia;
    }

    public String getSerieGuia() {
        return serieGuia;
    }

    public void setSerieGuia(String serieGuia) {
        this.serieGuia = serieGuia;
    }

    public String getCorrelativoGuia() {
        return correlativoGuia;
    }

    public void setCorrelativoGuia(String correlativoGuia) {
        this.correlativoGuia = correlativoGuia;
    }

    public String getCiudadTraslado() {
        return ciudadTraslado;
    }

    public void setCiudadTraslado(String ciudadTraslado) {
        this.ciudadTraslado = ciudadTraslado;
    }

    public double getCosteTotalTransporte() {
        return costeTotalTransporte;
    }

    public void setCosteTotalTransporte(double costeTotalTransporte) {
        this.costeTotalTransporte = costeTotalTransporte;
    }

    public double getPeso() {
        return peso;
    }

    public void setPeso(double peso) {
        this.peso = peso;
    }

    public LocalDate getFechaPedido() {
        return fechaPedido;
    }

    public void setFechaPedido(LocalDate fechaPedido) {
        this.fechaPedido = fechaPedido;
    }

    public LocalDate getFechaEntrega() {
        return fechaEntrega;
    }

    public void setFechaEntrega(LocalDate fechaEntrega) {
        this.fechaEntrega = fechaEntrega;
    }

    @Override
    public String toString() {
        return "GuiaTransporte{" +
                "idGuia=" + idGuia +
                ", idCompra=" + idCompra +
                ", rucGuia='" + rucGuia + '\'' +
                ", fechaEmision=" + fechaEmision +
                ", tipoComprobante='" + tipoComprobante + '\'' +
                ", serie='" + serie + '\'' +
                ", correlativo='" + correlativo + '\'' +
                ", numeroGuia='" + numeroGuia + '\'' +
                ", serieGuia='" + serieGuia + '\'' +
                ", correlativoGuia='" + correlativoGuia + '\'' +
                ", ciudadTraslado='" + ciudadTraslado + '\'' +
                ", costeTotalTransporte=" + costeTotalTransporte +
                ", peso=" + peso +
                ", fechaPedido=" + fechaPedido +
                ", fechaEntrega=" + fechaEntrega +
                '}';
    }
}