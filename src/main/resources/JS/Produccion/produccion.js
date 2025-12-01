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

function showSwalAlert(message, type = 'info', title = null) {
    if (!title) {
        if (type === 'error' || (message && typeof message === 'string' && message.toUpperCase().includes('ERROR'))) {
            type = 'error';
            title = 'Error de Proceso';
        } else {
            switch (type) {
                case 'success': title = 'Operación Exitosa';
                    break;
                case 'warning': title = 'Advertencia'; break;
                default: title = 'Información';
            }
        }
    }
    let buttonColor = '#007bff';
    if (type === 'error') {
        buttonColor = '#dc3545';
    } else if (type === 'success') {
        buttonColor = '#28a745';
    } else if (type === 'warning') {
        buttonColor = '#ffc107';
    }
    Swal.fire({
        title: title,
        text: message,
        icon: type,
        confirmButtonText: 'Aceptar',
        width: '450px',
        padding: '1.2em',
        confirmButtonColor: buttonColor
    });
}

function escapeJsStringForHtml(str) {
    if (typeof str !== 'string') return str;
    let escaped = str.replace(/\\/g, '\\\\');
    escaped = escaped.replace(/'/g, '\\\'');
    escaped = escaped.replace(/"/g, '\\"');
    return escaped;
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
                        id_maestro: item.id_producto_maestro,
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
            $('input[name="p_id_art_ter_hidden"]').val(ui.item.id_maestro);
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
                document.getElementById('p_nombre_art_producido_orden_hidden').value = ui.item.nombre_art_ter;
                insumosCargadosPreviamente = false;
                document.getElementById('display_order_recipe_status').textContent = 'Fórmula seleccionada. Use el botón "Cargar Insumos" para preparar el consumo.';
                document.getElementById('insumos-orden-rows').innerHTML = '';
                activeIdReceta = ui.item.id_receta;
                activeNombreReceta = ui.item.nombre_art_ter;
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
            document.getElementById('selected_tapa_display').textContent = `Tapa/Sello Seleccionado: ${ui.item.label}`;
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
    $('#btn_cargar_insumos_receta').on('click', function(event) {
       event.preventDefault();
       const idReceta = document.getElementById('p_id_receta_orden_hidden').value;
       if (!idReceta || isNaN(parseInt(idReceta))) {
           showSwalAlert("Debe seleccionar una Receta válida antes de cargar los insumos.", 'error', 'Fórmula Requerida');
           return;
       }
       loadInsumosForRecipe();
   });
    openTab(null, 'Receta');
    if (typeof window.activeOrdenCodeFromServlet !== 'undefined') {
        activeOrdenCode = window.activeOrdenCodeFromServlet;
        // updateOrdenFields() fue removido de aquí.
    }
    document.getElementById('edit-detalle-form').addEventListener('submit', submitEditDetalleReceta);
    $('#saveCommentBtn').on('click', saveComment);
    $('.close-button').on('click', function(event) {
        if (event.target.closest('#commentModal')) {
            closeCommentModal();
        } else if (event.target.closest('#view-recipe-modal')) {
            closeRecipeDetailModal();
        } else if (event.target.closest('#edit-detalle-modal')) {
            closeEditDetalleModal();
        }
    });
    $('#commentModal').on('click', function(event) {
        if (event.target.id === 'commentModal') {
            closeCommentModal();
        }
    });
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
    showSwalAlert("La adición de insumos se realiza automáticamente al seleccionar un elemento de la lista desplegable de búsqueda.", 'info', 'Información');
}

function addRow(tableId, code, name, qty, unitName, density, insumoId, unitId) {
    const tableBody = document.getElementById(tableId);
    const newRow = tableBody.insertRow();
    const inputId = `qty-receta-${Date.now()}`;
    newRow.innerHTML = `
        <td><input type="text" name="p_codigo_insumo[]" value="${code}" readonly class="readonly-field" placeholder="CÓDIGO"></td>
        <td><input type="text" name="p_nombre_art_insumo[]" value="${name}" required placeholder="Nombre Insumo"></td>
        <td class="quantity-control-receta">
            <input type="number" id="${inputId}" name="p_cant_req[]" value="${qty}" step="0.0001" required placeholder="Cantidad">
        </td>
        <td><input type="text" name="p_nombre_uni_insumo[]" value="${unitName}" readonly class="readonly-field" placeholder="Unidad"></td>
        <td><input type="number" name="p_densidad[]" value="${density}"
step="0.000001" required placeholder="0.00" class="readonly-field" readonly></td>
        <td><button type="button" class="remove-row" onclick="deleteRow(this)"><i class="fas fa-trash"></i></button></td>
        <input type="hidden" name="p_id_art_insumo_hidden[]" value="${insumoId}">
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
        <td class="capacity-field-group">
            <input type="number" name="p_capacidad_numeric[]" value="${capacityDetails.value}" step="0.0001" required>
            <select name="p_capacidad_unidad[]" required>
                <option value="Litro" ${capacityDetails.unit === 'Litro' ?
'selected' : ''}>Lt</option>
                <option value="ml" ${capacityDetails.unit === 'ml' ?
'selected' : ''}>ml</option>
                <option value="Kg" ${capacityDetails.unit === 'Kg' ?
'selected' : ''}>Kg</option>
                <option value="gr" ${capacityDetails.unit === 'gr' ?
'selected' : ''}>gr</option>
            </select>
        </td>
        <td class="quantity-control-compact">
            <input type="number" id="${rowId}-qty" name="p_cant_a_empacar_final[]" value="1" min="1" step="1" required oninput="updateTotalUnitsReference()">
        </td>
        <td data-tapa-status="unassigned" data-contratapa-status="unassigned" id="tapassello_col_${rowId}">
            <div class="tapa-display-container">
                <span
id="tapa_assigned_display_${rowId}" class="tapa-status-tag tag-unassigned">TAPA: N/A</span>
                <input type="hidden" name="p_id_componente_cap[]" id="tapa_id_hidden_${rowId}" value="">
                <input type="hidden" name="tapa_nombre_hidden[]" id="tapa_nombre_hidden_${rowId}" value="">
            </div>
            <div class="tapa-display-container">
                <span id="contratapa_assigned_display_${rowId}" class="tapa-status-tag tag-unassigned">CONTRATAPA: N/A</span>
    <input type="hidden" name="p_id_componente_contratapa[]" id="contratapa_id_hidden_${rowId}" value="">
                <input type="hidden" name="contratapa_nombre_hidden[]" id="contratapa_nombre_hidden_${rowId}" value="">
            </div>
        </td>
        <td class="actions-cell-grid-container">
            <div class="actions-grid-compact">
                <button type="button" class="btn-submit btn-xs btn-primary" onclick="assignTapaToRow('${rowId}', 'tapa')">Tapa</button>
        <button type="button" class="btn-submit btn-xs btn-secondary" onclick="assignTapaToRow('${rowId}', 'contratapa')">Contratapa</button>
                <button type="button" class="btn-submit btn-xs btn-info" onclick="removeAssignedTapa('${rowId}', 'contratapa')">Quitar Contratapa</button>
                <button type="button" class="remove-row btn-xs btn-danger" onclick="deleteRow(this);
updateTotalUnitsReference()"><i class="fas fa-trash"></i> Fila</button>
            </div>
        </td>
    `;
    updateTotalUnitsReference();
}

function assignTapaToRow(rowId, capType) {
    const globalIdHidden = 'p_id_tapa_seleccionada_hidden';
    const globalDisplayId = 'selected_tapa_display';
    const selectedId = document.getElementById(globalIdHidden).value;
    const selectedLabelText = document.getElementById(globalDisplayId).textContent;
    if (!selectedId) {
        showSwalAlert(`Primero debe buscar y seleccionar una Tapa/Sello en el Paso 4.1.`, 'error', 'Error de Asignación');
        return;
    }
    const assignedName = selectedLabelText.replace(`Tapa/Sello Seleccionado: `, '');
    let displayElementId, idHiddenId, nombreHiddenId;
    let assignmentName;
    if (capType === 'tapa') {
        displayElementId = `tapa_assigned_display_${rowId}`;
        idHiddenId = `tapa_id_hidden_${rowId}`;
        nombreHiddenId = `tapa_nombre_hidden_${rowId}`;
        assignmentName = 'Tapa';
    } else if (capType === 'contratapa') {
        displayElementId = `contratapa_assigned_display_${rowId}`;
        idHiddenId = `contratapa_id_hidden_${rowId}`;
        nombreHiddenId = `contratapa_nombre_hidden_${rowId}`;
        assignmentName = 'Contratapa';
    } else {
        return;
    }
    const assignedDisplayElement = document.getElementById(displayElementId);
    const idHidden = document.getElementById(idHiddenId);
    const nombreHidden = document.getElementById(nombreHiddenId);
    assignedDisplayElement.textContent = `${assignmentName.toUpperCase()}: ${assignedName}`;
    assignedDisplayElement.style.backgroundColor = 'var(--accent-success)';
    assignedDisplayElement.style.color = 'white';
    idHidden.value = selectedId;
    nombreHidden.value = assignedName;
    showSwalAlert(`${assignmentName} ${assignedName} asignada al envase.`, 'success', 'Asignación Exitosa');
}

function removeAssignedTapa(rowId, capType) {
    if (capType !== 'contratapa') {
        showSwalAlert("Solo la Contratapa/Sello (Opcional) puede ser removida individualmente.", 'warning', 'Advertencia');
        return;
    }
    const displayElement = document.getElementById(`contratapa_assigned_display_${rowId}`);
    const idHidden = document.getElementById(`contratapa_id_hidden_${rowId}`);
    const nombreHidden = document.getElementById(`contratapa_nombre_hidden_${rowId}`);
    displayElement.textContent = 'CONTRATAPA: N/A (Opcional)';
    displayElement.style.backgroundColor = 'var(--accent-danger)';
    idHidden.value = '';
    nombreHidden.value = '';
    showSwalAlert("Asignación de Contratapa/Sello removida.", 'info', 'Información');
}

function handleJsonResponse(response) {
    if (!response.ok) {
        return response.json().then(error => {
            throw new Error(error.error || error.message || `Error HTTP ${response.status}: ${response.statusText}`);
        }).catch(() => {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        });
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return {};
}

function openAddInsumoModal(idReceta, nombreReceta, cantBase, unidadBase) {
    document.getElementById('add_p_id_receta').value = idReceta;
    document.getElementById('add-insumo-recipe-title').textContent = `${nombreReceta} (Base: ${cantBase.toFixed(2)} ${unidadBase})`;
    document.getElementById('add-insumo-info').textContent = `Cantidad base de la receta: ${cantBase.toFixed(2)} ${unidadBase}`;

    $("#buscar_insumo_add").autocomplete({
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
            document.getElementById('buscar_insumo_add').value = selectedItem.value;

            document.getElementById('add_p_id_articulo').value = selectedItem.id;
            document.getElementById('add_p_id_unidad').value = selectedItem.id_unidad;
            document.getElementById('add_p_densidad').value = selectedItem.densidad;
            document.getElementById('add_p_nombre_unidad').value = selectedItem.unidad_nombre;

            return false;
        }
    });

    document.getElementById('add-insumo-form').reset();
    document.getElementById('add-insumo-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAddInsumoModal() {
    document.getElementById('add-insumo-modal').style.display = 'none';
    document.getElementById('add-insumo-form').reset();
    document.body.style.overflow = 'auto';
}

function saveNewInsumoToRecipe(event) {
    event.preventDefault();
    const form = event.target;
    const idReceta = document.getElementById('add_p_id_receta').value;
    const nombreRecetaElement = document.getElementById('add-insumo-recipe-title');
    const fullInfo = nombreRecetaElement.textContent;
    const nombreRecetaMatch = fullInfo.match(/^(.*) \(Base:/);
    const nombreReceta = nombreRecetaMatch ? nombreRecetaMatch[1].trim() : '';
    const cantBaseMatch = fullInfo.match(/Base: ([\d.]+)\s*([a-zA-Z]+)/);
    const cantBase = cantBaseMatch ? parseFloat(cantBaseMatch[1]) : 1.0;
    const unidadBase = cantBaseMatch ? cantBaseMatch[2].trim() : 'Unidad';

    if (!document.getElementById('add_p_id_articulo').value) {
        showSwalAlert("Debe seleccionar un insumo válido.", 'error', 'Error de Insumo');
        return;
    }

    const formData = new FormData(form);
    const params = new URLSearchParams(formData);
    params.set('action', 'agregar_detalle_receta');

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
            showSwalAlert("Nuevo insumo agregado correctamente a la receta.", 'success', 'Adición Exitosa');
            closeAddInsumoModal();
            loadRecetaDetalle(idReceta, nombreReceta, cantBase, unidadBase);
        } else {
            showSwalAlert("Error al agregar insumo: " + (data.message || "Detalle desconocido."), 'error', 'Error al Guardar');
        }
    })
    .catch(error => {
        showSwalAlert("Error de comunicación al agregar insumo: " + error.message, 'error', 'Error de Conexión');
    });
}

