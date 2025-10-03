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

    function abrirFormulario(id = 0) {
        const modal = document.getElementById('articuloModal');
        const form = document.getElementById('articuloForm');
        form.reset();
        document.getElementById('idProducto').value = 0;
        document.getElementById('articuloModalHeader').querySelector('h2').textContent = 'Nuevo Artículo';

        if (id > 0) {
            const articulo = articulos.find(a => a.idProducto === id);
            if (articulo) {
                document.getElementById('idProducto').value = articulo.idProducto;
                document.getElementById('codigo').value = articulo.codigo;
                document.getElementById('descripcion').value = articulo.descripcion;
                document.getElementById('cantidad').value = articulo.cantidad;
                document.getElementById('precioUnitario').value = articulo.precioUnitario;
                document.getElementById('pesoUnitario').value = articulo.pesoUnitario;
                document.getElementById('densidad').value = articulo.densidad;
                document.getElementById('aroma').value = articulo.aroma || '';
                document.getElementById('color').value = articulo.color || '';

                document.getElementById('idMarca').value = String(articulo.marca?.idMarca || articulo.idMarca || '');
                document.getElementById('idCategoria').value = String(articulo.categoria?.idCategoria || articulo.idCategoria || '');
                document.getElementById('idUnidad').value = String(articulo.unidad?.idUnidad || articulo.idUnidad || '');
                document.getElementById('idTipoArticulo').value = String(articulo.tipoArticulo?.id || articulo.idTipoArticulo || '');

                document.getElementById('articuloModalHeader').querySelector('h2').textContent = 'Editar Artículo';
            }
        }
        modal.style.display = 'flex';
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
                }

                data.forEach(item => {
                    let optionText;

                    if (end.entidad === 'unidad' && item.abreviatura) {
                        optionText = `${item[end.keyNombre]} - ${item[end.keyAbrev]}`;
                    } else if (end.keyAbrev) {
                        optionText = `${item[end.keyNombre]} (${item[end.keyAbrev] || 's/a'})`;
                    } else {
                        optionText = item[end.keyNombre];
                    }

                    const optionValue = item[end.keyId];

                    const option = `<option value="${optionValue}">${optionText}</option>`;
                    selectForm.innerHTML += option;

                    if (end.filtro) {
                        const selectFiltro = document.getElementById(end.filtro);
                        selectFiltro.innerHTML += `<option value="${optionValue}">${item[end.keyNombre]}</option>`;
                    }
                });
            } catch (error) {
                console.error(`Error al cargar ${end.entidad}:`, error);
                showCustomAlert('Error de Catálogo', `No se pudo cargar la lista de ${end.entidad}. Verifica el Servlet: ${error.message}`);
            }
        }
        showLoading(false);
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

        const COLSPAN = 7;
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

            const precioUnitario = (p.precioUnitario !== undefined && p.precioUnitario !== null) ? p.precioUnitario.toFixed(2) : '0.00';
            const pesoUnitario = (p.pesoUnitario !== undefined && p.pesoUnitario !== null) ? p.pesoUnitario.toFixed(3) : '0.000';

            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${p.codigo || '-'}</td>
                <td>${p.descripcion || 'Sin descripción'}</td>
                <td class="data-center">${p.cantidad || 0}</td>
                <td class="data-center">S/ ${precioUnitario}</td>
                <td class="data-center">${pesoUnitario}</td>
                <td class="data-unit">${unidadDisplay}</td>
                <td class="actions">
                    <button class="btn-info" title="Ver Detalles Secundarios" onclick="mostrarDetalles(${p.idProducto})"><i class="fas fa-info-circle"></i></button>
                    <button class="btn-edit" title="Editar Artículo" onclick="abrirFormulario(${p.idProducto})"><i class="fas fa-pen"></i></button>
                    <button class="btn-delete" title="Eliminar Artículo" onclick="eliminarArticulo(${p.idProducto})"><i class="fas fa-trash-alt"></i></button>
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

        // Contenedores fijos: page-controls-container y export-controls
        const pageControlsContainer = paginacionDiv.querySelector('.page-controls-container');
        const exportControls = paginacionDiv.querySelector('.export-controls');

        // Limpiamos solo el contenido dinámico (botones de página y info)
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

        // Asegurarse de que el orden sea Controles de Página | Controles de Exportación
        // Esto se maneja con la estructura HTML inicial y justify-content: space-between
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

    /**
     * Convierte y descarga los datos filtrados actualmente en formato CSV o compatible con Excel (XLSX).
     * @param {string} format - El formato deseado: 'csv' o 'xlsx'.
     */
    function exportarDatos(format) {
        if (articulosFiltrados.length === 0) {
            showCustomAlert('Información', 'No hay artículos para exportar. Aplica los filtros o carga la lista completa.');
            return;
        }

        // 1. Definir los encabezados (Headers)
        const headers = [
            "ID Producto", "Código", "Descripción", "Stock", "Precio Unitario (S/)", "Peso Unitario (kg)",
            "Densidad", "Aroma", "Color",
            "Marca", "Categoría", "Tipo", "Unidad de Medida", "Abreviatura Unidad"
        ];

        // Función auxiliar para sanitizar valores (reemplazar comillas y manejar null/undefined)
        const sanitize = (value) => {
            if (value === null || value === undefined) return '';
            // Envuelve el valor entre comillas y escapa cualquier comilla interna
            return `"${String(value).replace(/"/g, '""')}"`;
        };

        // 2. Mapear los datos de artículos filtrados a filas CSV
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
                sanitize(articulo.precioUnitario),
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

        // 3. Unir encabezados y filas
        const csvContent = [
            headers.join(','),
            ...csvRows
        ].join('\n');

        // 4. Determinar MIME Type y extensión basado en el formato solicitado
        let mimeType;
        let extension;
        let fileNameFormat;

        if (format === 'xlsx') {
            // Usamos este MIME type para que Excel lo abra con el formato de hoja de cálculo
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            extension = 'xlsx';
            fileNameFormat = 'Inventario_Excel_';
        } else { // 'csv' (Default)
            mimeType = 'text/csv;charset=utf-8;';
            extension = 'csv';
            fileNameFormat = 'Inventario_CSV_';
        }

        // 5. Crear el Blob y el enlace de descarga
        // El prefijo BOM (\ufeff) es CRUCIAL para que programas como Excel manejen correctamente UTF-8 (tildes, Ñ).
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

    window.onload = async () => {
        window.abrirFormulario = abrirFormulario;
        window.cerrarFormulario = cerrarFormulario;
        window.mostrarDetalles = mostrarDetalles;
        window.eliminarArticulo = eliminarArticulo;
        window.aplicarFiltros = aplicarFiltros;
        window.listarArticulos = listarArticulos;
        window.renderSugerencias = renderSugerencias;

        window.abrirModalMarca = abrirModalMarca;
        window.cerrarModalMarca = cerrarModalMarca;
        window.abrirModalCategoria = abrirModalCategoria;
        window.cerrarModalCategoria = cerrarModalCategoria;
        window.abrirModalTipo = abrirModalTipo;
        window.cerrarModalTipo = cerrarModalTipo;
        window.exportarDatos = exportarDatos; // La nueva función unificada

        await cargarCatalogos();
        await listarArticulos();
    };

    window.onclick = function(event) {
        const articuloModal = document.getElementById('articuloModal');
        const detallesModal = document.getElementById('detallesModal');
        const sugerenciasDiv = document.getElementById('sugerencias');
        const busquedaInput = document.getElementById('busquedaGeneral');

        const marcaModal = document.getElementById('marcaModal');
        const categoriaModal = document.getElementById('categoriaModal');
        const tipoModal = document.getElementById('tipoModal');
        const messageModal = document.getElementById('messageModal');

        if (event.target == articuloModal) {
            cerrarFormulario();
        }
        if (event.target == detallesModal) {
            detallesModal.style.display = 'none';
        }
        if (event.target == marcaModal) {
            cerrarModalMarca();
        }
        if (event.target == categoriaModal) {
            cerrarModalCategoria();
        }
        if (event.target == tipoModal) {
            cerrarModalTipo();
        }
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