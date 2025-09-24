package sistema.Servlet.Adicional;

import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import sistema.Controller.AdicionalController;
import sistema.Modelo.Compra.FormaPago;
import java.io.*;
import java.util.List;

@WebServlet("/guardarFormaPago")
public class FormaPagoServlet extends HttpServlet {

    private AdicionalController controller = new AdicionalController();
    private Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        FormaPago forma = gson.fromJson(request.getReader(), FormaPago.class);
        try {
            controller.guardar(forma);
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("Forma de pago guardada correctamente");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error: " + e.getMessage());
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            List<FormaPago> lista = controller.listarFormaPago();
            String json = gson.toJson(lista);
            response.setContentType("application/json");
            response.getWriter().write(json);
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        FormaPago forma = gson.fromJson(request.getReader(), FormaPago.class);
        try {
            controller.actualizar(forma);
            response.getWriter().write("Forma de pago actualizada");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error: " + e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int id = Integer.parseInt(request.getParameter("id"));
        try {
            controller.eliminarFormaPago(id);
            response.getWriter().write("Forma de pago eliminada");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error: " + e.getMessage());
        }
    }
}