function saveFullRecipe(event) {
    event.preventDefault();
    const form = event.target;
    const artTerId = $('input[name="p_id_art_ter_hidden"]').val();
    const nombreArtTer = document.getElementById('buscar_art_ter').value; // OBTENER EL NOMBRE DESDE EL CAMPO DE BÚSQUEDA
    const rows = document.getElementById('insumo-rows').querySelectorAll('tr');
    if (!artTerId) {
        showSwalAlert("Debe seleccionar un Producto Terminado.", 'error', 'Error de Producto');
        return;
    }
    if (rows.length === 0) {
        showSwalAlert("Agregue al menos un insumo componente antes de guardar la Fórmula Completa.", 'error', 'Error de Componentes');
        return;
    }
    const idUnidadProducir = document.getElementById('p_id_unidad_producir').value;
    const cantProd = document.getElementById('cant_prod') ? document.getElementById('cant_prod').value : '1.00';
    const nombreUniProd = 'Litro';
    if (!idUnidadProducir || idUnidadProducir !== '1') {
        showSwalAlert("ERROR CRÍTICO: La Unidad de Producción debe ser Litro (ID 1). Revise el campo oculto p_id_unidad_producir.", 'error', 'Error Crítico');
        return;
    }
    const formData = new FormData(form);
    const params = new URLSearchParams(formData);
    params.set('action', 'crear_receta_y_componentes');
    params.set('p_id_art_ter_hidden', artTerId);
    // AÑADIR ESTE PARÁMETRO PARA EL SERVLET (Auditoría/Mensaje de éxito)
    params.set('p_nombre_art_ter_receta', nombreArtTer);
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
            showSwalAlert("Fórmula Base y Componentes Guardados. El ID de Receta\nes: " + data.id_receta, 'success', 'Fórmula Guardada');
            document.getElementById('buscar_art_ter').value = '';
            $('input[name="p_id_art_ter_hidden"]').val('');
            $('input[name="p_id_unidad_producir"]').val('1');
            document.getElementById('insumo-rows').innerHTML = '';
        } else {
            showSwalAlert("Error al guardar la fórmula: " + (data.message || "Detalle desconocido."), 'error', 'Error al Guardar');
        }
    })
    .catch(error => {
        showSwalAlert("Error de comunicación con el servidor al guardar la fórmula. Verifique la conexión o el backend.", 'error', 'Error de Conexión');
    });
}

