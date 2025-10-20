const VENTA_SERVLET_URL = '/VentaServlet';

const unidadesMedida = [
    { id: 1, nombre: 'LITRO', abreviatura: 'L' },
    { id: 2, nombre: 'GALON', abreviatura: 'GLN' },
    { id: 3, nombre: 'BIDON', abreviatura: 'BDN' },
    { id: 4, nombre: 'UNIDAD', abreviatura: 'UND' },
    { id: 5, nombre: 'KILOGRAMO', abreviatura: 'KG' },
    { id: 6, nombre: 'PAQUETE', abreviatura: 'PQ' },
    { id: 7, nombre: 'ROLLO', abreviatura: 'RL' },
    { id: 8, nombre: 'SACO', abreviatura: 'SC' },
    { id: 9, nombre: 'PLANCHA', abreviatura: 'PL' },
    { id: 10, nombre: 'CIENTO', abreviatura: 'C' }
];

function generarOpcionesUnidad(valorSeleccionado = 4) {
    let options = '';
    unidadesMedida.forEach(unidad => {
        const selected = unidad.id === valorSeleccionado ? 'selected' : '';
        options += `<option value="${unidad.id}" ${selected}>${unidad.abreviatura}</option>`;
    });
    return options;
}

document.addEventListener('DOMContentLoaded', () => {
    const bodyItemsVenta = document.getElementById('bodyItemsVenta');
    const agregarItemVentaBtn = document.getElementById('agregarItemVentaBtn');
    const btnGuardarVenta = document.getElementById('btnGuardarVenta');
    const subtotalSinIgvSpan = document.getElementById('subtotalSinIgv');
    const descuentoVentaSpan = document.getElementById('descuentoVenta');
    const igvVentaSpan = document.getElementById('igvVenta');
    const totalVentaSpan = document.getElementById('totalVenta');
    const pesoTotalVentaSpan = document.getElementById('pesoTotalVenta');
    const aplicaIgvCheckbox = document.getElementById('aplicaIgv');
    const tipoDescuentoRadios = document.querySelectorAll('input[name="tipoDescuento"]');
    const descuentoGlobalContainer = document.getElementById('descuentoGlobalContainer');
    const descuentoHeader = document.querySelector('.descuento-header');
    const modalDescuentoItem = new bootstrap.Modal(document.getElementById('modalDescuentoItem'));
    const itemDescripcionModal = document.getElementById('itemDescripcionModal');
    const valorDescuentoItem = document.getElementById('valorDescuentoItem');
    const tipoDescuentoItem = document.getElementById('tipoDescuentoItem');
    const guardarDescuentoItemBtn = document.getElementById('guardarDescuentoItemBtn');
    const opcionTrasladoSelect = document.getElementById('opcionTraslado');
    const modalidadTransporteSelect = document.getElementById('modalidadTransporte');
    const transportePublicoContainer = document.getElementById('transportePublicoContainer');
    const transportePrivadoContainer = document.getElementById('transportePrivadoContainer');
    const modalTraslado = new bootstrap.Modal(document.getElementById('modalTraslado'));
    const modalConformidadCliente = new bootstrap.Modal(document.getElementById('modalConformidadCliente'));
    const modalLotesVencimiento = new bootstrap.Modal(document.getElementById('modalLotesVencimiento'));
    const tablaLotesDisponiblesBody = document.getElementById('bodyLotes');
    const itemLoteDescripcion = document.getElementById('itemLoteDescripcion');
    const itemLoteCantidadTotal = document.getElementById('itemLoteCantidadTotal');
    let currentRow = null;
    const busquedaProductosInput = document.getElementById('busquedaProductos');
    const listaResultadosBusqueda = document.getElementById('listaResultadosBusqueda');
    let busquedaTimeout;
    const busquedaClienteInput = document.getElementById('busquedaCliente');
    const listaResultadosClientes = document.getElementById('listaResultadosClientes');
    const inputIdCliente = document.getElementById('idCliente');
    const spanClienteSeleccionado = document.getElementById('spanClienteSeleccionado');
    const serieComprobanteInput = document.getElementById('serieComprobante');
    const correlativoComprobanteInput = document.getElementById('correlativoComprobante');
    let debounceTimerClientes;
    const pesoTotalTrasladoInput = document.getElementById('pesoTotalTraslado');

    const buscarClientes = async (q) => {
        if (q.length < 1) {
            listaResultadosClientes.innerHTML = '';
            return;
        }
        const url = `${VENTA_SERVLET_URL}?action=buscarCliente&query=${encodeURIComponent(q)}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error HTTP! estado: ${response.status}`);
            }
            const clientes = await response.json();
            mostrarResultadosClientes(clientes);
        } catch (error) {
            listaResultadosClientes.innerHTML = `<li class="list-group-item list-group-item-danger">Error al buscar clientes.</li>`;
        }
    };

    if (busquedaClienteInput) {
        busquedaClienteInput.addEventListener('input', () => {
            clearTimeout(debounceTimerClientes);
            const q = busquedaClienteInput.value.trim();
            debounceTimerClientes = setTimeout(() => {
                buscarClientes(q);
            }, 300);
        });

        document.addEventListener('click', (e) => {
            if (!busquedaClienteInput.contains(e.target) && !listaResultadosClientes.contains(e.target)) {
                listaResultadosClientes.innerHTML = '';
            }
        });
    }

    const mostrarResultadosClientes = (clientes) => {
        listaResultadosClientes.innerHTML = '';
        if (clientes.length === 0) {
            listaResultadosClientes.innerHTML = `<li class="list-group-item">No se encontraron clientes.</li>`;
            return;
        }
        clientes.slice(0, 10).forEach(cliente => {
            const li = document.createElement('li');
            li.className = 'client-search-item list-group-item list-group-item-action';
            li.textContent = `${cliente.n_Documento} - ${cliente.razonSocial}`;
            li.dataset.client = JSON.stringify({
                id: cliente.id,
                documento: cliente.n_Documento,
                razonSocial: cliente.razonSocial
            });
            li.addEventListener('click', () => {
                const clientData = JSON.parse(li.dataset.client);
                inputIdCliente.value = clientData.id;
                spanClienteSeleccionado.textContent = `${clientData.razonSocial} (${clientData.documento})`;
                listaResultadosClientes.innerHTML = '';
                busquedaClienteInput.value = clientData.razonSocial;
            });
            listaResultadosClientes.appendChild(li);
        });
    };

    const buscarArticulos = async (query) => {
        if (query.length < 1) {
            listaResultadosBusqueda.innerHTML = '';
            return;
        }
        const url = `${VENTA_SERVLET_URL}?action=buscarArticulos&query=${encodeURIComponent(query)}`;
        try {
            const response = await fetch(url);
            const articulos = await response.json();
            mostrarResultados(articulos);
        } catch (error) {
            listaResultadosBusqueda.innerHTML = `<li class="list-group-item list-group-item-danger">Error al buscar artículos.</li>`;
        }
    };

    const mostrarResultados = (articulos) => {
        listaResultadosBusqueda.innerHTML = '';
        if (articulos.length === 0) {
            listaResultadosBusqueda.innerHTML = `<li class="list-group-item">No se encontraron artículos.</li>`;
            return;
        }
        articulos.slice(0, 10).forEach(articulo => {
            const li = document.createElement('li');
            li.className = 'product-search-item';
            li.textContent = `${articulo.codigo} - ${articulo.descripcion} (Stock: ${articulo.cantidad}) S/ ${articulo.precioUnitario.toFixed(2)}`;
            li.dataset.product = JSON.stringify({
                id: articulo.id,
                codigo: articulo.codigo,
                descripcion: articulo.descripcion,
                precio: articulo.precioUnitario,
                peso: articulo.pesoUnitario || 0,
                stock: articulo.cantidad,
                idUnidad: articulo.idUnidad || 4
            });
            li.addEventListener('click', () => {
                const productData = JSON.parse(li.dataset.product);
                if (productData.stock <= 0) {
                    alert(`¡Alerta de Stock! El artículo "${productData.descripcion}" no está disponible. Stock actual: 0.`);
                    return;
                }
                createItemRow(productData);
                listaResultadosBusqueda.innerHTML = '';
                busquedaProductosInput.value = '';
            });
            listaResultadosBusqueda.appendChild(li);
        });
    };

    const updateTotals = () => {
        let subtotalBase = 0;
        let totalDescuentoAplicado = 0;
        let totalPeso = 0;
        const IGV_RATE = 0.18;
        const shouldApplyIgv = aplicaIgvCheckbox.checked;
        const rows = bodyItemsVenta.querySelectorAll('tr');
        const isPerItemDiscount = document.getElementById('descuentoPorItem').checked;

        rows.forEach(row => {
            const cantidad = parseFloat(row.querySelector('.item-cantidad')?.value) || 0;
            const precio = parseFloat(row.querySelector('.item-precio-unitario')?.value) || 0;
            const pesoUnitario = parseFloat(row.querySelector('.item-peso-unitario')?.value) || 0;
            const baseTotal = cantidad * precio;
            totalPeso += cantidad * pesoUnitario;
            subtotalBase += baseTotal;

            let itemDiscount = 0;
            if (isPerItemDiscount) {
                const valorDescItem = parseFloat(row.dataset.descuentoValor) || 0;
                const tipoDescItem = row.dataset.descuentoTipo || 'monto';
                if (tipoDescItem === 'porcentaje') {
                    itemDiscount = baseTotal * (valorDescItem / 100);
                } else {
                    itemDiscount = valorDescItem;
                }
            }
            totalDescuentoAplicado += itemDiscount;
            const finalItemTotal = baseTotal - itemDiscount;

            row.querySelector('.item-subtotal-value').value = baseTotal.toFixed(2);
            row.querySelector('.item-total-value').value = Math.max(0, finalItemTotal).toFixed(2);

            const totalItemSpan = row.querySelector('.item-total-line');
            if (totalItemSpan) {
                 totalItemSpan.textContent = `S/ ${Math.max(0, finalItemTotal).toFixed(2)}`;
            }
            const loteBtn = row.querySelector('.btn-lotes-item');
            if (loteBtn) loteBtn.disabled = cantidad <= 0;
        });

        let descuentoGlobalCalculado = 0;
        if (!isPerItemDiscount && document.getElementById('aplicaDescuentoSi').checked) {
            const valor = parseFloat(document.getElementById('valorDescuentoGlobal')?.value) || 0;
            const tipo = document.getElementById('tipoDescuentoGlobal')?.value;
            const subtotalNeto = subtotalBase;

            if (tipo === 'porcentaje') {
                descuentoGlobalCalculado = subtotalNeto * (valor / 100);
            } else {
                descuentoGlobalCalculado = valor;
            }
            totalDescuentoAplicado += descuentoGlobalCalculado;
        }

        totalDescuentoAplicado = Math.min(totalDescuentoAplicado, subtotalBase);
        const subtotalFinal = subtotalBase - totalDescuentoAplicado;

        let igv = 0;
        if (shouldApplyIgv && subtotalFinal > 0) {
            igv = subtotalFinal * IGV_RATE;
        }
        const totalFinal = subtotalFinal + igv;

        subtotalSinIgvSpan.textContent = `S/ ${subtotalBase.toFixed(2)}`;
        descuentoVentaSpan.textContent = `S/ ${totalDescuentoAplicado.toFixed(2)}`;
        igvVentaSpan.textContent = `S/ ${igv.toFixed(2)}`;
        totalVentaSpan.textContent = `S/ ${Math.max(0, totalFinal).toFixed(2)}`;
        pesoTotalVentaSpan.textContent = `${totalPeso.toFixed(2)} Kg`;

        if (pesoTotalTrasladoInput) {
            pesoTotalTrasladoInput.value = totalPeso.toFixed(3);
        }
    };

    const setupRowEvents = (row) => {
        const inputsToRecalculate = row.querySelectorAll('.item-cantidad, .item-precio-unitario, .item-peso-unitario, .item-unidad-medida');
        inputsToRecalculate.forEach(input => {
            input.addEventListener('input', updateTotals);
            input.addEventListener('change', updateTotals);
        });
        row.querySelector('.btn-delete-item').addEventListener('click', () => {
            row.remove();
            updateTotals();
        });
        row.querySelector('.btn-descuento-item')?.addEventListener('click', () => {
            currentRow = row;
            itemDescripcionModal.value = row.querySelector('.item-descripcion')?.value || 'Ítem sin descripción';
            valorDescuentoItem.value = row.dataset.descuentoValor;
            tipoDescuentoItem.value = row.dataset.descuentoTipo;
            modalDescuentoItem.show();
        });
        row.querySelector('.btn-lotes-item')?.addEventListener('click', () => {
            const cantidad = parseFloat(row.querySelector('.item-cantidad')?.value) || 0;
            const idArticulo = parseFloat(row.dataset.idArticulo) || 0;
            if (cantidad > 0 && idArticulo > 0) {
                currentRow = row;
                loadLotes(row, idArticulo, cantidad);
            } else {
                alert("Ingrese una cantidad mayor a cero y asegúrese de que el ítem tenga un ID de Artículo válido para ver los lotes.");
            }
        });
    };

    const createItemRow = (product = null) => {
        const row = document.createElement('tr');
        const index = bodyItemsVenta.rows.length;
        row.setAttribute('data-index', index);
        row.dataset.descuentoValor = 0;
        row.dataset.descuentoTipo = 'monto';
        row.dataset.idArticulo = product ? product.id : 0;
        row.dataset.idDetalleVenta = 0;

        const isPerItemDiscount = document.getElementById('descuentoPorItem').checked;
        const initialPrice = product && product.precio ? product.precio.toFixed(2) : '0.00';
        const initialPeso = product && product.peso ? product.peso.toFixed(3) : '0.000';
        const initialUnidadId = product && product.idUnidad ? product.idUnidad : 4;

        row.innerHTML = `
            <td>
                <input type="text" class="form-control item-codigo" data-field="codigo" value="${product ? product.codigo : ''}" style="min-width: 80px;" readonly>
            </td>
            <td class="table-description-col">
                <input type="text" class="form-control item-descripcion" data-field="descripcion" value="${product ? product.descripcion : ''}" style="min-width: 250px;">
            </td>
            <td>
                <input type="number" class="form-control item-cantidad" data-field="cantidad" value="1" min="0.01" step="0.01" style="max-width: 80px;">
            </td>
            <td>
                <select class="form-select item-unidad-medida" data-field="idUnidad" style="min-width: 100px;">
                    ${generarOpcionesUnidad(initialUnidadId)}
                </select>
            </td>
            <td>
                <input type="number" class="form-control item-peso-unitario" data-field="pesoUnitario" value="${initialPeso}" min="0" step="0.001" style="max-width: 100px;">
            </td>
            <td>
                <input type="number" class="form-control item-precio-unitario" data-field="precioUnitario" value="${initialPrice}" min="0.01" step="0.01" style="max-width: 100px;">
            </td>
            <td class="discount-column" style="${isPerItemDiscount ? '' : 'display:none;'}">
                <span class="item-descuento-valor">S/ 0.00</span>
                <button type="button" class="btn btn-descuento-item btn-table" title="Aplicar Descuento"><i class="bi bi-tag"></i></button>
            </td>
            <td>
                <span class="item-total-line fw-bold">S/ 0.00</span>
                <input type="hidden" class="item-subtotal-value" value="0.00">
                <input type="hidden" class="item-total-value" value="0.00">
            </td>
            <td class="action-cell">
                <button type="button" class="btn btn-table btn-lotes-item" title="Ver Lotes Disponibles"><i class="bi bi-box-seam"></i></button>
                <button type="button" class="btn btn-table btn-delete-item" aria-label="Eliminar ítem" title="Eliminar Ítem"><i class="bi bi-trash"></i></button>
            </td>
        `;

        bodyItemsVenta.appendChild(row);
        setupRowEvents(row);
        updateTotals();
    };

    const getGeneralData = () => {
        const tipoDescuento = document.querySelector('input[name="tipoDescuento"]:checked').value;
        const subtotalText = subtotalSinIgvSpan.textContent.replace('S/ ', '');
        const descuentoTotalText = descuentoVentaSpan.textContent.replace('S/ ', '');
        const igvText = igvVentaSpan.textContent.replace('S/ ', '');
        const totalFinalText = totalVentaSpan.textContent.replace('S/ ', '');
        const totalPesoText = pesoTotalVentaSpan.textContent.replace(' Kg', '');

        const data = {
            idCliente: parseFloat(document.getElementById('idCliente')?.value) || 0,
            idTipoComprobante: parseFloat(document.getElementById('idTipoComprobante')?.value) || 0,
            serie: serieComprobanteInput?.value || '',
            correlativo: correlativoComprobanteInput?.value || '',
            idMoneda: parseFloat(document.getElementById('idMoneda')?.value) || 0,
            fechaEmision: document.getElementById('fechaEmision')?.value || new Date().toISOString().split('T')[0],
            fechaVencimiento: document.getElementById('fechaVencimiento')?.value || null,
            idTipoPago: parseFloat(document.getElementById('idTipoPago')?.value) || 0,
            estadoVenta: document.getElementById('estadoVenta')?.value || 'Pendiente',
            tipoDescuento: tipoDescuento,
            aplicaIgv: aplicaIgvCheckbox.checked,
            observaciones: document.getElementById('observaciones')?.value || '',
            subtotal: parseFloat(subtotalText),
            igv: parseFloat(igvText),
            descuentoTotal: parseFloat(descuentoTotalText),
            totalFinal: parseFloat(totalFinalText),
            totalPeso: parseFloat(totalPesoText),
            hayTraslado: opcionTrasladoSelect.value === 'si'
        };

        if (tipoDescuento === 'global' && document.getElementById('aplicaDescuentoSi').checked) {
            data.descuentoGlobal = {
                motivo: document.getElementById('motivoDescuentoGlobal')?.value || 'Descuento General',
                tipoValor: document.getElementById('tipoDescuentoGlobal')?.value || 'monto',
                valor: parseFloat(document.getElementById('valorDescuentoGlobal')?.value) || 0
            };
        }
        return data;
    };

    const getDetalles = () => {
        const detalles = [];
        const rows = bodyItemsVenta.querySelectorAll('tr');
        const isPerItemDiscount = document.getElementById('descuentoPorItem').checked;

        rows.forEach(row => {
            const cantidad = parseFloat(row.querySelector('.item-cantidad')?.value) || 0;
            const precioUnitario = parseFloat(row.querySelector('.item-precio-unitario')?.value) || 0;
            const totalItem = parseFloat(row.querySelector('.item-total-value')?.value) || 0;
            const subtotalItem = parseFloat(row.querySelector('.item-subtotal-value')?.value) || 0;
            const descuentoMonto = subtotalItem - totalItem;

            const detalle = {
                idArticulo: parseFloat(row.dataset.idArticulo) || 0,
                idUnidad: parseFloat(row.querySelector('.item-unidad-medida')?.value) || 0,
                descripcion: row.querySelector('.item-descripcion')?.value || '',
                cantidad: cantidad,
                pesoUnitario: parseFloat(row.querySelector('.item-peso-unitario')?.value) || 0,
                precioUnitario: precioUnitario,
                descuentoMonto: descuentoMonto,
                subtotal: subtotalItem,
                total: totalItem
            };

            if (isPerItemDiscount && parseFloat(row.dataset.descuentoValor) > 0) {
                detalle.detalleDescuento = {
                    motivo: 'Descuento por ítem',
                    tipoValor: row.dataset.descuentoTipo,
                    valor: parseFloat(row.dataset.descuentoValor)
                };
            }
            detalles.push(detalle);
        });
        return detalles;
    };

    const getTrasladoData = () => {
        const hayTraslado = opcionTrasladoSelect.value === 'si';
        const pesoTotal = parseFloat(pesoTotalVentaSpan.textContent.replace(' Kg', '')) || 0;

        if (hayTraslado) {
            return {
                modalidadTransporte: modalidadTransporteSelect.value,
                peso: pesoTotal,
                rucEmpresa: document.getElementById('rucEmpresa')?.value || '',
                razonSocialEmpresa: document.getElementById('razonSocialEmpresa')?.value || '',
                placaVehiculo: document.getElementById('placaVehiculo')?.value || '',
                dniConductor: document.getElementById('dniConductor')?.value || '',
                nombreConductor: document.getElementById('nombreConductor')?.value || '',
                puntoPartida: document.getElementById('puntoPartida')?.value || '',
                puntoLlegada: document.getElementById('puntoLlegada')?.value || '',
                fechaTraslado: document.getElementById('fechaTraslado')?.value || new Date().toISOString().split('T')[0],
                observaciones: document.getElementById('observacionesTraslado')?.value || '',
                conformidadNombre: document.getElementById('nombreConformidadTraslado')?.value || '',
                conformidadDni: document.getElementById('dniConformidadTraslado')?.value || ''
            };
        } else {
            return {
                nombre: document.getElementById('nombreConformidadTienda')?.value || '',
                dni: document.getElementById('dniConformidadTienda')?.value || ''
            };
        }
    };

    const registrarVenta = async () => {
        try {
            const ventaData = getGeneralData();
            ventaData.detalles = getDetalles();

            if (ventaData.detalles.length === 0 || ventaData.detalles.some(d => d.idArticulo === 0)) {
                alert("Debe agregar al menos un ítem válido a la venta (con ID de Artículo).");
                return;
            }

            if (!ventaData.serie || !ventaData.correlativo) {
                alert("Los campos de Serie y Correlativo son obligatorios.");
                return;
            }

            if (ventaData.idCliente === 0) {
                alert("Debe seleccionar un cliente.");
                return;
            }

            if (ventaData.hayTraslado) {
                ventaData.datosTraslado = getTrasladoData();
            } else {
                ventaData.conformidadTienda = getTrasladoData();
            }

            const response = await fetch(VENTA_SERVLET_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ventaData)
            });

            const result = await response.json();

            if (result.success) {
                alert(`¡Éxito! ${result.message}`);
                window.location.reload();
            } else {
                alert(`Error: ${result.message}`);
            }

        } catch (error) {
            alert("Ocurrió un error de conexión o del servidor: " + error.message);
        }
    };

    const buscarLotes = async (idArticulo) => {
        const url = `${VENTA_SERVLET_URL}?action=buscarLotes&idArticulo=${idArticulo}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al buscar lotes disponibles.');
        }
        return await response.json();
    };

    const displayLotesDisponibles = (lotes) => {
        tablaLotesDisponiblesBody.innerHTML = '';
        if (lotes.length === 0) {
            tablaLotesDisponiblesBody.innerHTML = `<tr><td colspan="4">No hay lotes disponibles para este artículo.</td></tr>`;
            return;
        }

        lotes.forEach(lote => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${lote.lote}</td>
                <td>${lote.cantidadDisponible.toFixed(2)}</td>
                <td>${lote.vencimiento || 'N/A'}</td>
                <td>S/ ${(lote.precioCompraUnitario || 0).toFixed(2)}</td>
            `;
            tablaLotesDisponiblesBody.appendChild(row);
        });
    };

    function loadLotes(row, idArticulo, cantidad) {
        itemLoteDescripcion.textContent = row.querySelector('.item-descripcion').value;
        itemLoteCantidadTotal.textContent = cantidad.toFixed(2);

        tablaLotesDisponiblesBody.innerHTML = '<tr><td colspan="4">Cargando lotes disponibles...</td></tr>';

        buscarLotes(idArticulo)
            .then(lotes => displayLotesDisponibles(lotes))
            .catch(error => {
                tablaLotesDisponiblesBody.innerHTML = `<tr><td colspan="4" class="text-danger">${error.message}</td></tr>`;
            });

        modalLotesVencimiento.show();
    }

    agregarItemVentaBtn.addEventListener('click', () => createItemRow());

    aplicaIgvCheckbox.addEventListener('change', updateTotals);

    tipoDescuentoRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isPerItem = radio.value === 'porItem';
            descuentoGlobalContainer.style.display = isPerItem ? 'none' : (document.getElementById('aplicaDescuentoSi').checked ? 'block' : 'none');
            if (descuentoHeader) descuentoHeader.style.display = isPerItem ? 'table-cell' : 'none';
            bodyItemsVenta.querySelectorAll('.discount-column').forEach(col => col.style.display = isPerItem ? '' : 'none');
            updateTotals();
        });
    });

    document.getElementById('valorDescuentoGlobal')?.addEventListener('input', updateTotals);
    document.getElementById('tipoDescuentoGlobal')?.addEventListener('change', updateTotals);
    document.querySelectorAll('input[name="aplicaDescuento"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const aplica = document.getElementById('aplicaDescuentoSi').checked;
            const tipoDesc = document.querySelector('input[name="tipoDescuento"]:checked').value;

            opcionTipoDescuentoContainer.style.display = aplica ? 'block' : 'none';
            descuentoGlobalContainer.style.display = (aplica && tipoDesc === 'global') ? 'block' : 'none';
            if (descuentoHeader) descuentoHeader.style.display = (aplica && tipoDesc === 'porItem') ? 'table-cell' : 'none';
            bodyItemsVenta.querySelectorAll('.discount-column').forEach(col => col.style.display = (aplica && tipoDesc === 'porItem') ? '' : 'none');

            updateTotals();
        });
    });


    guardarDescuentoItemBtn.addEventListener('click', () => {
        if (currentRow) {
            currentRow.dataset.descuentoValor = valorDescuentoItem.value;
            currentRow.dataset.descuentoTipo = tipoDescuentoItem.value;
            const descuentoSpan = currentRow.querySelector('.item-descuento-valor');
            const valor = parseFloat(valorDescuentoItem.value) || 0;
            if (tipoDescuentoItem.value === 'porcentaje') {
                descuentoSpan.textContent = `-${valor.toFixed(2)}%`;
            } else {
                descuentoSpan.textContent = `S/ -${valor.toFixed(2)}`;
            }
            updateTotals();
            modalDescuentoItem.hide();
        }
    });

    modalidadTransporteSelect?.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        transportePublicoContainer.style.display = 'none';
        transportePrivadoContainer.style.display = 'none';
        if (selectedValue === 'publico') {
            transportePublicoContainer.style.display = 'flex';
        } else if (selectedValue === 'privado') {
            transportePrivadoContainer.style.display = 'flex';
        }
    });

    opcionTrasladoSelect?.addEventListener('change', (event) => {
        const opcion = event.target.value;
        modalTraslado.hide();
        modalConformidadCliente.hide();
        if (opcion === 'si') {
            updateTotals();
            modalTraslado.show();
        } else if (opcion === 'no') {
            modalConformidadCliente.show();
        }
    });

    btnGuardarVenta?.addEventListener('click', registrarVenta);

    busquedaProductosInput.addEventListener('input', (e) => {
        clearTimeout(busquedaTimeout);
        const query = e.target.value.trim();
        busquedaTimeout = setTimeout(() => {
            buscarArticulos(query);
        }, 300);
    });

    busquedaClienteInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimerClientes);
        const q = e.target.value.trim();
        debounceTimerClientes = setTimeout(() => {
            buscarClientes(q);
        }, 300);
    });

    if (bodyItemsVenta.children.length === 0) {
        createItemRow();
    } else {
        bodyItemsVenta.querySelectorAll('tr').forEach(setupRowEvents);
    }
    updateTotals();
});