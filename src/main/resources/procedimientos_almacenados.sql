use bd_maxiperu;

DELIMITER $$

-- ******************************************************
-- 1. GESTIÓN DE ARTÍCULOS
-- ******************************************************

DROP PROCEDURE IF EXISTS `sp_agregar_articulo`$$
CREATE PROCEDURE `sp_agregar_articulo`(
    IN p_codigo VARCHAR(50), IN p_descripcion VARCHAR(255), IN p_cantidad INT, IN p_precio_unitario DECIMAL(12,2),
    IN p_peso_unitario DECIMAL(10,3), IN p_densidad DECIMAL(10,3), IN p_aroma VARCHAR(50), IN p_color VARCHAR(50),
    IN p_id_marca INT, IN p_id_categoria INT, IN p_id_unidad INT, IN p_id_tipo_articulo INT
)
BEGIN
    INSERT INTO articulo(
        codigo, descripcion, cantidad, precio_unitario, peso_unitario, densidad,
        aroma, color, id_marca, id_categoria, id_unidad, id_tipo_articulo
    ) VALUES (
        p_codigo, p_descripcion, p_cantidad, p_precio_unitario, p_peso_unitario, p_densidad,
        p_aroma, p_color, p_id_marca, p_id_categoria, p_id_unidad, p_id_tipo_articulo
    );
END$$

DROP PROCEDURE IF EXISTS `sp_actualizar_articulo`$$
CREATE PROCEDURE `sp_actualizar_articulo`(
    IN p_id INT, IN p_descripcion VARCHAR(255), IN p_cantidad INT, IN p_precio_unitario DECIMAL(12,2),
    IN p_peso_unitario DECIMAL(10,3), IN p_densidad DECIMAL(10,3), IN p_aroma VARCHAR(50), IN p_color VARCHAR(50),
    IN p_id_marca INT, IN p_id_categoria INT, IN p_id_unidad INT, IN p_id_tipo_articulo INT
)
BEGIN
    UPDATE articulo
    SET
        descripcion = p_descripcion, cantidad = p_cantidad, precio_unitario = p_precio_unitario,
        peso_unitario = p_peso_unitario, densidad = p_densidad, aroma = p_aroma,
        color = p_color, id_marca = p_id_marca, id_categoria = p_id_categoria,
        id_unidad = p_id_unidad, id_tipo_articulo = p_id_tipo_articulo
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
        a.id, a.codigo, a.descripcion, a.cantidad, a.precio_unitario, a.peso_unitario, a.densidad, a.aroma,
        a.color, a.id_marca, m.nombre AS marca_nombre, a.id_categoria, c.nombre AS categoria_nombre,
        a.id_unidad, u.nombre AS unidad_nombre, a.id_tipo_articulo, t.nombre AS tipo_nombre
    FROM articulo a
    LEFT JOIN marca m ON a.id_marca = m.id_marca
    LEFT JOIN categoria c ON a.id_categoria = c.id_categoria
    LEFT JOIN unidad_medida u ON a.id_unidad = u.id_unidad
    LEFT JOIN tipo_articulo t ON a.id_tipo_articulo = t.id;
END$$

DROP PROCEDURE IF EXISTS `sp_buscar_articulos_para_compra`$$
CREATE PROCEDURE `sp_buscar_articulos_para_compra`(
    IN p_busqueda VARCHAR(100)
)
BEGIN
    SELECT
        a.id, a.codigo, a.descripcion, a.cantidad,
        a.precio_unitario, a.peso_unitario, a.aroma, a.color
    FROM articulo a
    WHERE (a.codigo LIKE CONCAT('%', p_busqueda, '%') OR a.descripcion LIKE CONCAT('%', p_busqueda, '%'))
      AND a.id_tipo_articulo IN (2, 3, 4);
END$$

DROP PROCEDURE IF EXISTS `sp_buscar_articulos_para_venta`$$
CREATE PROCEDURE `sp_buscar_articulos_para_venta`(
    IN p_busqueda VARCHAR(100)
)
BEGIN
    SELECT
        a.id, a.codigo, a.descripcion, a.cantidad,
        a.precio_unitario, a.peso_unitario, a.aroma, a.color
    FROM articulo a
    WHERE (a.codigo LIKE CONCAT('%', p_busqueda, '%') OR a.descripcion LIKE CONCAT('%', p_busqueda, '%'))
      AND a.id_tipo_articulo IN (1, 3);