function loadInsumosForRecipe() {
    const idReceta = document.getElementById('p_id_receta_orden_hidden').value;
    const cantProdStr = document.getElementById('cant_prod_orden').value;
    const cantBaseRecetaStr = document.getElementById('p_receta_cantidad_base_hidden').value;
    if (!idReceta) {
        showSwalAlert("Debe seleccionar una Receta válida antes de cargar los insumos.", 'error', 'Error de Receta');
        return;
    }
    if (!cantProdStr || parseFloat(cantProdStr) <= 0) {
        showSwalAlert("La Cantidad a Producir (Programada) debe ser positiva para calcular los insumos.", 'error', 'Error de Cantidad');
        return;
    }
    if (!cantBaseRecetaStr || parseFloat(cantBaseRecetaStr) <= 0) {
        showSwalAlert("La Cantidad Base de la Receta (Fórmula) es requerida. Vuelva a seleccionar la Receta.", 'error', 'Error de Receta');
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
    fetch(`${PRODUCTION_SERVLET_URL}?action=obtener_insumos_receta&id_receta=${idReceta}`)
    .then(handleJsonResponse)
    .then(data => {
        if (data.length > 0) {
            data.forEach(insumo => {
                const baseReq = parseFloat(insumo.cantidad_requerida);
                const totalReq = baseReq * scaleFactor;
                const formattedTeorica =
formatTeorica(totalReq);
                const inputId = `real-cons-${insumo.id_articulo}-${Date.now()}`;
                const commentInputId = `comment-cons-${insumo.id_articulo}-${Date.now()}`;
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
                        <input type="hidden" id="${commentInputId}" name="p_comentario_desviacion" value="">
                        <td>${insumo.codigo}</td>
                        <td class="teorica-quantity" data-teorica="${totalReq}" data-unit="${insumo.unidad_nombre}">
                        ${formattedTeorica}
                        </td>
                        <td class="quantity-control-consumo" style="display: flex;
align-items: center; gap: 5px;">
                            <select id="op-${inputId}" class="operacion-ajuste" name="p_operacion_ajuste" onchange="calculateTotalConsumption(this.closest('tr'))" style="width: 40px;
padding: 4px; text-align: center; border-radius: 4px;">
                                <option value="+">+</option>
                                <option value="-">-</option>
                            </select>
                            <input type="number" id="${inputId}" name="p_cantidad_adicional" class="real-consumption cant-ajuste-real" value="0.0000" step="0.0001" oninput="calculateTotalConsumption(this.closest('tr'))" required style="min-width: 60px;">
                            <button type="button" class="btn-submit btn-compact btn-info"
                                    data-comment-id="${commentInputId}"
                                    data-insumo-nombre="${escapeJsStringForHtml(insumo.nombre_articulo)}"
                                    onclick="openCommentModal(this)">
                            <i class="fas fa-comment-dots"></i>
                            </button>
                        </td>
                        <td class="total-consumption">
                                ${initialTotalConsumedDisplay}
                        </td>
                        <td>
                            <button type="submit" class="btn-submit btn-compact btn-warning" disabled><i class="fas
fa-edit"></i> Registrar</button>
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
    let cantProdStr = document.getElementById('cant_prod_orden').value;
    const idArtProducido = document.getElementById('p_id_art_producido_orden_hidden').value;
    const fechaIni = document.getElementById('fecha_ini').value;
    let cantProdFinalRealStr = document.getElementById('p_cant_prod_final_real').value;
    const nombreArticulo = document.getElementById('p_nombre_art_producido_orden_hidden').value;
    const obs = document.getElementById('obs_orden').value;
    if (!idReceta || !insumosCargadosPreviamente) {
        showSwalAlert("Debe seleccionar una Receta y Cargar los Insumos primero.", 'error', 'Error de Pre-requisitos');
        return;
    }
    cantProdStr = cantProdStr.replace(',', '.').trim();
    cantProdFinalRealStr = cantProdFinalRealStr.replace(',', '.').trim();
    if (!cantProdStr || parseFloat(cantProdStr) <= 0) {
        showSwalAlert("La Cantidad a Producir (Programada) debe ser positiva.", 'error', 'Error de Cantidad');
        return;
    }
    if (!cantProdFinalRealStr || parseFloat(cantProdFinalRealStr) <= 0) {
        showSwalAlert("La Cantidad Producida Final Real es requerida y debe ser positiva.", 'error', 'Error de Cantidad');
        return;
    }
    if (!nombreArticulo) {
        showSwalAlert("Error de datos: El nombre del Artículo Producido está vacío. Verifique la selección de la Fórmula.", 'error', 'Error de Datos');
        return;
    }
    const formData = new FormData();
    formData.append('p_id_receta_orden_hidden', idReceta);
    formData.append('p_cant_prod_orden', cantProdStr);
    formData.append('p_id_art_producido_orden_hidden', idArtProducido);
    formData.append('p_cant_prod_final_real', cantProdFinalRealStr);
    formData.append('p_fecha_ini_orden', fechaIni);
    formData.append('p_obs_orden', obs);
    formData.append('p_nombre_art_producido_orden_hidden', nombreArticulo);
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

            updateOrdenFields();
            showSwalAlert(`Orden Creada: ${activeOrdenCode}. Ahora registre el consumo de insumos.`, 'success', 'Orden Creada');
            const rows = document.getElementById('insumos-orden-rows').querySelectorAll('tr');
            rows.forEach(row => {
                const form = row.querySelector('form');
                if (form) {
                    form.querySelector('input[name="p_id_orden_temp"]').value = activeOrdenCode;
                    const submitButton = form.querySelector('button[type="submit"]');
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.innerHTML = '<i class="fas fa-edit"></i> Registrar';
                        submitButton.classList.add('btn-warning');
                        submitButton.classList.remove('btn-success');
                    }
                }
            });
            document.getElementById('display_order_recipe_status').textContent = `Orden Activa: ${activeOrdenCode}. Revise y registre el consumo real de cada insumo.`;
        } else {
            showSwalAlert("Error al crear la orden: " + (data.message || "Detalle desconocido."), 'error', 'Error al Crear Orden');
        }
    })
    .catch(error => {
        showSwalAlert("Error de comunicación con el servidor al crear la orden. Detalle: " + error.message, 'error', 'Error de Conexión');
    });
}

function updateOrdenFields(forceClear = false) {
    if (forceClear) {
        activeOrdenCode = '';
        activeLotCode = '';
        activeIdArtTerminado = '';
        activeNombreArtTerminado = '';
    }
    const fields = [
        { suffix: 'consumo', colorSuffix: 'warning' },
        { suffix: 'envase', colorSuffix: 'primary' },
        { suffix: 'finalizar', colorSuffix: 'danger' },
        { suffix: 'lote', colorSuffix: 'success' },
    ];
    const activeOrdenDisplay = document.getElementById('active-orden-code-display');
    if (activeOrdenDisplay) activeOrdenDisplay.textContent = activeOrdenCode || 'N/A';

    fields.forEach(f => {
        const displayElement = document.getElementById(`display_orden_${f.suffix}`);
        const hiddenElement = document.getElementById(`hidden_orden_${f.suffix}`);
        if (displayElement) {
            displayElement.textContent = activeOrdenCode || 'Aún no hay Orden Activa';
            displayElement.className = `orden-activa-display display-${activeOrdenCode ? f.colorSuffix : 'secondary'}`;
        }
        if (hiddenElement) hiddenElement.value = activeOrdenCode;
    });

    if (activeOrdenCode) {
        const pIdArtTerEnvasadoHidden = document.getElementById('p_id_art_ter_envasado_hidden');
        if (pIdArtTerEnvasadoHidden) pIdArtTerEnvasadoHidden.value = activeIdArtTerminado;

        const productoAEnvasar = document.getElementById('producto_a_envasar');
        if (productoAEnvasar) productoAEnvasar.value = activeNombreArtTerminado;

        const pNombreArtTerEnvasado = document.getElementById('p_nombre_art_ter_envasado');
        if (pNombreArtTerEnvasado) pNombreArtTerEnvasado.value = activeNombreArtTerminado;

        const pIdArtTerCajaHidden = document.getElementById('p_id_art_ter_caja_hidden');
        if (pIdArtTerCajaHidden) pIdArtTerCajaHidden.value = activeIdArtTerminado;

        const pNombreArtTerCaja = document.getElementById('p_nombre_art_ter_caja');
        if (pNombreArtTerCaja) pNombreArtTerCaja.value = activeNombreArtTerminado;

        const pIdArtTerLoteHidden = document.getElementById('p_id_art_ter_lote_hidden');
        if (pIdArtTerLoteHidden) pIdArtTerLoteHidden.value = activeIdArtTerminado;

        const pNombreArtTerLote = document.getElementById('p_nombre_art_ter_lote');
        if (pNombreArtTerLote) pNombreArtTerLote.value = activeNombreArtTerminado;

        const loteCodeDisplayEmpaque = document.getElementById('lote_code_display_empaque');
        if (loteCodeDisplayEmpaque) loteCodeDisplayEmpaque.textContent = activeLotCode || 'N/A';

        const loteCodeDisplayFinalizar = document.getElementById('lote_code_display_finalizar');
        if (loteCodeDisplayFinalizar) loteCodeDisplayFinalizar.textContent = activeLotCode || 'N/A';

        const codLoteRefLotes = document.getElementById('cod_lote_ref_lotes');
        if (codLoteRefLotes) codLoteRefLotes.value = activeLotCode || 'Esperando Lote Generado';

        const codLoteGeneradoEnvasadoDisplay = document.getElementById('cod_lote_generado_envasado_display');
        if (codLoteGeneradoEnvasadoDisplay) codLoteGeneradoEnvasadoDisplay.value = activeLotCode || "Presione 'Generar'";

        const cantEnvasesFinal = document.getElementById('cant_envases_final');
        const cantUnidadesEnvasadasRef = document.getElementById('cant_unidades_envasadas_ref');

        if (cantEnvasesFinal && cantUnidadesEnvasadasRef) {
            cantEnvasesFinal.value = (parseFloat(cantUnidadesEnvasadasRef.value) || 0).toFixed(0);
        }

        const cantProducidaTotalLitros = document.getElementById('cant_producida_total_litros');
        if (cantProducidaTotalLitros) cantProducidaTotalLitros.value = 0.00;

    } else if (forceClear) {
        const cleanFields = [
            'p_id_receta_orden_hidden',
            'p_id_art_producido_orden_hidden',
            'p_receta_cantidad_base_hidden',
            'buscar_receta_orden',
            'cant_prod_orden',
            'p_id_art_ter_envasado_hidden',
            'producto_a_envasar',
            'p_nombre_art_ter_envasado',
            'p_id_art_ter_caja_hidden',
            'p_nombre_art_ter_caja',
            'p_id_art_ter_lote_hidden',
            'p_nombre_art_ter_lote',
            'p_cant_prod_final_real',
            'cod_lote_generado_envasado_display',
            'p_codigo_lote_envase_hidden',
            'cod_lote_ref_lotes',
            'cant_envases_final',
            'cant_unidades_envasadas_ref'
        ];
        cleanFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = '';
        });
        const insumosOrdenRows = document.getElementById('insumos-orden-rows');
        if (insumosOrdenRows) insumosOrdenRows.innerHTML = '';

        const envaseTapaRows = document.getElementById('envase-tapa-rows');
        if (envaseTapaRows) envaseTapaRows.innerHTML = '';

        const displayOrderRecipeStatus = document.getElementById('display_order_recipe_status');
        if (displayOrderRecipeStatus) displayOrderRecipeStatus.textContent = 'Fórmula seleccionada. Use el botón "Cargar Insumos" para preparar el consumo.';

        const loteCodeDisplayEmpaque = document.getElementById('lote_code_display_empaque');
        if (loteCodeDisplayEmpaque) loteCodeDisplayEmpaque.textContent = 'N/A';

        const loteCodeDisplayFinalizar = document.getElementById('lote_code_display_finalizar');
        if (loteCodeDisplayFinalizar) loteCodeDisplayFinalizar.textContent = 'N/A';

        const idArtTerEmpaqueFields = document.querySelectorAll('#p_id_art_ter_envasado_hidden, #p_id_art_ter_caja_hidden');
        if (idArtTerEmpaqueFields) {
            idArtTerEmpaqueFields.forEach(field => {
                if (field) field.value = '';
            });
        }
    }
}

