package sistema.Servlet.Venta;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sistema.Controller.Venta.VentaController;
import sistema.Ejecucion.Auditoria;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet("/ListarVentas")
public class ListarVentas extends HttpServlet {

    private final VentaController ventaDAO = new VentaController();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            List<Map<String, Object>> ventas = ventaDAO.listarVentasConDetalles();
            ObjectMapper mapper = new ObjectMapper();

            String descripcion = "Listado de Ventas realizado. Cantidad de registros: " + ventas.size();
            Auditoria.registrar(request, "LECTURA", descripcion);

            String json = mapper.writeValueAsString(ventas);
            response.getWriter().write(json);
        } catch (Exception e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error al listar ventas: " + e.getMessage());
        }
    }
}