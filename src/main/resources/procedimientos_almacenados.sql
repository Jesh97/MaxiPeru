use bd_maxiperu;

DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_agregar_articulo`$$
CREATE PROCEDURE `sp_agregar_articulo`(
    IN p_codigo VARCHAR(50), IN p_descripcion VARCHAR(255), IN p_cantidad INT, IN p_precio_compra DECIMAL(12,2), IN p_precio_venta DECIMAL(12,2),
    IN p_peso_unitario DECIMAL(10,3), IN p_densidad DECIMAL(10,3), IN p_aroma VARCHAR(50), IN p_color VARCHAR(50),
    IN p_id_marca INT, IN p_id_categoria INT, IN p_id_unidad INT, IN p_id_tipo_articulo INT
)
BEGIN
    INSERT INTO articulo(codigo, descripcion, cantidad, precio_compra, precio_venta, peso_unitario, densidad, aroma, color, id_marca, id_categoria, id_unidad, id_tipo_articulo)
    VALUES (p_codigo, p_descripcion, p_cantidad, p_precio_compra, p_precio_venta, p_peso_unitario, p_densidad, p_aroma, p_color, p_id_marca, p_id_categoria, p_id_unidad, p_id_tipo_articulo);
END$$

DROP PROCEDURE IF EXISTS `sp_actualizar_articulo`$$
CREATE PROCEDURE `sp_actualizar_articulo`(
    IN p_id INT, IN p_descripcion VARCHAR(255), IN p_cantidad INT,
    IN p_precio_compra DECIMAL(12,2), IN p_precio_venta DECIMAL(12,2),
    IN p_peso_unitario DECIMAL(10,3), IN p_densidad DECIMAL(10,3), IN p_aroma VARCHAR(50), IN p_color VARCHAR(50),
    IN p_id_marca INT, IN p_id_categoria INT, IN p_id_unidad INT, IN p_id_tipo_articulo INT
)
BEGIN
    UPDATE articulo
    SET descripcion = p_descripcion, cantidad = p_cantidad, precio_compra = p_precio_compra, precio_venta = p_precio_venta,
        peso_unitario = p_peso_unitario, densidad = p_densidad, aroma = p_aroma, color = p_color,
        id_marca = p_id_marca, id_categoria = p_id_categoria, id_unidad = p_id_unidad, id_tipo_articulo = p_id_tipo_articulo
    WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS `sp_eliminar_articulo`$$
CREATE PROCEDURE `sp_eliminar_articulo`(
    IN p_id INT
)
BEGIN
    DELETE FROM articulo WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS `sp_listar_articulos`$$
CREATE PROCEDURE `sp_listar_articulos`()
BEGIN
    SELECT
        a.id, a.codigo, a.descripcion, a.cantidad, a.precio_compra, a.precio_venta, a.peso_unitario, a.densidad,
        a.aroma, a.color, a.id_marca, m.nombre AS marca_nombre, a.id_categoria, c.nombre AS categoria_nombre,
        a.id_unidad, u.nombre AS unidad_nombre, a.id_tipo_articulo, t.nombre AS tipo_nombre
    FROM articulo a
    LEFT JOIN marca m ON a.id_marca = m.id_marca
    LEFT JOIN categoria c ON a.id_categoria = c.id_categoria
    LEFT JOIN unidad_medida u ON a.id_unidad = u.id_unidad
    LEFT JOIN tipo_articulo t ON a.id_tipo_articulo = t.id;
END$$

DROP PROCEDURE IF EXISTS SP_GetOpcionesCategorias$$
CREATE PROCEDURE SP_GetOpcionesCategorias(IN p_id_marca INT, IN p_id_tipo_articulo INT)
BEGIN
    SELECT DISTINCT c.id_categoria, c.nombre FROM categoria c JOIN articulo a ON c.id_categoria = a.id_categoria
    WHERE (a.id_marca = p_id_marca OR p_id_marca IS NULL) AND (a.id_tipo_articulo = p_id_tipo_articulo OR p_id_tipo_articulo IS NULL)
    ORDER BY c.nombre;
END$$

DROP PROCEDURE IF EXISTS SP_GetOpcionesMarcas$$
CREATE PROCEDURE SP_GetOpcionesMarcas(IN p_id_categoria INT, IN p_id_tipo_articulo INT)
BEGIN
    SELECT DISTINCT m.id_marca, m.nombre FROM marca m JOIN articulo a ON m.id_marca = a.id_marca
    WHERE (a.id_categoria = p_id_categoria OR p_id_categoria IS NULL) AND (a.id_tipo_articulo = p_id_tipo_articulo OR p_id_tipo_articulo IS NULL)
    ORDER BY m.nombre;
END$$

DROP PROCEDURE IF EXISTS SP_GetOpcionesTipoArticulo$$
CREATE PROCEDURE SP_GetOpcionesTipoArticulo(IN p_id_marca INT, IN p_id_categoria INT)
BEGIN
    SELECT DISTINCT ta.id, ta.nombre FROM tipo_articulo ta JOIN articulo a ON ta.id = a.id_tipo_articulo
    WHERE (a.id_marca = p_id_marca OR p_id_marca IS NULL) AND (a.id_categoria = p_id_categoria OR p_id_categoria IS NULL)
    ORDER BY ta.nombre;
END$$

DROP PROCEDURE IF EXISTS `sp_buscar_articulos_para_compra`$$
CREATE PROCEDURE `sp_buscar_articulos_para_compra`(IN p_busqueda VARCHAR(100))
BEGIN
SELECT a.id, a.codigo, a.descripcion, a.cantidad, a.precio_compra, a.precio_venta, a.peso_unitario, a.aroma, a.color FROM articulo a WHERE (a.codigo LIKE CONCAT('%', p_busqueda, '%') OR a.descripcion LIKE CONCAT('%', p_busqueda, '%')) AND a.id_tipo_articulo IN (2, 3, 4);
END$$

DROP PROCEDURE IF EXISTS `sp_buscar_articulos_para_venta`$$
CREATE PROCEDURE `sp_buscar_articulos_para_venta`(IN p_busqueda VARCHAR(100))
BEGIN
    SELECT a.id, a.codigo, a.descripcion, a.cantidad, a.precio_compra, a.precio_venta, a.peso_unitario, a.aroma, a.color
    FROM articulo a
    WHERE (a.codigo LIKE CONCAT('%', p_busqueda, '%') OR a.descripcion LIKE CONCAT('%', p_busqueda, '%'))
    AND a.id_tipo_articulo IN (1, 3)
    AND a.cantidad > 0;
END$$

DROP PROCEDURE IF EXISTS `sp_buscar_articulos_para_produccion`$$
CREATE PROCEDURE `sp_buscar_articulos_para_produccion`(IN p_busqueda VARCHAR(100))
BEGIN
SELECT a.id, a.codigo, a.descripcion, a.cantidad, a.precio_compra, a.precio_venta, a.peso_unitario, a.aroma, a.color FROM articulo a WHERE (a.codigo LIKE CONCAT('%', p_busqueda, '%') OR a.descripcion LIKE CONCAT('%', p_busqueda, '%')) AND a.id_tipo_articulo IN (2, 4);
END$$

DROP PROCEDURE IF EXISTS `SP_VerLotesPorArticulo`$$
CREATE PROCEDURE SP_VerLotesPorArticulo(
    IN p_id_articulo INT
)
BEGIN
    SELECT il.id_lote AS ID_Lote, il.codigo_lote AS Codigo_Lote, il.fecha_vencimiento AS Fecha_Vencimiento,
           il.cantidad_disponible AS Cantidad_Disponible, il.fecha_ingreso AS Fecha_Ingreso_Lote,
           art.descripcion AS Nombre_Articulo, dc.precio_unitario AS Precio_Compra_Unitario
    FROM inventario_lote il
    INNER JOIN articulo art ON il.id_articulo = art.id
    LEFT JOIN detalle_compra dc ON il.id_detalle_compra = dc.id_detalle
    WHERE il.id_articulo = p_id_articulo
    ORDER BY il.fecha_vencimiento ASC;
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_cliente`$$
CREATE PROCEDURE `sp_agregar_cliente`(
    IN p_tipo_documento VARCHAR(20), IN p_numero_documento VARCHAR(20), IN p_razon_social VARCHAR(150),
    IN p_direccion TEXT, IN p_telefono VARCHAR(20), IN p_correo VARCHAR(100)
)
BEGIN
    INSERT INTO cliente(tipoDocumento, n_documento, razonSocial, direccion, telefono, correo)
    VALUES (p_tipo_documento, p_numero_documento, p_razon_social, p_direccion, p_telefono, p_correo);