END$$

DROP PROCEDURE IF EXISTS `sp_buscar_insumos`$$
CREATE PROCEDURE `sp_buscar_insumos`(
    IN p_busqueda VARCHAR(100)
)
BEGIN
    SELECT
        a.id, a.codigo, a.descripcion, a.cantidad,
        a.precio_unitario, a.peso_unitario, a.aroma, a.color
    FROM articulo a
    WHERE (a.codigo LIKE CONCAT('%', p_busqueda, '%') OR a.descripcion LIKE CONCAT('%', p_busqueda, '%'))
      AND a.id_tipo_articulo = 2;
END$$

-- ******************************************************
-- 2. GESTIÓN DE CLIENTES
-- ******************************************************

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
    SET
        tipoDocumento = p_tipo_documento, n_documento = p_numero_documento, razonSocial = p_razon_social,
        direccion = p_direccion, telefono = p_telefono, correo = p_correo
    WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS `sp_eliminar_cliente`$$
CREATE PROCEDURE `sp_eliminar_cliente`(
    IN p_id INT
)
BEGIN
    DELETE FROM cliente
    WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS `sp_listar_clientes`$$
CREATE PROCEDURE `sp_listar_clientes`()
BEGIN
    SELECT
        id, tipoDocumento, n_documento, razonSocial, direccion, telefono, correo
    FROM cliente
    ORDER BY razonSocial ASC;
END$$

DROP PROCEDURE IF EXISTS `sp_buscar_cliente`$$
CREATE PROCEDURE `sp_buscar_cliente`(
    IN p_busqueda VARCHAR(100)
)
BEGIN
    SELECT
        id, tipoDocumento, n_documento, razonSocial, direccion, telefono, correo
    FROM cliente
    WHERE n_documento LIKE CONCAT('%', p_busqueda, '%')
        OR razonSocial LIKE CONCAT('%', p_busqueda, '%');
END$$

-- ******************************************************
-- 3. GESTIÓN DE PROVEEDORES
-- ******************************************************

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
    SET
        ruc = p_ruc, razonSocial = p_razon_social, direccion = p_direccion,
        telefono = p_telefono, correo = p_correo, ciudad = p_ciudad
    WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS `sp_eliminar_proveedor`$$
CREATE PROCEDURE `sp_eliminar_proveedor`(
    IN p_id INT
)
BEGIN
    DELETE FROM proveedor
    WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS `sp_listar_proveedores`$$
CREATE PROCEDURE `sp_listar_proveedores`()
BEGIN
    SELECT
        id, ruc, razonSocial, direccion, telefono, correo, ciudad
    FROM proveedor
    ORDER BY razonSocial ASC;
END$$

DROP PROCEDURE IF EXISTS `sp_buscar_proveedor`$$
CREATE PROCEDURE `sp_buscar_proveedor`(
    IN p_busqueda VARCHAR(100)
)
BEGIN
    SELECT
        id, ruc, razonSocial, direccion, telefono, correo, ciudad
    FROM proveedor
    WHERE ruc LIKE CONCAT('%', p_busqueda, '%')
        OR razonSocial LIKE CONCAT('%', p_busqueda, '%');
END$$

-- ******************************************************
-- 4. GESTIÓN DE COMPRAS
-- ******************************************************

