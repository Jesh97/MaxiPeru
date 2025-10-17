package sistema.Modelo.Compra;

import java.math.BigDecimal;

public class ReglaAplicada {

    private int idReglaAplicada;
    private int idCompra;
    private boolean aplicaCostoAdicional;
    private BigDecimal montoMinimo;
    private BigDecimal costoAdicional;

    public ReglaAplicada(int idReglaAplicada, int idCompra, boolean aplicaCostoAdicional, BigDecimal montoMinimo,
                         BigDecimal costoAdicional) {
        this.idReglaAplicada = idReglaAplicada;
        this.idCompra = idCompra;
        this.aplicaCostoAdicional = aplicaCostoAdicional;
        this.montoMinimo = montoMinimo;
        this.costoAdicional = costoAdicional;
    }

    public ReglaAplicada() {
    }

    public int getIdReglaAplicada() {
        return idReglaAplicada;
    }

    public void setIdReglaAplicada(int idReglaAplicada) {
        this.idReglaAplicada = idReglaAplicada;
    }

    public int getIdCompra() {
        return idCompra;
    }

    public void setIdCompra(int idCompra) {
        this.idCompra = idCompra;
    }

    public boolean isAplicaCostoAdicional() {
        return aplicaCostoAdicional;
    }

    public void setAplicaCostoAdicional(boolean aplicaCostoAdicional) {
        this.aplicaCostoAdicional = aplicaCostoAdicional;
    }

    public BigDecimal getMontoMinimo() {
        return montoMinimo;
    }

    public void setMontoMinimo(BigDecimal montoMinimo) {
        this.montoMinimo = montoMinimo;
    }

    public BigDecimal getCostoAdicional() {
        return costoAdicional;
    }

    public void setCostoAdicional(BigDecimal costoAdicional) {
        this.costoAdicional = costoAdicional;
    }

    @Override
    public String toString() {
        return "ReglaAplicada{" +
                "idReglaAplicada=" + idReglaAplicada +
                ", idCompra=" + idCompra +
                ", aplicaCostoAdicional=" + aplicaCostoAdicional +
                ", montoMinimo=" + montoMinimo +
                ", costoAdicional=" + costoAdicional +
                '}';
    }
}