package sistema.repository;

import sistema.Modelo.Articulo.Articulo;
import java.util.List;

public interface ArticuloRepository {

    // Métodos CRUD
    boolean agregarArticulo(Articulo articulo);
    boolean actualizarArticulo(Articulo articulo);
    boolean eliminarArticulo(int idArticulo);
    List<Articulo> listarArticulos();
    // Métodos de Búsqueda
    List<Articulo> buscarArticulosParaCompra(String busqueda);
    List<Articulo> buscarArticulosParaVenta(String busqueda);
    List<Articulo> buscarInsumos(String busqueda);
}