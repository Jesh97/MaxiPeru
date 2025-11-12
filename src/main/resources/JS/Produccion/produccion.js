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
                success:
                function(data) {
                    response(data.map(item => ({
                        id: item.id,
                        value: item.nombre_generico || item.descripcion,
                        label:
                        (item.codigo || '') + ' - ' + (item.nombre_generico),
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
                data:
                {
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
                        label: 'Receta ' + item.id_receta + ' - ' + item.nombre_generico
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

function showPasswordModal(tabName) {
    document.getElementById('password-modal-overlay').style.display = 'flex';
    document.getElementById('protected-tab-name').value = tabName;
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
        if (tabName === 'ListarRecetas') {
            loadRecetasList();
        }
    } else {
        errorDisplay.textContent = 'Contraseña incorrecta. Intente de nuevo.';
    }
}

function openProtectedTab(evt, tabName) {
    showPasswordModal(tabName);
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
    newRow.innerHTML = `
        <td><input type="text" name="p_codigo_insumo[]" value="${code}" readonly class="readonly-field" placeholder="CÓDIGO"></td>
        <td><input type="text" name="p_nombre_art_insumo[]" value="${name}" required placeholder="Nombre Insumo"></td>
        <td><input type="number" name="p_cant_req[]" value="${qty}" step="0.0000001" required placeholder="Cantidad"></td>
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
        <td>
            <input type="number" name="p_cant_a_empacar_final[]" value="1" min="1" step="1" required oninput="updateTotalUnitsReference()" style="width: 100%;">
        </td>
        <td data-tapa-status="unassigned">
            <span id="tapa_assigned_display_${rowId}" class="readonly-field" style="display: block; width: 100%; height: 100%; background-color: #fce4e4; color: var(--accent-danger);">ASIGNAR TAPA</span>
            <input type="hidden" name="p_id_componente_cap[]" id="tapa_id_hidden_${rowId}" required value="">
            <input type="hidden" name="tapa_nombre_hidden[]" id="tapa_nombre_hidden_${rowId}" required value="">
        </td>
        <td>
            <button type="button" class="btn-submit btn-compact btn-primary" onclick="assignTapaToRow('${rowId}')"><i class="fas fa-hand-pointer"></i> Asignar Tapa Seleccionada</button>
            <button type="button" class="remove-row" onclick="deleteRow(this);
            updateTotalUnitsReference()"><i class="fas fa-trash"></i></button>
        </td>
    `;
    updateTotalUnitsReference();
}

function assignTapaToRow(rowId) {
    const tapaId = document.getElementById('p_id_tapa_seleccionada_hidden').value;
    const tapaLabel = document.getElementById('selected_tapa_display').textContent;
    if (!tapaId) {
        alert("ERROR: Primero debe buscar y seleccionar una Tapa/Sello en el Paso 2.");
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
    params.set('p_id_art_ter_hidden', artTerId);
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
            alert("Fórmula Base y Componentes Guardados. El ID de Receta es: " + data.id_receta);
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

function saveOrden(event) {
    event.preventDefault();
    const idReceta = document.getElementById('p_id_receta_orden_hidden').value;
    const cantProdStr = document.getElementById('cant_prod_orden').value;
    const idArtProducido = document.getElementById('p_id_art_producido_orden_hidden').value;
    const fechaIni = document.getElementById('fecha_ini').value;
    const cantBaseRecetaStr = document.getElementById('p_receta_cantidad_base_hidden').value;

    if (!idReceta) {
        alert("ERROR: Debe seleccionar una Receta válida.");
        return;
    }

    if (!cantProdStr || parseFloat(cantProdStr) <= 0) {
        alert("ERROR: La Cantidad a Producir (Programada) debe ser positiva.");
        return;
    }

    if (!cantBaseRecetaStr || parseFloat(cantBaseRecetaStr) <= 0) {
        alert("ERROR: La Cantidad Base de la Receta (Fórmula) es requerida. Vuelva a seleccionar la Receta.");
        return;
    }

    if (!idArtProducido) {
        alert("ERROR: El ID del Artículo Producido está ausente. Vuelva a seleccionar la Receta.");
        return;
    }

    if (!fechaIni || fechaIni.trim() === '') {
        alert("ERROR: Debe seleccionar una Fecha de Inicio Programada.");
        return;
    }

    const cantProdOrder = parseFloat(cantProdStr);
    const cantBaseReceta = parseFloat(cantBaseRecetaStr);
    activeIdReceta = idReceta;
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
            loadInsumosForOrder(activeOrdenCode, idReceta, cantProdOrder, cantBaseReceta);
            alert(`Orden Creada: ${activeOrdenCode}.`);
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

function loadInsumosForOrder(idOrden, idReceta, cantProdOrder, cantBaseReceta) {
    const tableBody = document.getElementById('insumos-orden-rows');
    const statusDisplay = document.getElementById('display_order_recipe_status');
    tableBody.innerHTML = '';

    const displayProductName = activeNombreArtTerminado || `Orden: ${idOrden}`;
    if (cantProdOrder === undefined || cantBaseReceta === undefined || cantBaseReceta === 0) {
        statusDisplay.textContent = `${displayProductName} (Cód: ${idOrden}).
            Error: No se puede calcular la cantidad teórica, faltan datos de la receta/orden.`;
        return;
    }

    const scaleFactor = cantProdOrder / cantBaseReceta;

    statusDisplay.textContent = `${displayProductName} (Cód: ${idOrden}). Cargando Insumos de Receta ${idReceta}...`;
    fetch(`${PRODUCTION_SERVLET_URL}?action=obtener_insumos_orden_activa&id_receta=${idReceta}`)
    .then(response => response.json())
    .then(data => {
        if (data.length > 0) {
            data.forEach(insumo => {
                const baseReq = parseFloat(insumo.cantidad_requerida);
                const totalReq = parseFloat((baseReq * scaleFactor).toFixed(4));

                const newRow = tableBody.insertRow();

                newRow.innerHTML = `
                 <form action="" method="POST" onsubmit="handleInsumoConsumption(event)">
                        <input type="hidden" name="action" value="registrar_consumo_componente">
                        <input type="hidden" name="p_id_orden" value="${idOrden}">


                        <input type="hidden" name="p_id_articulo_consumido" value="${insumo.id_articulo}">
                        <input type="hidden" name="p_id_unidad" value="${insumo.id_unidad}">
                        <input type="hidden" name="p_es_envase" value="false">
                        <td>${insumo.codigo}</td>


                        <td>${totalReq}</td>
                        <td>
                            <input type="number" name="p_cantidad_consumida" value="${totalReq}" step="0.001" required>

                        </td>

                        <td>${insumo.unidad_nombre}</td>
                        <td>
                            <button type="submit" class="btn-submit btn-compact btn-warning"><i class="fas fa-edit"></i> Registrar</button>


                       </td>
                 </form>
                `;
            });
            statusDisplay.textContent = `Orden Activa: ${displayProductName} (Cód: ${idOrden}). Insumos cargados (Teórico para ${cantProdOrder.toFixed(2)} unidades). Registre consumo Real.`;
        } else {
            statusDisplay.textContent = `Orden Activa: ${displayProductName} (Cód: ${idOrden}).
                No se encontraron insumos para esta receta.`;
        }
    })
    .catch(error => {
        statusDisplay.textContent = `Error al cargar insumos para Orden Activa: ${displayProductName} (Cód: ${idOrden}).`;
    });
}

function handleInsumoConsumption(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const params = new URLSearchParams(formData);
    params.set('action', 'registrar_consumo_componente');
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
            alert("Consumo de insumo registrado exitosamente.");
        } else {

            alert("Error al registrar consumo: " + data.message);
        }
    })
    .catch(error => {
        if (!error.message.includes("script de alerta")) {
            alert("Error de comunicación con el servidor al registrar consumo.");
        }
    });
}

function calculateLooseContainers() {
    const totalContainers = parseInt(document.getElementById('cant_unidades_envasadas_ref').value) || 0;
    const unidadesPorCaja = parseInt(document.getElementById('unidad_por_caja_manual').value) || 1;
    const cajasConsumidas = parseInt(document.getElementById('cant_empacada_caja').value) || 0;
    const totalEmpacadoEnCajas = cajasConsumidas * unidadesPorCaja;
    let envasesSueltos = 0;
    if (unidadesPorCaja <= 0 || totalEmpacadoEnCajas > totalContainers) {
        envasesSueltos = 0;
    } else {
        envasesSueltos = totalContainers - totalEmpacadoEnCajas;
    }
    const looseDisplay = document.getElementById('loose_containers_display');
    const looseInput = document.getElementById('envases_sueltos_cantidad');
    if (envasesSueltos > 0) {
        looseInput.value = envasesSueltos;
        looseDisplay.style.display = 'block';
    } else {
        looseInput.value = 0;
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
        if (!document.getElementById('p_id_etiqueta_principal_hidden').value) {
            alert("ERROR: Debe seleccionar la Etiqueta Principal (Paso 4.1).");
            return;
        }
        const rows = document.getElementById('envase-tapa-rows').querySelectorAll('tr');
        if (rows.length === 0) {
            alert("ERROR: Agregue al menos un tipo de Envase.");
            return;
        }
        let allValid = true;
        rows.forEach(row => {
            const containerId = row.querySelector('input[name="p_id_componente_container[]"]').value;
            const capId = row.querySelector('input[name="p_id_componente_cap[]"]').value;
            const quantity = parseInt(row.querySelector('input[name="p_cant_a_empacar_final[]"]').value) || 0;
            if (!containerId || !capId || quantity <= 0) {
                allValid = false;
            }

        });
        if (!allValid) {
            alert("ERROR: Asegúrese de que todos los Envases tengan una Tapa Asignada y Cantidades válidas y mayores a cero.");
            return;
        }
        document.getElementById(`hidden_orden_envasado`).value = activeOrdenCode;
        document.getElementById(`p_id_art_ter_envasado_hidden`).value = activeIdArtTerminado;
        document.getElementById(`p_codigo_lote_envasado_ref`).value = activeLotCode;
        message = 'Envases, Tapas y Etiqueta Principal descontados.';
    } else if (stepName === 'empaque_secundario') {
        actionValue = 'consumo_empaque_step';
        const componentId = document.getElementById(`p_id_componente_caja`).value;
        if (!componentId) {
            alert(`ERROR: Debe seleccionar un componente de empaque secundario.`);
            return;
        }
        document.getElementById(`hidden_orden_caja`).value = activeOrdenCode;
        document.getElementById(`p_id_art_ter_caja_hidden`).value = activeIdArtTerminado;
        message = 'Empaque secundario (cajas, etc.) descontado.';
    } else {
        alert("Acción de empaque desconocida.");
        return;
    }

    const formData = new FormData(form);
    const params = new URLSearchParams(formData);
    params.set('action', actionValue);
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
            alert(`Paso de empaque '${stepName}' registrado. ${message}`);
        } else
        {
            alert(`Error al registrar paso '${stepName}': ${data.message}`);
        }
    })
    .catch(error => {
        if (!error.message.includes("script de alerta")) {
            alert("Error de comunicación con el servidor al registrar el paso de empaque.");
        }
    });
}

function submitMerma(event) {
    event.preventDefault();
    if (!activeOrdenCode) {
        alert("ERROR: No hay una Orden de Producción activa para registrar la merma.");
        return;
    }

    const formData = new FormData(event.target);
    const params = new URLSearchParams(formData);
    const envasesSueltos = document.getElementById('envases_sueltos_cantidad').value ||
    '0.00';

    params.set('action', 'registrar_merma_y_cierre_empaque');
    params.set('p_envases_sueltos', envasesSueltos);

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
            alert("Registro final de Lote Guardado. La orden está lista para cerrarse.");
        } else {
            alert("Error al guardar el lote: " + data.message);
        }
    })
    .catch(error => {
        if (!error.message.includes("script de alerta")) {
            alert("Error de comunicación con el servidor al guardar el lote.");
        }
    });
}

