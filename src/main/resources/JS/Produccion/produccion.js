const ACCESS_PASSWORD = '1234';
const PRODUCTION_SERVLET_URL = '/ProduccionServlet';
let activeOrdenCode = '';
let activeLotCode = '';
let activeIdArtTerminado = '';
let activeNombreArtTerminado = '';
let activeIdReceta = '';
let activeNombreReceta = '';
let activeCantBaseReceta = 0;
let activeUnidadBaseReceta = '';
let insumosCargadosPreviamente = false;
function escapeJsStringForHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/"/g, '&quot;');
}
function getCurrentDateFormatted() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}
function extractNumericCapacity(capacityString) {
    if (typeof capacityString !== 'string') return { value: 1.0, unit: 'Litro' };
    const numericCapacityMatch = capacityString.match(/^(\d+(\.\d+)?)/);
    const numericValue = numericCapacityMatch ? parseFloat(numericCapacityMatch[1]) : 1.0;
    const unitMatch = capacityString.match(/[a-zA-Z]+/);
    let unitValue = unitMatch ? unitMatch[0] : 'Litro';
    if (unitValue.toLowerCase().startsWith('lit')) {
        unitValue = 'Litro';
    } else if (unitValue.toLowerCase().startsWith('kg')) {
        unitValue = 'Kg';
    } else if (unitValue.toLowerCase().startsWith('ml')) {
        unitValue = 'ml';
    } else if (unitValue.toLowerCase().startsWith('gr')) {
        unitValue = 'gr';
    } else {
        unitValue = 'Litro';
    }
    return { value: numericValue, unit: unitValue };
}
function formatTeorica(num) {
    if (typeof num !== 'number') return num;
    let formatted = num.toFixed(8).replace(/\.?0+$/, '');
    return formatted.replace('.', ',');
}
function formatQuantityDisplay(qty, unitName) {
    let formattedQty = qty.toFixed(4);
    formattedQty = formattedQty.replace(/\.?0+$/, '');
    formattedQty = formattedQty.replace('.', ',');
    let abbreviatedUnit = unitName.toUpperCase();
    if (abbreviatedUnit.includes('KILOGRAMO') || abbreviatedUnit.includes('KG')) {
        abbreviatedUnit = 'kg';
    } else if (abbreviatedUnit.includes('LITRO') || abbreviatedUnit.includes('L')) {
        abbreviatedUnit = 'L';
    } else if (abbreviatedUnit.includes('MILILITRO') || abbreviatedUnit.includes('ML')) {
        abbreviatedUnit = 'ml';
    } else if (abbreviatedUnit.includes('GRAMO') || abbreviatedUnit.includes('GR')) {
        abbreviatedUnit = 'gr';
    } else {
        abbreviatedUnit = unitName;
    }
    return `${formattedQty} ${abbreviatedUnit}`;
}
function calculateTotalConsumption(row) {
    const theoreticalCell = row.querySelector('.teorica-quantity');
    const realInput = row.querySelector('.real-consumption');
    const operacionSelect = row.querySelector('.operacion-ajuste');
    const totalDisplay = row.querySelector('.total-consumption');
    const teorica = parseFloat(theoreticalCell.getAttribute('data-teorica')) || 0;
    const ajuste = parseFloat(realInput.value) || 0;
    const operacion = operacionSelect ? operacionSelect.value : '+';
    const unit = theoreticalCell.getAttribute('data-unit');
    let totalQty;
    if (operacion === '+') {
        totalQty = teorica + ajuste;
    } else if (operacion === '-') {
        totalQty = teorica - ajuste;
    } else {
        totalQty = teorica;
    }
    if (totalQty < 0) {
        totalQty = 0;
    }
    const finalTotalDisplay = formatQuantityDisplay(totalQty, unit);
    totalDisplay.textContent = finalTotalDisplay;
}
function adjustQuantity(inputId, delta, isConsumption) {
    const input = document.getElementById(inputId);
    let currentValue = parseFloat(input.value) || 0;
    let step = parseFloat(input.step) || 1;
    let newValue = currentValue + (delta * step);
    if (newValue < 0) {
        newValue = 0;
    }
    input.value = newValue.toFixed(4).replace(/\.?0+$/, '');
    if (isConsumption) {
        calculateTotalConsumption(input.closest('tr'));
    } else if (input.name === 'p_cant_a_empacar_final[]') {
        updateTotalUnitsReference();
    }
}
$(document).ready(function() {
    const fechaIniInput = document.getElementById('fecha_ini');
    if (fechaIniInput && !fechaIniInput.value) {
        fechaIniInput.value = getCurrentDateFormatted();
    }
    $("#buscar_art_ter").autocomplete({
        source: function(request, response) {
            $.ajax({
                url: PRODUCTION_SERVLET_URL,
                type: "GET",
                dataType: "json",
                data: {
                    action: "buscar_articulos_terminados",
                    busqueda: request.term
                },
                success: function(data) {
                    response(data.map(item => ({
                        id: item.id,
                        value: item.nombre_generico || item.descripcion,
                        label: (item.codigo || '') + ' - ' + (item.nombre_generico),
                        id_unidad: item.id_unidad,
                        unidad_nombre: item.unidad_nombre
                    })));
                }
            });
        },
        minLength: 2,
        select: function(event, ui) {
            $("#buscar_art_ter").val(ui.item.label);
            $('input[name="p_id_art_ter_hidden"]').val(ui.item.id);
            $('input[name="p_id_unidad_producir"]').val('1');
            return false;
        }
    });
    $("#buscar_insumo").autocomplete({
        source: function(request, response) {
            $.ajax({
                url: PRODUCTION_SERVLET_URL,
                type: "GET",
                dataType: "json",
                data: {
                    action: "buscar_articulos_insumos",
                    busqueda: request.term
                },
                success: function(data) {
                    response(data.map(item => ({
                        id: item.id,
                        value: item.descripcion,
                        label: (item.codigo || '') + ' - ' + (item.descripcion || ''),
                        codigo: item.codigo,
                        id_unidad: item.id_unidad,
                        unidad_nombre: item.unidad_nombre,
                        densidad: item.densidad || '1.00000000'
                    })));
                }
            });
        },
        minLength: 2,
        select: function(event, ui) {
            const selectedItem = ui.item;
            document.getElementById('buscar_insumo').value = selectedItem.value;
            addRow(
                'insumo-rows',
                selectedItem.codigo,
                selectedItem.value,
                '1.000',
                selectedItem.unidad_nombre,
                selectedItem.densidad,
                selectedItem.id,
                selectedItem.id_unidad
            );
            document.getElementById('buscar_insumo').value = '';
            return false;
        }
    });
    $("#buscar_receta_orden").autocomplete({
        source: function(request, response) {
            $.ajax({
                url: PRODUCTION_SERVLET_URL,
                type: "GET",
                dataType: "json",
                data: {
                    action: "obtener_receta_por_nombre_generico",
                    nombre_generico: request.term
                },
                success: function(data) {
                    response(data.map(item => ({
                        id_receta: item.id_receta,
                        id_art_ter: item.id_producto_maestro,
                        nombre_art_ter: item.nombre_generico,
                        receta_cantidad_base: item.receta_cantidad_base,
                        value: item.nombre_generico,
                        label: 'Receta ' + item.id_receta + ' - ' + item.nombre_generico,
                        unidad_nombre: item.unidad_nombre
                    })));
                }
            });
        },
        minLength: 2,
        select: function(event, ui) {
            document.getElementById('p_id_receta_orden_hidden').value = ui.item.id_receta;
            document.getElementById('p_id_art_producido_orden_hidden').value = ui.item.id_art_ter;
            document.getElementById('p_receta_cantidad_base_hidden').value = ui.item.receta_cantidad_base;
            document.getElementById('buscar_receta_orden').value = ui.item.value;
            insumosCargadosPreviamente = false;
            document.getElementById('display_order_recipe_status').textContent = 'Fórmula seleccionada. Use el botón "Cargar Insumos" para preparar el consumo.';
            document.getElementById('insumos-orden-rows').innerHTML = '';
            activeIdReceta = ui.item.id_receta;
            activeNombreReceta = ui.item.value;
            activeCantBaseReceta = parseFloat(ui.item.receta_cantidad_base) || 0;
            activeUnidadBaseReceta = ui.item.unidad_nombre;
            return false;
        }
    });
    $("#buscar_envase_principal_multiple").autocomplete({
        source: getPackagingAutocompleteSource(1),
        minLength: 2,
        select: function(event, ui) {
            addRowEnvaseTapa(
                ui.item.id,
                ui.item.label,
                `${ui.item.capacidad} ${ui.item.unidad_capacidad}`
            );
            document.getElementById('buscar_envase_principal_multiple').value = '';
            return false;
        }
    });
    $("#buscar_tapa_principal").autocomplete({
        source: getPackagingAutocompleteSource(2),
        minLength: 2,
        select: function(event, ui) {
            document.getElementById('buscar_tapa_principal').value = ui.item.label;
            document.getElementById('p_id_tapa_seleccionada_hidden').value = ui.item.id;
            document.getElementById('selected_tapa_display').textContent = `Tapa Seleccionada: ${ui.item.label}`;
            return false;
        }
    });
    $("#buscar_etiqueta_principal").autocomplete({
        source: getPackagingAutocompleteSource(2),
        minLength: 2,
        select: function(event, ui) {
            document.getElementById('buscar_etiqueta_principal').value = ui.item.label;
            document.getElementById('p_id_etiqueta_principal_hidden').value = ui.item.id;
            return false;
        }
    });
    $("#buscar_empaque_secundario").autocomplete({
        source: getPackagingAutocompleteSource(3),
        minLength: 2,
        select: function(event, ui) {
            document.getElementById('buscar_empaque_secundario').value = ui.item.label;
            document.getElementById('p_id_componente_caja').value = ui.item.id;
            return false;
        }
    });
    openTab(null, 'Receta');
    if (typeof window.activeOrdenCodeFromServlet !== 'undefined') {
        activeOrdenCode = window.activeOrdenCodeFromServlet;
        updateOrdenFields();
    }
    document.getElementById('edit-detalle-form').addEventListener('submit', submitEditDetalleReceta);
});
function getPackagingAutocompleteSource(tipoComponente) {
    return function(request, response) {
        $.ajax({
            url: PRODUCTION_SERVLET_URL,
            type: "GET",
            dataType: "json",
            data: {
                action: "buscar_articulos_embalado_y_embalaje",
                busqueda: request.term,
                p_tipo_componente: tipoComponente
            },
            success: function(data) {
                response(data.map(item => ({
                    id: item.id,
                    value: item.descripcion,
                    label: (item.codigo || '') + ' - ' + (item.descripcion || ''),
                    capacidad: item.capacidad || 'N/A',
                    unidad_capacidad: item.unidad_capacidad || '',
                })));
            }
        });
    };
}
function showPasswordModal(tabName, colorSuffix) {
    document.getElementById('password-modal-overlay').style.display = 'flex';
    document.getElementById('protected-tab-name').value = tabName;
    document.getElementById('protected-tab-color').value = colorSuffix;
    document.getElementById('password-input').value = '';
    document.getElementById('password-error').textContent = '';
}
function closePasswordModal() {
    document.getElementById('password-modal-overlay').style.display = 'none';
}
function checkPasswordAndOpenTab() {
    const passwordInput = document.getElementById('password-input');
    const errorDisplay = document.getElementById('password-error');
    const tabName = document.getElementById('protected-tab-name').value;
    if (passwordInput.value === ACCESS_PASSWORD) {
        closePasswordModal();
        openTab(null, tabName);
        if (tabName === 'ListarOrdenes') {
            loadOrdenesList();
        }
    } else {
        errorDisplay.textContent = 'Contraseña incorrecta. Intente de nuevo.';
    }
}
function openProtectedTab(evt, tabName, colorSuffix) {
    showPasswordModal(tabName, colorSuffix);
}
function openTab(evt, tabName) {
    const tabContent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
        tabContent[i].classList.remove('active');
    }
    const tabButtons = document.getElementsByClassName("tab-button");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    document.getElementById(tabName).style.display = "block";
    document.getElementById(tabName).classList.add('active');
    if (evt) {
        evt.currentTarget.classList.add('active');
    }
    updateOrdenFields();
}
function deleteRow(btn) {
    btn.parentNode.parentNode.remove();
}
function addRowFromSearch() {
    alert("La adición de insumos se realiza automáticamente al seleccionar un elemento de la lista desplegable de búsqueda.");
}
function addRow(tableId, code, name, qty, unitName, density, insumoId, unitId) {
    const tableBody = document.getElementById(tableId);
    const newRow = tableBody.insertRow();
    const inputId = `qty-receta-${Date.now()}`;
    newRow.innerHTML = `
        <td><input type="text" name="p_codigo_insumo[]" value="${code}" readonly class="readonly-field" placeholder="CÓDIGO"></td>
        <td><input type="text" name="p_nombre_art_insumo[]" value="${name}" required placeholder="Nombre Insumo"></td>
        <td class="quantity-control-receta">
            <button type="button" class="btn-qty-minus" onclick="adjustQuantity('${inputId}', -1)">-</button>
            <input type="number" id="${inputId}" name="p_cant_req[]" value="${qty}" step="0.0001" required placeholder="Cantidad">
            <button type="button" class="btn-qty-plus" onclick="adjustQuantity('${inputId}', 1)">+</button>
        </td>
        <td><input type="text" name="p_nombre_uni_insumo[]" value="${unitName}" readonly class="readonly-field" placeholder="Unidad"></td>
        <td><input type="number" name="p_densidad[]" value="${density}" step="0.00000001" required placeholder="0.00" class="readonly-field" readonly></td>
        <td><button type="button" class="remove-row" onclick="deleteRow(this)"><i class="fas fa-trash"></i></button></td>
        <input
        type="hidden" name="p_id_art_insumo_hidden[]" value="${insumoId}">
        <input type="hidden" name="p_id_uni_insumo_hidden[]" value="${unitId}">
    `;
}
function addRowEnvaseTapa(containerId, containerLabel, containerCapacity) {
    const tableBody = document.getElementById('envase-tapa-rows');
    const newRow = tableBody.insertRow();
    const rowId = `row-envase-${Date.now()}`;
    const capacityDetails = extractNumericCapacity(containerCapacity);
    newRow.id = rowId;
    newRow.innerHTML = `
        <td>
            <input type="text" name="envase_label[]" value="${containerLabel}" readonly class="readonly-field" style="width: 100%;">
            <input type="hidden" name="p_id_componente_container[]" value="${containerId}">
        </td>
        <td style="display: flex; align-items: center;">
            <input type="number" name="p_capacidad_numeric[]" value="${capacityDetails.value}" step="0.0001" required style="width: 60%; text-align: right; display: inline-block;">
            <select name="p_capacidad_unidad[]" required style="width: 35%; margin-left: 5px; display: inline-block;">
                <option value="Litro" ${capacityDetails.unit === 'Litro' ? 'selected' : ''}>Litro</option>
                <option value="ml" ${capacityDetails.unit === 'ml' ? 'selected' : ''}>ml</option>
                <option value="Kg" ${capacityDetails.unit === 'Kg' ? 'selected' : ''}>Kg</option>
                <option value="gr" ${capacityDetails.unit === 'gr' ? 'selected' : ''}>gr</option>
            </select>
        </td>
        <td class="quantity-control-compact">
            <button type="button" class="btn-qty-minus" onclick="adjustQuantity('${rowId}-qty', -1); updateTotalUnitsReference()">-</button>
            <input type="number" id="${rowId}-qty" name="p_cant_a_empacar_final[]" value="1" min="1" step="1" required oninput="updateTotalUnitsReference()">
            <button type="button" class="btn-qty-plus" onclick="adjustQuantity('${rowId}-qty', 1); updateTotalUnitsReference()">+</button>
        </td>
        <td data-tapa-status="unassigned">
            <span id="tapa_assigned_display_${rowId}" class="readonly-field" style="display: block; width: 100%; height: 100%; background-color: var(--accent-danger); color: white; padding: 5px; text-align: center;">ASIGNAR TAPA</span>
            <input type="hidden" name="p_id_componente_cap[]" id="tapa_id_hidden_${rowId}" required value="">
            <input type="hidden" name="tapa_nombre_hidden[]" id="tapa_nombre_hidden_${rowId}" required value="">
        </td>
        <td>
            <button type="button" class="btn-submit btn-compact btn-primary" onclick="assignTapaToRow('${rowId}')"><i class="fas fa-hand-pointer"></i> Asignar Tapa</button>
            <button type="button" class="remove-row" onclick="deleteRow(this); updateTotalUnitsReference()"><i class="fas fa-trash"></i></button>
        </td>
    `;
    updateTotalUnitsReference();
}
function assignTapaToRow(rowId) {
    const tapaId = document.getElementById('p_id_tapa_seleccionada_hidden').value;
    const tapaLabel = document.getElementById('selected_tapa_display').textContent;
    if (!tapaId) {
        alert("ERROR: Primero debe buscar y seleccionar una Tapa/Sello en el Paso 4.1.");
        return;
    }
    const tapaDisplayElement = document.getElementById(`tapa_assigned_display_${rowId}`);
    const tapaIdHidden = document.getElementById(`tapa_id_hidden_${rowId}`);
    const tapaNombreHidden = document.getElementById(`tapa_nombre_hidden_${rowId}`);
    const tapaName = tapaLabel.replace('Tapa Seleccionada: ', '');
    tapaDisplayElement.textContent = tapaName;
    tapaDisplayElement.style.backgroundColor = 'var(--accent-success)';
    tapaDisplayElement.style.color = 'white';
    tapaDisplayElement.parentNode.setAttribute('data-tapa-status', 'assigned');
    tapaIdHidden.value = tapaId;
    tapaNombreHidden.value = tapaName;
    alert(`Tapa ${tapaName} asignada al envase.`);
}
function handleJsonResponse(response) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    if (contentType && contentType.includes("text/html")) {
        return response.text().then(html => {
            if (html.includes('<script>alert')) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                document.body.appendChild(tempDiv);
                throw new Error("El servidor devolvió un script de alerta.");
            }
            return { success: false, message: "Respuesta inesperada del servidor (no JSON)." };
        });
    }
    throw new Error("Respuesta del servidor en formato desconocido.");
}
function saveFullRecipe(event) {
    event.preventDefault();
    const form = event.target;
    const artTerId = $('input[name="p_id_art_ter_hidden"]').val();
    const rows = document.getElementById('insumo-rows').querySelectorAll('tr');
    if (!artTerId) {
        alert("ERROR: Debe seleccionar un Producto Terminado.");
        return;
    }
    if (rows.length === 0) {
        alert("Agregue al menos un insumo componente antes de guardar la Fórmula Completa.");
        return;
    }
    const idUnidadProducir = document.getElementById('p_id_unidad_producir').value;
    const cantProd = document.getElementById('cant_prod') ? document.getElementById('cant_prod').value : '1.00';
    const nombreUniProd = 'Litro';
    if (!idUnidadProducir || idUnidadProducir !== '1') {
        alert("ERROR CRÍTICO: La Unidad de Producción debe ser Litro (ID 1). Revise el campo oculto p_id_unidad_producir.");
        return;
    }
    const formData = new FormData(form);
    const params = new URLSearchParams(formData);
    params.set('action', 'crear_receta_y_componentes');
    params.set('p_id_prod_maestro_hidden', artTerId);
    params.set('p_cant_prod', cantProd);
    params.set('p_nombre_uni_prod', nombreUniProd);
    params.set('p_id_unidad_producir', idUnidadProducir);
    fetch(PRODUCTION_SERVLET_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    })
    .then(handleJsonResponse)
    .then(data => {
        if (data.success) {
            alert("Fórmula Base y Componentes Guardados. El ID de Receta\nes: " + data.id_receta);
            document.getElementById('buscar_art_ter').value = '';
            $('input[name="p_id_art_ter_hidden"]').val('');
            $('input[name="p_id_unidad_producir"]').val('1');
            document.getElementById('insumo-rows').innerHTML = '';
        } else {
            alert("Error al guardar la fórmula: " + (data.message || "Detalle desconocido."));
        }
    })
    .catch(error => {
        if (!error.message.includes("script de alerta")) {
            alert("Error de comunicación con el servidor al guardar la fórmula. Verifique la conexión o el backend.");
        }
    });
}
function loadInsumosForRecipe() {
    const idReceta = document.getElementById('p_id_receta_orden_hidden').value;
    const cantProdStr = document.getElementById('cant_prod_orden').value;
    const cantBaseRecetaStr = document.getElementById('p_receta_cantidad_base_hidden').value;
    if (!idReceta) {
        alert("ERROR: Debe seleccionar una Receta válida antes de cargar los insumos.");
        return;
    }
    if (!cantProdStr || parseFloat(cantProdStr) <= 0) {
        alert("ERROR: La Cantidad a Producir (Programada) debe ser positiva para calcular los insumos.");
        return;
    }
    if (!cantBaseRecetaStr || parseFloat(cantBaseRecetaStr) <= 0) {
        alert("ERROR: La Cantidad Base de la Receta (Fórmula) es requerida. Vuelva a seleccionar la Receta.");
        return;
    }
    const cantProdOrder = parseFloat(cantProdStr);
    const cantBaseReceta = parseFloat(cantBaseRecetaStr);
    const scaleFactor = cantProdOrder / cantBaseReceta;
    const tableBody = document.getElementById('insumos-orden-rows');
    const statusDisplay = document.getElementById('display_order_recipe_status');
    tableBody.innerHTML = '';
    statusDisplay.textContent = `Fórmula Activa: ${activeNombreReceta}. Cargando insumos...`;
    insumosCargadosPreviamente = true;
    fetch(`${PRODUCTION_SERVLET_URL}?action=obtener_insumos_orden_activa&id_receta=${idReceta}`)
    .then(response => response.json())
    .then(data => {
        if (data.length > 0) {
            data.forEach(insumo => {
                const baseReq = parseFloat(insumo.cantidad_requerida);
                const totalReq = baseReq * scaleFactor;
                const formattedTeorica = formatTeorica(totalReq);
                const inputId = `real-cons-${insumo.id_articulo}-${Date.now()}`;
                const initialTotalConsumedDisplay = formatQuantityDisplay(totalReq, insumo.unidad_nombre);
                const newRow = tableBody.insertRow();
                newRow.innerHTML = `
                    <form action="" method="POST" onsubmit="handleInsumoConsumption(event)">
                        <input type="hidden" name="action" value="registrar_consumo_componente">
                        <input type="hidden" name="p_id_orden_temp" value="${activeOrdenCode}">
                        <input type="hidden" name="p_id_articulo_consumido" value="${insumo.id_articulo}">
                        <input type="hidden" name="p_id_unidad" value="${insumo.id_unidad}">
                        <input type="hidden" name="p_es_envase" value="false">
                        <input type="hidden" name="p_cantidad_teorica" value="${totalReq}">
                        <td>${insumo.codigo}</td>
                        <td class="teorica-quantity" data-teorica="${totalReq}" data-unit="${insumo.unidad_nombre}">
                            ${formattedTeorica}
                        </td>
                        <td class="quantity-control-consumo" style="display: flex; align-items: center; gap: 5px;">
                            <select id="op-${inputId}" class="operacion-ajuste" name="p_operacion_ajuste" onchange="calculateTotalConsumption(this.closest('tr'))" style="width: 40px; padding: 4px; text-align: center; border-radius: 4px;">
                                <option value="+">+</option>
                                <option value="-">-</option>
                            </select>
                            <input type="number" id="${inputId}" name="p_cantidad_adicional" class="real-consumption cant-ajuste-real" value="0.0000" step="0.0001" oninput="calculateTotalConsumption(this.closest('tr'))" required style="min-width: 60px;">
                        </td>
                        <td class="total-consumption">
                            ${initialTotalConsumedDisplay}
                        </td>
                        <td>
                            <button type="submit" class="btn-submit btn-compact btn-warning" disabled><i class="fas fa-edit"></i> Registrar</button>
                        </td>
                    </form>
                `;
                calculateTotalConsumption(newRow);
            });
            statusDisplay.textContent = `Fórmula lista: ${activeNombreReceta}. Revise y ajuste el consumo REAL. Luego presione 'Crear Orden'.`;
        } else {
            insumosCargadosPreviamente = false;
            statusDisplay.textContent = `Fórmula Activa: ${activeNombreReceta}. No se encontraron insumos para esta receta.`;
        }
    })
    .catch(error => {
        insumosCargadosPreviamente = false;
        statusDisplay.textContent = `Error al cargar insumos: ${error.message}.`;
    });
}
function saveOrden(event) {
    event.preventDefault();
    const idReceta = document.getElementById('p_id_receta_orden_hidden').value;
    const cantProdStr = document.getElementById('cant_prod_orden').value;
    const idArtProducido = document.getElementById('p_id_art_producido_orden_hidden').value;
    const fechaIni = document.getElementById('fecha_ini').value;
    if (!idReceta || !insumosCargadosPreviamente) {
        alert("ERROR: Debe seleccionar una Receta y Cargar los Insumos primero.");
        return;
    }
    if (!cantProdStr || parseFloat(cantProdStr) <= 0) {
        alert("ERROR: La Cantidad a Producir (Programada) debe ser positiva.");
        return;
    }
    const formData = new FormData(event.target);
    const params = new URLSearchParams(formData);
    params.set('action', 'crear_orden');
    fetch(PRODUCTION_SERVLET_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    })
    .then(handleJsonResponse)
    .then(data => {
        if (data.success && data.id_orden) {
            activeOrdenCode = data.id_orden;
            activeIdArtTerminado = data.id_articulo_terminado;
            activeNombreArtTerminado = data.nombre_articulo_terminado;
            activeLotCode = '';
            document.getElementById('cod_lote_generado_envasado_display').value = "Presione 'Generar'";
            document.getElementById('p_codigo_lote_envase_hidden').value = '';
            updateOrdenFields();
            alert(`Orden Creada: ${activeOrdenCode}. Ahora se registrará el consumo de insumos.`);
            const rows = document.getElementById('insumos-orden-rows').querySelectorAll('tr');
            rows.forEach(row => {
                const form = row.querySelector('form');
                if (form) {
                    form.querySelector('input[name="p_id_orden_temp"]').value = activeOrdenCode;
                    handleInsumoConsumption(new Event('submit', { bubbles: true, cancelable: true }), row);
                }
            });
            document.getElementById('display_order_recipe_status').textContent = `Orden Activa Creada: ${activeOrdenCode}. Consumo de insumos en proceso de registro.`;
        } else {
            alert(`Error al crear la orden: ${data.message}`);
        }
    })
    .catch(error => {
        if (!error.message.includes("script de alerta")) {
            alert("Error de comunicación con el servidor al crear la orden.");
        }
    });
}
function handleInsumoConsumption(event, rowOverride = null) {
    event.preventDefault();
    const formRow = rowOverride || event.target.closest('tr');
    const totalConsumptionDisplay = formRow.querySelector('.total-consumption').textContent;
    const totalConsumed = parseFloat(totalConsumptionDisplay.split(' ')[0].replace(',', '.')) || 0;
    const idOrden = formRow.querySelector('input[name="p_id_orden_temp"]').value;
    if (!idOrden || idOrden.length === 0) {
        alert("ADVERTENCIA: Primero debe CREAR la Orden de Producción.");
        return;
    }
    const idArticuloConsumido = formRow.querySelector('input[name="p_id_articulo_consumido"]').value;
    const idUnidad = formRow.querySelector('input[name="p_id_unidad"]').value;
    const submitButton = formRow.querySelector('button[type="submit"]');
    if (submitButton.disabled && !rowOverride) {
        alert("Este insumo ya fue registrado.");
        return;
    }
    const originalContent = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    submitButton.disabled = true;
    const params = new URLSearchParams({
        action: 'registrar_consumo_componente',
        p_id_orden: idOrden,
        p_id_articulo_consumido: idArticuloConsumido,
        p_cantidad_consumida: totalConsumed,
        p_id_unidad: idUnidad,
        p_es_envase: false
    });
    fetch(PRODUCTION_SERVLET_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    })
    .then(handleJsonResponse)
    .then(data => {
        submitButton.innerHTML = '<i class="fas fa-check"></i> Registrado';
        submitButton.classList.remove('btn-warning');
        submitButton.classList.add('btn-success');
        if (!data.success) {
            alert("Error al registrar consumo: " + data.message);
        }
    })
    .catch(error => {
        submitButton.innerHTML = originalContent;
        submitButton.classList.add('btn-warning');
        submitButton.classList.remove('btn-success');
        submitButton.disabled = false;
        if (!error.message.includes("script de alerta")) {
            alert("Error de comunicación con el servidor al registrar el consumo.");
        }
    });
}
function closeRecipeDetailModal() {
    document.getElementById('view-recipe-modal').style.display = 'none';
}
function loadInsumoDetalleForEdit(idDetalle, idReceta, nombreReceta, cantBase, unidadBase) {
    document.getElementById('edit-detalle-modal-info').textContent = `Receta: ${nombreReceta} (Base: ${cantBase.toFixed(2)} ${unidadBase})`;
    document.getElementById('edit_p_id_receta').value = idReceta;
    document.getElementById('edit_nombre_receta').value = nombreReceta;
    document.getElementById('edit_cant_base_receta').value = cantBase;
    document.getElementById('edit_unidad_base_receta').value = unidadBase;
    document.getElementById('edit-detalle-form').reset();
    document.getElementById('edit_p_id_detalle_receta').value = idDetalle;
    document.getElementById('edit-detalle-modal-status').textContent = 'Cargando detalle...';
    fetch(`${PRODUCTION_SERVLET_URL}?action=obtener_detalle_insumo_receta&p_id_detalle_receta=${idDetalle}`)
    .then(response => response.json())
    .then(data => {
        if (data && data.length > 0) {
            const insumo = data[0];
            document.getElementById('edit_p_id_articulo').value = insumo.id_articulo;
            document.getElementById('edit_p_nombre_articulo').value = `${insumo.codigo} - ${insumo.nombre_articulo}`;
            document.getElementById('edit_p_cantidad_requerida').value = parseFloat(insumo.cantidad_requerida).toFixed(4);
            document.getElementById('edit_p_nombre_unidad').value = insumo.unidad_nombre;
            document.getElementById('edit_p_densidad').value = insumo.densidad || '1.00000000';
            document.getElementById('edit_p_id_unidad').value = insumo.id_unidad;
            document.getElementById('edit-detalle-modal-status').textContent = 'Detalle cargado.';
        } else {
            document.getElementById('edit-detalle-modal-status').textContent = 'Error: No se encontró el detalle.';
        }
    })
    .catch(error => {
        document.getElementById('edit-detalle-modal-status').textContent = `Error al cargar detalle: ${error.message}`;
    });
    document.getElementById('edit-detalle-modal').style.display = 'flex';
}
function closeEditModal() {
    document.getElementById('edit-detalle-modal').style.display = 'none';
}
function submitEditDetalleReceta(event) {
    event.preventDefault();
    const idReceta = document.getElementById('edit_p_id_receta').value;
    const nombreReceta = document.getElementById('edit_nombre_receta').value;
    const cantBase = parseFloat(document.getElementById('edit_cant_base_receta').value);
    const unidadBase = document.getElementById('edit_unidad_base_receta').value;
    const idDetalle = document.getElementById('edit_p_id_detalle_receta').value;
    const cantReq = document.getElementById('edit_p_cantidad_requerida').value;
    const idUnidad = document.getElementById('edit_p_id_unidad').value;
    if (!idDetalle || !cantReq || !idUnidad) {
        alert("Error: Faltan datos para la actualización.");
        return;
    }
    const params = new URLSearchParams({
        action: 'actualizar_detalle_receta',
        p_id_detalle_receta: idDetalle,
        p_cant_req: cantReq,
        p_id_uni_insumo: idUnidad
    });
    fetch(PRODUCTION_SERVLET_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    })
    .then(handleJsonResponse)
    .then(data => {
        if (data.success) {
            alert("Detalle actualizado correctamente.");
            closeEditModal();
            loadRecetaDetalle(idReceta, nombreReceta, cantBase, unidadBase);
        } else {
            alert("Error al actualizar detalle: " + (data.message || "Detalle desconocido."));
        }
    })
    .catch(error => {
        alert("Error de comunicación al actualizar detalle: " + error.message);
    });
}
function confirmRemoveDetalleReceta(idDetalle, idReceta, nombreReceta, cantBase, unidadBase) {
    if (confirm("¿Está seguro de QUITAR este insumo de la receta?")) {
        removeDetalleReceta(idDetalle, idReceta, nombreReceta, cantBase, unidadBase);
    }
}
function removeDetalleReceta(idDetalle, idReceta, nombreReceta, cantBase, unidadBase) {
    const params = new URLSearchParams({
        action: 'eliminar_detalle_receta',
        p_id_detalle_receta: idDetalle
    });
    fetch(PRODUCTION_SERVLET_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    })
    .then(handleJsonResponse)
    .then(data => {
        if (data.success) {
            alert("Insumo quitado de la receta.");
            loadRecetaDetalle(idReceta, nombreReceta, cantBase, unidadBase);
        } else {
            alert("Error al quitar insumo: " + (data.message || "Detalle desconocido."));
        }
    })
    .catch(error => {
        alert("Error de comunicación al quitar insumo: " + error.message);
    });
}
function confirmDeactivateReceta(idReceta, nombreReceta) {
    if (confirm(`ADVERTENCIA: ¿Está seguro de DESACTIVAR la Receta "${nombreReceta}" (ID: ${idReceta})? Esto impedirá su uso en nuevas órdenes.`)) {
        deactivateReceta(idReceta);
    }
}
function deactivateReceta(idReceta) {
    const params = new URLSearchParams({
        action: 'desactivar_receta',
        p_id_receta: idReceta
    });
    fetch(PRODUCTION_SERVLET_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    })
    .then(handleJsonResponse)
    .then(data => {
        if (data.success) {
            alert(`Receta ${idReceta} desactivada correctamente.`);
            loadRecetasList();
        } else {
            alert("Error al desactivar la receta: " + (data.message || "Detalle desconocido."));
        }
    })
    .catch(error => {
        alert("Error de comunicación al desactivar receta: " + error.message);
    });
}
function loadRecetasList() {
    const tableBody = document.getElementById('recetas-list-rows');
    tableBody.innerHTML = '<tr><td colspan="5"><i class="fas fa-spinner fa-spin"></i> Cargando recetas...</td></tr>';
    fetch(`${PRODUCTION_SERVLET_URL}?action=listar_recetas`)
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => { throw new Error(error.error || `Error HTTP ${response.status}`); });
        }
        return response.json();
    })
    .then(recetas => {
        tableBody.innerHTML = '';
        const uniqueRecetas = new Map();
        recetas.forEach(receta => {
            if (receta.id_receta && !uniqueRecetas.has(receta.id_receta)) {
                uniqueRecetas.set(receta.id_receta, receta);
            }
        });
        const finalRecetas = Array.from(uniqueRecetas.values());
        if (finalRecetas.length > 0) {
            finalRecetas.forEach(receta => {
                const nombreGenerico = receta.nombre_generico || 'Nombre Desconocido';
                const cantidadBase = parseFloat(receta.receta_cantidad_base) || 0.00;
                const unidadNombre = receta.unidad_producir_nombre || 'Unidad';
                const fechaCreacion = receta.fecha_creacion || 'Fecha Desconocida';
                const nombreGenericoEscaped = escapeJsStringForHtml(nombreGenerico);
                const unidadNombreEscaped = escapeJsStringForHtml(unidadNombre);
                const newRow = tableBody.insertRow();
                newRow.innerHTML = `
                    <td>${nombreGenerico}</td>
                    <td>${cantidadBase.toFixed(2)}</td>
                    <td>${unidadNombre}</td>
                    <td>${fechaCreacion}</td>
                    <td>
                        <button type="button" class="btn-submit btn-compact btn-info" onclick="loadRecetaDetalle(${receta.id_receta}, '${nombreGenericoEscaped}', ${cantidadBase}, '${unidadNombreEscaped}')"><i class="fas fa-eye"></i> Ver Detalle</button>
                        <button type="button" class="btn-submit btn-compact btn-danger" onclick="confirmDeactivateReceta(${receta.id_receta}, '${nombreGenericoEscaped}')"><i class="fas fa-times"></i> Desactivar</button>
                    </td>
                `;
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No hay recetas activas registradas.</td></tr>`;
        }
    })
    .catch(error => {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar recetas: ${error.message}. Verifique la URL del Servlet.</td></tr>`;
    });
}
function loadRecetaDetalle(idReceta, nombreReceta, cantBase, unidadBase) {
    document.getElementById('view-recipe-modal-title').textContent = `Detalle de Receta: ${nombreReceta} (Base: ${cantBase.toFixed(2)} ${unidadBase})`;
    document.getElementById('recipe-detail-status').textContent = 'Cargando insumos...';
    document.getElementById('recipe-detail-rows').innerHTML = '';
    document.getElementById('view-recipe-modal').style.display = 'flex';
    fetch(`${PRODUCTION_SERVLET_URL}?action=obtener_insumos_receta&id_receta=${idReceta}`)
    .then(response => response.json())
    .then(data => {
        const tableBody = document.getElementById('recipe-detail-rows');
        tableBody.innerHTML = '';
        if (data.length > 0) {
            data.forEach(insumo => {
                const newRow = tableBody.insertRow();
                const cantidadReq = parseFloat(insumo.cantidad_requerida);
                newRow.innerHTML = `
                    <td>${insumo.codigo}</td>
                    <td>${insumo.nombre_articulo}</td>
                    <td>${cantidadReq.toFixed(4).replace(/\.?0+$/, '')} ${insumo.unidad_nombre}</td>
                    <td>
                        <button type="button" class="btn-submit btn-compact btn-warning" onclick="loadInsumoDetalleForEdit(${insumo.id_detalle_receta}, ${idReceta}, '${escapeJsStringForHtml(nombreReceta)}', ${cantBase}, '${escapeJsStringForHtml(unidadBase)}')"><i class="fas fa-edit"></i> Editar</button>
                        <button type="button" class="btn-submit btn-compact btn-danger" onclick="confirmRemoveDetalleReceta(${insumo.id_detalle_receta}, ${idReceta}, '${escapeJsStringForHtml(nombreReceta)}', ${cantBase}, '${escapeJsStringForHtml(unidadBase)}')"><i class="fas fa-trash"></i> Quitar</button>
                    </td>
                `;
            });
            document.getElementById('recipe-detail-status').textContent = 'Detalles cargados.';
        } else {
            document.getElementById('recipe-detail-status').textContent = `Esta receta no tiene insumos.`;
        }
    })
    .catch(error => {
        document.getElementById('recipe-detail-status').textContent = `Error de comunicación: ${error.message}`;
    });
}
function loadOrdenesList() {
    const tableBody = document.getElementById('ordenes-list-rows');
    tableBody.innerHTML = '<tr><td colspan="7"><i class="fas fa-spinner fa-spin"></i> Cargando órdenes...</td></tr>';
    fetch(`${PRODUCTION_SERVLET_URL}?action=obtener_ordenes_activas`)
    .then(response => response.json())
    .then(ordenes => {
        tableBody.innerHTML = '';
        if (ordenes.length > 0) {
            ordenes.forEach(orden => {
                const newRow = tableBody.insertRow();
                newRow.innerHTML = `
                    <td>${orden.codigo_orden}</td>
                    <td>${orden.nombre_articulo_terminado}</td>
                    <td>${parseFloat(orden.cantidad_programada).toFixed(2)} ${orden.unidad_nombre}</td>
                    <td>${orden.fecha_creacion}</td>
                    <td>${orden.estado_produccion}</td>
                    <td>${orden.codigo_lote || 'N/A'}</td>
                    <td>
                        <button type="button" class="btn-submit btn-compact btn-info" onclick="loadDetalleOrden('${orden.codigo_orden}', '${escapeJsStringForHtml(orden.nombre_articulo_terminado)}', '${orden.estado_produccion}')"><i class="fas fa-eye"></i> Ver</button>
                        ${orden.estado_produccion === 'PENDIENTE' ? `<button type="button" class="btn-submit btn-compact btn-danger" onclick="confirmCancelOrden('${orden.codigo_orden}')"><i class="fas fa-times"></i> Cancelar</button>` : '' }
                    </td>
                `;
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="7">No se encontraron órdenes activas.</td></tr>`;
        }
    })
    .catch(error => {
        tableBody.innerHTML = `<tr><td colspan="7">Error de comunicación al cargar listado: ${error.message}</td></tr>`;
    });
}
function loadDetalleOrden(codigoOrden, nombreArticulo, estado) {
    alert(`Cargando detalle de la Orden: ${codigoOrden} (${nombreArticulo}, Estado: ${estado})`);
}
function confirmCancelOrden(codigoOrden) {
    if (confirm(`¿Está seguro de CANCELAR la Orden de Producción ${codigoOrden}? Esta acción no se puede deshacer.`)) {
        cancelOrden(codigoOrden);
    }
}
function cancelOrden(codigoOrden) {
    const params = new URLSearchParams({
        action: 'cancelar_orden',
        p_codigo_orden: codigoOrden
    });
    fetch(PRODUCTION_SERVLET_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    })
    .then(handleJsonResponse)
    .then(data => {
        if (data.success) {
            alert(`Orden ${codigoOrden} cancelada correctamente.`);
            loadOrdenesList();
        } else {
            alert("Error al cancelar la orden: " + (data.message || "Detalle desconocido."));
        }
    })
    .catch(error => {
        alert("Error de comunicación al cancelar orden: " + error.message);
    });
}
function calculateLooseContainers() {
    const cantProd = parseFloat(document.getElementById('cant_prod_orden_empaque').value) || 0;
    const totalContainers = parseFloat(document.getElementById('cant_unidades_envasadas_ref').value) || 0;
    const looseDisplay = document.getElementById('loose-containers-display');
    const looseInput = document.getElementById('p_envases_sueltos');
    const looseInputHidden = document.getElementById('p_envases_sueltos_hidden');
    const difference = cantProd - totalContainers;
    if (difference >= 0.001) {
        looseDisplay.style.display = 'grid';
        looseInput.value = difference.toFixed(4);
        looseInputHidden.value = difference.toFixed(4);
    } else {
        looseInput.value = 0;
        looseInputHidden.value = 0;
        looseDisplay.style.display = 'none';
    }
}
function updateTotalUnitsReference() {
    const rows = document.getElementById('envase-tapa-rows').querySelectorAll('tr');
    let totalContainers = 0;
    rows.forEach(row => {
        const quantityContainers = parseInt(row.querySelector('input[name="p_cant_a_empacar_final[]"]').value) || 0;
        totalContainers += quantityContainers;
    });
    const totalContainersFixed = totalContainers.toFixed(0);
    const refField = document.getElementById('cant_unidades_envasadas_ref');
    if (refField) refField.value = totalContainersFixed;
    const etiquetaQtyField = document.getElementById('cant_etiquetas_total');
    if (etiquetaQtyField) etiquetaQtyField.value = totalContainersFixed;
    const cantFinalLotes = document.getElementById('cant_envases_final');
    if (cantFinalLotes) cantFinalLotes.value = totalContainersFixed;
    calculateLooseContainers();
}
function generateLotCode(event) {
    event.preventDefault();
    if (!activeOrdenCode) {
        alert("ERROR: Primero debe crear una Orden de Producción activa.");
        return;
    }
    fetch(`${PRODUCTION_SERVLET_URL}?action=generar_codigo_lote&id_orden=${activeOrdenCode}`)
    .then(response => response.json())
    .then(data => {
        if (data.success && data.codigo_lote) {
            activeLotCode = data.codigo_lote;
            document.getElementById('cod_lote_generado_envasado_display').value = activeLotCode;
            document.getElementById('p_codigo_lote_envase_hidden').value = activeLotCode;
            document.getElementById('cod_lote_ref_lotes').value = activeLotCode;
            document.getElementById('p_cod_lote_lote_hidden').value = activeLotCode;
            alert(`Código de Lote Generado: ${activeLotCode}. ¡Ahora puede proceder con el envasado!`);
        } else {
            alert(`Error al generar código de lote: ${data.message}`);
        }
    })
    .catch(error => {
        alert("Error de comunicación con el servidor al generar código de lote.");
    });
}
function submitPackagingStep(event, stepName) {
    event.preventDefault();
    const form = event.target;
    let actionValue = '';
    let message = '';
    if (!activeOrdenCode) {
        alert("ERROR: No hay una Orden de Producción activa.");
        return;
    }
    if (!activeLotCode) {
        alert("ERROR: Debe generar el Código de Lote (Paso 4.0) antes de registrar el envasado.");
        return;
    }
    if (stepName === 'combined_envasado') {
        actionValue = 'consumo_envase_tapa_etiqueta_multiple_step';
        message = 'Envase/Tapa/Etiqueta registrado correctamente.';
    } else if (stepName === 'empaque_secundario') {
        actionValue = 'consumo_empaque_step';
        message = 'Empaque Secundario registrado correctamente.';
    } else {
        alert("ERROR: Paso de envasado no reconocido.");
        return;
    }
    const submitButton = form.querySelector('button[type="submit"]');
    const originalContent = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    submitButton.disabled = true;
    const formData = new FormData(form);
    const params = new URLSearchParams(formData);
    params.set('action', actionValue);
    params.set('p_codigo_orden', activeOrdenCode);
    fetch(PRODUCTION_SERVLET_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    })
    .then(handleJsonResponse)
    .then(data => {
        submitButton.innerHTML = (stepName === 'combined_envasado' ? 'Envase Registrado' : 'Empaque Registrado');
        submitButton.classList.remove('btn-primary');
        submitButton.classList.add('btn-success');
        if (data.success) {
            alert(message);
        } else {
            alert("Error al registrar el paso de envasado: " + data.message);
        }
    })
    .catch(error => {
        submitButton.innerHTML = originalContent;
        submitButton.classList.add('btn-primary');
        submitButton.classList.remove('btn-success');
        submitButton.disabled = false;
        if (!error.message.includes("script de alerta")) {
            alert("Error de comunicación con el servidor al registrar el paso de envasado.");
        }
    });
}
function submitMerma(event) {
    event.preventDefault();
    if (!activeOrdenCode || !activeLotCode) {
        alert("ERROR: Debe haber una Orden activa y un Lote generado.");
        return;
    }
    document.getElementById('hidden_orden_merma_submit').value = activeOrdenCode;
    const formData = new FormData(event.target);
    const params = new URLSearchParams(formData);
    params.set('action', 'registrar_merma_y_cierre_empaque');
    params.set('p_envases_sueltos', document.getElementById('p_envases_sueltos_hidden').value);
    fetch(PRODUCTION_SERVLET_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    })
    .then(handleJsonResponse)
    .then(data => {
        if (data.success) {
            alert("Merma registrada y etapa cerrada con éxito.");
        } else {
            alert("Error al registrar merma: " + data.message);
        }
    })
    .catch(error => {
        if (!error.message.includes("script de alerta")) {
            alert("Error de comunicación con el servidor al registrar merma.");
        }
    });
}
function submitFinalLotRegistration(event) {
    event.preventDefault();
    const form = event.target;
    if (!activeOrdenCode || !activeLotCode) {
        alert("ERROR: Debe haber una Orden activa y un Lote generado.");
        return;
    }
    document.getElementById('hidden_orden_lote_submit').value = activeOrdenCode;
    document.getElementById('p_id_art_ter_lote_hidden').value = activeIdArtTerminado;
    document.getElementById('p_cod_lote_lote_hidden').value = activeLotCode;
    const formData = new FormData(form);
    const params = new URLSearchParams(formData);
    params.set('action', 'registrar_lote');
    const tableBody = document.getElementById('lotes-finales-rows');
    const newRow = tableBody.insertRow();
    newRow.innerHTML = `
        <td colspan="5"><i class="fas fa-spinner fa-spin"></i> Registrando lote...</td>
    `;
    fetch(PRODUCTION_SERVLET_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    })
    .then(handleJsonResponse)
    .then(data => {
        tableBody.innerHTML = '';
        if (data.success) {
            alert("Lote final registrado con éxito.");
            document.getElementById('lotes-finales-rows').innerHTML = `<tr><td colspan="5" class="text-success">Lote ${activeLotCode} registrado.</td></tr>`;
        } else {
            alert("Error al registrar lote final: " + data.message);
            document.getElementById('lotes-finales-rows').innerHTML = `<tr><td colspan="5" class="text-danger">Error: ${data.message}</td></tr>`;
        }
    })
    .catch(error => {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-danger">Error de comunicación: ${error.message}</td></tr>`;
    });
}
function submitFinalizarOrden(event) {
    event.preventDefault();
    if (!activeOrdenCode) {
        alert("ERROR: No hay una Orden de Producción activa para finalizar.");
        return;
    }
    if (!confirm(`¿Confirma FINALIZAR la Orden de Producción ${activeOrdenCode}?`)) {
        return;
    }
    const formData = new FormData(document.getElementById('finalizar-orden-form'));
    const params = new URLSearchParams(formData);
    params.set('action', 'finalizar_orden');
    fetch(PRODUCTION_SERVLET_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    })
    .then(handleJsonResponse)
    .then(data => {
        if (data.success) {
            alert("Orden de Producción " + activeOrdenCode + " **FINALIZADA** con éxito.");
            activeOrdenCode = '';
            activeLotCode = '';
            activeIdArtTerminado = '';
            activeNombreArtTerminado = '';
            updateOrdenFields();
            document.getElementById('display_order_recipe_status').textContent = 'Cree la Orden para cargar los insumos de la receta.';
            document.getElementById('insumos-orden-rows').innerHTML = '';
            insumosCargadosPreviamente = false;
        } else {
            alert("Error al finalizar la orden: " + (data.message || "Detalle desconocido."));
        }
    })
    .catch(error => {
        if (!error.message.includes("script de alerta")) {
            alert("Error de comunicación con el servidor al finalizar la orden.");
        }
    });
}
function updateOrdenFields() {
    const fields = [
        { suffix: 'envase', colorSuffix: 'primary' },
        { suffix: 'finalizar', colorSuffix: 'danger' },
        { suffix: 'lote', colorSuffix: 'success' },
    ];
    document.getElementById('active-orden-code-display').textContent = activeOrdenCode || 'N/A';
    fields.forEach(f => {
        const displayElement = document.getElementById(`display_orden_${f.suffix}`);
        const hiddenElement = document.getElementById(`hidden_orden_${f.suffix}`);
        if (displayElement) {
            displayElement.textContent = activeOrdenCode || 'Aún no hay Orden Activa';
            if (activeOrdenCode) {
                displayElement.classList.remove(`display-${f.colorSuffix}`);
                displayElement.classList.add(`display-${f.colorSuffix}`);
            } else {
                displayElement.classList.add(`display-${f.colorSuffix}`);
            }
        }
        if (hiddenElement) hiddenElement.value = activeOrdenCode;
    });
    document.getElementById('producto_a_envasar').value = activeNombreArtTerminado || 'Cargado de Orden Activa';
    const cleanFields = [
        'buscar_receta_orden',
        'cant_prod_orden',
        'p_id_receta_orden_hidden',
        'p_id_art_producido_orden_hidden',
        'p_receta_cantidad_base_hidden',
        'cant_prod_orden_empaque',
    ];
    if (!activeOrdenCode) {
        cleanFields.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
    }
    if (activeIdArtTerminado && activeNombreArtTerminado) {
        document.getElementById('producto_a_envasar').value = 'Producto Terminado: ' + activeNombreArtTerminado;
        document.getElementById('p_id_art_ter_envasado_hidden').value = activeIdArtTerminado;
        document.getElementById('p_id_art_ter_caja_hidden').value = activeIdArtTerminado;
        document.getElementById('p_id_art_ter_lote_hidden').value = activeIdArtTerminado;
        document.getElementById('p_id_art_ter_empaque').value = activeIdArtTerminado;
    } else {
        const defaultText = 'Cargado de Orden Activa';
        document.getElementById('producto_a_envasar').value = defaultText;
        document.getElementById('p_id_art_ter_envasado_hidden').value = '';
        document.getElementById('p_id_art_ter_caja_hidden').value = '';
        document.getElementById('p_id_art_ter_lote_hidden').value = '';
        document.getElementById('p_id_art_ter_empaque').value = '';
    }
    if (activeLotCode) {
        document.getElementById('cod_lote_ref_lotes').value = activeLotCode;
        document.getElementById('p_cod_lote_lote_hidden').value = activeLotCode;
    } else {
        document.getElementById('cod_lote_ref_lotes').value = 'Generar';
        document.getElementById('p_cod_lote_lote_hidden').value = '';
    }
}