   let compraActual = null;
    let productoMap = {};
    let cajaMap = {};

    function unidadAbreviatura(unidad) {
        const map = {'LITRO': 'L', 'GALÓN': 'GL', 'BIDÓN': 'BD', 'UNIDAD': 'U', 'KILOGRAMO': 'KG', 'CIENTO': 'C', 'PAQUETE': 'PQ', 'MILLAR': 'MLL', 'ROLLO': 'RL', 'SACO': 'S'};
        if (!unidad) return '-';
        return map[unidad.toUpperCase()] || unidad;
    }

    function showMessage(message, type = 'info') {
        const box = document.getElementById('customMessageBox');
        const color = type === 'success' ? 'bg-green-100 text-green-800 border-green-500' : 'bg-indigo-100 text-indigo-800 border-indigo-500';
        box.innerHTML = `<div class="p-4 rounded-xl shadow-2xl text-base font-semibold ${color} border-l-4">${message}</div>`;
        box.classList.remove('hidden', 'opacity-0');
        box.classList.add('opacity-100');
        setTimeout(() => {
            box.classList.remove('opacity-100');
            box.classList.add('opacity-0');
            setTimeout(() => box.classList.add('hidden'), 300);
        }, 3000);
    }

    function mostrarValor(valor, prefijo = '', sufijo = '') {
        if (valor === null || valor === undefined || valor === 0 || valor === '0.00' || valor === '' || valor === '0') {
            return '-';
        }

        if (typeof valor === 'string' && valor.includes('-') && !valor.includes('/') && !valor.includes('.')) {
            return valor;
        }

        const num = parseFloat(valor);

        if (!isNaN(num)) {
            if (prefijo.includes('S/') || sufijo.includes('kg')) {
                const isCurrency = prefijo.includes('S/');
                const decimalPlaces = isCurrency ? 2 : 3;
                return `${prefijo}${num.toFixed(decimalPlaces)}${sufijo}`;
            }

            if (sufijo === '' && prefijo === '' && num === Math.floor(num)) {
                 return String(num.toFixed(0));
            }

            return String(num.toFixed(2));
        }

        return valor;
    }

    function numeroALetras(total) {
        return `[CANTIDAD EN LETRAS DE ${mostrarValor(total, 'S/ ')}]`;
    }

    async function cargarCompras() {
        const tbody = document.getElementById("tabla-compras");
        try {
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
                tr.classList.add('text-center', index % 2 === 0 ? 'bg-white' : 'bg-gray-50', 'hover:bg-indigo-50/50', 'transition', 'duration-150', 'border-b', 'border-gray-100');
                const compraDataString = JSON.stringify(compra).replace(/'/g, "\\'").replace(/"/g, "&quot;");

                tr.innerHTML = `
                    <td class="px-4 py-3 whitespace-nowrap text-gray-600">${mostrarValor(compra.fecha_emision)}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-gray-600">${mostrarValor(compra.fecha_vencimiento)}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-left font-medium">${mostrarValor(compra.tipo_comprobante)}</td>
                    <td class="px-4 py-3 whitespace-nowrap font-medium">${mostrarValor(compra.serie)}-${mostrarValor(compra.correlativo)}</td>
                    <td class="px-4 py-3 text-left font-semibold text-gray-800">${mostrarValor(compra.proveedor.razon_social)}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-gray-500">${mostrarValor(compra.moneda)}</td>
                    <td class="px-4 py-3 whitespace-nowrap"><span class="inline-flex items-center px-4 py-1.5 text-sm font-extrabold bg-green-600 text-white rounded-full shadow-lg">${mostrarValor(compra.total, 'S/ ')}</span></td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        <button class="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold py-1.5 px-3 rounded-xl shadow-md transition duration-200 text-xs mr-2" onclick='editarCompra(${compra.id_compra})'><i class="bi bi-pencil-square"></i> Editar</button>
                        <button class="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-1.5 px-3 rounded-xl shadow-md transition duration-200 text-xs" onclick='verDetalles(${compraDataString})'><i class="bi bi-eye"></i> Detalles</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

        } catch (error) {
            console.error(error);
            tbody.innerHTML = '<tr><td colspan="8" class="text-center py-6 text-red-600 italic font-bold bg-red-50">❌ Error al conectar con el servidor para obtener las compras.</td></tr>';
        }
    }

    function verDetalles(compra) {
        compraActual = compra;
        productoMap = {};
        cajaMap = {};
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
        const lotesResumenBody = document.getElementById("tabla-lotes-resumen");
        lotesResumenBody.innerHTML = "";
        let hayProductos = false;

        if (compra.detalles && compra.detalles.length > 0) {
            hayProductos = true;
            compra.detalles.forEach((d, index) => {
                const idArticulo = d.id_articulo;

                productoMap[idArticulo] = {
                    detalle: d,
                    lotes: d.lotes || [],
                    cantidadLotesAsignada: (d.lotes || []).reduce((sum, lote) => sum + (parseFloat(lote.cantidad_lote) || 0), 0)
                };

                const productoData = productoMap[idArticulo];
                const lotesCount = productoData.lotes.length;
                const unidad = unidadAbreviatura(d.unidad_medida);
                const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';

                tbodyProducto.innerHTML += `
                    <tr class="${rowClass} hover:bg-indigo-50 transition duration-100 border-b border-gray-100">
                        <td class="px-4 py-2 border-r border-gray-100">${mostrarValor(d.codigo_articulo)}</td>
                        <td class="px-4 py-2 text-left border-r border-gray-100 text-gray-700 font-medium">${mostrarValor(d.descripcion_articulo)}</td>
                        <td class="px-4 py-2 border-r border-gray-100 font-medium">${unidad}</td>
                        <td class="px-4 py-2 border-r border-gray-100 font-extrabold">${mostrarValor(d.cantidad)}</td>
                        <td class="px-4 py-2 border-r border-gray-100 font-extrabold text-green-700">${mostrarValor(d.precio_con_descuento, 'S/ ')}</td>
                        <td class="px-4 py-2 border-r border-gray-100 font-extrabold text-indigo-700 bg-indigo-50">${mostrarValor(d.total_detalle, 'S/ ')}</td>
                        <td class="px-4 py-2">
                            <button class="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-1 px-3 rounded-xl shadow-md transition duration-200 text-xs" onclick='mostrarDetallesProducto(${idArticulo})'><i class="bi bi-three-dots mr-1"></i> Detalles</button>
                        </td>
                    </tr>`;

                const lotesDisplay = lotesCount > 0
                    ? `<span class="font-extrabold text-green-700">${lotesCount} lote${lotesCount > 1 ? 's' : ''}</span>`
                    : `<span class="italic font-bold text-red-500">No tiene lote</span>`;

                const actionButton = lotesCount > 0
                    ? `<button class="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-1.5 px-3 rounded-xl shadow-md transition duration-200 text-xs" onclick='mostrarDetallesLote(${idArticulo}, "${mostrarValor(d.descripcion_articulo)}")'><i class="bi bi-eye mr-1"></i> Ver Lotes</button>`
                    : `<button class="bg-red-400 text-white font-semibold py-1.5 px-3 rounded-xl shadow-md text-xs cursor-not-allowed" disabled><i class="bi bi-x-circle mr-1"></i> No Aplica</button>`;

                const cantidadGeneral = `${mostrarValor(d.cantidad)} ${unidad}`;


                lotesResumenBody.innerHTML += `
                    <tr class="${rowClass} hover:bg-gray-100 transition duration-100 border-b border-gray-100 text-center">
                        <td class="px-4 py-3 text-left font-semibold text-gray-800">${mostrarValor(d.descripcion_articulo)}</td>
                        <td class="px-4 py-3 font-extrabold">${cantidadGeneral}</td>
                        <td class="px-4 py-3">${lotesDisplay}</td>
                        <td class="px-4 py-3">${actionButton}</td>
                    </tr>`;
            });

        }

        if (!hayProductos) {
            const noDetailsMessage = '<tr><td colspan="7" class="text-gray-500 italic p-6 text-center">No hay detalles de productos registrados.</td></tr>';
            tbodyProducto.innerHTML = noDetailsMessage;
            lotesResumenBody.innerHTML = '<tr><td colspan="4" class="text-gray-500 italic p-6 text-center">No hay productos registrados en esta compra.</td></tr>';
        }

        const cajasResumenBody = document.getElementById("tabla-cajas-resumen");
        cajasResumenBody.innerHTML = "";
        let totalCajas = 0;
        let totalCostoCajas = 0;
        const cajasCompra = compra.cajas_compra || [];

        if (cajasCompra.length > 0) {
            totalCajas = cajasCompra.length;

            cajasCompra.forEach((caja, index) => {
                const idCaja = caja.id_caja_compra;
                const costoCaja = parseFloat(caja.costo_caja) || 0;
                totalCostoCajas += costoCaja;

                cajaMap[idCaja] = {
                    caja: caja,
                    contenido: caja.detalles || []
                };

                const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                cajasResumenBody.innerHTML += `
                    <tr class="${rowClass} hover:bg-blue-50 transition duration-100 border-b border-gray-100 text-center">
                        <td class="px-4 py-3 border-r border-gray-100 text-left font-medium text-gray-700">${mostrarValor(caja.nombre_caja)}</td>
                        <td class="px-4 py-3 border-r border-gray-100 font-extrabold">${mostrarValor(caja.cantidad)}</td>
                        <td class="px-4 py-3 border-r border-gray-100 font-extrabold text-blue-700 bg-blue-100">${mostrarValor(costoCaja, 'S/ ')}</td>
                        <td class="px-4 py-3">
                            <button class="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-1.5 px-3 rounded-xl shadow-md transition duration-200 text-xs" onclick='mostrarContenidoCaja(${idCaja}, "${mostrarValor(caja.nombre_caja)}")'><i class="bi bi-box mr-1"></i> Ver Contenido</button>
                        </td>
                    </tr>`;
            });

        } else {
            cajasResumenBody.innerHTML = '<tr><td colspan="4" class="text-gray-500 italic p-6 text-center">No hay información de cajas de compra registradas.</td></tr>';
        }

        document.getElementById('total-cajas-display').textContent = totalCajas;
        document.getElementById('total-costo-cajas-display').textContent = mostrarValor(totalCostoCajas, 'S/ ');

        const gt = compra.guia || {};
        const infoGuiaHTML = gt.id_guia ? `
            <div class="mb-5 p-5 border border-emerald-300 rounded-xl bg-emerald-50/70 shadow-md">
                <div class="font-extrabold text-lg text-emerald-700 mb-3 border-b pb-2 border-emerald-200 uppercase">Datos de la Guía de Remisión (Emisor)</div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div><strong class="text-gray-600">ID Guía:</strong> <span class="font-medium text-gray-800">${mostrarValor(gt.id_guia)}</span></div>
                    <div class="col-span-2"><strong class="text-gray-600">RUC/Razón Social:</strong> <span class="font-medium text-gray-800">${mostrarValor(gt.ruc_guia)}</span></div>
                    <div><strong class="text-gray-600">F. Emisión:</strong> <span class="font-medium text-gray-800">${mostrarValor(gt.fecha_emision_guia)}</span></div>
                    <div><strong class="text-gray-600">Tipo Comp.:</strong> <span class="font-medium text-gray-800">${mostrarValor(gt.tipo_comprobante_guia)}</span></div>
                    <div><strong class="text-gray-600">Serie/Correlativo:</strong> <span class="font-medium text-gray-800">${mostrarValor(gt.serie_guia)}-${mostrarValor(gt.correlativo_guia)}</span></div>
                </div>
            </div>

            <div class="p-5 border border-orange-300 rounded-xl bg-orange-50/70 shadow-md">
                <div class="font-extrabold text-lg text-orange-700 mb-3 border-b pb-2 border-orange-200 uppercase">Detalles y Costos del Traslado</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong class="text-gray-600">Punto de Partida:</strong> <span class="font-medium text-gray-800">${mostrarValor(gt.puntoPartida)}</span></div>
                    <div><strong class="text-gray-600">Punto de Llegada:</strong> <span class="font-medium text-gray-800">${mostrarValor(gt.puntoLlegada)}</span></div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                    <div><strong class="text-gray-600">Guía Transp. S/C:</strong> <span class="font-medium text-gray-800">${mostrarValor(gt.serie_guia_transporte)}-${mostrarValor(gt.correlativo_guia_transporte)}</span></div>
                    <div><strong class="text-gray-600">Ciudad Traslado:</strong> <span class="font-medium text-gray-800">${mostrarValor(gt.ciudad_traslado)}</span></div>
                    <div><strong class="text-gray-600">Peso Total:</strong> <span class="font-medium text-gray-800">${mostrarValor(gt.peso_guia, '', ' kg')}</span></div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-3 border-t border-orange-200/50 text-sm">
                    <div><strong class="text-gray-600">Costo Total:</strong> <span class="font-extrabold text-green-700 block text-base">${mostrarValor(gt.coste_transporte_guia, 'S/ ')}</span></div>
                    <div><strong class="text-gray-600">F. Pedido:</strong> <span class="font-medium text-gray-800">${mostrarValor(gt.fecha_pedido)}</span></div>
                    <div><strong class="text-gray-600">F. Entrega:</strong> <span class="font-medium text-gray-800">${mostrarValor(gt.fecha_entrega)}</span></div>
                </div>
            </div>
        ` : `<p class="text-gray-500 italic p-8 text-center bg-white rounded-xl shadow-inner border border-gray-100">No hay guía de transporte asociada a esta compra.</p>`;
        document.getElementById("info-guia").innerHTML = infoGuiaHTML;

        const rc = compra.referencia || {};
        const infoReferenciaHTML = rc.id_referencia ? `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-amber-300 rounded-xl bg-amber-50/70 shadow-lg">
                <div class="border-r border-amber-200 pr-4"><strong class="text-gray-600 uppercase text-xs">Número Cotización:</strong> <span class="font-extrabold text-lg block mt-1 text-gray-800">${mostrarValor(rc.numero_cotizacion)}</span></div>
                <div><strong class="text-gray-600 uppercase text-xs">Número Pedido:</strong> <span class="font-extrabold text-lg block mt-1 text-gray-800">${mostrarValor(rc.numero_pedido)}</span></div>
            </div>
        ` : `<p class="text-gray-500 italic p-8 text-center bg-white rounded-xl shadow-inner border border-gray-100">No hay referencias (cotización/pedido) asociadas a esta compra.</p>`;
        document.getElementById("info-referencia").innerHTML = infoReferenciaHTML;

        document.querySelectorAll('#detallesTab .tab-button').forEach(btn => {
            btn.classList.remove('active', 'bg-indigo-700', 'text-white', 'shadow-xl', 'transform', 'hover:scale-[1.01]', 'text-gray-700', 'hover:bg-white/80', 'hover:shadow-md');
            btn.classList.add('text-gray-700', 'hover:bg-white/80', 'hover:shadow-md');
        });

        const productosButton = document.querySelector('#detallesTab button[data-target="productos"]');
        productosButton.classList.add('active', 'bg-indigo-700', 'text-white', 'shadow-xl', 'transform', 'hover:scale-[1.01]');
        productosButton.classList.remove('text-gray-700', 'hover:bg-white/80', 'hover:shadow-md');

        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.add('hidden');
        });

        document.getElementById('productos').classList.remove('hidden');
        document.getElementById('detallesModal').classList.remove('hidden');
    }

    function mostrarDetallesProducto(idArticulo) {
        const data = productoMap[idArticulo];
        if (!data) {
            showMessage("No se encontró el detalle del artículo.", 'info');
            return;
        }

        const d = data.detalle;
        document.getElementById('producto-detalle-titulo').textContent = mostrarValor(d.descripcion_articulo);
        document.getElementById('detalle-punitario').textContent = mostrarValor(d.precio_unitario, 'S/ ');
        document.getElementById('detalle-igvinsumo').textContent = mostrarValor(d.igv_insumo, 'S/ ');
        document.getElementById('detalle-peso').textContent = mostrarValor(d.peso_total, '', ' kg');
        document.getElementById('detalle-costeunitario').textContent = mostrarValor(d.coste_unitario_transporte, 'S/ ');
        document.getElementById('detalle-costetotal').textContent = mostrarValor(d.coste_total_transporte, 'S/ ');
        document.getElementById('detallesProductoModal').classList.remove('hidden');
    }

    function mostrarDetallesLote(idArticulo, descripcion) {
        const data = productoMap[idArticulo];
        const tbodyDetalle = document.getElementById("tabla-lotes-detalle");
        tbodyDetalle.innerHTML = "";
        document.getElementById('lote-producto-titulo').textContent = descripcion;

        if (data && data.lotes.length > 0) {
            data.lotes.forEach((lote, index) => {
                const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                tbodyDetalle.innerHTML += `
                    <tr class="${rowClass} hover:bg-gray-100 transition duration-100 border-b border-gray-100">
                        <td class="px-4 py-2 border-r border-gray-100 font-semibold">${mostrarValor(lote.numero_lote)}</td>
                        <td class="px-4 py-2 border-r border-gray-100">${mostrarValor(lote.cantidad_lote)}</td>
                        <td class="px-4 py-2 font-bold bg-gray-200/50">${mostrarValor(lote.fecha_vencimiento)}</td>
                    </tr>`;
            });
        } else {
            tbodyDetalle.innerHTML = '<tr><td colspan="3" class="font-extrabold text-red-600 p-6 text-center bg-red-50/50">ESTE PRODUCTO NO TIENE LOTES REGISTRADOS.</td></tr>';
        }

        document.getElementById('detallesLotesModal').classList.remove('hidden');
    }

    function mostrarContenidoCaja(idCaja, nombreCaja) {
        const data = cajaMap[idCaja];
        const tbodyDetalle = document.getElementById("tabla-cajas-detalle");
        tbodyDetalle.innerHTML = "";
        document.getElementById('caja-nombre-titulo').textContent = nombreCaja || idCaja;

        if (data && data.contenido.length > 0) {
            data.contenido.forEach((item, index) => {
                const productoInfo = productoMap[item.id_articulo] ? productoMap[item.id_articulo].detalle : {};
                const descripcion = productoInfo.descripcion_articulo || `Artículo ID: ${item.id_articulo}`;
                const codigo = productoInfo.codigo_articulo || '-';
                const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';

                tbodyDetalle.innerHTML += `
                    <tr class="${rowClass} hover:bg-blue-50 transition duration-100 border-b border-gray-100">
                        <td class="px-4 py-2 border-r border-gray-100 font-semibold">${mostrarValor(codigo)}</td>
                        <td class="px-4 py-2 border-r border-gray-100 text-left font-medium text-gray-700">${mostrarValor(descripcion)}</td>
                        <td class="px-4 py-2 font-bold text-blue-700 bg-blue-50">${mostrarValor(item.cantidad)}</td>
                    </tr>`;
            });
        } else {
            tbodyDetalle.innerHTML = '<tr><td colspan="3" class="text-gray-500 italic p-6 text-center">No se encontraron artículos dentro de esta caja.</td></tr>';
        }

        document.getElementById('detallesCajasModal').classList.remove('hidden');
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
        document.getElementById('numero-factura-doc').textContent = `${mostrarValor(compraActual.tipo_comprobante)}-${mostrarValor(compraActual.serie)}-${mostrarValor(compraActual.correlativo)}`;

        const tbodyDoc = document.getElementById("tabla-producto-doc");
        tbodyDoc.innerHTML = "";

        if (compraActual.detalles && compraActual.detalles.length > 0) {
            compraActual.detalles.forEach((d, index) => {
                const precioUnitarioRaw = parseFloat(d.precio_unitario) || 0;
                const precioConDescuentoRaw = parseFloat(d.precio_con_descuento) || precioUnitarioRaw;
                const precioBase = precioConDescuentoRaw;
                const valorUnitario = (precioBase / (1 + 0.18));
                const importeTotal = parseFloat(d.total_detalle) || 0;

                tbodyDoc.innerHTML += `
                    <tr class="h-8 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 text-sm">
                        <td class="border border-gray-400 px-2 py-1 text-center">${mostrarValor(d.cantidad)}</td>
                        <td class="border border-gray-400 px-2 py-1">${mostrarValor(d.descripcion_articulo)}</td>
                        <td class="border border-gray-400 px-2 py-1 text-right">${mostrarValor(valorUnitario, 'S/ ')}</td>
                        <td class="border border-gray-400 px-2 py-1 text-right">${mostrarValor(precioBase, 'S/ ')}</td>
                        <td class="border border-gray-400 px-2 py-1 text-right font-bold text-indigo-700">${mostrarValor(importeTotal, 'S/ ')}</td>
                    </tr>`;
            });
        } else {
            tbodyDoc.innerHTML = '<tr><td colspan="5" class="text-gray-500 italic p-4 text-center text-sm">Sin detalles de productos registrados.</td></tr>';
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
                const unidad = unidadAbreviatura(d.unidad_medida);

                tbodyDoc.innerHTML += `
                    <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 text-sm">
                        <td class="border border-gray-400 px-2 py-1 text-center">${index + 1}</td>
                        <td class="border border-gray-400 px-2 py-1">${mostrarValor(d.descripcion_articulo)}</td>
                        <td class="border border-gray-400 px-2 py-1 w-24 text-center">${unidad}</td>
                        <td class="border border-gray-400 px-2 py-1 w-24 text-right font-bold text-red-700">${mostrarValor(cantidad)}</td>
                    </tr>`;
            });
        } else {
            tbodyDoc.innerHTML = '<tr><td colspan="4" class="text-gray-500 italic p-4 text-center text-sm">Sin detalles de productos registrados.</td></tr>';
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