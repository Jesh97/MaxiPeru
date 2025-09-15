package sistema.Modelo.Compra;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Caja {
    @JsonProperty("id_caja_compra")
    private int idCajaCompra;

    @JsonProperty("id_compra")
    private int idCompra;

    @JsonProperty("nombre_caja")
    private String nombreCaja;

    @JsonProperty("cantidad")
    private int cantidad;

    @JsonProperty("costo_caja")
    private double costoCaja;

    public Caja(int idCajaCompra, int idCompra, String nombreCaja, int cantidad, double costoCaja) {
        this.idCajaCompra = idCajaCompra;
        this.idCompra = idCompra;
        this.nombreCaja = nombreCaja;
        this.cantidad = cantidad;
        this.costoCaja = costoCaja;
    }

    public Caja() {
    }

    public int getIdCajaCompra() {
        return idCajaCompra;
    }

    public void setIdCajaCompra(int idCajaCompra) {
        this.idCajaCompra = idCajaCompra;
    }

    public int getIdCompra() {
        return idCompra;
    }

    public void setIdCompra(int idCompra) {
        this.idCompra = idCompra;
    }

    public String getNombreCaja() {
        return nombreCaja;
    }

    public void setNombreCaja(String nombreCaja) {
        this.nombreCaja = nombreCaja;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public double getCostoCaja() {
        return costoCaja;
    }

    public void setCostoCaja(double costoCaja) {
        this.costoCaja = costoCaja;
    }

    @Override
    public String toString() {
        return "Caja{" +
                "idCajaCompra=" + idCajaCompra +
                ", idCompra=" + idCompra +
                ", nombreCaja='" + nombreCaja + '\'' +
                ", cantidad=" + cantidad +
                ", costoCaja=" + costoCaja +
                '}';
    }
}
