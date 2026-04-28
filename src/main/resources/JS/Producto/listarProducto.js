const API_ARTICULOS = '/productos';
const API_CATALOGO = '/CatalogoServlet';
console.log("JS CARGADO");
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

function getNombreCatalogoById(entidad, id, keyId, keyNombre, keyAbrev = null) {
    if (!catalogos[entidad] || !id || id == 0) return 'Desconocida';
    const item = catalogos[entidad].find(i => String(i[keyId]) === String(id));

    if (item) {
        return (keyAbrev && item[keyAbrev]) ? `${item[keyNombre]} - ${item[keyAbrev]}` : item[keyNombre];
    }
    return 'Desconocida';
}

function getUnidadDisplay(articulo) {
    const unidadId = articulo.unidad?.idUnidad || articulo.idUnidad;
    if (!unidadId || unidadId == 0) return 'N/A';
    const item = catalogos['unidad'] ? catalogos['unidad'].find(i => String(i.idUnidad) === String(unidadId)) : null;
    return item ? `${item.nombre} - ${item.abreviatura || 's/a'}` : 'Desconocida';
}

function cerrarFormulario() {
    document.getElementById('articuloModal').style.display = 'none';
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

    const details = [
        { label: 'Marca', value: articulo.marca?.nombre || getNombreCatalogoById('marca', marcaId, 'idMarca', 'nombre') },
        { label: 'Categoría', value: articulo.categoria?.nombre || getNombreCatalogoById('categoria', categoriaId, 'idCategoria', 'nombre') },
        { label: 'Tipo de Artículo', value: articulo.tipoArticulo?.nombre || getNombreCatalogoById('tipo', tipoId, 'id', 'nombre') },
        { label: 'Unidad de Medida', value: getUnidadDisplay(articulo) },
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

    tablaLotesBody.innerHTML = '';
    lotesEmptyMessage.style.display = 'none';
    lotesModalTitle.textContent = `Lotes del Artículo: ${descripcionArticulo}`;
    showLoading(true);

    try {
        const response = await fetch(`${API_ARTICULOS}?accion=ver_lotes&id_articulo=${idArticulo}`);

        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            let errorDetail = `Error HTTP ${response.status}.`;
            if (contentType && contentType.includes("application/json")) {
                const errorJson = await response.json();
                errorDetail = errorJson.mensaje || errorDetail;
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
             throw new Error(lotes.mensaje || "Error al cargar los lotes.");
        }
        lotesModal.style.display = 'flex';
    } catch (error) {
        showCustomAlert("Error de Lotes", `No se pudieron cargar los lotes. Detalle: ${error.message}`, false);
    } finally {
        showLoading(false);
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
        capacidadInput.value = '';
    }
}

async function abrirFormulario(id = 0) {
    const modal = document.getElementById('articuloModal');
    const form = document.getElementById('articuloForm');
    form.reset();
    document.getElementById('idProducto').value = 0;
    document.getElementById('articuloModalHeader').querySelector('h2').textContent = 'Nuevo Artículo';

    await cargarFormularioSelects();

    let idMarcaOriginal = '', idCategoriaOriginal = '', idTipoArticuloOriginal = '';

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

            if (document.getElementById('capacidad')) {
                 document.getElementById('capacidad').value = articulo.capacidad || '';
            }
            document.getElementById('articuloModalHeader').querySelector('h2').textContent = 'Editar Artículo';
        }
    }

    document.getElementById('idMarca').value = idMarcaOriginal;
    document.getElementById('idCategoria').value = idCategoriaOriginal;
    document.getElementById('idTipoArticulo').value = idTipoArticuloOriginal;

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
            let optionText = (end.entidad === 'unidad' && item.abreviatura)
                ? `${item[end.keyNombre]} - ${item[end.keyAbrev]}`
                : item[end.keyNombre];
            selectForm.innerHTML += `<option value="${item[end.keyId]}">${optionText}</option>`;
        });
    }
}

async function cargarCatalogos() {
    showLoading(true);
    const endpoints = [
        { id: 'idMarca', entidad: 'marca', keyId: 'idMarca', keyNombre: 'nombre', filtro: 'filtroMarca' },
        { id: 'idCategoria', entidad: 'categoria', keyId: 'idCategoria', keyNombre: 'nombre', filtro: 'filtroCategoria' },
        { id: 'idUnidad', entidad: 'unidad', keyId: 'idUnidad', keyNombre: 'nombre', keyAbrev: 'abreviatura', filtro: 'filtroUnidad' },
        { id: 'idTipoArticulo', entidad: 'tipo', keyId: 'id', keyNombre: 'nombre', filtro: 'filtroTipo' }
    ];

    for (const end of endpoints) {
        try {
            const res = await fetch(`${API_CATALOGO}?entidad=${end.entidad}`);
            if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

            const data = await res.json();
            if (!data) throw new Error(`Fallo al obtener datos de ${end.entidad}.`);

            catalogos[end.entidad] = data;
            const selectForm = document.getElementById(end.id);
            selectForm.innerHTML = `<option value="">-- Seleccione --</option>`;

            if (end.filtro) {
                const selectFiltro = document.getElementById(end.filtro);
                if (selectFiltro) {
                    selectFiltro.innerHTML = '<option value="">Todas</option>';
                    data.forEach(item => {
                        selectFiltro.innerHTML += `<option value="${item[end.keyId]}">${item[end.keyNombre]}</option>`;
                    });
                }
            }
        } catch (error) {
            console.error(`Error al cargar ${end.entidad}:`, error);
        }
    }
    showLoading(false);
}

