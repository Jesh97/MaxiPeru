package sistema.Servlet.Producto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.io.IOException;
import java.util.List;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sistema.Controller.Producto.ArticuloController;
import sistema.Ejecucion.Auditoria;
import sistema.Modelo.Articulo.Articulo;
import sistema.Modelo.Articulo.Categoria;
import sistema.Modelo.Articulo.Marca;
import sistema.Modelo.Articulo.TipoArticulo;
import sistema.Modelo.Articulo.UnidadMedida;
import sistema.repository.ArticuloRepository;
import sistema.Modelo.Compra.Lote;

@WebServlet("/productos")
public class ProductoServlet extends HttpServlet {

    private final ArticuloRepository articuloDAO = new ArticuloController();
    private final ObjectMapper mapper;

    public ProductoServlet() {
        this.mapper = new ObjectMapper();
        this.mapper.registerModule(new JavaTimeModule());
    }

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

        List<Articulo> resultadosArticulos = null;
        String busqueda = request.getParameter("busqueda");

        String tipoAccionAuditoria = "PRODUCTO_CONSULTA";
        String descripcionAuditoria = "";

        try {
            switch (accion) {
                case "listar":
                    resultadosArticulos = articuloDAO.listarArticulos();
                    descripcionAuditoria = "Consulta realizada: Acceso al listado completo de todos los Artículos del Catálogo.";
                    break;
                case "buscar_compra":
                    resultadosArticulos = articuloDAO.buscarArticulosParaCompra(busqueda);
                    descripcionAuditoria = "Búsqueda de Artículos para Compra con filtro: '" + (busqueda != null ? busqueda : "N/A") + "'.";
                    break;
                case "buscar_venta":
                    resultadosArticulos = articuloDAO.buscarArticulosParaVenta(busqueda);
                    descripcionAuditoria = "Búsqueda de Artículos para Venta con filtro: '" + (busqueda != null ? busqueda : "N/A") + "'.";
                    break;
                case "buscar_insumos":
                    resultadosArticulos = articuloDAO.buscarInsumos(busqueda);
                    descripcionAuditoria = "Búsqueda de Insumos con filtro: '" + (busqueda != null ? busqueda : "N/A") + "'.";
                    break;
                case "ver_lotes":
                    String idArticuloParam = request.getParameter("id_articulo");
                    if (idArticuloParam == null) {
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        response.getWriter().write(mapper.writeValueAsString(new Respuesta(false, "Parámetro 'id_articulo' es requerido para ver lotes.")));
                        tipoAccionAuditoria = "PRODUCTO_CONSULTA_ERROR";
                        descripcionAuditoria = "ERROR: Falta 'id_articulo' para la acción 'ver_lotes'.";
                        Auditoria.registrar(request, tipoAccionAuditoria, descripcionAuditoria);
                        return;
                    }
                    int idArticulo = Integer.parseInt(idArticuloParam);

                    List<Lote> lotes = articuloDAO.verLotesPorArticulo(idArticulo);

                    descripcionAuditoria = "Consulta realizada: Se listan los lotes del Artículo ID: " + idArticulo;
                    Auditoria.registrar(request, "LOTE_CONSULTA", descripcionAuditoria);

                    response.getWriter().write(mapper.writeValueAsString(lotes));
                    return;
                default:
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write(mapper.writeValueAsString(new Respuesta(false, "Acción no válida.")));
                    tipoAccionAuditoria = "PRODUCTO_CONSULTA_ERROR";
                    descripcionAuditoria = "ERROR: Intento de consulta con acción no válida: '" + accion + "'.";
                    Auditoria.registrar(request, tipoAccionAuditoria, descripcionAuditoria);
                    return;
            }

            Auditoria.registrar(request, tipoAccionAuditoria, descripcionAuditoria);

            response.getWriter().write(mapper.writeValueAsString(resultadosArticulos));
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(mapper.writeValueAsString(new Respuesta(false, "ID de artículo inválido: " + e.getMessage())));
            Auditoria.registrar(request, "PRODUCTO_CONSULTA_ERROR_FORMATO", "ERROR: ID de artículo inválido. Detalle: " + e.getMessage());
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(mapper.writeValueAsString(new Respuesta(false, "Error al procesar la solicitud: " + e.getMessage())));

            Auditoria.registrar(request, "PRODUCTO_CONSULTA_EXCEPTION", "ERROR INESPERADO: Fallo al consultar artículos. Detalle: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String codigo = request.getParameter("codigo");
        String descripcion = request.getParameter("descripcion");
        String tipoAccionAuditoria = "PRODUCTO_INSERTAR";
        String descripcionAuditoria = "Inicio de registro de nuevo artículo: " + codigo + " - " + descripcion;
        boolean exito = false;

        try {
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

            exito = articuloDAO.agregarArticulo(nuevoArticulo);

            if (exito) {
                response.setStatus(HttpServletResponse.SC_CREATED);
                descripcionAuditoria = "Registro exitoso: Artículo '" + descripcion + "' con código '" + codigo + "' ha sido creado.";
                mapper.writeValue(response.getWriter(), new Respuesta(true, "Artículo agregado con éxito."));
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                descripcionAuditoria = "FALLO LÓGICO: El artículo '" + descripcion + "' no pudo ser agregado (DAO retornó false).";
                mapper.writeValue(response.getWriter(), new Respuesta(false, "Error al agregar artículo."));
            }
            Auditoria.registrar(request, tipoAccionAuditoria + (exito ? "_EXITO" : "_FALLO"), descripcionAuditoria);

        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            descripcionAuditoria = "ERROR DE DATOS: Valores numéricos de entrada inválidos. Detalle: " + e.getMessage();
            Auditoria.registrar(request, "PRODUCTO_INSERTAR_ERROR_FORMATO", descripcionAuditoria);
            mapper.writeValue(response.getWriter(), new Respuesta(false, "Datos numéricos inválidos: " + e.getMessage()));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            descripcionAuditoria = "ERROR INESPERADO: Fallo interno durante el registro. Detalle: " + e.getMessage();
            Auditoria.registrar(request, "PRODUCTO_INSERTAR_ERROR_INESPERADO", descripcionAuditoria);
            mapper.writeValue(response.getWriter(), new Respuesta(false, "Error interno del servidor: " + e.getMessage()));
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String descripcion = request.getParameter("descripcion");
        String idProductoParam = request.getParameter("id_producto");
        String tipoAccionAuditoria = "PRODUCTO_ACTUALIZAR";
        String descripcionAuditoria = "Inicio de actualización para Artículo ID: " + idProductoParam;
        boolean exito = false;

        try {
            int idProducto = Integer.parseInt(idProductoParam);
            String codigo = request.getParameter("codigo");
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

            exito = articuloDAO.actualizarArticulo(articuloActualizado);

            if (exito) {
                descripcionAuditoria = "Actualización exitosa: Artículo ID " + idProducto + " ('" + descripcion + "') fue modificado en el sistema.";
                mapper.writeValue(response.getWriter(), new Respuesta(true, "Artículo actualizado con éxito."));
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                descripcionAuditoria = "FALLO LÓGICO: No se pudo actualizar el Artículo ID " + idProducto + " (Artículo no encontrado o error DAO).";
                mapper.writeValue(response.getWriter(), new Respuesta(false, "Error al actualizar artículo o ID no encontrado."));
            }
            Auditoria.registrar(request, tipoAccionAuditoria + (exito ? "_EXITO" : "_FALLO"), descripcionAuditoria);

        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            descripcionAuditoria = "ERROR DE DATOS: ID o valores numéricos de entrada inválidos para la actualización. Detalle: " + e.getMessage();
            Auditoria.registrar(request, "PRODUCTO_ACTUALIZAR_ERROR_FORMATO", descripcionAuditoria);
            mapper.writeValue(response.getWriter(), new Respuesta(false, "Datos numéricos inválidos: " + e.getMessage()));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            descripcionAuditoria = "ERROR INESPERADO: Fallo interno durante la actualización. Detalle: " + e.getMessage();
            Auditoria.registrar(request, "PRODUCTO_ACTUALIZAR_ERROR_INESPERADO", descripcionAuditoria);
            mapper.writeValue(response.getWriter(), new Respuesta(false, "Error interno del servidor: " + e.getMessage()));
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String idProductoParam = request.getParameter("id_producto");
        String tipoAccionAuditoria = "PRODUCTO_ELIMINAR";
        String descripcionAuditoria = "Inicio de eliminación para Artículo ID: " + idProductoParam;
        boolean exito = false;

        try {
            int idProducto = Integer.parseInt(idProductoParam);

            exito = articuloDAO.eliminarArticulo(idProducto);

            if (exito) {
                descripcionAuditoria = "Eliminación exitosa: Se removió el Artículo con ID " + idProducto + " del Catálogo.";
                mapper.writeValue(response.getWriter(), new Respuesta(true, "Artículo eliminado con éxito."));
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                descripcionAuditoria = "FALLO LÓGICO: El Artículo ID " + idProducto + " no pudo ser eliminado (no encontrado o error DAO).";
                mapper.writeValue(response.getWriter(), new Respuesta(false, "Error al eliminar artículo o ID no encontrado."));
            }
            Auditoria.registrar(request, tipoAccionAuditoria + (exito ? "_EXITO" : "_FALLO"), descripcionAuditoria);

        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            descripcionAuditoria = "ERROR DE DATOS: El ID de artículo ('" + idProductoParam + "') proporcionado para la eliminación no es válido.";
            Auditoria.registrar(request, tipoAccionAuditoria + "_ERROR_FORMATO", descripcionAuditoria);
            mapper.writeValue(response.getWriter(), new Respuesta(false, "ID de artículo inválido."));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            descripcionAuditoria = "ERROR INESPERADO: Fallo interno durante la eliminación. Detalle: " + e.getMessage();
            Auditoria.registrar(request, tipoAccionAuditoria + "_ERROR_INESPERADO", descripcionAuditoria);
            mapper.writeValue(response.getWriter(), new Respuesta(false, "Error interno del servidor: " + e.getMessage()));
        }
    }
}
