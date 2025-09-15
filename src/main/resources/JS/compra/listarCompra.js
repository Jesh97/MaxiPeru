let compraActual = null; // Variable para almacenar la compra seleccionada

function mostrarValor(valor) {
    return valor !== null && valor !== undefined && valor !== 0 ? valor : '-';
}

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
            <td><span class="badge bg-success">S/ ${mostrarValor(compra.total)}</span></td>
            <td>
                <button class="btn btn-sm btn-primary fw-bold" onclick='verDetalles(${JSON.stringify(compra)})'>Ver Detalles</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function verDetalles(compra) {
    compraActual = compra; // Almacenar la compra seleccionada

    // Info Compra
    document.getElementById("info-compra").innerHTML = `
        <strong>Subtotal:</strong> S/ ${mostrarValor(compra.subtotal)} |
        <strong>IGV:</strong> S/ ${mostrarValor(compra.igv)} |
        <strong>Coste Transporte:</strong> S/ ${mostrarValor(compra.coste_transporte)} |
        <strong>Total Peso:</strong> ${mostrarValor(compra.total_peso)} kg |
        <strong>Observación:</strong> ${mostrarValor(compra.observacion)}
    `;

    // Info Proveedor
    const proveedor = compra.proveedor;
    document.getElementById("info-proveedor").innerHTML = `
        <strong>Proveedor:</strong> ${mostrarValor(proveedor.razon_social)} |
        <strong>RUC:</strong> ${mostrarValor(proveedor.ruc)} |
        <strong>Dirección:</strong> ${mostrarValor(proveedor.direccion)} |
        <strong>Teléfono:</strong> ${mostrarValor(proveedor.telefono)} |
        <strong>Correo:</strong> ${mostrarValor(proveedor.correo)} |
        <strong>Ciudad:</strong> ${mostrarValor(proveedor.ciudad)}
    `;

    // Productos
    const tbodyProducto = document.getElementById("tabla-producto");
    tbodyProducto.innerHTML = "";
    const tbodyDescuento = document.getElementById("tabla-descuento");
    tbodyDescuento.innerHTML = "";

    compra.detalles.forEach(d => {
        tbodyProducto.innerHTML += `
            <tr>
                <td>${mostrarValor(d.codigo_producto)}</td>
                <td>${mostrarValor(d.descripcion_producto)}</td>
                <td>${mostrarValor(d.cantidad)}</td>
                <td>S/ ${mostrarValor(d.precio_unitario)}</td>
                <td>${mostrarValor(d.peso_total)} kg</td>
            </tr>`;

        tbodyDescuento.innerHTML += `
            <tr>
                <td>S/ ${mostrarValor(d.precio_con_descuento)}</td>
                <td>S/ ${mostrarValor(d.igv_producto)}</td>
                <td>S/ ${mostrarValor(d.total_detalle)}</td>
            </tr>`;
    });

    // Transporte
    const tbodyTransporte = document.getElementById("tabla-transporte");
    tbodyTransporte.innerHTML = "";
    compra.detalles.forEach(d => {
        tbodyTransporte.innerHTML += `
            <tr>
                <td>S/ ${mostrarValor(d.coste_unitario_transporte)}</td>
                <td>S/ ${mostrarValor(d.coste_total_transporte)}</td>
                <td>S/ ${mostrarValor(compra.coste_transporte)}</td>
                <td>${mostrarValor(compra.total_peso)} kg</td>
            </tr>`;
    });

    // Guía Transporte en filas
    const gt = compra.guia || {};
    document.getElementById("info-guia").innerHTML = `
        <div><strong>ID Guía:</strong> ${mostrarValor(gt.id_guia)}</div>
        <div><strong>RUC Guía:</strong> ${mostrarValor(gt.ruc_guia)}</div>
        <div><strong>Fecha Emisión:</strong> ${mostrarValor(gt.fecha_emision_guia)}</div>
        <div><strong>Tipo Comprobante:</strong> ${mostrarValor(gt.tipo_comprobante_guia)}</div>
        <div><strong>Serie-Guía:</strong> ${mostrarValor(gt.serie_guia)}-${mostrarValor(gt.correlativo_guia)}</div>
        <div><strong>Número Guía:</strong> ${mostrarValor(gt.numero_guia)}</div>
        <div><strong>Serie-Guía Transporte:</strong> ${mostrarValor(gt.serie_guia_transporte)}-${mostrarValor(gt.correlativo_guia_transporte)}</div>
        <div><strong>Ciudad Traslado:</strong> ${mostrarValor(gt.ciudad_traslado)}</div>
        <div><strong>Coste Transporte Guía:</strong> S/ ${mostrarValor(gt.coste_transporte_guia)}</div>
        <div><strong>Peso Guía:</strong> ${mostrarValor(gt.peso_guia)} kg</div>
        <div><strong>Fecha Pedido:</strong> ${mostrarValor(gt.fecha_pedido)}</div>
        <div><strong>Fecha Entrega:</strong> ${mostrarValor(gt.fecha_entrega)}</div>
    `;

    // Referencia Compra
    const rc = compra.referencia || {};
    document.getElementById("info-referencia").innerHTML = `
        <div><strong>Número Cotización:</strong> ${mostrarValor(rc.numero_cotizacion)}</div>
        <div><strong>Número Pedido:</strong> ${mostrarValor(rc.numero_pedido)}</div>
    `;

    new bootstrap.Modal(document.getElementById("detallesModal")).show();
}

function descargarFactura() {
    if (compraActual) {
        // En un entorno real, harías una llamada API aquí para obtener el PDF
        const id = compraActual.id_compra;
        const tipo = compraActual.tipo_comprobante;
        alert(`Simulando la descarga de la factura/boleta #${id} (${tipo}).\nEn un entorno real, esta acción enviaría una petición al servidor para generar el PDF.`);
        // Ejemplo de cómo sería la llamada real
        // window.open(`/api/descargarFactura/${id}`, '_blank');
    } else {
        alert("No se ha seleccionado ninguna compra.");
    }
}

function descargarGuiaTransporte() {
    if (compraActual && compraActual.guia) {
        // En un entorno real, harías una llamada API aquí para obtener el PDF
        const id = compraActual.guia.id_guia;
        alert(`Simulando la descarga de la guía de transporte #${id}.\nEn un entorno real, esta acción enviaría una petición al servidor para generar el PDF.`);
        // Ejemplo de cómo sería la llamada real
        // window.open(`/api/descargarGuia/${id}`, '_blank');
    } else {
        alert("No hay información de guía de transporte para esta compra.");
    }
}

document.addEventListener("DOMContentLoaded", cargarCompras);