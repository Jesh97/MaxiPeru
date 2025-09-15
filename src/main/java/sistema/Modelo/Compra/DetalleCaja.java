package sistema.Modelo.Compra;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DetalleCaja {

    @JsonProperty("id_detalle_caja")
    private int idDetalleCaja;

    @JsonProperty("id_caja_compra")
    private int idCajaCompra;

    @JsonProperty("id_articulo")
    private int idArticulo;

    @JsonProperty("cantidad")
    private int cantidad;

    public DetalleCaja(int idDetalleCaja, int idCajaCompra, int idArticulo, int cantidad) {
        this.idDetalleCaja = idDetalleCaja;
        this.idCajaCompra = idCajaCompra;
        this.idArticulo = idArticulo;
        this.cantidad = cantidad;
    }

    public DetalleCaja() {
    }

    public int getIdDetalleCaja() {
        return idDetalleCaja;
    }

    public void setIdDetalleCaja(int idDetalleCaja) {
        this.idDetalleCaja = idDetalleCaja;
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

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    @Override
    public String toString() {
        return "DetalleCaja{" +
                "idDetalleCaja=" + idDetalleCaja +
                ", idCajaCompra=" + idCajaCompra +
                ", idArticulo=" + idArticulo +
                ", cantidad=" + cantidad +
                '}';
    }
}
