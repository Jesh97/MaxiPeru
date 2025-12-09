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
    if (type === 'error') buttonColor = '#dc3545';
    else if (type === 'success') buttonColor = '#28a745';
    else if (type === 'warning') buttonColor = '#ffc107';

    Swal.fire({
        title: title, text: message, icon: type,
        confirmButtonText: 'Aceptar', width: '450px', padding: '1.2em', confirmButtonColor: buttonColor
    });
}

function escapeJsStringForHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/"/g, '\\"');
}

function getCurrentDateFormatted() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function handleJsonResponse(response) {
    if (!response.ok) {
        return response.json().then(error => {
            throw new Error(error.error || error.message || `Error HTTP ${response.status}`);
        }).catch(() => { throw new Error(`Error HTTP ${response.status}`); });
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) return response.json();
    return {};
}

function extractNumericCapacity(capacityString) {
    if (typeof capacityString !== 'string') return { value: 1.0, unit: 'Litro' };
    const numericMatch = capacityString.match(/^(\d+(\.\d+)?)/);
    const numericValue = numericMatch ? parseFloat(numericMatch[1]) : 1.0;
    const unitMatch = capacityString.match(/[a-zA-Z]+/);
    let unitValue = unitMatch ? unitMatch[0] : 'Litro';

    if (unitValue.toLowerCase().startsWith('lit')) unitValue = 'Litro';
    else if (unitValue.toLowerCase().startsWith('kg')) unitValue = 'Kg';
    else if (unitValue.toLowerCase().startsWith('ml')) unitValue = 'ml';
    else if (unitValue.toLowerCase().startsWith('gr')) unitValue = 'gr';

    return { value: numericValue, unit: unitValue };
}

function formatTeorica(num) {
    if (typeof num !== 'number') return num;
    return num.toFixed(8).replace(/\.?0+$/, '').replace('.', ',');
}

function formatQuantityDisplay(qty, unitName) {
    let formattedQty = qty.toFixed(4).replace(/\.?0+$/, '').replace('.', ',');
    let abbreviatedUnit = unitName.toUpperCase();
    if (abbreviatedUnit.includes('KILOGRAMO') || abbreviatedUnit.includes('KG')) abbreviatedUnit = 'kg';
    else if (abbreviatedUnit.includes('LITRO') || abbreviatedUnit.includes('L')) abbreviatedUnit = 'L';
    else if (abbreviatedUnit.includes('MILILITRO') || abbreviatedUnit.includes('ML')) abbreviatedUnit = 'ml';
    else if (abbreviatedUnit.includes('GRAMO') || abbreviatedUnit.includes('GR')) abbreviatedUnit = 'gr';
    else abbreviatedUnit = unitName;
    return `${formattedQty} ${abbreviatedUnit}`;
}

function adjustQuantity(inputId, delta) {
    const input = document.getElementById(inputId);
    let currentValue = parseFloat(input.value) || 0;
    let step = parseFloat(input.step) || 1;
    let newValue = currentValue + (delta * step);
    if (newValue < 0) newValue = 0;

    input.value = newValue.toFixed(4).replace(/\.?0+$/, '');
    if (input.name === 'p_cant_a_empacar_final[]') {
        updateTotalUnitsReference();
    }
}

