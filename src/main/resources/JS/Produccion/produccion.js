const ACCESS_PASSWORD = '1234';
const PRODUCTION_SERVLET_URL = '/ProduccionServlet';
let activeOrdenCode = '';
let activeLotCode = '';
let activeIdArtTerminado = '';
let activeNombreArtTerminado = '';
let activeIdReceta = '';

$(document).ready(function() {
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
                        id_producto_maestro: item.id_producto_maestro,
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
            $('input[name="p_id_prod_maestro_hidden"]').val(ui.item.id_producto_maestro);
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
                    action: "obtener_receta_por_nombre_generico", // <--- ACCIÓN CORREGIDA
                    nombre_generico: request.term                 // <--- PARÁMETRO CORREGIDO
                },
                success: function(data) {
                    response(data.map(item => ({
                        id_receta: item.id_receta,
                        id_art_ter: item.id_producto_maestro,
                        nombre_art_ter: item.nombre_generico,
                        value: item.nombre_generico,
                        label: item.nombre_generico // Muestra solo el nombre del producto (sin ID de receta)
                    })));
                }
            });
        },
        minLength: 2,
        select: function(event, ui) {
            document.getElementById('p_id_receta_orden_hidden').value = ui.item.id_receta;
            document.getElementById('p_id_art_producido_orden_hidden').value = ui.item.id_art_ter;
            document.getElementById('buscar_receta_orden').value = ui.item.value;
            return false;
        },
        change: function (event, ui) {
            if (ui.item === null) {
                document.getElementById('p_id_receta_orden_hidden').value = '';
                document.getElementById('p_id_art_producido_orden_hidden').value = '';
                document.getElementById('buscar_receta_orden').value = '';
            }
        }
    });
    $("#buscar_envase_principal_multiple").autocomplete({
        source: getPackagingAutocompleteSource(1),
        minLength: 2,
        select: function(event, ui) {
            addRowEnvaseTapa(
                ui.item.id,
                ui.item.label,
                `${ui.item.capacidad} ${ui.item.unidad_capacidad}`,
                ui.item.id_unidad
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
            document.getElementById('p_id_unidad_tapa_hidden').value = ui.item.id_unidad;
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
            document.getElementById('p_id_unidad_etiqueta_hidden').value = ui.item.id_unidad;
            return false;
        }
    });
    $("#buscar_empaque_secundario").autocomplete({
        source: getPackagingAutocompleteSource(3),
        minLength: 2,
        select: function(event, ui) {
            document.getElementById('buscar_empaque_secundario').value = ui.item.label;
            document.getElementById('p_id_componente_caja').value = ui.item.id;
            document.getElementById('p_id_unidad_caja_hidden').value = ui.item.id_unidad;
            return false;
        }
    });
    openTab(null, 'Receta');
    if (typeof window.activeOrdenCodeFromServlet !== 'undefined') {
        activeOrdenCode = window.activeOrdenCodeFromServlet;
        updateOrdenFields();
    }
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
                    id_unidad: item.id_unidad || 10
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
    const searchInput = document.getElementById('buscar_insumo');
    if (!searchInput.value.trim()) {
        alert("Por favor, ingrese un valor de búsqueda.");
    }
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
        <input type="hidden" name="p_id_art_insumo_hidden[]" value="${insumoId}">
        <input type="hidden" name="p_id_uni_insumo_hidden[]" value="${unitId}">
    `;
}

function addRowEnvaseTapa(containerId, containerLabel, containerCapacity, containerUnitId) {
    const tableBody = document.getElementById('envase-tapa-rows');
    const newRow = tableBody.insertRow();
    const rowId = `row-envase-${Date.now()}`;
    newRow.id = rowId;
    newRow.innerHTML = `
        <td>
            <input type="text" name="envase_label[]" value="${containerLabel}" readonly class="readonly-field" style="width: 100%;">
            <input type="hidden" name="p_id_componente_container[]" value="${containerId}">
            <input type="hidden" name="p_id_unidad_envase[]" value="${containerUnitId}">
        </td>
        <td>
            <input type="text" value="${containerCapacity}" readonly class="readonly-field" style="width: 100%; text-align: center;">
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
            <button type="button" class="remove-row" onclick="deleteRow(this); updateTotalUnitsReference()"><i class="fas fa-trash"></i></button>
        </td>
    `;
    updateTotalUnitsReference();
}

function assignTapaToRow(rowId) {
    const tapaId = document.getElementById('p_id_tapa_seleccionada_hidden').value;
    const tapaUnitId = document.getElementById('p_id_unidad_tapa_hidden').value;
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
    alert(`Tapa ${tapaName} (Unidad ID ${tapaUnitId}) asignada al envase.`);
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
    return response.text().then(text => {
        return { success: response.ok, message: response.ok ? 'Acción completada.' : text || 'Error de servidor sin mensaje.' };
    });
}

function saveFullRecipe(event) {
    event.preventDefault();
    const form = event.target;
    const prodMaestroId = $('input[name="p_id_prod_maestro_hidden"]').val();
    const rows = document.getElementById('insumo-rows').querySelectorAll('tr');

    if (!prodMaestroId) {
        alert("ERROR: Debe seleccionar un Producto Terminado (y su Producto Maestro).");
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
    params.set('p_id_prod_maestro_hidden', prodMaestroId);
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
            $('input[name="p_id_prod_maestro_hidden"]').val('');
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
    const cantProd = document.getElementById('cant_prod_orden').value;

    if (!idReceta) {
        alert("ERROR: Debe seleccionar una Receta válida.");
        return;
    }
    if (!cantProd || parseFloat(cantProd) <= 0) {
        alert("ERROR: La Cantidad a Producir (Programada) debe ser positiva.");
        return;
    }

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
        if (data.success || data.message.includes("creada") || data.message.includes("script de alerta")) {
            activeOrdenCode = 'ORD_TEMP_' + Math.floor(Math.random() * 1000);

            activeIdArtTerminado = document.getElementById('p_id_art_producido_orden_hidden').value;
            activeNombreArtTerminado = document.getElementById('buscar_receta_orden').value;
            activeLotCode = '';
            document.getElementById('cod_lote_generado_envasado_display').value = "Presione 'Generar'";
            document.getElementById('p_codigo_lote_envase_hidden').value = '';
            updateOrdenFields();

            loadInsumosForOrder(activeOrdenCode, activeIdReceta);

            alert(`Orden Creada (ID de prueba: ${activeOrdenCode}). Insumos de Receta ${activeIdReceta} cargados en 'Consumo MP'.`);
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

function loadInsumosForOrder(idOrden, idReceta) {
    const tableBody = document.getElementById('insumos-orden-rows');
    const statusDisplay = document.getElementById('display_order_recipe_status');
    tableBody.innerHTML = '';

    if (!idReceta) {
        statusDisplay.textContent = `Orden Activa: ${idOrden}. ERROR: No se pudo obtener el ID de Receta.`;
        return;
    }

    statusDisplay.textContent = `Orden Activa: ${idOrden}. Cargando Insumos de Receta ${idReceta}...`;

    fetch(`${PRODUCTION_SERVLET_URL}?action=obtener_insumos_orden_activa&id_receta=${idReceta}`)
    .then(response => response.json())
    .then(data => {
        if (data && data.length > 0) {
            data.forEach(insumo => {
                const totalReq = insumo.insumo_cantidad_requerida || '1.0000';
                const nombreInsumo = insumo.insumo_nombre || 'N/A';
                const unidadNombre = insumo.insumo_unidad_nombre || 'N/A';
                const articuloId = insumo.id_articulo || 'N/A';
                const unidadId = insumo.id_unidad || 'N/A';
                const codigo = insumo.codigo || '';

                const newRow = tableBody.insertRow();
                newRow.innerHTML = `
                    <form action="" method="POST" onsubmit="handleInsumoConsumption(event)">
                        <input type="hidden" name="action" value="registrar_consumo_componente">
                        <input type="hidden" name="p_id_orden" value="${idOrden}">
                        <input type="hidden" name="p_id_articulo_consumido" value="${articuloId}">
                        <input type="hidden" name="p_id_unidad" value="${unidadId}">
                        <input type="hidden" name="p_cantidad_teorica_total" value="${parseFloat(totalReq).toFixed(4)}">
                        <input type="hidden" name="p_es_envase" value="false">
                        <td>${codigo} - ${nombreInsumo}</td>
                        <td>${parseFloat(totalReq).toFixed(4)} ${unidadNombre}</td>
                        <td>
                            <input type="number" name="p_cantidad_consumida" value="${parseFloat(totalReq).toFixed(4)}" step="0.001" required>
                        </td>
                        <td>${unidadNombre}</td>
                        <td>
                            <button type="submit" class="btn-submit btn-compact btn-warning"><i class="fas fa-edit"></i> Registrar</button>
                        </td>
                    </form>
                `;
            });
            statusDisplay.textContent = `Orden Activa: ${idOrden}. Insumos cargados (Teórico). Registre consumo Real.`;
        } else {
            statusDisplay.textContent = `Orden Activa: ${idOrden}. No se encontraron insumos para esta receta.`;
        }
    })
    .catch(error => {
        statusDisplay.textContent = `Error al cargar insumos para Orden ${idOrden}. Detalle: ${error.message}`;
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
        if (data.success || data.message.includes("Consumo manual registrado")) {
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
    const totalEnvasado = parseInt(document.getElementById('cant_unidades_envasadas_ref').value) || 0;
    const unidadesPorCaja = parseInt(document.getElementById('unidad_por_caja_manual').value) || 1;
    const cajasConsumidas = parseInt(document.getElementById('cant_empacada_caja').value) || 0;
    const totalEmpacadoEnCajas = cajasConsumidas * unidadesPorCaja;
    let envasesSueltos = 0;
    if (unidadesPorCaja <= 0 || totalEmpacadoEnCajas > totalEnvasado) {
        envasesSueltos = 0;
    } else {
        envasesSueltos = totalEnvasado - totalEmpacadoEnCajas;
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
    let totalUnits = 0;
    rows.forEach(row => {
        const quantityInput = row.querySelector('input[name="p_cant_a_empacar_final[]"]');
        totalUnits += parseInt(quantityInput.value) || 0;
    });
    const totalUnitsFixed = totalUnits.toFixed(0);
    const refField = document.getElementById('cant_unidades_envasadas_ref');
    if (refField) refField.value = totalUnitsFixed;
    const etiquetaQtyField = document.getElementById('cant_etiquetas_total');
    if (etiquetaQtyField) etiquetaQtyField.value = totalUnitsFixed;
    const cantFinalLotes = document.getElementById('cant_envases_final');
    if (cantFinalLotes) cantFinalLotes.value = totalUnitsFixed;
    calculateLooseContainers();
}

function generateLotCode(event) {
    event.preventDefault();
    if (!activeOrdenCode) {
        alert("ERROR: Primero debe crear una Orden de Producción activa.");
        return;
    }
    const now = new Date();
    const year = now.getFullYear().toString().slice(2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    const newLotCode = `LOTE-${year}${month}${day}${hours}${minutes}${seconds}-${activeOrdenCode}`;

    activeLotCode = newLotCode;
    document.getElementById('cod_lote_generado_envasado_display').value = activeLotCode;
    document.getElementById('p_codigo_lote_envase_hidden').value = activeLotCode;
    document.getElementById('cod_lote_ref_lotes').value = activeLotCode;
    document.getElementById('p_cod_lote_lote_hidden').value = activeLotCode;
    alert(`Código de Lote Generado (CLIENTE): ${activeLotCode}. *AVISO: La generación de código no está implementada en el Servlet (doGet).*`);
}

function registerSingleConsumption(ordenId, articuloId, cantidad, unidadId, esEnvase, nombreArticulo) {
    const params = new URLSearchParams();
    params.set('action', 'registrar_consumo_componente');
    params.set('p_id_orden', ordenId);
    params.set('p_id_articulo_consumido', articuloId);
    params.set('p_cantidad_consumida', cantidad);
    params.set('p_id_unidad', unidadId);
    params.set('p_es_envase', esEnvase ? 'true' : 'false');

    return fetch(PRODUCTION_SERVLET_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    })
    .then(handleJsonResponse)
    .then(data => {
        if (data.success || data.message.includes("Consumo manual registrado")) {
            return `Consumo de ${nombreArticulo} registrado.`;
        }
        throw new Error(data.message || `Error desconocido al consumir ${nombreArticulo}.`);
    });
}

async function submitPackagingStep(event, stepName) {
    event.preventDefault();
    if (!activeOrdenCode) {
        alert("ERROR: No hay una Orden de Producción activa.");
        return;
    }
    if (!activeLotCode) {
        alert("ERROR: Debe generar el Código de Lote (Paso 4.0) antes de registrar el envasado.");
        return;
    }

    const consumptionPromises = [];
    const messages = [];

    if (stepName === 'combined_envasado') {
        const etiquetaId = document.getElementById('p_id_etiqueta_principal_hidden').value;
        const etiquetaUnitId = document.getElementById('p_id_unidad_etiqueta_hidden').value;
        const etiquetaQty = document.getElementById('cant_etiquetas_total').value;

        if (!etiquetaId) {
            alert("ERROR: Debe seleccionar la Etiqueta Principal (Paso 4.1).");
            return;
        }

        consumptionPromises.push(registerSingleConsumption(
            activeOrdenCode,
            etiquetaId,
            etiquetaQty,
            etiquetaUnitId,
            true,
            "Etiqueta Principal"
        ));
        messages.push(`Etiqueta Principal (${etiquetaQty} unid)`);


        const rows = document.getElementById('envase-tapa-rows').querySelectorAll('tr');
        if (rows.length === 0) {
            alert("ERROR: Agregue al menos un tipo de Envase.");
            return;
        }

        let allValid = true;
        rows.forEach(row => {
            const containerId = row.querySelector('input[name="p_id_componente_container[]"]').value;
            const containerLabel = row.querySelector('input[name="envase_label[]"]').value;
            const containerUnitId = row.querySelector('input[name="p_id_unidad_envase[]"]').value;
            const capId = row.querySelector('input[name="p_id_componente_cap[]"]').value;
            const capName = row.querySelector('input[name="tapa_nombre_hidden[]"]').value;
            const tapaUnitId = document.getElementById('p_id_unidad_tapa_hidden').value;
            const quantity = parseInt(row.querySelector('input[name="p_cant_a_empacar_final[]"]').value) || 0;

            if (!containerId || !capId || quantity <= 0) {
                allValid = false;
                alert(`ERROR en Envase ${containerLabel}: Revise ID/Tapa/Cantidad.`);
                return;
            }

            consumptionPromises.push(registerSingleConsumption(
                activeOrdenCode,
                containerId,
                quantity,
                containerUnitId,
                true,
                `Envase: ${containerLabel}`
            ));
            messages.push(`Envase: ${containerLabel} (${quantity} unid)`);

            consumptionPromises.push(registerSingleConsumption(
                activeOrdenCode,
                capId,
                quantity,
                tapaUnitId,
                true,
                `Tapa: ${capName}`
            ));
            messages.push(`Tapa: ${capName} (${quantity} unid)`);
        });

        if (!allValid) return;

        try {
            const results = await Promise.all(consumptionPromises);
            alert(`Paso de Envasado, Tapas y Etiqueta registrado. Se realizaron ${results.length} registros: ${messages.join(', ')}.`);
        } catch (error) {
            alert(`Error en el Paso de Envasado: ${error.message}`);
        }

    } else if (stepName === 'empaque_secundario') {
        const componentId = document.getElementById(`p_id_componente_caja`).value;
        const componentLabel = document.getElementById(`buscar_empaque_secundario`).value;
        const componentUnitId = document.getElementById(`p_id_unidad_caja_hidden`).value;
        const boxesQty = document.getElementById('cant_empacada_caja').value;

        if (!componentId || !componentUnitId || parseFloat(boxesQty) <= 0) {
            alert(`ERROR: Debe seleccionar un componente de empaque secundario y la cantidad debe ser positiva.`);
            return;
        }

        consumptionPromises.push(registerSingleConsumption(
            activeOrdenCode,
            componentId,
            boxesQty,
            componentUnitId,
            true,
            `Empaque Secundario: ${componentLabel}`
        ));

        try {
            await Promise.all(consumptionPromises);
            alert(`Paso de Empaque Secundario registrado. ${componentLabel} (${boxesQty} unid) consumido.`);
        } catch (error) {
            alert(`Error en el Paso de Empaque Secundario: ${error.message}`);
        }
    }
}

function submitMerma(event) {
    event.preventDefault();
    if (!activeOrdenCode) {
        alert("ERROR: No hay una Orden de Producción activa para registrar la merma.");
        return;
    }

    const formData = new FormData(event.target);
    const params = new URLSearchParams(formData);
    const envasesSueltos = document.getElementById('envases_sueltos_cantidad').value || '0.00';

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
        if (data.success || data.message.includes("Merma") && data.message.includes("registrados")) {
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
        if (data.success || data.message.includes("Se registró el Lote")) {
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
        if (data.success || data.message.includes("**FINALIZADA**")) {
            alert("Orden de Producción " + activeOrdenCode + " **FINALIZADA** con éxito.");
            activeOrdenCode = '';
            activeLotCode = '';
            activeIdArtTerminado = '';
            activeNombreArtTerminado = '';
            activeIdReceta = '';
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
        if (displayElement) {
            displayElement.classList.remove('display-success', 'display-warning', 'display-primary', 'display-danger');
            displayElement.classList.add('display-' + (activeOrdenCode ? colorSuffix : 'warning'));
            displayElement.textContent = activeOrdenCode ? `Orden Activa: ${activeOrdenCode}` : 'Aún no hay Orden Activa';
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