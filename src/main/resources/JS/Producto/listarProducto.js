const API_ARTICULOS = '/productos';
const API_CATALOGO = '/CatalogoServlet';

let articulos = [];
const catalogos = {};
const ARTICULOS_POR_PAGINA = 35;
let paginaActual = 1;
let articulosFiltrados = [];
let confirmationCallback = null;

const loadingOverlay = document.getElementById('loadingOverlay');

function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

function showCustomAlert(title, message, okCallback = null) {
    const modal = document.getElementById('messageModal');
    document.getElementById('messageTitle').textContent = title;
    document.getElementById('messageText').textContent = message;
    document.getElementById('messageCancelBtn').style.display = 'none';
    document.getElementById('messageOkBtn').style.display = 'inline-block';

    document.getElementById('messageOkBtn').onclick = () => {
        modal.style.display = 'none';
        if (okCallback) okCallback();
    };
    modal.style.display = 'flex';
}

function showCustomConfirm(title, message, callback) {
    const modal = document.getElementById('messageModal');
    document.getElementById('messageTitle').textContent = title;
    document.getElementById('messageText').textContent = message;
    document.getElementById('messageCancelBtn').style.display = 'inline-block';
    document.getElementById('messageOkBtn').style.display = 'inline-block';

    confirmationCallback = callback;

    document.getElementById('messageOkBtn').onclick = () => {
        modal.style.display = 'none';
        if (confirmationCallback) confirmationCallback(true);
    };

    document.getElementById('messageCancelBtn').onclick = () => {
        modal.style.display = 'none';
        if (confirmationCallback) confirmationCallback(false);
    };
    modal.style.display = 'flex';
}

function cerrarFormulario() {
    document.getElementById('articuloModal').style.display = 'none';
}

function getNombreCatalogoById(entidad, id, keyId, keyNombre, keyAbrev = null) {
    if (!catalogos[entidad] || !id) return 'Desconocida';
    const item = catalogos[entidad].find(i => String(i[keyId]) === String(id));

    if (item) {
        if (keyAbrev && item[keyAbrev]) {
            return `${item[keyNombre]} - ${item[keyAbrev]}`;
        }
        return item[keyNombre];
    }
    return 'Desconocida';
}

function getUnidadDisplay(articulo) {
    const unidadId = articulo.unidad?.idUnidad || articulo.idUnidad;
    if (!unidadId) return 'N/A';

    const item = catalogos['unidad'] ? catalogos['unidad'].find(i => String(i.idUnidad) === String(unidadId)) : null;

    if (item) {
        return `${item.nombre} - ${item.abreviatura || 's/a'}`;
    }
    return 'Desconocida';
}


function mostrarDetalles(id) {
    const articulo = articulos.find(a => a.idProducto === id);
    const detallesContent = document.getElementById('detallesContent');
    detallesContent.innerHTML = '';

    if (!articulo) {
        showCustomAlert('Error', 'Artículo no encontrado.');
        return;
    }

    const categoriaId = articulo.categoria?.idCategoria || articulo.idCategoria || 0;
    const marcaId = articulo.marca?.idMarca || articulo.idMarca || 0;
    const tipoId = articulo.tipoArticulo?.id || articulo.idTipoArticulo || 0;

    const categoriaNombre = articulo.categoria?.nombre || getNombreCatalogoById('categoria', categoriaId, 'idCategoria', 'nombre');
    const marcaNombre = articulo.marca?.nombre || getNombreCatalogoById('marca', marcaId, 'idMarca', 'nombre');
    const tipoNombre = articulo.tipoArticulo?.nombre || getNombreCatalogoById('tipo', tipoId, 'id', 'nombre');
    const unidadNombreDisplay = getUnidadDisplay(articulo);


    const details = [
        { label: 'Marca', value: marcaNombre },
        { label: 'Categoría', value: categoriaNombre },
        { label: 'Tipo de Artículo', value: tipoNombre },
        { label: 'Unidad de Medida', value: unidadNombreDisplay },
        { label: 'Densidad', value: (articulo.densidad !== undefined && articulo.densidad !== null) ? articulo.densidad.toFixed(3) : 'N/A' },
        { label: 'Color', value: articulo.color || 'N/A' },
        { label: 'Aroma', value: articulo.aroma || 'N/A' }
    ];

    detallesContent.innerHTML = details.map(item => `
        <div class="detail-row">
            <div class="detail-label">${item.label}:</div>
            <div class="detail-value">${item.value}</div>
        </div>
    `).join('');

    document.getElementById('detallesModal').style.display = 'flex';
}