function handleInsumoConsumption(event, rowOverride = null) {
    event.preventDefault();
    const row = rowOverride || event.target.closest('tr');
    const form = row.querySelector('form');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalContent = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    submitButton.disabled = true;
    const idOrden = form.querySelector('input[name="p_id_orden_temp"]').value;
    const idArticuloConsumido = form.querySelector('input[name="p_id_articulo_consumido"]').value;
    const totalConsumptionDisplay = row.querySelector('.total-consumption').textContent;
    const idUnidad = form.querySelector('input[name="p_id_unidad"]').value;
    const totalConsumedMatch = totalConsumptionDisplay.match(/^([\d,]+(?:\.\d+)?)\s*([a-zA-Z]+)/);
    if (!totalConsumedMatch) {
        submitButton.innerHTML = originalContent;
        submitButton.disabled = false;
        showSwalAlert("Error interno al parsear la cantidad consumida total.", 'error', 'Error Interno');
        return;
    }
    const totalConsumedStr = totalConsumedMatch[1].replace(',', '.');
    const totalConsumed = parseFloat(totalConsumedStr);
    const codigoArticulo = row.querySelector('td:nth-child(1)').textContent;
    const nombreArticuloConsumido = codigoArticulo;
    const comentarioInput = row.querySelector(`[id^="comment-cons-${idArticuloConsumido}-"]`);
    const comentario = comentarioInput ? comentarioInput.value : '';

    const params = new URLSearchParams({
        action: 'registrar_consumo_componente',
        p_id_orden: idOrden,
        p_id_articulo_consumido: idArticuloConsumido,
        p_cantidad_consumida: totalConsumed,
        p_id_unidad: idUnidad,
        p_es_envase: false,
        p_comentario_consumo: comentario,
        p_nombre_articulo_consumido: nombreArticuloConsumido
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
            showSwalAlert("Error al registrar consumo: " + data.message, 'error', 'Error de Registro');
        }
    })
    .catch(error => {
        submitButton.innerHTML = originalContent;
        submitButton.classList.add('btn-warning');
        submitButton.classList.remove('btn-success');
        submitButton.disabled = false;
        showSwalAlert("Error de comunicación con el servidor al registrar el consumo.", 'error', 'Error de Conexión');
    });
}