function finalizeOrder(event) {
    event.preventDefault();
    if (!activeOrdenCode) {
        alert("ERROR: No hay una Orden de Producción activa para finalizar.");
        return;
    }
    document.getElementById('hidden_orden_finalizar').value = activeOrdenCode;
    const formData = new FormData(event.target);
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
        { suffix: 'orden_envase', colorSuffix: 'primary' }
    ];
    fields.forEach(({ suffix, colorSuffix }) => {
        const displayElement = document.getElementById('display_orden_' + suffix);
        const displayText = activeOrdenCode
            ? `Orden Activa: ${activeNombreArtTerminado} (Cód: ${activeOrdenCode})`
            : 'Aún no hay Orden Activa';

        if (displayElement) {
            displayElement.classList.remove('display-success', 'display-warning', 'display-primary', 'display-danger');

            displayElement.classList.add('display-' + colorSuffix);
            displayElement.textContent = displayText;
        }
    });
    if (activeOrdenCode) {
        document.getElementById('hidden_orden_envasado').value = activeOrdenCode;
        document.getElementById('hidden_orden_caja').value = activeOrdenCode;
        document.getElementById('hidden_orden_lote_submit').value = activeOrdenCode;
        document.getElementById('hidden_orden_finalizar').value = activeOrdenCode;
    } else {
        ['hidden_orden_envasado', 'hidden_orden_caja', 'hidden_orden_lote_submit', 'hidden_orden_finalizar'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
    }
    if (activeIdArtTerminado && activeNombreArtTerminado) {
        document.getElementById('producto_a_envasar').value = 'Producto Terminado: ' + activeNombreArtTerminado;
        document.getElementById('p_id_art_ter_envasado_hidden').value = activeIdArtTerminado;
    } else {
        document.getElementById('producto_a_envasar').value = 'Cargado de Orden Activa';
    }
    if (activeLotCode) {
        document.getElementById('cod_lote_ref_lotes').value = activeLotCode;
        document.getElementById('p_cod_lote_lote_hidden').value = activeLotCode;
        document.getElementById('cod_lote_generado_envasado_display').value = activeLotCode;
        document.getElementById('p_codigo_lote_envase_hidden').value = activeLotCode;
    } else {
        document.getElementById('cod_lote_ref_lotes').value = 'Esperando Lote Generado';
        document.getElementById('p_cod_lote_lote_hidden').value = '';
        document.getElementById('cod_lote_generado_envasado_display').value = "Presione 'Generar'";
        document.getElementById('p_codigo_lote_envase_hidden').value = '';
    }
    updateTotalUnitsReference();
}