async function verLotes(idArticulo, descripcionArticulo) {
    const lotesModal = document.getElementById('lotesModal');
    const lotesModalTitle = document.getElementById('lotesModalTitle');
    const tablaLotesBody = document.querySelector('#tabla-lotes tbody');
    const lotesEmptyMessage = document.getElementById('lotesEmptyMessage');
    const loadingOverlay = document.getElementById('loadingOverlay');

    tablaLotesBody.innerHTML = '';
    lotesEmptyMessage.style.display = 'none';
    lotesModalTitle.textContent = `Lotes del Artículo: ${descripcionArticulo}`;
    loadingOverlay.style.display = 'flex';

    try {
        const response = await fetch(`${API_ARTICULOS}?accion=ver_lotes&id_articulo=${idArticulo}`);

        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            let errorDetail = `Error HTTP ${response.status} (${response.statusText}).`;

            if (contentType && contentType.includes("application/json")) {
                const errorJson = await response.json();
                errorDetail = errorJson.mensaje || errorDetail;
            } else {
                errorDetail = `Respuesta inesperada del servidor. Posiblemente sesión expirada o Servlet caído. (Status: ${response.status})`;
            }
            throw new Error(errorDetail);
        }

        const lotes = await response.json();

        if (Array.isArray(lotes)) {
            if (lotes.length > 0) {
                lotes.forEach(lote => {
                    const row = document.createElement('tr');
                    const fechaVencimiento = lote.fechaVencimiento ? new Date(lote.fechaVencimiento).toLocaleDateString('es-PE') : 'N/A';
                    const cantidadDisponible = parseFloat(lote.cantidadLote).toFixed(2);

                    row.innerHTML = `
                        <td>${lote.numeroLote || 'SIN NÚMERO'}</td>
                        <td class="data-center">${cantidadDisponible}</td>
                        <td class="data-center">${fechaVencimiento}</td>
                    `;
                    tablaLotesBody.appendChild(row);
                });
            } else {
                lotesEmptyMessage.style.display = 'block';
            }
        } else {
             throw new Error(lotes.mensaje || "Error al cargar los lotes: La respuesta no es una lista válida.");
        }

        lotesModal.style.display = 'flex';

    } catch (error) {
        showCustomAlert("Error de Lotes", `No se pudieron cargar los lotes. Detalle: ${error.message}`, false);
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

function manejarCapacidadTipo() {
    const tipoSelect = document.getElementById('idTipoArticulo');
    const capacidadGroup = document.getElementById('groupCapacidad');
    const capacidadInput = document.getElementById('capacidad');
    const TIPO_ENVASES = '4';

    if (tipoSelect.value === TIPO_ENVASES) {
        capacidadGroup.style.display = 'block';
        capacidadInput.setAttribute('required', 'required');
    } else {
        capacidadGroup.style.display = 'none';
        capacidadInput.removeAttribute('required');
        capacidadInput.value = ''; // Limpiar el valor si se oculta
    }
}

async function abrirFormulario(id = 0) {
    const modal = document.getElementById('articuloModal');
    const form = document.getElementById('articuloForm');
    form.reset();
    document.getElementById('idProducto').value = 0;
    document.getElementById('articuloModalHeader').querySelector('h2').textContent = 'Nuevo Artículo';

    await cargarFormularioSelects();

    let idMarcaOriginal = '';
    let idCategoriaOriginal = '';
    let idTipoArticuloOriginal = '';

    if (id > 0) {
        const articulo = articulos.find(a => a.idProducto === id);
        if (articulo) {
            idMarcaOriginal = String(articulo.marca?.idMarca || articulo.idMarca || '');
            idCategoriaOriginal = String(articulo.categoria?.idCategoria || articulo.idCategoria || '');
            idTipoArticuloOriginal = String(articulo.tipoArticulo?.id || articulo.idTipoArticulo || '');

            document.getElementById('idProducto').value = articulo.idProducto;
            document.getElementById('codigo').value = articulo.codigo;
            document.getElementById('descripcion').value = articulo.descripcion;
            document.getElementById('cantidad').value = articulo.cantidad;
            document.getElementById('precioCompra').value = articulo.precioCompra;
            document.getElementById('precioVenta').value = articulo.precioVenta;
            document.getElementById('pesoUnitario').value = articulo.pesoUnitario;
            document.getElementById('densidad').value = articulo.densidad;
            document.getElementById('aroma').value = articulo.aroma || '';
            document.getElementById('color').value = articulo.color || '';
            document.getElementById('idUnidad').value = String(articulo.unidad?.idUnidad || articulo.idUnidad || '');

            // Asignar Capacidad si existe (asumiendo que el campo se llama 'capacidad' en tu objeto Artículo)
            if (document.getElementById('capacidad')) {
                 document.getElementById('capacidad').value = articulo.capacidad || '';
            }

            document.getElementById('articuloModalHeader').querySelector('h2').textContent = 'Editar Artículo';
        }
    }

    document.getElementById('idMarca').value = idMarcaOriginal;
    document.getElementById('idCategoria').value = idCategoriaOriginal;
    document.getElementById('idTipoArticulo').value = idTipoArticuloOriginal;

    // Ejecutar control de visibilidad de capacidad después de cargar los datos
    manejarCapacidadTipo();

    modal.style.display = 'flex';
}

async function cargarFormularioSelects() {
    const selects = [
        { id: 'idMarca', entidad: 'marca', keyId: 'idMarca', keyNombre: 'nombre', keyAbrev: null },
        { id: 'idCategoria', entidad: 'categoria', keyId: 'idCategoria', keyNombre: 'nombre', keyAbrev: null },
        { id: 'idUnidad', entidad: 'unidad', keyId: 'idUnidad', keyNombre: 'nombre', keyAbrev: 'abreviatura' },
        { id: 'idTipoArticulo', entidad: 'tipo', keyId: 'id', keyNombre: 'nombre', keyAbrev: null }
    ];

    for (const end of selects) {
        const selectForm = document.getElementById(end.id);
        if (!catalogos[end.entidad]) continue;

        selectForm.innerHTML = `<option value="">-- Seleccione --</option>`;

        catalogos[end.entidad].forEach(item => {
            let optionText;

            if (end.entidad === 'unidad' && item.abreviatura) {
                optionText = `${item[end.keyNombre]} - ${item[end.keyAbrev]}`;
            } else {
                optionText = item[end.keyNombre];
            }

            const optionValue = item[end.keyId];
            const option = `<option value="${optionValue}">${optionText}</option>`;
            selectForm.innerHTML += option;
        });
    }
}

async function cargarCatalogos() {
    showLoading(true);
    const endpoints = [
        { id: 'idMarca', entidad: 'marca', keyId: 'idMarca', keyNombre: 'nombre', filtro: 'filtroMarca' },
        { id: 'idCategoria', entidad: 'categoria', keyId: 'idCategoria', keyNombre: 'nombre', filtro: 'filtroCategoria' },
        { id: 'idUnidad', entidad: 'unidad', keyId: 'idUnidad', keyNombre: 'nombre', keyAbrev: 'abreviatura', filtro: null },
        { id: 'idTipoArticulo', entidad: 'tipo', keyId: 'id', keyNombre: 'nombre', filtro: 'filtroTipo' }
    ];

    for (const end of endpoints) {
        try {
            let data = null;
            const res = await fetch(`${API_CATALOGO}?entidad=${end.entidad}`);
            if (res.ok) {
                data = await res.json();
            } else {
                throw new Error(`Error HTTP: ${res.status}`);
            }

            if (!data) throw new Error(`Fallo al obtener datos de ${end.entidad}.`);

            catalogos[end.entidad] = data;

            const selectForm = document.getElementById(end.id);
            selectForm.innerHTML = `<option value="">-- Seleccione --</option>`;

            if (end.filtro) {
                const selectFiltro = document.getElementById(end.filtro);
                selectFiltro.innerHTML = '<option value="">Todas</option>';
                data.forEach(item => {
                    selectFiltro.innerHTML += `<option value="${item[end.keyId]}">${item[end.keyNombre]}</option>`;
                });
            }
        } catch (error) {
            console.error(`Error al cargar ${end.entidad}:`, error);
            showCustomAlert('Error de Catálogo', `No se pudo cargar la lista de ${end.entidad}. Verifica el Servlet: ${error.message}`);
        }
    }
    showLoading(false);
}


async function manejarCambioFiltro(changedSelect) {
    showLoading(true);

    showLoading(false);
    aplicarFiltros();
}

function manejarCambioFormulario(changedSelect) {
}


async function cargarFiltroDinamico(entidadNombre, selectId, accion, parametros, valorPreseleccionado = null) {
    const select = document.getElementById(selectId);
    let idKey;
    let nombreKey;
    let optionPrefix = (selectId.includes('filtro')) ? 'Todas' : '-- Seleccione --';

    switch (entidadNombre) {
        case 'Marca':
            idKey = 'idMarca';
            nombreKey = 'nombre';
            break;
        case 'Categoria':
            idKey = 'idCategoria';
            nombreKey = 'nombre';
            break;
        case 'Tipo':
            idKey = 'id';
            nombreKey = 'nombre';
            break;
        default:
            return;
    }

    const currentSelectedId = valorPreseleccionado || select.value;
    select.innerHTML = `<option value="">${optionPrefix}</option>`;
    select.disabled = true;

    const queryParams = new URLSearchParams({ accion: accion });

    if (parametros.idMarca) queryParams.append('id_marca', parametros.idMarca);
    if (parametros.idCategoria) queryParams.append('id_categoria', parametros.idCategoria);
    if (parametros.idTipoArticulo) queryParams.append('id_tipo_articulo', parametros.idTipoArticulo);

    try {
        const res = await fetch(`${API_ARTICULOS}?${queryParams.toString()}`);

        if (!res.ok) {
            console.error(`Error HTTP ${res.status} al cargar filtro ${entidadNombre}`);
            select.disabled = false;
            return;
        }

        const data = await res.json();
        let validIds = [];

        if (Array.isArray(data)) {
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[idKey];
                option.textContent = item[nombreKey];
                select.appendChild(option);
                validIds.push(String(item[idKey]));
            });

            const isValidSelection = validIds.includes(String(currentSelectedId));

            if (isValidSelection) {
                select.value = currentSelectedId;
            } else {
                select.value = "";
            }
        }

    } catch (error) {
        console.error(`Error al cargar datos dinámicos para ${entidadNombre}:`, error);
    } finally {
        select.disabled = false;
    }
}


