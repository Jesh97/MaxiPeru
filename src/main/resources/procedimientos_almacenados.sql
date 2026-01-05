use bd_maxiperu;

DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_crear_usuario`$$
CREATE PROCEDURE sp_crear_usuario (IN p_nombre VARCHAR(45), IN p_correo VARCHAR(45), IN p_username VARCHAR(45),
    IN p_password VARCHAR(255), IN p_rol VARCHAR(45))
BEGIN
    INSERT INTO usuario (nombre, correo, username, password, rol, estado)
    VALUES (p_nombre, p_correo, p_username, p_password, p_rol, 0);

    INSERT INTO actividad_usuario (usuario_id, tipo, descripcion)
    VALUES (LAST_INSERT_ID(), 'CREACION_CUENTA', CONCAT('El usuario ', p_username, ' ha sido registrado y está pendiente de aprobación.'));
END$$

DROP PROCEDURE IF EXISTS `sp_editar_usuario`$$
CREATE PROCEDURE sp_editar_usuario(IN p_id INT, IN p_nombre VARCHAR(45), IN p_correo VARCHAR(45),
    IN p_username VARCHAR(45), IN p_password VARCHAR(255), IN p_rol VARCHAR(45))
BEGIN
    IF EXISTS (SELECT 1 FROM usuario WHERE id = p_id) THEN
        IF p_password IS NOT NULL AND p_password != '' THEN
            UPDATE usuario SET nombre = p_nombre, correo = p_correo, username = p_username, password = p_password, rol = p_rol
            WHERE id = p_id;
        ELSE
            UPDATE usuario SET nombre = p_nombre, correo = p_correo, username = p_username, rol = p_rol WHERE id = p_id;
        END IF;
        SELECT 1 AS resultado;
    ELSE SELECT 0 AS resultado;
    END IF;
END$$

DROP PROCEDURE IF EXISTS `sp_aceptar_usuario`$$
CREATE PROCEDURE sp_aceptar_usuario (IN p_usuario_id INT, IN p_admin_principal_id INT)
BEGIN
    DECLARE v_username VARCHAR(45); DECLARE v_admin_principal_username VARCHAR(45); DECLARE v_admin_principal_rol VARCHAR(45);

    SELECT username, rol INTO v_admin_principal_username, v_admin_principal_rol FROM usuario
    WHERE id = p_admin_principal_id AND rol = 'administrador principal';

    IF v_admin_principal_username IS NOT NULL THEN
        UPDATE usuario SET estado = 1 WHERE id = p_usuario_id;

        SELECT username INTO v_username FROM usuario WHERE id = p_usuario_id;
        IF v_username IS NOT NULL THEN
            INSERT INTO actividad_usuario (usuario_id, tipo, descripcion)
            VALUES (p_usuario_id, 'CUENTA_HABILITADA', CONCAT('Cuenta de usuario ', v_username, ' habilitada/aceptada por el administrador principal ', v_admin_principal_username, '.'));
        END IF;
    END IF;
END$$

DROP PROCEDURE IF EXISTS `sp_otorgar_acceso_irrestricto`$$
CREATE PROCEDURE sp_otorgar_acceso_irrestricto (IN p_usuario_id INT, IN p_admin_principal_id INT)
BEGIN
    DECLARE v_username VARCHAR(45); DECLARE v_admin_principal_username VARCHAR(45);
    DECLARE v_admin_principal_rol VARCHAR(45);

    SELECT username, rol INTO v_admin_principal_username, v_admin_principal_rol FROM usuario
    WHERE id = p_admin_principal_id AND rol = 'administrador principal';

    IF v_admin_principal_username IS NOT NULL THEN
        UPDATE usuario SET permite_acceso_irrestricto = 1 WHERE id = p_usuario_id;

        SELECT username INTO v_username FROM usuario WHERE id = p_usuario_id;

        IF v_username IS NOT NULL THEN
            INSERT INTO actividad_usuario (usuario_id, tipo, descripcion)
            VALUES (p_usuario_id, 'PERMISO_HORARIO', CONCAT('El administrador principal ', v_admin_principal_username, ' otorgó acceso irrestricto al usuario ', v_username, '.'));
        END IF;
    END IF;
END$$

DROP PROCEDURE IF EXISTS `sp_validar_inicio_sesion`$$
CREATE PROCEDURE sp_validar_inicio_sesion (IN p_username VARCHAR(45), IN p_password_hash VARCHAR(255))
BEGIN
    DECLARE v_rol VARCHAR(45); DECLARE v_estado TINYINT(1); DECLARE v_permite_irrestricto TINYINT(1); DECLARE v_hora_actual TIME;
    DECLARE v_puede_iniciar_sesion INT DEFAULT 0; DECLARE v_usuario_id INT;

    SELECT id, rol, estado, permite_acceso_irrestricto INTO v_usuario_id, v_rol, v_estado, v_permite_irrestricto FROM usuario
    WHERE username = p_username AND password = p_password_hash;

    SET v_hora_actual = CURRENT_TIME();

    IF v_usuario_id IS NOT NULL THEN
        IF v_estado = 0 THEN SET v_puede_iniciar_sesion = 0;

        ELSEIF v_rol = 'administrador principal' THEN SET v_puede_iniciar_sesion = 1;

        ELSEIF (v_rol = 'administrador' OR v_rol = 'produccion') AND v_permite_irrestricto = 0 THEN
            IF v_hora_actual >= '08:00:00' AND v_hora_actual <= '17:00:00' THEN SET v_puede_iniciar_sesion = 1;
            ELSE SET v_puede_iniciar_sesion = -1;
            END IF;

        ELSE SET v_puede_iniciar_sesion = 1;
        END IF;
    ELSE SET v_puede_iniciar_sesion = 0;
    END IF;

    SELECT v_puede_iniciar_sesion AS resultado_validacion;
END$$

DROP PROCEDURE IF EXISTS `sp_deshabilitar_usuario`$$
CREATE PROCEDURE sp_deshabilitar_usuario (IN p_usuario_id INT, IN p_admin_principal_id INT)
BEGIN
    DECLARE v_username VARCHAR(45); DECLARE v_admin_principal_username VARCHAR(45);
    DECLARE v_admin_principal_rol VARCHAR(45);

    SELECT username, rol INTO v_admin_principal_username, v_admin_principal_rol FROM usuario
    WHERE id = p_admin_principal_id AND rol = 'administrador principal';

    IF v_admin_principal_username IS NOT NULL THEN
        UPDATE usuario SET estado = 0 WHERE id = p_usuario_id;
        SELECT username INTO v_username FROM usuario WHERE id = p_usuario_id;

        IF v_username IS NOT NULL THEN
            INSERT INTO actividad_usuario (usuario_id, tipo, descripcion)
            VALUES (p_usuario_id, 'CUENTA_DESHABILITADA', CONCAT('Cuenta de usuario ', v_username, ' deshabilitada por el administrador principal ', v_admin_principal_username, '.'));
        END IF;
    END IF;
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_articulo`$$
CREATE PROCEDURE `sp_agregar_articulo`(IN p_codigo VARCHAR(50), IN p_descripcion VARCHAR(255), IN p_cantidad DECIMAL(12,8), IN p_precio_compra DECIMAL(12,2), IN p_precio_venta DECIMAL(12,2),
    IN p_peso_unitario DECIMAL(10,3), IN p_densidad DECIMAL(12,8), IN p_aroma VARCHAR(50), IN p_color VARCHAR(50),
    IN p_id_marca INT, IN p_id_categoria INT, IN p_id_unidad INT, IN p_id_tipo_articulo INT, IN p_capacidad DECIMAL(12,4))
BEGIN
    DECLARE v_new_articulo_id INT;

    INSERT INTO articulo(codigo, descripcion, cantidad, precio_compra, precio_venta, peso_unitario, densidad, aroma, color, id_marca, id_categoria, id_unidad, id_tipo_articulo)
    VALUES (p_codigo, p_descripcion, p_cantidad, p_precio_compra, p_precio_venta, p_peso_unitario, p_densidad, p_aroma, p_color, NULLIF(p_id_marca, 0), NULLIF(p_id_categoria, 0), NULLIF(p_id_unidad, 0), NULLIF(p_id_tipo_articulo, 0));

    SET v_new_articulo_id = LAST_INSERT_ID();

    IF p_id_tipo_articulo = 4 AND p_capacidad IS NOT NULL AND p_capacidad > 0 THEN
        INSERT INTO capacidad_articulo_envase (id_articulo, capacidad, id_unidad_capacidad)
        VALUES (v_new_articulo_id, p_capacidad, NULLIF(p_id_unidad, 0));
    END IF;
END$$

DROP PROCEDURE IF EXISTS `sp_actualizar_articulo`$$
CREATE PROCEDURE `sp_actualizar_articulo`(IN p_id INT, IN p_descripcion VARCHAR(255), IN p_cantidad DECIMAL(12,8),
    IN p_precio_compra DECIMAL(12,2), IN p_precio_venta DECIMAL(12,2),IN p_peso_unitario DECIMAL(10,3), IN p_densidad DECIMAL(12,8),
    IN p_aroma VARCHAR(50), IN p_color VARCHAR(50), IN p_id_marca INT, IN p_id_categoria INT, IN p_id_unidad INT,
    IN p_id_tipo_articulo INT, IN p_capacidad DECIMAL(12,4))