function manejarCambioFiltro() {
    aplicarFiltros();
}

async function listarArticulos() {
    showLoading(true);
    try {
        const res = await fetch(`${API_ARTICULOS}?accion=listar`);
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

        articulos = await res.json();
        if (!Array.isArray(articulos)) articulos = [];

        paginaActual = 1;
        aplicarFiltros();
    } catch (error) {
        console.error('Error al listar artículos:', error);
        showCustomAlert('Error de Carga', 'Error al cargar la lista de artículos.');
    } finally {
        showLoading(false);
    }
}

function getHighlightedMatch(queryLower, p) {
    const codigo = p.codigo || '';
    const descripcion = p.descripcion || 'Sin descripción';
    let index = codigo.toLowerCase().indexOf(queryLower);

    if (index !== -1) {
        const highlightedText = `${codigo.substring(0, index)}<span class="highlight">${codigo.substring(index, index + queryLower.length)}</span>${codigo.substring(index + queryLower.length)}`;
        return [`${highlightedText} - ${descripcion}`, p.idProducto];
    }

    index = descripcion.toLowerCase().indexOf(queryLower);
    if (index !== -1) {
        const highlightedText = `${descripcion.substring(0, index)}<span class="highlight">${descripcion.substring(index, index + queryLower.length)}</span>${descripcion.substring(index + queryLower.length)}`;
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
                const prod = articulos.find(p => p.idProducto === idProducto);
                document.getElementById('busquedaGeneral').value = `${prod?.codigo || ''} - ${prod?.descripcion || ''}`;
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
    const unidadId = document.getElementById('filtroUnidad').value;
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
            console.log(articulos[0]);
            const pMarcaId = String(p.marca?.idMarca || p.idMarca || '');
            const pCategoriaId = String(p.categoria?.idCategoria || p.idCategoria || '');
            const pTipoId = String(p.tipoArticulo?.id || p.idTipoArticulo || '');
            const pUnidadId = String(p.unidad?.idUnidad || p.idUnidad || '');

            const categoryMatches = (marcaId === '' || pMarcaId === marcaId) &&
                (categoriaId === '' || pCategoriaId === categoriaId) &&
                (tipoId === '' || pTipoId === tipoId) &&
                (unidadId === '' || pUnidadId === unidadId);

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

    if (paginaActual > totalPaginas) paginaActual = Math.max(1, totalPaginas);

    const inicio = (paginaActual - 1) * ARTICULOS_POR_PAGINA;
    const fin = inicio + ARTICULOS_POR_PAGINA;
    const articulosPagina = articulosFiltrados.slice(inicio, fin);
    const COLSPAN = 6;

    if (articulosPagina.length === 0) {
        const msg = articulos.length > 0 ? 'No se encontraron artículos con los filtros aplicados.' : 'No se encontraron artículos en la base de datos.';
        tbody.innerHTML = `<tr><td colspan="${COLSPAN}" class="data-center" style="padding: 30px; color: var(--light-text-color);">${msg}</td></tr>`;
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
    pageControlsContainer.innerHTML = '';
    const totalItems = articulosFiltrados.length;

    if (totalItems === 0) return;

    if (totalPaginas <= 1) {
        pageControlsContainer.innerHTML = `<span class="page-info">Total: ${totalItems} artículo${totalItems === 1 ? '' : 's'}</span>`;
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

async function guardarArticulo(event) {
    event.preventDefault();
    showLoading(true);
    const formElement = event.target;
    const idProducto = document.getElementById('idProducto').value;
    const url = API_ARTICULOS;
    const method = idProducto === "0" ? 'POST' : 'PUT';
    const statusMensaje = idProducto === "0" ? 'agregado' : 'actualizado';

    const formData = new FormData(formElement);

    const numericFields = [
        'cantidad', 'precio_compra', 'precio_venta', 'peso_unitario', 'densidad',
        'id_marca', 'id_categoria', 'id_unidad', 'id_tipo_articulo', 'capacidad'
    ];

    numericFields.forEach(field => {
        if (!formData.get(field) || formData.get(field).trim() === '') {
            formData.set(field, '0');
        }
    });

    const params = new URLSearchParams(formData).toString();

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });
        const data = await res.json();

        if (data.exito) {
            showCustomAlert('Éxito', `Artículo ${statusMensaje} con éxito.`, async () => {
                cerrarFormulario();
                await listarArticulos();
            });
        } else {
            showCustomAlert('Error', `Error al guardar el artículo: ${data.mensaje}`);
        }
    } catch (error) {
        console.error('Error al guardar:', error);
        showCustomAlert('Error de Conexión', 'Error de conexión al guardar el artículo.');
    } finally {
        showLoading(false);
    }
}

async function eliminarArticulo(id) {
    showCustomConfirm('Confirmar Eliminación', '¿Estás seguro de que deseas eliminar este artículo? Esta acción es irreversible.', async (confirmed) => {
        if (!confirmed) return;
        showLoading(true);
        try {
            const res = await fetch(`${API_ARTICULOS}?id_producto=${id}`, { method: 'DELETE' });
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

async function guardarCatalogoItem(entidad, inputId, modalCloser) {
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
            } catch (e) {}
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
        showCustomAlert('Error de Conexión', 'No se pudo guardar el catálogo.');
    } finally {
        showLoading(false);
    }
}

function abrirModalMarca() { document.getElementById('marcaForm').reset(); document.getElementById('marcaModal').style.display = 'flex'; }
function cerrarModalMarca() { document.getElementById('marcaModal').style.display = 'none'; }
function guardarMarca(event) { event.preventDefault(); guardarCatalogoItem('marca', 'nombreMarca', cerrarModalMarca); }

function abrirModalCategoria() { document.getElementById('categoriaForm').reset(); document.getElementById('categoriaModal').style.display = 'flex'; }
function cerrarModalCategoria() { document.getElementById('categoriaModal').style.display = 'none'; }
function guardarCategoria(event) { event.preventDefault(); guardarCatalogoItem('categoria', 'nombreCategoria', cerrarModalCategoria); }

function abrirModalTipo() { document.getElementById('tipoForm').reset(); document.getElementById('tipoModal').style.display = 'flex'; }
function cerrarModalTipo() { document.getElementById('tipoModal').style.display = 'none'; }
function guardarTipo(event) { event.preventDefault(); guardarCatalogoItem('tipo', 'nombreTipo', cerrarModalTipo); }

function abrirModalUnidad() { document.getElementById('unidadForm').reset(); document.getElementById('unidadModal').style.display = 'flex'; }
function cerrarModalUnidad() { document.getElementById('unidadModal').style.display = 'none'; }
function guardarUnidad(event) { event.preventDefault(); guardarCatalogoItem('unidad', 'nombreUnidad', cerrarModalUnidad); }

function generarReporteImprimible() {
    const idCategoriaSeleccionada = document.getElementById('filtroCategoria').value;
    const idTipoSeleccionado = document.getElementById('filtroTipo').value;
    let tituloReporte = "Reporte General de Artículos";

    if (idCategoriaSeleccionada) {
        const cat = catalogos['categoria']?.find(c => String(c.idCategoria) === String(idCategoriaSeleccionada));
        if (cat) tituloReporte = `Reporte por Categoría: ${cat.nombre}`;
    } else if (idTipoSeleccionado) {
        const tip = catalogos['tipo']?.find(t => String(t.id) === String(idTipoSeleccionado));
        if (tip) tituloReporte = `Reporte por Tipo de Artículo: ${tip.nombre}`;
    }

    if (!articulosFiltrados || articulosFiltrados.length === 0) {
        showCustomAlert('Alerta', 'No hay artículos para generar el reporte con los filtros actuales.');
        return;
    }

    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${tituloReporte}</title>
            <style>
                body { font-family: 'Inter', sans-serif; margin: 5mm; color: #333; font-size: 8pt; }
                h1 { text-align: center; color: #007bff; margin-bottom: 8px; font-size: 12pt; }
                p { font-size: 8pt; margin-bottom: 3px; }
                table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 8pt; }
                th, td { border: 1px solid #ccc; padding: 2px 4px; text-align: left; }
                th { background-color: #e9ecef; color: #495057; font-weight: 600; }
                .data-center { text-align: center; }
                @media print { @page { margin: 5mm; } }
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

    articulosFiltrados.forEach(articulo => {
        htmlContent += `
            <tr>
                <td>${articulo.codigo || ''}</td>
                <td>${articulo.descripcion || ''}</td>
                <td class="data-center">${articulo.cantidad || 0}</td>
                <td class="data-center"></td>
            </tr>
        `;
    });

    htmlContent += `</tbody></table><p style="margin-top: 10px;">Total de Artículos: ${articulosFiltrados.length}</p></body></html>`;
    const ventanaReporte = window.open('', '_blank');
    ventanaReporte.document.write(htmlContent);
    ventanaReporte.document.close();
    ventanaReporte.onload = () => { ventanaReporte.print(); };
}

function exportarDatos(format) {
    if (articulosFiltrados.length === 0) {
        showCustomAlert('Información', 'No hay artículos para exportar.');
        return;
    }

    const headers = ["ID Producto", "Código", "Descripción", "Stock", "Precio Compra (S/)", "Precio Venta (S/)", "Peso Unitario (kg)", "Densidad", "Aroma", "Color", "Marca", "Categoría", "Tipo", "Unidad de Medida", "Abreviatura Unidad"];
    const sanitize = (value) => (value === null || value === undefined) ? '' : `"${String(value).replace(/"/g, '""')}"`;
    const isXlsx = format === 'xlsx';

    const dataRows = articulosFiltrados.map(articulo => {
        const marca = articulo.marca?.nombre || getNombreCatalogoById('marca', articulo.idMarca, 'idMarca', 'nombre');
        const categoria = articulo.categoria?.nombre || getNombreCatalogoById('categoria', articulo.idCategoria, 'idCategoria', 'nombre');
        const tipo = articulo.tipoArticulo?.nombre || getNombreCatalogoById('tipo', articulo.idTipoArticulo, 'id', 'nombre');
        const unidad = catalogos['unidad'] ? catalogos['unidad'].find(u => u.idUnidad === (articulo.unidad?.idUnidad || articulo.idUnidad)) : {};

        return [
            articulo.idProducto ?? '',
            articulo.codigo ?? '',
            articulo.descripcion ?? '',
            articulo.cantidad ?? '',
            articulo.precioCompra ?? '',
            articulo.precioVenta ?? '',
            articulo.pesoUnitario ?? '',
            articulo.densidad ?? '',
            articulo.aroma ?? '',
            articulo.color ?? '',
            marca || '',
            categoria || '',
            tipo || '',
            unidad?.nombre || '',
            unidad?.abreviatura || ''
        ];
    });

    if (isXlsx) {
        if (typeof XLSX === 'undefined') {
            showCustomAlert('Error de Exportación', 'No se pudo cargar el generador de Excel (.xlsx).');
            return;
        }

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const excelLink = document.createElement('a');
        excelLink.href = URL.createObjectURL(excelBlob);
        excelLink.setAttribute('download', `Inventario_Excel_${new Date().toISOString().slice(0, 10)}.xlsx`);
        document.body.appendChild(excelLink);
        excelLink.click();
        document.body.removeChild(excelLink);
        URL.revokeObjectURL(excelLink.href);
    } else {
        const csvRows = dataRows.map(row => row.map(sanitize).join(','));
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `Inventario_CSV_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    showCustomAlert('Exportación Completa', `Se exportaron ${articulosFiltrados.length} artículos.`);
}

document.getElementById('articuloForm').addEventListener('submit', guardarArticulo);
document.getElementById('idTipoArticulo').addEventListener('change', () => manejarCapacidadTipo());

window.onload = async () => {
    Object.assign(window, {
        abrirFormulario, cerrarFormulario, mostrarDetalles, eliminarArticulo, aplicarFiltros, listarArticulos,
        renderSugerencias, verLotes, manejarCambioFiltro, manejarCapacidadTipo,
        abrirModalMarca, cerrarModalMarca, guardarMarca,
        abrirModalCategoria, cerrarModalCategoria, guardarCategoria,
        abrirModalTipo, cerrarModalTipo, guardarTipo,
        abrirModalUnidad, cerrarModalUnidad, guardarUnidad,
        exportarDatos, generarReporteImprimible
    });

    await cargarCatalogos();
    await listarArticulos();
};

window.onclick = function(event) {
    const modals = [
        document.getElementById('articuloModal'),
        document.getElementById('detallesModal'),
        document.getElementById('lotesModal'),
        document.getElementById('marcaModal'),
        document.getElementById('categoriaModal'),
        document.getElementById('tipoModal'),
        document.getElementById('unidadModal')
    ];

    modals.forEach(m => { if (event.target == m) m.style.display = 'none'; });

    const messageModal = document.getElementById('messageModal');
    if (event.target == messageModal) {
        messageModal.style.display = 'none';
        const cancelBtn = document.getElementById('messageCancelBtn');
        (cancelBtn.style.display === 'inline-block') ? cancelBtn.click() : document.getElementById('messageOkBtn').click();
    }

    const sugerenciasDiv = document.getElementById('sugerencias');
    const busquedaInput = document.getElementById('busquedaGeneral');
    if (sugerenciasDiv.style.display === 'block' && event.target !== busquedaInput && !sugerenciasDiv.contains(event.target)) {
        sugerenciasDiv.style.display = 'none';
    }
}