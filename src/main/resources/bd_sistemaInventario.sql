-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS bd_maxiperu
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE bd_maxiperu;

-- TABLAS PRINCIPALES

CREATE TABLE proveedor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ruc VARCHAR(20) NOT NULL UNIQUE,
    razon_social VARCHAR(255) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(50),
    correo VARCHAR(100),
    ciudad VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_documento VARCHAR(20),
    numero_documento VARCHAR(20),
    razon_social VARCHAR(150),
    direccion TEXT,
    telefono VARCHAR(20),
    correo VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE usuario (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(45) DEFAULT NULL,
    correo VARCHAR(45) DEFAULT NULL,
    username VARCHAR(45) DEFAULT NULL,
    password VARCHAR(255) DEFAULT NULL,
    rol VARCHAR(45) DEFAULT NULL,
    estado TINYINT(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE actividad_usuario (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tipo_comprobante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tipo_pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE forma_pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE unidad_medida (
    id_unidad INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    abreviatura VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE marca (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tipo_articulo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE articulo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) DEFAULT 0,
    peso_unitario DECIMAL(10,3) DEFAULT 0,
    aroma VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    id_marca INT NOT NULL,
    id_categoria INT NOT NULL,
    id_unidad INT NOT NULL,
    FOREIGN KEY (id_marca) REFERENCES marca(id_marca) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON DELETE CASCADE,
    FOREIGN KEY (id_unidad) REFERENCES unidad_medida(id_unidad) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE articulo_tipo (
    id_articulo INT NOT NULL,
    id_tipo INT NOT NULL,
    PRIMARY KEY (id_articulo, id_tipo),
    FOREIGN KEY (id_articulo) REFERENCES articulo(id) ON DELETE CASCADE,
    FOREIGN KEY (id_tipo) REFERENCES tipo_articulo(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- TABLA DE MONEDA

CREATE TABLE moneda (
    id_moneda INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    simbolo VARCHAR(5) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- TABLAS DE COMPRA

CREATE TABLE compra (
    id_compra INT NOT NULL AUTO_INCREMENT,
    serie VARCHAR(20) DEFAULT NULL,
    correlativo VARCHAR(50) DEFAULT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE DEFAULT NULL,
    id_moneda INT NOT NULL DEFAULT 1,
    tipo_cambio DECIMAL(10,4) DEFAULT 1.0000,
    incluye_igv TINYINT(1) DEFAULT 1,
    hay_bonificacion TINYINT(1) DEFAULT 0,
    hay_traslado TINYINT(1) DEFAULT 0,
    subtotal DECIMAL(12,2) DEFAULT 0.00,
    igv DECIMAL(12,2) DEFAULT 0.00,
    total DECIMAL(12,2) DEFAULT 0.00,
    total_peso DECIMAL(12,3) DEFAULT 0.000,
    coste_transporte DECIMAL(12,2) DEFAULT 0.00,
    observacion TEXT DEFAULT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    id_proveedor INT NOT NULL,
    id_tipo_comprobante INT NOT NULL,
    id_tipo_pago INT DEFAULT NULL,
    id_forma_pago INT DEFAULT NULL,
    PRIMARY KEY (id_compra),
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id) ON DELETE CASCADE,
    FOREIGN KEY (id_tipo_comprobante) REFERENCES tipo_comprobante(id) ON DELETE CASCADE,
    FOREIGN KEY (id_tipo_pago) REFERENCES tipo_pago(id) ON DELETE CASCADE,
    FOREIGN KEY (id_forma_pago) REFERENCES forma_pago(id) ON DELETE CASCADE,
    FOREIGN KEY (id_moneda) REFERENCES moneda(id_moneda)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE caja_compra (
    id_caja_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    nombre_caja VARCHAR(100),
    cantidad INT NOT NULL,
    costo_caja DECIMAL(12,2) DEFAULT 0,
    FOREIGN KEY (id_compra) REFERENCES compra(id_compra) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE detalle_compra (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    id_articulo INT NOT NULL,
    cantidad DECIMAL(12,2) NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    bonificacion DECIMAL(12,2) DEFAULT 0,
    coste_unitario_transporte DECIMAL(12,2) DEFAULT 0,
    coste_total_transporte DECIMAL(12,2) DEFAULT 0,
    precio_con_descuento DECIMAL(12,2) DEFAULT 0,
    igv_insumo DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    peso_total DECIMAL(12,3) DEFAULT 0,
    FOREIGN KEY (id_compra) REFERENCES compra(id_compra) ON DELETE CASCADE,
    FOREIGN KEY (id_articulo) REFERENCES articulo(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE detalle_caja_compra (
    id_detalle_caja INT AUTO_INCREMENT PRIMARY KEY,
    id_caja_compra INT NOT NULL,
    id_articulo INT NOT NULL,
    cantidad DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (id_caja_compra) REFERENCES caja_compra(id_caja_compra) ON DELETE CASCADE,
    FOREIGN KEY (id_articulo) REFERENCES articulo(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE guia_transporte (
    id_guia INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    ruc_guia VARCHAR(20),
    razon_social_guia VARCHAR(255),
    fecha_emision DATE,
    tipo_comprobante VARCHAR(50),
    serie VARCHAR(20),
    correlativo VARCHAR(50),
    serie_guia_transporte VARCHAR(20),
    correlativo_guia_transporte VARCHAR(50),
    ciudad_traslado VARCHAR(100),
    coste_total_transporte DECIMAL(12,2) DEFAULT 0,
    peso DECIMAL(12,3),
    fecha_pedido DATE,
    fecha_entrega DATE,
    FOREIGN KEY (id_compra) REFERENCES compra(id_compra) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE referencia_compra (
    id_referencia INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    numero_cotizacion VARCHAR(50),
    numero_pedido VARCHAR(50),
    FOREIGN KEY (id_compra) REFERENCES compra(id_compra) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- TABLAS DE DESCUENTO
CREATE TABLE descuento (
    id_descuento INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NULL,
    id_detalle_compra INT NULL,
    motivo VARCHAR(255) NULL,
    tipo_aplicacion ENUM('global', 'item') NOT NULL,
    tipo_valor ENUM('porcentaje', 'soles') NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    tasa_igv DECIMAL(5,2) NULL,
    FOREIGN KEY (id_compra) REFERENCES compra(id_compra) ON DELETE CASCADE,
    FOREIGN KEY (id_detalle_compra) REFERENCES detalle_compra(id_detalle) ON DELETE CASCADE,
    CONSTRAINT CHK_Descuento_Tipo CHECK (
        (tipo_aplicacion = 'global' AND id_compra IS NOT NULL AND id_detalle_compra IS NULL)
        OR
        (tipo_aplicacion = 'item' AND id_compra IS NULL AND id_detalle_compra IS NOT NULL AND motivo IS NOT NULL AND tasa_igv IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- TABLAS DE GASTOS

CREATE TABLE tipo_gasto (
    id_tipo_gasto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE gasto (
    id_gasto INT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor INT NOT NULL,
    id_tipo_gasto INT NOT NULL,
    fecha DATE NOT NULL,
    id_moneda INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(12,2) DEFAULT 0.00,
    igv DECIMAL(12,2) DEFAULT 0.00,
    total DECIMAL(12,2) NOT NULL,
    observacion TEXT,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id) ON DELETE CASCADE,
    FOREIGN KEY (id_tipo_gasto) REFERENCES tipo_gasto(id_tipo_gasto) ON DELETE CASCADE,
    FOREIGN KEY (id_moneda) REFERENCES moneda(id_moneda)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE documento_gasto (
    id_documento_gasto INT AUTO_INCREMENT PRIMARY KEY,
    id_gasto INT NOT NULL UNIQUE,
    id_tipo_comprobante INT NOT NULL,
    serie VARCHAR(20) NOT NULL,
    correlativo VARCHAR(50) NOT NULL,
    fecha_emision DATE NOT NULL,
    FOREIGN KEY (id_gasto) REFERENCES gasto(id_gasto) ON DELETE CASCADE,
    FOREIGN KEY (id_tipo_comprobante) REFERENCES tipo_comprobante(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE detalle_gasto (
    id_detalle_gasto INT AUTO_INCREMENT PRIMARY KEY,
    id_gasto INT NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    cantidad DECIMAL(12,2) DEFAULT 1,
    precio_unitario DECIMAL(12,2) DEFAULT 0.00,
    subtotal DECIMAL(12,2) DEFAULT 0.00,
    igv DECIMAL(12,2) DEFAULT 0.00,
    total DECIMAL(12,2) DEFAULT 0.00,
    FOREIGN KEY (id_gasto) REFERENCES gasto(id_gasto) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;