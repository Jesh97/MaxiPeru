package sistema.Modelo.Compra;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Lote {

    private int idLote;
    private int idArticulo;
    private String codigoLote;
    private LocalDate fechaVencimiento;
    private BigDecimal cantidadLote;

    public Lote(int idLote, int idArticulo, String codigoLote, LocalDate fechaVencimiento, BigDecimal cantidadLote) {
        this.idLote = idLote;
        this.idArticulo = idArticulo;
        this.codigoLote = codigoLote;
        this.fechaVencimiento = fechaVencimiento;
        this.cantidadLote = cantidadLote;
    }

    public Lote() {
    }

    public int getIdLote() {
        return idLote;
    }

    public void setIdLote(int idLote) {
        this.idLote = idLote;
    }

    public int getIdArticulo() {
        return idArticulo;
    }

    public void setIdArticulo(int idArticulo) {
        this.idArticulo = idArticulo;
    }

    public String getCodigoLote() {
        return codigoLote;
    }

    public void setCodigoLote(String codigoLote) {
        this.codigoLote = codigoLote;
    }

    public LocalDate getFechaVencimiento() {
        return fechaVencimiento;
    }

    public void setFechaVencimiento(LocalDate fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }

    public BigDecimal getCantidadLote() {
        return cantidadLote;
    }

    public void setCantidadLote(BigDecimal cantidadLote) {
        this.cantidadLote = cantidadLote;
    }

    @Override
    public String toString() {
        return "Lote{" +
                "idLote=" + idLote +
                ", idArticulo=" + idArticulo +
                ", codigoLote='" + codigoLote + '\'' +
                ", fechaVencimiento=" + fechaVencimiento +
                ", cantidadLote=" + cantidadLote +
                '}';
    }
}
