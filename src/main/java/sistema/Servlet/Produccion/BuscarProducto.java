package sistema.Servlet.Produccion;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sistema.Controller.ProductoController;
import sistema.Modelo.Producto;
import sistema.repository.ProductoRepository;
import java.io.IOException;
import java.util.List;

@WebServlet("/buscarProducto")
public class BuscarProducto extends HttpServlet {
    private final ProductoRepository productoDAO = new ProductoController();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        response.setContentType("application/json;charset=UTF-8");

        String busqueda = request.getParameter("busqueda");
        if (busqueda == null || busqueda.isBlank()) {
            response.getWriter().write("[]");
            return;
        }

        try {
            List<Producto> lista = productoDAO.buscarProducto(busqueda);

            ObjectMapper mapper = new ObjectMapper();
            String json = mapper.writeValueAsString(lista); // Ahora genera JSON con los nombres correctos
            response.getWriter().write(json);

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("[]");
        }
    }
}