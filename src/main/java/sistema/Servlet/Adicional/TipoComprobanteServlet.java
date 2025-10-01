package sistema.Servlet.Adicional;

import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import sistema.Controller.Compra.AdicionalController;
import sistema.Modelo.Compra.TipoComprobante;

import java.io.*;
import java.util.List;

@WebServlet("/guardarTipoComprobante")
public class TipoComprobanteServlet extends HttpServlet {

    private AdicionalController controller = new AdicionalController();
    private Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        TipoComprobante comprobante = gson.fromJson(request.getReader(), TipoComprobante.class);
        try {
            controller.guardar(comprobante);
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("Comprobante guardado correctamente");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error: " + e.getMessage());
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            List<TipoComprobante> lista = controller.listarTipoComprobante(); // 🔹 CORREGIDO
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
        TipoComprobante comprobante = gson.fromJson(request.getReader(), TipoComprobante.class);
        try {
            controller.actualizar(comprobante);
            response.getWriter().write("Comprobante actualizado");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error: " + e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int id = Integer.parseInt(request.getParameter("id"));
        try {
            controller.eliminarTipoComprobante(id); // 🔹 CORREGIDO
            response.getWriter().write("Comprobante eliminado");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error: " + e.getMessage());
        }
    }
}
