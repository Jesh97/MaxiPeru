package sistema.Modelo;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Descuento {

    @JsonProperty("id_descuento")
    private int idDescuento;

    @JsonProperty("id_compra")
    private int idCompra; // Puede ser nulo

    @JsonProperty("id_detalle")
    private int idDetalle; // Puede ser nulo

    @JsonProperty("nivel")
    private String nivel;

    @JsonProperty("tipo")
    private String tipo;

    @JsonProperty("valor")
    private double valor;

    public Descuento(int idDescuento, int idCompra, int idDetalle, String nivel, String tipo, double valor) {
        this.idDescuento = idDescuento;
        this.idCompra = idCompra;
        this.idDetalle = idDetalle;
        this.nivel = nivel;
        this.tipo = tipo;
        this.valor = valor;
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

    public void setIdCompra(Integer idCompra) {
        this.idCompra = idCompra;
    }

    public int getIdDetalle() {
        return idDetalle;
    }

    public void setIdDetalle(Integer idDetalle) {
        this.idDetalle = idDetalle;
    }

    public String getNivel() {
        return nivel;
    }

    public void setNivel(String nivel) {
        this.nivel = nivel;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public double getValor() {
        return valor;
    }

    public void setValor(double valor) {
        this.valor = valor;
    }

    @Override
    public String toString() {
        return "Descuento{" +
                "idDescuento=" + idDescuento +
                ", idCompra=" + idCompra +
                ", idDetalle=" + idDetalle +
                ", nivel=" + nivel +
                ", tipo=" + tipo +
                ", valor=" + valor +
                '}';
    }
}