async function listarArticulos() {
    showLoading(true);
    try {
        const res = await fetch(`${API_ARTICULOS}?accion=listar`);
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

        articulos = await res.json();

        if (!Array.isArray(articulos)) {
            articulos = [];
        }

        paginaActual = 1;
        aplicarFiltros();
    } catch (error) {
        console.error('Error al listar artículos:', error);
        showCustomAlert('Error de Carga', 'Error al cargar la lista de artículos. Verifica si el Servlet "/productos" está activo.');
    } finally {
        showLoading(false);
    }
}

async function guardarArticulo(event) {
    event.preventDefault();
    showLoading(true);
    const idProducto = document.getElementById('idProducto').value;
    const formData = new URLSearchParams(new FormData(event.target)).toString();

    let url = API_ARTICULOS;
    let method = idProducto === "0" ? 'POST' : 'PUT';
    let statusMensaje = idProducto === "0" ? 'agregado' : 'actualizado';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        const data = await res.json();

        if (data.exito) {
            showCustomAlert('Éxito', `Artículo ${statusMensaje} con éxito.`, async () => {
                cerrarFormulario();
                await listarArticulos();
            });

        } else {
            let msg = `Error al guardar el artículo: ${data.mensaje}`;
            showCustomAlert('Error', msg);
        }

    } catch (error) {
        console.error('Error al guardar:', error);
        showCustomAlert('Error de Conexión', 'Error de conexión al guardar el artículo. Revisa tu red o el log del servidor.');
    } finally {
        showLoading(false);
    }
}