BEGIN
    UPDATE articulo SET descripcion = p_descripcion, cantidad = p_cantidad, precio_compra = p_precio_compra,
        precio_venta = p_precio_venta, peso_unitario = p_peso_unitario, densidad = p_densidad, aroma = p_aroma,
        color = p_color, id_marca = NULLIF(p_id_marca, 0), id_categoria = NULLIF(p_id_categoria, 0), id_unidad = NULLIF(p_id_unidad, 0),
        id_tipo_articulo = NULLIF(p_id_tipo_articulo, 0)
    WHERE id = p_id;

    DELETE FROM capacidad_articulo_envase WHERE id_articulo = p_id;

    IF p_id_tipo_articulo = 4 AND p_capacidad IS NOT NULL AND p_capacidad > 0 THEN
        INSERT INTO capacidad_articulo_envase (id_articulo, capacidad, id_unidad_capacidad)
        VALUES (p_id, p_capacidad, NULLIF(p_id_unidad, 0));
    END IF;
END$$

DROP PROCEDURE IF EXISTS `sp_eliminar_articulo`$$
CREATE PROCEDURE `sp_eliminar_articulo`(IN p_id INT)
BEGIN
    DELETE FROM articulo WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS `sp_listar_articulos`$$
CREATE PROCEDURE `sp_listar_articulos`()
BEGIN
    SELECT a.id, a.codigo, a.descripcion, a.cantidad, a.precio_compra, a.precio_venta, a.peso_unitario, a.densidad,
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
    AND a.id_tipo_articulo IN (1, 3) AND a.cantidad > 0;
END$$

DROP PROCEDURE IF EXISTS `sp_buscar_articulos_terminados`$$
CREATE PROCEDURE `sp_buscar_articulos_terminados`(IN p_busqueda VARCHAR(100))
BEGIN
SELECT a.id, a.codigo, pm.id_producto_maestro, pm.nombre_generico, a.cantidad, a.precio_compra, a.precio_venta, a.peso_unitario, a.aroma, a.color, a.densidad, um.nombre AS unidad
FROM articulo a
        LEFT JOIN producto_maestro pm ON a.id_producto_maestro = pm.id_producto_maestro
        JOIN unidad_medida um ON a.id_unidad = um.id_unidad
        WHERE (a.codigo LIKE CONCAT('%', p_busqueda, '%') OR a.descripcion LIKE CONCAT('%', p_busqueda, '%') OR pm.nombre_generico LIKE CONCAT('%', p_busqueda, '%'))
        AND a.id_tipo_articulo = 1;
END$$

DROP PROCEDURE IF EXISTS `sp_buscar_articulos_insumos`$$
CREATE PROCEDURE `sp_buscar_articulos_insumos`(IN p_busqueda VARCHAR(100))
BEGIN
SELECT a.id, a.codigo, a.descripcion, a.cantidad, a.precio_compra, a.precio_venta, a.peso_unitario,
a.aroma, a.color, a.densidad, um.nombre AS unidad,a.id_unidad
FROM articulo a
JOIN unidad_medida um ON a.id_unidad = um.id_unidad
WHERE (a.codigo LIKE CONCAT('%', p_busqueda, '%') OR a.descripcion LIKE CONCAT('%', p_busqueda, '%'))
AND a.id_tipo_articulo = 2;
END$$

DROP PROCEDURE IF EXISTS `sp_buscar_articulos_embalado_y_embalaje`$$
CREATE PROCEDURE `sp_buscar_articulos_embalado_y_embalaje`(IN p_busqueda VARCHAR(100))
BEGIN
    SELECT a.id, a.codigo, a.descripcion, a.cantidad, a.precio_compra, a.precio_venta, a.peso_unitario,
        a.aroma, a.color, a.densidad, um.nombre AS unidad FROM articulo a
    JOIN unidad_medida um ON a.id_unidad = um.id_unidad
    WHERE (a.codigo LIKE CONCAT('%', p_busqueda, '%') OR a.descripcion LIKE CONCAT('%', p_busqueda, '%'))
      AND a.id_tipo_articulo = 4 AND a.cantidad > 0;
END$$

DROP PROCEDURE IF EXISTS `SP_VerLotesPorArticulo`$$
CREATE PROCEDURE SP_VerLotesPorArticulo(IN p_id_articulo INT)
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
CREATE PROCEDURE `sp_agregar_cliente`(IN p_tipo_documento VARCHAR(20), IN p_numero_documento VARCHAR(20), IN p_razon_social VARCHAR(150),
    IN p_direccion TEXT, IN p_telefono VARCHAR(20), IN p_correo VARCHAR(100))
BEGIN
    INSERT INTO cliente(tipoDocumento, n_documento, razonSocial, direccion, telefono, correo)
    VALUES (p_tipo_documento, p_numero_documento, p_razon_social, p_direccion, p_telefono, p_correo);
END$$

DROP PROCEDURE IF EXISTS `sp_actualizar_cliente`$$
CREATE PROCEDURE `sp_actualizar_cliente`(IN p_id INT, IN p_tipo_documento VARCHAR(20), IN p_numero_documento VARCHAR(20),
    IN p_razon_social VARCHAR(150), IN p_direccion TEXT, IN p_telefono VARCHAR(20), IN p_correo VARCHAR(100))
BEGIN
    UPDATE cliente SET tipoDocumento = p_tipo_documento, n_documento = p_numero_documento, razonSocial = p_razon_social,
        direccion = p_direccion, telefono = p_telefono, correo = p_correo
    WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS `sp_eliminar_cliente`$$
CREATE PROCEDURE `sp_eliminar_cliente`(IN p_id INT)
BEGIN
    DELETE FROM cliente WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS `sp_listar_clientes`$$
CREATE PROCEDURE `sp_listar_clientes`()
BEGIN
    SELECT id, tipoDocumento, n_documento, razonSocial, direccion, telefono, correo FROM cliente
    ORDER BY razonSocial ASC;
END$$

DROP PROCEDURE IF EXISTS `sp_buscar_cliente`$$
CREATE PROCEDURE `sp_buscar_cliente`(IN p_busqueda VARCHAR(100))
BEGIN
    SELECT id, tipoDocumento, n_documento, razonSocial, direccion, telefono, correo FROM cliente
    WHERE n_documento LIKE CONCAT('%', p_busqueda, '%') OR razonSocial LIKE CONCAT('%', p_busqueda, '%');
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_proveedor`$$
CREATE PROCEDURE `sp_agregar_proveedor`(IN p_ruc VARCHAR(20), IN p_razon_social VARCHAR(255), IN p_direccion VARCHAR(255),
    IN p_telefono VARCHAR(50), IN p_correo VARCHAR(100), IN p_ciudad VARCHAR(50))
BEGIN
    INSERT INTO proveedor(ruc, razonSocial, direccion, telefono, correo, ciudad)
    VALUES (p_ruc, p_razon_social, p_direccion, p_telefono, p_correo, p_ciudad);
END$$

DROP PROCEDURE IF EXISTS `sp_actualizar_proveedor`$$
CREATE PROCEDURE `sp_actualizar_proveedor`(IN p_id INT, IN p_ruc VARCHAR(20), IN p_razon_social VARCHAR(255), IN p_direccion VARCHAR(255),
    IN p_telefono VARCHAR(50), IN p_correo VARCHAR(100), IN p_ciudad VARCHAR(50))
BEGIN
    UPDATE proveedor SET ruc = p_ruc, razonSocial = p_razon_social, direccion = p_direccion, telefono = p_telefono, correo = p_correo, ciudad = p_ciudad
    WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS `sp_eliminar_proveedor`$$
CREATE PROCEDURE `sp_eliminar_proveedor`(IN p_id INT)
BEGIN
    DELETE FROM proveedor WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS `sp_listar_proveedores`$$
CREATE PROCEDURE `sp_listar_proveedores`()
BEGIN
    SELECT id, ruc, razonSocial, direccion, telefono, correo, ciudad FROM proveedor
    ORDER BY razonSocial ASC;
END$$

DROP PROCEDURE IF EXISTS `sp_buscar_proveedor`$$
CREATE PROCEDURE `sp_buscar_proveedor`(IN p_busqueda VARCHAR(100))
BEGIN
    SELECT id, ruc, razonSocial, direccion, telefono, correo, ciudad FROM proveedor
    WHERE ruc LIKE CONCAT('%', p_busqueda, '%') OR razonSocial LIKE CONCAT('%', p_busqueda, '%');
END$$

DROP PROCEDURE IF EXISTS `sp_insertar_caja_compra`$$
CREATE PROCEDURE `sp_insertar_caja_compra`( IN p_id_compra INT, IN p_nombre_caja VARCHAR(255), IN p_cantidad INT,
	IN p_costo_caja DECIMAL(12,2), OUT p_id_caja_compra INT)
BEGIN
    INSERT INTO caja_compra (id_compra, nombre_caja, cantidad, costo_caja)
    VALUES (p_id_compra, p_nombre_caja, p_cantidad, p_costo_caja);
    SET p_id_caja_compra = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_insertar_detalle_caja_compra`$$
CREATE PROCEDURE `sp_insertar_detalle_caja_compra`(IN p_id_caja_compra INT, IN p_id_articulo INT, IN p_cantidad DECIMAL(12,2))
BEGIN
    INSERT INTO detalle_caja_compra (id_caja_compra, id_articulo, cantidad) VALUES (p_id_caja_compra, p_id_articulo, p_cantidad);
END$$

