package sistema.Modelo.Compra;

import java.math.BigDecimal;

public class Descuento {
    private int idDescuento;
    private int idCompra;
    private int idDetalle;
    private String nivel;

    // Campos nuevos y modificados
    private String motivo; // Nuevo campo
    private String tipoValor; // Renombrado de tipo (ej: monto, porcentaje)
    private BigDecimal valor; // BigDecimal
    private BigDecimal tasaIgv; // Nuevo campo

    public Descuento(int idDescuento, int idCompra, int idDetalle, String nivel, String motivo,
                     String tipoValor, BigDecimal valor, BigDecimal tasaIgv) {
        this.idDescuento = idDescuento;
        this.idCompra = idCompra;
        this.idDetalle = idDetalle;
        this.nivel = nivel;
        this.motivo = motivo;
        this.tipoValor = tipoValor;
        this.valor = valor;
        this.tasaIgv = tasaIgv;
    }

    public Descuento() {
    }

    public int getIdDescuento() {
        return idDescuento;
    }

    public void setIdDescuento(int idDescuento) {
        this.idDescuento = idDescuento;
    }

    public int getIdCompra() {
        return idCompra;
    }

    public void setIdCompra(int idCompra) {
        this.idCompra = idCompra;
    }

    public int getIdDetalle() {
        return idDetalle;
    }

    public void setIdDetalle(int idDetalle) {
        this.idDetalle = idDetalle;
    }

    public String getNivel() {
        return nivel;
    }

    public void setNivel(String nivel) {
        this.nivel = nivel;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public String getTipoValor() {
        return tipoValor;
    }

    public void setTipoValor(String tipoValor) {
        this.tipoValor = tipoValor;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public BigDecimal getTasaIgv() {
        return tasaIgv;
    }

    public void setTasaIgv(BigDecimal tasaIgv) {
        this.tasaIgv = tasaIgv;
    }

    @Override
    public String toString() {
        return "Descuento{" +
                "idDescuento=" + idDescuento +
                ", idCompra=" + idCompra +
                ", idDetalle=" + idDetalle +
                ", nivel='" + nivel + '\'' +
                ", motivo='" + motivo + '\'' +
                ", tipoValor='" + tipoValor + '\'' +
                ", valor=" + valor +
                ", tasaIgv=" + tasaIgv +
                '}';
    }
}