async function eliminarArticulo(id) {
    showCustomConfirm('Confirmar Eliminación', '¿Estás seguro de que deseas eliminar este artículo? Esta acción es irreversible.', async (confirmed) => {
        if (!confirmed) return;

        showLoading(true);
        try {
            const url = `${API_ARTICULOS}?id_producto=${id}`;
            const res = await fetch(url, { method: 'DELETE' });
            const data = await res.json();

            if (data.exito) {
                showCustomAlert('Eliminado', 'Artículo eliminado con éxito.', async () => {
                    await listarArticulos();
                });
            } else {
                showCustomAlert('Error', `Error al eliminar: ${data.mensaje}`);
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            showCustomAlert('Error de Conexión', 'Error de conexión al eliminar el artículo.');
        } finally {
            showLoading(false);
        }
    });
}

function getHighlightedMatch(queryLower, p) {
    const codigo = p.codigo || '';
    const descripcion = p.descripcion || 'Sin descripción';

    let index = codigo.toLowerCase().indexOf(queryLower);
    if (index !== -1) {
        const highlightedText =
            `${codigo.substring(0, index)}<span class="highlight">${codigo.substring(index, index + queryLower.length)}</span>${codigo.substring(index + queryLower.length)}`;
        return [`${highlightedText} - ${descripcion}`, p.idProducto];
    }

    index = descripcion.toLowerCase().indexOf(queryLower);
    if (index !== -1) {
        const highlightedText =
            `${descripcion.substring(0, index)}<span class="highlight">${descripcion.substring(index, index + queryLower.length)}</span>${descripcion.substring(index + queryLower.length)}`;
        return [`${codigo} - ${highlightedText}`, p.idProducto];
    }

    return null;
}


function renderSugerencias(query) {
    const queryLower = query.toLowerCase().trim();
    const sugerenciasDiv = document.getElementById('sugerencias');
    sugerenciasDiv.innerHTML = '';

    if (queryLower.length < 2) {
        sugerenciasDiv.style.display = 'none';
        return;
    }

    const matchesWithHtml = articulos
        .map(p => getHighlightedMatch(queryLower, p))
        .filter(match => match !== null)
        .slice(0, 10);

    if (matchesWithHtml.length > 0) {
        matchesWithHtml.forEach(([htmlContent, idProducto]) => {
            const item = document.createElement('div');
            item.className = 'sugerencia-item';
            item.innerHTML = htmlContent;

            item.onclick = () => {
                document.getElementById('busquedaGeneral').value = `${articulos.find(p => p.idProducto === idProducto)?.codigo || ''} - ${articulos.find(p => p.idProducto === idProducto)?.descripcion || ''}`;
                sugerenciasDiv.style.display = 'none';
                aplicarFiltros(idProducto);
            };
            sugerenciasDiv.appendChild(item);
        });
        sugerenciasDiv.style.display = 'block';
    } else {
        sugerenciasDiv.style.display = 'none';
    }
}


function aplicarFiltros(idArticuloSeleccionado = null) {
    const marcaId = document.getElementById('filtroMarca').value;
    const categoriaId = document.getElementById('filtroCategoria').value;
    const tipoId = document.getElementById('filtroTipo').value;
    const busquedaQuery = document.getElementById('busquedaGeneral').value.toLowerCase().trim();

    let filtrados = articulos;
    document.getElementById('sugerencias').style.display = 'none';

    if (idArticuloSeleccionado !== null) {
        filtrados = articulos.filter(p => p.idProducto === idArticuloSeleccionado);

        document.getElementById('filtroMarca').value = '';
        document.getElementById('filtroCategoria').value = '';
        document.getElementById('filtroTipo').value = '';
    } else {
        filtrados = articulos.filter(p => {
            const pMarcaId = String(p.marca?.idMarca || p.idMarca || '');
            const pCategoriaId = String(p.categoria?.idCategoria || p.idCategoria || '');
            const pTipoId = String(p.tipoArticulo?.id || p.idTipoArticulo || '');

            const categoryMatches = (marcaId === '' || pMarcaId === marcaId) &&
                (categoriaId === '' || pCategoriaId === categoriaId) &&
                (tipoId === '' || pTipoId === tipoId);

            const textMatches = (busquedaQuery === '' ||
                (p.codigo && p.codigo.toLowerCase().includes(busquedaQuery)) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(busquedaQuery))
            );

            return categoryMatches && textMatches;
        });
    }

    paginaActual = 1;
    mostrarTabla(filtrados);
}