function closeRecipeDetailModal() {
    document.getElementById('view-recipe-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function loadInsumoDetalleForEdit(idDetalle, idReceta, nombreReceta, cantBase, unidadBase) {
    document.getElementById('edit-detalle-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('edit-detalle-modal-info').textContent = `Editando Insumo de: ${nombreReceta} (Base: ${cantBase.toFixed(4)} ${unidadBase})`;
    document.getElementById('edit_p_id_detalle_receta').value = idDetalle;
    document.getElementById('edit_p_id_receta').value = idReceta;
    document.getElementById('edit-detalle-form').reset();
    document.getElementById('edit-detalle-form').style.opacity = 0.5;

    fetch(`${PRODUCTION_SERVLET_URL}?action=obtener_detalle_insumo_receta&p_id_detalle_receta=${idDetalle}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const insumo = Array.isArray(data) && data.length > 0 ? data[0] : null;

        if (insumo) {
            document.getElementById('edit_p_nombre_articulo').value = insumo.nombre_articulo || '';
            document.getElementById('edit_p_cantidad_requerida').value = parseFloat(insumo.cantidad_requerida).toFixed(4);
            document.getElementById('edit_p_densidad').value = insumo.densidad || '1.00000000';
            document.getElementById('edit_p_nombre_unidad').value = insumo.unidad_nombre || 'Unidad';
            document.getElementById('edit_p_id_articulo').value = insumo.id_articulo;
            document.getElementById('edit_p_id_unidad').value = insumo.id_unidad;
            document.getElementById('edit_nombre_receta').value = nombreReceta;
            document.getElementById('edit_cant_base_receta').value = cantBase;
            document.getElementById('edit_unidad_base_receta').value = unidadBase;

            document.getElementById('edit-detalle-form').style.opacity = 1;
        } else {
            Swal.fire('Datos No Encontrados', 'No se pudo cargar el detalle del insumo. El servidor devolvió un objeto vacío.', 'error');
            closeEditModal();
        }
    })
    .catch(error => {
        Swal.fire('Error de Conexión o Servidor', `Error al cargar datos para edición: ${error.message}`, 'error');
        closeEditModal();
    });
}

function closeEditModal() {
    document.getElementById('edit-detalle-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function saveEditedDetalle(event) {
    event.preventDefault();
    const idReceta = document.getElementById('edit_p_id_receta').value;
    const nombreReceta = document.getElementById('edit_nombre_receta').value;
    const cantBase = parseFloat(document.getElementById('edit_cant_base_receta').value);
    const unidadBase = document.getElementById('edit_unidad_base_receta').value;
    const idDetalleReceta = document.getElementById('edit_p_id_detalle_receta').value;
    const cantReq = document.getElementById('edit_p_cantidad_requerida').value;
    const idUniInsumo = document.getElementById('edit_p_id_unidad').value;
    const nombreInsumo = document.getElementById('edit_p_nombre_articulo').value;

    const params = new URLSearchParams({
        action: 'modificar_detalle_receta',
        p_id_detalle_receta: idDetalleReceta,
        p_cantidad_requerida: cantReq,
        p_id_unidad: idUniInsumo,
        p_nombre_articulo: nombreInsumo
    });

    fetch(PRODUCTION_SERVLET_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    })
    .then(response => {
        if (!response.ok) throw new Error("Network response was not ok.");
        return response.json();
    })
    .then(data => {
        if (data.success) {
            Swal.fire('Actualización Exitosa', "Insumo de receta actualizado correctamente.", 'success');
            closeEditModal();
            loadRecetaDetalle(idReceta, nombreReceta, cantBase, unidadBase);
        } else {
            Swal.fire('Error de Edición', "Error al editar insumo: " + (data.message || "Detalle desconocido."), 'error');
        }
    })
    .catch(error => {
        Swal.fire('Error de Conexión', "Error de comunicación al editar insumo: " + error.message, 'error');
    });
}

function confirmRemoveDetalleReceta(idDetalle, idReceta, nombreReceta, cantBase, unidadBase) {
    Swal.fire({
        title: 'Confirmar Eliminación',
        text: "¿Está seguro de QUITAR este insumo de la receta?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, Quitar',
        cancelButtonText: 'No, Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            removeDetalleReceta(idDetalle, idReceta, nombreReceta, cantBase, unidadBase);
        }
    });
}

function removeDetalleReceta(idDetalle, idReceta, nombreReceta, cantBase, unidadBase) {
    const params = new URLSearchParams({
        action: 'quitar_detalle_receta',
        p_id_detalle_receta: idDetalle,
        p_nombre_insumo: 'Detalle ID ' + idDetalle
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
            showSwalAlert("Insumo quitado de la receta.", 'success', 'Eliminación Exitosa');
            loadRecetaDetalle(idReceta, nombreReceta, cantBase, unidadBase);
        } else {
            showSwalAlert("Error al quitar insumo: " + (data.message || "Detalle desconocido."), 'error', 'Error al Eliminar');
        }
    })
    .catch(error => {
        showSwalAlert("Error de comunicación al quitar insumo: " + error.message, 'error', 'Error de Conexión');
    });
}

function confirmDeactivateReceta(idReceta, nombreReceta) {
    Swal.fire({
        title: 'ADVERTENCIA',
        text: `¿Está seguro de DESACTIVAR la Receta "${nombreReceta}" (ID: ${idReceta})? Esto impedirá su uso en nuevas órdenes.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, Desactivar',
        cancelButtonText: 'No, Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            deactivateReceta(idReceta);
        }
    });
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
            showSwalAlert(`Receta ${idReceta} desactivada correctamente.`, 'success', 'Desactivación Exitosa');
            loadRecetasList();
        } else {
            showSwalAlert("Error al desactivar la receta: " + (data.message || "Detalle desconocido."), 'error', 'Error al Desactivar');
        }
    })
    .catch(error => {
        showSwalAlert("Error de comunicación al desactivar receta: " + error.message, 'error', 'Error de Conexión');
    });
}

