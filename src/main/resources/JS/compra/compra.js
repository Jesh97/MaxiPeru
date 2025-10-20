const IGV_RATE = 0.18;

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

const formatCurrency = (value, currency = 'PEN') => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: currency }).format(value);
};

const PROVEEDOR_SERVLET_URL = '/buscarProveedor';
const COMPRA_SERVLET_URL = '/CompraServlet';
const TIPO_COMPROBANTE_SERVLET_URL = '/guardarTipoComprobante';
const FORMA_PAGO_SERVLET_URL = '/guardarFormaPago';
const TIPO_PAGO_SERVLET_URL = '/guardarTipoPago';

let referencia = { numeroCotizacion: '', numeroPedido: '' };
let guia = {
    rucGuia: '', fechaEmision: '', tipoComprobante: '', serie: '', correlativo: '',
    puntoPartida: '', puntoLlegada: '', costeTotalTransporte: 0.00, ciudadTraslado: '', numeroGuia: '', serieGuiaTransporte: '',
    correlativoGuiaTransporte: '', peso: '', fechaPedido: '', fechaEntrega: ''
};

const UNIDAD_ID_MAP = {
    'LITRO': 1, 'GALÓN': 2, 'BIDÓN': 3, 'UNIDAD': 4, 'KILOGRAMO': 5, 'CIENTO': 6, 'PAQUETE': 7, 'MILLAR': 8,
    'ROLLO': 9, 'SACO': 10
};

let subtotalSinIgvCalculado = 0;
let totalIgvCalculado = 0;
let totalCompraFinalCalculado = 0;
let totalAPagarCalculado = 0;
let totalPesoProductosCalculado = 0;
let costeTransporteCalculado = 0;
let costoAdicionalAplicado = 0;
let cajas = [];
let proximoIdCaja = 1;
let itemEnEdicion = null;
let lotes = {};
let proximoIdLote = 1;

const modalDescuentoItem = new bootstrap.Modal($('#modalDescuentoItem'));
const tasaIgvDescuentoSelect = $('#tasaIgvDescuento');
const tipoValorDescuentoItemSelect = $('#tipoValorDescuentoItem');
const valorDescuentoItemInput = $('#valorDescuentoItem');
const motivoDescuentoTextarea = $('#motivoDescuento');
const guardarDescuentoItemBtn = $('#guardarDescuentoItem');
const modalTotalesPorCantidad = new bootstrap.Modal($('#modalTotalesPorCantidad'));
const modalLotes = new bootstrap.Modal($('#modalLotes'));