function mostrarTabla(listaCompleta) {
    articulosFiltrados = listaCompleta;
    const tbody = document.querySelector('#tabla-articulos tbody');
    tbody.innerHTML = '';
    const totalPaginas = Math.ceil(articulosFiltrados.length / ARTICULOS_POR_PAGINA);

    if (paginaActual > totalPaginas) {
        paginaActual = Math.max(1, totalPaginas);
    }

    const COLSPAN = 6;
    const inicio = (paginaActual - 1) * ARTICULOS_POR_PAGINA;
    const fin = inicio + ARTICULOS_POR_PAGINA;
    const articulosPagina = articulosFiltrados.slice(inicio, fin);

    if (articulosPagina.length === 0 && articulos.length > 0) {
        tbody.innerHTML = `<tr><td colspan="${COLSPAN}" class="data-center" style="padding: 30px; color: var(--light-text-color);">No se encontraron artículos que coincidan con los filtros aplicados.</td></tr>`;
    } else if (articulos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${COLSPAN}" class="data-center" style="padding: 30px; color: var(--light-text-color);">No se encontraron artículos en la base de datos.</td></tr>`;
    }

    articulosPagina.forEach(p => {
        const unidadDisplay = getUnidadDisplay(p);
        const pesoUnitario = (p.pesoUnitario !== undefined && p.pesoUnitario !== null) ? p.pesoUnitario.toFixed(3) : '0.000';

        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${p.codigo || '-'}</td>
            <td>${p.descripcion || 'Sin descripción'}</td>
            <td class="data-center">${p.cantidad || 0}</td>
            <td class="data-center">${pesoUnitario}</td>
            <td class="data-unit">${unidadDisplay}</td>
            <td class="actions">
                <button class="btn-info btn-sm" title="Ver Lotes" onclick="verLotes(${p.idProducto}, '${p.descripcion}')"><i class="fas fa-box-open"></i></button>
                <button class="btn-info btn-sm" title="Ver Detalles Secundarios" onclick="mostrarDetalles(${p.idProducto})"><i class="fas fa-info-circle"></i></button>
                <button class="btn-warning btn-sm" title="Editar Artículo" onclick="abrirFormulario(${p.idProducto})"><i class="fas fa-edit"></i></button>
                <button class="btn-delete btn-sm" title="Eliminar Artículo" onclick="eliminarArticulo(${p.idProducto})"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    renderPaginacion(totalPaginas);
}

function generarReporteImprimible() {
    const idCategoriaSeleccionada = document.getElementById('filtroCategoria').value;
    const idTipoSeleccionado = document.getElementById('filtroTipo').value;

    let tituloReporte = "Reporte General de Artículos";

    if (idCategoriaSeleccionada) {
        const categoria = catalogos['categoria'] ? catalogos['categoria'].find(c => String(c.idCategoria) === String(idCategoriaSeleccionada)) : null;
        if (categoria) {
            tituloReporte = `Reporte por Categoría: ${categoria.nombre}`;
        }
    } else if (idTipoSeleccionado) {
        const tipo = catalogos['tipo'] ? catalogos['tipo'].find(t => String(t.id) === String(idTipoSeleccionado)) : null;
        if (tipo) {
            tituloReporte = `Reporte por Tipo de Artículo: ${tipo.nombre}`;
        }
    }

    const datosReporte = articulosFiltrados;

    if (!datosReporte || datosReporte.length === 0) {
        showCustomAlert('Alerta', 'No hay artículos para generar el reporte con los filtros actuales.');
        return;
    }

    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${tituloReporte}</title>
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    margin: 5mm;
                    color: #333;
                    font-size: 8pt;
                }
                h1 {
                    text-align: center;
                    color: #007bff;
                    margin-bottom: 8px;
                    font-size: 12pt;
                }
                p {
                    font-size: 8pt;
                    margin-bottom: 3px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 5px;
                    font-size: 8pt;
                }
                th, td {
                    border: 1px solid #ccc;
                    padding: 2px 4px;
                    text-align: left;
                }
                th {
                    background-color: #e9ecef;
                    color: #495057;
                    font-weight: 600;
                }
                .data-center {
                    text-align: center;
                }
                @media print {
                    @page { margin: 5mm; }
                }
            </style>
        </head>
        <body>
            <h1>${tituloReporte}</h1>
            <p>Fecha de Generación: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
            <table>
                <thead>
                    <tr>
                        <th style="width: 15%;">Código</th>
                        <th style="width: 50%;">Nombre del Producto (Descripción)</th>
                        <th class="data-center" style="width: 15%;">Stock</th>
                        <th class="data-center" style="width: 20%;">Coincide Stock?</th>
                    </tr>
                </thead>
                <tbody>
    `;

    datosReporte.forEach(articulo => {
        htmlContent += `
            <tr>
                <td>${articulo.codigo || ''}</td>
                <td>${articulo.descripcion || ''}</td>
                <td class="data-center">${articulo.cantidad || 0}</td>
                <td class="data-center"></td>
            </tr>
        `;
    });

    htmlContent += `
                </tbody>
            </table>
            <p style="margin-top: 10px;">Total de Artículos: ${datosReporte.length}</p>
        </body>
        </html>
    `;

    const ventanaReporte = window.open('', '_blank');
    ventanaReporte.document.write(htmlContent);
    ventanaReporte.document.close();

    ventanaReporte.onload = () => {
        ventanaReporte.print();
    };
}


function cambiarPagina(nuevaPagina) {
    const totalPaginas = Math.ceil(articulosFiltrados.length / ARTICULOS_POR_PAGINA);

    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas && paginaActual !== nuevaPagina) {
        paginaActual = nuevaPagina;
        mostrarTabla(articulosFiltrados);
    }
}

function renderPaginacion(totalPaginas) {
    const paginacionDiv = document.getElementById('paginacion-controles');

    const pageControlsContainer = paginacionDiv.querySelector('.page-controls-container');
    const exportControls = paginacionDiv.querySelector('.export-controls');

    pageControlsContainer.innerHTML = '';

    const totalItems = articulosFiltrados.length;

    if (totalItems === 0) {
        pageControlsContainer.innerHTML = '';
        return;
    }

    if (totalPaginas <= 1) {
        const pageInfo = document.createElement('span');
        pageInfo.className = 'page-info';
        pageInfo.textContent = `Total: ${totalItems} artículo${totalItems === 1 ? '' : 's'}`;
        pageControlsContainer.appendChild(pageInfo);
    } else {
        const btnPrev = document.createElement('button');
        btnPrev.className = 'btn-page';
        btnPrev.innerHTML = '<i class="fas fa-chevron-left"></i> Anterior';
        btnPrev.disabled = paginaActual === 1;
        btnPrev.onclick = () => cambiarPagina(paginaActual - 1);
        pageControlsContainer.appendChild(btnPrev);

        const pageInfo = document.createElement('span');
        pageInfo.className = 'page-info';
        pageInfo.textContent = `Página ${paginaActual} de ${totalPaginas} (${totalItems} artículos)`;
        pageControlsContainer.appendChild(pageInfo);

        const btnNext = document.createElement('button');
        btnNext.className = 'btn-page';
        btnNext.innerHTML = 'Siguiente <i class="fas fa-chevron-right"></i>';
        btnNext.disabled = paginaActual === totalPaginas;
        btnNext.onclick = () => cambiarPagina(paginaActual + 1);
        pageControlsContainer.appendChild(btnNext);
    }
}

async function guardarCatalogoItem(entidad, inputId, modalCloser) {
    event.preventDefault();
    showLoading(true);
    const nombre = document.getElementById(inputId).value;

    const formData = new URLSearchParams();
    formData.append('entidad', entidad);
    formData.append('accion', 'insertar');
    formData.append('nombre', nombre);

    try {
        const res = await fetch(API_CATALOGO, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });

        const textResponse = await res.text();
        let data = { exito: false, mensaje: textResponse };

        if (textResponse.includes("correctamente")) {
            data = { exito: true, mensaje: `${entidad.charAt(0).toUpperCase() + entidad.slice(1)} agregado con éxito.` };
        } else {
             try {
                const json = JSON.parse(textResponse);
                data.mensaje = json.mensaje || textResponse;
            } catch (e) {
                data.mensaje = textResponse;
            }
        }

        if (data.exito) {
            showCustomAlert('Éxito', data.mensaje, async () => {
                modalCloser();
                await cargarCatalogos();
                aplicarFiltros();
            });
        } else {
            showCustomAlert('Error', `Error al agregar ${entidad}: ${data.mensaje}`);
        }

    } catch (error) {
        console.error(`Error al guardar ${entidad}:`, error);
        showCustomAlert('Error de Conexión', 'Error de conexión al guardar el catálogo. Revisa tu red o el log del servidor.');
    } finally {
        showLoading(false);
    }
}

function abrirModalMarca() {
    document.getElementById('marcaForm').reset();
    document.getElementById('marcaModal').style.display = 'flex';
}
function cerrarModalMarca() {
    document.getElementById('marcaModal').style.display = 'none';
}
function guardarMarca(event) {
    guardarCatalogoItem('marca', 'nombreMarca', cerrarModalMarca);
}


function abrirModalCategoria() {
    document.getElementById('categoriaForm').reset();
    document.getElementById('categoriaModal').style.display = 'flex';
}
function cerrarModalCategoria() {
    document.getElementById('categoriaModal').style.display = 'none';
}
function guardarCategoria(event) {
    guardarCatalogoItem('categoria', 'nombreCategoria', cerrarModalCategoria);
}


function abrirModalTipo() {
    document.getElementById('tipoForm').reset();
    document.getElementById('tipoModal').style.display = 'flex';
}
function cerrarModalTipo() {
    document.getElementById('tipoModal').style.display = 'none';
}
function guardarTipo(event) {
    guardarCatalogoItem('tipo', 'nombreTipo', cerrarModalTipo);
}

function exportarDatos(format) {
    if (articulosFiltrados.length === 0) {
        showCustomAlert('Información', 'No hay artículos para exportar. Aplica los filtros o carga la lista completa.');
        return;
    }

    const headers = [
        "ID Producto", "Código", "Descripción", "Stock", "Precio Compra (S/)", "Precio Venta (S/)", "Peso Unitario (kg)",
        "Densidad", "Aroma", "Color",
        "Marca", "Categoría", "Tipo", "Unidad de Medida", "Abreviatura Unidad"
    ];

    const sanitize = (value) => {
        if (value === null || value === undefined) return '';
        return `"${String(value).replace(/"/g, '""')}"`;
    };

    const csvRows = articulosFiltrados.map(articulo => {
        const marca = articulo.marca?.nombre || getNombreCatalogoById('marca', articulo.idMarca, 'idMarca', 'nombre');
        const categoria = articulo.categoria?.nombre || getNombreCatalogoById('categoria', articulo.idCategoria, 'idCategoria', 'nombre');
        const tipo = articulo.tipoArticulo?.nombre || getNombreCatalogoById('tipo', articulo.idTipoArticulo, 'id', 'nombre');

        const unidad = catalogos['unidad'] ? catalogos['unidad'].find(u => u.idUnidad === (articulo.unidad?.idUnidad || articulo.idUnidad)) : {};
        const unidadNombre = unidad?.nombre || '';
        const unidadAbreviatura = unidad?.abreviatura || '';

        return [
            sanitize(articulo.idProducto),
            sanitize(articulo.codigo),
            sanitize(articulo.descripcion),
            sanitize(articulo.cantidad),
            sanitize(articulo.precioCompra),
            sanitize(articulo.precioVenta),
            sanitize(articulo.pesoUnitario),
            sanitize(articulo.densidad),
            sanitize(articulo.aroma),
            sanitize(articulo.color),
            sanitize(marca),
            sanitize(categoria),
            sanitize(tipo),
            sanitize(unidadNombre),
            sanitize(unidadAbreviatura)
        ].join(',');
    });

    const csvContent = [
        headers.join(','),
        ...csvRows
    ].join('\n');

    let mimeType;
    let extension;
    let fileNameFormat;

    if (format === 'xlsx') {
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        extension = 'xlsx';
        fileNameFormat = 'Inventario_Excel_';
    } else {
        mimeType = 'text/csv;charset=utf-8;';
        extension = 'csv';
        fileNameFormat = 'Inventario_CSV_';
    }

    const BOM = "\ufeff";
    const blob = new Blob([BOM + csvContent], { type: mimeType });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    const fileName = fileNameFormat + new Date().toISOString().slice(0, 10) + '.' + extension;
    link.setAttribute('download', fileName);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showCustomAlert('Exportación Completa', `Se exportaron ${articulosFiltrados.length} artículos al archivo .${extension}.`);
}


