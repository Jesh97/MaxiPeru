document.addEventListener('DOMContentLoaded', () => {
    const selectors = {
        bodyItemsGasto: '#bodyItemsGasto',
        agregarItemBtn: '#agregarItemGastoBtn',
        subtotalSpan: '#subtotalGasto',
        igvSpan: '#igvGasto',
        totalSpan: '#totalGasto',
        guardarBtn: '#guardarGastoBtn',
        formGasto: '#formGasto'
    };

    const elements = {
        bodyItemsGasto: document.querySelector(selectors.bodyItemsGasto),
        agregarItemBtn: document.querySelector(selectors.agregarItemBtn),
        subtotalSpan: document.querySelector(selectors.subtotalSpan),
        igvSpan: document.querySelector(selectors.igvSpan),
        totalSpan: document.querySelector(selectors.totalSpan),
        guardarBtn: document.querySelector(selectors.guardarBtn),
        formGasto: document.querySelector(selectors.formGasto)
    };

    /**
     * Utilidad de debounce para limitar la frecuencia de ejecución de una función.
     * @param {Function} func La función a ejecutar.
     * @param {number} delay El retraso en milisegundos.
     */
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    };

    /**
     * Actualiza los totales de subtotal, IGV y total.
     */
    const updateTotals = () => {
        let subtotal = 0;
        elements.bodyItemsGasto.querySelectorAll('tr').forEach(row => {
            const cantidad = parseFloat(row.querySelector('.item-cantidad').value) || 0;
            const precio = parseFloat(row.querySelector('.item-precio').value) || 0;
            const baseTotal = cantidad * precio;
            subtotal += baseTotal;
            row.querySelector('.item-total').textContent = baseTotal.toFixed(2);
        });

        const igv = subtotal * 0.18;
        const total = subtotal + igv;

        elements.subtotalSpan.textContent = `S/ ${subtotal.toFixed(2)}`;
        elements.igvSpan.textContent = `S/ ${igv.toFixed(2)}`;
        elements.totalSpan.textContent = `S/ ${total.toFixed(2)}`;
    };

    /**
     * Crea y añade una nueva fila de ítem al formulario.
     */
    const createItemRow = (descripcion = '', cantidad = 1, precio = 0) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" class="form-control form-control-sm item-descripcion" placeholder="Descripción del producto/servicio" value="${descripcion}" required></td>
            <td><input type="number" class="form-control form-control-sm item-cantidad text-center" value="${cantidad}" min="1"></td>
            <td><input type="number" class="form-control form-control-sm item-precio text-end" value="${precio.toFixed(2)}" min="0" step="0.01"></td>
            <td class="text-end"><span class="item-total">0.00</span></td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-outline-danger border-0 eliminar-item-btn" aria-label="Eliminar ítem">
                    <i class="bi bi-x-lg"></i>
                </button>
            </td>
        `;

        const inputs = row.querySelectorAll('.item-cantidad, .item-precio');
        inputs.forEach(input => input.addEventListener('input', debounce(updateTotals, 300)));

        const eliminarBtn = row.querySelector('.eliminar-item-btn');
        eliminarBtn.addEventListener('click', () => {
            row.remove();
            updateTotals();
            if (elements.bodyItemsGasto.querySelectorAll('tr').length === 0) {
                // Si no hay filas, creamos una vacía para mantener la interfaz limpia
                createItemRow();
            }
        });

        elements.bodyItemsGasto.appendChild(row);
        updateTotals();
    };

    /**
     * Maneja el envío del formulario, validando todos los campos.
     */
    const handleFormSubmit = (event) => {
        event.preventDefault();
        elements.formGasto.classList.add('was-validated');

        const itemsValidos = elements.bodyItemsGasto.querySelectorAll('tr').length > 0;
        const formValido = elements.formGasto.checkValidity() && itemsValidos;

        if (formValido) {
            const formData = new FormData(elements.formGasto);
            const gastoData = Object.fromEntries(formData.entries());
            gastoData.items = [];
            elements.bodyItemsGasto.querySelectorAll('tr').forEach(row => {
                gastoData.items.push({
                    descripcion: row.querySelector('.item-descripcion').value,
                    cantidad: parseFloat(row.querySelector('.item-cantidad').value),
                    precio: parseFloat(row.querySelector('.item-precio').value),
                });
            });

            console.log('Datos del gasto:', gastoData);
            alert('¡Gasto guardado con éxito! Revisa la consola para ver los datos.');

            elements.formGasto.reset();
            elements.bodyItemsGasto.innerHTML = '';
            elements.formGasto.classList.remove('was-validated');
            createItemRow();
        } else {
            alert('Por favor, complete todos los campos obligatorios y agregue al menos un ítem a la tabla.');
        }
    };

    // Event Listeners
    elements.agregarItemBtn.addEventListener('click', () => createItemRow());
    elements.guardarBtn.addEventListener('click', handleFormSubmit);

    // Fila inicial al cargar la página
    if (elements.bodyItemsGasto.querySelectorAll('tr').length === 0) {
        createItemRow();
    }
});