END$$

DROP PROCEDURE IF EXISTS `sp_actualizar_cliente`$$
CREATE PROCEDURE `sp_actualizar_cliente`(
    IN p_id INT, IN p_tipo_documento VARCHAR(20), IN p_numero_documento VARCHAR(20),
    IN p_razon_social VARCHAR(150), IN p_direccion TEXT, IN p_telefono VARCHAR(20),
    IN p_correo VARCHAR(100)
)
BEGIN
    UPDATE cliente
    SET tipoDocumento = p_tipo_documento, n_documento = p_numero_documento, razonSocial = p_razon_social,
        direccion = p_direccion, telefono = p_telefono, correo = p_correo
    WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS `sp_eliminar_cliente`$$
CREATE PROCEDURE `sp_eliminar_cliente`(
    IN p_id INT
)
BEGIN
    DELETE FROM cliente WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS `sp_listar_clientes`$$
CREATE PROCEDURE `sp_listar_clientes`()
BEGIN
    SELECT id, tipoDocumento, n_documento, razonSocial, direccion, telefono, correo
    FROM cliente
    ORDER BY razonSocial ASC;
END$$

DROP PROCEDURE IF EXISTS `sp_buscar_cliente`$$
CREATE PROCEDURE `sp_buscar_cliente`(
    IN p_busqueda VARCHAR(100)
)
BEGIN
    SELECT id, tipoDocumento, n_documento, razonSocial, direccion, telefono, correo
    FROM cliente
    WHERE n_documento LIKE CONCAT('%', p_busqueda, '%') OR razonSocial LIKE CONCAT('%', p_busqueda, '%');
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_proveedor`$$
CREATE PROCEDURE `sp_agregar_proveedor`(
    IN p_ruc VARCHAR(20), IN p_razon_social VARCHAR(255), IN p_direccion VARCHAR(255),
    IN p_telefono VARCHAR(50), IN p_correo VARCHAR(100), IN p_ciudad VARCHAR(50)
)
BEGIN
    INSERT INTO proveedor(ruc, razonSocial, direccion, telefono, correo, ciudad)
    VALUES (p_ruc, p_razon_social, p_direccion, p_telefono, p_correo, p_ciudad);
END$$

DROP PROCEDURE IF EXISTS `sp_actualizar_proveedor`$$
CREATE PROCEDURE `sp_actualizar_proveedor`(
    IN p_id INT, IN p_ruc VARCHAR(20), IN p_razon_social VARCHAR(255), IN p_direccion VARCHAR(255),
    IN p_telefono VARCHAR(50), IN p_correo VARCHAR(100), IN p_ciudad VARCHAR(50)
)
BEGIN
    UPDATE proveedor
    SET ruc = p_ruc, razonSocial = p_razon_social, direccion = p_direccion,
        telefono = p_telefono, correo = p_correo, ciudad = p_ciudad
    WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS `sp_eliminar_proveedor`$$
CREATE PROCEDURE `sp_eliminar_proveedor`(
    IN p_id INT
)
BEGIN
    DELETE FROM proveedor WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS `sp_listar_proveedores`$$
CREATE PROCEDURE `sp_listar_proveedores`()
BEGIN
    SELECT id, ruc, razonSocial, direccion, telefono, correo, ciudad
    FROM proveedor
    ORDER BY razonSocial ASC;
END$$

DROP PROCEDURE IF EXISTS `sp_buscar_proveedor`$$
CREATE PROCEDURE `sp_buscar_proveedor`(
    IN p_busqueda VARCHAR(100)
)
BEGIN
    SELECT id, ruc, razonSocial, direccion, telefono, correo, ciudad
    FROM proveedor
    WHERE ruc LIKE CONCAT('%', p_busqueda, '%') OR razonSocial LIKE CONCAT('%', p_busqueda, '%');
END$$

DROP PROCEDURE IF EXISTS `sp_insertar_caja_compra`$$
CREATE PROCEDURE `sp_insertar_caja_compra`(
    IN p_id_compra INT, IN p_nombre_caja VARCHAR(255), IN p_cantidad INT, IN p_costo_caja DECIMAL(12,2),
    OUT p_id_caja_compra INT
)
BEGIN
    INSERT INTO caja_compra (id_compra, nombre_caja, cantidad, costo_caja)
    VALUES (p_id_compra, p_nombre_caja, p_cantidad, p_costo_caja);
    SET p_id_caja_compra = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_insertar_detalle_caja_compra`$$
