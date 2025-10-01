package sistema.repository;

import sistema.Modelo.Articulo.Articulo;
import java.sql.SQLException;
import java.util.List;

public interface ArticuloRepository {

    List<Articulo> buscarParaCompra(String busqueda) throws SQLException;
    List<Articulo> buscarParaVenta(String busqueda) throws SQLException;
    List<Articulo> buscarInsumos(String busqueda) throws SQLException;
    boolean insertar(Articulo articulo);
    boolean actualizar(Articulo articulo);
    boolean eliminar(int id);
    Articulo obtenerPorId(int id);
    List<Articulo> listar();
}