DROP PROCEDURE IF EXISTS `sp_registrar_compra`$$
CREATE PROCEDURE `sp_registrar_compra`(IN p_id_proveedor INT, IN p_id_tipo_comprobante INT, IN p_serie VARCHAR(20), IN p_correlativo VARCHAR(50),
    IN p_fecha_emision DATE, IN p_fecha_vencimiento DATE, IN p_id_tipo_pago INT, IN p_id_forma_pago INT,
    IN p_id_moneda INT, IN p_tipo_cambio DECIMAL(10,4), IN p_incluye_igv BOOLEAN, IN p_hay_bonificacion BOOLEAN,
    IN p_hay_traslado BOOLEAN, IN p_observacion TEXT, IN p_subtotal DECIMAL(12,2), IN p_igv DECIMAL(12,2),
    IN p_total DECIMAL(12,2), IN p_total_peso DECIMAL(12,3), IN p_coste_transporte DECIMAL(12,2))
BEGIN
    INSERT INTO compra(id_proveedor, id_tipo_comprobante, serie, correlativo, fecha_emision, fecha_vencimiento, id_tipo_pago, id_forma_pago, id_moneda, tipo_cambio, incluye_igv, hay_bonificacion, hay_traslado, subtotal, igv, total, total_peso, coste_transporte, observacion)
    VALUES (p_id_proveedor, p_id_tipo_comprobante, p_serie, p_correlativo, p_fecha_emision, p_fecha_vencimiento, p_id_tipo_pago, p_id_forma_pago, p_id_moneda, p_tipo_cambio, p_incluye_igv, p_hay_bonificacion, p_hay_traslado, p_subtotal, p_igv, p_total, p_total_peso, p_coste_transporte, p_observacion);
    SELECT LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_detalle_compra`$$
CREATE PROCEDURE `sp_agregar_detalle_compra`(IN p_id_compra INT, IN p_id_articulo INT, IN p_id_unidad INT, IN p_cantidad DECIMAL(12,2), IN p_precio_unitario DECIMAL(12,2),
    IN p_bonificacion DECIMAL(12,2), IN p_coste_unitario_transporte DECIMAL(12,2), IN p_coste_total_transporte DECIMAL(12,2),
    IN p_precio_con_descuento DECIMAL(12,2), IN p_igv_insumo DECIMAL(12,2), IN p_total DECIMAL(12,2),
    IN p_peso_total DECIMAL(12,3), OUT p_id_detalle INT)
BEGIN
    INSERT INTO detalle_compra(id_compra, id_articulo, id_unidad, cantidad, precio_unitario, bonificacion, coste_unitario_transporte, coste_total_transporte, precio_con_descuento, igv_insumo, total, peso_total)
    VALUES (p_id_compra, p_id_articulo, p_id_unidad, p_cantidad, p_precio_unitario, p_bonificacion, p_coste_unitario_transporte, p_coste_total_transporte, p_precio_con_descuento, p_igv_insumo, p_total, p_peso_total);
    SET p_id_detalle = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_regla_compra`$$
CREATE PROCEDURE `sp_agregar_regla_compra`(IN p_id_compra INT, IN p_aplica_costo_adicional BOOLEAN,
IN p_monto_minimo DECIMAL(12,2), IN p_costo_adicional DECIMAL(12,2))
BEGIN
    INSERT INTO regla_aplicada_compra (id_compra, aplica_costo_adicional, monto_minimo_condicion, costo_adicional_aplicado)
    VALUES (p_id_compra, p_aplica_costo_adicional, p_monto_minimo, p_costo_adicional);
END$$

DROP PROCEDURE IF EXISTS `sp_registrar_lote_compra`$$
CREATE PROCEDURE `sp_registrar_lote_compra`(IN p_id_detalle_compra INT, IN p_id_articulo INT, IN p_codigo_lote VARCHAR(50),
    IN p_fecha_vencimiento DATE, IN p_cantidad_lote DECIMAL(12,2))
BEGIN
    INSERT INTO inventario_lote(id_articulo, id_detalle_compra, codigo_lote, fecha_vencimiento, cantidad_ingreso, cantidad_disponible)
    VALUES (p_id_articulo, p_id_detalle_compra, p_codigo_lote, p_fecha_vencimiento, p_cantidad_lote, p_cantidad_lote);
    UPDATE articulo SET cantidad = cantidad + p_cantidad_lote WHERE id = p_id_articulo;
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_referencia_compra`$$
CREATE PROCEDURE `sp_agregar_referencia_compra`(IN p_id_compra INT, IN p_numero_cotizacion VARCHAR(50), IN p_numero_pedido VARCHAR(50))
BEGIN
    INSERT INTO referencia_compra (id_compra, numero_cotizacion, numero_pedido)
    VALUES (p_id_compra, p_numero_cotizacion, p_numero_pedido);
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_guia_transporte_compra`$$
CREATE PROCEDURE `sp_agregar_guia_transporte_compra`(IN p_id_compra INT, IN p_ruc_guia VARCHAR(255), IN p_fecha_emision DATE,
    IN p_tipo_comprobante VARCHAR(50), IN p_serie VARCHAR(10), IN p_correlativo VARCHAR(20), IN p_ciudad_traslado VARCHAR(100),
    IN p_punto_partida VARCHAR(255), IN p_punto_llegada VARCHAR(255), IN p_serie_guia_transporte VARCHAR(10),
    IN p_correlativo_guia_transporte VARCHAR(20), IN p_coste_total_transporte DECIMAL(10, 2),
    IN p_peso DECIMAL(10, 2), IN p_fecha_pedido DATE, IN p_fecha_entrega DATE)
BEGIN
    INSERT INTO guia_transporte (id_compra, tipo_documento_ref, ruc_guia, fecha_emision, tipo_comprobante, serie, correlativo, ciudad_traslado, punto_partida, punto_llegada, serie_guia_transporte, correlativo_guia_transporte, coste_total_transporte, peso, fecha_pedido, fecha_entrega)
    VALUES (p_id_compra, 'compra', p_ruc_guia, p_fecha_emision, p_tipo_comprobante, p_serie, p_correlativo, p_ciudad_traslado, p_punto_partida, p_punto_llegada, p_serie_guia_transporte, p_correlativo_guia_transporte, p_coste_total_transporte, p_peso, p_fecha_pedido, p_fecha_entrega);
END$$

DROP PROCEDURE IF EXISTS `sp_listar_compras_final`$$
CREATE PROCEDURE `sp_listar_compras_final`()
BEGIN
    SELECT c.id_compra, c.fecha_emision, c.fecha_vencimiento, c.serie, c.correlativo, c.subtotal, c.igv, c.total,
    c.total_peso, c.coste_transporte, c.observacion, c.incluye_igv, c.hay_bonificacion, c.hay_traslado, c.tipo_cambio,
    tc.id AS id_tipo_comprobante, tc.nombre AS tipo_comprobante, mo.id_moneda AS id_moneda, mo.nombre AS moneda, tp.id AS id_tipo_pago,
    tp.nombre AS tipo_pago, fp.id AS id_forma_pago, fp.nombre AS forma_pago, p.id AS id_proveedor, p.ruc, p.razonSocial AS razon_social, p.direccion, p.telefono, p.correo, p.ciudad,
    dc.id_detalle, dc.cantidad, dc.precio_unitario, dc.bonificacion, dc.coste_unitario_transporte, dc.coste_total_transporte, dc.precio_con_descuento, dc.igv_insumo, dc.total AS total_detalle, dc.peso_total,
    a.id AS id_articulo, a.codigo AS codigo_articulo, a.descripcion AS descripcion_articulo, um.id_unidad AS id_unidad_articulo,
    um.nombre AS unidad_medida_articulo, il.id_lote, il.codigo_lote, il.cantidad_ingreso AS cantidad_lote, il.fecha_vencimiento AS fecha_vencimiento_lote,
    cc.id_caja_compra, cc.nombre_caja, cc.cantidad AS cantidad_total_articulos_caja, cc.costo_caja, dcc.id_detalle_caja,
    dcc.id_articulo AS id_articulo_en_caja, dcc.cantidad AS cantidad_en_caja, gt.id_guia, gt.tipo_documento_ref, gt.ruc_guia,
    gt.razon_social_guia, gt.fecha_emision AS fecha_emision_guia, gt.tipo_comprobante AS tipo_comprobante_guia, gt.serie AS serie_guia, gt.correlativo AS correlativo_guia,
    gt.serie_guia_transporte, gt.correlativo_guia_transporte, gt.ciudad_traslado, gt.punto_partida, gt.punto_llegada,
    gt.coste_total_transporte AS coste_transporte_guia, gt.peso AS peso_guia, gt.fecha_pedido, gt.fecha_entrega, rac.id AS id_regla_compra,
    rac.aplica_costo_adicional, rac.monto_minimo_condicion, rac.costo_adicional_aplicado, rc.id_referencia, rc.numero_cotizacion,
    rc.numero_pedido FROM compra c
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
CREATE PROCEDURE `sp_editar_compra`(IN p_id_compra INT, IN p_id_proveedor INT, IN p_id_comprobante INT, IN p_serie VARCHAR(20), IN p_correlativo VARCHAR(50),
    IN p_fecha_emision DATE, IN p_fecha_vencimiento DATE, IN p_id_pago INT, IN p_id_forma_pago INT,
    IN p_id_moneda INT, IN p_tipo_cambio DECIMAL(10,4), IN p_con_igv BOOLEAN, IN p_con_bonificacion BOOLEAN,
    IN p_con_traslado BOOLEAN, IN p_observacion TEXT, IN p_subtotal DECIMAL(12,2), IN p_igv DECIMAL(12,2),
    IN p_total DECIMAL(12,2), IN p_peso_total DECIMAL(12,3), IN p_costo_transporte DECIMAL(12,2))
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
CREATE PROCEDURE `sp_editar_articulo_detalle`(IN p_id_detalle INT, IN p_cantidad_nueva DECIMAL(12,2), IN p_precio_unitario DECIMAL(12,2), IN p_bonificacion DECIMAL(12,2),
    IN p_costo_unitario_transporte DECIMAL(12,2), IN p_costo_total_transporte DECIMAL(12,2), IN p_precio_descuento DECIMAL(12,2),
    IN p_igv_insumo DECIMAL(12,2), IN p_total DECIMAL(12,2), IN p_peso_total DECIMAL(12,3))
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
            IF v_id_lote IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Lote no encontrado.';
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
CREATE PROCEDURE `sp_actualizar_lote`(IN p_id_detalle_compra INT, IN p_codigo_lote_nuevo VARCHAR(50), IN p_fecha_vencimiento_nueva DATE)
BEGIN
    UPDATE inventario_lote SET codigo_lote = p_codigo_lote_nuevo, fecha_vencimiento = p_fecha_vencimiento_nueva
    WHERE id_detalle_compra = p_id_detalle_compra;
