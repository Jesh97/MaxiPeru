package sistema.Servlet.Cliente;

import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import sistema.Controller.ClienteController;
import sistema.Ejecucion.Auditoria;
import sistema.Modelo.Cliente.Cliente;
import sistema.repository.ClienteRepository;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/clientes")
public class ClienteServlet extends HttpServlet {

    private ClienteRepository clienteDAO = new ClienteController();
    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();

        String idParam = req.getParameter("id");
        String buscar = req.getParameter("buscar");

        if (idParam != null) {
            int id = Integer.parseInt(idParam);
            Cliente cliente = clienteDAO.obtenerPorId(id);
            out.print(gson.toJson(cliente));
        } else if (buscar != null) {
            List<Cliente> lista = clienteDAO.buscar(buscar);
            out.print(gson.toJson(lista));
        } else {
            List<Cliente> lista = clienteDAO.listarTodos();
            out.print(gson.toJson(lista));
        }
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Cliente cliente = gson.fromJson(req.getReader(), Cliente.class);
        clienteDAO.insertar(cliente);
        Auditoria.registrar(req, "Registro", "Se registró cliente: " + cliente.getRazonSocial());
        resp.getWriter().write("{\"status\":\"ok\"}");
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Cliente cliente = gson.fromJson(req.getReader(), Cliente.class);
        clienteDAO.actualizar(cliente);
        Auditoria.registrar(req, "Actualización", "Se actualizó cliente: " + cliente.getRazonSocial());
        resp.getWriter().write("{\"status\":\"ok\"}");
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int id = Integer.parseInt(req.getParameter("id"));
        clienteDAO.eliminar(id);
        Auditoria.registrar(req, "Eliminación", "Se eliminó cliente con ID: " + id);
        resp.getWriter().write("{\"status\":\"ok\"}");
    }
}