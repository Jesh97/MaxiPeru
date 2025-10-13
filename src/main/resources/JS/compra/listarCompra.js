let compraActual = null;

/**
 * Mapea la unidad de medida completa a su abreviatura,
 * la lógica se toma de la función unidadAbreviatura de compra.js.
 * @param {string} unidad - La unidad de medida completa (ej: 'KILOGRAMO').
 * @returns {string} La abreviatura (ej: 'KG') o la unidad original si no se encuentra.
 */
function unidadAbreviatura(unidad) {
    const map = {'LITRO': 'L', 'GALÓN': 'GL', 'BIDÓN': 'BD', 'UNIDAD': 'U', 'KILOGRAMO': 'KG', 'CIENTO': 'C', 'PAQUETE': 'PQ', 'MILLAR': 'MLL', 'ROLLO': 'RL', 'SACO': 'S'};
    if (!unidad) return '-';
    return map[unidad.toUpperCase()] || unidad;
}

function showMessage(message, type = 'info') {
    const box = document.getElementById('customMessageBox');
    const color = type === 'success' ? 'bg-emerald-100 text-emerald-800 border-emerald-500' : 'bg-indigo-100 text-indigo-800 border-indigo-500';
    box.innerHTML = `<div class="p-3 rounded-lg shadow-xl text-sm font-medium ${color} border">${message}</div>`;
    box.classList.remove('hidden');
    box.classList.remove('opacity-0');
    setTimeout(() => {
        box.classList.add('opacity-0');
        setTimeout(() => box.classList.add('hidden'), 300);
    }, 3000);
}

function mostrarValor(valor, prefijo = '', sufijo = '') {
    if (valor === null || valor === undefined || valor === 0 || valor === '0.00' || valor === '' || valor === '0') {
        return '-';
    }

    if (typeof valor === 'string' && valor.includes('-')) {
        return valor;
    }

    const num = parseFloat(valor);

    if (!isNaN(num)) {
        if (prefijo.includes('S/') || sufijo.includes('kg')) {
            const isCurrency = prefijo.includes('S/');
            const decimalPlaces = isCurrency ? 2 : 3;
            return `${prefijo}${num.toFixed(decimalPlaces)}${sufijo}`;
        }

        return String(Math.round(num));
    }

    return valor;
}

function numeroALetras(total) {
    return `TOTAL DE ${mostrarValor(total, 'S/ ')} EN LETRAS`;
}