END$$

DROP PROCEDURE IF EXISTS `sp_editar_caja`$$
CREATE PROCEDURE `sp_editar_caja`(IN p_id_caja_compra INT, IN p_nombre_caja VARCHAR(100), IN p_cantidad_cajas INT, IN p_costo_caja DECIMAL(12,2))
BEGIN
    UPDATE caja_compra SET nombre_caja = p_nombre_caja, cantidad = p_cantidad_cajas, costo_caja = p_costo_caja
    WHERE id_caja_compra = p_id_caja_compra;
END$$

DROP PROCEDURE IF EXISTS `sp_editar_articulo_en_caja`$$
CREATE PROCEDURE `sp_editar_articulo_en_caja`(IN p_id_detalle_caja_compra INT, IN p_cantidad_nueva DECIMAL(12,2))
BEGIN
    DECLARE v_id_articulo INT; DECLARE v_cantidad_antigua DECIMAL(12,2); DECLARE v_diferencia_stock DECIMAL(12,2);
    START TRANSACTION;
    SELECT dcc.id_articulo, dcc.cantidad INTO v_id_articulo, v_cantidad_antigua FROM detalle_caja_compra dcc WHERE dcc.id_detalle_caja_compra = p_id_detalle_caja_compra FOR UPDATE;
    IF v_id_articulo IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Detalle de caja no encontrado.';
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
CREATE PROCEDURE `sp_editar_guia_transporte`(IN p_id_compra INT, IN p_ruc_guia VARCHAR(20), IN p_razon_social VARCHAR(255), IN p_fecha_emision DATE,
    IN p_tipo_comprobante VARCHAR(50), IN p_serie VARCHAR(10), IN p_correlativo VARCHAR(20), IN p_ciudad VARCHAR(100),
    IN p_partida VARCHAR(255), IN p_llegada VARCHAR(255), IN p_serie_guia VARCHAR(10), IN p_correlativo_guia VARCHAR(20),
    IN p_costo_total_transporte DECIMAL(10, 2), IN p_peso DECIMAL(10, 2), IN p_fecha_pedido DATE, IN p_fecha_entrega DATE)
BEGIN
    UPDATE guia_transporte SET ruc_guia = p_ruc_guia, razon_social_guia = p_razon_social, fecha_emision = p_fecha_emision, tipo_comprobante = p_tipo_comprobante, serie = p_serie, correlativo = p_correlativo, ciudad_traslado = p_ciudad, punto_partida = p_partida, punto_llegada = p_llegada, serie_guia_transporte = p_serie_guia, correlativo_guia_transporte = p_correlativo_guia, coste_total_transporte = p_costo_total_transporte, peso = p_peso, fecha_pedido = p_fecha_pedido, fecha_entrega = p_fecha_entrega
    WHERE id_compra = p_id_compra AND tipo_documento_ref = 'compra';
END$$

DROP PROCEDURE IF EXISTS `sp_consumir_stock_general_venta`$$
CREATE PROCEDURE `sp_consumir_stock_general_venta`(IN p_id_articulo INT, IN p_cantidad_a_consumir DECIMAL(12,2))
BEGIN
    DECLARE v_stock_actual INT; DECLARE v_cantidad_entera_consumir INT;
    SET v_cantidad_entera_consumir = CAST(p_cantidad_a_consumir AS UNSIGNED);
    IF p_cantidad_a_consumir != v_cantidad_entera_consumir THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: La cantidad a consumir en stock general debe ser un número entero para este artículo.';
    END IF;
    SELECT cantidad INTO v_stock_actual FROM articulo WHERE id = p_id_articulo;
    IF v_stock_actual < v_cantidad_entera_consumir THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Stock insuficiente en inventario general.';
    ELSE UPDATE articulo SET cantidad = cantidad - v_cantidad_entera_consumir WHERE id = p_id_articulo;
    END IF;
END$$

DROP PROCEDURE IF EXISTS `sp_consumir_stock_lote_venta`$$
CREATE PROCEDURE `sp_consumir_stock_lote_venta`(IN p_id_detalle_venta INT, IN p_id_articulo INT, IN p_cantidad_a_consumir DECIMAL(12,2))
BEGIN
    DECLARE v_cantidad_restante DECIMAL(12,2); DECLARE v_id_lote_actual INT; DECLARE v_disponible_lote DECIMAL(12,2);
    DECLARE v_cantidad_consumida DECIMAL(12,2); DECLARE finished BOOLEAN DEFAULT FALSE;
    DECLARE cur_lotes CURSOR FOR
        SELECT id_lote, cantidad_disponible FROM inventario_lote
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
    IF v_cantidad_restante > 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Stock insuficiente en lotes disponibles.';
    END IF;
    IF v_cantidad_restante = 0 AND MOD(p_cantidad_a_consumir, 1) = 0 THEN
        UPDATE articulo SET cantidad = cantidad - CAST(p_cantidad_a_consumir AS UNSIGNED) WHERE id = p_id_articulo;
    ELSEIF v_cantidad_restante = 0 AND MOD(p_cantidad_a_consumir, 1) != 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: La cantidad consumida de lotes no fue un número entero, lo cual es requerido para actualizar el stock general del artículo.';
    END IF;
END$$

DROP PROCEDURE IF EXISTS `sp_registrar_despacho_empaque`$$
CREATE PROCEDURE `sp_registrar_despacho_empaque`(IN p_id_detalle_venta INT, IN p_cantidad_vendida DECIMAL(12,2), IN p_id_articulo INT)
BEGIN
    DECLARE v_unidades_por_caja DECIMAL(12,2);
    DECLARE v_cajas_completas DECIMAL(12,2);
    DECLARE v_unidades_sueltas DECIMAL(12,2);
    SELECT unidades_por_caja INTO v_unidades_por_caja FROM articulo_empaque_estandar WHERE id_articulo = p_id_articulo;
    IF v_unidades_por_caja IS NULL THEN SET v_unidades_por_caja = 0;
    END IF;
    IF v_unidades_por_caja > 0 THEN
        SET v_cajas_completas = FLOOR(p_cantidad_vendida / v_unidades_por_caja);
        SET v_unidades_sueltas = p_cantidad_vendida - (v_cajas_completas * v_unidades_por_caja);
    ELSE SET v_cajas_completas = 0;
    SET v_unidades_sueltas = p_cantidad_vendida;
    END IF;
    INSERT INTO despacho_venta_empaque (id_detalle_venta, cajas_completas_despachadas, unidades_sueltas_despachadas)
    VALUES (p_id_detalle_venta, v_cajas_completas, v_unidades_sueltas);
    SELECT v_cajas_completas AS cajas, v_unidades_sueltas AS sueltas;
END$$

DROP PROCEDURE IF EXISTS `sp_gestionar_consumo_stock_venta`$$
CREATE PROCEDURE `sp_gestionar_consumo_stock_venta`(IN p_id_detalle_venta INT, IN p_id_articulo INT, IN p_cantidad_a_consumir DECIMAL(12,2))
BEGIN
    DECLARE v_usa_lotes BOOLEAN;
    SELECT EXISTS (SELECT 1 FROM inventario_lote WHERE id_articulo = p_id_articulo AND cantidad_disponible > 0) INTO v_usa_lotes;
    IF v_usa_lotes THEN
        IF MOD(p_cantidad_a_consumir, 1) != 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: No se pueden consumir cantidades decimales si el artículo tiene stock entero y se gestiona por lotes.';
        END IF;
        CALL `sp_consumir_stock_lote_venta`(p_id_detalle_venta, p_id_articulo, p_cantidad_a_consumir);
    ELSE
        CALL `sp_consumir_stock_general_venta`(p_id_articulo, p_cantidad_a_consumir);
    END IF;
    CALL `sp_registrar_despacho_empaque`(p_id_detalle_venta, p_cantidad_a_consumir, p_id_articulo);
END$$

