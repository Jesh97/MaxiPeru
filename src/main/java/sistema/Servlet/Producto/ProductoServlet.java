package sistema.Servlet.Producto;

import sistema.Controller.Producto.ArticuloController;
import sistema.Modelo.Articulo.Articulo;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.List;

@WebServlet("/productos")
public class ProductoServlet extends HttpServlet {

    private ArticuloController controller;

    @Override
    public void init() throws ServletException {
        controller = new ArticuloController();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String action = request.getParameter("action");
        if (action == null) action = "listar";

        try {
            switch (action) {
                case "nuevo":
                    // redirige al formulario HTML
                    response.sendRedirect("html/articulo_form.html");
                    break;

                case "editar":
                    int idEditar = Integer.parseInt(request.getParameter("id"));
                    Articulo art = controller.obtenerPorId(idEditar);

                    // mandar datos en query params para el HTML (luego JS los procesa)
                    response.sendRedirect("html/articulo_form.html?id=" + art.getIdProducto()
                            + "&codigo=" + art.getCodigo()
                            + "&descripcion=" + art.getDescripcion()
                            + "&cantidad=" + art.getCantidad()
                            + "&precioUnitario=" + art.getPrecioUnitario()
                            + "&pesoUnitario=" + art.getPesoUnitario()
                            + "&densidad=" + art.getDensidad()
                            + "&aroma=" + art.getAroma()
                            + "&color=" + art.getColor()
                            + "&idMarca=" + art.getIdMarca()
                            + "&idCategoria=" + art.getIdCategoria()
                            + "&idUnidad=" + art.getIdUnidad()
                            + "&idTipoArticulo=" + art.getIdTipoArticulo());
                    break;

                case "eliminar":
                    int idEliminar = Integer.parseInt(request.getParameter("id"));
                    controller.eliminar(idEliminar);
                    response.sendRedirect("html/articulo_list.html");
                    break;

                case "buscarCompra":
                    enviarJson(response, controller.buscarParaCompra(request.getParameter("q")));
                    break;

                case "buscarVenta":
                    enviarJson(response, controller.buscarParaVenta(request.getParameter("q")));
                    break;

                case "buscarInsumo":
                    enviarJson(response, controller.buscarInsumos(request.getParameter("q")));
                    break;

                case "listar":
                default:
                    enviarJson(response, controller.listar());
                    break;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        int id = request.getParameter("id") != null && !request.getParameter("id").isEmpty()
                ? Integer.parseInt(request.getParameter("id"))
                : 0;

        Articulo a = new Articulo();
        a.setIdProducto(id);
        a.setCodigo(request.getParameter("codigo"));
        a.setDescripcion(request.getParameter("descripcion"));
        a.setCantidad(Integer.parseInt(request.getParameter("cantidad")));
        a.setPrecioUnitario(Double.parseDouble(request.getParameter("precioUnitario")));
        a.setPesoUnitario(Double.parseDouble(request.getParameter("pesoUnitario")));
        a.setDensidad(Double.parseDouble(request.getParameter("densidad")));
        a.setAroma(request.getParameter("aroma"));
        a.setColor(request.getParameter("color"));
        a.setIdMarca(Integer.parseInt(request.getParameter("idMarca")));
        a.setIdCategoria(Integer.parseInt(request.getParameter("idCategoria")));
        a.setIdUnidad(Integer.parseInt(request.getParameter("idUnidad")));
        a.setIdTipoArticulo(Integer.parseInt(request.getParameter("idTipoArticulo")));

        if (id == 0) {
            controller.insertar(a);
        } else {
            controller.actualizar(a);
        }

        response.sendRedirect("html/articulo_list.html");
    }

    // 🔹 Método auxiliar: devolver lista como JSON
    private void enviarJson(HttpServletResponse response, List<Articulo> articulos) throws IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        out.print("[");
        for (int i = 0; i < articulos.size(); i++) {
            Articulo a = articulos.get(i);
            out.print("{"
                    + "\"id\":" + a.getIdProducto()
                    + ",\"codigo\":\"" + a.getCodigo() + "\""
                    + ",\"descripcion\":\"" + a.getDescripcion() + "\""
                    + ",\"cantidad\":" + a.getCantidad()
                    + ",\"precioUnitario\":" + a.getPrecioUnitario()
                    + ",\"pesoUnitario\":" + a.getPesoUnitario()
                    + ",\"densidad\":" + a.getDensidad()
                    + ",\"aroma\":\"" + a.getAroma() + "\""
                    + ",\"color\":\"" + a.getColor() + "\""
                    + ",\"idMarca\":" + a.getIdMarca()
                    + ",\"idCategoria\":" + a.getIdCategoria()
                    + ",\"idUnidad\":" + a.getIdUnidad()
                    + ",\"idTipoArticulo\":" + a.getIdTipoArticulo()
                    + "}");
            if (i < articulos.size() - 1) out.print(",");
        }
        out.print("]");
        out.flush();
    }
}
