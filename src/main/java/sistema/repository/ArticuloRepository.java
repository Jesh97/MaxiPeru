package sistema.repository;

import sistema.Modelo.Articulo.Articulo;
import java.sql.SQLException;
import java.util.List;

public interface ArticuloRepository {

    List<Articulo> buscarProducto(String busqueda) throws SQLException;
}