DROP PROCEDURE IF EXISTS `sp_registrar_venta`$$
CREATE PROCEDURE `sp_registrar_venta`(IN p_id_cliente INT, IN p_id_tipo_comprobante INT, IN p_serie VARCHAR(20), IN p_correlativo VARCHAR(50),
    IN p_id_moneda INT, IN p_fecha_emision DATE, IN p_fecha_vencimiento DATE, IN p_id_tipo_pago INT, IN p_estado_venta VARCHAR(50),
    IN p_tipo_descuento ENUM('global', 'item'), IN p_aplica_igv BOOLEAN, IN p_observaciones TEXT, IN p_subtotal DECIMAL(12,2),
    IN p_igv DECIMAL(12,2), IN p_descuento_total DECIMAL(12,2), IN p_total_final DECIMAL(12,2), IN p_total_peso DECIMAL(12,3),
    IN p_hay_traslado BOOLEAN, OUT p_id_venta INT)
BEGIN
    INSERT INTO venta(id_cliente, id_tipo_comprobante, serie, correlativo, id_moneda, fecha_emision, fecha_vencimiento, id_tipo_pago, estado_venta, tipo_descuento, aplica_igv, observaciones, subtotal, igv, descuento_total, total_final, total_peso, hay_traslado)
    VALUES (p_id_cliente, p_id_tipo_comprobante, p_serie, p_correlativo, p_id_moneda, p_fecha_emision, p_fecha_vencimiento, p_id_tipo_pago, p_estado_venta, p_tipo_descuento, p_aplica_igv, p_observaciones, p_subtotal, p_igv, p_descuento_total, p_total_final, p_total_peso, p_hay_traslado);
    SET p_id_venta = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_detalle_venta`$$
CREATE PROCEDURE `sp_agregar_detalle_venta`(IN p_id_venta INT, IN p_id_articulo INT, IN p_id_unidad INT, IN p_descripcion VARCHAR(255),
    IN p_cantidad DECIMAL(12,2),IN p_peso_unitario DECIMAL(10,3), IN p_precio_unitario DECIMAL(12,2), IN p_descuento_monto DECIMAL(12,2),
    IN p_subtotal DECIMAL(12,2), IN p_total DECIMAL(12,2), OUT p_id_detalle_venta INT)
BEGIN
    INSERT INTO detalle_venta(id_venta, id_articulo, id_unidad, descripcion, cantidad, peso_unitario, precio_unitario, descuento_monto, subtotal, total)
    VALUES (p_id_venta, p_id_articulo, p_id_unidad, p_descripcion, p_cantidad, p_peso_unitario, p_precio_unitario, p_descuento_monto, p_subtotal, p_total);
    SET p_id_detalle_venta = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_descuento_global_venta`$$
CREATE PROCEDURE `sp_agregar_descuento_global_venta`(IN p_id_venta INT, IN p_motivo VARCHAR(255),
    IN p_tipo_valor ENUM('porcentaje', 'soles'), IN p_valor DECIMAL(12,2), IN p_tasa_igv DECIMAL(5,2))
BEGIN
    DECLARE v_tasa_igv_default DECIMAL(5,2);
    SET v_tasa_igv_default = IFNULL(p_tasa_igv, 0.18);
    INSERT INTO descuento (id_venta, motivo, tipo_aplicacion, tipo_valor, valor, tasa_igv)
    VALUES (p_id_venta, p_motivo, 'global', p_tipo_valor, p_valor, v_tasa_igv_default);
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_descuento_item_venta`$$
CREATE PROCEDURE `sp_agregar_descuento_item_venta`(IN p_id_detalle_venta INT, IN p_motivo VARCHAR(255),
    IN p_tipo_valor ENUM('porcentaje', 'soles'), IN p_valor DECIMAL(12,2), IN p_tasa_igv DECIMAL(5,2))
BEGIN
    DECLARE v_tasa_igv_default DECIMAL(5,2);
    SET v_tasa_igv_default = IFNULL(p_tasa_igv, 0.18);
    INSERT INTO descuento (id_detalle_venta, motivo, tipo_aplicacion, tipo_valor, valor, tasa_igv)
    VALUES (p_id_detalle_venta, p_motivo, 'item', p_tipo_valor, p_valor, v_tasa_igv_default);
END$$

DROP PROCEDURE IF EXISTS `sp_registrar_guia_transporte_venta`$$
CREATE PROCEDURE `sp_registrar_guia_transporte_venta`(IN p_id_venta INT, IN p_modalidad_transporte ENUM('publico', 'privado'), IN p_peso DECIMAL(12,3),
    IN p_ruc_empresa VARCHAR(20), IN p_razon_social_empresa VARCHAR(255), IN p_marca_vehiculo VARCHAR(100),
    IN p_dni_conductor VARCHAR(20), IN p_nombre_conductor VARCHAR(255), IN p_punto_partida VARCHAR(255),
    IN p_punto_llegada VARCHAR(255), IN p_fecha_traslado DATE, IN p_observaciones TEXT,
    IN p_conformidad_nombre VARCHAR(255), IN p_conformidad_dni VARCHAR(20))
BEGIN
    INSERT INTO guia_transporte (id_venta, tipo_documento_ref, peso, fecha_traslado, observaciones, modalidad_transporte, ruc_empresa, razon_social_empresa, marca_vehiculo, dni_conductor, nombre_conductor, punto_partida, punto_llegada)
    VALUES (p_id_venta, 'venta', p_peso, p_fecha_traslado, p_observaciones, p_modalidad_transporte, p_ruc_empresa, p_razon_social_empresa, p_marca_vehiculo, p_dni_conductor, p_nombre_conductor, p_punto_partida, p_punto_llegada);
    INSERT INTO conformidad_cliente (id_venta, nombre_cliente_confirma, dni_cliente_confirma, tipo_entrega)
    VALUES (p_id_venta, p_conformidad_nombre, p_conformidad_dni, 'remision');
END$$

DROP PROCEDURE IF EXISTS `sp_registrar_conformidad_tienda`$$
CREATE PROCEDURE `sp_registrar_conformidad_tienda`(IN p_id_venta INT, IN p_nombre_cliente_confirma VARCHAR(255), IN p_dni_cliente_confirma VARCHAR(20))
BEGIN
    INSERT INTO conformidad_cliente (id_venta, nombre_cliente_confirma, dni_cliente_confirma, tipo_entrega)
    VALUES (p_id_venta, p_nombre_cliente_confirma, p_dni_cliente_confirma, 'tienda');
END$$

DROP PROCEDURE IF EXISTS `sp_listar_ventas_final`$$
CREATE PROCEDURE `sp_listar_ventas_final`()
BEGIN
    SELECT v.id_venta, v.serie, v.correlativo, v.fecha_emision, v.fecha_vencimiento, v.estado_venta, v.tipo_descuento AS venta_tipo_descuento, v.aplica_igv, v.observaciones AS venta_observaciones, v.subtotal AS venta_subtotal, v.igv AS venta_igv, v.descuento_total AS venta_descuento_total, v.total_final, v.total_peso AS venta_total_peso, v.hay_traslado,
        tc.nombre AS tipo_comprobante, m.nombre AS moneda_nombre, m.simbolo AS moneda_simbolo, tp.nombre AS tipo_pago_nombre,
        c.id AS id_cliente, c.razonSocial AS cliente_razon_social, c.n_documento AS cliente_documento, c.direccion AS cliente_direccion, c.telefono AS cliente_telefono, c.correo AS cliente_correo,
        dv.id_detalle AS id_detalle_venta, dv.descripcion AS detalle_descripcion, dv.cantidad AS detalle_cantidad, dv.peso_unitario AS detalle_peso_unitario, dv.precio_unitario AS detalle_precio_unitario, dv.descuento_monto AS detalle_descuento_monto, dv.subtotal AS detalle_subtotal, dv.total AS detalle_total,
        a.id AS id_articulo, a.codigo AS articulo_codigo, u.nombre AS unidad_medida_nombre, d.id_descuento, d.motivo AS descuento_motivo,
        d.tipo_aplicacion AS descuento_aplicacion, d.tipo_valor AS descuento_tipo_valor, d.valor AS descuento_valor, d.tasa_igv AS descuento_tasa_igv,
        lv.id_lote_venta, il.id_lote, il.codigo_lote, il.fecha_vencimiento AS lote_fecha_vencimiento, lv.cantidad AS lote_cantidad_consumida,
        gt.id_guia, gt.fecha_traslado, gt.modalidad_transporte, gt.ruc_empresa AS transporte_ruc_empresa, gt.razon_social_empresa AS transporte_razon_social, gt.dni_conductor AS transporte_dni_conductor, gt.nombre_conductor AS transporte_nombre_conductor, gt.punto_partida, gt.punto_llegada,
        cc.nombre_cliente_confirma, cc.dni_cliente_confirma, cc.tipo_entrega, dve.cajas_completas_despachadas, dve.unidades_sueltas_despachadas
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
    LEFT JOIN despacho_venta_empaque dve ON dv.id_detalle = dve.id_detalle_venta
    ORDER BY v.id_venta DESC, dv.id_detalle ASC;
END$$

DROP PROCEDURE IF EXISTS `sp_registrar_gasto`$$
CREATE PROCEDURE `sp_registrar_gasto`(IN p_id_proveedor INT, IN p_id_tipo_gasto INT, IN p_motivo VARCHAR(100), IN p_placa VARCHAR(50),
    IN p_fecha DATE, IN p_id_moneda INT, IN p_subtotal DECIMAL(12,2), IN p_igv DECIMAL(12,2),
    IN p_total DECIMAL(12,2), IN p_observacion TEXT, IN p_total_peso DECIMAL(12,3), OUT p_id_gasto INT)
BEGIN
    INSERT INTO gasto (id_proveedor, id_tipo_gasto, motivo, placa, fecha, id_moneda, subtotal, igv, total, observacion, total_peso)
    VALUES (p_id_proveedor, p_id_tipo_gasto, p_motivo, p_placa, p_fecha, p_id_moneda, p_subtotal, p_igv, p_total, p_observacion, p_total_peso);
    SET p_id_gasto = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_detalle_gasto`$$
