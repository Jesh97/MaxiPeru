package sistema.Ejecucion;

import sistema.Servlet.Adicional.FormaPagoServlet;
import sistema.Servlet.Adicional.TipoComprobanteServlet;
import sistema.Servlet.Adicional.TipoPagoServlet;
import sistema.Servlet.Cliente.ClienteServlet;
import sistema.Servlet.Compra.CompraServlet;
import sistema.Servlet.Compra.ListarCompra;
import sistema.Servlet.Login.CerrarSesion;
import sistema.Servlet.Login.LoginServlet;
import sistema.Servlet.Producto.CatalogoServlet;
import sistema.Servlet.Producto.ProductoServlet;
import sistema.Servlet.Proveedor.BuscarProveedorServlet;
import sistema.Servlet.Proveedor.ProveedorServlet;
import sistema.Servlet.Usuario.DeshabilitarUsuario;
import sistema.Servlet.Usuario.ListarActividades;
import sistema.Servlet.Usuario.ListarUsuario;
import sistema.Servlet.Usuario.RegistrarUsuario;
import sistema.Servlet.Login.verificarSesion;
import sistema.utils.JettyUTP;
import java.net.URL;

public class App {

    public static void main(String[] args) throws Exception {
        String path = "src\\main\\resources\\";

        JettyUTP webserver = new JettyUTP(8082, path);
        webserver.addServlet(LoginServlet.class,"/login");
        webserver.addServlet(RegistrarUsuario.class,"/registrarUsuario");
        webserver.addServlet(verificarSesion.class,"/verificarSesion");
        webserver.addServlet(CerrarSesion.class,"/cerrarSesion");
        webserver.addServlet(ListarUsuario.class,"/listarUsuario");
        webserver.addServlet(ListarActividades.class,"/ListarActividad");
        webserver.addServlet(DeshabilitarUsuario.class,"/usuario/deshabilitar");
        webserver.addServlet(ClienteServlet.class,"/clientes");
        webserver.addServlet(ProveedorServlet.class,"/proveedores");
        webserver.addServlet(CompraServlet.class,"/CompraServlet");
        webserver.addServlet(BuscarProveedorServlet.class,"/buscarProveedor");
        webserver.addServlet(ListarCompra.class,"/listarCompra");
        webserver.addServlet(TipoComprobanteServlet.class,"/guardarTipoComprobante");
        webserver.addServlet(FormaPagoServlet.class,"/guardarFormaPago");
        webserver.addServlet(TipoPagoServlet.class,"/guardarTipoPago");
        webserver.addServlet(ProductoServlet.class,"/productos");
        webserver.addServlet(CatalogoServlet.class,"/CatalogoServlet");

        URL myURL = new URL("http://localhost:8082");
        System.out.println("*********************************************************");
        System.out.println("CLICK AQUI PARA ABRIR LA APLICACION:" + myURL);
        System.out.println("*********************************************************");
        webserver.start();
    }
}