CREATE PROCEDURE `sp_insertar_detalle_caja_compra`(
    IN p_id_caja_compra INT, IN p_id_articulo INT, IN p_cantidad DECIMAL(12,2)
)
BEGIN
    INSERT INTO detalle_caja_compra (id_caja_compra, id_articulo, cantidad) VALUES (p_id_caja_compra, p_id_articulo, p_cantidad);
END$$

DROP PROCEDURE IF EXISTS `sp_registrar_compra`$$
CREATE PROCEDURE `sp_registrar_compra`(
    IN p_id_proveedor INT, IN p_id_tipo_comprobante INT, IN p_serie VARCHAR(20), IN p_correlativo VARCHAR(50),
    IN p_fecha_emision DATE, IN p_fecha_vencimiento DATE, IN p_id_tipo_pago INT, IN p_id_forma_pago INT,
    IN p_id_moneda INT, IN p_tipo_cambio DECIMAL(10,4), IN p_incluye_igv BOOLEAN, IN p_hay_bonificacion BOOLEAN,
    IN p_hay_traslado BOOLEAN, IN p_observacion TEXT, IN p_subtotal DECIMAL(12,2), IN p_igv DECIMAL(12,2),
    IN p_total DECIMAL(12,2), IN p_total_peso DECIMAL(12,3), IN p_coste_transporte DECIMAL(12,2)
    -- Se elimina el parámetro OUT p_id_compra
)
BEGIN
    -- 1. Insertar la compra
    INSERT INTO compra(id_proveedor, id_tipo_comprobante, serie, correlativo, fecha_emision, fecha_vencimiento, id_tipo_pago, id_forma_pago, id_moneda, tipo_cambio, incluye_igv, hay_bonificacion, hay_traslado, subtotal, igv, total, total_peso, coste_transporte, observacion)
    VALUES (p_id_proveedor, p_id_tipo_comprobante, p_serie, p_correlativo, p_fecha_emision, p_fecha_vencimiento, p_id_tipo_pago, p_id_forma_pago, p_id_moneda, p_tipo_cambio, p_incluye_igv, p_hay_bonificacion, p_hay_traslado, p_subtotal, p_igv, p_total, p_total_peso, p_coste_transporte, p_observacion);

    -- 2. Devolver el ID generado en un ResultSet que el Controller pueda leer
    SELECT LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_regla_compra`$$
CREATE PROCEDURE `sp_agregar_regla_compra`(
    IN p_id_compra INT, IN p_aplica_costo_adicional BOOLEAN, IN p_monto_minimo DECIMAL(12,2), IN p_costo_adicional DECIMAL(12,2)
)
BEGIN
    INSERT INTO regla_aplicada_compra (id_compra, aplica_costo_adicional, monto_minimo_condicion, costo_adicional_aplicado)
    VALUES (p_id_compra, p_aplica_costo_adicional, p_monto_minimo, p_costo_adicional);
END$$

DROP PROCEDURE IF EXISTS `sp_registrar_lote_compra`$$
CREATE PROCEDURE `sp_registrar_lote_compra`(
    IN p_id_detalle_compra INT, IN p_id_articulo INT, IN p_codigo_lote VARCHAR(50),
    IN p_fecha_vencimiento DATE, IN p_cantidad_lote DECIMAL(12,2)
)
BEGIN
    INSERT INTO inventario_lote(id_articulo, id_detalle_compra, codigo_lote, fecha_vencimiento, cantidad_ingreso, cantidad_disponible)
    VALUES (p_id_articulo, p_id_detalle_compra, p_codigo_lote, p_fecha_vencimiento, p_cantidad_lote, p_cantidad_lote);
    UPDATE articulo SET cantidad = cantidad + p_cantidad_lote WHERE id = p_id_articulo;
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_referencia_compra`$$
CREATE PROCEDURE `sp_agregar_referencia_compra`(
    IN p_id_compra INT, IN p_numero_cotizacion VARCHAR(50), IN p_numero_pedido VARCHAR(50)
)
BEGIN
    INSERT INTO referencia_compra (id_compra, numero_cotizacion, numero_pedido)
    VALUES (p_id_compra, p_numero_cotizacion, p_numero_pedido);
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_guia_transporte_compra`$$
CREATE PROCEDURE `sp_agregar_guia_transporte_compra`(
    IN p_id_compra INT, IN p_ruc_guia VARCHAR(255), IN p_fecha_emision DATE,
    IN p_tipo_comprobante VARCHAR(50), IN p_serie VARCHAR(10), IN p_correlativo VARCHAR(20),
    IN p_ciudad_traslado VARCHAR(100), IN p_punto_partida VARCHAR(255), IN p_punto_llegada VARCHAR(255),
    IN p_serie_guia_transporte VARCHAR(10), IN p_correlativo_guia_transporte VARCHAR(20),
    IN p_coste_total_transporte DECIMAL(10, 2), IN p_peso DECIMAL(10, 2), IN p_fecha_pedido DATE,
    IN p_fecha_entrega DATE
)
BEGIN
    INSERT INTO guia_transporte (id_compra, tipo_documento_ref, ruc_guia, fecha_emision, tipo_comprobante, serie, correlativo, ciudad_traslado, punto_partida, punto_llegada, serie_guia_transporte, correlativo_guia_transporte, coste_total_transporte, peso, fecha_pedido, fecha_entrega)
    VALUES (p_id_compra, 'compra', p_ruc_guia, p_fecha_emision, p_tipo_comprobante, p_serie, p_correlativo, p_ciudad_traslado, p_punto_partida, p_punto_llegada, p_serie_guia_transporte, p_correlativo_guia_transporte, p_coste_total_transporte, p_peso, p_fecha_pedido, p_fecha_entrega);
END$$

DROP PROCEDURE IF EXISTS `sp_listar_compras_final`$$
CREATE PROCEDURE `sp_listar_compras_final`()
BEGIN
    SELECT
        c.id_compra, c.fecha_emision, c.fecha_vencimiento, c.serie, c.correlativo, c.subtotal, c.igv, c.total, c.total_peso, c.coste_transporte, c.observacion,
        c.incluye_igv, c.hay_bonificacion, c.hay_traslado, c.tipo_cambio,
        tc.id AS id_tipo_comprobante, tc.nombre AS tipo_comprobante,
        mo.id_moneda AS id_moneda, mo.nombre AS moneda,
        tp.id AS id_tipo_pago, tp.nombre AS tipo_pago,
        fp.id AS id_forma_pago, fp.nombre AS forma_pago,
        p.id AS id_proveedor, p.ruc, p.razonSocial AS razon_social, p.direccion, p.telefono, p.correo, p.ciudad,
        dc.id_detalle, dc.cantidad, dc.precio_unitario, dc.bonificacion,
        dc.coste_unitario_transporte, dc.coste_total_transporte, dc.precio_con_descuento, dc.igv_insumo, dc.total AS total_detalle, dc.peso_total,
        a.id AS id_articulo, a.codigo AS codigo_articulo, a.descripcion AS descripcion_articulo,
        um.id_unidad AS id_unidad_articulo, um.nombre AS unidad_medida_articulo,
        il.id_lote, il.codigo_lote, il.cantidad_ingreso AS cantidad_lote, il.fecha_vencimiento AS fecha_vencimiento_lote,
        cc.id_caja_compra, cc.nombre_caja, cc.cantidad AS cantidad_total_articulos_caja, cc.costo_caja,
        dcc.id_detalle_caja, dcc.id_articulo AS id_articulo_en_caja, dcc.cantidad AS cantidad_en_caja,
        gt.id_guia, gt.tipo_documento_ref, gt.ruc_guia, gt.razon_social_guia, gt.fecha_emision AS fecha_emision_guia, gt.tipo_comprobante AS tipo_comprobante_guia, gt.serie AS serie_guia, gt.correlativo AS correlativo_guia,
        gt.serie_guia_transporte, gt.correlativo_guia_transporte, gt.ciudad_traslado, gt.punto_partida, gt.punto_llegada,
        gt.coste_total_transporte AS coste_transporte_guia, gt.peso AS peso_guia, gt.fecha_pedido, gt.fecha_entrega,
        rac.id AS id_regla_compra, rac.aplica_costo_adicional, rac.monto_minimo_condicion, rac.costo_adicional_aplicado,
        rc.id_referencia, rc.numero_cotizacion, rc.numero_pedido
    FROM compra c
    INNER JOIN proveedor p ON c.id_proveedor = p.id
    INNER JOIN tipo_comprobante tc ON c.id_tipo_comprobante = tc.id
    INNER JOIN moneda mo ON c.id_moneda = mo.id_moneda
    LEFT JOIN tipo_pago tp ON c.id_tipo_pago = tp.id
    LEFT JOIN forma_pago fp ON c.id_forma_pago = fp.id
    LEFT JOIN detalle_compra dc ON c.id_compra = dc.id_compra
    LEFT JOIN articulo a ON dc.id_articulo = a.id
    LEFT JOIN unidad_medida um ON dc.id_unidad = um.id_unidad
    LEFT JOIN inventario_lote il ON dc.id_detalle = il.id_detalle_compra
    LEFT JOIN caja_compra cc ON c.id_compra = cc.id_compra
    LEFT JOIN detalle_caja_compra dcc ON cc.id_caja_compra = dcc.id_caja_compra
    LEFT JOIN guia_transporte gt ON c.id_compra = gt.id_compra
    LEFT JOIN regla_aplicada_compra rac ON c.id_compra = rac.id_compra
    LEFT JOIN referencia_compra rc ON c.id_compra = rc.id_compra
    ORDER BY c.id_compra DESC, dc.id_detalle ASC, il.id_lote ASC, cc.id_caja_compra ASC;
END$$

DROP PROCEDURE IF EXISTS `sp_editar_compra`$$
CREATE PROCEDURE `sp_editar_compra`(
    IN p_id_compra INT, IN p_id_proveedor INT, IN p_id_comprobante INT, IN p_serie VARCHAR(20), IN p_correlativo VARCHAR(50),
    IN p_fecha_emision DATE, IN p_fecha_vencimiento DATE, IN p_id_pago INT, IN p_id_forma_pago INT,
    IN p_id_moneda INT, IN p_tipo_cambio DECIMAL(10,4), IN p_con_igv BOOLEAN, IN p_con_bonificacion BOOLEAN,
    IN p_con_traslado BOOLEAN, IN p_observacion TEXT, IN p_subtotal DECIMAL(12,2), IN p_igv DECIMAL(12,2),
    IN p_total DECIMAL(12,2), IN p_peso_total DECIMAL(12,3), IN p_costo_transporte DECIMAL(12,2)
)
BEGIN
    DECLARE v_fecha_pedido DATE; DECLARE v_fecha_entrega DATE; DECLARE v_hoy DATE;
    SET v_hoy = CURDATE();
    SELECT gt.fecha_pedido, gt.fecha_entrega INTO v_fecha_pedido, v_fecha_entrega FROM compra c INNER JOIN guia_transporte gt ON c.id_compra = gt.id_compra WHERE c.id_compra = p_id_compra;
    IF v_hoy NOT BETWEEN v_fecha_pedido AND v_fecha_entrega THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Edición fuera de rango de fechas.';
    ELSE
        UPDATE compra SET id_proveedor = p_id_proveedor, id_tipo_comprobante = p_id_comprobante, serie = p_serie, correlativo = p_correlativo, fecha_emision = p_fecha_emision, fecha_vencimiento = p_fecha_vencimiento, id_tipo_pago = p_id_pago, id_forma_pago = p_id_forma_pago, id_moneda = p_id_moneda, tipo_cambio = p_tipo_cambio, incluye_igv = p_con_igv, hay_bonificacion = p_con_bonificacion, hay_traslado = p_con_traslado, subtotal = p_subtotal, igv = p_igv, total = p_total, total_peso = p_peso_total, coste_transporte = p_costo_transporte, observacion = p_observacion WHERE id_compra = p_id_compra;
    END IF;
END$$

DROP PROCEDURE IF EXISTS `sp_editar_articulo_detalle`$$
CREATE PROCEDURE `sp_editar_articulo_detalle`(
    IN p_id_detalle INT, IN p_cantidad_nueva DECIMAL(12,2), IN p_precio_unitario DECIMAL(12,2), IN p_bonificacion DECIMAL(12,2),
    IN p_costo_unitario_transporte DECIMAL(12,2), IN p_costo_total_transporte DECIMAL(12,2), IN p_precio_descuento DECIMAL(12,2),
    IN p_igv_insumo DECIMAL(12,2), IN p_total DECIMAL(12,2), IN p_peso_total DECIMAL(12,3)
)
BEGIN
    DECLARE v_id_articulo INT; DECLARE v_cantidad_antigua DECIMAL(12,2); DECLARE v_diferencia_stock DECIMAL(12,2); DECLARE v_id_lote INT;
    START TRANSACTION;
    SELECT dc.id_articulo, dc.cantidad INTO v_id_articulo, v_cantidad_antigua FROM detalle_compra dc WHERE dc.id_detalle = p_id_detalle FOR UPDATE;
    IF v_id_articulo IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Detalle no encontrado.';
        ROLLBACK;
    ELSE
        IF v_cantidad_antigua != p_cantidad_nueva THEN
            SELECT id_lote INTO v_id_lote FROM inventario_lote WHERE id_detalle_compra = p_id_detalle;
            IF v_id_lote IS NULL THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Lote no encontrado.';
                ROLLBACK;
            END IF;
            SET v_diferencia_stock = p_cantidad_nueva - v_cantidad_antigua;
            UPDATE articulo SET cantidad = cantidad + v_diferencia_stock WHERE id = v_id_articulo;
            UPDATE inventario_lote SET cantidad_ingreso = p_cantidad_nueva, cantidad_disponible = cantidad_disponible + v_diferencia_stock WHERE id_lote = v_id_lote;
        END IF;
        UPDATE detalle_compra SET cantidad = p_cantidad_nueva, precio_unitario = p_precio_unitario, bonificacion = p_bonificacion, coste_unitario_transporte = p_costo_unitario_transporte, coste_total_transporte = p_costo_total_transporte, precio_con_descuento = p_precio_descuento, igv_insumo = p_igv_insumo, total = p_total, peso_total = p_peso_total WHERE id_detalle = p_id_detalle;
        COMMIT;
    END IF;
END$$

DROP PROCEDURE IF EXISTS `sp_actualizar_lote`$$
CREATE PROCEDURE `sp_actualizar_lote`(
    IN p_id_detalle_compra INT, IN p_codigo_lote_nuevo VARCHAR(50), IN p_fecha_vencimiento_nueva DATE
)
BEGIN
    UPDATE inventario_lote
    SET codigo_lote = p_codigo_lote_nuevo, fecha_vencimiento = p_fecha_vencimiento_nueva
    WHERE id_detalle_compra = p_id_detalle_compra;
END$$

DROP PROCEDURE IF EXISTS `sp_editar_caja`$$
CREATE PROCEDURE `sp_editar_caja`(
    IN p_id_caja_compra INT, IN p_nombre_caja VARCHAR(100), IN p_cantidad_cajas INT, IN p_costo_caja DECIMAL(12,2)
)
BEGIN
    UPDATE caja_compra
    SET nombre_caja = p_nombre_caja, cantidad = p_cantidad_cajas, costo_caja = p_costo_caja
    WHERE id_caja_compra = p_id_caja_compra;
END$$

DROP PROCEDURE IF EXISTS `sp_editar_articulo_en_caja`$$
CREATE PROCEDURE `sp_editar_articulo_en_caja`(IN p_id_detalle_caja_compra INT, IN p_cantidad_nueva DECIMAL(12,2))
BEGIN
    DECLARE v_id_articulo INT; DECLARE v_cantidad_antigua DECIMAL(12,2); DECLARE v_diferencia_stock DECIMAL(12,2);
    START TRANSACTION;
    SELECT dcc.id_articulo, dcc.cantidad INTO v_id_articulo, v_cantidad_antigua FROM detalle_caja_compra dcc WHERE dcc.id_detalle_caja_compra = p_id_detalle_caja_compra FOR UPDATE;
    IF v_id_articulo IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Detalle de caja no encontrado.';
        ROLLBACK;
    ELSE
        IF v_cantidad_antigua != p_cantidad_nueva THEN
            SET v_diferencia_stock = p_cantidad_nueva - v_cantidad_antigua;
            UPDATE articulo SET cantidad = cantidad + v_diferencia_stock WHERE id = v_id_articulo;
        END IF;
        UPDATE detalle_caja_compra SET cantidad = p_cantidad_nueva WHERE id_detalle_caja_compra = p_id_detalle_caja_compra;
        COMMIT;
    END IF;
END$$

DROP PROCEDURE IF EXISTS `sp_editar_guia_transporte`$$
CREATE PROCEDURE `sp_editar_guia_transporte`(
    IN p_id_compra INT, IN p_ruc_guia VARCHAR(20), IN p_razon_social VARCHAR(255), IN p_fecha_emision DATE,
    IN p_tipo_comprobante VARCHAR(50), IN p_serie VARCHAR(10), IN p_correlativo VARCHAR(20), IN p_ciudad VARCHAR(100),
    IN p_partida VARCHAR(255), IN p_llegada VARCHAR(255), IN p_serie_guia VARCHAR(10), IN p_correlativo_guia VARCHAR(20),
    IN p_costo_total_transporte DECIMAL(10, 2), IN p_peso DECIMAL(10, 2), IN p_fecha_pedido DATE, IN p_fecha_entrega DATE
)
BEGIN
    UPDATE guia_transporte SET ruc_guia = p_ruc_guia, razon_social_guia = p_razon_social, fecha_emision = p_fecha_emision, tipo_comprobante = p_tipo_comprobante, serie = p_serie, correlativo = p_correlativo, ciudad_traslado = p_ciudad, punto_partida = p_partida, punto_llegada = p_llegada, serie_guia_transporte = p_serie_guia, correlativo_guia_transporte = p_correlativo_guia, coste_total_transporte = p_costo_total_transporte, peso = p_peso, fecha_pedido = p_fecha_pedido, fecha_entrega = p_fecha_entrega
    WHERE id_compra = p_id_compra AND tipo_documento_ref = 'compra';
END$$

DROP PROCEDURE IF EXISTS `sp_consumir_stock_general_venta`$$
CREATE PROCEDURE `sp_consumir_stock_general_venta`(
    IN p_id_articulo INT, IN p_cantidad_a_consumir DECIMAL(12,2)
)
BEGIN
    DECLARE v_stock_actual INT;
    DECLARE v_cantidad_entera_consumir INT;

    SET v_cantidad_entera_consumir = CAST(p_cantidad_a_consumir AS UNSIGNED);

    IF p_cantidad_a_consumir != v_cantidad_entera_consumir THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: La cantidad a consumir en stock general debe ser un número entero para este artículo.';
    END IF;

    SELECT cantidad INTO v_stock_actual FROM articulo WHERE id = p_id_articulo;

    IF v_stock_actual < v_cantidad_entera_consumir THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Stock insuficiente en inventario general.';
    ELSE
        UPDATE articulo SET cantidad = cantidad - v_cantidad_entera_consumir WHERE id = p_id_articulo;
    END IF;
END$$

DROP PROCEDURE IF EXISTS `sp_consumir_stock_lote_venta`$$
CREATE PROCEDURE `sp_consumir_stock_lote_venta`(
    IN p_id_detalle_venta INT, IN p_id_articulo INT, IN p_cantidad_a_consumir DECIMAL(12,2)
)
BEGIN
    DECLARE v_cantidad_restante DECIMAL(12,2); DECLARE v_id_lote_actual INT; DECLARE v_disponible_lote DECIMAL(12,2);
    DECLARE v_cantidad_consumida DECIMAL(12,2); DECLARE finished BOOLEAN DEFAULT FALSE;
    DECLARE cur_lotes CURSOR FOR
        SELECT id_lote, cantidad_disponible
        FROM inventario_lote
        WHERE id_articulo = p_id_articulo AND cantidad_disponible > 0
        ORDER BY fecha_vencimiento IS NULL ASC, fecha_vencimiento ASC, fecha_ingreso ASC;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET finished = TRUE;

    SET v_cantidad_restante = p_cantidad_a_consumir;
    OPEN cur_lotes;

    lote_loop: LOOP
        FETCH cur_lotes INTO v_id_lote_actual, v_disponible_lote;
        IF finished OR v_cantidad_restante <= 0 THEN LEAVE lote_loop; END IF;

        SET v_cantidad_consumida = LEAST(v_cantidad_restante, v_disponible_lote);
        UPDATE inventario_lote SET cantidad_disponible = cantidad_disponible - v_cantidad_consumida WHERE id_lote = v_id_lote_actual;
        INSERT INTO lote_venta (id_detalle_venta, id_lote, cantidad) VALUES (p_id_detalle_venta, v_id_lote_actual, v_cantidad_consumida);
        SET v_cantidad_restante = v_cantidad_restante - v_cantidad_consumida;
    END LOOP;
    CLOSE cur_lotes;

    IF v_cantidad_restante > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Stock insuficiente en lotes disponibles.';
    END IF;

    IF v_cantidad_restante = 0 AND MOD(p_cantidad_a_consumir, 1) = 0 THEN
        UPDATE articulo SET cantidad = cantidad - CAST(p_cantidad_a_consumir AS UNSIGNED) WHERE id = p_id_articulo;
    ELSEIF v_cantidad_restante = 0 AND MOD(p_cantidad_a_consumir, 1) != 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: La cantidad consumida de lotes no fue un número entero, lo cual es requerido para actualizar el stock general del artículo.';
    END IF;
END$$

DROP PROCEDURE IF EXISTS `sp_gestionar_consumo_stock_venta`$$
CREATE PROCEDURE `sp_gestionar_consumo_stock_venta`(
    IN p_id_detalle_venta INT, IN p_id_articulo INT, IN p_cantidad_a_consumir DECIMAL(12,2)
)
BEGIN
    DECLARE v_usa_lotes BOOLEAN;

    SELECT EXISTS (
        SELECT 1
        FROM inventario_lote
        WHERE id_articulo = p_id_articulo AND cantidad_disponible > 0
    ) INTO v_usa_lotes;

    IF v_usa_lotes THEN
        IF MOD(p_cantidad_a_consumir, 1) != 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: No se pueden consumir cantidades decimales si el artículo tiene stock entero y se gestiona por lotes.';
        END IF;
        CALL `sp_consumir_stock_lote_venta`(p_id_detalle_venta, p_id_articulo, p_cantidad_a_consumir);
    ELSE
        CALL `sp_consumir_stock_general_venta`(p_id_articulo, p_cantidad_a_consumir);
    END IF;
END$$

DROP PROCEDURE IF EXISTS `sp_registrar_venta`$$
CREATE PROCEDURE `sp_registrar_venta`(
    IN p_id_cliente INT, IN p_id_tipo_comprobante INT, IN p_serie VARCHAR(20), IN p_correlativo VARCHAR(50),
    IN p_id_moneda INT, IN p_fecha_emision DATE,
    IN p_fecha_vencimiento DATE, IN p_id_tipo_pago INT, IN p_estado_venta VARCHAR(50),
    IN p_tipo_descuento ENUM('global', 'item'), IN p_aplica_igv BOOLEAN, IN p_observaciones TEXT,
    IN p_subtotal DECIMAL(12,2), IN p_igv DECIMAL(12,2), IN p_descuento_total DECIMAL(12,2),
    IN p_total_final DECIMAL(12,2), IN p_total_peso DECIMAL(12,3), IN p_hay_traslado BOOLEAN,
    OUT p_id_venta INT
)
BEGIN
    INSERT INTO venta(id_cliente, id_tipo_comprobante, serie, correlativo, id_moneda, fecha_emision, fecha_vencimiento, id_tipo_pago, estado_venta, tipo_descuento, aplica_igv, observaciones, subtotal, igv, descuento_total, total_final, total_peso, hay_traslado)
    VALUES (p_id_cliente, p_id_tipo_comprobante, p_serie, p_correlativo, p_id_moneda, p_fecha_emision, p_fecha_vencimiento, p_id_tipo_pago, p_estado_venta, p_tipo_descuento, p_aplica_igv, p_observaciones, p_subtotal, p_igv, p_descuento_total, p_total_final, p_total_peso, p_hay_traslado);
    SET p_id_venta = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_detalle_venta`$$
