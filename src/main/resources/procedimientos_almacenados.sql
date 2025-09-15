use bd_maxiperu;

DELIMITER $$

CREATE PROCEDURE sp_buscar_articulos_para_compra (
    IN p_busqueda VARCHAR(100)
)
BEGIN
    SELECT DISTINCT
        a.id, a.codigo, a.descripcion, a.cantidad,
        a.precio_unitario, a.peso_unitario, a.aroma, a.color
    FROM articulo a
    INNER JOIN articulo_tipo at ON a.id = at.id_articulo
    INNER JOIN tipo_articulo ta ON at.id_tipo = ta.id
    WHERE (a.codigo LIKE CONCAT('%', p_busqueda, '%') OR a.descripcion LIKE CONCAT('%', p_busqueda, '%'))
      AND ta.nombre IN ('Compra', 'Insumo');
END$$

CREATE PROCEDURE sp_buscar_articulos_para_venta (
    IN p_busqueda VARCHAR(100)
)
BEGIN
    SELECT DISTINCT
        a.id, a.codigo, a.descripcion, a.cantidad,
        a.precio_unitario, a.peso_unitario, a.aroma, a.color
    FROM articulo a
    INNER JOIN articulo_tipo at ON a.id = at.id_articulo
    INNER JOIN tipo_articulo ta ON at.id_tipo = ta.id
    WHERE (a.codigo LIKE CONCAT('%', p_busqueda, '%') OR a.descripcion LIKE CONCAT('%', p_busqueda, '%'))
      AND ta.nombre IN ('Compra', 'Venta');
END$$

CREATE PROCEDURE sp_buscar_insumos (
    IN p_busqueda VARCHAR(100)
)
BEGIN
    SELECT DISTINCT
        a.id, a.codigo, a.descripcion, a.cantidad,
        a.precio_unitario, a.peso_unitario, a.aroma, a.color
    FROM articulo a
    INNER JOIN articulo_tipo at ON a.id = at.id_articulo
    INNER JOIN tipo_articulo ta ON at.id_tipo = ta.id
    WHERE (a.codigo LIKE CONCAT('%', p_busqueda, '%') OR a.descripcion LIKE CONCAT('%', p_busqueda, '%'))
      AND ta.nombre = 'Insumo';
END$$

---

### Procedimientos de proveedores
DROP PROCEDURE IF EXISTS `sp_agregar_proveedor`$$
CREATE PROCEDURE `sp_agregar_proveedor`(
    IN p_ruc VARCHAR(20),
    IN p_razon_social VARCHAR(255),
    IN p_direccion VARCHAR(255),
    IN p_telefono VARCHAR(50),
    IN p_correo VARCHAR(100),
    IN p_ciudad VARCHAR(50)
)
BEGIN
    INSERT INTO proveedor(ruc, razon_social, direccion, telefono, correo, ciudad)
    VALUES (p_ruc, p_razon_social, p_direccion, p_telefono, p_correo, p_ciudad);
END$$

DROP PROCEDURE IF EXISTS `sp_actualizar_proveedor`$$
CREATE PROCEDURE `sp_actualizar_proveedor`(
    IN p_id INT,
    IN p_ruc VARCHAR(20),
    IN p_razon_social VARCHAR(255),
    IN p_direccion VARCHAR(255),
    IN p_telefono VARCHAR(50),
    IN p_correo VARCHAR(100),
    IN p_ciudad VARCHAR(50)
)
BEGIN
    UPDATE proveedor
    SET ruc = p_ruc,
        razon_social = p_razon_social,
        direccion = p_direccion,
        telefono = p_telefono,
        correo = p_correo,
        ciudad = p_ciudad
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

DROP PROCEDURE IF EXISTS `sp_buscar_proveedor`$$
CREATE PROCEDURE `sp_buscar_proveedor`(
    IN p_busqueda VARCHAR(100)
)
BEGIN
    SELECT
        id, ruc, razon_social, direccion, telefono, correo, ciudad
    FROM proveedor
    WHERE ruc LIKE CONCAT('%', p_busqueda, '%')
        OR razon_social LIKE CONCAT('%', p_busqueda, '%');
END$$

DROP PROCEDURE IF EXISTS `sp_listar_proveedores`$$
CREATE PROCEDURE `sp_listar_proveedores`()
BEGIN
    SELECT
        id, ruc, razon_social, direccion, telefono, correo, ciudad
    FROM proveedor
    ORDER BY razon_social ASC;
END$$

---