function loadRecetasList() {
    const tableBody = document.getElementById('recetas-list-rows');
    const params = new URLSearchParams({
        action: 'listar_recetas'
    });

    tableBody.innerHTML = '<tr><td colspan="5"><i class="fas fa-spinner fa-spin"></i> Cargando listado de recetas...</td></tr>';

    fetch(`${PRODUCTION_SERVLET_URL}?${params.toString()}`)
    .then(handleJsonResponse)
    .then(data => {
        tableBody.innerHTML = '';
        const recetas = Array.isArray(data) ? data : [];

        const uniqueRecetas = new Map();

        recetas.forEach(receta => {
            if (receta.id_receta && !uniqueRecetas.has(receta.id_receta)) {
                uniqueRecetas.set(receta.id_receta, receta);
            }
        });

        const finalRecetas = Array.from(uniqueRecetas.values());

        if (finalRecetas.length > 0) {
            finalRecetas.forEach(receta => {
                const nombreGenerico = (receta.nombre_generico || 'Nombre Desconocido').replace(/'/g, "\\'");
                const cantidadBase = parseFloat(receta.receta_cantidad_base) || 0.00;
                const unidadNombre = receta.unidad_nombre || 'Unidad';
                const fechaCreacion = receta.fecha_creacion || 'Fecha Desconocida';

                const newRow = tableBody.insertRow();
                newRow.innerHTML = `
                    <td>${nombreGenerico}</td>
                    <td>${cantidadBase.toFixed(2)}</td>
                    <td>${unidadNombre}</td>
                    <td>${fechaCreacion}</td>
                    <td>
                        <button type="button" class="btn-submit btn-compact btn-info" onclick="loadRecetaDetalle(${receta.id_receta}, '${nombreGenerico}', ${cantidadBase}, '${unidadNombre}')"><i class="fas fa-eye"></i> Ver Detalle</button>
                        <button type="button" class="btn-submit btn-compact btn-danger" onclick="confirmDeactivateReceta(${receta.id_receta}, '${nombreGenerico}')"><i class="fas fa-power-off"></i> Desactivar</button>
                    </td>
                `;
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="5">No se encontraron recetas activas.</td></tr>`;
        }
    })
    .catch(error => {
        tableBody.innerHTML = `<tr><td colspan="5">Error de comunicación al cargar recetas: ${error.message}</td></tr>`;
    });
}

function loadRecetaDetalle(idReceta, nombreReceta, cantBase, unidadBase) {
    const tableBody = document.getElementById('modal-detalle-receta-rows');

    activeIdReceta = idReceta;
    activeNombreReceta = nombreReceta;
    activeCantBaseReceta = cantBase;
    activeUnidadBaseReceta = unidadBase;

    document.getElementById('modal_detalle_receta_id_display').textContent = `ID ${idReceta}`;
    document.getElementById('modal_detalle_receta_info').innerHTML = `Producto Maestro: <b>${nombreReceta}</b> | Cantidad Base: <b>${cantBase.toFixed(2)} ${unidadBase}</b>`;
    tableBody.innerHTML = '<tr><td colspan="4"><i class="fas fa-spinner fa-spin"></i> Cargando componentes...</td></tr>';
    document.getElementById('view-recipe-modal').style.display = 'flex';

    fetch(`${PRODUCTION_SERVLET_URL}?action=obtener_insumos_orden_activa&id_receta=${idReceta}`)
    .then(handleJsonResponse)
    .then(data => {
        tableBody.innerHTML = '';
        if (data.length > 0) {
            data.forEach(insumo => {
                const newRow = tableBody.insertRow();
                const insumoNombreEscapado = insumo.nombre_articulo.replace(/'/g, "\\'");
                const nombreRecetaEscapado = nombreReceta.replace(/'/g, "\\'");
                newRow.innerHTML = `
                    <td>${insumo.codigo} - ${insumo.nombre_articulo}</td>
                    <td>${parseFloat(insumo.cantidad_requerida).toFixed(4)}</td>
                    <td>${insumo.unidad_nombre}</td>
                    <td>
                        <button type="button" class="btn-submit btn-compact btn-primary" onclick="openEditModal({
                            id_detalle: ${insumo.id_detalle_receta},
                            nombre_insumo: '${insumoNombreEscapado}',
                            cantidad: ${insumo.cantidad_requerida},
                            unidad: '${insumo.unidad_nombre}'
                        })"><i class="fas fa-pencil-alt"></i> Editar</button>
                        <button type="button" class="btn-submit btn-compact btn-danger" onclick="confirmDeleteDetalle(${insumo.id_detalle_receta}, '${insumoNombreEscapado}', ${idReceta}, '${nombreRecetaEscapado}', ${cantBase}, '${unidadBase}')"><i class="fas fa-trash"></i> Quitar</button>
                    </td>
                `;
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="4">No se encontraron insumos para esta receta.</td></tr>`;
        }
    })
    .catch(error => {
        tableBody.innerHTML = `<tr><td colspan="4">Error de comunicación al cargar detalle: ${error.message}</td></tr>`;
    });
}

function closeViewRecipeModal() {
    document.getElementById('view-recipe-modal').style.display = 'none';
}

function openEditModal(detalle) {
    document.getElementById('edit_id_detalle_receta').value = detalle.id_detalle;
    document.getElementById('edit_nombre_insumo').value = detalle.nombre_insumo;
    document.getElementById('edit_cant_req').value = parseFloat(detalle.cantidad).toFixed(4);
    document.getElementById('edit_nombre_unidad').value = detalle.unidad;
    document.getElementById('edit-error-message').textContent = '';
    document.getElementById('edit-detalle-modal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('edit-detalle-modal').style.display = 'none';
}

function submitEditDetalleReceta(event) {
    event.preventDefault();
    const idDetalle = document.getElementById('edit_id_detalle_receta').value;
    const nuevaCantidad = document.getElementById('edit_cant_req').value;
    const errorDisplay = document.getElementById('edit-error-message');

    if (parseFloat(nuevaCantidad) <= 0) {
        errorDisplay.textContent = 'La cantidad debe ser mayor a cero.';
        return;
    }

    const params = new URLSearchParams({
        action: 'actualizar_detalle_receta',
        p_id_detalle_receta: idDetalle,
        p_cant_req: nuevaCantidad
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
            alert("Detalle de receta actualizado correctamente.");
            closeEditModal();
            loadRecetaDetalle(activeIdReceta, activeNombreReceta, activeCantBaseReceta, activeUnidadBaseReceta);
        } else {
            errorDisplay.textContent = data.message || "Error desconocido al actualizar.";
        }
    })
    .catch(error => {
        errorDisplay.textContent = `Error de comunicación: ${error.message}`;
    });
}

function confirmDeleteDetalle(idDetalle, nombreInsumo, idReceta, nombreReceta, cantBase, unidadBase) {
    if (confirm(`¿Está seguro de QUITAR el insumo "${nombreInsumo}" (ID Detalle: ${idDetalle}) de la receta ${idReceta}?`)) {
        deleteDetalleReceta(idDetalle, idReceta, nombreReceta, cantBase, unidadBase);
    }
}

function deleteDetalleReceta(idDetalle, idReceta, nombreReceta, cantBase, unidadBase) {
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
            alert("Insumo quitado de la receta exitosamente.");
            loadRecetaDetalle(idReceta, nombreReceta, cantBase, unidadBase);
        } else {
            alert("Error al quitar el insumo: " + (data.message || "Detalle desconocido."));
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