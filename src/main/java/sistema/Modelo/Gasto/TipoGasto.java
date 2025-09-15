package sistema.Modelo.Gasto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TipoGasto {

    @JsonProperty("id_tipo_gasto")
    private int idTipoGasto;

    @JsonProperty("nombre")
    private String nombre;

    public TipoGasto(int idTipoGasto, String nombre) {
        this.idTipoGasto = idTipoGasto;
        this.nombre = nombre;
    }

    public TipoGasto() {
    }

    public int getIdTipoGasto() {
        return idTipoGasto;
    }

    public void setIdTipoGasto(int idTipoGasto) {
        this.idTipoGasto = idTipoGasto;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public String toString() {
        return "TipoGasto{" +
                "idTipoGasto=" + idTipoGasto +
                ", nombre='" + nombre + '\'' +
                '}';
    }
}