CREATE PROCEDURE `sp_agregar_detalle_gasto`(IN p_id_gasto INT, IN p_descripcion VARCHAR(255), IN p_cantidad DECIMAL(12,2), IN p_id_unidad INT,
    IN p_peso_unitario DECIMAL(10,3), IN p_precio_unitario DECIMAL(12,2), IN p_subtotal DECIMAL(12,2),
    IN p_igv DECIMAL(12,2), IN p_total DECIMAL(12,2))
BEGIN
    INSERT INTO detalle_gasto (id_gasto, descripcion, cantidad, id_unidad, peso_unitario, precio_unitario, subtotal, igv, total)
    VALUES (p_id_gasto, p_descripcion, p_cantidad, p_id_unidad, p_peso_unitario, p_precio_unitario, p_subtotal, p_igv, p_total);
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_documento_gasto`$$
CREATE PROCEDURE `sp_agregar_documento_gasto`(IN p_id_gasto INT, IN p_id_tipo_comprobante INT, IN p_serie VARCHAR(20),
    IN p_correlativo VARCHAR(50), IN p_fecha_emision DATE)
BEGIN
    INSERT INTO documento_gasto (id_gasto, id_tipo_comprobante, serie, correlativo, fecha_emision)
    VALUES (p_id_gasto, p_id_tipo_comprobante, p_serie, p_correlativo, p_fecha_emision);
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_descuento_global`$$
CREATE PROCEDURE `sp_agregar_descuento_global`(IN p_id_compra INT, IN p_id_venta INT, IN p_motivo VARCHAR(255),
    IN p_tipo_valor ENUM('porcentaje', 'soles'), IN p_valor DECIMAL(12,2), IN p_tasa_igv DECIMAL(5,2))
BEGIN
    INSERT INTO descuento (id_compra, id_venta, motivo, tipo_aplicacion, tipo_valor, valor, tasa_igv)
    VALUES (p_id_compra, p_id_venta, p_motivo, 'global', p_tipo_valor, p_valor, p_tasa_igv);
END$$

DROP PROCEDURE IF EXISTS `sp_agregar_descuento_item`$$
CREATE PROCEDURE `sp_agregar_descuento_item`(IN p_id_detalle_compra INT, IN p_id_detalle_venta INT, IN p_motivo VARCHAR(255),
    IN p_tipo_valor ENUM('porcentaje', 'soles'), IN p_valor DECIMAL(12,2), IN p_tasa_igv DECIMAL(5,2))
BEGIN
    INSERT INTO descuento (id_detalle_compra, id_detalle_venta, motivo, tipo_aplicacion, tipo_valor, valor, tasa_igv)
    VALUES (p_id_detalle_compra, p_id_detalle_venta, p_motivo, 'item', p_tipo_valor, p_valor, p_tasa_igv);
END$$

DROP PROCEDURE IF EXISTS sp_crear_receta$$
CREATE PROCEDURE sp_crear_receta(IN p_id_prod_maestro INT, IN p_cant_prod DECIMAL(12,4), IN p_id_uni_prod INT)
BEGIN
INSERT INTO receta_producto (id_producto_maestro, cantidad_producir, id_unidad_producir, estado)
VALUES (p_id_prod_maestro, p_cant_prod, p_id_uni_prod, 'Activa');
SELECT LAST_INSERT_ID() AS id_receta;
END$$

DROP PROCEDURE IF EXISTS sp_detalle_receta$$
CREATE PROCEDURE sp_detalle_receta(IN p_id_receta INT, IN p_id_art_insumo INT, IN p_cant_req DECIMAL(12,6), IN p_id_uni_insumo INT)
BEGIN
INSERT INTO detalle_receta (id_receta, id_articulo_insumo, cantidad_requerida, id_unidad_insumo)
VALUES (p_id_receta, p_id_art_insumo, p_cant_req, p_id_uni_insumo);
END$$

DROP PROCEDURE IF EXISTS sp_listar_recetas_con_detalles$$
CREATE PROCEDURE sp_listar_recetas_con_detalles()
BEGIN
    SELECT RP.id_receta, RP.id_producto_maestro, PM.nombre_generico, RP.cantidad_producir AS receta_cantidad_base,
        UM.nombre AS unidad_producir_nombre, RP.fecha_creacion AS fecha_creacion, RP.estado
    FROM receta_producto RP
    JOIN producto_maestro PM ON RP.id_producto_maestro = PM.id_producto_maestro
    JOIN unidad_medida UM ON RP.id_unidad_producir = UM.id_unidad
    ORDER BY RP.id_receta DESC;
END$$

DROP PROCEDURE IF EXISTS sp_actualizar_insumo_receta$$
CREATE PROCEDURE sp_actualizar_insumo_receta(IN p_id_detalle_receta INT, IN p_cant_req DECIMAL(12,6), IN p_id_uni_insumo INT)
BEGIN
UPDATE detalle_receta SET cantidad_requerida = p_cant_req, id_unidad_insumo = p_id_uni_insumo
WHERE id_detalle_receta = p_id_detalle_receta;
END$$

DROP PROCEDURE IF EXISTS sp_eliminar_detalle_receta_individual$$
CREATE PROCEDURE sp_eliminar_detalle_receta_individual(IN p_id_detalle_receta INT)
BEGIN
DELETE FROM detalle_receta
WHERE id_detalle_receta = p_id_detalle_receta;
END$$

DROP PROCEDURE IF EXISTS sp_desactivar_receta$$
CREATE PROCEDURE sp_desactivar_receta(IN p_id_receta INT)
BEGIN
UPDATE receta_producto SET estado = 'Inactiva'
WHERE id_receta = p_id_receta;
END$$

DROP PROCEDURE IF EXISTS `sp_obtener_receta_por_nombre_generico`$$
CREATE PROCEDURE `sp_obtener_receta_por_nombre_generico`(IN p_nombre_generico VARCHAR(150))
BEGIN
    SELECT DISTINCT pm.id_producto_maestro, pm.nombre_generico, rp.id_receta,
        rp.cantidad_producir AS receta_cantidad_base, um_prod.nombre AS unidad_producir_nombre
    FROM producto_maestro pm
    INNER JOIN receta_producto rp ON pm.id_producto_maestro = rp.id_producto_maestro
    INNER JOIN unidad_medida um_prod ON rp.id_unidad_producir = um_prod.id_unidad
    WHERE pm.nombre_generico LIKE CONCAT('%', p_nombre_generico, '%')
    ORDER BY pm.nombre_generico;
END$$

DROP PROCEDURE IF EXISTS sp_obtener_insumos_por_id_receta$$
CREATE PROCEDURE sp_obtener_insumos_por_id_receta(IN p_id_receta INT)
BEGIN
    SELECT a.id AS id_articulo, a.codigo, a.descripcion AS nombre_articulo,
        dr.cantidad_requerida, dr.id_unidad_insumo AS id_unidad, um.nombre AS unidad_nombre
    FROM detalle_receta dr
    INNER JOIN articulo a ON dr.id_articulo_insumo = a.id
    INNER JOIN unidad_medida um ON dr.id_unidad_insumo = um.id_unidad
    WHERE dr.id_receta = p_id_receta;
END$$

DROP PROCEDURE IF EXISTS sp_crear_orden$$
CREATE PROCEDURE sp_crear_orden(IN p_id_receta INT, IN p_id_articulo_producido INT,  IN p_cant_prod DECIMAL(12,2),
     IN p_cant_prod_final_real DECIMAL(12,2), IN p_fecha_ini DATE, IN p_obs TEXT)
BEGIN
    INSERT INTO orden_produccion (id_receta, id_articulo_producido, fecha_creacion, fecha_inicio_programada, cantidad_a_producir, cantidad_producida_final_real, id_unidad_producir, estado, observaciones)
    SELECT p_id_receta, p_id_articulo_producido, NOW(), p_fecha_ini, p_cant_prod, p_cant_prod_final_real, id_unidad_producir, 'Pendiente', p_obs
    FROM receta_producto
    WHERE id_receta = p_id_receta;

    IF ROW_COUNT() = 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: La receta especificada no existe.';
    ELSE SELECT LAST_INSERT_ID() AS id_orden;
    END IF;
END$$

DROP PROCEDURE IF EXISTS sp_consumir_stock_general_produccion$$
CREATE PROCEDURE sp_consumir_stock_general_produccion(IN p_id_orden INT, IN p_id_articulo INT,
    IN p_cantidad_a_consumir DECIMAL(12,8), IN p_id_unidad INT, IN p_es_envase BOOLEAN, IN p_comentario_consumo TEXT,
    IN p_cant_req_orden_base DECIMAL(12,8), IN p_id_unidad_req_receta INT)
