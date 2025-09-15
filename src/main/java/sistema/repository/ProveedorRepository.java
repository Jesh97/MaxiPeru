package sistema.repository;

import sistema.Modelo.Proveedor.Proveedor;

import java.sql.SQLException;
import java.util.List;

public interface ProveedorRepository {
    void insertar(Proveedor proveedor);
    void actualizar(Proveedor proveedor);
    void eliminar(int id);
    Proveedor obtenerPorId(int id);
    List<Proveedor> listarTodos();
    List<Proveedor> buscar(String filtro);
    List<Proveedor> buscarProveedor(String busqueda) throws SQLException;

}