function loadRecetasList() {
    const tableBody = document.getElementById('recetas-list-rows');
    tableBody.innerHTML = '<tr><td colspan="5"><i class="fas fa-spinner fa-spin"></i> Cargando recetas...</td></tr>';

    fetch(`${PRODUCTION_SERVLET_URL}?action=listar_recetas`)
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.error || `Error HTTP ${response.status}`);
            });
        }
        return response.json();
    })
    .then(data => {
        tableBody.innerHTML = '';
        const uniqueRecetas = new Map();
        const recetas = Array.isArray(data) ? data : (data.recetas || []);

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
                        <button type="button" class="btn-submit btn-compact btn-danger" onclick="confirmDeactivateReceta(${receta.id_receta}, '${nombreGenericoEscaped}')"><i class="fas fa-power-off"></i> Desactivar</button>
                    </td>
                `;
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="5">No se encontraron recetas.</td></tr>';
        }
    })
    .catch(error => {
        tableBody.innerHTML = `<tr><td colspan="5">Error al cargar recetas: ${error.message}</td></tr>`;
    });
}

function loadRecetaDetalle(idReceta, nombreReceta, cantBase, unidadBase) {
    document.getElementById('view-recipe-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('recipe-detail-info').textContent = `Receta: ${nombreReceta} (Base: ${cantBase.toFixed(2)} ${unidadBase})`;

    const addButton = document.getElementById('add-insumo-to-recipe-btn');
    if (addButton) {
        addButton.setAttribute('onclick', `openAddInsumoModal(${idReceta}, '${escapeJsStringForHtml(nombreReceta)}', ${cantBase}, '${escapeJsStringForHtml(unidadBase)}')`);
    }

    const tableBody = document.getElementById('recipe-detail-rows');
    tableBody.innerHTML = '<tr><td colspan="4"><i class="fas fa-spinner fa-spin"></i> Cargando insumos...</td></tr>';
    document.getElementById('recipe-detail-status').textContent = 'Cargando detalles...';

    fetch(`${PRODUCTION_SERVLET_URL}?action=obtener_insumos_receta&id_receta=${idReceta}`)
    .then(handleJsonResponse)
    .then(insumos => {
        tableBody.innerHTML = '';
        if (insumos.length > 0) {
            insumos.forEach(insumo => {
                const idDetalleReceta = insumo.id_detalle_receta || 0;
                const requiredQuantityDisplay = formatQuantityDisplay(parseFloat(insumo.cantidad_requerida), insumo.unidad_nombre);
                const newRow = tableBody.insertRow();

                newRow.innerHTML = `
                    <td>${insumo.codigo}</td>
                    <td>${insumo.nombre_articulo}</td>
                    <td>${requiredQuantityDisplay}</td>
                    <td>
                        <button type="button" class="btn-submit btn-compact btn-warning" onclick="loadInsumoDetalleForEdit(${idDetalleReceta}, ${idReceta}, '${escapeJsStringForHtml(nombreReceta)}', ${cantBase}, '${escapeJsStringForHtml(unidadBase)}')"><i class="fas fa-edit"></i> Editar</button>
                        <button type="button" class="btn-submit btn-compact btn-danger" onclick="confirmRemoveDetalleReceta(${idDetalleReceta}, ${idReceta}, '${escapeJsStringForHtml(nombreReceta)}', ${cantBase}, '${escapeJsStringForHtml(unidadBase)}')"><i class="fas fa-trash"></i> Quitar</button>
                    </td>
                `;
            });
            document.getElementById('recipe-detail-status').textContent = 'Detalles cargados.';
        } else {
            tableBody.innerHTML = '<tr><td colspan="4">Esta receta no tiene insumos.</td></tr>';
            document.getElementById('recipe-detail-status').textContent = 'Fórmula vacía.';
        }
    })
    .catch(error => {
        tableBody.innerHTML = `<tr><td colspan="4">Error al cargar insumos: ${error.message}</td></tr>`;
        document.getElementById('recipe-detail-status').textContent = `Error de comunicación.`;
    });
}

function closeOrdenDetailModal() { document.getElementById('view-orden-modal').style.display = 'none'; }

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
            tableBody.innerHTML = '<tr><td colspan="7">No se encontraron órdenes de producción activas.</td></tr>';
        }
    })
    .catch(error => {
        tableBody.innerHTML = `<tr><td colspan="7">Error al cargar órdenes: ${error.message}</td></tr>`;
    });
}

function confirmCancelOrden(codigoOrden) {
    Swal.fire({
        title: 'Confirmar Cancelación',
        text: `¿Está seguro de CANCELAR la Orden de Producción ${codigoOrden}? Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, Cancelar Orden',
        cancelButtonText: 'No, Mantener'
    }).then((result) => {
        if (result.isConfirmed) {
            cancelOrden(codigoOrden);
        }
    });
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
            showSwalAlert(`Orden ${codigoOrden} cancelada correctamente.`, 'success', 'Cancelación Exitosa');
            loadOrdenesList();
        } else {
            showSwalAlert("Error al cancelar la orden: " + (data.message || "Detalle desconocido."), 'error', 'Error al Cancelar');
        }
    })
    .catch(error => {
        showSwalAlert("Error de comunicación al cancelar orden: " + error.message, 'error', 'Error de Conexión');
    });
}

function loadDetalleOrden(codigoOrden, nombreArtTerminado, estado) {
    document.getElementById('view-orden-modal-info').textContent = `Orden: ${codigoOrden} - ${nombreArtTerminado} (Estado: ${estado})`;
    document.getElementById('orden-detalle-insumos-body').innerHTML = '<tr><td colspan="5"><i class="fas fa-spinner fa-spin"></i> Cargando insumos...</td></tr>';
    document.getElementById('view-orden-modal').style.display = 'flex';
    document.getElementById('orden-detalle-status').textContent = 'Cargando detalles...';
    fetch(`${PRODUCTION_SERVLET_URL}?action=obtener_consumos_orden&p_codigo_orden=${codigoOrden}`)
    .then(response => response.json())
    .then(consumos => {
        const tableBody = document.getElementById('orden-detalle-insumos-body');
        tableBody.innerHTML = '';
        if (consumos.length > 0) {
            consumos.forEach(consumo => {
                const newRow = tableBody.insertRow();
                newRow.innerHTML = `
                    <td>${consumo.codigo_articulo}</td>
                    <td>${consumo.nombre_articulo}</td>
                    <td>${parseFloat(consumo.cantidad_teorica).toFixed(4)} ${consumo.unidad_nombre}</td>
                    <td>${parseFloat(consumo.cantidad_consumida).toFixed(4)} ${consumo.unidad_nombre}</td>
                    <td>${consumo.fecha_registro}</td>
                `;
            });
            document.getElementById('orden-detalle-status').textContent = 'Detalles de consumo cargados.';
        } else {
            document.getElementById('orden-detalle-status').textContent = 'No hay registros de consumo para esta orden.';
        }
    })
    .catch(error => {
        document.getElementById('orden-detalle-status').textContent = `Error de comunicación: ${error.message}`;
    });
}

