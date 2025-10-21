package sistema.repository;

import sistema.Modelo.Articulo.Articulo;
import sistema.Modelo.Articulo.Categoria;
import sistema.Modelo.Articulo.Marca;
import sistema.Modelo.Articulo.TipoArticulo;
import java.util.List;

public interface ArticuloRepository {

    boolean agregarArticulo(Articulo articulo);
    boolean actualizarArticulo(Articulo articulo);
    boolean eliminarArticulo(int idArticulo);
    List<Articulo> listarArticulos();
    List<Articulo> buscarArticulosParaCompra(String busqueda);
    List<Articulo> buscarArticulosParaVenta(String busqueda);
    List<Articulo> buscarInsumos(String busqueda);
    List<sistema.Modelo.Compra.Lote> verLotesPorArticulo(int idArticulo);
    List<Categoria> listarCategoriasDinamicas(Integer idMarca, Integer idTipoArticulo);
    List<Marca> listarMarcasDinamicas(Integer idCategoria, Integer idTipoArticulo);
    List<TipoArticulo> listarTiposArticulosDinamicos(Integer idMarca, Integer idCategoria);
}