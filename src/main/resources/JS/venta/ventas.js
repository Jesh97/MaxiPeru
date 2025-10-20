const VENTA_SERVLET_URL = '/VentaServlet';

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

    // NUEVOS CAMPOS AGREGADOS: SERIE Y CORRELATIVO
    const serieComprobanteInput = document.getElementById('serieComprobante');
    const correlativoComprobanteInput = document.getElementById('correlativoComprobante');

    let debounceTimerClientes;

    if (busquedaClienteInput) {
        busquedaClienteInput.addEventListener('input', () => {
            clearTimeout(debounceTimerClientes);
            const q = busquedaClienteInput.value.trim();

            if (q.length < 3) {
                listaResultadosClientes.innerHTML = '';
                return;
            }

            debounceTimerClientes = setTimeout(async () => {
                const url = `${VENTA_SERVLET_URL}?action=buscarCliente&query=${encodeURIComponent(q)}`;

                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Error HTTP! estado: ${response.status}`);
                    }
                    const clientes = await response.json();
                    mostrarResultadosClientes(clientes);
                } catch (error) {
                    console.error("Error al buscar clientes:", error);
                    listaResultadosClientes.innerHTML = `<li class="list-group-item list-group-item-danger">Error al buscar clientes.</li>`;
                }
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
        if (query.length < 3) {
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
                stock: articulo.cantidad
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
            const precio = parseFloat(row.querySelector('.item-precio')?.value) || 0;
            const pesoUnitario = parseFloat(row.querySelector('.item-peso')?.value) || 0;

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
            const totalItemSpan = row.querySelector('.item-total');
            if (totalItemSpan) {
                 totalItemSpan.textContent = Math.max(0, finalItemTotal).toFixed(2);
            }

            const loteBtn = row.querySelector('.lote-btn');
            if (loteBtn) loteBtn.disabled = cantidad <= 0;
        });

        if (!isPerItemDiscount) {
            const valor = parseFloat(document.getElementById('valorDescuentoGlobal')?.value) || 0;
            const tipo = document.getElementById('tipoDescuentoGlobal')?.value;
            const subtotalNeto = subtotalBase - totalDescuentoAplicado;

            if (tipo === 'porcentaje') {
                const globalDiscount = subtotalNeto * (valor / 100);
                totalDescuentoAplicado += globalDiscount;
            } else {
                totalDescuentoAplicado += valor;
            }
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
    };

    const setupRowEvents = (row) => {
        const inputsToRecalculate = row.querySelectorAll('.item-cantidad, .item-precio, .item-peso');
        inputsToRecalculate.forEach(input => {
            input.addEventListener('input', updateTotals);
        });

        row.querySelector('.eliminar-item-btn').addEventListener('click', () => {
            row.remove();
            updateTotals();
        });

        row.querySelector('.aplicar-descuento-btn')?.addEventListener('click', () => {
            currentRow = row;
            itemDescripcionModal.value = row.querySelector('.item-descripcion')?.value || 'Ítem sin descripción';
            valorDescuentoItem.value = row.dataset.descuentoValor;
            tipoDescuentoItem.value = row.dataset.descuentoTipo;
            modalDescuentoItem.show();
        });

        row.querySelector('.lote-btn')?.addEventListener('click', () => {
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
        row.dataset.descuentoValor = 0;
        row.dataset.descuentoTipo = 'monto';
        row.dataset.idArticulo = product ? product.id : 0;
        const isPerItemDiscount = document.getElementById('descuentoPorItem').checked;
        const initialPrice = product && product.precio ? product.precio.toFixed(2) : '0.00';
        const initialPeso = product && product.peso ? product.peso.toFixed(2) : '0.00';

        row.innerHTML = `
            <td><input type="text" class="form-control item-codigo" value="${product ? product.codigo : ''}" placeholder="Código"></td>
            <td class="table-description-col"><input type="text" class="form-control item-descripcion" value="${product ? product.descripcion : ''}" placeholder="Descripción"></td>
            <td><input type="number" class="form-control item-cantidad" value="1" min="1"></td>
            <td>
                <select class="form-select item-unidad-medida">
                    <option value="unidades">UND</option>
                    <option value="kg">KG</option>
                    <option value="litros">LIT</option>
                    <option value="metros">MTR</option>
                </select>
            </td>
            <td><input type="number" class="form-control item-peso" value="${initialPeso}" min="0" step="0.01"></td>
            <td><input type="number" class="form-control item-precio" value="${initialPrice}" min="0" step="0.01"></td>
            <td class="discount-column"><span class="item-descuento">S/ 0.00</span> <button type="button" class="btn btn-table btn-descuento-item aplicar-descuento-btn" title="Aplicar Descuento"><i class="bi bi-tag"></i></button></td>
            <td><span class="item-total fw-bold">0.00</span></td>
            <td class="action-cell">
                <button type="button" class="btn btn-table btn-lotes-item lote-btn" title="Ver Lotes Disponibles"><i class="bi bi-boxes"></i></button>
                <button type="button" class="btn btn-table btn-delete-item eliminar-item-btn" aria-label="Eliminar ítem" title="Eliminar Ítem"><i class="bi bi-trash"></i></button>
            </td>
        `;

        const discountColumn = row.querySelector('.discount-column');
        if (discountColumn) {
            discountColumn.style.display = isPerItemDiscount ? '' : 'none';
        }

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
            // CAPTURA DE SERIE Y CORRELATIVO
            serieComprobante: serieComprobanteInput?.value || '',
            correlativoComprobante: correlativoComprobanteInput?.value || '',
            // FIN DE CAPTURA
            idMoneda: parseFloat(document.getElementById('idMoneda')?.value) || 0,
            fechaEmision: document.getElementById('fechaEmision')?.value || new Date().toISOString().split('T')[0],
            fechaVencimiento: document.getElementById('fechaVencimiento')?.value || null,
            idTipoPago: parseFloat(document.getElementById('idTipoPago')?.value) || 0,
            estadoVenta: document.getElementById('estadoVenta')?.value || 'Emitida',
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

        if (tipoDescuento === 'global') {
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
            const precioUnitario = parseFloat(row.querySelector('.item-precio')?.value) || 0;
            const totalItem = parseFloat(row.querySelector('.item-total')?.textContent) || 0;

            const baseTotal = cantidad * precioUnitario;
            const descuentoMonto = baseTotal - totalItem;

            const detalle = {
                idArticulo: parseFloat(row.dataset.idArticulo) || 0,
                descripcion: row.querySelector('.item-descripcion')?.value || '',
                cantidad: cantidad,
                pesoUnitario: parseFloat(row.querySelector('.item-peso')?.value) || 0,
                precioUnitario: precioUnitario,
                descuentoMonto: descuentoMonto,
                subtotal: baseTotal,
                total: totalItem
            };

            if (isPerItemDiscount) {
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

        if (hayTraslado) {
            return {
                modalidadTransporte: modalidadTransporteSelect.value,
                peso: parseFloat(pesoTotalVentaSpan.textContent.replace(' Kg', '')),
                rucEmpresa: document.getElementById('rucEmpresa')?.value || '',
                razonSocialEmpresa: document.getElementById('razonSocialEmpresa')?.value || '',
                marcaVehiculo: document.getElementById('marcaVehiculo')?.value || '',
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

            if (ventaData.detalles.length === 0) {
                alert("Debe agregar al menos un ítem a la venta.");
                return;
            }

            // Validar campos de serie y correlativo
            if (!ventaData.serieComprobante || !ventaData.correlativoComprobante) {
                alert("Los campos de Serie y Correlativo son obligatorios.");
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
            descuentoGlobalContainer.style.display = isPerItem ? 'none' : 'block';
            if (descuentoHeader) descuentoHeader.style.display = isPerItem ? '' : 'none';
            bodyItemsVenta.querySelectorAll('.discount-column').forEach(col => col.style.display = isPerItem ? '' : 'none');
            updateTotals();
        });
    });
    document.getElementById('valorDescuentoGlobal')?.addEventListener('input', updateTotals);
    document.getElementById('tipoDescuentoGlobal')?.addEventListener('change', updateTotals);

    guardarDescuentoItemBtn.addEventListener('click', () => {
        if (currentRow) {
            currentRow.dataset.descuentoValor = valorDescuentoItem.value;
            currentRow.dataset.descuentoTipo = tipoDescuentoItem.value;
            const descuentoSpan = currentRow.querySelector('.item-descuento');
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
        clearTimeout(busquedaTimeout);
        const query = e.target.value.trim();
        busquedaTimeout = setTimeout(() => {
            buscarClientes(query);
        }, 300);
    });

    if (bodyItemsVenta.children.length === 0) {
        createItemRow();
    } else {
        bodyItemsVenta.querySelectorAll('tr').forEach(setupRowEvents);
    }
    updateTotals();
});