document.getElementById('articuloForm').addEventListener('submit', guardarArticulo);
document.getElementById('idMarca').addEventListener('change', () => manejarCambioFormulario(document.getElementById('idMarca')));
document.getElementById('idCategoria').addEventListener('change', () => manejarCambioFormulario(document.getElementById('idCategoria')));
document.getElementById('idTipoArticulo').addEventListener('change', () => manejarCapacidadTipo()); // Usamos manejarCapacidadTipo

window.onload = async () => {
    window.abrirFormulario = abrirFormulario;
    window.cerrarFormulario = cerrarFormulario;
    window.mostrarDetalles = mostrarDetalles;
    window.eliminarArticulo = eliminarArticulo;
    window.aplicarFiltros = aplicarFiltros;
    window.listarArticulos = listarArticulos;
    window.renderSugerencias = renderSugerencias;
    window.verLotes = verLotes;
    window.manejarCambioFiltro = manejarCambioFiltro;
    window.manejarCapacidadTipo = manejarCapacidadTipo; // Exponer para el onchange en el HTML

    window.abrirModalMarca = abrirModalMarca;
    window.cerrarModalMarca = cerrarModalMarca;
    window.abrirModalCategoria = abrirModalCategoria;
    window.cerrarModalCategoria = cerrarModalCategoria;
    window.abrirModalTipo = abrirModalTipo;
    window.cerrarModalTipo = cerrarModalTipo;
    window.exportarDatos = exportarDatos;
    window.generarReporteImprimible = generarReporteImprimible;

    await cargarCatalogos();
    await listarArticulos();
};