CREATE PROCEDURE `sp_agregar_detalle_venta`(
    IN p_id_venta INT, IN p_id_articulo INT, IN p_id_unidad INT, IN p_descripcion VARCHAR(255),
    IN p_cantidad DECIMAL(12,2),
    IN p_peso_unitario DECIMAL(10,3), IN p_precio_unitario DECIMAL(12,2), IN p_descuento_monto DECIMAL(12,2),
    IN p_subtotal DECIMAL(12,2), IN p_total DECIMAL(12,2),
    OUT p_id_detalle_venta INT
)
BEGIN
    INSERT INTO detalle_venta(id_venta, id_articulo, id_unidad, descripcion, cantidad, peso_unitario, precio_unitario, descuento_monto, subtotal, total)
    VALUES (p_id_venta, p_id_articulo, p_id_unidad, p_descripcion, p_cantidad, p_peso_unitario, p_precio_unitario, p_descuento_monto, p_subtotal, p_total);
    SET p_id_detalle_venta = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_descuento_global_venta`$$
CREATE PROCEDURE `sp_agregar_descuento_global_venta`(
    IN p_id_venta INT, IN p_motivo VARCHAR(255),
    IN p_tipo_valor ENUM('porcentaje', 'soles'), IN p_valor DECIMAL(12,2), IN p_tasa_igv DECIMAL(5,2)
)
BEGIN
    DECLARE v_tasa_igv_default DECIMAL(5,2);
    SET v_tasa_igv_default = IFNULL(p_tasa_igv, 0.18);

    INSERT INTO descuento (id_venta, motivo, tipo_aplicacion, tipo_valor, valor, tasa_igv)
    VALUES (p_id_venta, p_motivo, 'global', p_tipo_valor, p_valor, v_tasa_igv_default);
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_descuento_item_venta`$$
CREATE PROCEDURE `sp_agregar_descuento_item_venta`(
    IN p_id_detalle_venta INT, IN p_motivo VARCHAR(255),
    IN p_tipo_valor ENUM('porcentaje', 'soles'), IN p_valor DECIMAL(12,2), IN p_tasa_igv DECIMAL(5,2)
)
BEGIN
    DECLARE v_tasa_igv_default DECIMAL(5,2);
    SET v_tasa_igv_default = IFNULL(p_tasa_igv, 0.18);

    INSERT INTO descuento (id_detalle_venta, motivo, tipo_aplicacion, tipo_valor, valor, tasa_igv)
    VALUES (p_id_detalle_venta, p_motivo, 'item', p_tipo_valor, p_valor, v_tasa_igv_default);
