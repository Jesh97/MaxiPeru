package sistema.Servlet.Compra;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sistema.Controller.Compra.CompraController;
import sistema.repository.CompraRepository;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet("/listarCompra")
public class ListarCompra extends HttpServlet {

    private final CompraRepository compraDAO = new CompraController();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            // Llama al Controller, que ya devuelve las fechas como Strings en formato dd-MM-yyyy
            List<Map<String, Object>> compras = compraDAO.listarComprasConDetalles();

            // El ObjectMapper serializa la lista de Maps. No necesita configuración de fecha
            // porque los valores de fecha ya son Strings.
            ObjectMapper mapper = new ObjectMapper();

            String json = mapper.writeValueAsString(compras);
            response.getWriter().write(json);
        } catch (Exception e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error al listar compras");
        }
    }
}
