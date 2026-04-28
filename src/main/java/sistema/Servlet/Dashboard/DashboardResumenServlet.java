package sistema.Servlet.Dashboard;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import sistema.Controller.Dashboard.DashboardResumenController;
import sistema.Modelo.Usuario.Usuario;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

@WebServlet("/dashboardResumen")
public class DashboardResumenServlet extends HttpServlet {

    private final DashboardResumenController controller = new DashboardResumenController();
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuario") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().print("{\"error\":\"No autorizado\"}");
            return;
        }
        Object u = session.getAttribute("usuario");
        if (!(u instanceof Usuario)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().print("{\"error\":\"No autorizado\"}");
            return;
        }

        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        Map<String, Object> data = controller.construirResumen();
        mapper.writeValue(out, data);
        out.flush();
    }
}
