package sistema.Modelo.Compra;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDate;

public class GuiaTransporte {

    // 1. Campos principales
    private int idGuia;
    private int idCompra;

    // 2. Información del documento de referencia (Guía)
    private String rucGuia;
    private String razonSocialGuia;
    private String tipoComprobante;
    private String serie;
    private String correlativo;
    private String serieGuiaTransporte;
    private String correlativoGuiaTransporte;

    // 3. Información de Traslado
    private String ciudadTraslado;
    private String puntoPartida;
    private String puntoLlegada;
    private BigDecimal costeTotalTransporte; // Modificado a BigDecimal
    private BigDecimal peso; // Modificado a BigDecimal
    private String observaciones;
    private String modalidadTransporte;

    // 4. Información de la Empresa de Transporte
    private String rucEmpresa;
    private String razonSocialEmpresa;

    // 5. Información del Vehículo y Conductor
    private String marcaVehiculo;
    private String dniConductor;
    private String nombreConductor;

    // 6. Fechas
    private LocalDate fechaEmision;
    private LocalDate fechaPedido;
    private LocalDate fechaEntrega;
    private LocalDate fechaTraslado;

    public GuiaTransporte(int idGuia, int idCompra, String rucGuia, String razonSocialGuia, String tipoComprobante,
                          String serie, String correlativo, String serieGuiaTransporte, String correlativoGuiaTransporte,
                          String ciudadTraslado, String puntoPartida, String puntoLlegada, BigDecimal costeTotalTransporte,
                          BigDecimal peso, String observaciones, String modalidadTransporte, String rucEmpresa,
                          String razonSocialEmpresa, String marcaVehiculo, String dniConductor, String nombreConductor,
                          LocalDate fechaEmision, LocalDate fechaPedido, LocalDate fechaEntrega, LocalDate fechaTraslado) {
        this.idGuia = idGuia;
        this.idCompra = idCompra;
        this.rucGuia = rucGuia;
        this.razonSocialGuia = razonSocialGuia;
        this.tipoComprobante = tipoComprobante;
        this.serie = serie;
        this.correlativo = correlativo;
        this.serieGuiaTransporte = serieGuiaTransporte;
        this.correlativoGuiaTransporte = correlativoGuiaTransporte;
        this.ciudadTraslado = ciudadTraslado;
        this.puntoPartida = puntoPartida;
        this.puntoLlegada = puntoLlegada;
        this.costeTotalTransporte = costeTotalTransporte;
        this.peso = peso;
        this.observaciones = observaciones;
        this.modalidadTransporte = modalidadTransporte;
        this.rucEmpresa = rucEmpresa;
        this.razonSocialEmpresa = razonSocialEmpresa;
        this.marcaVehiculo = marcaVehiculo;
        this.dniConductor = dniConductor;
        this.nombreConductor = nombreConductor;
        this.fechaEmision = fechaEmision;
        this.fechaPedido = fechaPedido;
        this.fechaEntrega = fechaEntrega;
        this.fechaTraslado = fechaTraslado;
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

    public String getRazonSocialGuia() {
        return razonSocialGuia;
    }

    public void setRazonSocialGuia(String razonSocialGuia) {
        this.razonSocialGuia = razonSocialGuia;
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

    public String getSerieGuiaTransporte() {
        return serieGuiaTransporte;
    }

    public void setSerieGuiaTransporte(String serieGuiaTransporte) {
        this.serieGuiaTransporte = serieGuiaTransporte;
    }

    public String getCorrelativoGuiaTransporte() {
        return correlativoGuiaTransporte;
    }

    public void setCorrelativoGuiaTransporte(String correlativoGuiaTransporte) {
        this.correlativoGuiaTransporte = correlativoGuiaTransporte;
    }

    public String getCiudadTraslado() {
        return ciudadTraslado;
    }

    public void setCiudadTraslado(String ciudadTraslado) {
        this.ciudadTraslado = ciudadTraslado;
    }

    public String getPuntoPartida() {
        return puntoPartida;
    }

    public void setPuntoPartida(String puntoPartida) {
        this.puntoPartida = puntoPartida;
    }

    public String getPuntoLlegada() {
        return puntoLlegada;
    }

    public void setPuntoLlegada(String puntoLlegada) {
        this.puntoLlegada = puntoLlegada;
    }

    public BigDecimal getCosteTotalTransporte() {
        return costeTotalTransporte;
    }

    public void setCosteTotalTransporte(BigDecimal costeTotalTransporte) {
        this.costeTotalTransporte = costeTotalTransporte;
    }

    public BigDecimal getPeso() {
        return peso;
    }

    public void setPeso(BigDecimal peso) {
        this.peso = peso;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public String getModalidadTransporte() {
        return modalidadTransporte;
    }

    public void setModalidadTransporte(String modalidadTransporte) {
        this.modalidadTransporte = modalidadTransporte;
    }

    public String getRucEmpresa() {
        return rucEmpresa;
    }

    public void setRucEmpresa(String rucEmpresa) {
        this.rucEmpresa = rucEmpresa;
    }

    public String getRazonSocialEmpresa() {
        return razonSocialEmpresa;
    }

    public void setRazonSocialEmpresa(String razonSocialEmpresa) {
        this.razonSocialEmpresa = razonSocialEmpresa;
    }

    public String getMarcaVehiculo() {
        return marcaVehiculo;
    }

    public void setMarcaVehiculo(String marcaVehiculo) {
        this.marcaVehiculo = marcaVehiculo;
    }

    public String getDniConductor() {
        return dniConductor;
    }

    public void setDniConductor(String dniConductor) {
        this.dniConductor = dniConductor;
    }

    public String getNombreConductor() {
        return nombreConductor;
    }

    public void setNombreConductor(String nombreConductor) {
        this.nombreConductor = nombreConductor;
    }

    public LocalDate getFechaEmision() {
        return fechaEmision;
    }

    public void setFechaEmision(LocalDate fechaEmision) {
        this.fechaEmision = fechaEmision;
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

    public LocalDate getFechaTraslado() {
        return fechaTraslado;
    }

    public void setFechaTraslado(LocalDate fechaTraslado) {
        this.fechaTraslado = fechaTraslado;
    }

    @Override
    public String toString() {
        return "GuiaTransporte{" +
                "idGuia=" + idGuia +
                ", idCompra=" + idCompra +
                ", rucGuia='" + rucGuia + '\'' +
                ", razonSocialGuia='" + razonSocialGuia + '\'' +
                ", tipoComprobante='" + tipoComprobante + '\'' +
                ", serie='" + serie + '\'' +
                ", correlativo='" + correlativo + '\'' +
                ", serieGuiaTransporte='" + serieGuiaTransporte + '\'' +
                ", correlativoGuiaTransporte='" + correlativoGuiaTransporte + '\'' +
                ", ciudadTraslado='" + ciudadTraslado + '\'' +
                ", puntoPartida='" + puntoPartida + '\'' +
                ", puntoLlegada='" + puntoLlegada + '\'' +
                ", costeTotalTransporte=" + costeTotalTransporte +
                ", peso=" + peso +
                ", observaciones='" + observaciones + '\'' +
                ", modalidadTransporte='" + modalidadTransporte + '\'' +
                ", rucEmpresa='" + rucEmpresa + '\'' +
                ", razonSocialEmpresa='" + razonSocialEmpresa + '\'' +
                ", marcaVehiculo='" + marcaVehiculo + '\'' +
                ", dniConductor='" + dniConductor + '\'' +
                ", nombreConductor='" + nombreConductor + '\'' +
                ", fechaEmision=" + fechaEmision +
                ", fechaPedido=" + fechaPedido +
                ", fechaEntrega=" + fechaEntrega +
                ", fechaTraslado=" + fechaTraslado +
                '}';
    }
}