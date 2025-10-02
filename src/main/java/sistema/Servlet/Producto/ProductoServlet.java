package sistema.Servlet.Producto;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.List;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sistema.Controller.Producto.ArticuloController;
import sistema.Modelo.Articulo.Articulo;
import sistema.Modelo.Articulo.Categoria;
import sistema.Modelo.Articulo.Marca;
import sistema.Modelo.Articulo.TipoArticulo;
import sistema.Modelo.Articulo.UnidadMedida;
import sistema.repository.ArticuloRepository;

@WebServlet("/productos")
public class ProductoServlet extends HttpServlet {

    private final ArticuloRepository articuloDAO = new ArticuloController();
    private final ObjectMapper mapper = new ObjectMapper();

    private static class Respuesta {
        public boolean exito;
        public String mensaje;

        public Respuesta(boolean exito, String mensaje) {
            this.exito = exito;
            this.mensaje = mensaje;
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String accion = request.getParameter("accion");
        if (accion == null) accion = "listar";

        List<Articulo> resultados = null;
        String busqueda = request.getParameter("busqueda");

        try {
            switch (accion) {
                case "listar":
                    resultados = articuloDAO.listarArticulos();
                    break;
                case "buscar_compra":
                    resultados = articuloDAO.buscarArticulosParaCompra(busqueda);
                    break;
                case "buscar_venta":
                    resultados = articuloDAO.buscarArticulosParaVenta(busqueda);
                    break;
                case "buscar_insumos":
                    resultados = articuloDAO.buscarInsumos(busqueda);
                    break;
                default:
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write(mapper.writeValueAsString(new Respuesta(false, "Acción no válida.")));
                    return;
            }
            response.getWriter().write(mapper.writeValueAsString(resultados));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(mapper.writeValueAsString(new Respuesta(false, "Error al procesar la solicitud: " + e.getMessage())));
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            String codigo = request.getParameter("codigo");
            String descripcion = request.getParameter("descripcion");
            int cantidad = Integer.parseInt(request.getParameter("cantidad"));
            double precioUnitario = Double.parseDouble(request.getParameter("precio_unitario"));
            double pesoUnitario = Double.parseDouble(request.getParameter("peso_unitario"));
            double densidad = Double.parseDouble(request.getParameter("densidad"));
            String aroma = request.getParameter("aroma");
            String color = request.getParameter("color");
            int idMarca = Integer.parseInt(request.getParameter("id_marca"));
            int idCategoria = Integer.parseInt(request.getParameter("id_categoria"));
            int idUnidad = Integer.parseInt(request.getParameter("id_unidad"));
            int idTipoArticulo = Integer.parseInt(request.getParameter("id_tipo_articulo"));

            Marca marca = new Marca(idMarca, null);
            Categoria categoria = new Categoria(idCategoria, null);
            UnidadMedida unidad = new UnidadMedida(idUnidad, null, null);
            TipoArticulo tipoArticulo = new TipoArticulo(idTipoArticulo, null);

            Articulo nuevoArticulo = new Articulo(0, codigo, descripcion, cantidad, precioUnitario,
                    pesoUnitario, densidad, aroma, color, marca,
                    categoria, unidad, tipoArticulo);

            boolean exito = articuloDAO.agregarArticulo(nuevoArticulo);

            if (exito) {
                response.setStatus(HttpServletResponse.SC_CREATED);
                mapper.writeValue(response.getWriter(), new Respuesta(true, "Artículo agregado con éxito."));
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                mapper.writeValue(response.getWriter(), new Respuesta(false, "Error al agregar artículo."));
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            mapper.writeValue(response.getWriter(), new Respuesta(false, "Datos numéricos inválidos: " + e.getMessage()));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            mapper.writeValue(response.getWriter(), new Respuesta(false, "Error interno del servidor: " + e.getMessage()));
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            int idProducto = Integer.parseInt(request.getParameter("id_producto"));
            String codigo = request.getParameter("codigo");
            String descripcion = request.getParameter("descripcion");
            int cantidad = Integer.parseInt(request.getParameter("cantidad"));
            double precioUnitario = Double.parseDouble(request.getParameter("precio_unitario"));
            double pesoUnitario = Double.parseDouble(request.getParameter("peso_unitario"));
            double densidad = Double.parseDouble(request.getParameter("densidad"));
            String aroma = request.getParameter("aroma");
            String color = request.getParameter("color");
            int idMarca = Integer.parseInt(request.getParameter("id_marca"));
            int idCategoria = Integer.parseInt(request.getParameter("id_categoria"));
            int idUnidad = Integer.parseInt(request.getParameter("id_unidad"));
            int idTipoArticulo = Integer.parseInt(request.getParameter("id_tipo_articulo"));

            Marca marca = new Marca(idMarca, null);
            Categoria categoria = new Categoria(idCategoria, null);
            UnidadMedida unidad = new UnidadMedida(idUnidad, null, null);
            TipoArticulo tipoArticulo = new TipoArticulo(idTipoArticulo, null);

            Articulo articuloActualizado = new Articulo(idProducto, codigo, descripcion, cantidad, precioUnitario,
                    pesoUnitario, densidad, aroma, color, marca,
                    categoria, unidad, tipoArticulo);

            boolean exito = articuloDAO.actualizarArticulo(articuloActualizado);

            if (exito) {
                mapper.writeValue(response.getWriter(), new Respuesta(true, "Artículo actualizado con éxito."));
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                mapper.writeValue(response.getWriter(), new Respuesta(false, "Error al actualizar artículo o ID no encontrado."));
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            mapper.writeValue(response.getWriter(), new Respuesta(false, "Error interno del servidor: " + e.getMessage()));
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            int idProducto = Integer.parseInt(request.getParameter("id_producto"));

            boolean exito = articuloDAO.eliminarArticulo(idProducto);

            if (exito) {
                mapper.writeValue(response.getWriter(), new Respuesta(true, "Artículo eliminado con éxito."));
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                mapper.writeValue(response.getWriter(), new Respuesta(false, "Error al eliminar artículo o ID no encontrado."));
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            mapper.writeValue(response.getWriter(), new Respuesta(false, "ID de artículo inválido."));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            mapper.writeValue(response.getWriter(), new Respuesta(false, "Error interno del servidor: " + e.getMessage()));
        }
    }
}
