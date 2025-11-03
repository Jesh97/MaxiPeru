package sistema.repository;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public interface ProduccionRepository {

    int crearReceta(int idArtTer, String descripcion, BigDecimal cantProd, int idUniProd) throws SQLException;
    void agregarDetalleReceta(int idReceta, int idArtInsumo, BigDecimal cantReq, int idUniInsumo) throws SQLException;
    int crearOrden(int idReceta, BigDecimal cantProd, String fechaIni, String obs) throws SQLException;
    void gestionarConsumoMateriaPrima(int idOrden) throws SQLException;
    void gestionarConsumoEnvase(int idOrden, BigDecimal cantAEmpacar) throws SQLException;
    void registrarLotes(int idOrden, List<Map<String, Object>> lotes) throws SQLException;
    void finalizarOrden(int idOrden) throws SQLException;
    List<String> obtenerPresentacionesPorProductoMaestro(int idProductoMaestro) throws SQLException;
    List<Map<String, Object>> buscarArticulosTerminados(String busqueda) throws SQLException;
    List<Map<String, Object>> buscarArticulosInsumos(String busqueda) throws SQLException;
    List<Map<String, Object>> buscarArticulosEmbalaje(String busqueda) throws SQLException;
}