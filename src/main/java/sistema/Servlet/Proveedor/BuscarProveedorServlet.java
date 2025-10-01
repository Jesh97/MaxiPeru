package sistema.Servlet.Proveedor;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sistema.Controller.Compra.ProveedorController;
import sistema.Modelo.Proveedor.Proveedor;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.List;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

@WebServlet("/buscarProveedor")
public class BuscarProveedorServlet extends HttpServlet {

    private ProveedorController proveedorController;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        super.init();
        this.proveedorController = new ProveedorController();
        this.gson = new GsonBuilder().setPrettyPrinting().create();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Establece el tipo de contenido de la respuesta a JSON
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        // Obtener el término de búsqueda de los parámetros de la solicitud
        String busqueda = request.getParameter("busqueda");

        if (busqueda == null || busqueda.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\": \"El parámetro 'busqueda' es requerido.\"}");
            return;
        }

        try {
            List<Proveedor> proveedores = proveedorController.buscarProveedor(busqueda);

            // Convierte la lista de proveedores a una cadena JSON
            String proveedoresJsonString = this.gson.toJson(proveedores);

            // Escribe la respuesta JSON
            out.print(proveedoresJsonString);
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\": \"Error en la base de datos: " + e.getMessage() + "\"}");
            e.printStackTrace();
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\": \"Error inesperado: " + e.getMessage() + "\"}");
            e.printStackTrace();
        } finally {
            out.flush();
        }
    }
}