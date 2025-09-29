document.addEventListener('DOMContentLoaded', () => {
    const categoriaGasto = document.getElementById('categoriaGasto');
    const placaContainer = document.getElementById('placaContainer');
    const agregarItemGastoBtn = document.getElementById('agregarItemGastoBtn');
    const bodyItemsGasto = document.getElementById('bodyItemsGasto');
    const subtotalGasto = document.getElementById('subtotalGasto');
    const igvGasto = document.getElementById('igvGasto');
    const totalGasto = document.getElementById('totalGasto');
    const totalPesoGasto = document.getElementById('totalPesoGasto');
    const emptyTableMessage = document.getElementById('emptyTableMessage');

    const IGV_RATE = 0.18;

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

    function updateTableVisibility() {
        if (bodyItemsGasto.children.length === 0) {
            emptyTableMessage.classList.remove('hidden');
        } else {
            emptyTableMessage.classList.add('hidden');
        }
    }
    updateTableVisibility();

    agregarItemGastoBtn.addEventListener('click', () => {
        const newRow = document.createElement('tr');
        newRow.classList.add('hover:bg-gray-50');

        newRow.innerHTML = `
            <td class="px-4 py-3"><input type="text" placeholder="Descripción del bien o servicio" class="w-full rounded-lg border input-field-premium px-3 py-2 text-sm" required value=""></td>
            <td class="px-4 py-3">
                <select class="w-full rounded-lg border input-field-premium px-3 py-2 text-sm text-center" required>
                    <option value="" disabled selected>--</option>
                    <option value="Und">Und</option>
                    <option value="Lt">Lt</option>
                    <option value="Kg">Kg</option>
                    <option value="Gl">Gl</option>
                </select>
            </td>
            <td class="px-4 py-3"><input type="number" class="w-full rounded-lg border input-field-premium px-3 py-2 text-sm text-center peso-item" step="0.001" min="0" value="0.000"></td>
            <td class="px-4 py-3"><input type="number" class="w-full rounded-lg border input-field-premium px-3 py-2 text-sm text-center cantidad-item" min="1" required value=""></td>
            <td class="px-4 py-3"><input type="number" class="w-full rounded-lg border input-field-premium px-3 py-2 text-sm text-center precio-item" step="0.01" min="0.01" required value="0.01"></td>
            <td class="px-4 py-3 text-right total-item font-extrabold text-[--primary]">S/ 0.01</td>
            <td class="px-4 py-3 text-center">
                <button type="button" class="p-2 text-[--danger] rounded-full transition-colors duration-200 hover:bg-red-50 remove-item-btn" title="Eliminar ítem">
                    <i class="bi bi-trash-fill text-lg"></i>
                </button>
            </td>
        `;
        bodyItemsGasto.appendChild(newRow);
        calcularTotales();
        updateTableVisibility();
    });

    bodyItemsGasto.addEventListener('input', (e) => {
        const target = e.target;
        if (target.classList.contains('cantidad-item') || target.classList.contains('precio-item') || target.classList.contains('peso-item')) {
            const row = target.closest('tr');
            const cantidad = parseFloat(row.querySelector('.cantidad-item').value) || 0;
            const precio = parseFloat(row.querySelector('.precio-item').value) || 0;

            const totalItem = (cantidad * precio);

            row.querySelector('.total-item').textContent = `S/ ${totalItem.toFixed(2)}`;
            calcularTotales();
        }
    });

    bodyItemsGasto.addEventListener('click', (e) => {
        if (e.target.closest('.remove-item-btn')) {
            e.target.closest('tr').remove();
            calcularTotales();
            updateTableVisibility();
        }
    });

    function calcularTotales() {
        let subtotalBruto = 0;
        let totalPeso = 0;

        document.querySelectorAll('#bodyItemsGasto tr').forEach(row => {
            const cantidad = parseFloat(row.querySelector('.cantidad-item').value) || 0;
            const precio = parseFloat(row.querySelector('.precio-item').value) || 0;
            const pesoUnitario = parseFloat(row.querySelector('.peso-item').value) || 0;

            subtotalBruto += cantidad * precio;
            totalPeso += (pesoUnitario * cantidad);
        });

        const subtotal = Math.round(subtotalBruto * 100) / 100;
        const igv = Math.round(subtotal * IGV_RATE * 100) / 100;
        const total = Math.round((subtotal + igv) * 100) / 100;
        totalPesoGasto.textContent = totalPeso.toFixed(3);
        subtotalGasto.textContent = `S/ ${subtotal.toFixed(2)}`;
        igvGasto.textContent = `S/ ${igv.toFixed(2)}`;
        totalGasto.textContent = `S/ ${total.toFixed(2)}`;
    }

    document.getElementById('formGasto').addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('--- Gasto Registrado ---');
        console.log('Subtotal:', subtotalGasto.textContent);
        console.log('IGV:', igvGasto.textContent);
        console.log('Total:', totalGasto.textContent);
        console.log('Total Peso:', totalPesoGasto.textContent);
    });

    document.getElementById('listaGastosBtn').addEventListener('click', () => {
        console.log('Navegando a la lista de gastos pendientes...');
    });
});
