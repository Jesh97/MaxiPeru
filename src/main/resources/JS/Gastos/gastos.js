document.addEventListener('DOMContentLoaded', () => {

    // ── REFERENCIAS DOM ──────────────────────────────────────────────────────
    const categoriaGasto      = document.getElementById('categoriaGasto');
    const placaContainer      = document.getElementById('placaContainer');
    const agregarItemGastoBtn = document.getElementById('agregarItemGastoBtn');
    const bodyItemsGasto      = document.getElementById('bodyItemsGasto');
    const subtotalGasto       = document.getElementById('subtotalGasto');
    const igvGasto            = document.getElementById('igvGasto');
    const totalGasto          = document.getElementById('totalGasto');
    const totalPesoGasto      = document.getElementById('totalPesoGasto');
    const emptyTableMessage   = document.getElementById('emptyTableMessage');
    const guardarGastoBtn     = document.getElementById('guardarGastoBtn');
    const formGasto           = document.getElementById('formGasto');

    const IGV_RATE = 0.18;

    // ── MODAL ────────────────────────────────────────────────────────────────
    document.body.insertAdjacentHTML('beforeend', `
        <div id="gastoModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 hidden">
            <div id="gastoModalBox" class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center transform transition-all duration-300 scale-95">
                <div id="gastoModalIcon" class="text-6xl mb-4"></div>
                <h3 id="gastoModalTitle" class="text-xl font-extrabold mb-2"></h3>
                <p id="gastoModalMsg" class="text-gray-500 text-sm mb-6"></p>
                <button id="gastoModalBtn" class="text-white font-bold py-2 px-8 rounded-lg transition-colors">Aceptar</button>
            </div>
        </div>`);

    const modal      = document.getElementById('gastoModal');
    const modalBox   = document.getElementById('gastoModalBox');
    const modalIcon  = document.getElementById('gastoModalIcon');
    const modalTitle = document.getElementById('gastoModalTitle');
    const modalMsg   = document.getElementById('gastoModalMsg');
    const modalBtn   = document.getElementById('gastoModalBtn');

    function showModal(type, title, message, onAccept) {
        modalIcon.textContent  = type === 'success' ? '✅' : '❌';
        modalTitle.textContent = title;
        modalMsg.textContent   = message;
        modalBtn.className     = type === 'success'
            ? 'bg-emerald-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-emerald-700 transition-colors'
            : 'bg-red-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-red-700 transition-colors';

        modal.classList.remove('hidden');
        setTimeout(() => modalBox.classList.replace('scale-95', 'scale-100'), 10);

        modalBtn.onclick = () => {
            modal.classList.add('hidden');
            modalBox.classList.replace('scale-100', 'scale-95');
            if (typeof onAccept === 'function') onAccept();
        };
    }

    // ── PLACA ────────────────────────────────────────────────────────────────
    categoriaGasto.addEventListener('change', (e) => {
        const placaInput = placaContainer.querySelector('input');
        if (e.target.value === 'Gastos Operativos') {
            placaContainer.classList.remove('hidden');
            placaInput.setAttribute('required', 'required');
        } else {
            placaContainer.classList.add('hidden');
            placaInput.removeAttribute('required');
            placaInput.value = '';
        }
    });

    // ── VISIBILIDAD TABLA ────────────────────────────────────────────────────
    function updateTableVisibility() {
        emptyTableMessage.classList.toggle('hidden', bodyItemsGasto.children.length > 0);
    }
    updateTableVisibility();

    // ── AGREGAR ÍTEM ─────────────────────────────────────────────────────────
    agregarItemGastoBtn.addEventListener('click', () => {
        const newRow = document.createElement('tr');
        newRow.classList.add('hover:bg-gray-50');
        newRow.innerHTML = `
            <td class="px-4 py-3">
                <input type="text" placeholder="Descripción del bien o servicio"
                       class="w-full rounded-lg border input-field-premium px-3 py-2 text-sm" required>
            </td>
            <td class="px-4 py-3">
                <select class="w-full rounded-lg border input-field-premium px-3 py-2 text-sm text-center" required>
                    <option value="" disabled selected>--</option>
                    <option value="Und">Und</option>
                    <option value="Lt">Lt</option>
                    <option value="Kg">Kg</option>
                    <option value="Gl">Gl</option>
                </select>
            </td>
            <td class="px-4 py-3">
                <input type="number" class="w-full rounded-lg border input-field-premium px-3 py-2 text-sm text-center peso-item"
                       step="0.001" min="0" value="0.000">
            </td>
            <td class="px-4 py-3">
                <input type="number" class="w-full rounded-lg border input-field-premium px-3 py-2 text-sm text-center cantidad-item"
                       min="1" required>
            </td>
            <td class="px-4 py-3">
                <input type="number" class="w-full rounded-lg border input-field-premium px-3 py-2 text-sm text-center precio-item"
                       step="0.01" min="0.01" required value="0.01">
            </td>
            <td class="px-4 py-3 text-right total-item font-extrabold text-[--primary]">S/ 0.01</td>
            <td class="px-4 py-3 text-center">
                <button type="button" class="p-2 text-[--danger] rounded-full transition-colors duration-200 hover:bg-red-50 remove-item-btn" title="Eliminar ítem">
                    <i class="bi bi-trash-fill text-lg"></i>
                </button>
            </td>`;
        bodyItemsGasto.appendChild(newRow);
        calcularTotales();
        updateTableVisibility();
    });

    // ── RECALCULAR AL ESCRIBIR ───────────────────────────────────────────────
    bodyItemsGasto.addEventListener('input', (e) => {
        const t = e.target;
        if (t.classList.contains('cantidad-item') || t.classList.contains('precio-item') || t.classList.contains('peso-item')) {
            const row      = t.closest('tr');
            const cantidad = parseFloat(row.querySelector('.cantidad-item').value) || 0;
            const precio   = parseFloat(row.querySelector('.precio-item').value)   || 0;
            row.querySelector('.total-item').textContent = `S/ ${(cantidad * precio).toFixed(2)}`;
            calcularTotales();
        }
    });

    // ── ELIMINAR FILA ────────────────────────────────────────────────────────
    bodyItemsGasto.addEventListener('click', (e) => {
        if (e.target.closest('.remove-item-btn')) {
            e.target.closest('tr').remove();
            calcularTotales();
            updateTableVisibility();
        }
    });

    // ── CALCULAR TOTALES ─────────────────────────────────────────────────────
    function calcularTotales() {
        let subtotalBruto = 0, totalPeso = 0;
        bodyItemsGasto.querySelectorAll('tr').forEach(row => {
            const cant = parseFloat(row.querySelector('.cantidad-item').value) || 0;
            const prec = parseFloat(row.querySelector('.precio-item').value)   || 0;
            const peso = parseFloat(row.querySelector('.peso-item').value)     || 0;
            subtotalBruto += cant * prec;
            totalPeso     += peso * cant;
        });
        const subtotal = Math.round(subtotalBruto * 100) / 100;
        const igv      = Math.round(subtotal * IGV_RATE * 100) / 100;
        const total    = Math.round((subtotal + igv) * 100) / 100;
        totalPesoGasto.textContent = totalPeso.toFixed(3);
        subtotalGasto.textContent  = `S/ ${subtotal.toFixed(2)}`;
        igvGasto.textContent       = `S/ ${igv.toFixed(2)}`;
        totalGasto.textContent     = `S/ ${total.toFixed(2)}`;
    }

    // ── VALIDAR ──────────────────────────────────────────────────────────────
    function validarItems() {
        const filas = bodyItemsGasto.querySelectorAll('tr');
        if (filas.length === 0) {
            showModal('error', 'Sin ítems', 'Debe agregar al menos un ítem al detalle.');
            return false;
        }
        for (const row of filas) {
            const desc     = row.querySelector('td:first-child input').value.trim();
            const cantidad = parseFloat(row.querySelector('.cantidad-item').value) || 0;
            const precio   = parseFloat(row.querySelector('.precio-item').value)   || 0;
            if (!desc || cantidad <= 0 || precio <= 0) {
                showModal('error', 'Ítem incompleto', 'Complete la descripción, cantidad y precio de todos los ítems.');
                return false;
            }
        }
        return true;
    }

    function validarCamposGenerales() {
        const proveedor = document.getElementById('busquedaProveedor').value.trim();
        const fecha = document.getElementById('fechaGasto').value;
        const tipoComprobante = document.getElementById('tipoComprobante').value;
        const serie = document.getElementById('serieComprobante').value.trim();
        const correlativo = document.getElementById('correlativoComprobante').value.trim();
        const categoria = document.getElementById('categoriaGasto').value;
        const motivo = document.getElementById('motivoGasto').value;
        const placaInput = document.getElementById('placa').value.trim();

        if (!proveedor) {
            showModal('error', 'Proveedor requerido', 'Ingrese el RUC o razon social del proveedor.');
            return false;
        }
        if (!fecha) {
            showModal('error', 'Fecha requerida', 'Seleccione la fecha de emision del gasto.');
            return false;
        }
        if (!tipoComprobante) {
            showModal('error', 'Comprobante requerido', 'Seleccione el tipo de comprobante.');
            return false;
        }
        if (!serie || !/^[A-Za-z0-9-]{2,20}$/.test(serie)) {
            showModal('error', 'Serie invalida', 'La serie debe tener entre 2 y 20 caracteres alfanumericos.');
            return false;
        }
        if (!correlativo || !/^[A-Za-z0-9-]{1,20}$/.test(correlativo)) {
            showModal('error', 'Correlativo invalido', 'El correlativo debe tener entre 1 y 20 caracteres alfanumericos.');
            return false;
        }
        if (!categoria) {
            showModal('error', 'Categoria requerida', 'Seleccione el tipo de gasto.');
            return false;
        }
        if (!motivo) {
            showModal('error', 'Motivo requerido', 'Seleccione el motivo del gasto.');
            return false;
        }
        if (categoria === 'Gastos Operativos' && !placaInput) {
            showModal('error', 'Placa requerida', 'Para gastos operativos debe ingresar una placa.');
            return false;
        }
        return true;
    }

    // ── CONSTRUIR ITEMS ──────────────────────────────────────────────────────
    function obtenerItems() {
        const items = [];
        bodyItemsGasto.querySelectorAll('tr').forEach(row => {
            const cantidad = parseFloat(row.querySelector('.cantidad-item').value) || 0;
            const precio   = parseFloat(row.querySelector('.precio-item').value)   || 0;
            const subtotal = Math.round(cantidad * precio * 100) / 100;
            const igv      = Math.round(subtotal * IGV_RATE * 100) / 100;
            items.push({
                descripcion:     row.querySelector('td:first-child input').value.trim(),
                unidad:          row.querySelector('td:nth-child(2) select').value,
                cantidad:        cantidad,
                peso_unitario:   parseFloat(row.querySelector('.peso-item').value) || 0,
                precio_unitario: precio,
                subtotal:        subtotal,
                igv:             igv,
                total:           Math.round((subtotal + igv) * 100) / 100
            });
        });
        return items;
    }

    // ── LIMPIAR FORMULARIO ───────────────────────────────────────────────────
    function resetFormulario() {
        document.getElementById('formGasto').reset();
        bodyItemsGasto.innerHTML = '';
        placaContainer.classList.add('hidden');
        calcularTotales();
        updateTableVisibility();
    }

    // ── SUBMIT ───────────────────────────────────────────────────────────────
    formGasto.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validarCamposGenerales()) return;
        if (!validarItems()) return;

        const subtotalNum = parseFloat(subtotalGasto.textContent.replace('S/ ', '')) || 0;
        const igvNum      = parseFloat(igvGasto.textContent.replace('S/ ', ''))      || 0;
        const totalNum    = parseFloat(totalGasto.textContent.replace('S/ ', ''))    || 0;
        const totalPesoNum = parseFloat(totalPesoGasto.textContent) || 0;

        const payload = {
            proveedor:     document.getElementById('busquedaProveedor').value.trim(),
            categoria_gasto: document.getElementById('categoriaGasto').value,
            motivo:        document.getElementById('motivoGasto').value,
            placa:         document.getElementById('placa').value.trim(),
            tipo_comprobante: document.getElementById('tipoComprobante').selectedOptions[0].textContent.trim(),
            serie_comprobante: document.getElementById('serieComprobante').value.trim(),
            correlativo_comprobante: document.getElementById('correlativoComprobante').value.trim(),
            id_moneda:     1,   // TODO: reemplazar con ID real de moneda
            fecha:         document.getElementById('fechaGasto').value,
            subtotal:      subtotalNum,
            igv:           igvNum,
            total:         totalNum,
            total_peso:    totalPesoNum,
            observacion:   document.getElementById('observacionesGasto').value.trim(),
            items:         obtenerItems()
        };

        guardarGastoBtn.disabled = true;
        guardarGastoBtn.innerHTML = '<i class="bi bi-hourglass-split text-xl"></i><span> Guardando...</span>';

        try {
            const response = await fetch('/GastoServlet', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showModal(
                    'success',
                    '¡Gasto Registrado!',
                    `Gasto guardado correctamente (ID: ${data.idGasto}) · Total: S/ ${totalNum.toFixed(2)}`,
                    resetFormulario
                );
            } else {
                showModal('error', 'Error al Guardar', data.message || 'Ocurrió un error desconocido.');
            }

        } catch (error) {
            showModal('error', 'Error de Conexión', `No se pudo conectar con el servidor: ${error.message}`);
            console.error('Error fetch GastoServlet:', error);
        } finally {
            guardarGastoBtn.disabled = false;
            guardarGastoBtn.innerHTML = '<i class="bi bi-clipboard2-check-fill text-xl"></i><span> REGISTRAR GASTOS</span>';
        }
    });

    // ── HISTORIAL ────────────────────────────────────────────────────────────
    document.getElementById('listaGastosBtn').addEventListener('click', () => {
    window.location.href = '/HTML/Gastos/listarGastos.html';
});
});