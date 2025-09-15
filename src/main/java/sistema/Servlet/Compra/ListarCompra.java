package sistema.Servlet.Compra;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sistema.Controller.CompraController;
import sistema.repository.CompraRepository;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet("/listarCompra")
public class ListarCompra extends HttpServlet {

    private final CompraRepository compraDAO = new CompraController();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            List<Map<String, Object>> compras = compraDAO.listarComprasConDetalles();
            ObjectMapper mapper = new ObjectMapper();
            String json = mapper.writeValueAsString(compras);
            response.getWriter().write(json);
        } catch (Exception e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error al listar compras");
        }
    }
}