### Procedimientos de clientes
DROP PROCEDURE IF EXISTS `sp_agregar_cliente`$$
CREATE PROCEDURE `sp_agregar_cliente`(
    IN p_tipo_documento VARCHAR(20),
    IN p_numero_documento VARCHAR(20),
    IN p_razon_social VARCHAR(150),
    IN p_direccion TEXT,
    IN p_telefono VARCHAR(20),
    IN p_correo VARCHAR(100)
)
BEGIN
    INSERT INTO cliente(tipo_documento, numero_documento, razon_social, direccion, telefono, correo)
    VALUES (p_tipo_documento, p_numero_documento, p_razon_social, p_direccion, p_telefono, p_correo);
END$$

DROP PROCEDURE IF EXISTS `sp_actualizar_cliente`$$
CREATE PROCEDURE `sp_actualizar_cliente`(
    IN p_id INT,
    IN p_tipo_documento VARCHAR(20),
    IN p_numero_documento VARCHAR(20),
    IN p_razon_social VARCHAR(150),
    IN p_direccion TEXT,
    IN p_telefono VARCHAR(20),
    IN p_correo VARCHAR(100)
)
BEGIN
    UPDATE cliente
    SET tipo_documento = p_tipo_documento,
        numero_documento = p_numero_documento,
        razon_social = p_razon_social,
        direccion = p_direccion,
        telefono = p_telefono,
        correo = p_correo
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
        id, tipo_documento, numero_documento, razon_social, direccion, telefono, correo
    FROM cliente
    ORDER BY razon_social ASC;
END$$

---

### Procedimientos de artículos
DROP PROCEDURE IF EXISTS `sp_agregar_articulo`$$
CREATE PROCEDURE `sp_agregar_articulo`(
    IN p_codigo VARCHAR(50),
    IN p_descripcion VARCHAR(255),
    IN p_cantidad INT,
    IN p_precio_unitario DECIMAL(12,2),
    IN p_peso_unitario DECIMAL(10,3),
    IN p_aroma VARCHAR(50),
    IN p_color VARCHAR(50),
    IN p_id_marca INT,
    IN p_id_categoria INT,
    IN p_id_unidad INT
)
BEGIN
    INSERT INTO articulo(
        codigo, descripcion, cantidad, precio_unitario, peso_unitario,
        aroma, color, id_marca, id_categoria, id_unidad
    ) VALUES (
        p_codigo, p_descripcion, p_cantidad, p_precio_unitario, p_peso_unitario,
        p_aroma, p_color, p_id_marca, p_id_categoria, p_id_unidad
    );
END$$

DROP PROCEDURE IF EXISTS `sp_actualizar_articulo`$$
CREATE PROCEDURE `sp_actualizar_articulo`(
    IN p_id INT,
    IN p_descripcion VARCHAR(255),
    IN p_cantidad INT,
    IN p_precio_unitario DECIMAL(12,2),
    IN p_peso_unitario DECIMAL(10,3),
    IN p_aroma VARCHAR(50),
    IN p_color VARCHAR(50),
    IN p_id_marca INT,
    IN p_id_categoria INT,
    IN p_id_unidad INT
)
BEGIN
    UPDATE articulo
    SET
        descripcion = p_descripcion,
        cantidad = p_cantidad,
        precio_unitario = p_precio_unitario,
        peso_unitario = p_peso_unitario,
        aroma = p_aroma,
        color = p_color,
        id_marca = p_id_marca,
        id_categoria = p_id_categoria,
        id_unidad = p_id_unidad
    WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS `sp_eliminar_articulo`$$
CREATE PROCEDURE `sp_eliminar_articulo`(
    IN p_id INT
)
BEGIN
    DELETE FROM articulo WHERE id = p_id;
END$$

---

### Procedimientos de compras
DROP PROCEDURE IF EXISTS `sp_listar_compras_completas`$$
CREATE PROCEDURE `sp_listar_compras_completas`()
BEGIN
    SELECT
        c.id_compra, c.fecha_emision, c.fecha_vencimiento,
        tc.nombre AS tipo_comprobante,
        c.serie, c.correlativo, mo.nombre AS moneda, c.tipo_cambio, c.subtotal, c.igv, c.total,
        c.total_peso, c.coste_transporte, c.observacion,
        p.id AS id_proveedor, p.ruc, p.razon_social, p.direccion, p.telefono, p.correo, p.ciudad,
        dc.id_detalle, dc.id_articulo,
        a.codigo AS codigo_articulo, a.descripcion AS descripcion_articulo,
        dc.cantidad, dc.precio_unitario, dc.coste_unitario_transporte, dc.coste_total_transporte, dc.precio_con_descuento,
        dc.igv_insumo, dc.total AS total_detalle, dc.peso_total,
        gt.id_guia, gt.ruc_guia, gt.razon_social_guia, gt.fecha_emision AS fecha_emision_guia,
        gt.tipo_comprobante AS tipo_comprobante_guia, gt.serie AS serie_guia, gt.correlativo AS correlativo_guia,
        gt.serie_guia_transporte, gt.correlativo_guia_transporte, gt.ciudad_traslado,
        gt.coste_total_transporte AS coste_transporte_guia, gt.peso AS peso_guia, gt.fecha_pedido, gt.fecha_entrega,
        rc.id_referencia, rc.numero_cotizacion, rc.numero_pedido
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

