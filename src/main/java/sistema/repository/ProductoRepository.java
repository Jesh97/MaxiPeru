package sistema.repository;

import sistema.Modelo.Producto;

import java.sql.SQLException;
import java.util.List;

public interface ProductoRepository {

    List<Producto> buscarProducto(String busqueda) throws SQLException;
}
