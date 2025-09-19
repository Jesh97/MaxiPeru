package sistema.Modelo.Compra;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class DetalleCaja {

    private int idDetalleCajaCompra; // PK
    private int idCajaCompra;        // FK hacia CajaCompra
    private int idArticulo;          // FK hacia Artículo
    private BigDecimal cantidad;

    public DetalleCaja(int idDetalleCajaCompra, int idCajaCompra, int idArticulo, BigDecimal cantidad) {
        this.idDetalleCajaCompra = idDetalleCajaCompra;
        this.idCajaCompra = idCajaCompra;
        this.idArticulo = idArticulo;
        this.cantidad = cantidad;
    }

    public DetalleCaja() {
    }

    public int getIdDetalleCajaCompra() {
        return idDetalleCajaCompra;
    }

    public void setIdDetalleCajaCompra(int idDetalleCajaCompra) {
        this.idDetalleCajaCompra = idDetalleCajaCompra;
    }

    public int getIdCajaCompra() {
        return idCajaCompra;
    }

    public void setIdCajaCompra(int idCajaCompra) {
        this.idCajaCompra = idCajaCompra;
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

    @Override
    public String toString() {
        return "DetalleCaja{" +
                "idDetalleCajaCompra=" + idDetalleCajaCompra +
                ", idCajaCompra=" + idCajaCompra +
                ", idArticulo=" + idArticulo +
                ", cantidad=" + cantidad +
                '}';
    }
}
