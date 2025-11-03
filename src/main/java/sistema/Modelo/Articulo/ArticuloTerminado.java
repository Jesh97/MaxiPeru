package sistema.Modelo.Articulo;

public class ArticuloTerminado {

    private int idArticuloTerminado;
    private String nombreGenerico;
    private String abreviatura;

    public ArticuloTerminado(int idArticuloTerminado, String nombreGenerico, String abreviatura) {
        this.idArticuloTerminado = idArticuloTerminado;
        this.nombreGenerico = nombreGenerico;
        this.abreviatura = abreviatura;
    }

    public ArticuloTerminado() {
    }

    public int getIdArticuloTerminado() {
        return idArticuloTerminado;
    }

    public void setIdArticuloTerminado(int idArticuloTerminado) {
        this.idArticuloTerminado = idArticuloTerminado;
    }

    public String getNombreGenerico() {
        return nombreGenerico;
    }

    public void setNombreGenerico(String nombreGenerico) {
        this.nombreGenerico = nombreGenerico;
    }

    public String getAbreviatura() {
        return abreviatura;
    }

    public void setAbreviatura(String abreviatura) {
        this.abreviatura = abreviatura;
    }

    @Override
    public String toString() {
        return "ArticuloTerminado{" +
                "idArticuloTerminado=" + idArticuloTerminado +
                ", nombreGenerico='" + nombreGenerico + '\'' +
                ", abreviatura='" + abreviatura + '\'' +
                '}';
    }
}