END$$

DROP PROCEDURE IF EXISTS `sp_registrar_guia_transporte_venta`$$
CREATE PROCEDURE `sp_registrar_guia_transporte_venta`(
    IN p_id_venta INT, IN p_modalidad_transporte ENUM('publico', 'privado'), IN p_peso DECIMAL(12,3),
    IN p_ruc_empresa VARCHAR(20), IN p_razon_social_empresa VARCHAR(255), IN p_marca_vehiculo VARCHAR(100),
    IN p_dni_conductor VARCHAR(20), IN p_nombre_conductor VARCHAR(255), IN p_punto_partida VARCHAR(255),
    IN p_punto_llegada VARCHAR(255), IN p_fecha_traslado DATE, IN p_observaciones TEXT,
    IN p_conformidad_nombre VARCHAR(255), IN p_conformidad_dni VARCHAR(20)
)
BEGIN
    INSERT INTO guia_transporte (id_venta, tipo_documento_ref, peso, fecha_traslado, observaciones, modalidad_transporte, ruc_empresa, razon_social_empresa, marca_vehiculo, dni_conductor, nombre_conductor, punto_partida, punto_llegada)
    VALUES (p_id_venta, 'venta', p_peso, p_fecha_traslado, p_observaciones, p_modalidad_transporte, p_ruc_empresa, p_razon_social_empresa, p_marca_vehiculo, p_dni_conductor, p_nombre_conductor, p_punto_partida, p_punto_llegada);

    INSERT INTO conformidad_cliente (id_venta, nombre_cliente_confirma, dni_cliente_confirma, tipo_entrega)
    VALUES (p_id_venta, p_conformidad_nombre, p_conformidad_dni, 'remision');