DROP PROCEDURE IF EXISTS `sp_registrar_compra`$$
CREATE PROCEDURE `sp_registrar_compra`(
    IN p_id_proveedor INT, IN p_id_tipo_comprobante INT, IN p_serie VARCHAR(20), IN p_correlativo VARCHAR(50),
    IN p_fecha_emision DATE, IN p_fecha_vencimiento DATE, IN p_id_tipo_pago INT, IN p_id_forma_pago INT,
    IN p_id_moneda INT, IN p_tipo_cambio DECIMAL(10,4), IN p_incluye_igv BOOLEAN, IN p_hay_bonificacion BOOLEAN,
    IN p_hay_traslado BOOLEAN, IN p_observacion TEXT, IN p_subtotal DECIMAL(12,2), IN p_igv DECIMAL(12,2),
    IN p_total DECIMAL(12,2), IN p_total_peso DECIMAL(12,3), IN p_coste_transporte DECIMAL(12,2),
    OUT p_id_compra INT
)
BEGIN
    INSERT INTO compra(
        id_proveedor, id_tipo_comprobante, serie, correlativo, fecha_emision,
        fecha_vencimiento, id_tipo_pago, id_forma_pago, id_moneda, tipo_cambio,
        incluye_igv, hay_bonificacion, hay_traslado, subtotal,
        igv, total, total_peso, coste_transporte, observacion
    ) VALUES (
        p_id_proveedor, p_id_tipo_comprobante, p_serie, p_correlativo, p_fecha_emision,
        p_fecha_vencimiento, p_id_tipo_pago, p_id_forma_pago, p_id_moneda, p_tipo_cambio,
        p_incluye_igv, p_hay_bonificacion, p_hay_traslado, p_subtotal,
        p_igv, p_total, p_total_peso, p_coste_transporte, p_observacion
    );
    SET p_id_compra = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_detalle_compra`$$
CREATE PROCEDURE `sp_agregar_detalle_compra`(
    IN p_id_compra INT, IN p_id_articulo INT, IN p_cantidad DECIMAL(12,2), IN p_precio_unitario DECIMAL(12,2),
    IN p_bonificacion DECIMAL(12,2), IN p_coste_unitario_transporte DECIMAL(12,2),
    IN p_coste_total_transporte DECIMAL(12,2), IN p_precio_con_descuento DECIMAL(12,2),
    IN p_igv_insumo DECIMAL(12,2), IN p_total DECIMAL(12,2), IN p_peso_total DECIMAL(12,3),
    OUT p_id_detalle INT
)
BEGIN
    INSERT INTO detalle_compra(
        id_compra, id_articulo, cantidad, precio_unitario, bonificacion,
        coste_unitario_transporte, coste_total_transporte,
        precio_con_descuento, igv_insumo, total, peso_total
    ) VALUES (
        p_id_compra, p_id_articulo, p_cantidad, p_precio_unitario, p_bonificacion,
        p_coste_unitario_transporte, p_coste_total_transporte,
        p_precio_con_descuento, p_igv_insumo, p_total, p_peso_total
    );

    SET p_id_detalle = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_registrar_lote_compra`$$
CREATE PROCEDURE `sp_registrar_lote_compra`(
    IN p_id_detalle_compra INT,
    IN p_id_articulo INT,
    IN p_numero_lote VARCHAR(50),
    IN p_fecha_vencimiento DATE,
    IN p_cantidad_lote DECIMAL(12,2)
)
BEGIN
    INSERT INTO inventario_lote(
        id_articulo, id_detalle_compra, numero_lote, fecha_vencimiento,
        cantidad_ingreso, cantidad_disponible
    ) VALUES (
        p_id_articulo, p_id_detalle_compra, p_numero_lote, p_fecha_vencimiento,
        p_cantidad_lote, p_cantidad_lote
    );

    UPDATE articulo SET cantidad = cantidad + p_cantidad_lote WHERE id = p_id_articulo;
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_caja_compra`$$
CREATE PROCEDURE `sp_agregar_caja_compra`(
    IN p_id_compra INT, IN p_nombre_caja VARCHAR(100), IN p_cantidad INT, IN p_costo_caja DECIMAL(12,2),
    OUT p_id_caja_compra INT
)
BEGIN
    INSERT INTO caja_compra (id_compra, nombre_caja, cantidad, costo_caja)
    VALUES (p_id_compra, p_nombre_caja, p_cantidad, p_costo_caja);
    SET p_id_caja_compra = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_detalle_caja_compra`$$