async function cargarCompras() {
    const tbody = document.getElementById("tabla-compras");
    try {
        // ASUME que /listarCompra devuelve un JSON con la estructura de compra
        const res = await fetch("/listarCompra");
        if (!res.ok) throw new Error("Error al cargar las compras.");
        const compras = await res.json();

        tbody.innerHTML = "";

        if (compras.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center py-6 text-gray-500 italic">No se encontraron registros de compras.</td></tr>';
            return;
        }

        compras.forEach((compra, index) => {
            const tr = document.createElement("tr");
            tr.classList.add('text-center', index % 2 === 0 ? 'bg-white' : 'bg-gray-50', 'hover:bg-indigo-50/50', 'transition', 'duration-150');
            // La serialización JSON debe hacerse con cuidado para evitar problemas de comillas en el atributo onclick.
            // Para el propósito de separar el código, mantenemos la lógica original.
            const compraDataString = JSON.stringify(compra).replace(/'/g, "\\'");

            tr.innerHTML = `
                <td class="px-4 py-3 whitespace-nowrap">${mostrarValor(compra.fecha_emision)}</td>
                <td class="px-4 py-3 whitespace-nowrap">${mostrarValor(compra.fecha_vencimiento)}</td>
                <td class="px-4 py-3 whitespace-nowrap">${mostrarValor(compra.tipo_comprobante)}</td>
                <td class="px-4 py-3 whitespace-nowrap">${mostrarValor(compra.serie)}-${mostrarValor(compra.correlativo)}</td>
                <td class="px-4 py-3 text-left font-medium text-gray-700">${mostrarValor(compra.proveedor.razon_social)}</td>
                <td class="px-4 py-3 whitespace-nowrap text-gray-500">${mostrarValor(compra.moneda)}</td>
                <td class="px-4 py-3 whitespace-nowrap"><span class="inline-flex items-center px-3 py-1 text-sm font-extrabold bg-green-600 text-white rounded-full shadow-lg">${mostrarValor(compra.total, 'S/ ')}</span></td>
                <td class="px-4 py-3 whitespace-nowrap">
                    <button class="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold py-1.5 px-3 rounded-xl shadow-md transition duration-200 text-xs mr-2" onclick='editarCompra(${compra.id_compra})'><i class="bi bi-pencil-square"></i> Editar</button>
                    <button class="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-1.5 px-3 rounded-xl shadow-md transition duration-200 text-xs" onclick='verDetalles(${compraDataString})'><i class="bi bi-eye"></i> Detalles</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-6 text-red-500 italic font-bold">❌ Error al conectar con el servidor para obtener las compras.</td></tr>';
    }
}

function verDetalles(compra) {
    compraActual = compra;
    const proveedor = compra.proveedor;
    document.getElementById('total-final-display').textContent = mostrarValor(compra.total, 'S/ ');
    document.getElementById('comprobante-display').textContent = `${mostrarValor(compra.tipo_comprobante)} ${mostrarValor(compra.serie)}-${mostrarValor(compra.correlativo)}`;
    document.getElementById('proveedor-display').textContent = `${mostrarValor(proveedor.razon_social)} (${mostrarValor(proveedor.ruc)})`;
    document.getElementById('dates-display').textContent = `${mostrarValor(compra.fecha_emision)} / ${mostrarValor(compra.fecha_vencimiento)}`;
    document.getElementById('subtotal-display').textContent = mostrarValor(compra.subtotal, 'S/ ');
    document.getElementById('igv-display').textContent = mostrarValor(compra.igv, 'S/ ');
    document.getElementById('tipo-cambio-display').textContent = mostrarValor(compra.tipo_cambio);
    document.getElementById('coste-transporte-display').textContent = mostrarValor(compra.coste_transporte, 'S/ ');
    document.getElementById('total-peso-display').textContent = mostrarValor(compra.total_peso, '', ' kg');
    document.getElementById('observacion-display').textContent = mostrarValor(compra.observacion) || 'N/A';
    const tbodyProducto = document.getElementById("tabla-producto");
    tbodyProducto.innerHTML = "";
    const tbodyTransporte = document.getElementById("tabla-transporte");
    tbodyTransporte.innerHTML = "";

    if (compra.detalles && compra.detalles.length > 0) {
        compra.detalles.forEach((d, index) => {
            const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';

            // >>> IMPLEMENTACIÓN EN EL MODAL (Nodal) <<<
            const unidad = unidadAbreviatura(d.unidad_medida);

            tbodyProducto.innerHTML += `
                <tr class="${rowClass} hover:bg-indigo-50 transition duration-100">
                    <td class="px-4 py-2 border-r">${mostrarValor(d.codigo_articulo)}</td>
                    <td class="px-4 py-2 text-left border-r">${mostrarValor(d.descripcion_articulo)}</td>
                    <td class="px-4 py-2 border-r font-medium">${unidad}</td>
                    <td class="px-4 py-2 border-r font-medium">${mostrarValor(d.cantidad)}</td>
                    <td class="px-4 py-2 border-r">${mostrarValor(d.precio_unitario, 'S/ ')}</td>
                    <td class="px-4 py-2 border-r">${mostrarValor(d.precio_con_descuento, 'S/ ')}</td>
                    <td class="px-4 py-2 border-r">${mostrarValor(d.igv_insumo, 'S/ ')}</td>
                    <td class="px-4 py-2 border-r font-extrabold text-indigo-700">${mostrarValor(d.total_detalle, 'S/ ')}</td>
                    <td class="px-4 py-2">${mostrarValor(d.peso_total, '', ' kg')}</td>
                </tr>`;

            tbodyTransporte.innerHTML += `
                <tr class="${rowClass} hover:bg-gray-100 transition duration-100">
                    <td class="px-4 py-2 border-r">${mostrarValor(d.coste_unitario_transporte, 'S/ ')}</td>
                    <td class="px-4 py-2 font-bold text-gray-700">${mostrarValor(d.coste_total_transporte, 'S/ ')}</td>
                </tr>`;
        });
    } else {
        tbodyProducto.innerHTML = '<tr><td colspan="9" class="text-gray-500 italic p-6">No hay detalles de productos registrados.</td></tr>';
        tbodyTransporte.innerHTML = '<tr><td colspan="2" class="text-gray-500 italic p-6">No hay costos de transporte por detalle.</td></tr>';
    }

    const gt = compra.guia || {};
    const infoGuiaHTML = gt.id_guia ? `
        <div class="mb-5 p-4 border border-emerald-300 rounded-xl bg-emerald-50">
            <div class="font-semibold text-emerald-700 mb-3 border-b pb-2 border-emerald-200">Datos de la Guía de Remisión (Emisor)</div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div><strong class="text-gray-600">ID Guía:</strong> ${mostrarValor(gt.id_guia)}</div>
                <div><strong class="text-gray-600">RUC/Razón Social:</strong> ${mostrarValor(gt.ruc_guia)}</div>
                <div><strong class="text-gray-600">F. Emisión:</strong> ${mostrarValor(gt.fecha_emision_guia)}</div>
                <div><strong class="text-gray-600">Tipo Comp.:</strong> ${mostrarValor(gt.tipo_comprobante_guia)}</div>
                <div><strong class="text-gray-600">Serie:</strong> ${mostrarValor(gt.serie_guia)}</div>
                <div><strong class="text-gray-600">Correlativo:</strong> ${mostrarValor(gt.correlativo_guia)}</div>
            </div>
        </div>

        <div class="p-4 border border-orange-300 rounded-xl bg-orange-50">
            <div class="font-semibold text-orange-600 mb-3 border-b pb-2 border-orange-200">Datos del Traslado</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><strong class="text-gray-600">Punto de Partida:</strong> ${mostrarValor(gt.puntoPartida)}</div>
                <div><strong class="text-gray-600">Punto de Llegada:</strong> ${mostrarValor(gt.puntoLlegada)}</div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div><strong class="text-gray-600">Guía Transp. Serie:</strong> ${mostrarValor(gt.serie_guia_transporte)}</div>
                <div><strong class="text-gray-600">Guía Transp. Correlativo:</strong> ${mostrarValor(gt.correlativo_guia_transporte)}</div>
                <div><strong class="text-gray-600">Ciudad Traslado:</strong> ${mostrarValor(gt.ciudad_traslado)}</div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                <div><strong class="text-gray-600">Costo Total:</strong> <span class="font-bold text-green-600">${mostrarValor(gt.coste_transporte_guia, 'S/ ')}</span></div>
                <div><strong class="text-gray-600">Peso Total:</strong> ${mostrarValor(gt.peso_guia, '', ' kg')}</div>
                <div><strong class="text-gray-600">F. Pedido:</strong> ${mostrarValor(gt.fecha_pedido)}</div>
                <div><strong class="text-gray-600">F. Entrega:</strong> ${mostrarValor(gt.fecha_entrega)}</div>
            </div>
        </div>
    ` : `<p class="text-gray-500 italic p-8 text-center bg-white rounded-xl">No hay guía de transporte asociada a esta compra.</p>`;

    document.getElementById("info-guia").innerHTML = infoGuiaHTML;

    const rc = compra.referencia || {};
    const infoReferenciaHTML = rc.id_referencia ? `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 p-6 border border-amber-300 rounded-xl bg-amber-50 shadow-md">
            <div><strong class="text-gray-600">Número Cotización:</strong> <span class="font-medium">${mostrarValor(rc.numero_cotizacion)}</span></div>
            <div><strong class="text-gray-600">Número Pedido:</strong> <span class="font-medium">${mostrarValor(rc.numero_pedido)}</span></div>
        </div>
    ` : `<p class="text-gray-500 italic p-8 text-center bg-white rounded-xl">No hay referencias (cotización/pedido) asociadas a esta compra.</p>`;
    document.getElementById("info-referencia").innerHTML = infoReferenciaHTML;

    document.getElementById('detallesModal').classList.remove('hidden');
}

function descargarFactura() {
    if (!compraActual) {
        showMessage("Por favor, selecciona una compra para ver sus detalles primero.", 'info');
        return;
    }

    const template = document.getElementById('factura-pdf-template');
    const proveedor = compraActual.proveedor;

    document.getElementById('nombre-proveedor-doc').textContent = mostrarValor(proveedor.razon_social);
    document.getElementById('ruc-cuadro-doc').textContent = `R.U.C.: ${mostrarValor(proveedor.ruc)}`;

    document.getElementById('ruc-doc-repetido').textContent = mostrarValor(proveedor.ruc);
    document.getElementById('fecha-emision-doc').textContent = mostrarValor(compraActual.fecha_emision);
    document.getElementById('moneda-doc').textContent = mostrarValor(compraActual.moneda);

    document.getElementById('numero-factura-doc').textContent = `${mostrarValor(compraActual.serie)}-${mostrarValor(compraActual.correlativo)}`;

    const tbodyDoc = document.getElementById("tabla-producto-doc");
    tbodyDoc.innerHTML = "";

    if (compraActual.detalles && compraActual.detalles.length > 0) {
        compraActual.detalles.forEach((d) => {
            const valorUnitario = parseFloat(d.precio_unitario) / 1.18;
            const precioUnitario = d.precio_con_descuento || d.precio_unitario;
            const subTotal = d.total_detalle;

            tbodyDoc.innerHTML += `
                <tr class="h-8">
                    <td class="border border-gray-400 px-2 py-1 text-center">${mostrarValor(d.cantidad)}</td>
                    <td class="border border-gray-400 px-2 py-1">${mostrarValor(d.descripcion_articulo)}</td>
                    <td class="border border-gray-400 px-2 py-1 text-right">${mostrarValor(valorUnitario.toFixed(2), 'S/ ')}</td>
                    <td class="border border-gray-400 px-2 py-1 text-right">${mostrarValor(precioUnitario, 'S/ ')}</td>
                    <td class="border border-gray-400 px-2 py-1 text-right font-bold">${mostrarValor(subTotal, 'S/ ')}</td>
                </tr>`;
        });
    } else {
        tbodyDoc.innerHTML = '<tr><td colspan="5" class="text-gray-500 italic p-4 text-center">Sin detalles de productos registrados.</td></tr>';
    }

    document.getElementById('letras-doc').textContent = numeroALetras(compraActual.total);
    document.getElementById('observacion-doc').textContent = mostrarValor(compraActual.observacion) || 'N/A';
    document.getElementById('op-gravadas-doc').textContent = mostrarValor(compraActual.subtotal, 'S/ ');
    document.getElementById('igv-doc').textContent = mostrarValor(compraActual.igv, 'S/ ');
    document.getElementById('total-doc').textContent = mostrarValor(compraActual.total, 'S/ ');


    template.classList.remove('hidden');
    showMessage(`Generando PDF de factura ${compraActual.serie}-${compraActual.correlativo}...`, 'info');

    html2canvas(template, {
        scale: 2,
        useCORS: true
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        template.classList.add('hidden');

        pdf.save(`Factura_${compraActual.serie}-${compraActual.correlativo}.pdf`);
        showMessage(`✅ PDF de factura descargado.`, 'success');
    }).catch(error => {
        console.error(error);
        template.classList.add('hidden');
        showMessage("❌ Error al generar el PDF.", 'info');
    });
}

function descargarGuiaTransporte() {
    if (!compraActual || !compraActual.guia || !compraActual.guia.id_guia) {
        showMessage("No hay información de guía de transporte para esta compra.", 'info');
        return;
    }

    const template = document.getElementById('guia-pdf-template');
    const guia = compraActual.guia;
    const proveedor = compraActual.proveedor;
    const referencia = compraActual.referencia || {};

    document.getElementById('guia-emisor-razon-social').textContent = mostrarValor(proveedor.razon_social);
    document.getElementById('guia-emisor-ruc').textContent = mostrarValor(proveedor.ruc);
    document.getElementById('guia-cuadro-ruc').textContent = mostrarValor(proveedor.ruc);
    document.getElementById('guia-emisor-direccion').textContent = mostrarValor(proveedor.direccion) || 'Dirección no especificada';

    document.getElementById('guia-numero-doc').textContent = `${mostrarValor(guia.serie_guia)}-${mostrarValor(guia.correlativo_guia)}`;
    document.getElementById('guia-fecha-traslado').textContent = mostrarValor(guia.fecha_emision_guia);
    document.getElementById('guia-fecha-entrega').textContent = mostrarValor(guia.fecha_entrega);

    document.getElementById('guia-destinatario-ruc').textContent = mostrarValor(proveedor.ruc);
    document.getElementById('guia-destinatario-rs').textContent = mostrarValor(proveedor.razon_social);

    const remitenteRucFull = mostrarValor(guia.ruc_guia);
    let remitenteRuc = '-';
    let remitenteRs = '-';

    if (remitenteRucFull.includes(' - ')) {
        const parts = remitenteRucFull.split(' - ', 2);
        remitenteRuc = parts[0].trim();
        remitenteRs = parts[1].trim();
    } else if (remitenteRucFull !== '-') {
        remitenteRuc = remitenteRucFull;
        remitenteRs = mostrarValor(guia.razon_social_guia) || '-';
    } else {
         remitenteRs = mostrarValor(guia.razon_social_guia) || '-';
    }

    document.getElementById('guia-remitente-ruc').textContent = remitenteRuc;
    document.getElementById('guia-remitente-rs').textContent = remitenteRs;

    document.getElementById('guia-punto-partida').textContent = mostrarValor(guia.puntoPartida);
    document.getElementById('guia-punto-llegada').textContent = mostrarValor(guia.puntoLlegada);

    document.getElementById('guia-num-cotizacion').textContent = mostrarValor(referencia.numero_cotizacion);
    document.getElementById('guia-num-pedido').textContent = mostrarValor(referencia.numero_pedido);

    const tbodyDoc = document.getElementById("tabla-guia-producto-doc");
    tbodyDoc.innerHTML = "";
    let cantidadTotal = 0;
    if (compraActual.detalles && compraActual.detalles.length > 0) {
        compraActual.detalles.forEach((d, index) => {
            const cantidad = parseFloat(d.cantidad) || 0;
            cantidadTotal += cantidad;
            // >>> IMPLEMENTACIÓN EN EL PDF DE GUÍA DE REMISIÓN <<<
            const unidad = unidadAbreviatura(d.unidad_medida);

            tbodyDoc.innerHTML += `
                <tr>
                    <td class="border border-gray-400 px-2 py-1 text-center">${index + 1}</td>
                    <td class="border border-gray-400 px-2 py-1">${mostrarValor(d.descripcion_articulo)}</td>
                    <td class="border border-gray-400 px-2 py-1 text-center">${unidad}</td>
                    <td class="border border-gray-400 px-2 py-1 text-right font-bold">${mostrarValor(cantidad)}</td>
                </tr>`;
        });
    } else {
        tbodyDoc.innerHTML = '<tr><td colspan="4" class="text-gray-500 italic p-4 text-center">Sin detalles de productos registrados.</td></tr>';
    }

    document.getElementById('guia-peso-total').textContent = mostrarValor(cantidadTotal, '', ' UNIDADES');


    template.classList.remove('hidden');
    showMessage(`Generando PDF de Guía de Remisión ${guia.serie_guia}-${guia.correlativo_guia}...`, 'info');

    html2canvas(template, {
        scale: 2,
        useCORS: true
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        template.classList.add('hidden');

        pdf.save(`Guia_Remision_${guia.serie_guia}-${guia.correlativo_guia}.pdf`);
        showMessage(`✅ PDF de Guía de Remisión descargado.`, 'success');
    }).catch(error => {
        console.error('Error al generar el PDF de la Guía:', error);
        template.classList.add('hidden');
        showMessage("❌ Error al generar el PDF de la Guía de Remisión.", 'info');
    });
}

function editarCompra(idCompra) {
    window.location.href = `editarCompra.html?id=${idCompra}`;
}

document.addEventListener('DOMContentLoaded', () => {
    cargarCompras();

    document.querySelectorAll('#detallesTab .tab-button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('#detallesTab .tab-button').forEach(btn => {
                btn.classList.remove('active', 'bg-indigo-700', 'text-white', 'shadow-xl', 'transform', 'hover:scale-[1.01]');
                btn.classList.add('text-gray-700', 'hover:bg-white/80', 'hover:shadow-md');
            });

            this.classList.add('active', 'bg-indigo-700', 'text-white', 'shadow-xl', 'transform', 'hover:scale-[1.01]');
            this.classList.remove('text-gray-700', 'hover:bg-white/80', 'hover:shadow-md');

            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.add('hidden');
            });

            document.getElementById(this.dataset.target).classList.remove('hidden');
        });
    });
});