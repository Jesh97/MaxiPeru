use bd_maxiperu;

DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_buscar_articulos_para_compra`$$
CREATE PROCEDURE `sp_buscar_articulos_para_compra` (
    IN p_busqueda VARCHAR(100)
)
BEGIN
    SELECT
        a.id, a.codigo, a.descripcion, a.cantidad,
        a.precio_unitario, a.peso_unitario, a.aroma, a.color
    FROM articulo a
    WHERE (a.codigo LIKE CONCAT('%', p_busqueda, '%') OR a.descripcion LIKE CONCAT('%', p_busqueda, '%'))
      AND a.id_tipo_articulo IN (
        2,  -- INSUMOS DE PRODUCCION
        3,  -- PRODUCTOS COMERCIALES
        4   -- ENVASES Y EMBALAJE
      );
END$$

DROP PROCEDURE IF EXISTS `sp_buscar_articulos_para_venta`$$
CREATE PROCEDURE `sp_buscar_articulos_para_venta` (
    IN p_busqueda VARCHAR(100)
)
BEGIN
    SELECT
        a.id, a.codigo, a.descripcion, a.cantidad,
        a.precio_unitario, a.peso_unitario, a.aroma, a.color
    FROM articulo a
    WHERE (a.codigo LIKE CONCAT('%', p_busqueda, '%') OR a.descripcion LIKE CONCAT('%', p_busqueda, '%'))
      AND a.id_tipo_articulo IN (
        1,  -- PRODUCTO TERMINADO
        3   -- PRODUCTOS COMERCIALES
      );
END$$


DROP PROCEDURE IF EXISTS `sp_buscar_insumos`$$
CREATE PROCEDURE `sp_buscar_insumos` (
    IN p_busqueda VARCHAR(100)
)
BEGIN
    SELECT
        a.id, a.codigo, a.descripcion, a.cantidad,
        a.precio_unitario, a.peso_unitario, a.aroma, a.color
    FROM articulo a
    WHERE (a.codigo LIKE CONCAT('%', p_busqueda, '%') OR a.descripcion LIKE CONCAT('%', p_busqueda, '%'))
      AND a.id_tipo_articulo = 2; -- INSUMOS DE PRODUCCION
END$$

-- Procedimientos de proveedores
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

-- Procedimientos de clientes
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

-- Procedimientos de artículos
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

-- ====================================================================
-- PROCEDIMIENTOS DE COMPRAS (Algunos modificados para compatibilidad)
-- ====================================================================

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

-- ====================================================================
-- PROCEDIMIENTOS DE VENTA (Nuevos)
-- ====================================================================

--- NUEVO: Registrar cabecera de la venta ---
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

--- NUEVO: Agregar detalle de la venta (Deduce stock) ---
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

    -- DEDUCCIÓN DE STOCK
    UPDATE articulo SET cantidad = cantidad - p_cantidad WHERE id = p_id_articulo;
END$$

--- NUEVO: Agregar información de lotes y vencimiento para la venta ---
DROP PROCEDURE IF EXISTS `sp_agregar_lote_venta`$$
CREATE PROCEDURE `sp_agregar_lote_venta`(
    IN p_id_detalle_venta INT,
    IN p_numero_lote VARCHAR(50),
    IN p_cantidad DECIMAL(12,2),
    IN p_fecha_vencimiento DATE
)
BEGIN
    INSERT INTO lote_venta (id_detalle_venta, numero_lote, cantidad, fecha_vencimiento)
    VALUES (p_id_detalle_venta, p_numero_lote, p_cantidad, p_fecha_vencimiento);
END$$

--- NUEVO: Registrar conformidad de cliente para entrega en tienda/remisión ---
DROP PROCEDURE IF EXISTS `sp_agregar_conformidad_cliente`$$
CREATE PROCEDURE `sp_agregar_conformidad_cliente`(
    IN p_id_venta INT,
    IN p_nombre_cliente_confirma VARCHAR(255),
    IN p_dni_cliente_confirma VARCHAR(20),
    IN p_tipo_entrega ENUM('tienda', 'remision')
)
BEGIN
    INSERT INTO conformidad_cliente (id_venta, nombre_cliente_confirma, dni_cliente_confirma, tipo_entrega)
    VALUES (p_id_venta, p_nombre_cliente_confirma, p_dni_cliente_confirma, p_tipo_entrega);
END$$


-- ====================================================================
-- PROCEDIMIENTOS DE GASTOS (Modificados para nuevos campos)
-- ====================================================================

--- MODIFICADO: sp_registrar_gasto (Añade placa, motivo y total_peso) ---
DROP PROCEDURE IF EXISTS `sp_registrar_gasto`$$
CREATE PROCEDURE `sp_registrar_gasto`(
    IN p_id_proveedor INT,
    IN p_id_tipo_gasto INT,
    IN p_motivo VARCHAR(100),       -- CAMPO NUEVO
    IN p_placa VARCHAR(50),         -- CAMPO NUEVO
    IN p_fecha DATE,
    IN p_id_moneda INT,
    IN p_subtotal DECIMAL(12,2),
    IN p_igv DECIMAL(12,2),
    IN p_total DECIMAL(12,2),
    IN p_observacion TEXT,
    IN p_total_peso DECIMAL(12,3),  -- CAMPO NUEVO
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

--- MODIFICADO: sp_agregar_detalle_gasto (Añade id_unidad y peso_unitario) ---
DROP PROCEDURE IF EXISTS `sp_agregar_detalle_gasto`$$
CREATE PROCEDURE `sp_agregar_detalle_gasto`(
    IN p_id_gasto INT,
    IN p_descripcion VARCHAR(255),
    IN p_cantidad DECIMAL(12,2),
    IN p_id_unidad INT,             -- CAMPO NUEVO
    IN p_peso_unitario DECIMAL(10,3), -- CAMPO NUEVO
    IN p_precio_unitario DECIMAL(12,2),
    IN p_subtotal DECIMAL(12,2),
    IN p_igv DECIMAL(12,2),
    IN p_total DECIMAL(12,2)
)
BEGIN
    INSERT INTO detalle_gasto (
        id_gasto, descripcion, cantidad, id_unidad, peso_unitario, precio_unitario, subtotal, igv, total
    ) VALUES (
        p_id_gasto, p_descripcion, p_cantidad, p_id_unidad, p_peso_unitario, p_precio_unitario, p_subtotal, p_igv, p_total
    );
END$$


-- ====================================================================
-- PROCEDIMIENTOS DE DESCUENTO Y GUÍA DE TRANSPORTE (Modificados para Compra y Venta)
-- ====================================================================

--- MODIFICADO: sp_agregar_guia_transporte (Ahora soporta Venta y todos los campos del formulario) ---
DROP PROCEDURE IF EXISTS `sp_agregar_guia_transporte`$$
CREATE PROCEDURE `sp_agregar_guia_transporte`(
    IN p_id_compra INT,
    IN p_id_venta INT,
    IN p_tipo_documento_ref ENUM('compra', 'venta'),
    IN p_ruc_guia VARCHAR(20),
    IN p_razon_social_guia VARCHAR(255),
    IN p_fecha_emision DATE,
    IN p_tipo_comprobante VARCHAR(50),
    IN p_serie VARCHAR(20),
    IN p_correlativo VARCHAR(50),
    IN p_serie_guia_transporte VARCHAR(20),
    IN p_correlativo_guia_transporte VARCHAR(50),
    IN p_ciudad_traslado VARCHAR(100),
    IN p_punto_partida VARCHAR(255),
    IN p_punto_llegada VARCHAR(255),
    IN p_coste_total_transporte DECIMAL(12,2),
    IN p_peso DECIMAL(12,3),
    IN p_fecha_pedido DATE,
    IN p_fecha_entrega DATE,
    IN p_fecha_traslado DATE,
    IN p_observaciones TEXT,
    IN p_modalidad_transporte ENUM('publico', 'privado'),
    IN p_ruc_empresa VARCHAR(20),
    IN p_razon_social_empresa VARCHAR(255),
    IN p_marca_vehiculo VARCHAR(100),
    IN p_dni_conductor VARCHAR(20),
    IN p_nombre_conductor VARCHAR(255)
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

DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_agregar_guia_transporte_compra`$$
CREATE PROCEDURE sp_agregar_guia_transporte_compra (
    IN p_id_compra INT,
    IN p_ruc_guia VARCHAR(20),
    IN p_razon_social_guia VARCHAR(255),
    IN p_fecha_emision DATE,
    IN p_tipo_comprobante VARCHAR(50),
    IN p_serie VARCHAR(10),
    IN p_correlativo VARCHAR(20),
    IN p_ciudad_traslado VARCHAR(100),
    IN p_punto_partida VARCHAR(255),
    IN p_punto_llegada VARCHAR(255),
    IN p_serie_guia_transporte VARCHAR(10),
    IN p_correlativo_guia_transporte VARCHAR(20),
    IN p_coste_total_transporte DECIMAL(10, 2),
    IN p_peso DECIMAL(10, 2),
    IN p_fecha_pedido DATE,
    IN p_fecha_entrega DATE
)
BEGIN
    INSERT INTO guia_transporte (
        id_compra,
        ruc_guia,
        razon_social_guia,
        fecha_emision,
        tipo_comprobante,
        serie,
        correlativo,
        ciudad_traslado,
        punto_partida,
        punto_llegada,
        serie_guia_transporte,
        correlativo_guia_transporte,
        coste_total_transporte,
        peso,
        fecha_pedido,
        fecha_entrega
    ) VALUES (
        p_id_compra,
        p_ruc_guia,
        p_razon_social_guia,
        p_fecha_emision,
        p_tipo_comprobante,
        p_serie,
        p_correlativo,
        p_ciudad_traslado,
        p_punto_partida,
        p_punto_llegada,
        p_serie_guia_transporte,
        p_correlativo_guia_transporte,
        p_coste_total_transporte,
        p_peso,
        p_fecha_pedido,
        p_fecha_entrega
    );