window.onclick = function(event) {
    const articuloModal = document.getElementById('articuloModal');
    const detallesModal = document.getElementById('detallesModal');
    const sugerenciasDiv = document.getElementById('sugerencias');
    const busquedaInput = document.getElementById('busquedaGeneral');
    const lotesModal = document.getElementById('lotesModal');

    const marcaModal = document.getElementById('marcaModal');
    const categoriaModal = document.getElementById('categoriaModal');
    const tipoModal = document.getElementById('tipoModal');
    const messageModal = document.getElementById('messageModal');

    if (event.target == articuloModal) { cerrarFormulario(); }
    if (event.target == detallesModal) { detallesModal.style.display = 'none'; }
    if (event.target == lotesModal) { lotesModal.style.display = 'none'; }
    if (event.target == marcaModal) { cerrarModalMarca(); }
    if (event.target == categoriaModal) { cerrarModalCategoria(); }
    if (event.target == tipoModal) { cerrarModalTipo(); }

    if (event.target == messageModal) {
        messageModal.style.display = 'none';
        if (document.getElementById('messageCancelBtn').style.display === 'inline-block') {
            document.getElementById('messageCancelBtn').click();
        } else {
            document.getElementById('messageOkBtn').click();
        }
    }

    if (sugerenciasDiv.style.display === 'block' && event.target !== busquedaInput && !sugerenciasDiv.contains(event.target)) {
        sugerenciasDiv.style.display = 'none';
    }
}