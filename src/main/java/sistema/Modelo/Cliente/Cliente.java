package sistema.Modelo.Cliente;

public class Cliente {

    public enum TipoDocumento {DNI,RUC,SD};
    private int id;
    private String razonSocial;
    private String direccion;
    private String telefono;
    private String correo;
    private String n_Documento;
    private TipoDocumento tipoDocumento;

    public Cliente(int id, String n_Documento, String razonSocial, String direccion,
                   String correo, String telefono) {
        this.id = id;
        this.n_Documento = n_Documento;
        this.razonSocial = razonSocial;
        this.direccion = direccion;
        this.correo = correo;
        this.telefono = telefono;
    }


    public TipoDocumento getTipoDocumento() {
        return tipoDocumento;
    }

    public void setTipoDocumento(TipoDocumento tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }

    public Cliente() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getRazonSocial() {
        return razonSocial;
    }

    public void setRazonSocial(String razonSocial) {
        this.razonSocial = razonSocial;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getN_Documento() {
        return n_Documento;
    }

    public void setN_Documento(String n_Documento) {
        this.n_Documento = n_Documento;
    }

    @Override
    public String toString() {
        return "Cliente{" +
                "id=" + id +
                ", razonSocial='" + razonSocial + '\'' +
                ", direccion='" + direccion + '\'' +
                ", telefono='" + telefono + '\'' +
                ", correo='" + correo + '\'' +
                ", n_Documento='" + n_Documento + '\'' +
                '}';
    }
}
