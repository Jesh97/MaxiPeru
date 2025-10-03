package sistema.Servlet.Producto;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sistema.Controller.Producto.CatalogoController;
import sistema.Ejecucion.Auditoria;
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
        String entidad = request.getParameter("entidad");
        String tipoAccionAuditoria = "CONSULTA_CATALOGO";
        String descripcionAuditoria = "";
        Object resultado = null;
        boolean valido = true;

        switch (entidad) {
            case "categoria":
                resultado = controller.listarCategorias();
                // Texto de auditoría mejorado:
                descripcionAuditoria = "Consulta realizada: Se accedió al listado completo de Categorías del Catálogo.";
                break;
            case "marca":
                resultado = controller.listarMarcas();
                // Texto de auditoría mejorado:
                descripcionAuditoria = "Consulta realizada: Se accedió al listado completo de Marcas disponibles en el Catálogo.";
                break;
            case "unidad":
                resultado = controller.listarUnidades();
                // Texto de auditoría mejorado:
                descripcionAuditoria = "Consulta realizada: Se accedió al listado completo de Unidades de Medida.";
                break;
            case "tipo":
                resultado = controller.listarTipos();
                // Texto de auditoría mejorado:
                descripcionAuditoria = "Consulta realizada: Se accedió al listado completo de Tipos de Artículo.";
                break;
            default:
                resultado = "Entidad no válida";
                descripcionAuditoria = "ERROR: Intento de consulta con entidad no reconocida: '" + entidad + "'.";
                tipoAccionAuditoria = "ERROR_CONSULTA";
                valido = false;
                break;
        }

        // --- Lógica de Auditoría para GET ---
        Auditoria.registrar(request, tipoAccionAuditoria, descripcionAuditoria);
        // --- Fin Lógica de Auditoría ---

        enviarJSON(response, resultado);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String entidad = request.getParameter("entidad");
        String accion = request.getParameter("accion");
        boolean exito = false;
        String tipoAccionAuditoria = "MODIFICACION_CATALOGO";
        String descripcionAuditoria = "Inicio de operación " + accion + " sobre " + entidad;

        try {
            switch (entidad) {
                case "categoria":
                    Categoria c = new Categoria();
                    tipoAccionAuditoria = "CATEGORIA_" + accion.toUpperCase();
                    if ("insertar".equals(accion)) {
                        c.setNombreCategoria(request.getParameter("nombre"));
                        exito = controller.insertarCategoria(c);
                        // Texto de auditoría mejorado:
                        descripcionAuditoria = "Registro exitoso: Nueva Categoría '" + c.getNombreCategoria() + "' fue añadida al Catálogo.";
                    } else if ("actualizar".equals(accion)) {
                        c.setIdCategoria(Integer.parseInt(request.getParameter("id")));
                        c.setNombreCategoria(request.getParameter("nombre"));
                        exito = controller.actualizarCategoria(c);
                        // Texto de auditoría mejorado:
                        descripcionAuditoria = "Actualización exitosa: Categoría con ID " + c.getIdCategoria() + " modificada a '" + c.getNombreCategoria() + "'.";
                    } else if ("eliminar".equals(accion)) {
                        int id = Integer.parseInt(request.getParameter("id"));
                        exito = controller.eliminarCategoria(id);
                        // Texto de auditoría mejorado:
                        descripcionAuditoria = "Eliminación exitosa: Se removió la Categoría con ID " + id + " del Catálogo.";
                    }
                    break;

                case "marca":
                    Marca m = new Marca();
                    tipoAccionAuditoria = "MARCA_" + accion.toUpperCase();
                    if ("insertar".equals(accion)) {
                        m.setNombre(request.getParameter("nombre"));
                        exito = controller.insertarMarca(m);
                        // Texto de auditoría mejorado:
                        descripcionAuditoria = "Registro exitoso: Nueva Marca '" + m.getNombre() + "' fue creada.";
                    } else if ("actualizar".equals(accion)) {
                        m.setIdMarca(Integer.parseInt(request.getParameter("id")));
                        m.setNombre(request.getParameter("nombre"));
                        exito = controller.actualizarMarca(m);
                        // Texto de auditoría mejorado:
                        descripcionAuditoria = "Actualización exitosa: Marca con ID " + m.getIdMarca() + " modificada a '" + m.getNombre() + "'.";
                    } else if ("eliminar".equals(accion)) {
                        int id = Integer.parseInt(request.getParameter("id"));
                        exito = controller.eliminarMarca(id);
                        // Texto de auditoría mejorado:
                        descripcionAuditoria = "Eliminación exitosa: Se removió la Marca con ID " + id + ".";
                    }
                    break;

                case "unidad":
                    UnidadMedida u = new UnidadMedida();
                    tipoAccionAuditoria = "UNIDAD_" + accion.toUpperCase();
                    if ("insertar".equals(accion)) {
                        u.setNombre(request.getParameter("nombre"));
                        u.setAbreviatura(request.getParameter("abreviatura"));
                        exito = controller.insertarUnidad(u);
                        // Texto de auditoría mejorado:
                        descripcionAuditoria = "Registro exitoso: Nueva Unidad de Medida '" + u.getNombre() + "' (" + u.getAbreviatura() + ") fue añadida.";
                    } else if ("actualizar".equals(accion)) {
                        u.setIdUnidad(Integer.parseInt(request.getParameter("id")));
                        u.setNombre(request.getParameter("nombre"));
                        u.setAbreviatura(request.getParameter("abreviatura"));
                        exito = controller.actualizarUnidad(u);
                        // Texto de auditoría mejorado:
                        descripcionAuditoria = "Actualización exitosa: Unidad ID " + u.getIdUnidad() + " modificada a '" + u.getNombre() + "' (" + u.getAbreviatura() + ").";
                    } else if ("eliminar".equals(accion)) {
                        int id = Integer.parseInt(request.getParameter("id"));
                        exito = controller.eliminarUnidad(id);
                        // Texto de auditoría mejorado:
                        descripcionAuditoria = "Eliminación exitosa: Se removió la Unidad de Medida con ID " + id + ".";
                    }
                    break;

                case "tipo":
                    TipoArticulo t = new TipoArticulo();
                    tipoAccionAuditoria = "TIPO_" + accion.toUpperCase();
                    if ("insertar".equals(accion)) {
                        t.setNombre(request.getParameter("nombre"));
                        exito = controller.insertarTipo(t);
                        // Texto de auditoría mejorado:
                        descripcionAuditoria = "Registro exitoso: Nuevo Tipo de Artículo '" + t.getNombre() + "' fue creado.";
                    } else if ("actualizar".equals(accion)) {
                        t.setId(Integer.parseInt(request.getParameter("id")));
                        t.setNombre(request.getParameter("nombre"));
                        exito = controller.actualizarTipo(t);
                        // Texto de auditoría mejorado:
                        descripcionAuditoria = "Actualización exitosa: Tipo de Artículo ID " + t.getId() + " modificado a '" + t.getNombre() + "'.";
                    } else if ("eliminar".equals(accion)) {
                        int id = Integer.parseInt(request.getParameter("id"));
                        exito = controller.eliminarTipo(id);
                        // Texto de auditoría mejorado:
                        descripcionAuditoria = "Eliminación exitosa: Se removió el Tipo de Artículo con ID " + id + ".";
                    }
                    break;

                default:
                    // Auditoría de entidad no válida
                    tipoAccionAuditoria = "ERROR_POST";
                    descripcionAuditoria = "ERROR CRÍTICO: Intento de operación no permitida sobre entidad '" + entidad + "'.";
                    exito = false;
                    break;
            }

            // --- Lógica de Auditoría para POST ---
            if (exito) {
                // Si fue exitoso, usamos la descripción ya "bonita"
                Auditoria.registrar(request, tipoAccionAuditoria + "_EXITO", descripcionAuditoria);
            } else {
                // Si hubo fallo en la lógica de negocio (por ejemplo, el DAO retornó false)
                String descripcionFallo = "FALLO en la operación: La acción '" + accion + "' sobre " + entidad + " no pudo completarse con éxito.";
                Auditoria.registrar(request, tipoAccionAuditoria + "_FALLO", descripcionFallo);
            }
            // --- Fin Lógica de Auditoría ---

        } catch (NumberFormatException e) {
            // Manejar y auditar errores de formato
            tipoAccionAuditoria = "ERROR_FORMATO";
            descripcionAuditoria = "ERROR DE DATOS: Se detectó un valor no numérico en un campo requerido (ID). Detalle técnico: " + e.getMessage();
            Auditoria.registrar(request, tipoAccionAuditoria, descripcionAuditoria);
            exito = false;
        } catch (Exception e) {
            // Manejar y auditar otras excepciones
            tipoAccionAuditoria = "ERROR_INESPERADO";
            descripcionAuditoria = "ERROR INESPERADO: Ocurrió un fallo desconocido durante la operación. Detalle técnico: " + e.toString();
            Auditoria.registrar(request, tipoAccionAuditoria, descripcionAuditoria);
            exito = false;
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