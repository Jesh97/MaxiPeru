package sistema.Modelo;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DocumentoReferencia {

    @JsonProperty("id_referencia")
    private int idReferencia;

    @JsonProperty("id_compra")
    private int idCompra;

    @JsonProperty("numero_cotizacion")
    private String numeroCotizacion;

    @JsonProperty("numero_pedido")
    private String numeroPedido;

    public DocumentoReferencia(int idReferencia, int idCompra, String numeroCotizacion, String numeroPedido) {
        this.idReferencia = idReferencia;
        this.idCompra = idCompra;
        this.numeroCotizacion = numeroCotizacion;
        this.numeroPedido = numeroPedido;
    }

    public DocumentoReferencia() {
    }

    public int getIdReferencia() {
        return idReferencia;
    }

    public void setIdReferencia(int idReferencia) {
        this.idReferencia = idReferencia;
    }

    public int getIdCompra() {
        return idCompra;
    }

    public void setIdCompra(int idCompra) {
        this.idCompra = idCompra;
    }

    public String getNumeroCotizacion() {
        return numeroCotizacion;
    }

    public void setNumeroCotizacion(String numeroCotizacion) {
        this.numeroCotizacion = numeroCotizacion;
    }

    public String getNumeroPedido() {
        return numeroPedido;
    }

    public void setNumeroPedido(String numeroPedido) {
        this.numeroPedido = numeroPedido;
    }

    @Override
    public String toString() {
        return "DocumentoReferencia{" +
                "idReferencia=" + idReferencia +
                ", idCompra=" + idCompra +
                ", numeroCotizacion='" + numeroCotizacion + '\'' +
                ", numeroPedido='" + numeroPedido + '\'' +
                '}';
    }
}
