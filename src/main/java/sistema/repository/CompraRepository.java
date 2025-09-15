package sistema.repository;

import sistema.Modelo.Compra.*;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public interface CompraRepository {
    int registrarCompra(Compra compra,
                        GuiaTransporte guia,
                        DocumentoReferencia docRef,
                        List<DetalleCompra> detalles,
                        List<Descuento> descuentos) throws SQLException;

    List<Map<String, Object>> listarComprasConDetalles() throws SQLException;
}