END //

DELIMITER ;



--- MODIFICADO: sp_agregar_descuento_global (Ahora soporta Venta) ---
DROP PROCEDURE IF EXISTS `sp_agregar_descuento_global`$$
CREATE PROCEDURE `sp_agregar_descuento_global`(
    IN p_id_compra INT,
    IN p_id_venta INT,
    IN p_motivo VARCHAR(255),
    IN p_tipo_valor ENUM('porcentaje', 'soles'),
    IN p_valor DECIMAL(12,2),
    IN p_tasa_igv DECIMAL(5,2)
)
BEGIN
    INSERT INTO descuento (id_compra, id_venta, motivo, tipo_aplicacion, tipo_valor, valor, tasa_igv)
    VALUES (p_id_compra, p_id_venta, p_motivo, 'global', p_tipo_valor, p_valor, p_tasa_igv);
END$$

--- MODIFICADO: sp_agregar_descuento_item (Ahora soporta Detalle de Venta) ---
DROP PROCEDURE IF EXISTS `sp_agregar_descuento_item`$$
CREATE PROCEDURE `sp_agregar_descuento_item`(
    IN p_id_detalle_compra INT,
    IN p_id_detalle_venta INT,
    IN p_motivo VARCHAR(255),
    IN p_tipo_valor ENUM('porcentaje', 'soles'),
    IN p_valor DECIMAL(12,2),
    IN p_tasa_igv DECIMAL(5,2)
)
BEGIN
    INSERT INTO descuento (id_detalle_compra, id_detalle_venta, motivo, tipo_aplicacion, tipo_valor, valor, tasa_igv)
    VALUES (p_id_detalle_compra, p_id_detalle_venta, p_motivo, 'item', p_tipo_valor, p_valor, p_tasa_igv);
END$$

DELIMITER ;