CREATE PROCEDURE `sp_agregar_detalle_caja_compra`(
    IN p_id_caja_compra INT, IN p_id_articulo INT, IN p_cantidad DECIMAL(12,2)
)
BEGIN
    INSERT INTO detalle_caja_compra (id_caja_compra, id_articulo, cantidad)
    VALUES (p_id_caja_compra, p_id_articulo, p_cantidad);

    UPDATE articulo SET cantidad = cantidad + p_cantidad WHERE id = p_id_articulo;
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
    IN p_id_compra INT, IN p_ruc_guia VARCHAR(20), IN p_razon_social_guia VARCHAR(255), IN p_fecha_emision DATE,
    IN p_tipo_comprobante VARCHAR(50), IN p_serie VARCHAR(10), IN p_correlativo VARCHAR(20),
    IN p_ciudad_traslado VARCHAR(100), IN p_punto_partida VARCHAR(255), IN p_punto_llegada VARCHAR(255),
    IN p_serie_guia_transporte VARCHAR(10), IN p_correlativo_guia_transporte VARCHAR(20),
    IN p_coste_total_transporte DECIMAL(10, 2), IN p_peso DECIMAL(10, 2), IN p_fecha_pedido DATE,
    IN p_fecha_entrega DATE
)
BEGIN
    INSERT INTO guia_transporte (
        id_compra, tipo_documento_ref, ruc_guia, razon_social_guia, fecha_emision, tipo_comprobante,
        serie, correlativo, ciudad_traslado, punto_partida, punto_llegada,
        serie_guia_transporte, correlativo_guia_transporte, coste_total_transporte,
        peso, fecha_pedido, fecha_entrega
    ) VALUES (
        p_id_compra, 'compra', p_ruc_guia, p_razon_social_guia, p_fecha_emision, p_tipo_comprobante,
        p_serie, p_correlativo, p_ciudad_traslado, p_punto_partida, p_punto_llegada,
        p_serie_guia_transporte, p_correlativo_guia_transporte, p_coste_total_transporte,
        p_peso, p_fecha_pedido, p_fecha_entrega
    );
END$$

DROP PROCEDURE IF EXISTS `sp_listar_compras_final`$$
CREATE PROCEDURE `sp_listar_compras_final`()
BEGIN
    SELECT
        c.id_compra, c.fecha_emision, c.fecha_vencimiento, tc.nombre AS tipo_comprobante, c.serie, c.correlativo,
        mo.nombre AS moneda, c.tipo_cambio, c.subtotal, c.igv, c.total, c.total_peso, c.coste_transporte,
        c.observacion, p.id AS id_proveedor, p.ruc, p.razonSocial AS RAZON_FINAL, p.direccion, p.telefono, -- <--- CAMBIO AQUÍ
        p.correo, p.ciudad, dc.id_detalle, dc.id_articulo, a.codigo AS codigo_articulo,
        a.descripcion AS descripcion_articulo, dc.cantidad, dc.precio_unitario, dc.coste_unitario_transporte,
        dc.coste_total_transporte, dc.precio_con_descuento, dc.igv_insumo, dc.total AS total_detalle,
        dc.peso_total, gt.id_guia, gt.ruc_guia, gt.razon_social_guia, gt.fecha_emision AS fecha_emision_guia,
        gt.tipo_comprobante AS tipo_comprobante_guia, gt.serie AS serie_guia, gt.correlativo AS correlativo_guia,
        gt.serie_guia_transporte, gt.correlativo_guia_transporte, gt.ciudad_traslado,
        gt.coste_total_transporte AS coste_transporte_guia, gt.peso AS peso_guia, gt.fecha_pedido,
        gt.fecha_entrega, rc.id_referencia, rc.numero_cotizacion, rc.numero_pedido
    FROM compra c
    INNER JOIN proveedor p ON c.id_proveedor = p.id
    INNER JOIN tipo_comprobante tc ON c.id_tipo_comprobante = tc.id
    INNER JOIN moneda mo ON c.id_moneda = mo.id_moneda
    LEFT JOIN detalle_compra dc ON c.id_compra = dc.id_compra
    LEFT JOIN articulo a ON dc.id_articulo = a.id
    LEFT JOIN guia_transporte gt ON c.id_compra = gt.id_compra
    LEFT JOIN referencia_compra rc ON c.id_compra = rc.id_compra
    ORDER BY c.id_compra DESC, dc.id_detalle ASC;
END$$

-- 1. PROCEDIMIENTO PARA EDITAR LA COMPRA PRINCIPAL
DROP PROCEDURE IF EXISTS `sp_editar_compra`$$
CREATE PROCEDURE `sp_editar_compra`(IN p_id_compra INT, IN p_id_proveedor INT, IN p_id_comprobante INT, IN p_serie VARCHAR(20), IN p_correlativo VARCHAR(50), IN p_fecha_emision DATE, IN p_fecha_vencimiento DATE, IN p_id_pago INT, IN p_id_forma_pago INT, IN p_id_moneda INT, IN p_tipo_cambio DECIMAL(10,4), IN p_con_igv BOOLEAN, IN p_con_bonificacion BOOLEAN, IN p_con_traslado BOOLEAN, IN p_observacion TEXT, IN p_subtotal DECIMAL(12,2), IN p_igv DECIMAL(12,2), IN p_total DECIMAL(12,2), IN p_peso_total DECIMAL(12,3), IN p_costo_transporte DECIMAL(12,2))
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
CREATE PROCEDURE `sp_editar_articulo_detalle`(IN p_id_detalle INT, IN p_cantidad_nueva DECIMAL(12,2), IN p_precio_unitario DECIMAL(12,2), IN p_bonificacion DECIMAL(12,2), IN p_costo_unitario_transporte DECIMAL(12,2), IN p_costo_total_transporte DECIMAL(12,2), IN p_precio_descuento DECIMAL(12,2), IN p_igv_insumo DECIMAL(12,2), IN p_total DECIMAL(12,2), IN p_peso_total DECIMAL(12,3))
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

