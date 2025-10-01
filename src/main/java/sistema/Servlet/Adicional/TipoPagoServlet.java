package sistema.Servlet.Adicional;

import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import sistema.Controller.Compra.AdicionalController;
import sistema.Modelo.Compra.TipoPago;
import java.io.*;
import java.util.List;

@WebServlet("/guardarTipoPago")
public class TipoPagoServlet extends HttpServlet {

    private AdicionalController controller = new AdicionalController();
    private Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        TipoPago tipo = gson.fromJson(request.getReader(), TipoPago.class);
        try {
            controller.guardar(tipo);
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("Tipo de pago guardado correctamente");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error: " + e.getMessage());
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            List<TipoPago> lista = controller.listarTipoPago();
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
        TipoPago tipo = gson.fromJson(request.getReader(), TipoPago.class);
        try {
            controller.actualizar(tipo);
            response.getWriter().write("Tipo de pago actualizado");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error: " + e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int id = Integer.parseInt(request.getParameter("id"));
        try {
            controller.eliminarTipoPago(id);
            response.getWriter().write("Tipo de pago eliminado");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error: " + e.getMessage());
        }
    }
}
