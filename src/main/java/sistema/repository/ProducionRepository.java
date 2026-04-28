package sistema.repository;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public interface ProducionRepository {

    int crearReceta(int idProductoMaestro, double cantProd, int idUniProd) throws SQLException;
    void agregarDetalleReceta(int idReceta, int idArtInsumo, double cantReq, int idUniInsumo) throws SQLException;
    List<Map<String, Object>> listarRecetasConDetalles() throws SQLException;
    void actualizarInsumoReceta(int idDetalleReceta, double cantReq, int idUniInsumo) throws SQLException;
    void eliminarDetalleRecetaIndividual(int idDetalleReceta) throws SQLException;
    void desactivarReceta(int idReceta) throws SQLException;
    List<Map<String, Object>> listarOrdenesActivas() throws SQLException;
    List<Map<String, Object>> obtenerRecetaPorNombreGenerico(String nombreGenerico) throws SQLException;
    List<Map<String, Object>> obtenerInsumosPorIdReceta(int idReceta) throws SQLException;
    List<Map<String, Object>> obtenerDetalleInsumoReceta(int idDetalleReceta) throws SQLException;
    int crearOrden(int idReceta, int idArticuloProducido, double cantProd, double cantProdFinalReal, String fechaIni, String obs) throws SQLException;
    void gestionarConsumoMateriaPrima(int idOrden) throws SQLException;
    void registrarConsumoComponente(int idOrden, int idArticuloConsumido, double cantidadAConsumir, int idUnidad, boolean esEnvase, String comentarioConsumo) throws SQLException;
    List<Map<String, Object>> obtenerConsumoTotalPorOrden(int idOrden) throws SQLException;
    void gestionarConsumoEnvase(int idOrden, double mermaCantidad, double envasesSueltos) throws SQLException;
    String generarCodigoLote(int idOrden) throws SQLException;
    void registrarLotes(int idOrden, List<Map<String, Object>> lotes) throws SQLException;
    void finalizarOrden(int idOrden) throws SQLException;
    List<String> obtenerPresentacionesPorProductoMaestro(int idProductoMaestro) throws SQLException;
    List<Map<String, Object>> buscarArticulosTerminados(String busqueda) throws SQLException;
    /** Artículos terminados con receta activa y al menos un insumo (pantalla Costos). */
    List<Map<String, Object>> buscarArticulosTerminadosConReceta(String busqueda) throws SQLException;
    List<Map<String, Object>> buscarArticulosInsumos(String busqueda) throws SQLException;
    List<Map<String, Object>> buscarArticulosEmbalaje(String busqueda) throws SQLException;
}