-- 3. PROCEDIMIENTO PARA EDITAR INFO DEL LOTE (NO CANTIDAD)
DROP PROCEDURE IF EXISTS `sp_actualizar_lote`$$
CREATE PROCEDURE `sp_actualizar_lote`(
    IN p_id_detalle_compra INT, IN p_numero_lote_nuevo VARCHAR(50), IN p_fecha_vencimiento_nueva DATE
)
BEGIN
    UPDATE inventario_lote
    SET numero_lote = p_numero_lote_nuevo, fecha_vencimiento = p_fecha_vencimiento_nueva
    WHERE id_detalle_compra = p_id_detalle_compra;
END$$

-- 4. PROCEDIMIENTO PARA EDITAR LA CABECERA DE LA CAJA
DROP PROCEDURE IF EXISTS `sp_editar_caja`$$
CREATE PROCEDURE `sp_editar_caja`(
    IN p_id_caja_compra INT, IN p_nombre_caja VARCHAR(100), IN p_cantidad_cajas INT, IN p_costo_caja DECIMAL(12,2)
)
BEGIN
    UPDATE caja_compra
    SET nombre_caja = p_nombre_caja, cantidad = p_cantidad_cajas, costo_caja = p_costo_caja
    WHERE id_caja_compra = p_id_caja_compra;
END$$

-- 5. PROCEDIMIENTO PARA EDITAR ARTÍCULO EN DETALLE DE CAJA Y STOCK
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

-- 6. PROCEDIMIENTO PARA EDITAR GUÍA DE TRANSPORTE (FECHAS CLAVE)
DROP PROCEDURE IF EXISTS `sp_editar_guia_transporte`$$
CREATE PROCEDURE `sp_editar_guia_transporte`(
    IN p_id_compra INT, IN p_ruc_guia VARCHAR(20), IN p_razon_social VARCHAR(255), IN p_fecha_emision DATE,
    IN p_tipo_comprobante VARCHAR(50), IN p_serie VARCHAR(10), IN p_correlativo VARCHAR(20), IN p_ciudad VARCHAR(100),
    IN p_partida VARCHAR(255), IN p_llegada VARCHAR(255), IN p_serie_guia VARCHAR(10), IN p_correlativo_guia VARCHAR(20),
    IN p_costo_total_transporte DECIMAL(10, 2), IN p_peso DECIMAL(10, 2), IN p_fecha_pedido DATE, IN p_fecha_entrega DATE
)
BEGIN
    UPDATE guia_transporte SET
        ruc_guia = p_ruc_guia, razon_social_guia = p_razon_social, fecha_emision = p_fecha_emision,
        tipo_comprobante = p_tipo_comprobante, serie = p_serie, correlativo = p_correlativo,
        ciudad_traslado = p_ciudad, punto_partida = p_partida, punto_llegada = p_llegada,
        serie_guia_transporte = p_serie_guia, correlativo_guia_transporte = p_correlativo_guia,
        coste_total_transporte = p_costo_total_transporte, peso = p_peso,
        fecha_pedido = p_fecha_pedido, fecha_entrega = p_fecha_entrega
    WHERE id_compra = p_id_compra AND tipo_documento_ref = 'compra';
END$$

---
-- ******************************************************
-- 5. GESTIÓN DE VENTAS
-- ******************************************************