function closeOrdenDetailModal() { document.getElementById('view-orden-modal').style.display = 'none'; }

function calculateLooseContainers() {
    const finalProducedQtyInput = document.getElementById('cant_producida_final_envasado');
    const finalProducedQty = parseFloat(finalProducedQtyInput.value) ||
0;
    const rows = document.getElementById('envase-tapa-rows').querySelectorAll('tr');
    let totalContainersCapacity = 0;
    rows.forEach(row => {
        const capacityInput = row.querySelector('input[name="p_capacidad_numeric[]"]');
        const unitSelect = row.querySelector('select[name="p_capacidad_unidad[]"]');
        const qtyContainersInput = row.querySelector('input[name="p_cant_a_empacar_final[]"]');
        const capacityValue = parseFloat(capacityInput.value) || 0;
        const qtyContainers = parseInt(qtyContainersInput.value) || 0;
        const unit = unitSelect.value.toLowerCase();
        let capacityInLitros = capacityValue;
        if (unit === 'ml') {
            capacityInLitros = capacityValue / 1000;
        } else if (unit === 'gr') {
        } else if (unit === 'kg') {
        }
        totalContainersCapacity += capacityInLitros * qtyContainers;
    });
    const looseInput = document.getElementById('envases_sueltos_display');
    const looseInputHidden = document.getElementById('p_envases_sueltos_hidden');
    const looseDisplay = document.getElementById('envases_sueltos_group');
    const envasesSueltos = Math.ceil(finalProducedQty * 1000) - Math.ceil(totalContainersCapacity * 1000);
    if (envasesSueltos > 0) {
        looseInput.value = envasesSueltos.toFixed(0);
        looseInputHidden.value = envasesSueltos.toFixed(0);
        looseDisplay.style.display = 'block';
    } else {
        looseInput.value = 0;
        looseInputHidden.value = 0;
        looseDisplay.style.display = 'none';
    }
    const cantProducidaTotalLitros = document.getElementById('cant_producida_total_litros');
    cantProducidaTotalLitros.value = finalProducedQty.toFixed(2);
    const cantTotalEmpacada = document.getElementById('cant_total_empacada');
    cantTotalEmpacada.value = totalContainersCapacity.toFixed(2);
    const mermaCantidad = document.getElementById('merma_cantidad');
    const mermaValue = finalProducedQty - totalContainersCapacity;
    mermaCantidad.value = mermaValue.toFixed(2);
}

function updateTotalUnitsReference() {
    const rows = document.getElementById('envase-tapa-rows').querySelectorAll('tr');
    let totalUnits = 0;
    rows.forEach(row => {
        const qtyInput = row.querySelector('input[name="p_cant_a_empacar_final[]"]');
        totalUnits += parseInt(qtyInput.value) || 0;
    });
    const totalUnitsDisplay = document.getElementById('total-units-reference');
    if (totalUnitsDisplay) {
        totalUnitsDisplay.textContent = totalUnits;
    }
}

function submitPackagingStep(event, stepAction, message) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const params = new URLSearchParams(formData);
    params.set('action', stepAction);
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
            showSwalAlert(message, 'success', 'Paso Registrado');
        } else {
            showSwalAlert(`Error al registrar el paso de empaque: ${data.message}`, 'error', 'Error de Registro');
        }
    })
    .catch(error => {
        showSwalAlert(`Error de comunicación con el servidor en el paso de empaque: ${error.message}`, 'error', 'Error de Conexión');
    });
}

function submitMerma(event) {
    event.preventDefault();
    if (!activeOrdenCode) {
        showSwalAlert("No hay una Orden de Producción activa para finalizar la etapa de empaque.", 'error', 'Error de Orden');
        return;
    }
    document.getElementById('hidden_orden_merma_submit').value = activeOrdenCode;
    const mermaCantidad = document.getElementById('merma_cantidad').value;
    const envasesSueltos = document.getElementById('p_envases_sueltos_hidden').value;
    const params = new URLSearchParams({
        action: 'registrar_merma_y_cierre_empaque',
        p_codigo_orden: activeOrdenCode,
        p_merma_cantidad: mermaCantidad,
        p_envases_sueltos: envasesSueltos
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
            showSwalAlert("Merma y etapa de Empaque registrados y cerrados correctamente.", 'success', 'Cierre de Empaque Exitoso');
        } else {
            showSwalAlert("Error al registrar merma: " + data.message, 'error', 'Error de Registro');
        }
    })
    .catch(error => {
        showSwalAlert("Error de comunicación con el servidor al registrar merma: " + error.message, 'error', 'Error de Conexión');
    });
}

function submitFinalLotRegistration(event) {
    event.preventDefault();
    const form = event.target;
    if (!activeOrdenCode || !activeLotCode) {
        showSwalAlert("Debe haber una Orden activa y un Lote generado.", 'error', 'Error de Lote');
        return;
    }
    document.getElementById('hidden_orden_lote_submit').value = activeOrdenCode;
    document.getElementById('p_id_art_ter_lote_hidden').value = activeIdArtTerminado;
    document.getElementById('p_cod_lote_lote_hidden').value = activeLotCode;
    const formData = new FormData(form);
    const params = new URLSearchParams(formData);
    params.set('action', 'registrar_lote_final');
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
            showSwalAlert("Lote final registrado. Etapa de Finalización de Orden Completada.", 'success', 'Registro de Lote Exitoso');
            activeOrdenCode = '';
            activeLotCode = '';
            activeIdArtTerminado = '';
            activeNombreArtTerminado = '';
            updateOrdenFields(true);
        } else {
            showSwalAlert("Error al registrar el lote final: " + data.message, 'error', 'Error de Registro');
        }
    })
    .catch(error => {
        showSwalAlert("Error de comunicación con el servidor al registrar el lote final: " + error.message, 'error', 'Error de Conexión');
    });
}

function generateLotCode(event) {
    event.preventDefault();
    if (!activeOrdenCode) {
        showSwalAlert("No hay una Orden de Producción activa para generar un código de lote.", 'error', 'Error de Orden');
        return;
    }
    if (!activeIdArtTerminado) {
        showSwalAlert("No se ha cargado el Artículo Terminado de la orden activa. Seleccione una orden nueva o verifique la existente.", 'error', 'Error de Artículo');
        return;
    }
    const fechaLote = document.getElementById('fecha_lote') ? document.getElementById('fecha_lote').value : getCurrentDateFormatted();

    if (!fechaLote) {
        showSwalAlert("Debe seleccionar la fecha del lote.", 'error', 'Fecha Requerida');
        return;
    }

    const params = new URLSearchParams({
        action: 'generar_codigo_lote',
        p_id_art_ter: activeIdArtTerminado,
        p_fecha: fechaLote,
        p_codigo_orden: activeOrdenCode
    });

    fetch(`${PRODUCTION_SERVLET_URL}?${params.toString()}`, {
        method: 'GET',
    })
    .then(handleJsonResponse)
    .then(data => {
        if (data.success && data.codigo_lote) {
            activeLotCode = data.codigo_lote;
            document.getElementById('cod_lote_generado_envasado_display').value = activeLotCode;
            document.getElementById('p_codigo_lote_envase_hidden').value = activeLotCode;

            const codLoteRefLotes = document.getElementById('cod_lote_ref_lotes');
            if (codLoteRefLotes) {
                 codLoteRefLotes.value = activeLotCode;
                 codLoteRefLotes.style.color = 'var(--accent-success)';
            }

            showSwalAlert(`Código de Lote generado: ${activeLotCode}`, 'success', 'Lote Generado');
        } else {
            showSwalAlert("Error al generar el código de lote: " + (data.message || "Detalle desconocido."), 'error', 'Error de Generación');
        }
    })
    .catch(error => {
        showSwalAlert("Error de comunicación con el servidor al generar el lote: " + error.message, 'error', 'Error de Conexión');
    });
}

