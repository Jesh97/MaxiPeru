-- Ejecutar una sola vez sobre bd_maxiperu existente (si la columna ya existe, omitir).
USE bd_maxiperu;

ALTER TABLE articulo
    ADD COLUMN stock_minimo DECIMAL(12,4) NOT NULL DEFAULT 0.0000 COMMENT 'Mínimo en almacén para alertas'
    AFTER cantidad;
