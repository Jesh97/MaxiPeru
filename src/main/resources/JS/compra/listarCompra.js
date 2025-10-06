let compraActual = null; // Variable para almacenar la compra seleccionada

// Función auxiliar para formatear y mostrar valores
function mostrarValor(valor, prefijo = '', sufijo = '') {
    // Si el valor es nulo, indefinido, una cadena vacía o 0, devuelve un guion
    if (valor === null || valor === undefined || valor === 0 || valor === '0.00' || valor === '') {
        return '-';
    }
    // Si es un número (o string convertible) y tiene decimales, lo formatea
    if (typeof valor === 'number' || (typeof valor === 'string' && !isNaN(parseFloat(valor)))) {
        const num = parseFloat(valor);
        if (num !== 0) {
            // Usa toFixed(2) para dinero, toFixed(3) para peso, si es necesario
            const displayValue = (prefijo.includes('S/') && !sufijo.includes('kg')) ? num.toFixed(2) : num;
            return `${prefijo}${displayValue}${sufijo}`;
        }
        return '-';
    }
    return valor;
}

// Función para cargar los datos en la tabla principal
async function cargarCompras() {
    const res = await fetch("/listarCompra");
    const compras = await res.json();
    const tbody = document.getElementById("tabla-compras");
    tbody.innerHTML = "";

    compras.forEach(compra => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>#${compra.id_compra}</strong></td>
            <td>${mostrarValor(compra.fecha_emision)}</td>
            <td>${mostrarValor(compra.fecha_vencimiento)}</td>
            <td>${mostrarValor(compra.tipo_comprobante)}</td>
            <td>${mostrarValor(compra.serie)}-${mostrarValor(compra.correlativo)}</td>
            <td>${mostrarValor(compra.proveedor.razon_social)}</td>
            <td>${mostrarValor(compra.moneda)}</td>
            <td><span class="badge bg-success">${mostrarValor(compra.total, 'S/ ')}</span></td>
            <td>
                <button class="btn btn-sm btn-primary fw-bold" onclick='verDetalles(${JSON.stringify(compra)})'>Ver Detalles</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Función para mostrar los detalles en el modal
function verDetalles(compra) {
    compraActual = compra; // Almacenar la compra seleccionada

    // 1. Info Compra (incluyendo campos que faltaban)
    document.getElementById("info-compra").innerHTML = `
        <div class="row">
            <div class="col-md-4"><strong>Tipo Cambio:</strong> ${mostrarValor(compra.tipo_cambio)}</div>
            <div class="col-md-4"><strong>Subtotal:</strong> ${mostrarValor(compra.subtotal, 'S/ ')}</div>
            <div class="col-md-4"><strong>IGV:</strong> ${mostrarValor(compra.igv, 'S/ ')}</div>
        </div>
        <div class="row mt-2">
            <div class="col-md-4"><strong>Coste Transporte:</strong> ${mostrarValor(compra.coste_transporte, 'S/ ')}</div>
            <div class="col-md-4"><strong>Total Peso:</strong> ${mostrarValor(compra.total_peso, '', ' kg')}</div>
            <div class="col-md-4"><strong>Total Final:</strong> <span class="badge bg-success fs-6">${mostrarValor(compra.total, 'S/ ')}</span></div>
        </div>
        <div class="mt-2"><strong>Observación:</strong> ${mostrarValor(compra.observacion)}</div>
    `;

    // 2. Info Proveedor (se mantiene)
    const proveedor = compra.proveedor;
    document.getElementById("info-proveedor").innerHTML = `
        <div class="row">
            <div class="col-md-6"><strong>Proveedor:</strong> ${mostrarValor(proveedor.razon_social)}</div>
            <div class="col-md-6"><strong>RUC:</strong> ${mostrarValor(proveedor.ruc)}</div>
        </div>
        <div class="row mt-2">
            <div class="col-md-6"><strong>Dirección:</strong> ${mostrarValor(proveedor.direccion)} (${mostrarValor(proveedor.ciudad)})</div>
            <div class="col-md-6"><strong>Teléfono/Correo:</strong> ${mostrarValor(proveedor.telefono)} / ${mostrarValor(proveedor.correo)}</div>
        </div>
    `;

    // 3. Productos y Costos de Transporte por Detalle
    const tbodyProducto = document.getElementById("tabla-producto");
    tbodyProducto.innerHTML = "";
    const tbodyTransporte = document.getElementById("tabla-transporte");
    tbodyTransporte.innerHTML = "";

    // Validar si hay detalles para llenar las tablas
    if (compra.detalles && compra.detalles.length > 0) {
        compra.detalles.forEach(d => {
            // Tabla de Productos y Costos
            tbodyProducto.innerHTML += `
                <tr>
                    <td>${mostrarValor(d.codigo_articulo)}</td>
                    <td>${mostrarValor(d.descripcion_articulo)}</td>
                    <td>${mostrarValor(d.cantidad)}</td>
                    <td>${mostrarValor(d.precio_unitario, 'S/ ')}</td>
                    <td>${mostrarValor(d.precio_con_descuento, 'S/ ')}</td>
                    <td>${mostrarValor(d.igv_insumo, 'S/ ')}</td>
                    <td>${mostrarValor(d.total_detalle, 'S/ ')}</td>
                    <td>${mostrarValor(d.peso_total, '', ' kg')}</td>
                </tr>`;

            // Tabla de Costos de Transporte por Ítem (separada para mejor lectura)
            tbodyTransporte.innerHTML += `
                <tr>
                    <td>${mostrarValor(d.coste_unitario_transporte, 'S/ ')}</td>
                    <td>${mostrarValor(d.coste_total_transporte, 'S/ ')}</td>
                </tr>`;
        });
    } else {
        tbodyProducto.innerHTML = '<tr><td colspan="8" class="text-muted">No hay detalles de productos registrados.</td></tr>';
        tbodyTransporte.innerHTML = '<tr><td colspan="2" class="text-muted">No hay costos de transporte por detalle.</td></tr>';
    }


    // 4. Guía Transporte
    const gt = compra.guia || {};
    const infoGuiaHTML = gt.id_guia ? `
        <div class="row">
            <div class="col-md-4"><strong>ID Guía:</strong> ${mostrarValor(gt.id_guia)}</div>
            <div class="col-md-4"><strong>RUC Guía:</strong> ${mostrarValor(gt.ruc_guia)}</div>
            <div class="col-md-4"><strong>Razón Social:</strong> ${mostrarValor(gt.razon_social_guia)}</div>
        </div>
        <div class="row mt-2">
            <div class="col-md-4"><strong>F. Emisión:</strong> ${mostrarValor(gt.fecha_emision_guia)}</div>
            <div class="col-md-4"><strong>Tipo Comp.:</strong> ${mostrarValor(gt.tipo_comprobante_guia)}</div>
            <div class="col-md-4"><strong>Serie/Correlativo:</strong> ${mostrarValor(gt.serie_guia)}/${mostrarValor(gt.correlativo_guia)}</div>
        </div>
        <div class="row mt-2">
            <div class="col-md-4"><strong>Guía Transp.:</strong> ${mostrarValor(gt.serie_guia_transporte)}/${mostrarValor(gt.correlativo_guia_transporte)}</div>
            <div class="col-md-4"><strong>Ciudad Traslado:</strong> ${mostrarValor(gt.ciudad_traslado)}</div>
            <div class="col-md-4"><strong>Coste Total:</strong> ${mostrarValor(gt.coste_transporte_guia, 'S/ ')} | <strong>Peso:</strong> ${mostrarValor(gt.peso_guia, '', ' kg')}</div>
        </div>
        <div class="row mt-2">
            <div class="col-md-4"><strong>F. Pedido:</strong> ${mostrarValor(gt.fecha_pedido)}</div>
            <div class="col-md-4"><strong>F. Entrega:</strong> ${mostrarValor(gt.fecha_entrega)}</div>
        </div>
    ` : `<p class="text-muted">No hay guía de transporte asociada a esta compra.</p>`;
    document.getElementById("info-guia").innerHTML = infoGuiaHTML;


    // 5. Referencia Compra
    const rc = compra.referencia || {};
    const infoReferenciaHTML = rc.id_referencia ? `
        <div><strong>Número Cotización:</strong> ${mostrarValor(rc.numero_cotizacion)}</div>
        <div><strong>Número Pedido:</strong> ${mostrarValor(rc.numero_pedido)}</div>
    ` : `<p class="text-muted">No hay referencias (cotización/pedido) asociadas a esta compra.</p>`;
    document.getElementById("info-referencia").innerHTML = infoReferenciaHTML;

    // 6. Mostrar el Modal
    new bootstrap.Modal(document.getElementById("detallesModal")).show();
}

function descargarFactura() {
    if (compraActual) {
        const id = compraActual.id_compra;
        const tipo = compraActual.tipo_comprobante;
        alert(`Simulando la descarga de la factura/boleta #${id} (${tipo}).\nEn un entorno real, esta acción enviaría una petición al servidor para generar el PDF.`);
    } else {
        alert("No se ha seleccionado ninguna compra.");
    }
}

function descargarGuiaTransporte() {
    if (compraActual && compraActual.guia && compraActual.guia.id_guia) {
        const id = compraActual.guia.id_guia;
        alert(`Simulando la descarga de la guía de transporte #${id}.\nEn un entorno real, esta acción enviaría una petición al servidor para generar el PDF.`);
    } else {
        alert("No hay información de guía de transporte para esta compra.");
    }
}

document.addEventListener("DOMContentLoaded", cargarCompras);