DROP PROCEDURE IF EXISTS `sp_registrar_venta`$$
CREATE PROCEDURE `sp_registrar_venta`(
    IN p_id_cliente INT,
    IN p_id_tipo_comprobante INT,
    IN p_id_moneda INT,
    IN p_fecha_emision DATE,
    IN p_fecha_vencimiento DATE,
    IN p_id_tipo_pago INT,
    IN p_estado_venta VARCHAR(50),
    IN p_tipo_descuento ENUM('global', 'item'),
    IN p_aplica_igv BOOLEAN,
    IN p_observaciones TEXT,
    IN p_subtotal DECIMAL(12,2),
    IN p_igv DECIMAL(12,2),
    IN p_descuento_total DECIMAL(12,2),
    IN p_total_final DECIMAL(12,2),
    IN p_total_peso DECIMAL(12,3),
    IN p_hay_traslado BOOLEAN,
    OUT p_id_venta INT
)
BEGIN
    INSERT INTO venta(
        id_cliente, id_tipo_comprobante, id_moneda, fecha_emision, fecha_vencimiento,
        id_tipo_pago, estado_venta, tipo_descuento, aplica_igv, observaciones,
        subtotal, igv, descuento_total, total_final, total_peso, hay_traslado
    ) VALUES (
        p_id_cliente, p_id_tipo_comprobante, p_id_moneda, p_fecha_emision, p_fecha_vencimiento,
        p_id_tipo_pago, p_estado_venta, p_tipo_descuento, p_aplica_igv, p_observaciones,
        p_subtotal, p_igv, p_descuento_total, p_total_final, p_total_peso, p_hay_traslado
    );
    SET p_id_venta = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_descuento_global_venta`$$
CREATE PROCEDURE `sp_agregar_descuento_global_venta`(
    IN p_id_venta INT,
    IN p_motivo VARCHAR(255),
    IN p_tipo_valor ENUM('porcentaje', 'soles'),
    IN p_valor DECIMAL(12,2)
)
BEGIN
    INSERT INTO descuento (
        id_venta, motivo, tipo_aplicacion, tipo_valor, valor, tasa_igv
    )
    VALUES (
        p_id_venta, p_motivo, 'global', p_tipo_valor, p_valor, 0.18
    );
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_detalle_venta`$$
CREATE PROCEDURE `sp_agregar_detalle_venta`(
    IN p_id_venta INT,
    IN p_id_articulo INT,
    IN p_descripcion VARCHAR(255),
    IN p_cantidad DECIMAL(12,2),
    IN p_peso_unitario DECIMAL(10,3),
    IN p_precio_unitario DECIMAL(12,2),
    IN p_descuento_monto DECIMAL(12,2),
    IN p_subtotal DECIMAL(12,2),
    IN p_total DECIMAL(12,2),
    OUT p_id_detalle_venta INT
)
BEGIN
    INSERT INTO detalle_venta(
        id_venta, id_articulo, descripcion, cantidad, peso_unitario,
        precio_unitario, descuento_monto, subtotal, total
    ) VALUES (
        p_id_venta, p_id_articulo, p_descripcion, p_cantidad, p_peso_unitario,
        p_precio_unitario, p_descuento_monto, p_subtotal, p_total
    );
    SET p_id_detalle_venta = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_descuento_item_venta`$$
CREATE PROCEDURE `sp_agregar_descuento_item_venta`(
    IN p_id_detalle_venta INT,
    IN p_motivo VARCHAR(255),
    IN p_tipo_valor ENUM('porcentaje', 'soles'),
    IN p_valor DECIMAL(12,2)
)
BEGIN
    INSERT INTO descuento (
        id_detalle_venta, motivo, tipo_aplicacion, tipo_valor, valor, tasa_igv
    )
    VALUES (
        p_id_detalle_venta, p_motivo, 'item', p_tipo_valor, p_valor, 0.18
    );
END$$

DROP PROCEDURE IF EXISTS `sp_consumir_stock_lote_venta`$$
CREATE PROCEDURE `sp_consumir_stock_lote_venta`(
    IN p_id_detalle_venta INT,
    IN p_id_articulo INT,
    IN p_cantidad_a_consumir DECIMAL(12,2)
)
BEGIN
    DECLARE v_cantidad_restante DECIMAL(12,2);
    DECLARE v_id_lote_actual INT;
    DECLARE v_disponible_lote DECIMAL(12,2);
    DECLARE v_cantidad_consumida DECIMAL(12,2);
    DECLARE finished BOOLEAN DEFAULT FALSE;
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
        IF finished OR v_cantidad_restante <= 0 THEN
            LEAVE lote_loop;
        END IF;

        SET v_cantidad_consumida = LEAST(v_cantidad_restante, v_disponible_lote);
        UPDATE inventario_lote SET cantidad_disponible = cantidad_disponible - v_cantidad_consumida WHERE id_lote = v_id_lote_actual;
        INSERT INTO lote_venta (id_detalle_venta, id_lote, cantidad) VALUES (p_id_detalle_venta, v_id_lote_actual, v_cantidad_consumida);
        UPDATE articulo SET cantidad = cantidad - v_cantidad_consumida WHERE id = p_id_articulo;

        SET v_cantidad_restante = v_cantidad_restante - v_cantidad_consumida;
    END LOOP;

    CLOSE cur_lotes;

    IF v_cantidad_restante > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Stock insuficiente en lotes disponibles.';
    END IF;
END$$

DROP PROCEDURE IF EXISTS `sp_registrar_guia_transporte_venta`$$
CREATE PROCEDURE `sp_registrar_guia_transporte_venta`(
    IN p_id_venta INT,
    IN p_modalidad_transporte ENUM('publico', 'privado'),
    IN p_peso DECIMAL(12,3),
    IN p_ruc_empresa VARCHAR(20),
    IN p_razon_social_empresa VARCHAR(255),
    IN p_marca_vehiculo VARCHAR(100),
    IN p_dni_conductor VARCHAR(20),
    IN p_nombre_conductor VARCHAR(255),
    IN p_punto_partida VARCHAR(255),
    IN p_punto_llegada VARCHAR(255),
    IN p_fecha_traslado DATE,
    IN p_observaciones TEXT,
    IN p_conformidad_nombre VARCHAR(255),
    IN p_conformidad_dni VARCHAR(20)
)
BEGIN
    INSERT INTO guia_transporte (
        id_venta, tipo_documento_ref, peso, fecha_traslado, observaciones, modalidad_transporte,
        ruc_empresa, razon_social_empresa, marca_vehiculo, dni_conductor, nombre_conductor,
        punto_partida, punto_llegada
    )
    VALUES (
        p_id_venta, 'venta', p_peso, p_fecha_traslado, p_observaciones, p_modalidad_transporte,
        p_ruc_empresa, p_razon_social_empresa, p_marca_vehiculo, p_dni_conductor, p_nombre_conductor,
        p_punto_partida, p_punto_llegada
    );

    INSERT INTO conformidad_cliente (
        id_venta, nombre_cliente_confirma, dni_cliente_confirma, tipo_entrega
    )
    VALUES (
        p_id_venta, p_conformidad_nombre, p_conformidad_dni, 'remision'
    );
END$$

DROP PROCEDURE IF EXISTS `sp_registrar_conformidad_tienda`$$
CREATE PROCEDURE `sp_registrar_conformidad_tienda`(
    IN p_id_venta INT,
    IN p_nombre_cliente_confirma VARCHAR(255),
    IN p_dni_cliente_confirma VARCHAR(20)
)
BEGIN
    INSERT INTO conformidad_cliente (
        id_venta, nombre_cliente_confirma, dni_cliente_confirma, tipo_entrega
    )
    VALUES (
        p_id_venta, p_nombre_cliente_confirma, p_dni_cliente_confirma, 'tienda'
    );
END$$

-- ******************************************************
-- 6. GESTIÓN DE GASTOS
-- ******************************************************

DROP PROCEDURE IF EXISTS `sp_registrar_gasto`$$
CREATE PROCEDURE `sp_registrar_gasto`(
    IN p_id_proveedor INT, IN p_id_tipo_gasto INT, IN p_motivo VARCHAR(100), IN p_placa VARCHAR(50),
    IN p_fecha DATE, IN p_id_moneda INT, IN p_subtotal DECIMAL(12,2), IN p_igv DECIMAL(12,2),
    IN p_total DECIMAL(12,2), IN p_observacion TEXT, IN p_total_peso DECIMAL(12,3),
    OUT p_id_gasto INT
)
BEGIN
    INSERT INTO gasto (
        id_proveedor, id_tipo_gasto, motivo, placa, fecha, id_moneda, subtotal, igv, total, observacion, total_peso
    ) VALUES (
        p_id_proveedor, p_id_tipo_gasto, p_motivo, p_placa, p_fecha, p_id_moneda, p_subtotal, p_igv, p_total, p_observacion, p_total_peso
    );
    SET p_id_gasto = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_detalle_gasto`$$