BEGIN
    DECLARE v_stock_actual DECIMAL(12,8); DECLARE v_densidad DECIMAL(12,8); DECLARE v_factor_conversion_consumo DECIMAL(12,8);
    DECLARE v_factor_conversion_req DECIMAL(12,8); DECLARE v_cant_en_kg DECIMAL(12,8); DECLARE v_cant_req_en_kg DECIMAL(12,8);
    DECLARE v_desviacion_kg DECIMAL(12,8); DECLARE v_id_unidad_kg INT;

    SELECT id_unidad INTO v_id_unidad_kg FROM unidad_medida WHERE abreviatura = 'KG' LIMIT 1;

    SELECT a.densidad, u.factor_a_kg INTO v_densidad, v_factor_conversion_consumo FROM articulo a
    JOIN unidad_medida u ON p_id_unidad = u.id_unidad
    WHERE a.id = p_id_articulo;

    SELECT factor_a_kg INTO v_factor_conversion_req FROM unidad_medida
    WHERE id_unidad = p_id_unidad_req_receta;

    IF p_id_unidad = 3 THEN SET v_cant_en_kg = p_cantidad_a_consumir * v_densidad / 1000;
    ELSE SET v_cant_en_kg = p_cantidad_a_consumir * v_factor_conversion_consumo;
    END IF;

    IF p_id_unidad_req_receta = 3 THEN SET v_cant_req_en_kg = p_cant_req_orden_base * v_densidad / 1000;
    ELSE SET v_cant_req_en_kg = p_cant_req_orden_base * v_factor_conversion_req;
    END IF;

    SET v_desviacion_kg = v_cant_en_kg - v_cant_req_en_kg;
    SELECT cantidad INTO v_stock_actual FROM articulo WHERE id = p_id_articulo;

    IF v_stock_actual < v_cant_en_kg THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Stock insuficiente en inventario general (en KG).';
    ELSE
        UPDATE articulo SET cantidad = cantidad - v_cant_en_kg WHERE id = p_id_articulo;

        INSERT INTO consumo_produccion (id_orden, id_articulo_consumido, cantidad_consumida, id_unidad_consumida, es_envase_embalaje, comentario_consumo,
            cantidad_requerida_kg, desviacion_kg)
        VALUES (p_id_orden, p_id_articulo, v_cant_en_kg, v_id_unidad_kg, p_es_envase, p_comentario_consumo,
            v_cant_req_en_kg, v_desviacion_kg);
    END IF;
END$$

DROP PROCEDURE IF EXISTS sp_consumir_stock_lote_produccion$$
CREATE PROCEDURE sp_consumir_stock_lote_produccion(IN p_id_orden INT, IN p_id_articulo INT, IN p_cantidad_a_consumir DECIMAL(12,8), IN p_id_unidad INT,
    IN p_es_envase BOOLEAN, IN p_comentario_consumo TEXT, IN p_cant_req_orden_base DECIMAL(12,8), IN p_id_unidad_req_receta INT)
BEGIN
    DECLARE v_cantidad_restante DECIMAL(12,8); DECLARE v_id_lote_actual INT; DECLARE v_disponible_lote DECIMAL(12,8);
    DECLARE v_cantidad_consumida DECIMAL(12,8); DECLARE v_cantidad_total_en_kg DECIMAL(12,8); DECLARE v_densidad DECIMAL(12,8);
    DECLARE v_factor_conversion_consumo DECIMAL(12,8); DECLARE v_factor_conversion_req DECIMAL(12,8);
    DECLARE finished BOOLEAN DEFAULT FALSE; DECLARE v_id_unidad_kg INT; DECLARE v_cant_req_en_kg DECIMAL(12,8);
    DECLARE v_desviacion_kg DECIMAL(12,8);

    DECLARE cur_lotes CURSOR FOR
        SELECT id_lote, cantidad_disponible FROM inventario_lote
        WHERE id_articulo = p_id_articulo AND cantidad_disponible > 0
        ORDER BY fecha_ingreso ASC;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET finished = TRUE;

    SELECT id_unidad INTO v_id_unidad_kg FROM unidad_medida WHERE abreviatura = 'KG' LIMIT 1;
    SELECT a.densidad, u.factor_a_kg INTO v_densidad, v_factor_conversion_consumo FROM articulo a
    JOIN unidad_medida u ON p_id_unidad = u.id_unidad
    WHERE a.id = p_id_articulo;

    SELECT factor_a_kg INTO v_factor_conversion_req FROM unidad_medida
    WHERE id_unidad = p_id_unidad_req_receta;

    IF p_id_unidad = 3 THEN SET v_cantidad_total_en_kg = p_cantidad_a_consumir * v_densidad / 1000;
    ELSE SET v_cantidad_total_en_kg = p_cantidad_a_consumir * v_factor_conversion_consumo;
    END IF;

    IF p_id_unidad_req_receta = 3 THEN SET v_cant_req_en_kg = p_cant_req_orden_base * v_densidad / 1000;
    ELSE SET v_cant_req_en_kg = p_cant_req_orden_base * v_factor_conversion_req;
    END IF;

    SET v_desviacion_kg = v_cantidad_total_en_kg - v_cant_req_en_kg;
    SET v_cantidad_restante = v_cantidad_total_en_kg;
    OPEN cur_lotes;

    lote_consumo_prod_loop: LOOP
        FETCH cur_lotes INTO v_id_lote_actual, v_disponible_lote;
        IF finished OR v_cantidad_restante <= 0 THEN LEAVE lote_consumo_prod_loop; END IF;

        SET v_cantidad_consumida = LEAST(v_cantidad_restante, v_disponible_lote);
        UPDATE inventario_lote SET cantidad_disponible = cantidad_disponible - v_cantidad_consumida WHERE id_lote = v_id_lote_actual;

        INSERT INTO consumo_produccion (id_orden, id_articulo_consumido, id_lote_consumido, cantidad_consumida, id_unidad_consumida, es_envase_embalaje, comentario_consumo,
            cantidad_requerida_kg, desviacion_kg)
        VALUES (p_id_orden, p_id_articulo, v_id_lote_actual, v_cantidad_consumida, v_id_unidad_kg, p_es_envase, p_comentario_consumo,
            v_cant_req_en_kg, v_desviacion_kg);

        SET v_cantidad_restante = v_cantidad_restante - v_cantidad_consumida;
    END LOOP lote_consumo_prod_loop;
    CLOSE cur_lotes;

    IF v_cantidad_restante > 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Stock insuficiente en lotes disponibles para el consumo de producción (en KG).';
    END IF;

    UPDATE articulo SET cantidad = cantidad - v_cantidad_total_en_kg WHERE id = p_id_articulo;
END$$

DROP PROCEDURE IF EXISTS sp_gestionar_consumo_mp$$
CREATE PROCEDURE sp_gestionar_consumo_mp(IN p_id_orden INT)
BEGIN
    DECLARE v_factor DECIMAL(12,8); DECLARE v_id_articulo_insumo INT; DECLARE v_cantidad_requerida_base DECIMAL(12,8);
    DECLARE v_id_unidad_insumo INT; DECLARE v_cantidad_a_consumir DECIMAL(12,8); DECLARE finished BOOLEAN DEFAULT FALSE;
    DECLARE v_cantidad_a_producir DECIMAL(12,2); DECLARE v_cantidad_base DECIMAL(12,2); DECLARE v_usa_lotes BOOLEAN;

    DECLARE cur_detalles CURSOR FOR
        SELECT dr.id_articulo_insumo, dr.cantidad_requerida, dr.id_unidad_insumo FROM orden_produccion op
        JOIN receta_producto rp ON op.id_receta = rp.id_receta
        JOIN detalle_receta dr ON rp.id_receta = dr.id_receta
        WHERE op.id_orden = p_id_orden;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET finished = TRUE;

    SELECT op.cantidad_a_producir, rp.cantidad_producir INTO v_cantidad_a_producir, v_cantidad_base
    FROM orden_produccion op
    JOIN receta_producto rp ON op.id_receta = rp.id_receta
    WHERE op.id_orden = p_id_orden;

    IF v_cantidad_base IS NULL OR v_cantidad_base = 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Receta no válida o cantidad base cero.';
    END IF;

    SET v_factor = v_cantidad_a_producir / v_cantidad_base;
    OPEN cur_detalles;

    mp_consumo_loop: LOOP
        FETCH cur_detalles INTO v_id_articulo_insumo, v_cantidad_requerida_base, v_id_unidad_insumo;
        IF finished THEN LEAVE mp_consumo_loop; END IF;

        SET v_cantidad_a_consumir = v_cantidad_requerida_base * v_factor;

        SELECT EXISTS (SELECT 1 FROM inventario_lote WHERE id_articulo = v_id_articulo_insumo AND cantidad_disponible > 0) INTO v_usa_lotes;

        IF v_usa_lotes THEN CALL sp_consumir_stock_lote_produccion(p_id_orden, v_id_articulo_insumo, v_cantidad_a_consumir, v_id_unidad_insumo, FALSE, NULL, v_cantidad_a_consumir, v_id_unidad_insumo);
        ELSE  CALL sp_consumir_stock_general_produccion(p_id_orden, v_id_articulo_insumo, v_cantidad_a_consumir, v_id_unidad_insumo, FALSE, NULL, v_cantidad_a_consumir, v_id_unidad_insumo);
        END IF;
    END LOOP mp_consumo_loop;
    CLOSE cur_detalles;

    UPDATE orden_produccion SET estado = 'En Proceso' WHERE id_orden = p_id_orden AND estado = 'Pendiente';
END$$

