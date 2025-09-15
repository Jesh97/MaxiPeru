package sistema.Modelo.Gasto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

public class DocumentoGasto {
    @JsonProperty("id_documento_gasto")
    private int idDocumentoGasto;

    @JsonProperty("id_gasto")
    private int idGasto;

    @JsonProperty("id_tipo_comprobante")
    private int idTipoComprobante;

    @JsonProperty("serie")
    private String serie;

    @JsonProperty("correlativo")
    private String correlativo;

    @JsonProperty("fecha_emision")
    private LocalDate fechaEmision;

    public DocumentoGasto(int idDocumentoGasto, int idGasto, int idTipoComprobante, String serie,
                          String correlativo, LocalDate fechaEmision) {
        this.idDocumentoGasto = idDocumentoGasto;
        this.idGasto = idGasto;
        this.idTipoComprobante = idTipoComprobante;
        this.serie = serie;
        this.correlativo = correlativo;
        this.fechaEmision = fechaEmision;
    }

    public DocumentoGasto() {
    }

    public int getIdDocumentoGasto() {
        return idDocumentoGasto;
    }

    public void setIdDocumentoGasto(int idDocumentoGasto) {
        this.idDocumentoGasto = idDocumentoGasto;
    }

    public int getIdGasto() {
        return idGasto;
    }

    public void setIdGasto(int idGasto) {
        this.idGasto = idGasto;
    }

    public int getIdTipoComprobante() {
        return idTipoComprobante;
    }

    public void setIdTipoComprobante(int idTipoComprobante) {
        this.idTipoComprobante = idTipoComprobante;
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

    @Override
    public String toString() {
        return "DocumentoGasto{" +
                "idDocumentoGasto=" + idDocumentoGasto +
                ", idGasto=" + idGasto +
                ", idTipoComprobante=" + idTipoComprobante +
                ", serie='" + serie + '\'' +
                ", correlativo='" + correlativo + '\'' +
                ", fechaEmision=" + fechaEmision +
                '}';
    }
}