document.addEventListener('DOMContentLoaded', () => {
    const inputProveedor = $('#busquedaProveedor');
    const sugerencias = $('#sugerenciasProveedor');
    const proveedorId = $('#proveedorId');
    const btnContainer = $('#btnContainer');
    const selectMoneda = $('#moneda');
    const monedaLabel = $('#monedaLabel');
    const costeTransporteLabel = $('#costeTransporteLabel');
    const subtotalSinIgvEl = $('#subtotalSinIgv');
    const totalIgvEl = $('#totalIgv');
    const totalCompraFinalEl = $('#totalCompraFinal');
    const totalAPagarEl = $('#totalAPagar');
    const totalPesoProductosEl = $('#totalPesoProductos');
    const bonifSi = $('#bonifSi');
    const bonifNo = $('#bonifNo');
    const descuentoSi = $('#descuentoSi');
    const descuentoNo = $('#descuentoNo');
    const tipoDescuentoContainer = $('#tipoDescuentoContainer');
    const tipoDescuentoSelect = $('#tipoDescuento');
    const descuentoGlobalContainer = $('#descuentoGlobalContainer');
    const tipoValorDescuentoSelect = $('#tipoValorDescuento');
    const valorDescuentoInput = $('#valorDescuento');
    const divTipoCambio = $('#divTipoCambio');
    const inputTipoCambio = $('#tipoCambioInput');
    const trasladoSi = $('#trasladoSi');
    const trasladoNo = $('#trasladoNo');
    const contenedorBtnGuia = $('#contenedorBtnGuia');
    const btnGuia = $('#btnGuia');
    const fechaEmisionInput = $('#fechaEmision');
    const tipoPagoSelect = $('#tipoPago');
    const fechaVencimientoInput = $('#fechaVencimiento');
    const inputFechaPedido = $('#fechaPedido');
    const inputFechaEntrega = $('#fechaEntrega');
    const formCompra = $('#formCompra');
    const guardarCompraBtn = $('#guardarCompraBtn');
    const mensajeAlertaTransporte = $('#mensajeAlertaTransporte');
    const igvSi = $('#igvSi');
    const igvNo = $('#igvNo');
    const modalReferencia = new bootstrap.Modal($('#modalReferencia'));
    const modalGuia = new bootstrap.Modal($('#modalGuia'));
    const modalConfirm = new bootstrap.Modal($('#modalConfirm'));
    const modalNuevoComprobante = new bootstrap.Modal($('#modalNuevoComprobante'));
    const modalNuevaFormaPago = new bootstrap.Modal( $('#modalNuevaFormaPago'));
    const modalNuevoTipoPago = new bootstrap.Modal($('#modalNuevoTipoPago'));
    const modalCajas = new bootstrap.Modal($('#modalCajas'));
    const btnGuardarLote = $('#btnGuardarLote');
    const btnAgregarLote = $('#btnAgregarLote');
    const modalReglaCostoElement = $('#modalReglaCosto');

    let debounceTimer = null;
    let debounceTimerProducto = null;
    let filaIdLoteActual = null;

    if (modalReglaCostoElement) {
        const modalReglaCosto = new bootstrap.Modal(modalReglaCostoElement);
        const reglaAplicaCostoAdicional = $('#reglaAplicaCostoAdicional');

        if (reglaAplicaCostoAdicional) {
            reglaAplicaCostoAdicional.addEventListener('change', () => {
                if (reglaAplicaCostoAdicional.checked) {
                    modalReglaCosto.show();
                }
            });
        }

        const btnGuardarReglaCosto = $('#btnGuardarReglaCosto');
        const aplicaCostoAdicionalCheckbox = $('#aplicaCostoAdicional');

        if (btnGuardarReglaCosto) {
            btnGuardarReglaCosto.addEventListener('click', actualizarTotales);
        }
    }

    if (inputProveedor) {
        inputProveedor.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const q = inputProveedor.value.trim();
            if (!q) {
                sugerencias.classList.add('d-none');
                proveedorId.value = '';
                return;
            }
            debounceTimer = setTimeout(async () => {
                try {
                    const url = `${PROVEEDOR_SERVLET_URL}?busqueda=${encodeURIComponent(q)}`;
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const results = await response.json();
                    renderProveedorSuggestions(results);
                } catch (error) {
                    console.error("Error al buscar proveedores:", error);
                    sugerencias.classList.add('d-none');
                }
            }, 300);
        });

        document.addEventListener('click', (e) => {
            if (!inputProveedor.contains(e.target) && !sugerencias.contains(e.target)) {
                sugerencias.classList.add('d-none');
            }
        });
    }

    function actualizarNombresEncabezadosTotales(esTotalPorCantidad) {
        const precioUnitario = $('#th-precio-totales');
        const pesoUnitario = $('#th-peso-totales');
        const costoUnitarioTransporte = $('#th-costo-transporte-totales');
        const totalUnitario = $('#th-total-totales');

        if (precioUnitario) precioUnitario.textContent = esTotalPorCantidad ? 'Precio Total' : 'Precio Unitario';
        if (pesoUnitario) pesoUnitario.textContent = esTotalPorCantidad ? 'Peso Total' : 'Peso Unitario';
        if (costoUnitarioTransporte) costoUnitarioTransporte.textContent = esTotalPorCantidad ? 'Costo Total de Transporte' : 'Costo Unitario de Transporte';
        if (totalUnitario) totalUnitario.textContent = esTotalPorCantidad ? 'Total por Cantidad' : 'Total Unitario';
    }

    function renderProveedorSuggestions(items) {
        sugerencias.innerHTML = '';
        if (!items || items.length === 0) {
            sugerencias.classList.add('d-none');
            return;
        }
        items.slice(0, 6).forEach(it => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
            btn.innerHTML = `<div><strong>${escapeHtml(it.ruc)}</strong> — <span class="small-muted">${escapeHtml(it.razonSocial)}</span></div><i class="bi bi-arrow-right-short"></i>`;
            btn.addEventListener('click', () => {
                inputProveedor.value = `${it.ruc} - ${it.razonSocial}`;
                proveedorId.value = it.id;
                sugerencias.classList.add('d-none');
            });
            sugerencias.appendChild(btn);
        });
        sugerencias.classList.remove('d-none');
    }

    function validarFechasGuia() {
        if (!inputFechaPedido || !inputFechaEntrega) return true;

        const fechaPedidoVal = guia.fechaPedido || inputFechaPedido.value;
        const fechaEntregaVal = guia.fechaEntrega || inputFechaEntrega.value;

        if (!fechaPedidoVal || !fechaEntregaVal) {
            return true;
        }

        const pedido = new Date(fechaPedidoVal);
        const entrega = new Date(fechaEntregaVal);
        pedido.setHours(0, 0, 0, 0);
        entrega.setHours(0, 0, 0, 0);

        if (entrega <= pedido) {
            const modalDialog = $('#confirmModalDialog');
            if (modalDialog) {
                modalDialog.classList.add('error');
            }

            $('#confirmMessage').textContent = 'ERROR: La Fecha de Entrega debe ser estrictamente posterior a la Fecha de Pedido.';
            modalConfirm.show();

            inputFechaPedido.value = '';
            inputFechaEntrega.value = '';

            if (inputFechaEntrega) inputFechaEntrega.focus();
            return false;
        }

        const modalDialog = $('#confirmModalDialog');
        if (modalDialog) {
            modalDialog.classList.remove('error');
        }

        return true;
    }

    if (inputFechaPedido && inputFechaEntrega) {
        inputFechaPedido.addEventListener('change', validarFechasGuia);
        inputFechaEntrega.addEventListener('change', validarFechasGuia);
    }

    if (fechaEmisionInput && tipoPagoSelect && fechaVencimientoInput) {
        function calcularFechaVencimiento() {
            const fechaStr = fechaEmisionInput.value;
            if (!fechaStr) {
                fechaVencimientoInput.value = '';
                return;
            }
            const parts = fechaStr.split('-');
            if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
                fechaVencimientoInput.value = '';
                return;
            }

            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1;
            const day = parseInt(parts[2]);

            const selectedOption = tipoPagoSelect.options[tipoPagoSelect.selectedIndex];
            const tipoPagoTexto = selectedOption ? selectedOption.text : '';

            let dias = 0;
            const match = tipoPagoTexto.match(/\d+/);
            dias = match ? parseInt(match[0]) : 0;

            const fechaBase = new Date(year, month, day, 12, 0, 0);

            const fechaVencimiento = new Date(fechaBase.getTime());
            fechaVencimiento.setDate(fechaVencimiento.getDate() + dias);

            if (isNaN(fechaVencimiento.getTime())) {
                fechaVencimientoInput.value = '';
                return;
            }

            const finalYear = fechaVencimiento.getFullYear();
            const finalMonth = String(fechaVencimiento.getMonth() + 1).padStart(2, '0');
            const finalDay = String(fechaVencimiento.getDate()).padStart(2, '0');

            fechaVencimientoInput.value = `${finalYear}-${finalMonth}-${finalDay}`;
        }

        fechaEmisionInput.addEventListener('change', calcularFechaVencimiento);
        tipoPagoSelect.addEventListener('change', calcularFechaVencimiento);
    }

    function crearFilaProducto(producto = {}) {
        const filaId = 'fila-' + Date.now();
        const trGeneral = document.createElement('tr');
        trGeneral.dataset.filaId = filaId;
        trGeneral.dataset.pesoUnitario = producto.pesoUnitario || '0.000';
        trGeneral.innerHTML = `
            <td><input type="text" class="form-control form-control-sm codigo" placeholder="Código" value="${producto.codigo || ''}"></td>
            <td><input type="number" min="0" step="1" value="${producto.cantidad || 1}" class="form-control form-control-sm cantidad"></td>
            <td>
                <select class="form-control form-select form-select-sm unidadMedida">
                    <option value="LITRO" ${producto.unidadMedida === 'LITRO' ? 'selected' : ''}>L</option>
                    <option value="GALÓN" ${producto.unidadMedida === 'GALÓN' ? 'selected' : ''}>GL</option>
                    <option value="BIDÓN" ${producto.unidadMedida === 'BIDÓN' ? 'selected' : ''}>BD</option>
                    <option value="UNIDAD" ${producto.unidadMedida === 'UNIDAD' ? 'selected' : ''}>U</option>
                    <option value="KILOGRAMO" ${producto.unidadMedida === 'KILOGRAMO' ? 'selected' : ''}>KG</option>
                    <option value="CIENTO" ${producto.unidadMedida === 'CIENTO' ? 'selected' : ''}>C</option>
                    <option value="PAQUETE" ${producto.unidadMedida === 'PAQUETE' ? 'selected' : ''}>PQ</option>
                    <option value="MILLAR" ${producto.unidadMedida === 'MILLAR' ? 'selected' : ''}>MLL</option>
                    <option value="ROLLO" ${producto.unidadMedida === 'ROLLO' ? 'selected' : ''}>RL</option>
                    <option value="SACO" ${producto.unidadMedida === 'SACO' ? 'selected' : ''}>S</option>
                </select>
            </td>
            <td><input type="text" class="form-control form-control-sm descripcion" placeholder="Descripción" value="${producto.descripcion || ''}"></td>
            <td><input type="number" min="0" step="0.01" value="${producto.precioUnitario || '0.00'}" class="form-control form-control-sm precioUnitario text-end"></td>
            <td class="totalProducto text-end">S/ 0.00</td>
            <td class="align-middle text-center">
                <div class="d-flex justify-content-center align-items-center">
                    <button type="button" class="btn btn-outline-info btn-sm btn-lotes me-2" title="Asignar Lotes">
                        <i class="bi bi-box-seam"></i>
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm eliminarProducto" title="Eliminar producto">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
            <input type="hidden" class="idProducto" value="${producto.idProducto || 0}" />
        `;

        const trFinanciero = document.createElement('tr');
        trFinanciero.dataset.filaId = filaId;
        trFinanciero.dataset.descuentoItemValor = '0';
        trFinanciero.dataset.descuentoItemTipo = 'porcentaje';
        trFinanciero.dataset.descuentoItemMotivo = '';
        trFinanciero.dataset.tasaIgvItem = '0.18';
        trFinanciero.innerHTML = `
            <td class="descripcion-readonly">${producto.descripcion || ''}</td>
            <td class="col-bonif text-center align-middle"><input class="form-check-input bonificacion" type="checkbox" /></td>
            <td class="col-descuento-item text-center align-middle">
                <button type="button" class="btn btn-sm btn-outline-primary btn-descuento-item" data-bs-toggle="modal" data-bs-target="#modalDescuentoItem" style="display:none;" data-item-id="${filaId}">
                    <i class="bi bi-tag-fill"></i>
                </button>
            </td>
            <td class="col-descuento-item precio-con-descuento-item text-end align-middle">S/ 0.00</td>
            <td class="col-precio-convertido d-none precio-convertido-cell text-end align-middle"></td>
            <td class="align-middle text-center"><button type="button" class="btn btn-outline-danger btn-sm eliminarProducto" title="Eliminar producto"><i class="bi bi-trash"></i></button></td>
        `;

        const trGuiaTransporte = document.createElement('tr');
        trGuiaTransporte.dataset.filaId = filaId;
        trGuiaTransporte.innerHTML = `
            <td><span class="codigo-readonly">${producto.codigo || ''}</span></td>
            <td><span class="cantidad-readonly">${producto.cantidad || 1}</span></td>
            <td><span class="peso-readonly">${((producto.pesoUnitario || 0) * (producto.cantidad || 1)).toFixed(3) || '0.000'} kg</span></td>
            <td class="descripcion-readonly">${producto.descripcion || ''}</td>
            <td><input type="number" min="0" step="0.0001" value="0.0000" class="form-control form-control-sm costoUnitTransporte text-end" disabled></td>
            <td class="costeTransporte text-end align-middle">S/ 0.00</td>
            <td class="align-middle text-center"><button type="button" class="btn btn-outline-danger btn-sm eliminarProducto" title="Eliminar producto"><i class="bi bi-trash"></i></button></td>
        `;

        const trTotales = document.createElement('tr');
        trTotales.dataset.filaId = filaId;
        trTotales.innerHTML = `
            <td class="unidadMedida-readonly"></td>
            <td class="descripcion-readonly">${producto.descripcion || ''}</td>
            <td class="text-end align-middle">
                <span class="precioUnitario-total">${formatCurrency(producto.precioUnitario || '0.00', 'PEN')}</span>
                <span class="precioTotal-total d-none">${formatCurrency(0, 'PEN')}</span>
            </td>
            <td class="text-end align-middle">
                <span class="igvUnitario-total">${formatCurrency(0, 'PEN')}</span>
                <span class="igvTotal-total d-none">${formatCurrency(0, 'PEN')}</span>
            </td>
            <td class="text-end align-middle">
                <span class="pesoUnitario-total">${(producto.pesoUnitario || 0).toFixed(3)} kg</span>
                <span class="pesoTotal-total d-none">${(0).toFixed(3)} kg</span>
            </td>
            <td class="text-end align-middle">
                <span class="costoUnitarioTransporte-total">${formatCurrency(0, 'PEN')}</span>
                <span class="costeTransporte-total d-none">${formatCurrency(0, 'PEN')}</span>
            </td>
            <td class="text-end align-middle">
                <span class="totalUnitario-total">${formatCurrency(0, 'PEN')}</span>
                <span class="totalTotal-total d-none">${formatCurrency(0, 'PEN')}</span>
            </td>
            <td class="align-middle text-center"><button type="button" class="btn btn-outline-danger btn-sm eliminarProducto" title="Eliminar producto"><i class="bi bi-trash"></i></button></td>
        `;

        const tablas = ['General', 'Financiero', 'GuiaTransporte', 'Totales'];
        const filas = [trGeneral, trFinanciero, trGuiaTransporte, trTotales];

        filas.forEach((tr, i) => {
            const body = $(`#bodyProductos${tablas[i]}`);
            if (body) body.appendChild(tr);
        });

        filas.forEach(tr => {
            tr.querySelectorAll('.eliminarProducto').forEach(btn => {
                btn.addEventListener('click', () => {
                    filas.forEach(f => f.remove());
                    cajas = cajas.map(caja => ({
                        ...caja,
                        productos: caja.productos.filter(p => p.filaId !== filaId)
                    })).filter(caja => caja.productos.length > 0);
                    delete lotes[filaId];
                    actualizarTotales();
                    actualizarResumenCajasEnGuia();
                });
            });
        });

        trGeneral.querySelector('.descripcion').addEventListener('input', e => {
            const q = e.target.value.trim();
            if (q) buscarProducto(q, trGeneral);
        });

        const inputFieldsGeneral = [
            trGeneral.querySelector('.cantidad'),
            trGeneral.querySelector('.unidadMedida'),
            trGeneral.querySelector('.precioUnitario'),
        ];
        inputFieldsGeneral.forEach(input => {
            if (input) {
                input.addEventListener('input', actualizarTotales);
                if (input.type === 'checkbox') {
                    input.removeEventListener('input', actualizarTotales);
                    input.addEventListener('change', actualizarTotales);
                }
            }
        });

        const inputFieldsOtros = [trFinanciero.querySelector('.bonificacion')];
        inputFieldsOtros.forEach(input => {
            if (input) {
                input.addEventListener('input', actualizarTotales);
                if (input.type === 'checkbox') {
                    input.removeEventListener('input', actualizarTotales);
                    input.addEventListener('change', actualizarTotales);
                }
            }
        });

        const btnDescuentoItem = trFinanciero.querySelector('.btn-descuento-item');
        if (btnDescuentoItem) {
            btnDescuentoItem.addEventListener('click', () => {
                const filaId = btnDescuentoItem.dataset.itemId;
                itemEnEdicion = filaId;
                const trFinanciero = $(`#tablaProductosFinanciero tr[data-fila-id="${filaId}"]`);
                tasaIgvDescuentoSelect.value = (parseFloat(trFinanciero.dataset.tasaIgvItem) * 100).toString();
                tipoValorDescuentoItemSelect.value = trFinanciero.dataset.descuentoItemTipo;
                valorDescuentoItemInput.value = trFinanciero.dataset.descuentoItemValor;
                motivoDescuentoTextarea.value = trFinanciero.dataset.descuentoItemMotivo;
            });
        }

        const btnLotes = trGeneral.querySelector('.btn-lotes');
        if (btnLotes) {
            btnLotes.addEventListener('click', () => {
                filaIdLoteActual = filaId;
                iniciarModalLotes();
                modalLotes.show();
            });
        }

        const cantidadInput = trGeneral.querySelector('.cantidad');
        if (cantidadInput) {
            cantidadInput.addEventListener('change', () => {
                const nuevaCantidad = parseInt(cantidadInput.value, 10) || 0;
                let cantidadAsignada = 0;
                cajas.forEach(caja => {
                    const productoEnCaja = caja.productos.find(p => p.filaId === filaId);
                    if (productoEnCaja) {
                        cantidadAsignada += productoEnCaja.cantidad;
                    }
                });

                if (cantidadAsignada > nuevaCantidad) {
                    alert(`La cantidad total asignada en las cajas (${cantidadAsignada}) no puede ser mayor que la cantidad general del producto (${nuevaCantidad}).`);
                    cantidadInput.value = nuevaCantidad;
                }

                let cantidadLotes = (lotes[filaId] || []).reduce((sum, lote) => sum + lote.cantidad, 0);
                 if (cantidadLotes > nuevaCantidad) {
                    alert(`La cantidad total asignada en los lotes (${cantidadLotes}) no puede ser mayor que la cantidad general del producto (${nuevaCantidad}).`);
                    cantidadInput.value = nuevaCantidad;
                    lotes[filaId] = [];
                    actualizarResumenLotesEnModal();
                }
            });
        }
        actualizarTotales();
    }

    async function buscarProducto(q, trFilaGeneral = null) {
        try {
            const url = `${COMPRA_SERVLET_URL}?buscarArticulo=${encodeURIComponent(q)}`;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            const data = await resp.json();

            if (!trFilaGeneral) {
                mostrarSugerenciasProducto(data);
                return;
            }

            if (data && data.length > 0) {
                const producto = data[0];
                trFilaGeneral.dataset.pesoUnitario = producto.pesoUnitario || '0.000';
                trFilaGeneral.querySelector('.codigo').value = producto.codigo || '';
                trFilaGeneral.querySelector('.unidadMedida').value = producto.unidadMedida || 'UNIDAD';
                trFilaGeneral.querySelector('.descripcion').value = producto.descripcion || '';
                trFilaGeneral.querySelector('.idProducto').value = producto.idProducto || 0;
                trFilaGeneral.querySelector('.precioUnitario').value = producto.precioUnitario || '0.00';

                const selectorFinanciero = `#tablaProductosFinanciero tr[data-fila-id="${trFilaGeneral.dataset.filaId}"]`;
                const trFinanciero = document.querySelector(selectorFinanciero);
                if (trFinanciero) {
                    trFinanciero.dataset.descuentoItemValor = '0';
                    trFinanciero.dataset.descuentoItemTipo = 'porcentaje';
                    trFinanciero.dataset.tasaIgvItem = '0.18';
                    trFinanciero.dataset.descuentoItemMotivo = '';
                    trFinanciero.querySelector('.descripcion-readonly').textContent = producto.descripcion || '';
                }

                const selectorGuiaTransporte = `#tablaProductosGuiaTransporte tr[data-fila-id="${trFilaGeneral.dataset.filaId}"]`;
                const trGuiaTransporte = document.querySelector(selectorGuiaTransporte);
                if (trGuiaTransporte) {
                    trGuiaTransporte.querySelector('.costoUnitTransporte').value = '0.0000';
                    trGuiaTransporte.querySelector('.descripcion-readonly').textContent = producto.descripcion || '';
                    trGuiaTransporte.querySelector('.codigo-readonly').textContent = producto.codigo || '';
                    trGuiaTransporte.querySelector('.cantidad-readonly').textContent = trFilaGeneral.querySelector('.cantidad').value;
                }

                const selectorTotales = `#tablaProductosTotales tr[data-fila-id="${trFilaGeneral.dataset.filaId}"]`;
                const trTotales = document.querySelector(selectorTotales);
                if (trTotales) {
                    trTotales.querySelector('.descripcion-readonly').textContent = producto.descripcion || '';
                }

                actualizarTotales();
            }
        } catch (err) {
            console.error("Error al buscar producto:", err);
        }
    }

    function mostrarSugerenciasProducto(productos) {
        let container = $('#sugerenciasProducto');
        if (!container) return;

        container.innerHTML = '';
        if (!productos || productos.length === 0) {
            container.classList.add('d-none');
            return;
        }

        productos.slice(0, 6).forEach(p => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'list-group-item list-group-item-action';
            btn.innerHTML = `<strong>${p.codigo}</strong> - ${p.descripcion}`;
            btn.addEventListener('click', () => {
                crearFilaProducto(p);
                container.classList.add('d-none');
                $('#busquedaProductoInput').value = '';
            });
            container.appendChild(btn);
        });
        container.classList.remove('d-none');
    }

    function handleProductTypeChange() {
        btnContainer.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'd-flex align-items-center position-relative';
        wrapper.innerHTML = `
                <input type="text" id="busquedaProductoInput" class="form-control form-control-sm me-2" placeholder="Buscar producto por código o descripción">
                <div id="sugerenciasProducto" class="list-group d-none" role="listbox" style="position: absolute; z-index: 1050; width: 300px; right: 0; top: 100%; max-height: 250px; overflow-y: auto;"></div>
                <button type="button" id="btnAgregarProducto" class="btn btn-primary btn-sm">
                    <i class="bi bi-plus-lg"></i> Agregar Producto
                </button>
            `;
        btnContainer.appendChild(wrapper);

        const busquedaProductoInput = $('#busquedaProductoInput', wrapper);
        const btnAgregarProducto = $('#btnAgregarProducto', wrapper);

        busquedaProductoInput.addEventListener('input', () => {
            const q = busquedaProductoInput.value.trim();
            if (q) buscarProducto(q);
        });

        btnAgregarProducto.onclick = () => {
            crearFilaProducto();
            const sugerencias = $('#sugerenciasProducto');
            if (sugerencias) sugerencias.classList.add('d-none');
        };

        const clickFueraListener = (e) => {
            if (!wrapper.contains(e.target)) {
                $('#sugerenciasProducto', wrapper)?.classList.add('d-none');
            }
        };
        document.addEventListener('click', clickFueraListener);
    }

    handleProductTypeChange();

    function unidadAbreviatura(unidad) {
        const map = {'LITRO': 'L', 'GALÓN': 'GL', 'BIDÓN': 'BD', 'UNIDAD': 'U', 'KILOGRAMO': 'KG', 'CIENTO': 'C', 'PAQUETE': 'PQ', 'MILLAR': 'MLL', 'ROLLO': 'RL', 'SACO': 'S'};
        return map[unidad] || unidad;
    }

    function actualizarTotales() {
        const moneda = selectMoneda.value;
        const incluyeIgv = igvSi.checked;
        const hayBonificacion = bonifSi.checked;
        const hayTraslado = trasladoSi.checked;
        const hayDescuento = descuentoSi.checked;
        const tipoDescuento = hayDescuento ? tipoDescuentoSelect.value : '';

        if (monedaLabel) monedaLabel.textContent = moneda;
        toggleBonificacionColumn(hayBonificacion);
        togglePrecioConvertidoColumn(moneda !== 'Soles');
        toggleDescuentoItemColumn(hayDescuento && tipoDescuento === 'por_item');

        let subtotal = 0;
        let pesoTotalProductos = 0;
        let descuentoTotalGlobal = 0;
        let costeTransporteProductos = 0;
        let totalIgvPorItem = 0;
        let tipoCambioValor = 1;

        if (moneda !== 'Soles' && inputTipoCambio) {
            tipoCambioValor = parseFloat(inputTipoCambio.value);
            if (isNaN(tipoCambioValor) || tipoCambioValor <= 0) tipoCambioValor = 1;
        }

        const costosTransporteGlobales = {};
        cajas.forEach(caja => {
            const cantidadTotalEnCaja = caja.productos.reduce((sum, prod) => sum + prod.cantidad, 0);
            const costoUnitarioDistribucion = cantidadTotalEnCaja > 0 ? caja.fleteTotal / cantidadTotalEnCaja : 0;
            caja.productos.forEach(prod => {
                const costoTransporteProducto = costoUnitarioDistribucion * prod.cantidad;
                if (!costosTransporteGlobales[prod.filaId]) {
                    costosTransporteGlobales[prod.filaId] = { costoAcumulado: 0, cantidadAcumulada: 0 };
                }
                costosTransporteGlobales[prod.filaId].costoAcumulado += costoTransporteProducto;
                costosTransporteGlobales[prod.filaId].cantidadAcumulada += prod.cantidad;
            });
        });

        $$('#tablaProductosGeneral tr[data-fila-id]').forEach(trGeneral => {
            const filaId = trGeneral.dataset.filaId;
            const trFinanciero = $(`#tablaProductosFinanciero tr[data-fila-id="${filaId}"]`);
            const trGuiaTransporte = $(`#tablaProductosGuiaTransporte tr[data-fila-id="${filaId}"]`);
            const trTotales = $(`#tablaProductosTotales tr[data-fila-id="${filaId}"]`);
            const cantidad = parseFloat(trGeneral.querySelector('.cantidad')?.value) || 0;
            const precioUnitario = parseFloat(trGeneral.querySelector('.precioUnitario')?.value) || 0;
            const pesoUnitario = parseFloat(trGeneral.dataset.pesoUnitario) || 0;
            const pesoTotalFila = pesoUnitario * cantidad;
            const costoUnitarioTransporteGlobal = costosTransporteGlobales[filaId] ? (costosTransporteGlobales[filaId].costoAcumulado / costosTransporteGlobales[filaId].cantidadAcumulada) : 0;
            const costeTransporteFila = cantidad * costoUnitarioTransporteGlobal;
            const codigoProducto = trGeneral.querySelector('.codigo').value;
            const descripcionProducto = trGeneral.querySelector('.descripcion').value;
            const bonificacion = trFinanciero.querySelector('.bonificacion')?.checked ?? false;

            let precioBaseUnitario = (hayBonificacion && bonificacion) ? 0 : precioUnitario;
            let precioBaseUnitarioSoles = precioBaseUnitario * tipoCambioValor;
            let precioVentaTotal = precioBaseUnitarioSoles * cantidad;
            let igvTasa = IGV_RATE;
            let descuentoValor = 0;
            let descuentoTipo = 'porcentaje';

            if (hayDescuento && tipoDescuento === 'por_item') {
                descuentoValor = parseFloat(trFinanciero.dataset.descuentoItemValor) || 0;
                descuentoTipo = trFinanciero.dataset.descuentoItemTipo;
                igvTasa = parseFloat(trFinanciero.dataset.tasaIgvItem) || IGV_RATE;
                if (descuentoTipo === 'porcentaje') {
                    descuentoValor = precioVentaTotal * (descuentoValor / 100);
                } else if (incluyeIgv) {
                    descuentoValor = descuentoValor;
                }
            }

            const precioVentaConDescuento = Math.max(0, precioVentaTotal - descuentoValor);
            const precioConDescuentoItemEl = trFinanciero.querySelector('.precio-con-descuento-item');
            if (precioConDescuentoItemEl) precioConDescuentoItemEl.textContent = formatCurrency(precioVentaConDescuento, 'PEN');

            let subtotalProducto = incluyeIgv ? precioVentaConDescuento / (1 + igvTasa) : precioVentaConDescuento;
            let igvProducto = subtotalProducto * igvTasa;
            totalIgvPorItem += igvProducto;
            const unidad = trGeneral.querySelector('.unidadMedida')?.value;
            const unidadShort = unidadAbreviatura(unidad);

            if (trTotales.querySelector('.unidadMedida-readonly')) trTotales.querySelector('.unidadMedida-readonly').textContent = unidadShort;
            if (trGuiaTransporte.querySelector('.descripcion-readonly')) trGuiaTransporte.querySelector('.descripcion-readonly').textContent = descripcionProducto;
            if (trFinanciero.querySelector('.descripcion-readonly')) trFinanciero.querySelector('.descripcion-readonly').textContent = descripcionProducto;
            if (trTotales.querySelector('.descripcion-readonly')) trTotales.querySelector('.descripcion-readonly').textContent = descripcionProducto;
            if (trGuiaTransporte.querySelector('.codigo-readonly')) trGuiaTransporte.querySelector('.codigo-readonly').textContent = codigoProducto;
            if (trGuiaTransporte.querySelector('.cantidad-readonly')) trGuiaTransporte.querySelector('.cantidad-readonly').textContent = cantidad;
            if (trGuiaTransporte.querySelector('.costoUnitTransporte')) trGuiaTransporte.querySelector('.costoUnitTransporte').value = costoUnitarioTransporteGlobal.toFixed(4);
            if (trGuiaTransporte.querySelector('.peso-readonly')) trGuiaTransporte.querySelector('.peso-readonly').textContent = `${pesoTotalFila.toFixed(3)} kg`;

            const precioConvertidoCell = trFinanciero.querySelector('.precio-convertido-cell');
            if (precioConvertidoCell) precioConvertidoCell.textContent = moneda !== 'Soles' ? formatCurrency(precioBaseUnitarioSoles, 'PEN') : '';
            if (trGuiaTransporte.querySelector('.costeTransporte')) trGuiaTransporte.querySelector('.costeTransporte').textContent = formatCurrency(costeTransporteFila, 'PEN');

            const precioUnitarioVenta = cantidad > 0 ? subtotalProducto / cantidad : 0;
            const igvUnitario = precioUnitarioVenta * igvTasa;
            const totalUnitario = precioUnitarioVenta + igvUnitario + costoUnitarioTransporteGlobal;
            const totalFila = subtotalProducto + igvProducto + costeTransporteFila;

            if (trTotales.querySelector('.precioUnitario-total')) trTotales.querySelector('.precioUnitario-total').textContent = formatCurrency(precioUnitarioVenta, 'PEN');
            if (trTotales.querySelector('.precioTotal-total')) trTotales.querySelector('.precioTotal-total').textContent = formatCurrency(subtotalProducto, 'PEN');
            if (trTotales.querySelector('.igvUnitario-total')) trTotales.querySelector('.igvUnitario-total').textContent = formatCurrency(igvUnitario, 'PEN');
            if (trTotales.querySelector('.igvTotal-total')) trTotales.querySelector('.igvTotal-total').textContent = formatCurrency(igvProducto, 'PEN');
            if (trTotales.querySelector('.pesoUnitario-total')) trTotales.querySelector('.pesoUnitario-total').textContent = `${pesoUnitario.toFixed(3)} kg`;
            if (trTotales.querySelector('.pesoTotal-total')) trTotales.querySelector('.pesoTotal-total').textContent = `${pesoTotalFila.toFixed(3)} kg`;
            if (trTotales.querySelector('.costoUnitarioTransporte-total')) trTotales.querySelector('.costoUnitarioTransporte-total').textContent = formatCurrency(costoUnitarioTransporteGlobal, 'PEN');
            if (trTotales.querySelector('.costeTransporte-total')) trTotales.querySelector('.costeTransporte-total').textContent = formatCurrency(costeTransporteFila, 'PEN');
            if (trTotales.querySelector('.totalUnitario-total')) trTotales.querySelector('.totalUnitario-total').textContent = formatCurrency(totalUnitario, 'PEN');
            if (trTotales.querySelector('.totalTotal-total')) trTotales.querySelector('.totalTotal-total').textContent = formatCurrency(totalFila, 'PEN');

            trGeneral.dataset.precioConDescuento = precioVentaConDescuento.toFixed(2);
            trGeneral.dataset.igvProducto = igvProducto.toFixed(2);
            trGeneral.dataset.totalProducto = totalFila.toFixed(2);
            trGeneral.dataset.pesoTotal = pesoTotalFila.toFixed(3);
            trGeneral.dataset.costeUnitarioTransporte = costoUnitarioTransporteGlobal.toFixed(4);
            trGeneral.dataset.costeTotalTransporte = costeTransporteFila.toFixed(2);

            if (trGeneral.querySelector('.totalProducto')) trGeneral.querySelector('.totalProducto').textContent = formatCurrency(precioUnitario * cantidad, 'PEN');

            subtotal += subtotalProducto;
            pesoTotalProductos += pesoTotalFila;
            costeTransporteProductos += costeTransporteFila;
        });

        if (hayDescuento && tipoDescuento === 'global' && tipoValorDescuentoSelect && valorDescuentoInput) {
            const tipoValor = tipoValorDescuentoSelect.value;
            const valorDescuentoInputVal = valorDescuentoInput.value.trim();
            const esPorcentaje = tipoValor === 'porcentaje';
            let valorDescuento = parseFloat(valorDescuentoInputVal.replace('%', '')) || 0;
            if (esPorcentaje) {
                descuentoTotalGlobal = subtotal * (valorDescuento / 100);
            } else {
                descuentoTotalGlobal = valorDescuento;
            }
        }

        const subtotalConDescuentoGlobal = subtotal - descuentoTotalGlobal;
        subtotalSinIgvCalculado = subtotalConDescuentoGlobal;
        totalIgvCalculado = totalIgvPorItem;

        if(tipoDescuento === 'global' || !hayDescuento) {
            totalIgvCalculado = subtotalConDescuentoGlobal * IGV_RATE;
        }

        totalCompraFinalCalculado = subtotalSinIgvCalculado + totalIgvCalculado;

        const aplicaCostoAdicionalGeneral = $('#reglaAplicaCostoAdicional')?.checked || false;
        const montoMinimo = parseFloat($('#reglaMontoMinimo')?.value) || 0;
        const costoAdicional = parseFloat($('#reglaCostoAdicional')?.value) || 0;
        let costoAdicionalAplicado = 0;

        if (aplicaCostoAdicionalGeneral && subtotalSinIgvCalculado > montoMinimo) {
            costoAdicionalAplicado = costoAdicional;
        }

        costeTransporteCalculado = costeTransporteProductos;

        totalAPagarCalculado = totalCompraFinalCalculado + costeTransporteCalculado + costoAdicionalAplicado;

        const resumenCostoAdicional = $('#resumenCostoAdicional');
        const filaCostoAdicional = $('#filaCostoAdicional');

        if (resumenCostoAdicional) {
            resumenCostoAdicional.textContent = formatCurrency(costoAdicionalAplicado, 'PEN');
        }

        if (filaCostoAdicional) {
            if (costoAdicionalAplicado > 0) {
                filaCostoAdicional.style.display = 'flex';
            } else {
                filaCostoAdicional.style.display = 'none';
            }
        }

        totalPesoProductosCalculado = pesoTotalProductos;
        const costeTotalIngresado = parseFloat(guia.costeTotalTransporte) || 0;
        const tolerancia = 0.01;

        if (hayTraslado && Math.abs(costeTransporteCalculado - costeTotalIngresado) > tolerancia) {
            if (costeTransporteLabel) costeTransporteLabel.classList.add('text-danger');
            if (mensajeAlertaTransporte) mensajeAlertaTransporte.classList.remove('d-none');
        } else {
            if (costeTransporteLabel) costeTransporteLabel.classList.remove('text-danger');
            if (mensajeAlertaTransporte) mensajeAlertaTransporte.classList.add('d-none');
        }

        if (costeTransporteLabel) costeTransporteLabel.textContent = formatCurrency(costeTransporteCalculado, 'PEN');
        if (subtotalSinIgvEl) subtotalSinIgvEl.textContent = formatCurrency(subtotalSinIgvCalculado, 'PEN');
        if (totalIgvEl) totalIgvEl.textContent = formatCurrency(totalIgvCalculado, 'PEN');
        if (totalCompraFinalEl) totalCompraFinalEl.textContent = formatCurrency(totalCompraFinalCalculado, 'PEN');
        if (totalAPagarEl) totalAPagarEl.textContent = formatCurrency(totalAPagarCalculado, 'PEN');
        if (totalPesoProductosEl) totalPesoProductosEl.textContent = `${totalPesoProductosCalculado.toFixed(3)} kg`;
    }

    function toggleBonificacionColumn(show) { $$('.col-bonif').forEach(el => el.classList.toggle('d-none', !show)); }
    function toggleDescuentoItemColumn(show) { $$('.col-descuento-item').forEach(el => el.classList.toggle('d-none', !show)); $$('.btn-descuento-item').forEach(btn => btn.style.display = show ? 'block' : 'none'); }
    function togglePrecioConvertidoColumn(show) { $$('.col-precio-convertido').forEach(el => el.classList.toggle('d-none', !show)); }

    function actualizarVisibilidadBonificacion() {
        if (bonifSi) {
            const hayBonificacion = bonifSi.checked;
            toggleBonificacionColumn(hayBonificacion);
            actualizarTotales();
        }
    }

    function actualizarVisibilidadDescuento() {
        if (descuentoSi && tipoDescuentoContainer && descuentoGlobalContainer) {
            const hayDescuento = descuentoSi.checked;
            tipoDescuentoContainer.style.display = hayDescuento ? 'block' : 'none';

            if (!hayDescuento) {
                descuentoGlobalContainer.style.display = 'none';
                tipoDescuentoSelect.value = '';
                valorDescuentoInput.value = '0.00';
                toggleDescuentoItemColumn(false);
            } else {
                const tipo = tipoDescuentoSelect.value;
                descuentoGlobalContainer.style.display = (tipo === 'global') ? 'block' : 'none';
                if (valorDescuentoInput && tipoValorDescuentoSelect) {
                    if (tipo === 'global') {
                        const tipoValor = tipoValorDescuentoSelect.value;
                        valorDescuentoInput.type = 'number';
                        valorDescuentoInput.placeholder = tipoValor === 'porcentaje' ? 'e.g., 20' : 'e.g., 50.00';
                    } else {
                        valorDescuentoInput.type = 'number';
                    }
                }
                toggleDescuentoItemColumn(tipo === 'por_item');
            }
            actualizarTotales();
        }
    }

    function actualizarVisibilidadTraslado() {
        const hayTraslado = trasladoSi.checked;
        const guiaTabItem = $('#guia-transporte-tab').closest('.nav-item');
        const guiaContent = $('#guia-transporte-pane');

        if (guiaTabItem) guiaTabItem.classList.toggle('d-none', !hayTraslado);
        if (guiaContent) guiaContent.classList.toggle('d-none', !hayTraslado);
        if (!hayTraslado && guiaTabItem?.querySelector('.nav-link.active')) {
            const generalTabButton = $('#general-tab');
            const generalTab = new bootstrap.Tab(generalTabButton);
            generalTab.show();
        }

        if (contenedorBtnGuia) {
            contenedorBtnGuia.style.display = hayTraslado ? 'flex' : 'none';
            if (!hayTraslado && mensajeAlertaTransporte) mensajeAlertaTransporte.classList.add('d-none');
        }

        const costeTransporteSpan = $('#costeTransporteLabel')?.closest('div');
        if (costeTransporteSpan) costeTransporteSpan.style.display = hayTraslado ? '' : 'none';
        actualizarTotales();
    }

    function actualizarTipoCambioVisibility() {
        if (selectMoneda && divTipoCambio && inputTipoCambio) {
            const moneda = selectMoneda.value;
            divTipoCambio.style.display = moneda !== 'Soles' ? 'block' : 'none';
            if (moneda === 'Dólares') inputTipoCambio.value = '3.6';
            else if (moneda === 'Euros') inputTipoCambio.value = '4.13';
            else inputTipoCambio.value = '1';
        }
    }

    if (guardarCompraBtn) {
        guardarCompraBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            if (!validarFechasGuia()) {
                return;
            }

            const detalles = [];
            const filaIdToArticuloId = {};
            $$('#tablaProductosGeneral tr[data-fila-id]').forEach(tr => {
                const filaId = tr.dataset.filaId;
                const trFinanciero = $(`#tablaProductosFinanciero tr[data-fila-id="${filaId}"]`);
                const trGuiaTransporte = $(`#tablaProductosGuiaTransporte tr[data-fila-id="${filaId}"]`);

                const idArticulo = tr.querySelector('.idProducto')?.value;
                const idArticuloInt = parseInt(idArticulo, 10) || 0;

                filaIdToArticuloId[filaId] = idArticuloInt;

                const cantidad = parseFloat(tr.querySelector('.cantidad')?.value) || 0;
                const precioUnitario = parseFloat(tr.querySelector('.precioUnitario')?.value) || 0;
                const costoUnitarioTransporte = parseFloat(trGuiaTransporte.querySelector('.costoUnitTransporte')?.value) || 0;
                const costeTotalTransporte = costoUnitarioTransporte * cantidad;

                const unidadTexto = tr.querySelector('.unidadMedida')?.value?.toUpperCase() || '';
                const idUnidad = UNIDAD_ID_MAP[unidadTexto] || 0;

                const descuentos = [];
                const descuentoItemValor = parseFloat(trFinanciero.dataset.descuentoItemValor) || 0;
                const descuentoItemTipo = trFinanciero.dataset.descuentoItemTipo;
                const descuentoItemMotivo = trFinanciero.dataset.descuentoItemMotivo;

                if (descuentoItemValor > 0 && ($('#descuentoSi')?.checked && $('#tipoDescuento')?.value === 'por_item')) {
                    descuentos.push({
                        motivo: descuentoItemMotivo || 'Descuento Item',
                        tipoValor: descuentoItemTipo || 'monto',
                        valor: descuentoItemValor,
                        tasaIgv: parseFloat(trFinanciero.dataset.tasaIgvItem) || 0.18
                    });
                }

                const bonificacion = parseFloat(trFinanciero.dataset.bonificacionValor) || 0;

                detalles.push({
                    idArticulo: idArticuloInt,
                    idUnidad: idUnidad,
                    cantidad: cantidad,
                    precioUnitario: precioUnitario,
                    bonificacion: bonificacion,
                    costeUnitarioTransporte: costoUnitarioTransporte,
                    costeTotalTransporte: costeTotalTransporte,
                    precioConDescuento: parseFloat(tr.dataset.precioConDescuento) || 0,
                    igvInsumo: parseFloat(tr.dataset.igvProducto) || 0,
                    total: parseFloat(tr.dataset.totalProducto) || 0,
                    pesoTotal: parseFloat(tr.dataset.pesoTotal) || 0,
                    descuentos: descuentos,
                    lotes: lotes[filaId] || []
                });
            });

            if (detalles.length === 0) {
                alert("No se ha seleccionado ningún producto o los productos no tienen un ID válido.");
                return;
            }

            const proveedorId = parseInt($('#proveedorId')?.value, 10) || 0;
            const monedaId = parseInt($('#moneda')?.value, 10) || 0;
            const tipoComprobanteId = parseInt($('#tipoComprobante')?.value, 10) || 0;
            const tipoPagoId = parseInt($('#tipoPago')?.value, 10) || 0;
            const formaPagoId = parseInt($('#formaPago')?.value, 10) || 0;

            if (proveedorId <= 0) { alert('Debe seleccionar un proveedor válido.'); return; }
            if (monedaId <= 0) { alert('Debe seleccionar una moneda válida.'); return; }

            const descuentosGlobales = [];
            if (descuentoSi?.checked && tipoDescuentoSelect?.value === 'global') {
                const tipoValor = tipoValorDescuentoSelect.value;
                const valorDescuentoInputVal = valorDescuentoInput.value.trim();
                const valor = parseFloat(valorDescuentoInputVal) || 0;
                descuentosGlobales.push({ motivo: 'Descuento Global', tipoValor: tipoValor, valor: valor, tasaIgv: 0.18 });
            }

            const cajasCompraFinal = cajas.map(cajaLocal => {
                let cantidadTotalCaja = 0;

                const detallesCajaFinal = cajaLocal.productos.map(productoLocal => {
                    const idArticulo = filaIdToArticuloId[productoLocal.filaId] || 0;
                    const cantidad = parseFloat(productoLocal.cantidad) || 0;

                    if (idArticulo > 0 && cantidad > 0) {
                        cantidadTotalCaja += cantidad;
                    }

                    return {
                        idArticulo: idArticulo,
                        cantidad: cantidad,
                    };
                }).filter(d => d.idArticulo > 0 && d.cantidad > 0);

                if (detallesCajaFinal.length === 0) {
                    return null;
                }

                return {
                    idCajaCompra: cajaLocal.idCaja,
                    nombreCaja: cajaLocal.numeroBulto,
                    cantidad: cantidadTotalCaja,
                    costoCaja: cajaLocal.fleteTotal,
                    detalles: detallesCajaFinal
                };
            }).filter(c => c !== null);

            const aplicaCostoAdicional = $('#reglaAplicaCostoAdicional')?.checked || false;
            const montoMinimo = parseFloat($('#reglaMontoMinimo')?.value) || 0;
            const costoAdicional = parseFloat($('#reglaCostoAdicional')?.value) || 0;

            const data = {
                proveedorId: proveedorId,
                tipoComprobanteId: tipoComprobanteId,
                serie: $('#serie')?.value,
                correlativo: $('#correlativo')?.value,
                fechaEmision: $('#fechaEmision')?.value,
                fechaVencimiento: $('#fechaVencimiento')?.value,
                tipoPagoId: tipoPagoId,
                formaPagoId: formaPagoId,
                monedaId: monedaId,
                tipoCambio: parseFloat($('#tipoCambioInput')?.value) || 1.00,
                incluyeIgv: igvSi?.checked,
                hayBonificacion: bonifSi?.checked,
                hayTraslado: trasladoSi?.checked,
                observation: $('#observacionesGenerales')?.value,
                subtotalSinIgv: subtotalSinIgvCalculado,
                totalIgv: totalIgvCalculado,
                totalAPagar: totalCompraFinalCalculado,
                totalPeso: totalPesoProductosCalculado,
                costeTransporte: costeTransporteCalculado,
                detalles: detalles,
                referencia: referencia,
                guiaTransporte: guia,
                descuentosGlobales: descuentosGlobales,
                cajasCompra: cajasCompraFinal,
                reglaAplicada: {
                    aplicaCostoAdicional: aplicaCostoAdicional,
                    montoMinimo: montoMinimo,
                    costoAdicional: costoAdicional
                }
            };

            try {
                const response = await fetch(COMPRA_SERVLET_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                const resultData = await response.json();
                const messageToShow = resultData.message || 'Error de comunicación con el servidor (Mensaje no recibido).';

                $('#confirmMessage').textContent = messageToShow;
                modalConfirm.show();

                if (response.ok) {
                    if (formCompra) formCompra.reset();
                    $$('tbody').forEach(tbody => tbody.innerHTML = '');
                    crearFilaProducto();
                    actualizarTotales();
                    cajas = [];
                    lotes = {};
                    actualizarResumenCajasEnGuia();
                }
            } catch (error) {
                $('#confirmMessage').textContent = `Error de conexión o datos: ${error.message}`;
                modalConfirm.show();
            }
        });
    }

    if (guardarDescuentoItemBtn) {
        guardarDescuentoItemBtn.addEventListener('click', () => {
            const trFinanciero = $(`#tablaProductosFinanciero tr[data-fila-id="${itemEnEdicion}"]`);
            if (trFinanciero) {
                trFinanciero.dataset.tasaIgvItem = (parseFloat(tasaIgvDescuentoSelect.value) / 100).toFixed(2);
                trFinanciero.dataset.descuentoItemTipo = tipoValorDescuentoItemSelect.value;
                trFinanciero.dataset.descuentoItemValor = parseFloat(valorDescuentoItemInput.value) || 0;
                trFinanciero.dataset.descuentoItemMotivo = motivoDescuentoTextarea.value;
                actualizarTotales();
            }
            modalDescuentoItem.hide();
        });
    }

    async function cargarTipoComprobantes() {
        try {
            const response = await fetch(TIPO_COMPROBANTE_SERVLET_URL);
            if (!response.ok) throw new Error("Error al obtener comprobantes");
            const lista = await response.json();
            const select = document.getElementById("tipoComprobante");
            select.innerHTML = '<option value="">Seleccione</option>';
            lista.forEach(item => {
                const option = document.createElement("option");
                option.value = item.id;
                option.textContent = item.nombre;
                select.appendChild(option);
            });
        } catch (error) { console.error("Error cargando comprobantes:", error); }
    }

    async function cargarFormaPago() {
        try {
            const response = await fetch(FORMA_PAGO_SERVLET_URL);
            if (!response.ok) throw new Error("Error al obtener formas de pago");
            const lista = await response.json();
            const select = document.getElementById("formaPago");
            select.innerHTML = '<option value="">Seleccione</option>';
            lista.forEach(item => {
                const option = document.createElement("option");
                option.value = item.id;
                option.textContent = item.nombre;
                select.appendChild(option);
            });
        } catch (error) { console.error("Error cargando formas de pago:", error); }
    }

    async function cargarTipoPago() {
        try {
            const response = await fetch(TIPO_PAGO_SERVLET_URL);
            if (!response.ok) throw new Error("Error al obtener tipos de pago");
            const lista = await response.json();
            const select = document.getElementById("tipoPago");
            select.innerHTML = '<option value="">Seleccione</option>';
            lista.forEach(item => {
                const option = document.createElement("option");
                option.value = item.id;
                option.textContent = item.nombre;
                select.appendChild(option);
            });
        } catch (error) { console.error("Error cargando tipos de pago:", error); }
    }

    if ($('#btnGuardarComprobante')) {
        $('#btnGuardarComprobante').addEventListener('click', async () => {
            const nuevoComprobante = $('#nuevoComprobanteInput')?.value.trim();
            if (nuevoComprobante) {
                try {
                    const response = await fetch(TIPO_COMPROBANTE_SERVLET_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nombre: nuevoComprobante }),
                    });
                    if (response.ok) await cargarTipoComprobantes();
                } catch (error) { console.error("Error al guardar tipo de comprobante:", error); }
                modalNuevoComprobante.hide();
            }
        });
    }

    if ($('#btnGuardarFormaPago')) {
        $('#btnGuardarFormaPago').addEventListener('click', async () => {
            const nuevaFormaPago = $('#nuevaFormaPagoInput')?.value.trim();
            if (nuevaFormaPago) {
                try {
                    const response = await fetch(FORMA_PAGO_SERVLET_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nombre: nuevaFormaPago }),
                    });
                    if (response.ok) await cargarFormaPago();
                } catch (error) { console.error("Error al guardar forma de pago:", error); }
                modalNuevaFormaPago.hide();
            }
        });
    }

    if ($('#btnGuardarTipoPago')) {
        $('#btnGuardarTipoPago').addEventListener('click', async () => {
            const nuevoTipoPago = $('#nuevoTipoPagoInput')?.value.trim();
            if (nuevoTipoPago) {
                try {
                    const response = await fetch(TIPO_PAGO_SERVLET_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nombre: nuevoTipoPago }),
                    });
                    if (response.ok) await cargarTipoPago();
                } catch (error) { console.error("Error al guardar tipo de pago:", error); }
                modalNuevoTipoPago.hide();
            }
        });
    }
    cargarTipoComprobantes();
    cargarFormaPago();
    cargarTipoPago();

    if (bonifSi && bonifNo) {
        bonifSi.addEventListener('change', actualizarVisibilidadBonificacion);
        bonifNo.addEventListener('change', actualizarVisibilidadBonificacion);
    }
    if (descuentoSi && descuentoNo) {
        descuentoSi.addEventListener('change', actualizarVisibilidadDescuento);
        descuentoNo.addEventListener('change', actualizarVisibilidadDescuento);
    }
    if (tipoDescuentoSelect) tipoDescuentoSelect.addEventListener('change', actualizarVisibilidadDescuento);
    if (valorDescuentoInput) valorDescuentoInput.addEventListener('input', actualizarTotales);
    if (tipoValorDescuentoSelect) {
        tipoValorDescuentoSelect.addEventListener('change', actualizarVisibilidadDescuento);
        tipoValorDescuentoSelect.addEventListener('change', actualizarTotales);
    }
    if (selectMoneda) {
        selectMoneda.addEventListener('change', () => {
            actualizarTipoCambioVisibility();
            actualizarTotales();
        });
    }
    if (inputTipoCambio) inputTipoCambio.addEventListener('input', actualizarTotales);
    if (trasladoSi && trasladoNo) {
        trasladoSi.addEventListener('change', actualizarVisibilidadTraslado);
        trasladoNo.addEventListener('change', actualizarVisibilidadTraslado);
    }
    if (btnGuia) {
        btnGuia.addEventListener('click', () => {
            modalGuia.show();
        });
    }

    if ($('#guardarGuia')) {
        $('#guardarGuia').addEventListener('click', () => {
            guia.rucGuia = $('#rucGuia')?.value;
            guia.fechaEmision = $('#fechaEmisionGuia')?.value;
            guia.tipoComprobante = $('#tipoComprobanteGuia')?.value;
            guia.serie = $('#serieGuia')?.value;
            guia.correlativo = $('#correlativoGuia')?.value;
            guia.costeTotalTransporte = parseFloat($('#costeTransporteGuia')?.value) || 0;
            guia.ciudadTraslado = $('#ciudadTrasladoGuia')?.value;
            guia.puntoPartida = $('#puntoPartidaGuia')?.value;
            guia.puntoLlegada = $('#puntoLlegadaGuia')?.value;
            guia.serieGuiaTransporte = $('#serieGuiaTransporte')?.value;
            guia.correlativoGuiaTransporte = $('#correlativoGuiaTransporte')?.value;
            guia.peso = parseFloat($('#pesoGuia')?.value) || 0;
            guia.fechaPedido = $('#fechaPedido')?.value;
            guia.fechaEntrega = $('#fechaEntrega')?.value;
            actualizarTotales();
            modalGuia.hide();
        });
    }

    if ($('#btnReferencia')) {
        $('#btnReferencia').addEventListener('click', () => {
            modalReferencia.show();
        });
    }
    if ($('#guardarReferencia')) {
        $('#guardarReferencia').addEventListener('click', () => {
            referencia.numeroCotizacion = $('#numeroCotizacion')?.value;
            referencia.numeroPedido = $('#numeroPedido')?.value;
            modalReferencia.hide();
        });
    }
    if (igvSi && igvNo) {
        igvSi.addEventListener('change', actualizarTotales);
        igvNo.addEventListener('change', actualizarTotales);
    }

    const btnAsignarCajas = $('#guia-transporte-pane .btn-primary');
    if (btnAsignarCajas) {
        btnAsignarCajas.addEventListener('click', () => {
            iniciarModalCajas();
            modalCajas.show();
        });
    }

    const btnAgregarNuevaCaja = $('#btnAgregarNuevaCaja');
    if (btnAgregarNuevaCaja) {
        btnAgregarNuevaCaja.addEventListener('click', () => {
            crearCajaEnModal();
        });
    }

    const btnGuardarDistribucion = $('#btnGuardarDistribucion');
    if (btnGuardarDistribucion) {
        btnGuardarDistribucion.addEventListener('click', () => {
            actualizarResumenCajasEnGuia();
            modalCajas.hide();
        });
    }

    function obtenerCajasCompraParaEnvio() {
        const cajasCompraParaEnvio = [];
        cajas.forEach(caja => {
            const detallesArticulos = caja.productos.map(p => ({
                idArticulo: parseInt(p.idArticulo, 10),
                cantidad: p.cantidad
            }));

            cajasCompraParaEnvio.push({
                nombreCaja: caja.nombre,
                cantidad: 1,
                costoCaja: caja.fleteTotal,
                detalles: detallesArticulos
            });
        });
        return cajasCompraParaEnvio;
    }

    function iniciarModalCajas() {
        const productosDisponiblesEl = $('#productosDisponibles');
        const contenedorCajasModal = $('#contenedorCajasModal');
        productosDisponiblesEl.innerHTML = '';
        contenedorCajasModal.innerHTML = '';

        const tempCajas = JSON.parse(JSON.stringify(cajas));

        const todosLosProductos = $$('#tablaProductosGeneral tr[data-fila-id]').map(tr => ({
            filaId: tr.dataset.filaId,
            idArticulo: tr.dataset.idArticulo, // Agregado: se asume que existe este campo en el TR
            descripcion: tr.querySelector('.descripcion').value,
            codigo: tr.querySelector('.codigo').value,
            cantidadTotal: parseInt(tr.querySelector('.cantidad').value, 10),
            cantidadAsignada: 0
        }));

        tempCajas.forEach(caja => {
            caja.productos.forEach(pCaja => {
                const producto = todosLosProductos.find(p => p.filaId === pCaja.filaId);
                if (producto) producto.cantidadAsignada += pCaja.cantidad;
            });
        });

        todosLosProductos.forEach(prod => {
            const cantidadRestante = prod.cantidadTotal - prod.cantidadAsignada;
            if (cantidadRestante > 0) {
                const item = crearItemProductoDisponible(prod.filaId, prod.descripcion, prod.codigo, prod.cantidadTotal, cantidadRestante);
                productosDisponiblesEl.appendChild(item);
            }
        });

        tempCajas.forEach(caja => {
            const nuevaCajaEl = crearCajaEnModal(caja.id, caja.fleteTotal, caja.nombre || `CAJA #${caja.id}`);
            caja.productos.forEach(prod => {
                const item = crearItemProductoCaja(prod.filaId, prod.cantidad, prod.descripcion);
                nuevaCajaEl.querySelector('.productos-en-caja').appendChild(item);
            });
        });

        const busquedaProductoModal = $('#busquedaProductoModal');
        if (busquedaProductoModal) {
            busquedaProductoModal.addEventListener('input', () => {
                const query = busquedaProductoModal.value.toLowerCase();
                $$('#productosDisponibles .list-group-item').forEach(item => {
                    const descripcion = item.dataset.descripcion.toLowerCase();
                    const codigo = item.dataset.codigo.toLowerCase();
                    item.classList.toggle('d-none', !(descripcion.includes(query) || codigo.includes(query)));
                });
            });
        }
    }

    function crearCajaEnModal(id = proximoIdCaja++, fleteTotal = 0, nombre = `CAJA #${id}`) {
        const contenedorCajasModal = $('#contenedorCajasModal');
        const nuevaCajaEl = document.createElement('div');
        nuevaCajaEl.className = 'border p-3 mb-3';
        nuevaCajaEl.dataset.idCaja = id;
        nuevaCajaEl.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">Caja #${id}</h6>
                <input type="text" placeholder="Nombre Caja" class="form-control form-control-sm nombre-caja me-2" style="width: 120px;" value="${nombre}">
                <div class="d-flex align-items-center">
                    <label for="flete-caja-${id}" class="form-label mb-0 me-2 small">Costo:</label>
                    <input type="number" id="flete-caja-${id}" class="form-control form-control-sm flete-caja text-end" value="${fleteTotal.toFixed(2)}" step="0.01" style="width: 80px;">
                    <button type="button" class="btn-close btn-sm ms-2" aria-label="Eliminar caja"></button>
                </div>
            </div>
            <div class="list-group productos-en-caja"></div>
        `;
        contenedorCajasModal.appendChild(nuevaCajaEl);

        nuevaCajaEl.querySelector('.btn-close').addEventListener('click', () => {
            const idCaja = nuevaCajaEl.dataset.idCaja;
            const cajaAEliminar = cajas.find(c => c.id === parseInt(idCaja));
            if (cajaAEliminar) {
                cajaAEliminar.productos.forEach(prod => {
                    devolverProductoAlDisponible(prod.filaId, prod.cantidad);
                });
            }
            cajas = cajas.filter(c => c.id !== parseInt(idCaja));
            nuevaCajaEl.remove();
        });

        nuevaCajaEl.querySelector('.flete-caja').addEventListener('input', () => {
            const fleteIngresado = parseFloat(nuevaCajaEl.querySelector('.flete-caja').value) || 0;
            const caja = cajas.find(c => c.id === id);
            if (caja) caja.fleteTotal = fleteIngresado;
        });

        nuevaCajaEl.querySelector('.nombre-caja').addEventListener('input', () => {
            const nombreIngresado = nuevaCajaEl.querySelector('.nombre-caja').value.trim();
            const caja = cajas.find(c => c.id === id);
            if (caja) caja.nombre = nombreIngresado;
        });
        return nuevaCajaEl;
    }

    function crearItemProductoDisponible(filaId, descripcion, codigo, cantidadTotal, cantidadRestante) {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.dataset.filaId = filaId;
        item.dataset.descripcion = descripcion;
        item.dataset.codigo = codigo;
        item.innerHTML = `
            <div>
                <strong>${escapeHtml(descripcion)}</strong>
                <div class="small-muted">
                    Total: <span class="cantidad-total">${cantidadTotal}</span> | Restante: <span class="cantidad-restante">${cantidadRestante}</span>
                </div>
            </div>
            <button type="button" class="btn btn-primary btn-sm btn-asignar-caja" data-fila-id="${filaId}">Asignar</button>
        `;

        item.querySelector('.btn-asignar-caja').addEventListener('click', () => {
            abrirModalAsignacion(filaId);
        });
        return item;
    }

    function abrirModalAsignacion(filaId) {
        const trGeneral = $(`#tablaProductosGeneral tr[data-fila-id="${filaId}"]`);
        if (!trGeneral) return;

        const cantidadTotalGeneral = parseInt(trGeneral.querySelector('.cantidad').value, 10);
        let cantidadAsignada = 0;
        let productoExistenteEnCaja = false;

        $$('.modal-body .list-group-item[data-fila-id="' + filaId + '"]').forEach(el => {
            const cantidadInput = el.querySelector('.cantidad-caja');
            cantidadAsignada += parseInt(cantidadInput?.value, 10) || 0;
            productoExistenteEnCaja = true;
        });

        const cantidadRestante = cantidadTotalGeneral - cantidadAsignada;
        if (cantidadRestante <= 0) {
            alert('Este producto ya ha sido asignado por completo.');
            return;
        }

        const modalAsignar = new bootstrap.Modal(document.getElementById('modalAsignarCaja'));
        const modalBody = $('#modalAsignarCaja .modal-body');
        modalBody.innerHTML = '';

        const form = document.createElement('form');
        form.innerHTML = `
            <div class="mb-3">
                <label for="cantidadAsignar" class="form-label">Cantidad a asignar:</label>
                <input type="number" class="form-control" id="cantidadAsignar" min="1" max="${cantidadRestante}" value="1">
                <small class="form-text text-muted">Cantidad restante: ${cantidadRestante}</small>
            </div>
            <div class="mb-3">
                <label for="cajaAsignar" class="form-label">Seleccionar Caja:</label>
                <select class="form-select" id="cajaAsignar"></select>
            </div>
            <button type="submit" class="btn btn-primary">Asignar</button>
        `;

        const selectCaja = form.querySelector('#cajaAsignar');
        if (!selectCaja) return;

        $$('#contenedorCajasModal .border').forEach(cajaEl => {
            const idCaja = cajaEl.dataset.idCaja;
            const option = document.createElement('option');
            option.value = idCaja;
            option.textContent = `Caja #${idCaja}`;
            selectCaja.appendChild(option);
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const cantidadAsignar = parseInt(form.querySelector('#cantidadAsignar').value, 10);
            const idCajaSeleccionada = parseInt(selectCaja.value, 10);

            if (cantidadAsignar <= 0 || isNaN(cantidadAsignar)) {
                alert('La cantidad a asignar debe ser mayor a 0.');
                return;
            }
            if (cantidadAsignar > cantidadRestante) {
                 alert(`La cantidad a asignar (${cantidadAsignar}) no puede ser mayor que la cantidad restante (${cantidadRestante}).`);
                return;
            }

            const cajaSeleccionada = $(`#contenedorCajasModal .border[data-id-caja="${idCajaSeleccionada}"]`);
            if (!cajaSeleccionada) {
                alert('La caja seleccionada no existe.');
                return;
            }

            const productosEnCaja = cajaSeleccionada.querySelector('.productos-en-caja');
            let itemProductoEnCaja = productosEnCaja.querySelector(`.list-group-item[data-fila-id="${filaId}"]`);
            const descripcionProducto = trGeneral.querySelector('.descripcion').value;

            if (itemProductoEnCaja) {
                const cantidadInput = itemProductoEnCaja.querySelector('.cantidad-caja');
                const nuevaCantidad = (parseInt(cantidadInput.value, 10) || 0) + cantidadAsignar;
                cantidadInput.value = nuevaCantidad;
            } else {
                const newItem = crearItemProductoCaja(filaId, cantidadAsignar, descripcionProducto);
                productosEnCaja.appendChild(newItem);
            }

            const cantidadRestanteEl = $(`#productosDisponibles .list-group-item[data-fila-id="${filaId}"] .cantidad-restante`);
            cantidadRestanteEl.textContent = cantidadRestante - cantidadAsignar;
            if (parseInt(cantidadRestanteEl.textContent) <= 0) {
                cantidadRestanteEl.closest('.list-group-item').remove();
            }
            modalAsignar.hide();
        });
        modalBody.appendChild(form);
        modalAsignar.show();
    }

    function crearItemProductoCaja(filaId, cantidad, descripcion) {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.dataset.filaId = filaId;
        item.innerHTML = `
            <span class="nombre-producto-caja">${descripcion}</span>
            <div class="d-flex align-items-center">
                <input type="number" class="form-control form-control-sm cantidad-caja text-end me-2" value="${cantidad}" min="1" style="width: 70px;">
                <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-producto-caja"><i class="bi bi-trash"></i></button>
            </div>
        `;
        item.querySelector('.btn-eliminar-producto-caja').addEventListener('click', () => {
            const cantidadDevuelta = parseInt(item.querySelector('.cantidad-caja').value, 10);
            devolverProductoAlDisponible(filaId, cantidadDevuelta);
            item.remove();
        });
        item.querySelector('.cantidad-caja').addEventListener('change', e => {
            validarCantidadProductoCaja(e.target);
        });
        return item;
    }

    function validarCantidadProductoCaja(input) {
        const item = input.closest('.list-group-item');
        const filaId = item.dataset.filaId;
        const cantidadTotalGeneral = parseInt($(`#tablaProductosGeneral tr[data-fila-id="${filaId}"] .cantidad`).value, 10) || 0;
        let cantidadAsignadaActual = 0;
        $$(`.modal-body .list-group-item[data-fila-id="${filaId}"] .cantidad-caja`).forEach(el => {
            cantidadAsignadaActual += parseInt(el.value, 10) || 0;
        });

        if (cantidadAsignadaActual > cantidadTotalGeneral) {
            alert(`La cantidad total de este producto en todas las cajas (${cantidadAsignadaActual}) excede la cantidad general (${cantidadTotalGeneral}). Por favor, ajusta la cantidad.`);
            input.value = parseInt(input.value, 10) - (cantidadAsignadaActual - cantidadTotalGeneral);
        }
    }

    function devolverProductoAlDisponible(filaId, cantidad) {
        let productoExistente = $(`#productosDisponibles .list-group-item[data-fila-id="${filaId}"]`);
        if (productoExistente) {
            const cantidadRestanteEl = productoExistente.querySelector('.cantidad-restante');
            cantidadRestanteEl.textContent = parseInt(cantidadRestanteEl.textContent) + cantidad;
        } else {
            const trGeneral = $(`#tablaProductosGeneral tr[data-fila-id="${filaId}"]`);
            if (trGeneral) {
                const descripcion = trGeneral.querySelector('.descripcion').value;
                const codigo = trGeneral.querySelector('.codigo').value;
                const cantidadTotal = parseInt(trGeneral.querySelector('.cantidad').value, 10);
                const item = crearItemProductoDisponible(filaId, descripcion, codigo, cantidadTotal, cantidad);
                $('#productosDisponibles').appendChild(item);
            }
        }
    }

    function actualizarResumenCajasEnGuia() {
        const contenedorResumen = $('#contenedorCajas');
        contenedorResumen.innerHTML = '';
        cajas = [];
        let costeTotalTransporteCalculado = 0;

        $$('#contenedorCajasModal .border').forEach(cajaEl => {
            const idCaja = parseInt(cajaEl.dataset.idCaja);
            const nombreCaja = cajaEl.querySelector('.nombre-caja').value.trim(); // Nombre agregado
            const fleteCajaTotal = parseFloat(cajaEl.querySelector('.flete-caja').value) || 0;
            const productosEnCaja = [];
            let cantidadTotalEnCaja = 0;

            $$('.productos-en-caja .list-group-item', cajaEl).forEach(productoEl => {
                const cantidad = parseInt(productoEl.querySelector('.cantidad-caja').value, 10) || 0;
                cantidadTotalEnCaja += cantidad;
            });

            const costoUnitarioDistribucion = cantidadTotalEnCaja > 0 ? fleteCajaTotal / cantidadTotalEnCaja : 0;
            $$('.productos-en-caja .list-group-item', cajaEl).forEach(productoEl => {
                const filaId = productoEl.dataset.filaId;
                const trGeneral = $(`#tablaProductosGeneral tr[data-fila-id="${filaId}"]`);
                const idArticulo = trGeneral ? trGeneral.dataset.idArticulo : filaId; // Usa idArticulo

                const cantidad = parseInt(productoEl.querySelector('.cantidad-caja').value, 10) || 0;
                const descripcion = productoEl.querySelector('.nombre-producto-caja').textContent;
                const costoTransporteProducto = costoUnitarioDistribucion * cantidad;

                // Se usa idArticulo en lugar de filaId para la estructura final
                productosEnCaja.push({ idArticulo, filaId, cantidad, descripcion, costoUnitarioDistribucion, costoTransporte: costoTransporteProducto });
            });

            if (productosEnCaja.length > 0) {
                // Se agrega el nombre de la caja
                cajas.push({ id: idCaja, nombre: nombreCaja, fleteTotal: fleteCajaTotal, productos: productosEnCaja });
                costeTotalTransporteCalculado += fleteCajaTotal;
            }
        });

        guia.costeTotalTransporte = costeTotalTransporteCalculado.toFixed(2);
        actualizarTotales();

        cajas.forEach(caja => {
            const cajaResumenEl = document.createElement('div');
            cajaResumenEl.className = 'mb-4';
            cajaResumenEl.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <strong>${caja.nombre} (Caja ${caja.id})</strong>
                    <span>Costo de Transporte: ${formatCurrency(caja.fleteTotal, 'PEN')}</span>
                </div>
                <table class="table table-striped table-sm">
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th>Cantidad</th>
                            <th class="text-end">Costo Unit. de Distribución</th>
                            <th class="text-end">Costo de Transporte</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${caja.productos.map(p => `
                            <tr>
                                <td>${p.descripcion}</td>
                                <td>${p.cantidad}</td>
                                <td class="text-end">${formatCurrency(p.costoUnitarioDistribucion, 'PEN')}</td>
                                <td class="text-end">${formatCurrency(p.costoTransporte, 'PEN')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            contenedorResumen.appendChild(cajaResumenEl);
        });
    }

    const btnToggleTotales = document.getElementById('btnToggleTotales');
    if (btnToggleTotales) {
        btnToggleTotales.addEventListener('click', () => {
            const esUnitario = btnToggleTotales.textContent.includes('Mostrar Totales por Cantidad');
            if (esUnitario) {
                mostrarModalTotales();
            } else {
                document.querySelectorAll('.precioUnitario-total, .igvUnitario-total, .pesoUnitario-total, .costoUnitarioTransporte-total, .totalUnitario-total').forEach(el => el.classList.remove('d-none'));
                document.querySelectorAll('.precioTotal-total, .igvTotal-total, .pesoTotal-total, .costeTransporte-total, .totalTotal-total').forEach(el => el.classList.add('d-none'));
                btnToggleTotales.textContent = 'Mostrar Totales por Cantidad';
            }
        });
    }

    function mostrarModalTotales() {
        const modalBody = document.querySelector('#modalTotalesPorCantidad .modal-body');
        modalBody.innerHTML = '';
        const table = document.createElement('table');
        table.className = 'table table-striped table-sm';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Descripción</th>
                    <th class="text-end">Precio Total</th>
                    <th class="text-end">IGV Total</th>
                    <th class="text-end">Peso Total</th>
                    <th class="text-end">Costo Transporte</th>
                    <th class="text-end">Total Final</th>
                </tr>
            </thead>
            <tbody id="bodyModalTotales"></tbody>
        `;
        modalBody.appendChild(table);

        const tbodyModal = document.querySelector('#bodyModalTotales');
        document.querySelectorAll('#tablaProductosGeneral tr[data-fila-id]').forEach(trGeneral => {
            const filaId = trGeneral.dataset.filaId;
            const trTotales = document.querySelector(`#tablaProductosTotales tr[data-fila-id="${filaId}"]`);
            if (trTotales) {
                const descripcion = trGeneral.querySelector('.descripcion').value;
                const precioTotal = trTotales.querySelector('.precioTotal-total').textContent;
                const igvTotal = trTotales.querySelector('.igvTotal-total').textContent;
                const pesoTotal = trTotales.querySelector('.pesoTotal-total').textContent;
                const costeTransporte = trTotales.querySelector('.costeTransporte-total').textContent;
                const totalTotal = trTotales.querySelector('.totalTotal-total').textContent;
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${descripcion}</td>
                    <td class="text-end">${precioTotal}</td>
                    <td class="text-end">${igvTotal}</td>
                    <td class="text-end">${pesoTotal}</td>
                    <td class="text-end">${costeTransporte}</td>
                    <td class="text-end">${totalTotal}</td>
                `;
                tbodyModal.appendChild(newRow);
            }
        });
        const myModal = new bootstrap.Modal(document.getElementById('modalTotalesPorCantidad'));
        myModal.show();
    }

    function iniciarModalLotes() {
        const contenedorLotes = $('#contenedorLotes');
        contenedorLotes.innerHTML = '';
        const cantidadTotalProducto = parseInt($(`#tablaProductosGeneral tr[data-fila-id="${filaIdLoteActual}"] .cantidad`).value, 10) || 0;
        const lotesProducto = lotes[filaIdLoteActual] || [];
        let cantidadAsignada = 0;

        lotesProducto.forEach(lote => {
            cantidadAsignada += lote.cantidadLote;
            crearFilaLote(lote.id, lote.numeroLote, lote.cantidadLote, lote.fechaVencimiento);
        });

        actualizarResumenLotesEnModal(cantidadTotalProducto, cantidadAsignada);
    }

    function crearFilaLote(idLote, numeroLote, cantidad, fechaVencimiento) {
        const contenedorLotes = $('#contenedorLotes');
        const filaLote = document.createElement('div');
        filaLote.className = 'd-flex align-items-center mb-2 lote-row';
        filaLote.dataset.idLote = idLote;
        filaLote.innerHTML = `
            <div class="input-group input-group-sm me-2 flex-grow-1">
                <span class="input-group-text">Codigo Lote</span>
                <input type="text" class="form-control lote-numero-lote" value="${numeroLote || ''}">
            </div>
            <div class="input-group input-group-sm me-2">
                <span class="input-group-text">Cantidad</span>
                <input type="number" class="form-control lote-cantidad" value="${cantidad}" min="1">
            </div>
            <div class="input-group input-group-sm me-2">
                <span class="input-group-text">F. Venc.</span>
                <input type="date" class="form-control lote-fecha-vencimiento" value="${fechaVencimiento}">
            </div>
            <button type="button" class="btn btn-danger btn-sm btn-eliminar-lote"><i class="bi bi-trash"></i></button>
        `;
        contenedorLotes.appendChild(filaLote);
        filaLote.querySelector('.lote-cantidad').addEventListener('input', validarCantidadesLotes);
        filaLote.querySelector('.btn-eliminar-lote').addEventListener('click', () => {
            filaLote.remove();
            validarCantidadesLotes();
        });
    }

    function validarCantidadesLotes() {
        const cantidadTotalProducto = parseInt($(`#tablaProductosGeneral tr[data-fila-id="${filaIdLoteActual}"] .cantidad`).value, 10) || 0;
        let cantidadAsignada = 0;
        $$('#contenedorLotes .lote-cantidad').forEach(input => {
            cantidadAsignada += parseInt(input.value, 10) || 0;
        });

        if (cantidadAsignada > cantidadTotalProducto) {
            alert(`La cantidad total de lotes (${cantidadAsignada}) no puede ser mayor que la cantidad general del producto (${cantidadTotalProducto}).`);
        }
        actualizarResumenLotesEnModal(cantidadTotalProducto, cantidadAsignada);
    }

    function actualizarResumenLotesEnModal(cantidadTotal, cantidadAsignada) {
        const resumenEl = $('#resumenLotes');
        resumenEl.innerHTML = `Total del Producto: <strong>${cantidadTotal}</strong> | Cantidad Asignada: <strong>${cantidadAsignada}</strong> | Restante: <strong>${cantidadTotal - cantidadAsignada}</strong>`;
    }

    if(btnAgregarLote) {
        btnAgregarLote.addEventListener('click', () => {
            crearFilaLote(proximoIdLote++, '', 1, '');
            validarCantidadesLotes();
        });
    }

    if(btnGuardarLote) {
        btnGuardarLote.addEventListener('click', () => {
            const lotesGuardar = [];
            let cantidadAsignada = 0;
            let esValido = true;

            $$('#contenedorLotes .d-flex').forEach(filaLote => {
                const numeroLoteInput = filaLote.querySelector('.lote-numero-lote'); // 🛠️ Nuevo input
                const cantidadInput = filaLote.querySelector('.lote-cantidad');
                const fechaInput = filaLote.querySelector('.lote-fecha-vencimiento');

                const numeroLote = numeroLoteInput.value.trim(); // 🛠️ Obtener número de lote
                const cantidad = parseInt(cantidadInput.value, 10) || 0;
                const fechaVencimiento = fechaInput.value;

                if (cantidad <= 0 || !fechaVencimiento || numeroLote === '') { // 🛠️ Se valida numeroLote
                    esValido = false;
                    return;
                }
                cantidadAsignada += cantidad;
                lotesGuardar.push({
                    id: filaLote.dataset.idLote,
                    numeroLote: numeroLote,
                    cantidadLote: cantidad,
                    fechaVencimiento: fechaVencimiento
                });
            });

            const cantidadTotalProducto = parseInt($(`#tablaProductosGeneral tr[data-fila-id="${filaIdLoteActual}"] .cantidad`).value, 10) || 0;
            if (!esValido) {
                alert('Todos los lotes deben tener un número de lote, una cantidad mayor a 0 y una fecha de vencimiento.');
                return;
            }
            if (cantidadAsignada > cantidadTotalProducto) {
                alert(`La cantidad total de lotes (${cantidadAsignada}) excede la cantidad general del producto (${cantidadTotalProducto}).`);
                return;
            }
            if (cantidadAsignada < cantidadTotalProducto) {
                if (!confirm(`La cantidad total de lotes (${cantidadAsignada}) es menor que la cantidad general del producto (${cantidadTotalProducto}). ¿Desea continuar de todos modos?`)) {
                    return;
                }
            }
            lotes[filaIdLoteActual] = lotesGuardar;
            modalLotes.hide();
        });
    }

    actualizarVisibilidadBonificacion();
    actualizarVisibilidadDescuento();
    actualizarVisibilidadTraslado();
    actualizarTipoCambioVisibility();
});

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}