END$$

DROP PROCEDURE IF EXISTS `sp_registrar_conformidad_tienda`$$
CREATE PROCEDURE `sp_registrar_conformidad_tienda`(
    IN p_id_venta INT, IN p_nombre_cliente_confirma VARCHAR(255), IN p_dni_cliente_confirma VARCHAR(20)
)
BEGIN
    INSERT INTO conformidad_cliente (id_venta, nombre_cliente_confirma, dni_cliente_confirma, tipo_entrega)
    VALUES (p_id_venta, p_nombre_cliente_confirma, p_dni_cliente_confirma, 'tienda');
END$$

DROP PROCEDURE IF EXISTS `sp_listar_ventas_final`$$
CREATE PROCEDURE `sp_listar_ventas_final`()
BEGIN
    SELECT
        v.id_venta, v.serie, v.correlativo, v.fecha_emision, v.fecha_vencimiento, v.estado_venta, v.tipo_descuento AS venta_tipo_descuento, v.aplica_igv, v.observaciones AS venta_observaciones, v.subtotal AS venta_subtotal, v.igv AS venta_igv, v.descuento_total AS venta_descuento_total, v.total_final, v.total_peso AS venta_total_peso, v.hay_traslado,
        tc.nombre AS tipo_comprobante,
        m.nombre AS moneda_nombre, m.simbolo AS moneda_simbolo,
        tp.nombre AS tipo_pago_nombre,
        c.id AS id_cliente, c.razonSocial AS cliente_razon_social, c.n_documento AS cliente_documento, c.direccion AS cliente_direccion, c.telefono AS cliente_telefono, c.correo AS cliente_correo,
        dv.id_detalle AS id_detalle_venta, dv.descripcion AS detalle_descripcion, dv.cantidad AS detalle_cantidad, dv.peso_unitario AS detalle_peso_unitario, dv.precio_unitario AS detalle_precio_unitario, dv.descuento_monto AS detalle_descuento_monto, dv.subtotal AS detalle_subtotal, dv.total AS detalle_total,
        a.id AS id_articulo, a.codigo AS articulo_codigo,
        u.nombre AS unidad_medida_nombre,
        d.id_descuento, d.motivo AS descuento_motivo, d.tipo_aplicacion AS descuento_aplicacion, d.tipo_valor AS descuento_tipo_valor, d.valor AS descuento_valor, d.tasa_igv AS descuento_tasa_igv,
        lv.id_lote_venta,
        il.id_lote, il.codigo_lote, il.fecha_vencimiento AS lote_fecha_vencimiento,
        lv.cantidad AS lote_cantidad_consumida,
        gt.id_guia, gt.fecha_traslado, gt.modalidad_transporte, gt.ruc_empresa AS transporte_ruc_empresa, gt.razon_social_empresa AS transporte_razon_social, gt.dni_conductor AS transporte_dni_conductor, gt.nombre_conductor AS transporte_nombre_conductor, gt.punto_partida, gt.punto_llegada,
        cc.nombre_cliente_confirma, cc.dni_cliente_confirma, cc.tipo_entrega
    FROM venta v
    INNER JOIN cliente c ON v.id_cliente = c.id
    INNER JOIN tipo_comprobante tc ON v.id_tipo_comprobante = tc.id
    INNER JOIN moneda m ON v.id_moneda = m.id_moneda
    LEFT JOIN tipo_pago tp ON v.id_tipo_pago = tp.id
    LEFT JOIN detalle_venta dv ON v.id_venta = dv.id_venta
    LEFT JOIN articulo a ON dv.id_articulo = a.id
    LEFT JOIN unidad_medida u ON dv.id_unidad = u.id_unidad
    LEFT JOIN descuento d ON v.id_venta = d.id_venta OR dv.id_detalle = d.id_detalle_venta
    LEFT JOIN lote_venta lv ON dv.id_detalle = lv.id_detalle_venta
    LEFT JOIN inventario_lote il ON lv.id_lote = il.id_lote
    LEFT JOIN guia_transporte gt ON v.id_venta = gt.id_venta AND gt.tipo_documento_ref = 'venta'
    LEFT JOIN conformidad_cliente cc ON v.id_venta = cc.id_venta
    ORDER BY
        v.id_venta DESC, dv.id_detalle ASC;