$(document).ready(function() {
    const fechaIniInput = document.getElementById('fecha_ini');
    if (fechaIniInput && !fechaIniInput.value) fechaIniInput.value = getCurrentDateFormatted();

    $("#buscar_art_ter").autocomplete({
        source: function(request, response) {
            $.ajax({
                url: PRODUCTION_SERVLET_URL, type: "GET", dataType: "json",
                data: { action: "buscar_articulos_terminados", busqueda: request.term },

                success: function(data) {
                    response(data.map(item => ({
                        id: item.id, id_maestro: item.id_producto_maestro,
                        value: item.nombre_generico || item.descripcion,

                        label: (item.codigo || '') + ' - ' + (item.nombre_generico),
                        id_unidad: item.id_unidad, unidad_nombre: item.unidad_nombre
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
                url: PRODUCTION_SERVLET_URL, type: "GET", dataType: "json",
                data: { action: "buscar_articulos_insumos", busqueda: request.term },
                success: function(data) {

                    response(data.map(item => ({
                        id: item.id, value: item.descripcion,
                        label: (item.codigo || '') + ' - ' + (item.descripcion || ''),

                        codigo: item.codigo, id_unidad: item.id_unidad,
                        unidad_nombre: item.unidad_nombre, density: item.densidad || '1.00000000'
                    })));
                }
            });
        },
        minLength: 2,

        select: function(event, ui) {
            const selectedItem = ui.item;
            document.getElementById('buscar_insumo').value = selectedItem.value;
            addRow('insumo-rows', selectedItem.codigo, selectedItem.value, '1.000', selectedItem.unidad_nombre, selectedItem.density, selectedItem.id, selectedItem.id_unidad);
            document.getElementById('buscar_insumo').value = '';
            return false;
        }
    });
    $("#buscar_receta_orden").autocomplete({
        source: function(request, response) {
            $.ajax({
                url: PRODUCTION_SERVLET_URL, type: "GET", dataType: "json",
                data: { action: "obtener_receta_por_nombre_generico", nombre_generico: request.term },
                success: function(data) {

                    response(data.map(item => ({
                        id_receta: item.id_receta, id_art_ter: item.id_producto_maestro,
                        nombre_art_ter: item.nombre_generico, receta_cantidad_base: item.receta_cantidad_base,
                        value: item.nombre_generico, label: 'Receta ' + item.id_receta + ' - ' + item.nombre_generico,

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
            document.getElementById('display_order_recipe_status').textContent = 'Fórmula seleccionada. Use el botón "Visualizar Insumos" para preparar el consumo.';
            document.getElementById('insumos-orden-rows').innerHTML = '';

            activeIdReceta = ui.item.id_receta;
            activeNombreReceta = ui.item.nombre_art_ter;
            activeCantBaseReceta = parseFloat(ui.item.receta_cantidad_base) || 0;
            activeUnidadBaseReceta = ui.item.unidad_nombre;
            return false;
        }
    });
    $("#buscar_envase_principal_multiple").autocomplete({
        source: getPackagingAutocompleteSource(1), minLength: 2,
        select: function(event, ui) {
            addRowEnvaseTapa(ui.item.id, ui.item.label, `${ui.item.capacidad} ${ui.item.unidad_capacidad}`);
            document.getElementById('buscar_envase_principal_multiple').value = '';
            return false;
        }
    });
    $("#buscar_tapa_principal").autocomplete({
        source: getPackagingAutocompleteSource(2), minLength: 2,
        select: function(event, ui) {
            document.getElementById('buscar_tapa_principal').value = ui.item.label;
            document.getElementById('p_id_tapa_seleccionada_hidden').value = ui.item.id;
            document.getElementById('selected_tapa_display').textContent = `Tapa/Sello Seleccionado: ${ui.item.label}`;
            return false;
        }
    });
    $("#buscar_etiqueta_principal").autocomplete({
        source: getPackagingAutocompleteSource(2), minLength: 2,
        select: function(event, ui) {
            document.getElementById('buscar_etiqueta_principal').value = ui.item.label;
            document.getElementById('p_id_etiqueta_principal_hidden').value = ui.item.id;
            return false;
        }
    });
    $("#buscar_empaque_secundario").autocomplete({
        source: getPackagingAutocompleteSource(3), minLength: 2,
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
        updateOrdenFields();
    }

    document.getElementById('edit-detalle-form').addEventListener('submit', submitEditDetalleReceta);
    $('#saveCommentBtn').on('click', saveComment);
    $('.close-button').on('click', function(event) {
        if (event.target.closest('#commentModal')) closeCommentModal();
        else if (event.target.closest('#view-recipe-modal')) closeRecipeDetailModal();
        else if (event.target.closest('#edit-detalle-modal')) closeEditDetalleModal();
    });
    $('#commentModal').on('click', function(event) {
        if (event.target.id === 'commentModal') closeCommentModal();
    });
});
function getPackagingAutocompleteSource(tipoComponente) {
    return function(request, response) {
        $.ajax({
            url: PRODUCTION_SERVLET_URL, type: "GET", dataType: "json",
            data: { action: "buscar_articulos_embalado_y_embalaje", busqueda: request.term, p_tipo_componente: tipoComponente },
            success: function(data) {
                response(data.map(item => ({
                    id: item.id, value: item.descripcion,
                    label: (item.codigo || '') + ' - ' + (item.descripcion || ''),
                    capacidad: item.capacidad || 'N/A', unidad_capacidad: item.unidad_capacidad || '',
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

function closePasswordModal() {document.getElementById('password-modal-overlay').style.display = 'none';}

function checkPasswordAndOpenTab() {
    const passwordInput = document.getElementById('password-input');
    const tabName = document.getElementById('protected-tab-name').value;
    if (passwordInput.value === ACCESS_PASSWORD) {
        closePasswordModal();
        openTab(null, tabName);
        if (tabName === 'ListarOrdenes') loadOrdenesList();
    } else {
        document.getElementById('password-error').textContent = 'Contraseña incorrecta.';
    }
}

function openProtectedTab(evt, tabName, colorSuffix) { showPasswordModal(tabName, colorSuffix); }

function openTab(evt, tabName) {
    const tabContent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
        tabContent[i].classList.remove('active');
    }
    const tabButtons = document.getElementsByClassName("tab-button");
    for (let i = 0; i < tabButtons.length; i++) tabButtons[i].classList.remove('active');
    document.getElementById(tabName).style.display = "block";
    document.getElementById(tabName).classList.add('active');
    if (evt) evt.currentTarget.classList.add('active');
    updateOrdenFields();
}

function deleteRow(btn) { btn.parentNode.parentNode.remove();}
function addRowFromSearch() { showSwalAlert("La adición de insumos es automática al seleccionar de la lista.", 'info');}

function addRow(tableId, code, name, qty, unitName, density, insumoId, unitId){
    const tableBody = document.getElementById(tableId);
    const newRow = tableBody.insertRow();
    const inputId = `qty-receta-${Date.now()}`;
    newRow.innerHTML = `
        <td><input type="text" name="p_codigo_insumo[]" value="${code}" readonly class="readonly-field" placeholder="CÓDIGO"></td>
        <td><input type="text" name="p_nombre_art_insumo[]" value="${name}" required placeholder="Nombre Insumo"></td>
        <td class="quantity-control-receta">
            <input type="number" id="${inputId}" name="p_cant_req[]" value="${qty}" step="0.00001" required placeholder="Cantidad">
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
        <td data-tapa-status="unassigned" id="tapassello_col_${rowId}">
            <div class="tapa-display-container">
                <span id="tapa_assigned_display_${rowId}"
                class="tapa-status-tag tag-unassigned">TAPA: N/A</span>
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
    const selectedId = document.getElementById('p_id_tapa_seleccionada_hidden').value;
    const selectedLabelText = document.getElementById('selected_tapa_display').textContent;
    if (!selectedId) {
        showSwalAlert(`Primero debe buscar y seleccionar una Tapa/Sello en el Paso 4.1.`, 'error');
        return;
    }
    const assignedName = selectedLabelText.replace(`Tapa/Sello Seleccionado: `, '');
    let
    displayElementId, idHiddenId, nombreHiddenId, assignmentName;

    if (capType === 'tapa') {
        displayElementId = `tapa_assigned_display_${rowId}`;
        idHiddenId = `tapa_id_hidden_${rowId}`;
        nombreHiddenId = `tapa_nombre_hidden_${rowId}`;
        assignmentName = 'Tapa';
    } else {
        displayElementId = `contratapa_assigned_display_${rowId}`;
        idHiddenId = `contratapa_id_hidden_${rowId}`;
        nombreHiddenId = `contratapa_nombre_hidden_${rowId}`;
        assignmentName = 'Contratapa';
    }
    const assignedDisplayElement = document.getElementById(displayElementId);
    document.getElementById(idHiddenId).value = selectedId;
    document.getElementById(nombreHiddenId).value = assignedName;
    assignedDisplayElement.textContent = `${assignmentName.toUpperCase()}: ${assignedName}`;
    assignedDisplayElement.style.backgroundColor = 'var(--accent-success)';
    assignedDisplayElement.style.color = 'white';
}

function removeAssignedTapa(rowId, capType) {
    if (capType !== 'contratapa') return;
    document.getElementById(`contratapa_assigned_display_${rowId}`).textContent = 'CONTRATAPA: N/A (Opcional)';
    document.getElementById(`contratapa_assigned_display_${rowId}`).style.backgroundColor = 'var(--accent-danger)';
    document.getElementById(`contratapa_id_hidden_${rowId}`).value = '';
    document.getElementById(`contratapa_nombre_hidden_${rowId}`).value = '';
}

function openAddInsumoModal(idReceta, nombreReceta, cantBase, unidadBase) {
    document.getElementById('add_p_id_receta').value = idReceta;
    document.getElementById('add-insumo-recipe-title').textContent = `${nombreReceta} (Base: ${cantBase.toFixed(2)} ${unidadBase})`;
    document.getElementById('add-insumo-info').textContent = `Cantidad base de la receta: ${cantBase.toFixed(2)} ${unidadBase}`;
    $("#buscar_insumo_add").autocomplete({
        source: function(request, response) {
            $.ajax({
                url: PRODUCTION_SERVLET_URL, type: "GET", dataType: "json",
                data: { action: "buscar_articulos_insumos", busqueda: request.term },
                success: function(data) {

                    response(data.map(item => ({
                        id: item.id, value: item.descripcion, label: (item.codigo || '') + ' - ' + (item.descripcion || ''),
                        codigo: item.codigo, id_unidad: item.id_unidad, unidad_nombre: item.unidad_nombre, densidad: item.densidad || '1.00000000'
                    })));

                }
            });
        },
        minLength: 2,
        select: function(event, ui) {
            document.getElementById('buscar_insumo_add').value = ui.item.value;
            document.getElementById('add_p_id_articulo').value = ui.item.id;
            document.getElementById('add_p_id_unidad').value = ui.item.id_unidad;
            document.getElementById('add_p_densidad').value = ui.item.densidad;
            document.getElementById('add_p_nombre_unidad').value = ui.item.unidad_nombre;
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
    const idReceta = document.getElementById('add_p_id_receta').value;
    const fullInfo = document.getElementById('add-insumo-recipe-title').textContent;
    const nombreReceta = (fullInfo.match(/^(.*) \(Base:/) || [])[1] || '';
    const cantBaseMatch = fullInfo.match(/Base: ([\d.]+)\s*([a-zA-Z]+)/);
    const cantBase = cantBaseMatch ? parseFloat(cantBaseMatch[1]) : 1.0;
    const unidadBase = cantBaseMatch ? cantBaseMatch[2].trim() : 'Unidad';

    if (!document.getElementById('add_p_id_articulo').value) {
        showSwalAlert("Debe seleccionar un insumo válido.", 'error'); return;}
    const params = new URLSearchParams(new FormData(event.target));
    params.set('action', 'agregar_detalle_receta');

    fetch(PRODUCTION_SERVLET_URL, { method: 'POST', body: params })
    .then(handleJsonResponse)

    .then(data => {
        if (data.success) {
            showSwalAlert("Nuevo insumo agregado.", 'success');
            closeAddInsumoModal();
            loadRecetaDetalle(idReceta, nombreReceta, cantBase, unidadBase);
        } else { showSwalAlert("Error al agregar insumo: " + data.message, 'error'); }
    });
}

function saveFullRecipe(event) {
    event.preventDefault();
    const artTerId = $('input[name="p_id_art_ter_hidden"]').val();
    const rows = document.getElementById('insumo-rows').querySelectorAll('tr');

    if (!artTerId) { showSwalAlert("Debe seleccionar un Producto Terminado.", 'error'); return;
    }
    if (rows.length === 0) { showSwalAlert("Agregue al menos un insumo.", 'error'); return;
    }

    const params = new URLSearchParams(new FormData(event.target));
    params.set('action', 'crear_receta_y_componentes');
    params.set('p_id_art_ter_hidden', artTerId);
    params.set('p_nombre_art_ter_receta', document.getElementById('buscar_art_ter').value);
    params.set('p_nombre_uni_prod', 'Litro');
    fetch(PRODUCTION_SERVLET_URL, { method: 'POST', body: params })
    .then(handleJsonResponse)
    .then(data => {
        if (data.success) {
            showSwalAlert("Fórmula Guardada. ID: " + data.id_receta, 'success');
            document.getElementById('buscar_art_ter').value = '';
            $('input[name="p_id_art_ter_hidden"]').val('');
            document.getElementById('insumo-rows').innerHTML = '';
        } else { showSwalAlert("Error al guardar: " +
        data.message, 'error'); }
    });
}

function calculateTotalConsumption(inputElement, theoreticalQty, unitName) {
    const row = inputElement.closest('tr');
    const operator = row.querySelector('select[name="p_desviacion_operador[]"]').value;
    const deviation = parseFloat(inputElement.value) || 0;
    const theoretical = parseFloat(theoreticalQty);

    let consumedQty = theoretical;

    if (operator === '+') {
        consumedQty += deviation;
    } else if (operator === '-') {
        consumedQty -= deviation;
    }

    const consumedInput = row.querySelector('input[name="p_cantidad_consumida_final[]"]');

    let formattedQty = consumedQty.toFixed(4).replace(/\.?0+$/, '').replace('.', ',');

    if (consumedInput) {
        consumedInput.value = formattedQty;
    }
}

function loadInsumosForRecipe() {
    const idReceta = document.getElementById('p_id_receta_orden_hidden').value;
    const cantProdStr = document.getElementById('cant_prod_orden').value;
    const cantBaseRecetaStr = document.getElementById('p_receta_cantidad_base_hidden').value;

    if (!idReceta) { showSwalAlert("Seleccione una Receta válida.", 'error'); return;
    }
    if (!cantProdStr || parseFloat(cantProdStr) <= 0) { showSwalAlert("Cantidad a Producir inválida.", 'error'); return;
    }

    const cantProdOrder = parseFloat(cantProdStr);
    const cantBaseReceta = parseFloat(cantBaseRecetaStr);
    const scaleFactor = cantProdOrder / cantBaseReceta;
    const tableBody = document.getElementById('insumos-orden-rows');
    const statusDisplay = document.getElementById('display_order_recipe_status');
    tableBody.innerHTML = '';
    statusDisplay.textContent = `Preparando listado de insumos para: ${activeNombreReceta}...`;
    let controlsContainer = document.getElementById('orden-controls-container');
    if (!controlsContainer) {
        controlsContainer = document.createElement('div');
        controlsContainer.id = 'orden-controls-container';
        controlsContainer.className = 'mt-3 text-center';
        document.getElementById('insumos-orden-rows').parentElement.after(controlsContainer);
    }
    controlsContainer.innerHTML = '';

    insumosCargadosPreviamente = true;
    fetch(`${PRODUCTION_SERVLET_URL}?action=obtener_insumos_receta&id_receta=${idReceta}`)
    .then(handleJsonResponse)
    .then(data => {
        if (data.length > 0) {
            data.forEach(insumo => {
                const baseReq = parseFloat(insumo.cantidad_requerida);
                const totalReq = baseReq * scaleFactor;
                const formattedTeorica = formatQuantityDisplay(totalReq, insumo.unidad_nombre);


                const newRow = tableBody.insertRow();
                // MODIFICACIÓN: Mostrar solo Código, Cantidad Teórica, Desviación y Cantidad Consumida
                newRow.innerHTML = `
                    <td>${insumo.codigo}</td>
                    <td class="text-right" style="font-weight: bold; color: var(--accent-primary);">${formattedTeorica}</td>
                    <td class="deviation-control">
                        <select name="p_desviacion_operador[]" class="operator-select">
                            <option value="+">+</option>
                            <option value="-">-</option>
                        </select>
                        <input type="number" name="p_desviacion_cantidad[]" value="0.0000" step="0.0001" min="0"
                               oninput="calculateTotalConsumption(this, ${totalReq}, '${insumo.unidad_nombre}')" style="width: 70px;">
                    </td>
                    <td class="text-right">
                        <input type="text" name="p_cantidad_consumida_final[]" value="${formattedTeorica.replace(/[^0-9.,]/g, '')}" readonly class="readonly-consumption">
                        <input type="hidden" name="p_cantidad_teorica[]" value="${totalReq}">
                        <input type="hidden" name="p_id_art_insumo[]" value="${insumo.id_articulo}">
                        <input type="hidden" name="p_id_unidad_insumo[]" value="${insumo.id_unidad}">
                    </td>
                    <td class="text-center"><span class="badge badge-secondary" style="background-color: #6c757d; color: white; padding: 5px;">Pendiente de Proceso</span></td>
                `;
            });

            if (activeOrdenCode) {
                 controlsContainer.innerHTML = `

                    <button type="button" class="btn btn-success btn-lg btn-block" onclick="procesarConsumoAutomatico('${activeOrdenCode}')" style="width: 100%;
                    padding: 15px; font-size: 1.2rem;">
                        <i class="fas fa-cogs"></i> PROCESAR CONSUMO DE MATERIA PRIMA (AUTOMÁTICO)
                    </button>
                `;
                statusDisplay.textContent = `Lista cargada. Presione el botón verde para descontar el stock automáticamente.`;

            } else {
                 statusDisplay.textContent = `Lista preliminar. Cree la Orden primero para habilitar el consumo.`;
            }

        } else {
            insumosCargadosPreviamente = false;
            statusDisplay.textContent = `No se encontraron insumos para esta receta.`;

        }
    })
    .catch(error => {
        insumosCargadosPreviamente = false;
        statusDisplay.textContent = `Error al cargar insumos: ${error.message}.`;
    });
}

function procesarConsumoAutomatico(idOrden) {
    if(!idOrden) { showSwalAlert("No hay orden activa para procesar.", "error"); return; }

    Swal.fire({
        title: '¿Confirmar Consumo Automático?',
        text: "Se descontará el stock de inventario (Lotes FIFO y General).",

        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, Procesar Ahora'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({title: 'Procesando...', text: 'Descontando inventario...', allowOutsideClick: false, didOpen: () => { Swal.showLoading() }});
            const params = new URLSearchParams();
            params.append('action', 'ejecutar_consumo');
            params.append('p_id_orden', idOrden);

            fetch(PRODUCTION_SERVLET_URL, { method: 'POST', body: params })
            .then(handleJsonResponse)
            .then(data => {
                if (data.success) {
                    Swal.fire('¡Proceso Completado!', data.message, 'success');

                    const rows = document.getElementById('insumos-orden-rows').querySelectorAll('tr');
                    rows.forEach(row => {
                        const badge = row.querySelector('.badge');
                        if(badge) {

                            badge.textContent = 'Consumido';
                            badge.style.backgroundColor = '#28a745';
                        }
                    });

                    const btnContainer = document.getElementById('orden-controls-container');
                    if(btnContainer) btnContainer.innerHTML = '<div class="alert alert-success">Consumo Registrado Correctamente</div>';

                } else {
                    Swal.fire('Error en el Proceso', data.message, 'error');
                }
            })
            .catch(err => {
                 Swal.fire('Error de Conexión', err.message, 'error');
            });
        }
    });
}

function saveOrden(event) {
    event.preventDefault();
    const idReceta = document.getElementById('p_id_receta_orden_hidden').value;
    if (!idReceta || !insumosCargadosPreviamente) {
        showSwalAlert("Debe seleccionar una Receta y Cargar la lista preliminar primero.", 'error');
        return;
    }

    const params = new URLSearchParams(new FormData(event.target));
    let cant = document.getElementById('cant_prod_orden').value.replace(',', '.');
    let real = document.getElementById('p_cant_prod_final_real').value.replace(',', '.');
    params.set('p_cant_prod_orden', cant);
    params.set('p_cant_prod_final_real', real);
    params.set('action', 'crear_orden');
    fetch(PRODUCTION_SERVLET_URL, { method: 'POST', body: params })
    .then(handleJsonResponse)
    .then(data => {
        if (data.success && data.id_orden) {
            activeOrdenCode = data.id_orden;
            activeIdArtTerminado = data.id_articulo_terminado;
            activeNombreArtTerminado = data.nombre_articulo_terminado;
            activeLotCode = '';

            updateOrdenFields();

            showSwalAlert(`Orden Creada: ${activeOrdenCode}.`, 'success');

            loadInsumosForRecipe();

        } else { showSwalAlert("Error al crear la orden: " + data.message, 'error'); }
    });
}

function calculateLooseContainers() {
    const finalProducedQty = parseFloat(document.getElementById('cant_producida_final_envasado').value) || 0;
    const rows = document.getElementById('envase-tapa-rows').querySelectorAll('tr');
    let totalContainersCapacity = 0;
    rows.forEach(row => {
        const capacityValue = parseFloat(row.querySelector('input[name="p_capacidad_numeric[]"]').value) || 0;
        const qtyContainers = parseInt(row.querySelector('input[name="p_cant_a_empacar_final[]"]').value) || 0;
        const unit = row.querySelector('select[name="p_capacidad_unidad[]"]').value.toLowerCase();

        let capacityInLitros = capacityValue;
        if (unit === 'ml') capacityInLitros = capacityValue / 1000;

        totalContainersCapacity += capacityInLitros * qtyContainers;
    });
    const envasesSueltos = Math.ceil(finalProducedQty * 1000) - Math.ceil(totalContainersCapacity * 1000);

    const looseInput = document.getElementById('envases_sueltos_display');
    const looseDisplay = document.getElementById('envases_sueltos_group');
    if (envasesSueltos > 0) {
        looseInput.value = envasesSueltos.toFixed(0);
        document.getElementById('p_envases_sueltos_hidden').value = envasesSueltos.toFixed(0);
        looseDisplay.style.display = 'block';
    } else {
        looseInput.value = 0;
        document.getElementById('p_envases_sueltos_hidden').value = 0;
        looseDisplay.style.display = 'none';
    }
    document.getElementById('cant_producida_total_litros').value = finalProducedQty.toFixed(2);
    document.getElementById('cant_total_empacada').value = totalContainersCapacity.toFixed(2);
    document.getElementById('merma_cantidad').value = (finalProducedQty - totalContainersCapacity).toFixed(2);
}

function updateTotalUnitsReference() {
    const rows = document.getElementById('envase-tapa-rows').querySelectorAll('tr');
    let totalUnits = 0;
    rows.forEach(row => { totalUnits += parseInt(row.querySelector('input[name="p_cant_a_empacar_final[]"]').value) || 0; });
    const display = document.getElementById('total-units-reference');
    if (display) display.textContent = totalUnits;
}

function submitPackagingStep(event, stepAction, message) {
    event.preventDefault();
    const params = new URLSearchParams(new FormData(event.target));
    params.set('action', stepAction);
    fetch(PRODUCTION_SERVLET_URL, { method: 'POST', body: params })
    .then(handleJsonResponse)
    .then(data => {
        if (data.success) showSwalAlert(message, 'success');
        else showSwalAlert(`Error: ${data.message}`, 'error');
    });
}

function submitMerma(event) {
    event.preventDefault();
    if (!activeOrdenCode) { showSwalAlert("No hay orden activa.", 'error'); return;
    }

    document.getElementById('hidden_orden_merma_submit').value = activeOrdenCode;
    const params = new URLSearchParams({
        action: 'registrar_merma_y_cierre_empaque',
        p_codigo_orden: activeOrdenCode,
        p_merma_cantidad: document.getElementById('merma_cantidad').value,
        p_envases_sueltos: document.getElementById('p_envases_sueltos_hidden').value
    });
    fetch(PRODUCTION_SERVLET_URL, { method: 'POST', body: params })
    .then(handleJsonResponse)
    .then(data => {
        if (data.success) showSwalAlert("Empaque cerrado correctamente.", 'success');
        else showSwalAlert("Error: " + data.message, 'error');
    });
}

function submitFinalLotRegistration(event) {
    event.preventDefault();
    if (!activeOrdenCode || !activeLotCode) { showSwalAlert("Falta Orden o Lote.", 'error'); return;
    }

    document.getElementById('hidden_orden_lote_submit').value = activeOrdenCode;
    document.getElementById('p_id_art_ter_lote_hidden').value = activeIdArtTerminado;
    document.getElementById('p_cod_lote_lote_hidden').value = activeLotCode;

    const params = new URLSearchParams(new FormData(event.target));
    params.set('action', 'registrar_lote_final');

    fetch(PRODUCTION_SERVLET_URL, { method: 'POST', body: params })
    .then(handleJsonResponse)
    .then(data => {
        if (data.success) {
            showSwalAlert("Lote registrado. Orden Finalizada.", 'success');
            updateOrdenFields(true);
        } else { showSwalAlert("Error: " + data.message, 'error'); }
    });
}

function generateLotCode(event) {
    event.preventDefault();
    if (!activeOrdenCode) { showSwalAlert("Requiere Orden Activa.", 'error'); return;
    }

    const params = new URLSearchParams({
        action: 'generar_codigo_lote',
        id_orden: activeOrdenCode
    });
    fetch(`${PRODUCTION_SERVLET_URL}?${params.toString()}`, { method: 'GET' })
    .then(handleJsonResponse)
    .then(data => {
        if (data.success) {
            activeLotCode = data.codigo_lote;
            const display = document.getElementById('cod_lote_generado_envasado_display');
            if(display) display.value = activeLotCode;

            const hidden = document.getElementById('p_codigo_lote_envase_hidden');
            if(hidden) hidden.value = activeLotCode;

            const refDisplay = document.getElementById('cod_lote_ref_lotes');
            if(refDisplay) refDisplay.value = activeLotCode;

            showSwalAlert(`Lote generado: ${activeLotCode}`, 'success');
        } else {
            showSwalAlert("Error: " + data.message, 'error');
        }
    });
}

function updateOrdenFields(forceClear = false) {
    if (forceClear) {
        activeOrdenCode = '';
        activeLotCode = ''; activeIdArtTerminado = ''; activeNombreArtTerminado = '';
    }
    const fields = [ { s: 'consumo', c: 'warning' }, { s: 'envase', c: 'primary' }, { s: 'finalizar', c: 'danger' }, { s: 'lote', c: 'success' } ];
    const mainDisplay = document.getElementById('active-orden-code-display');
    if (mainDisplay) mainDisplay.textContent = activeOrdenCode || 'N/A';
    fields.forEach(f => {
        const d = document.getElementById(`display_orden_${f.s}`);
        const h = document.getElementById(`hidden_orden_${f.s}`);
        if (d) {
            d.textContent = activeOrdenCode || 'Sin Orden';
            d.className = `orden-activa-display display-${activeOrdenCode ? f.c : 'secondary'}`;
        }
        if (h) h.value = activeOrdenCode;
    });
    if (activeOrdenCode) {
        const fills = ['p_id_art_ter_envasado_hidden', 'p_id_art_ter_caja_hidden', 'p_id_art_ter_lote_hidden'];
        fills.forEach(id => { const el = document.getElementById(id); if(el) el.value = activeIdArtTerminado; });

        const nameFills = ['producto_a_envasar', 'p_nombre_art_ter_caja', 'p_nombre_art_ter_lote'];
        nameFills.forEach(id => { const el = document.getElementById(id); if(el) el.value = activeNombreArtTerminado; });

        const lotDisplays = ['lote_code_display_empaque', 'lote_code_display_finalizar'];
        lotDisplays.forEach(id => { const el = document.getElementById(id); if(el) el.textContent = activeLotCode || 'N/A'; });
    } else if (forceClear) {
        document.getElementById('insumos-orden-rows').innerHTML = '';
        document.getElementById('envase-tapa-rows').innerHTML = '';
        const controls = document.getElementById('orden-controls-container');
        if(controls) controls.innerHTML = '';

        const inputsToClear = ['p_id_receta_orden_hidden', 'buscar_receta_orden', 'cant_prod_orden', 'cant_envases_final'];
        inputsToClear.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    }
}

function loadRecetasList() {
    const tableBody = document.getElementById('recetas-list-rows');
    tableBody.innerHTML = '<tr><td colspan="5"><i class="fas fa-spinner fa-spin"></i> Cargando...</td></tr>';
    fetch(`${PRODUCTION_SERVLET_URL}?action=listar_recetas`)
    .then(r => r.json())
    .then(data => {
        tableBody.innerHTML = '';
        const list = Array.isArray(data) ? data : (data.recetas || []);
        if (list.length === 0) tableBody.innerHTML = '<tr><td colspan="5">Sin recetas.</td></tr>';

        const unique = new Map();
        list.forEach(r => unique.set(r.id_receta, r));

        unique.forEach(receta => {

            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${receta.nombre_generico}</td>
                <td>${parseFloat(receta.receta_cantidad_base).toFixed(2)}</td>
                <td>${receta.unidad_producir_nombre}</td>
                <td>${receta.fecha_creacion}</td>
                <td>
                    <button class="btn-submit btn-compact btn-info" onclick="loadRecetaDetalle(${receta.id_receta}, '${escapeJsStringForHtml(receta.nombre_generico)}', ${receta.receta_cantidad_base}, '${receta.unidad_producir_nombre}')">Ver</button>
                    <button class="btn-submit btn-compact btn-danger" onclick="confirmDeactivateReceta(${receta.id_receta}, '${escapeJsStringForHtml(receta.nombre_generico)}')">Desactivar</button>
                </td>
            `;
        });
    }).catch(e => tableBody.innerHTML = `<tr><td colspan="5">Error: ${e.message}</td></tr>`);
}

function loadRecetaDetalle(id, nombre, base, unidad) {
    document.getElementById('view-recipe-modal').style.display = 'flex';
    document.getElementById('recipe-detail-info').textContent = `${nombre} (Base: ${base} ${unidad})`;
    const tbody = document.getElementById('recipe-detail-rows');
    tbody.innerHTML = 'Loading...';

    const btn = document.getElementById('add-insumo-to-recipe-btn');
    if(btn) btn.setAttribute('onclick', `openAddInsumoModal(${id}, '${escapeJsStringForHtml(nombre)}', ${base}, '${unidad}')`);

    fetch(`${PRODUCTION_SERVLET_URL}?action=obtener_insumos_receta&id_receta=${id}`)
    .then(handleJsonResponse).then(data => {
        tbody.innerHTML = '';
        data.forEach(item => {
            tbody.insertRow().innerHTML = `
                <td>${item.codigo}</td><td>${item.nombre_articulo}</td>
                <td>${formatQuantityDisplay(parseFloat(item.cantidad_requerida), item.unidad_nombre)}</td>
                <td>
                    <button class="btn-submit btn-compact btn-warning" onclick="loadInsumoDetalleForEdit(${item.id_detalle_receta}, ${id}, '${nombre}', ${base}, '${unidad}')">Editar</button>
                   <button class="btn-submit btn-compact btn-danger" onclick="removeDetalleReceta(${item.id_detalle_receta}, ${id}, '${nombre}', ${base}, '${unidad}')">Quitar</button>
                </td>`;
        });
    });
}
function closeRecipeDetailModal() { document.getElementById('view-recipe-modal').style.display = 'none'; }

function loadInsumoDetalleForEdit(idDetalle, idReceta, nombreReceta, cantBase, unidadBase) {
    document.getElementById('edit-detalle-modal').style.display = 'flex';
    document.getElementById('edit_p_id_detalle_receta').value = idDetalle;
    document.getElementById('edit_p_id_receta').value = idReceta;
}
function closeEditDetalleModal() { document.getElementById('edit-detalle-modal').style.display = 'none'; }
function submitEditDetalleReceta(e) { e.preventDefault();}
function removeDetalleReceta(idDetalle, idReceta, nombre, base, unit) { }
function confirmDeactivateReceta(id) { }

function loadOrdenesList() {
    const tbody = document.getElementById('ordenes-list-rows');
    tbody.innerHTML = 'Loading...';
    fetch(`${PRODUCTION_SERVLET_URL}?action=obtener_ordenes_activas`).then(r=>r.json()).then(data => {
        tbody.innerHTML = '';
        data.forEach(o => {
            tbody.insertRow().innerHTML = `
                <td>${o.codigo_orden}</td><td>${o.nombre_articulo_terminado}</td>
                <td>${parseFloat(o.cantidad_programada).toFixed(2)}</td><td>${o.estado_produccion}</td><td>${o.codigo_lote||'N/A'}</td>
                <td><button class="btn-submit btn-compact btn-info" onclick="loadDetalleOrden('${o.codigo_orden}', '${escapeJsStringForHtml(o.nombre_articulo_terminado)}', '${o.estado_produccion}')">Ver</button></td>

             `;
        });
    });
}
function loadDetalleOrden(code, name, status) {
    document.getElementById('view-orden-modal').style.display = 'flex';
    document.getElementById('view-orden-modal-info').textContent = `${code} - ${name} (${status})`;
    const tbody = document.getElementById('orden-detalle-insumos-body');
    tbody.innerHTML = 'Loading...';
    fetch(`${PRODUCTION_SERVLET_URL}?action=obtener_consumos_orden&p_codigo_orden=${code}`).then(r=>r.json()).then(data => {
        tbody.innerHTML = '';
        if(data.length === 0) tbody.innerHTML = '<tr><td colspan="5">Sin consumos registrados aún.</td></tr>';
        data.forEach(c => {
            tbody.insertRow().innerHTML = `
                <td>${c.codigo_articulo}</td><td>${c.nombre_articulo}</td>
                <td>${parseFloat(c.cantidad_teorica).toFixed(4)}</td>

                <td>${parseFloat(c.cantidad_consumida).toFixed(4)}</td>
                <td>${c.fecha_registro}</td>
            `;
        });
    });
}
function closeOrdenDetailModal() { document.getElementById('view-orden-modal').style.display = 'none'; }

function openCommentModal(btn) {}
function closeCommentModal() { document.getElementById('commentModal').style.display = 'none'; }
function saveComment() { closeCommentModal(); }