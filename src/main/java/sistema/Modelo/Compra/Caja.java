package sistema.Modelo.Compra;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class Caja {

    private int idCajaCompra;     // PK
    private int idCompra;         // FK hacia Compra
    private String nombreCaja;    // Nombre identificador de la caja
    private int cantidad;         // Número de cajas
    private BigDecimal costoCaja; // Costo de la caja

    public Caja(int idCajaCompra, int idCompra, String nombreCaja, int cantidad, BigDecimal costoCaja) {
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

    public BigDecimal getCostoCaja() {
        return costoCaja;
    }

    public void setCostoCaja(BigDecimal costoCaja) {
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
