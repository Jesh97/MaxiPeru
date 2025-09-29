document.addEventListener('DOMContentLoaded', () => {
    // Referencias principales
    const bodyItemsVenta = document.getElementById('bodyItemsVenta');
    const agregarItemVentaBtn = document.getElementById('agregarItemVentaBtn');

    // Referencias al Resumen Financiero
    const subtotalSinIgvSpan = document.getElementById('subtotalSinIgv');
    const descuentoVentaSpan = document.getElementById('descuentoVenta');
    const igvVentaSpan = document.getElementById('igvVenta');
    const totalVentaSpan = document.getElementById('totalVenta');
    const pesoTotalVentaSpan = document.getElementById('pesoTotalVenta');

    // 💡 NUEVA REFERENCIA: Checkbox de IGV
    const aplicaIgvCheckbox = document.getElementById('aplicaIgv');

    // Elementos de Descuento
    const tipoDescuentoRadios = document.querySelectorAll('input[name="tipoDescuento"]');
    const descuentoGlobalContainer = document.getElementById('descuentoGlobalContainer');
    const descuentoHeader = document.querySelector('.descuento-header');

    // Modales y elementos relacionados
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

    // Variables de estado de Lotes (para mantener la lógica existente)
    const modalLotesVencimiento = new bootstrap.Modal(document.getElementById('modalLotesVencimiento'));
    const bodyLotes = document.getElementById('bodyLotes');
    const agregarLoteBtn = document.getElementById('agregarLoteBtn');
    const guardarLotesBtn = document.getElementById('guardarLotesBtn');
    const itemLoteDescripcion = document.getElementById('itemLoteDescripcion');
    const itemLoteCantidadTotal = document.getElementById('itemLoteCantidadTotal');
    const alertaLotes = document.getElementById('alertaLotes');
    const sumaLotesSpan = document.getElementById('sumaLotes');
    const totalItemLoteSpan = document.getElementById('totalItemLote');
    let currentRow = null;
    let currentItemQuantity = 0;
    let loteRowIndex = 0;


    // --- FUNCIONES DE CÁLCULO Y EVENTOS (Núcleo Corregido) ---

    /**
     * Función principal que calcula todos los totales, aplicando el IGV condicionalmente.
     */
    const updateTotals = () => {
        let subtotalBase = 0; // Suma de (Cantidad * Precio)
        let totalDescuentoAplicado = 0;
        let totalPeso = 0;
        const IGV_RATE = 0.18;

        // 💡 CRÍTICO: Comprobar si se debe aplicar el IGV
        const shouldApplyIgv = aplicaIgvCheckbox.checked;

        const rows = bodyItemsVenta.querySelectorAll('tr');
        const isPerItemDiscount = document.getElementById('descuentoPorItem').checked;

        rows.forEach(row => {
            const cantidad = parseFloat(row.querySelector('.item-cantidad')?.value) || 0;
            const precio = parseFloat(row.querySelector('.item-precio')?.value) || 0;
            const pesoUnitario = parseFloat(row.querySelector('.item-peso')?.value) || 0;

            const baseTotal = cantidad * precio;

            // 1. Cálculo de Peso Total
            totalPeso += cantidad * pesoUnitario;

            // 2. Acumular subtotal
            subtotalBase += baseTotal;

            // 3. Cálculo de Descuento por Ítem
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

            // 4. Actualizar el Total del Ítem en la tabla
            const finalItemTotal = baseTotal - itemDiscount;
            const totalItemSpan = row.querySelector('.item-total');
            if (totalItemSpan) {
                 totalItemSpan.textContent = Math.max(0, finalItemTotal).toFixed(2);
            }

            // (Si existe la función de lotes) updateLoteStatusDisplay(row, cantidad);
        });

        // 5. Aplicar Descuento Global (si aplica)
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

        // Ajustar descuento (límite: no puede exceder el subtotal base)
        totalDescuentoAplicado = Math.min(totalDescuentoAplicado, subtotalBase);

        // 6. Resumen Financiero Final
        const subtotalFinal = subtotalBase - totalDescuentoAplicado;

        // 💡 LÓGICA CONDICIONAL DE IGV
        let igv = 0;
        if (shouldApplyIgv && subtotalFinal > 0) {
            igv = subtotalFinal * IGV_RATE;
        }

        const totalFinal = subtotalFinal + igv;

        // 7. Actualizar la interfaz (DOM)
        subtotalSinIgvSpan.textContent = `S/ ${subtotalBase.toFixed(2)}`;
        descuentoVentaSpan.textContent = `S/ ${totalDescuentoAplicado.toFixed(2)}`;
        igvVentaSpan.textContent = `S/ ${igv.toFixed(2)}`;
        totalVentaSpan.textContent = `S/ ${Math.max(0, totalFinal).toFixed(2)}`;
        pesoTotalVentaSpan.textContent = `${totalPeso.toFixed(2)} Kg`;
    };

    /**
     * Configura los eventos 'input' para disparar el cálculo en los campos de una fila.
     */
    const setupRowEvents = (row) => {
        // Selecciona todos los inputs que afectan el cálculo de la línea
        const inputsToRecalculate = row.querySelectorAll('.item-cantidad, .item-precio, .item-peso');
        inputsToRecalculate.forEach(input => {
            input.addEventListener('input', updateTotals);
        });

        // Evento para eliminar la fila
        row.querySelector('.eliminar-item-btn').addEventListener('click', () => {
            row.remove();
            updateTotals();
        });

        // Evento para abrir el modal de descuento
        row.querySelector('.aplicar-descuento-btn')?.addEventListener('click', () => {
            currentRow = row;
            itemDescripcionModal.value = row.querySelector('.item-descripcion')?.value || 'Ítem sin descripción';
            valorDescuentoItem.value = row.dataset.descuentoValor;
            tipoDescuentoItem.value = row.dataset.descuentoTipo;
            modalDescuentoItem.show();
        });

        // Evento para abrir el modal de lotes
        row.querySelector('.lote-btn')?.addEventListener('click', () => {
            const cantidad = parseFloat(row.querySelector('.item-cantidad')?.value) || 0;
            if (cantidad > 0) {
                currentRow = row;
                loadLotes(row); // Asume que loadLotes está definida
            } else {
                alert("Ingrese una cantidad mayor a cero para gestionar lotes.");
            }
        });
    };

    /**
     * Crea y añade una nueva fila de producto/servicio.
     */
    const createItemRow = (product = null) => {
        const row = document.createElement('tr');
        row.dataset.descuentoValor = 0;
        row.dataset.descuentoTipo = 'monto';
        row.dataset.lotes = '[]';
        const isPerItemDiscount = document.getElementById('descuentoPorItem').checked;
        const initialPrice = product && product.precio ? product.precio.toFixed(2) : '0.00';

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
            <td><input type="number" class="form-control item-peso" value="0.00" min="0" step="0.01"></td>
            <td><input type="number" class="form-control item-precio" value="${initialPrice}" min="0" step="0.01"></td>
            <td class="discount-column"><span class="item-descuento">S/ 0.00</span> <button type="button" class="btn btn-table btn-descuento-item aplicar-descuento-btn" title="Aplicar Descuento"><i class="bi bi-tag"></i></button></td>
            <td><span class="item-total fw-bold">0.00</span></td>
            <td class="action-cell">
                <button type="button" class="btn btn-table btn-lotes-item lote-btn" title="Registro de Lotes"><i class="bi bi-boxes"></i></button>
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

    // --- MANEJO DE EVENTOS GLOBALES ---

    agregarItemVentaBtn.addEventListener('click', () => createItemRow());

    // 💡 NUEVO EVENTO: Cambios en el Checkbox de IGV disparan el recálculo
    aplicaIgvCheckbox.addEventListener('change', updateTotals);

    // Eventos de Descuento Global
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

    // Evento para guardar el descuento de un ítem
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

    // --- Lógica de Modales de Traslado y Conformidad ---
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

    // --- Lógica de Lotes (Ejemplos mantenidos) ---
    // **Asegúrate de que tus funciones de lotes originales están aquí**
    function updateLoteTotals() {
        const loteInputs = bodyLotes.querySelectorAll('.lote-cantidad');
        let sum = 0;
        loteInputs.forEach(input => {
            sum += parseFloat(input.value) || 0;
        });

        sumaLotesSpan.textContent = sum.toFixed(0);
        totalItemLoteSpan.textContent = currentItemQuantity.toFixed(0);

        if (sum !== currentItemQuantity) {
            alertaLotes.style.display = 'block';
            guardarLotesBtn.disabled = true;
        } else {
            alertaLotes.style.display = 'none';
            guardarLotesBtn.disabled = false;
        }
    }
    function createLoteRow(cantidad = 0, lote = '', vencimiento = '') {
        loteRowIndex++;
        const row = document.createElement('tr');
        row.id = `lote-row-${loteRowIndex}`;
        row.innerHTML = `
            <td><input type="text" class="form-control lote-numero" value="${lote}" placeholder="Lote"></td>
            <td><input type="number" class="form-control lote-cantidad" value="${cantidad}" min="1" step="1" required></td>
            <td><input type="date" class="form-control lote-vencimiento" value="${vencimiento}"></td>
            <td>
                <button type="button" class="btn btn-outline-danger btn-sm eliminar-lote-btn" title="Eliminar Lote">
                    <i class="bi bi-x-lg"></i>
                </button>
            </td>
        `;
        row.querySelector('.lote-cantidad').addEventListener('input', updateLoteTotals);
        row.querySelector('.eliminar-lote-btn').addEventListener('click', () => {
            row.remove();
            updateLoteTotals();
        });
        bodyLotes.appendChild(row);
    }
    function loadLotes(row) {
        bodyLotes.innerHTML = '';
        const lotesData = row.dataset.lotes ? JSON.parse(row.dataset.lotes) : [];
        currentItemQuantity = parseFloat(row.querySelector('.item-cantidad').value) || 0;
        const itemDesc = row.querySelector('.item-descripcion').value;
        if (currentItemQuantity === 0) {
            console.error("Debe ingresar una cantidad mayor a cero para gestionar lotes.");
            return;
        }

        itemLoteDescripcion.textContent = itemDesc;
        itemLoteCantidadTotal.textContent = currentItemQuantity;
        if (lotesData.length > 0) {
            lotesData.forEach(lote => createLoteRow(lote.cantidad, lote.lote, lote.vencimiento));
        } else if (currentItemQuantity > 0) {
            createLoteRow(currentItemQuantity);
        }

        updateLoteTotals();
        modalLotesVencimiento.show();
    }
    function saveLotes() {
        if (!currentRow) return;
        const newLotes = [];
        const loteRows = bodyLotes.querySelectorAll('tr');
        let sum = 0;
        loteRows.forEach(row => {
            const cantidad = parseFloat(row.querySelector('.lote-cantidad').value) || 0;
            const lote = row.querySelector('.lote-numero').value.trim();
            const vencimiento = row.querySelector('.lote-vencimiento').value;

            if (cantidad > 0) {
                newLotes.push({ cantidad, lote, vencimiento });
                sum += cantidad;
            }
        });
        if (sum !== currentItemQuantity) {
            console.error("Error de validación: La suma de las cantidades de los lotes no coincide con la cantidad total del ítem.");
            return;
        }

        currentRow.dataset.lotes = JSON.stringify(newLotes);
        updateLoteStatusDisplay(currentRow, parseFloat(currentRow.querySelector('.item-cantidad').value) || 0);
        modalLotesVencimiento.hide();
    }
    function updateLoteStatusDisplay(row, currentQuantity) {
        const loteBtn = row.querySelector('.lote-btn');
        loteBtn.disabled = currentQuantity <= 0;
    }

    agregarLoteBtn?.addEventListener('click', () => createLoteRow(0));
    guardarLotesBtn?.addEventListener('click', saveLotes);

    // --- INICIALIZACIÓN ---

    // 💡 Asegurar que al menos una fila exista al inicio para probar
    if (bodyItemsVenta.children.length === 0) {
        createItemRow();
    } else {
        bodyItemsVenta.querySelectorAll('tr').forEach(setupRowEvents);
    }

    updateTotals();
});