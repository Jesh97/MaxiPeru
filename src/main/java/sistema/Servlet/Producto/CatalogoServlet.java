package sistema.Servlet.Producto;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sistema.Controller.Producto.CatalogoController;
import sistema.Modelo.Articulo.*;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/CatalogoServlet")
public class CatalogoServlet extends HttpServlet {

    private CatalogoController controller;

    @Override
    public void init() throws ServletException {
        controller = new CatalogoController();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String entidad = request.getParameter("entidad"); // categoria, marca, unidad, tipo
        switch (entidad) {
            case "categoria": enviarJSON(response, controller.listarCategorias()); break;
            case "marca": enviarJSON(response, controller.listarMarcas()); break;
            case "unidad": enviarJSON(response, controller.listarUnidades()); break;
            case "tipo": enviarJSON(response, controller.listarTipos()); break;
            default: enviarJSON(response, "Entidad no válida"); break;
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String entidad = request.getParameter("entidad");
        String accion = request.getParameter("accion"); // insertar, actualizar, eliminar
        boolean exito = false;

        switch (entidad) {
            case "categoria":
                Categoria c = new Categoria();
                if ("insertar".equals(accion)) {
                    c.setNombreCategoria(request.getParameter("nombre"));
                    exito = controller.insertarCategoria(c);
                } else if ("actualizar".equals(accion)) {
                    c.setIdCategoria(Integer.parseInt(request.getParameter("id")));
                    c.setNombreCategoria(request.getParameter("nombre"));
                    exito = controller.actualizarCategoria(c);
                } else if ("eliminar".equals(accion)) {
                    int id = Integer.parseInt(request.getParameter("id"));
                    exito = controller.eliminarCategoria(id);
                }
                break;

            case "marca":
                Marca m = new Marca();
                if ("insertar".equals(accion)) {
                    m.setNombre(request.getParameter("nombre"));
                    exito = controller.insertarMarca(m);
                } else if ("actualizar".equals(accion)) {
                    m.setIdMarca(Integer.parseInt(request.getParameter("id")));
                    m.setNombre(request.getParameter("nombre"));
                    exito = controller.actualizarMarca(m);
                } else if ("eliminar".equals(accion)) {
                    int id = Integer.parseInt(request.getParameter("id"));
                    exito = controller.eliminarMarca(id);
                }
                break;

            case "unidad":
                UnidadMedida u = new UnidadMedida();
                if ("insertar".equals(accion)) {
                    u.setNombre(request.getParameter("nombre"));
                    u.setAbreviatura(request.getParameter("abreviatura"));
                    exito = controller.insertarUnidad(u);
                } else if ("actualizar".equals(accion)) {
                    u.setIdUnidad(Integer.parseInt(request.getParameter("id")));
                    u.setNombre(request.getParameter("nombre"));
                    u.setAbreviatura(request.getParameter("abreviatura"));
                    exito = controller.actualizarUnidad(u);
                } else if ("eliminar".equals(accion)) {
                    int id = Integer.parseInt(request.getParameter("id"));
                    exito = controller.eliminarUnidad(id);
                }
                break;

            case "tipo":
                TipoArticulo t = new TipoArticulo();
                if ("insertar".equals(accion)) {
                    t.setNombre(request.getParameter("nombre"));
                    exito = controller.insertarTipo(t);
                } else if ("actualizar".equals(accion)) {
                    t.setId(Integer.parseInt(request.getParameter("id")));
                    t.setNombre(request.getParameter("nombre"));
                    exito = controller.actualizarTipo(t);
                } else if ("eliminar".equals(accion)) {
                    int id = Integer.parseInt(request.getParameter("id"));
                    exito = controller.eliminarTipo(id);
                }
                break;
        }

        enviarJSON(response, exito ? "Operación realizada correctamente" : "Error en la operación");
    }

    private void enviarJSON(HttpServletResponse response, Object data) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        out.print(new Gson().toJson(data));
        out.flush();
    }
}
