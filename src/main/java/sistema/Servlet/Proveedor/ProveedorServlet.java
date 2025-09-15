package sistema.Servlet.Proveedor;

import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import sistema.Controller.ProveedorController;
import sistema.Ejecucion.Auditoria;
import sistema.Modelo.Proveedor;
import sistema.repository.ProveedorRepository;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/proveedores")
public class ProveedorServlet extends HttpServlet {

    private ProveedorRepository proveedorDAO = new ProveedorController();
    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();

        String idParam = req.getParameter("id");
        String buscar = req.getParameter("buscar");

        if (idParam != null) {
            int id = Integer.parseInt(idParam);
            Proveedor proveedor = proveedorDAO.obtenerPorId(id);
            out.print(gson.toJson(proveedor));
        } else if (buscar != null) {
            List<Proveedor> lista = proveedorDAO.buscar(buscar);
            out.print(gson.toJson(lista));
        } else {
            List<Proveedor> lista = proveedorDAO.listarTodos();
            out.print(gson.toJson(lista));
        }
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Proveedor proveedor = gson.fromJson(req.getReader(), Proveedor.class);
        proveedorDAO.insertar(proveedor);
        Auditoria.registrar(req, "Registro", "Se registró proveedor: " + proveedor.getRazonSocial());
        resp.getWriter().write("{\"status\":\"ok\"}");
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Proveedor proveedor = gson.fromJson(req.getReader(), Proveedor.class);
        proveedorDAO.actualizar(proveedor);
        Auditoria.registrar(req, "Actualización", "Se actualizó proveedor: " + proveedor.getRazonSocial());
        resp.getWriter().write("{\"status\":\"ok\"}");
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int id = Integer.parseInt(req.getParameter("id"));
        proveedorDAO.eliminar(id);
        Auditoria.registrar(req, "Eliminación", "Se eliminó proveedor con ID: " + id);
        resp.getWriter().write("{\"status\":\"ok\"}");
    }
}
