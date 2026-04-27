package sistema.repository;

import sistema.Modelo.Cliente.Cliente;
import java.util.List;

public interface ClienteRepository {
    void insertar(Cliente cliente);
    void actualizar(Cliente cliente);
    void eliminar(int id);
    Cliente obtenerPorId(int id);
    List<Cliente> listarTodos();
    List<Cliente> listarBasico();
    List<Cliente> buscar(String filtro);
}