END$$

DROP PROCEDURE IF EXISTS `sp_registrar_gasto`$$
CREATE PROCEDURE `sp_registrar_gasto`(
    IN p_id_proveedor INT, IN p_id_tipo_gasto INT, IN p_motivo VARCHAR(100), IN p_placa VARCHAR(50),
    IN p_fecha DATE, IN p_id_moneda INT, IN p_subtotal DECIMAL(12,2), IN p_igv DECIMAL(12,2),
    IN p_total DECIMAL(12,2), IN p_observacion TEXT, IN p_total_peso DECIMAL(12,3),
    OUT p_id_gasto INT
)
BEGIN
    INSERT INTO gasto (id_proveedor, id_tipo_gasto, motivo, placa, fecha, id_moneda, subtotal, igv, total, observacion, total_peso)
    VALUES (p_id_proveedor, p_id_tipo_gasto, p_motivo, p_placa, p_fecha, p_id_moneda, p_subtotal, p_igv, p_total, p_observacion, p_total_peso);
    SET p_id_gasto = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_detalle_gasto`$$
CREATE PROCEDURE `sp_agregar_detalle_gasto`(
    IN p_id_gasto INT, IN p_descripcion VARCHAR(255), IN p_cantidad DECIMAL(12,2), IN p_id_unidad INT,
    IN p_peso_unitario DECIMAL(10,3), IN p_precio_unitario DECIMAL(12,2), IN p_subtotal DECIMAL(12,2),
    IN p_igv DECIMAL(12,2), IN p_total DECIMAL(12,2)
)
BEGIN
    INSERT INTO detalle_gasto (id_gasto, descripcion, cantidad, id_unidad, peso_unitario, precio_unitario, subtotal, igv, total)
    VALUES (p_id_gasto, p_descripcion, p_cantidad, p_id_unidad, p_peso_unitario, p_precio_unitario, p_subtotal, p_igv, p_total);
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_documento_gasto`$$
CREATE PROCEDURE `sp_agregar_documento_gasto`(
    IN p_id_gasto INT, IN p_id_tipo_comprobante INT, IN p_serie VARCHAR(20),
    IN p_correlativo VARCHAR(50), IN p_fecha_emision DATE
)
BEGIN
    INSERT INTO documento_gasto (id_gasto, id_tipo_comprobante, serie, correlativo, fecha_emision)
    VALUES (p_id_gasto, p_id_tipo_comprobante, p_serie, p_correlativo, p_fecha_emision);
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_descuento_global`$$
CREATE PROCEDURE `sp_agregar_descuento_global`(
    IN p_id_compra INT, IN p_id_venta INT, IN p_motivo VARCHAR(255),
    IN p_tipo_valor ENUM('porcentaje', 'soles'), IN p_valor DECIMAL(12,2), IN p_tasa_igv DECIMAL(5,2)
)
BEGIN
    INSERT INTO descuento (id_compra, id_venta, motivo, tipo_aplicacion, tipo_valor, valor, tasa_igv)
    VALUES (p_id_compra, p_id_venta, p_motivo, 'global', p_tipo_valor, p_valor, p_tasa_igv);
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_descuento_item`$$
CREATE PROCEDURE `sp_agregar_descuento_item`(
    IN p_id_detalle_compra INT, IN p_id_detalle_venta INT, IN p_motivo VARCHAR(255),
    IN p_tipo_valor ENUM('porcentaje', 'soles'), IN p_valor DECIMAL(12,2), IN p_tasa_igv DECIMAL(5,2)
)
BEGIN
    INSERT INTO descuento (id_detalle_compra, id_detalle_venta, motivo, tipo_aplicacion, tipo_valor, valor, tasa_igv)
    VALUES (p_id_detalle_compra, p_id_detalle_venta, p_motivo, 'item', p_tipo_valor, p_valor, p_tasa_igv);
END$$

DELIMITER ;