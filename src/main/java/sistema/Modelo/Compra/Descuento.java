package sistema.Modelo.Compra;

public class Descuento {
    private int idDescuento;
    private int idCompra;
    private int idDetalle;     // se usa cuando el descuento es por ítem
    private String nivel;      // "global" o "item"
    private String tipo;       // tipo de descuento
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
                ", nivel='" + nivel + '\'' +
                ", tipo='" + tipo + '\'' +
                ", valor=" + valor +
                '}';
    }
}