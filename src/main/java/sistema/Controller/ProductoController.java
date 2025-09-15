package sistema.Controller;

import sistema.Ejecucion.Conexion;
import sistema.Modelo.Producto;
import sistema.repository.ProductoRepository;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ProductoController implements ProductoRepository {

    private Connection getConnection() throws SQLException {
        Connection conn = Conexion.obtenerConexion();
        if (conn == null) {
            throw new SQLException("No se pudo establecer la conexión a la base de datos.");
        }
        return conn;
    }

    @Override
    public List<Producto> buscarProducto(String busqueda) throws SQLException {
        List<Producto> productos = new ArrayList<>();
        String sql = "{call sp_buscar_producto(?)}";

        try (Connection conn = getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {

            cs.setString(1, busqueda);

            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    Producto producto = new Producto();
                    producto.setIdProducto(rs.getInt("id_producto"));
                    producto.setCodigo(rs.getString("codigo"));
                    producto.setDescripcion(rs.getString("descripcion"));
                    producto.setCantidad(rs.getInt("cantidad"));
                    producto.setPrecioUnitario(rs.getDouble("precio_unitario"));
                    producto.setPesoUnitario(rs.getDouble("peso_unitario"));
                    productos.add(producto);
                }
            } catch (SQLException e) {
                throw new RuntimeException(e);
            }
        }
        return productos;
    }
}