function updateOrdenFields(forceClear = false) {
    if (forceClear) {
        activeOrdenCode = '';
        activeLotCode = '';
        activeIdArtTerminado = '';
        activeNombreArtTerminado = '';
    }
    const fields = [
        { suffix: 'consumo', colorSuffix: 'warning' },
        { suffix: 'envase', colorSuffix: 'primary' },
        { suffix: 'finalizar', colorSuffix: 'danger' },
        { suffix: 'lote', colorSuffix: 'success' },
    ];
    const activeOrdenDisplay = document.getElementById('active-orden-code-display');
    if (activeOrdenDisplay) {
        activeOrdenDisplay.textContent = activeOrdenCode || 'N/A';
    }
    fields.forEach(f => {
        const displayElement = document.getElementById(`display_orden_${f.suffix}`);
        const hiddenElement = document.getElementById(`hidden_orden_${f.suffix}`);
        if (displayElement) {
            displayElement.textContent = activeOrdenCode || 'Aún no hay Orden Activa';
            displayElement.className = `orden-activa-display display-${activeOrdenCode ? f.colorSuffix : 'secondary'}`;
        }
        if (hiddenElement) hiddenElement.value = activeOrdenCode;
    });

    if (activeOrdenCode) {
        // IDs específicos para la Pestaña 4 y 5
        const pIdArtTerEnvasadoHidden = document.getElementById('p_id_art_ter_envasado_hidden');
        if (pIdArtTerEnvasadoHidden) pIdArtTerEnvasadoHidden.value = activeIdArtTerminado;

        const pNombreArtTerEnvasado = document.getElementById('p_nombre_art_ter_envasado');
        if (pNombreArtTerEnvasado) pNombreArtTerEnvasado.value = activeNombreArtTerminado;

        const pIdArtTerCajaHidden = document.getElementById('p_id_art_ter_caja_hidden');
        if (pIdArtTerCajaHidden) pIdArtTerCajaHidden.value = activeIdArtTerminado;

        const pNombreArtTerCaja = document.getElementById('p_nombre_art_ter_caja');
        if (pNombreArtTerCaja) pNombreArtTerCaja.value = activeNombreArtTerminado;

        const pIdArtTerLoteHidden = document.getElementById('p_id_art_ter_lote_hidden');
        if (pIdArtTerLoteHidden) pIdArtTerLoteHidden.value = activeIdArtTerminado;

        const pNombreArtTerLote = document.getElementById('p_nombre_art_ter_lote');
        if (pNombreArtTerLote) pNombreArtTerLote.value = activeNombreArtTerminado;

        const loteCodeDisplayEmpaque = document.getElementById('lote_code_display_empaque');
        if (loteCodeDisplayEmpaque) loteCodeDisplayEmpaque.textContent = activeLotCode || 'N/A';

        const loteCodeDisplayFinalizar = document.getElementById('lote_code_display_finalizar');
        if (loteCodeDisplayFinalizar) loteCodeDisplayFinalizar.textContent = activeLotCode || 'N/A';

        const codLoteRefLotes = document.getElementById('cod_lote_ref_lotes');
        if (codLoteRefLotes) codLoteRefLotes.value = activeLotCode || 'Esperando Lote Generado';

        const codLoteGeneradoEnvasadoDisplay = document.getElementById('cod_lote_generado_envasado_display');
        if (codLoteGeneradoEnvasadoDisplay) codLoteGeneradoEnvasadoDisplay.value = activeLotCode || "Presione 'Generar'";

    } else if (forceClear) {
        const cleanFields = [
            'p_id_receta_orden_hidden',
            'p_id_art_producido_orden_hidden',
            'p_receta_cantidad_base_hidden',
            'buscar_receta_orden',
            'cant_prod_orden',
            'p_id_art_ter_envasado_hidden',
            'p_nombre_art_ter_envasado',
            'p_id_art_ter_caja_hidden',
            'p_nombre_art_ter_caja',
            'p_id_art_ter_lote_hidden',
            'p_nombre_art_ter_lote',
            'p_cant_prod_final_real',
            'cod_lote_generado_envasado_display',
            'p_codigo_lote_envase_hidden',
            'cod_lote_ref_lotes'
        ];
        cleanFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = '';
        });
        document.getElementById('insumos-orden-rows').innerHTML = '';
        document.getElementById('envase-tapa-rows').innerHTML = '';
        document.getElementById('display_order_recipe_status').textContent = 'Fórmula seleccionada. Use el botón "Cargar Insumos" para preparar el consumo.';

        const loteCodeDisplayEmpaque = document.getElementById('lote_code_display_empaque');
        if (loteCodeDisplayEmpaque) loteCodeDisplayEmpaque.textContent = 'N/A';

        const loteCodeDisplayFinalizar = document.getElementById('lote_code_display_finalizar');
        if (loteCodeDisplayFinalizar) loteCodeDisplayFinalizar.textContent = 'N/A';

        const idArtTerEmpaqueFields = document.querySelectorAll('#p_id_art_ter_empaque, #p_id_art_ter_envasado_hidden, #p_id_art_ter_caja_hidden');
        idArtTerEmpaqueFields.forEach(field => field.value = '');
    }
}

function openCommentModal(buttonElement) {
    const commentId = buttonElement.getAttribute('data-comment-id');
    const insumoName = buttonElement.getAttribute('data-insumo-nombre');
    const hiddenCommentInput = document.getElementById(commentId);
    document.getElementById('modal-input-id-ref').value = commentId;
    document.getElementById('modal-insumo-name').textContent = insumoName;
    document.getElementById('commentInput').value = hiddenCommentInput.value;
    document.getElementById('commentModal').style.display = 'flex';
}

function closeCommentModal() {
    document.getElementById('commentModal').style.display = 'none';
    document.getElementById('commentInput').value = '';
    document.getElementById('modal-input-id-ref').value = '';
    document.getElementById('modal-insumo-name').textContent = '';
}

function saveComment() {
    const commentId = document.getElementById('modal-input-id-ref').value;
    const commentValue = document.getElementById('commentInput').value;
    if (commentId) {
        document.getElementById(commentId).value = commentValue;
    }
    closeCommentModal();
}