DROP PROCEDURE IF EXISTS `sp_registrar_compra`$$
CREATE PROCEDURE `sp_registrar_compra`(
    IN p_id_proveedor INT,
    IN p_id_tipo_comprobante INT,
    IN p_serie VARCHAR(20),
    IN p_correlativo VARCHAR(50),
    IN p_fecha_emision DATE,
    IN p_fecha_vencimiento DATE,
    IN p_id_tipo_pago INT,
    IN p_id_forma_pago INT,
    IN p_id_moneda INT,
    IN p_tipo_cambio DECIMAL(10,4),
    IN p_incluye_igv BOOLEAN,
    IN p_hay_bonificacion BOOLEAN,
    IN p_hay_traslado BOOLEAN,
    IN p_observacion TEXT,
    IN p_subtotal DECIMAL(12,2),
    IN p_igv DECIMAL(12,2),
    IN p_total DECIMAL(12,2),
    IN p_total_peso DECIMAL(12,3),
    IN p_coste_transporte DECIMAL(12,2),
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
    IN p_id_compra INT,
    IN p_id_articulo INT,
    IN p_cantidad DECIMAL(12,2),
    IN p_precio_unitario DECIMAL(12,2),
    IN p_bonificacion DECIMAL(12,2),
    IN p_coste_unitario_transporte DECIMAL(12,2),
    IN p_coste_total_transporte DECIMAL(12,2),
    IN p_precio_con_descuento DECIMAL(12,2),
    IN p_igv_insumo DECIMAL(12,2),
    IN p_total DECIMAL(12,2),
    IN p_peso_total DECIMAL(12,3)
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

    UPDATE articulo SET cantidad = cantidad + p_cantidad WHERE id = p_id_articulo;
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_caja_compra`$$
CREATE PROCEDURE `sp_agregar_caja_compra`(
    IN p_id_compra INT,
    IN p_nombre_caja VARCHAR(100),
    IN p_cantidad INT,
    IN p_costo_caja DECIMAL(12,2),
    OUT p_id_caja_compra INT
)
BEGIN
    INSERT INTO caja_compra (id_compra, nombre_caja, cantidad, costo_caja)
    VALUES (p_id_compra, p_nombre_caja, p_cantidad, p_costo_caja);
    SET p_id_caja_compra = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_detalle_caja_compra`$$
CREATE PROCEDURE `sp_agregar_detalle_caja_compra`(
    IN p_id_caja_compra INT,
    IN p_id_articulo INT,
    IN p_cantidad DECIMAL(12,2)
)
BEGIN
    INSERT INTO detalle_caja_compra (id_caja_compra, id_articulo, cantidad)
    VALUES (p_id_caja_compra, p_id_articulo, p_cantidad);

    UPDATE articulo SET cantidad = cantidad + p_cantidad WHERE id = p_id_articulo;
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_guia_transporte`$$
CREATE PROCEDURE `sp_agregar_guia_transporte`(
    IN p_id_compra INT,
    IN p_ruc_guia VARCHAR(20),
    IN p_razon_social_guia VARCHAR(255),
    IN p_fecha_emision DATE,
    IN p_tipo_comprobante VARCHAR(50),
    IN p_serie VARCHAR(20),
    IN p_correlativo VARCHAR(50),
    IN p_serie_guia_transporte VARCHAR(20),
    IN p_correlativo_guia_transporte VARCHAR(50),
    IN p_ciudad_traslado VARCHAR(100),
    IN p_coste_total_transporte DECIMAL(12,2),
    IN p_peso DECIMAL(12,3),
    IN p_fecha_pedido DATE,
    IN p_fecha_entrega DATE
)
BEGIN
    INSERT INTO guia_transporte (
        id_compra, ruc_guia, razon_social_guia, fecha_emision, tipo_comprobante,
        serie, correlativo, serie_guia_transporte, correlativo_guia_transporte,
        ciudad_traslado, coste_total_transporte, peso, fecha_pedido, fecha_entrega
    ) VALUES (
        p_id_compra, p_ruc_guia, p_razon_social_guia, p_fecha_emision, p_tipo_comprobante,
        p_serie, p_correlativo, p_serie_guia_transporte, p_correlativo_guia_transporte,
        p_ciudad_traslado, p_coste_total_transporte, p_peso, p_fecha_pedido, p_fecha_entrega
    );
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_referencia_compra`$$
CREATE PROCEDURE `sp_agregar_referencia_compra`(
    IN p_id_compra INT,
    IN p_numero_cotizacion VARCHAR(50),
    IN p_numero_pedido VARCHAR(50)
)
BEGIN
    INSERT INTO referencia_compra (id_compra, numero_cotizacion, numero_pedido)
    VALUES (p_id_compra, p_numero_cotizacion, p_numero_pedido);
END$$

---

### Procedimientos de gastos

DROP PROCEDURE IF EXISTS `sp_registrar_gasto`$$
CREATE PROCEDURE `sp_registrar_gasto`(
    IN p_id_proveedor INT,
    IN p_id_tipo_gasto INT,
    IN p_fecha DATE,
    IN p_id_moneda INT,
    IN p_subtotal DECIMAL(12,2),
    IN p_igv DECIMAL(12,2),
    IN p_total DECIMAL(12,2),
    IN p_observacion TEXT,
    OUT p_id_gasto INT
)
BEGIN
    INSERT INTO gasto (
        id_proveedor, id_tipo_gasto, fecha, id_moneda, subtotal, igv, total, observacion
    ) VALUES (
        p_id_proveedor, p_id_tipo_gasto, p_fecha, p_id_moneda, p_subtotal, p_igv, p_total, p_observacion
    );
    SET p_id_gasto = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_documento_gasto`$$
CREATE PROCEDURE `sp_agregar_documento_gasto`(
    IN p_id_gasto INT,
    IN p_id_tipo_comprobante INT,
    IN p_serie VARCHAR(20),
    IN p_correlativo VARCHAR(50),
    IN p_fecha_emision DATE
)
BEGIN
    INSERT INTO documento_gasto (
        id_gasto, id_tipo_comprobante, serie, correlativo, fecha_emision
    ) VALUES (
        p_id_gasto, p_id_tipo_comprobante, p_serie, p_correlativo, p_fecha_emision
    );
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_detalle_gasto`$$
CREATE PROCEDURE `sp_agregar_detalle_gasto`(
    IN p_id_gasto INT,
    IN p_descripcion VARCHAR(255),
    IN p_cantidad DECIMAL(12,2),
    IN p_precio_unitario DECIMAL(12,2),
    IN p_subtotal DECIMAL(12,2),
    IN p_igv DECIMAL(12,2),
    IN p_total DECIMAL(12,2)
)
BEGIN
    INSERT INTO detalle_gasto (
        id_gasto, descripcion, cantidad, precio_unitario, subtotal, igv, total
    ) VALUES (
        p_id_gasto, p_descripcion, p_cantidad, p_precio_unitario, p_subtotal, p_igv, p_total
    );
END$$

---

### Procedimientos de descuentos
DROP PROCEDURE IF EXISTS `sp_agregar_descuento_global`$$
CREATE PROCEDURE `sp_agregar_descuento_global`(
    IN p_id_compra INT,
    IN p_motivo VARCHAR(255),
    IN p_tipo_valor ENUM('porcentaje', 'soles'),
    IN p_valor DECIMAL(12,2),
    IN p_tasa_igv DECIMAL(5,2)
)
BEGIN
    INSERT INTO descuento (id_compra, motivo, tipo_aplicacion, tipo_valor, valor, tasa_igv)
    VALUES (p_id_compra, p_motivo, 'global', p_tipo_valor, p_valor, p_tasa_igv);
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_descuento_item`$$
CREATE PROCEDURE `sp_agregar_descuento_item`(
    IN p_id_detalle_compra INT,
    IN p_motivo VARCHAR(255),
    IN p_tipo_valor ENUM('porcentaje', 'soles'),
    IN p_valor DECIMAL(12,2),
    IN p_tasa_igv DECIMAL(5,2)
)
BEGIN
    INSERT INTO descuento (id_detalle_compra, motivo, tipo_aplicacion, tipo_valor, valor, tasa_igv)
    VALUES (p_id_detalle_compra, p_motivo, 'item', p_tipo_valor, p_valor, p_tasa_igv);
END$$

DELIMITER ;