DROP PROCEDURE IF EXISTS sp_registrar_consumo_produccion_componente$$
CREATE PROCEDURE sp_registrar_consumo_produccion_componente(IN p_id_orden INT, IN p_id_articulo_consumido INT,
    IN p_cantidad_a_consumir DECIMAL(12,8), IN p_id_unidad INT, IN p_es_envase BOOLEAN, IN p_comentario_consumo TEXT)
BEGIN
    DECLARE v_usa_lotes BOOLEAN; DECLARE v_id_receta INT; DECLARE v_cantidad_a_producir DECIMAL(12,2);
    DECLARE v_cantidad_base_receta DECIMAL(12,2); DECLARE v_factor_escala DECIMAL(12,8); DECLARE v_cant_req_receta DECIMAL(12,8);
    DECLARE v_id_unidad_req_receta INT; DECLARE v_cant_req_orden_base DECIMAL(12,8);

    SELECT op.id_receta, op.cantidad_a_producir, rp.cantidad_producir INTO v_id_receta, v_cantidad_a_producir, v_cantidad_base_receta
    FROM orden_produccion op
    JOIN receta_producto rp ON op.id_receta = rp.id_receta
    WHERE op.id_orden = p_id_orden;

    IF v_cantidad_base_receta IS NULL OR v_cantidad_base_receta = 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Receta no válida o cantidad base cero.';
    END IF;
    SET v_factor_escala = v_cantidad_a_producir / v_cantidad_base_receta;

    SELECT dr.cantidad_requerida, dr.id_unidad_insumo INTO v_cant_req_receta, v_id_unidad_req_receta
    FROM detalle_receta dr
    WHERE dr.id_receta = v_id_receta AND dr.id_articulo_insumo = p_id_articulo_consumido;

    IF v_cant_req_receta IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: El artículo consumido no es parte de la receta.';
    END IF;

    SET v_cant_req_orden_base = v_cant_req_receta * v_factor_escala;

    SELECT EXISTS (SELECT 1 FROM inventario_lote WHERE id_articulo = p_id_articulo_consumido AND cantidad_disponible > 0) INTO v_usa_lotes;

    IF v_usa_lotes THEN
        CALL sp_consumir_stock_lote_produccion(p_id_orden, p_id_articulo_consumido, p_cantidad_a_consumir, p_id_unidad, p_es_envase, p_comentario_consumo,
            v_cant_req_orden_base, v_id_unidad_req_receta);
    ELSE
        CALL sp_consumir_stock_general_produccion(p_id_orden, p_id_articulo_consumido, p_cantidad_a_consumir, p_id_unidad, p_es_envase, p_comentario_consumo,
            v_cant_req_orden_base, v_id_unidad_req_receta);
    END IF;

    UPDATE orden_produccion SET estado = 'En Proceso (Componentes)'
    WHERE id_orden = p_id_orden AND estado IN ('Pendiente', 'En Proceso');

    SELECT 'Consumo de componente registrado correctamente.' AS resultado;
END$$

DROP PROCEDURE IF EXISTS sp_gestionar_consumo_envase$$
CREATE PROCEDURE sp_gestionar_consumo_envase(IN p_id_orden INT, IN p_merma_cantidad DECIMAL(12,2), IN p_envases_sueltos DECIMAL(12,2))
BEGIN
    UPDATE orden_produccion SET merma_total = p_merma_cantidad, envases_sueltos_cantidad = p_envases_sueltos, estado = 'Empaque Cerrado'
    WHERE id_orden = p_id_orden;

    IF ROW_COUNT() = 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Orden de producción no encontrada para registrar merma y envases sueltos.';
    ELSE SELECT 'Merma y envases sueltos registrados, etapa de empaque cerrada.' AS resultado;
    END IF;
END$$

DROP PROCEDURE IF EXISTS sp_finalizar_orden$$
CREATE PROCEDURE sp_finalizar_orden(IN p_id_orden INT)
BEGIN
    UPDATE orden_produccion SET estado = 'Terminada' WHERE id_orden = p_id_orden;
    IF ROW_COUNT() = 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Orden de producción no encontrada.';
    ELSE SELECT 'Orden terminada.' AS resultado;
    END IF;
END$$

DROP PROCEDURE IF EXISTS sp_reg_lote$$
CREATE PROCEDURE sp_reg_lote(IN p_id_orden INT, IN p_cant_envases DECIMAL(12,2), IN p_cod_lote VARCHAR(50), IN p_fecha_vencimiento DATE)
BEGIN
    DECLARE v_id_articulo_terminado INT; DECLARE v_id_unidad_producir INT;

    SELECT op.id_articulo_producido, op.id_unidad_producir INTO v_id_articulo_terminado, v_id_unidad_producir
    FROM orden_produccion op
    WHERE op.id_orden = p_id_orden;

    IF v_id_articulo_terminado IS NOT NULL THEN
        INSERT INTO produccion_realizada (id_orden, id_articulo_terminado, cantidad_producida, id_unidad_producida, codigo_lote)
        VALUES (p_id_orden, v_id_articulo_terminado, p_cant_envases, v_id_unidad_producir, p_cod_lote);

        INSERT INTO inventario_lote (id_articulo, codigo_lote, cantidad_ingreso, cantidad_disponible, fecha_vencimiento)
        VALUES (v_id_articulo_terminado, p_cod_lote, p_cant_envases, p_cant_envases, p_fecha_vencimiento);

        UPDATE articulo SET cantidad = cantidad + p_cant_envases WHERE id = v_id_articulo_terminado;
        UPDATE orden_produccion SET cantidad_producida_final_real = p_cant_envases
        WHERE id_orden = p_id_orden;

        SELECT 'Lote registrado y stock actualizado.' AS resultado;
    ELSE SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: No se pudo encontrar el artículo terminado para la orden.';
    END IF;
END$$

DROP PROCEDURE IF EXISTS sp_generar_siguiente_codigo_lote$$
CREATE PROCEDURE sp_generar_siguiente_codigo_lote(IN p_id_articulo INT, OUT p_codigo_lote_generado VARCHAR(50))
BEGIN
    DECLARE v_abreviatura VARCHAR(10); DECLARE v_hora_min_seg VARCHAR(6); DECLARE v_fecha_hoy DATE; DECLARE v_nuevo_num_remesa INT;

    SELECT pm.abreviatura INTO v_abreviatura FROM articulo a
    INNER JOIN producto_maestro pm ON a.id_producto_maestro = pm.id_producto_maestro
    WHERE a.id = p_id_articulo;

    IF v_abreviatura IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Artículo no válido o sin Producto Maestro asociado.';
    END IF;

    SET v_fecha_hoy = CURDATE();
    SET v_hora_min_seg = DATE_FORMAT(NOW(), '%H%i%s');

    START TRANSACTION;

    INSERT INTO control_remesa_lote (fecha_actual, ultimo_numero_remesa) VALUES (v_fecha_hoy, 1)
    ON DUPLICATE KEY UPDATE ultimo_numero_remesa = ultimo_numero_remesa + 1;

    SELECT ultimo_numero_remesa INTO v_nuevo_num_remesa FROM control_remesa_lote
    WHERE fecha_actual = v_fecha_hoy;
    SET p_codigo_lote_generado = CONCAT(v_abreviatura, v_hora_min_seg, '-', LPAD(v_nuevo_num_remesa, 2, '0'));
    COMMIT;
END$$

DROP PROCEDURE IF EXISTS sp_obtener_consumo_total_por_orden$$
CREATE PROCEDURE sp_obtener_consumo_total_por_orden(IN p_id_orden INT)
BEGIN
    SELECT CP.id_articulo_consumido, A.descripcion AS nombre_articulo,
        SUM(CP.cantidad_consumida) AS cantidad_total_consumida_kg, MAX(CP.cantidad_requerida_kg) AS cantidad_requerida_kg,
        MAX(CP.desviacion_kg) AS desviacion_neta_kg, UM.nombre AS unidad_medida_base,
        (SELECT comentario_consumo FROM consumo_produccion
         WHERE id_orden = p_id_orden AND id_articulo_consumido = CP.id_articulo_consumido
         ORDER BY id_consumo DESC LIMIT 1) AS ultimo_comentario_desviacion
    FROM consumo_produccion CP
    JOIN articulo A ON CP.id_articulo_consumido = A.id
    JOIN unidad_medida UM ON CP.id_unidad_consumida = UM.id_unidad
    WHERE CP.id_orden = p_id_orden
    GROUP BY CP.id_articulo_consumido, A.descripcion, UM.id_unidad, UM.nombre
    ORDER BY A.descripcion;
END$$

DROP PROCEDURE IF EXISTS sp_listar_ordenes_activas$$
CREATE PROCEDURE sp_listar_ordenes_activas()
BEGIN
    SELECT op.id_orden, pm.nombre_generico AS nombre_articulo_terminado, op.cantidad_a_producir,
        op.fecha_creacion, op.estado, op.cantidad_producida_final_real, u.nombre AS unidad_nombre,
        (SELECT pr.codigo_lote FROM produccion_realizada pr WHERE pr.id_orden = op.id_orden LIMIT 1) AS codigo_lote_generado
    FROM orden_produccion op
    JOIN receta_producto rp ON op.id_receta = rp.id_receta
    JOIN producto_maestro pm ON rp.id_producto_maestro = pm.id_producto_maestro
    JOIN unidad_medida u ON op.id_unidad_producir = u.id_unidad
    ORDER BY op.id_orden DESC;
END$$

DELIMITER ;