CREATE PROCEDURE `sp_agregar_detalle_gasto`(
    IN p_id_gasto INT, IN p_descripcion VARCHAR(255), IN p_cantidad DECIMAL(12,2), IN p_id_unidad INT,
    IN p_peso_unitario DECIMAL(10,3), IN p_precio_unitario DECIMAL(12,2), IN p_subtotal DECIMAL(12,2),
    IN p_igv DECIMAL(12,2), IN p_total DECIMAL(12,2)
)
BEGIN
    INSERT INTO detalle_gasto (
        id_gasto, descripcion, cantidad, id_unidad, peso_unitario, precio_unitario, subtotal, igv, total
    ) VALUES (
        p_id_gasto, p_descripcion, p_cantidad, p_id_unidad, p_peso_unitario, p_precio_unitario, p_subtotal, p_igv, p_total
    );
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_documento_gasto`$$
CREATE PROCEDURE `sp_agregar_documento_gasto`(
    IN p_id_gasto INT, IN p_id_tipo_comprobante INT, IN p_serie VARCHAR(20),
    IN p_correlativo VARCHAR(50), IN p_fecha_emision DATE
)
BEGIN
    INSERT INTO documento_gasto (
        id_gasto, id_tipo_comprobante, serie, correlativo, fecha_emision
    ) VALUES (
        p_id_gasto, p_id_tipo_comprobante, p_serie, p_correlativo, p_fecha_emision
    );
END$$

-- ******************************************************
-- 7. PROCEDIMIENTOS TRANSACCIONALES VARIOS
-- ******************************************************

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

DROP PROCEDURE IF EXISTS `sp_agregar_guia_transporte`$$
CREATE PROCEDURE `sp_agregar_guia_transporte`(
    IN p_id_compra INT, IN p_id_venta INT, IN p_tipo_documento_ref ENUM('compra', 'venta'), IN p_ruc_guia VARCHAR(20),
    IN p_razon_social_guia VARCHAR(255), IN p_fecha_emision DATE, IN p_tipo_comprobante VARCHAR(50),
    IN p_serie VARCHAR(20), IN p_correlativo VARCHAR(50), IN p_serie_guia_transporte VARCHAR(20),
    IN p_correlativo_guia_transporte VARCHAR(50), IN p_ciudad_traslado VARCHAR(100), IN p_punto_partida VARCHAR(255),
    IN p_punto_llegada VARCHAR(255), IN p_coste_total_transporte DECIMAL(12,2), IN p_peso DECIMAL(12,3),
    IN p_fecha_pedido DATE, IN p_fecha_entrega DATE, IN p_fecha_traslado DATE, IN p_observaciones TEXT,
    IN p_modalidad_transporte ENUM('publico', 'privado'), IN p_ruc_empresa VARCHAR(20),
    IN p_razon_social_empresa VARCHAR(255), IN p_marca_vehiculo VARCHAR(100),
    IN p_dni_conductor VARCHAR(20), IN p_nombre_conductor VARCHAR(255)
)
BEGIN
    INSERT INTO guia_transporte (
        id_compra, id_venta, tipo_documento_ref, ruc_guia, razon_social_guia, fecha_emision, tipo_comprobante,
        serie, correlativo, serie_guia_transporte, correlativo_guia_transporte,
        ciudad_traslado, punto_partida, punto_llegada, coste_total_transporte, peso, fecha_pedido, fecha_entrega,
        fecha_traslado, observaciones, modalidad_transporte, ruc_empresa, razon_social_empresa, marca_vehiculo,
        dni_conductor, nombre_conductor
    ) VALUES (
        p_id_compra, p_id_venta, p_tipo_documento_ref, p_ruc_guia, p_razon_social_guia, p_fecha_emision, p_tipo_comprobante,
        p_serie, p_correlativo, p_serie_guia_transporte, p_correlativo_guia_transporte,
        p_ciudad_traslado, p_punto_partida, p_punto_llegada, p_coste_total_transporte, p_peso, p_fecha_pedido, p_fecha_entrega,
        p_fecha_traslado, p_observaciones, p_modalidad_transporte, p_ruc_empresa, p_razon_social_empresa, p_marca_vehiculo,
        p_dni_conductor, p_nombre_conductor
    );
END$$

DELIMITER ;