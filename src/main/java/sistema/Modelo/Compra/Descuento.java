package sistema.Modelo.Compra;

public class Descuento {

    public enum TipoAplicacion {GLOBAL, ITEM}
    public enum TipoValor {PORCENTAJE, SOLES}

    private int idDescuento;
    private Integer idCompra;
    private Integer idDetalleCompra;
    private String motivo;
    private TipoAplicacion tipoAplicacion;
    private TipoValor tipoValor;
    private double valor;
    private Double tasaIGV;

    public Descuento(int idDescuento, Integer idCompra, Integer idDetalleCompra, String motivo,
                     TipoAplicacion tipoAplicacion, TipoValor tipoValor, double valor, Double tasaIGV) {
        this.idDescuento = idDescuento;
        this.idCompra = idCompra;
        this.idDetalleCompra = idDetalleCompra;
        this.motivo = motivo;
        this.tipoAplicacion = tipoAplicacion;
        this.tipoValor = tipoValor;
        this.valor = valor;
        this.tasaIGV = tasaIGV;
    }

    public Descuento() {
    }

    public int getIdDescuento() {
        return idDescuento;
    }

    public void setIdDescuento(int idDescuento) {
        this.idDescuento = idDescuento;
    }

    public Integer getIdCompra() {
        return idCompra;
    }

    public void setIdCompra(Integer idCompra) {
        this.idCompra = idCompra;
    }

    public Integer getIdDetalleCompra() {
        return idDetalleCompra;
    }

    public void setIdDetalleCompra(Integer idDetalleCompra) {
        this.idDetalleCompra = idDetalleCompra;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public TipoAplicacion getTipoAplicacion() {
        return tipoAplicacion;
    }

    public void setTipoAplicacion(TipoAplicacion tipoAplicacion) {
        this.tipoAplicacion = tipoAplicacion;
    }

    public TipoValor getTipoValor() {
        return tipoValor;
    }

    public void setTipoValor(TipoValor tipoValor) {
        this.tipoValor = tipoValor;
    }

    public double getValor() {
        return valor;
    }

    public void setValor(double valor) {
        this.valor = valor;
    }

    public Double getTasaIGV() {
        return tasaIGV;
    }

    public void setTasaIGV(Double tasaIGV) {
        this.tasaIGV = tasaIGV;
    }

    @Override
    public String toString() {
        return "Descuento{" +
                "idDescuento=" + idDescuento +
                ", idCompra=" + idCompra +
                ", idDetalleCompra=" + idDetalleCompra +
                ", motivo='" + motivo + '\'' +
                ", tipoAplicacion=" + tipoAplicacion +
                ", tipoValor=" + tipoValor +
                ", valor=" + valor +
                ", tasaIGV=" + tasaIGV +
                '}';
    }
}