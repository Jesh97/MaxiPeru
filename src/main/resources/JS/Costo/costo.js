const SERVLET_URL = '/ProduccionServlet';
const COSTO_URL = '/CostoServlet';

const BRAND = {
    AZUL: "#005EB8", MAGENTA: "#E3007E", CELESTE: "#009FE3", GRIS: "#6D6E71", NARANJA: "#F58220",
    BG_AZUL_LIGHT: "rgba(0, 94, 184, 0.05)",
    BG_MAGENTA_LIGHT: "rgba(227, 0, 126, 0.05)",
    BG_NARANJA_LIGHT: "rgba(245, 130, 32, 0.05)"
};

/** Clave art_<id_articulo>: { nombreLargo, insumos, presentaciones, litrosLoteBase } */
const DATA = {};

function fetchCosto(url, init) {
    return fetch(url, Object.assign({ credentials: 'same-origin' }, init || {}));
}

let listaItemsActivos = [];
let timeoutBusqueda = null;
let timeoutBusquedaPack = null;
let timeoutBusquedaMain = null;

function round6(num) {
    return Number(Math.round(num + "e+6") + "e-6");
}

function inicializar() {
    document.getElementById('inputBusquedaMain').value = "";
    document.getElementById('productoSelect').value = "";
    listaItemsActivos = [];
    actualizarTodoVacio();

    fetchCosto(`${COSTO_URL}?action=cargar_inicial`)
        .then(res => {
            if (res.status === 401) return null;
            return res.json();
        })
        .then(j => {
            if (!j || j.error) return;
            if (j.ok === false) return;
            const idArt = j.id_articulo_sugerido;
            if (idArt == null) return;
            const key = "art_" + idArt;
            document.getElementById("productoSelect").value = key;
            document.getElementById("inputBusquedaMain").value =
                j.descripcion_articulo || j.nombre_producto || "";
            aplicarInsumosDesdeServidor(key, j, {
                descripcionFallback: j.descripcion_articulo || j.nombre_producto || ""
            });
        })
        .catch(() => {});

    const now = new Date();
    document.getElementById('fechaImpresion').innerText = `Fecha: ${now.toLocaleDateString()}`;
}

function actualizarTodoVacio() {
    document.getElementById('verticalNombre').innerText = "— Busque un producto terminado —";
    document.getElementById('lblProductoScreen').innerText = "";
    document.getElementById('lblProductoPrint').innerText = "";
    document.getElementById('bodyMP').innerHTML = `<tr><td colspan="11" style="text-align:center;color:${BRAND.GRIS};padding:16px;">Use la búsqueda superior para cargar la receta desde la base de datos.</td></tr>`;
    document.getElementById('bodyGranel').innerHTML = "";
    document.getElementById('footGranel').innerHTML = "";
    document.getElementById('tablaEnvasado').innerHTML = "";
    document.getElementById('tablaRentSimple').innerHTML = "";
    document.getElementById('tablaPacks').innerHTML = "";
    document.getElementById('tablaResumen').innerHTML = "";
    document.getElementById('tablaComparativa').innerHTML = "";
}

function guardarBD() {
    const nombre = prompt("Nombre para guardar:", "Config-" + new Date().toLocaleDateString());
    if(!nombre) return;

    const paqueteDatos = {
        main: DATA,
        items: listaItemsActivos,
        prod_sel: document.getElementById('productoSelect').value
    };

    const params = new URLSearchParams();
    params.append('action', 'guardar');
    params.append('nombre', nombre);
    params.append('data', JSON.stringify(paqueteDatos));

    fetchCosto(COSTO_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: params
    })
    .then(r => r.json())
    .then(j => {
        if (j.error) alert(j.error);
        else alert(j.mensaje || "¡Costos guardados correctamente!");
    })
    .catch(e => alert("Error al conectar: " + e));
}

function cargarBD() {
    const idCargar = prompt("Ingrese ID de configuración a recuperar:", "1");
    if(!idCargar) return;

    fetchCosto(`${COSTO_URL}?action=cargar&id=${encodeURIComponent(idCargar)}`)
        .then(r => {
            if (r.status === 404) throw new Error("No encontrado");
            return r.text();
        })
        .then(text => {
            const json = JSON.parse(text);
            if(json.main) {
                Object.keys(DATA).forEach(k => delete DATA[k]);
                Object.assign(DATA, json.main);
            }
            if(json.items) listaItemsActivos = json.items;
            else if(json.cols_env) listaItemsActivos = json.cols_env;
            if(json.prod_sel) {
                document.getElementById('productoSelect').value = json.prod_sel;
                const prod = DATA[json.prod_sel];
                if (prod && prod.nombreLargo) {
                    document.getElementById('inputBusquedaMain').value = prod.nombreLargo;
                }
            }
            actualizarTodo();
            alert("Costos recuperados desde la base de datos.");
        })
        .catch(() => alert("Error al recuperar o ID inválido."));
}

function irAlReporte() {
    document.getElementById('viewCalculadora').style.display = 'none';
    document.getElementById('viewReporte').style.display = 'block';
    const now = new Date();
    const fechaStr = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('fechaImpresion').innerText = `Generado el: ${fechaStr}`;
    window.scrollTo(0, 0);
}

function volverACalculadora() {
    document.getElementById('viewReporte').style.display = 'none';
    document.getElementById('viewCalculadora').style.display = 'block';
    window.scrollTo(0, 0);
}

function imprimirReporte() {
    window.print();
}

function cargarProductoInicial(key) {
    if(DATA[key]) {
        actualizarTodo();
    }
}

function buscarProductoMain(texto) {
    const lista = document.getElementById('listaSugerenciasMain');
    const busq = texto == null ? "" : String(texto);

    clearTimeout(timeoutBusquedaMain);
    timeoutBusquedaMain = setTimeout(() => {
        const url = `${COSTO_URL}?action=productos_terminados&busqueda=${encodeURIComponent(busq)}`;
        fetchCosto(url)
            .then(res => {
                if (res.status === 401) throw new Error("Sesión");
                return res.json();
            })
            .then(data => renderizarSugerenciasMain(Array.isArray(data) ? data : []))
            .catch(() => {
                lista.style.display = 'none';
            });
    }, busq.length === 0 ? 50 : 200);
}

function renderizarSugerenciasMain(data) {
    const lista = document.getElementById('listaSugerenciasMain');
    lista.innerHTML = '';
    if (!data || data.length === 0) {
        lista.style.display = 'none';
        return;
    }
    data.forEach(item => {
        const li = document.createElement('li');
        const titulo = item.descripcion || item.nombre || "";
        const cod = item.codigo ? ` · ${item.codigo}` : "";
        li.innerHTML = `<div class="item-desc">${titulo}</div><div class="item-meta">${cod}</div>`;
        li.onclick = () => seleccionarProductoMain(item);
        lista.appendChild(li);
    });
    lista.style.display = 'block';
}

/**
 * Rellena DATA[key] y la tabla a partir del JSON del servlet (insumos_desde_receta o cargar_inicial).
 */
function aplicarInsumosDesdeServidor(key, j, opts) {
    const descripcionFallback = (opts && opts.descripcionFallback) || "";
    if (j.error) {
        alert(j.error);
        return;
    }
    if (j.ok === false && j.mensaje) {
        alert(j.mensaje);
        DATA[key] = {
            nombreLargo: j.nombre_producto || descripcionFallback,
            insumos: [],
            presentaciones: DATA[key]?.presentaciones || [],
            litrosLoteBase: 240,
            id_receta: 0
        };
        listaItemsActivos = [];
        actualizarTodo();
        return;
    }
    const ins = (j.insumos || []).map(row => ({
        cod: row.cod,
        nombre: row.nombre,
        dens: Number(row.dens) || 1,
        costoKg: Number(row.costoKg) || 0,
        cilL: Number(row.cilL) || 0
    }));
    DATA[key] = {
        nombreLargo: j.nombre_producto || descripcionFallback,
        insumos: ins,
        presentaciones: DATA[key]?.presentaciones || [],
        litrosLoteBase: Number(j.litros_lote_base) > 0 ? Number(j.litros_lote_base) : 240,
        id_receta: j.id_receta || 0
    };
    listaItemsActivos = [];
    actualizarTodo();
}

function seleccionarProductoMain(item) {
    const idArticulo = item.id;
    if (idArticulo == null) {
        alert("Artículo sin ID.");
        return;
    }
    const key = item.idCatalogo || ("art_" + idArticulo);
    document.getElementById('inputBusquedaMain').value = item.descripcion || item.nombre || "";
    document.getElementById('productoSelect').value = key;
    document.getElementById('listaSugerenciasMain').style.display = 'none';

    const url = `${COSTO_URL}?action=insumos_desde_receta&id_articulo=${encodeURIComponent(idArticulo)}`;
    fetchCosto(url)
        .then(res => res.json())
        .then(j => aplicarInsumosDesdeServidor(key, j, {
            descripcionFallback: item.descripcion || item.nombre || ""
        }))
        .catch(e => alert("No se pudo cargar la receta: " + e));
}

function buscarEnBD(texto) {
    const lista = document.getElementById('listaSugerencias');
    if (texto.length < 2) {
        lista.style.display = 'none';
        return;
    }
    clearTimeout(timeoutBusqueda);
    timeoutBusqueda = setTimeout(() => {
        ejecutarFetch(texto);
    }, 300);
}

function ejecutarFetch(texto) {
    const url = `${SERVLET_URL}?action=buscar_articulos_embalado_y_embalaje&busqueda=${encodeURIComponent(texto)}`;
    fetch(url)
        .then(res => res.json())
        .then(data => renderizarSugerencias(data))
        .catch(err => console.error(err));
}

function renderizarSugerencias(data) {
    const lista = document.getElementById('listaSugerencias');
    lista.innerHTML = '';
    if (!data || data.length === 0) {
        lista.style.display = 'none';
        return;
    }
    data.slice(0, 5).forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<div><div class="item-desc">${item.descripcion}</div><div class="item-meta">Código: ${item.codigo}</div></div><div style="text-align:right"><div class="item-desc">Cap: ${item.capacidad} ${item.unidad_capacidad || 'L'}</div><div class="item-meta">S/ ${item.precio_compra}</div></div>`;
        li.onclick = () => seleccionarItem(item);
        lista.appendChild(li);
    });
    lista.style.display = 'block';
}

function seleccionarItem(item) {
    document.getElementById('inputBusqueda').value = item.descripcion;
    document.getElementById('inputCapacidad').value = item.capacidad > 0 ? item.capacidad : "";
    document.getElementById('inputPrecioBD').value = item.precio_compra;
    document.getElementById('inputCodigoBD').value = item.codigo;
    document.getElementById('listaSugerencias').style.display = 'none';
}

function buscarPackEnBD(texto) {
    const lista = document.getElementById('listaSugerenciasPack');
    if (texto.length < 2) {
        lista.style.display = 'none';
        return;
    }
    clearTimeout(timeoutBusquedaPack);
    timeoutBusquedaPack = setTimeout(() => {
        ejecutarFetchPack(texto);
    }, 300);
}

function ejecutarFetchPack(texto) {
    const url = `${SERVLET_URL}?action=buscar_articulos_embalado_y_embalaje&busqueda=${encodeURIComponent(texto)}`;
    fetch(url)
        .then(res => res.json())
        .then(data => renderizarSugerenciasPack(data))
        .catch(err => console.error(err));
}

function renderizarSugerenciasPack(data) {
    const lista = document.getElementById('listaSugerenciasPack');
    lista.innerHTML = '';
    if (!data || data.length === 0) {
        lista.style.display = 'none';
        return;
    }
    data.slice(0, 5).forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<div><div class="item-desc">${item.descripcion}</div><div class="item-meta">Cód: ${item.codigo}</div></div><div style="text-align:right"><div class="item-desc">S/ ${item.precio_compra}</div></div>`;
        li.onclick = () => seleccionarItemPack(item);
        lista.appendChild(li);
    });
    lista.style.display = 'block';
}

function seleccionarItemPack(item) {
    document.getElementById('inputBusquedaPack').value = item.descripcion;
    document.getElementById('inputPrecioPackBD').value = item.precio_compra;
    document.getElementById('inputCodigoPackBD').value = item.codigo;
    document.getElementById('listaSugerenciasPack').style.display = 'none';
    document.getElementById('inputCantPack').focus();
}

document.addEventListener('click', function(e) {
    const wrappers = document.querySelectorAll('.autocomplete-wrapper');
    wrappers.forEach(wrapper => {
        if (!wrapper.contains(e.target)) {
            const ul = wrapper.querySelector('ul');
            if(ul) ul.style.display = 'none';
        }
    });
});

function agregarPresentacion() {
    const inputBusqueda = document.getElementById('inputBusqueda');
    const inputCap = document.getElementById('inputCapacidad');
    const inputPrecio = document.getElementById('inputPrecioBD');
    const inputCodigo = document.getElementById('inputCodigoBD');

    const nombreBuscado = inputBusqueda.value;
    const capManual = parseFloat(inputCap.value);
    const precioEnvase = parseFloat(inputPrecio.value) || 0;
    const codigo = inputCodigo.value || "";

    if (!capManual || capManual <= 0) {
        alert("Ingrese una capacidad válida.");
        return;
    }
    procesarAgregar(nombreBuscado, capManual, null, precioEnvase, 0, codigo, 'ENV');
    inputBusqueda.value = "";
    inputCap.value = "";
    inputPrecio.value = "0";
    inputCodigo.value = "";
}

function agregarPack() {
    const inputBusquedaPack = document.getElementById('inputBusquedaPack');
    const inputCantPack = document.getElementById('inputCantPack');
    const inputPrecioPackBD = document.getElementById('inputPrecioPackBD');
    const inputCodigoPack = document.getElementById('inputCodigoPackBD');

    const nombreBuscado = inputBusquedaPack.value;
    const cantPack = parseInt(inputCantPack.value);
    const precioCajaBD = parseFloat(inputPrecioPackBD.value) || 0;
    const codigo = inputCodigoPack.value || "";

    if (!cantPack || cantPack <= 0) {
        alert("Ingrese una cantidad de envases válida.");
        return;
    }

    const prodKey = document.getElementById('productoSelect').value;
    const productoData = DATA[prodKey];
    if (!productoData) {
        alert("Primero seleccione un producto terminado en la búsqueda superior.");
        return;
    }
    if (!productoData.presentaciones) productoData.presentaciones = [];

    if(listaItemsActivos.length > 0) {
        const idUltimoEnvase = listaItemsActivos[listaItemsActivos.length - 1];
        const itemExistente = productoData.presentaciones.find(p => p.id === idUltimoEnvase);

        if(itemExistente) {
            itemExistente.pack = cantPack;
            itemExistente.emb = precioCajaBD;
            itemExistente.codigoPack = codigo;
            itemExistente.nombrePack = nombreBuscado;

            actualizarTodo();

            inputBusquedaPack.value = "";
            inputCantPack.value = "";
            inputPrecioPackBD.value = "0";
            inputCodigoPack.value = "";
            return;
        }
    }

    alert("Primero agregue un envase antes de configurar la caja.");
}

function procesarAgregar(nombreBuscado, capManual, cantPackManual, precioEnvaseBD, precioCajaBD = 0, codigo = "", origen = "AMBOS") {
    const prodKey = document.getElementById('productoSelect').value;
    const productoData = DATA[prodKey];
    if (!productoData) {
        alert("Primero seleccione un producto terminado en la búsqueda superior.");
        return;
    }
    if (!productoData.presentaciones) productoData.presentaciones = [];

    let itemExistente = null;
    if (codigo) {
        itemExistente = productoData.presentaciones.find(p => p.codigo === codigo);
    } else {
        itemExistente = productoData.presentaciones.find(p => p.nombreEnvase === nombreBuscado || p.nombre === nombreBuscado);
    }

    let idFinal;
    let nuevoItem = null;

    if (itemExistente) {
        idFinal = itemExistente.id;
        if (capManual && Math.abs(itemExistente.vol - capManual) > 0.001) {
             itemExistente.vol = capManual;
             itemExistente.nombreEnvase = `Env. ${capManual}L`;
        }
    } else {
        let vol = capManual || 1.0;
        let pack = cantPackManual || 1;
        idFinal = codigo ? codigo : ("CUST-" + vol.toFixed(3) + "-" + new Date().getTime());

        nuevoItem = {
            id: idFinal,
            codigo: codigo,
            codigoPack: "",
            nombrePack: "",
            nombre: codigo ? `${nombreBuscado}` : `Prod. ${vol}L`,
            nombreEnvase: nombreBuscado || `Env. ${vol}L`,
            vol: vol,
            env: precioEnvaseBD || 0,
            eti: 0.09,
            flete: 0,
            pack: pack,
            emb: precioCajaBD || 0,
            pvMin: 0, pvMay: 0, pvDist: 0,
            cantMinima: 1
        };
    }

    if (nuevoItem) {
        productoData.presentaciones.push(nuevoItem);
    }

    if (!listaItemsActivos.includes(idFinal)) {
        listaItemsActivos.push(idFinal);
    }

    actualizarTodo();
}

function eliminarColumna(id) {
    if(confirm(`¿Desea eliminar la columna?`)){
        listaItemsActivos = listaItemsActivos.filter(i => i !== id);
        actualizarTodo();
    }
}

function actualizarPrecioPack(idProducto, nuevoValorPack) {
    const prodKey = document.getElementById('productoSelect').value;
    const nivelKey = document.getElementById('nivelSelect').value;
    const producto = DATA[prodKey].presentaciones.find(p => p.id === idProducto);
    if (producto) {
        const nuevoUnitario = parseFloat(nuevoValorPack) / producto.pack;

        if(nivelKey === 'pvMin'){
           producto.pvMin = nuevoUnitario;
           producto.pvMay = 0;
           producto.pvDist = 0;
        } else {
           producto[nivelKey] = nuevoUnitario;
        }

        actualizarTodo();
    }
}

function actualizarCantMinima(idProducto, nuevaCant) {
    const prodKey = document.getElementById('productoSelect').value;
    const producto = DATA[prodKey].presentaciones.find(p => p.id === idProducto);
    if (producto) {
        let val = parseInt(nuevaCant);
        if(val < 1 || isNaN(val)) val = 1;
        producto.cantMinima = val;
        actualizarTodo();
    }
}

function actualizarPackSize(idProducto, nuevoPack) {
    const prodKey = document.getElementById('productoSelect').value;
    const producto = DATA[prodKey].presentaciones.find(p => p.id === idProducto);
    if (producto) {
        let val = parseInt(nuevoPack);
        if(val < 1 || isNaN(val)) val = 1;
        producto.pack = val;
        actualizarTodo();
    }
}

function actualizarFlete(idProducto, nuevoValor) {
    const prodKey = document.getElementById('productoSelect').value;
    const producto = DATA[prodKey].presentaciones.find(p => p.id === idProducto);
    if (producto) {
        producto.flete = parseFloat(nuevoValor) || 0;
        actualizarTodo();
    }
}

function actualizarTodo() {
    const prodKey = document.getElementById('productoSelect').value;
    const nivelKey = document.getElementById('nivelSelect').value;
    const producto = DATA[prodKey];

    if (!prodKey || !producto) {
        actualizarTodoVacio();
        return;
    }

    const nivelSelect = document.getElementById('nivelSelect');
    const nivelTexto = nivelSelect.options[nivelSelect.selectedIndex].text;
    const nombreProd = producto.nombreLargo || "PRODUCTO";

    document.getElementById('verticalNombre').innerText = nombreProd;
    document.getElementById('lblProductoScreen').innerText = nombreProd;
    document.getElementById('lblProductoPrint').innerText = nombreProd;
    document.getElementById('labelModo').innerText = `MODO: ${nivelTexto}`;
    document.getElementById('tituloRentabilidad').innerText = `ANÁLISIS DE RENTABILIDAD - ${nivelTexto}`;

    let labelPrecio = "PRECIO X MENOR";
    const colorHeader = BRAND.AZUL;
    const bgHeader = BRAND.BG_AZUL_LIGHT;

    if (nivelKey === 'pvMay') {
        labelPrecio = "PRECIO MAYORISTA (-10%)";
    } else if (nivelKey === 'pvDist') {
        labelPrecio = "PRECIO DISTRIBUIDOR (-15%)";
    }

    let totalLoteMp = 0;
    let htmlMP = "";
    let htmlGranel = "";

    (producto.insumos || []).forEach(i => {
        const kgLote = round6(i.cilL * i.dens);
        const subtotal = round6(kgLote * i.costoKg);
        totalLoteMp += subtotal;

        htmlMP += `<tr>
            <td style="text-align:left; color:${BRAND.AZUL}; font-weight:bold;">${i.cod}</td>
            <td style="text-align:left;">${i.nombre}</td>
            <td>${i.dens.toFixed(3)}</td>
            <td>S/ ${i.costoKg.toFixed(2)}</td>
            <td>${i.cilL.toFixed(3)}</td>
            <td>${kgLote.toFixed(3)}</td><td>${round6(kgLote/2).toFixed(3)}</td><td>${round6(kgLote/4).toFixed(3)}</td><td>${round6(kgLote/12).toFixed(3)}</td><td>${round6(kgLote/60).toFixed(3)}</td><td>${round6(kgLote/240).toFixed(3)}</td>
        </tr>`;

        htmlGranel += `<tr><td style="text-align:left;">1.000</td><td>S/ ${i.costoKg.toFixed(3)}</td><td>S/ ${subtotal.toFixed(2)}</td></tr>`;
    });

    const litrosRef = producto.litrosLoteBase && producto.litrosLoteBase > 0 ? producto.litrosLoteBase : 240;
    const costoLitroGranel = round6(totalLoteMp / litrosRef);
    document.getElementById('bodyMP').innerHTML = htmlMP;
    document.getElementById('bodyGranel').innerHTML = htmlGranel;

    document.getElementById('footGranel').innerHTML = `
        <tr style="background-color:#f9fafb; font-weight:bold;"><td style="text-align:left;">TOTAL LOTE</td><td colspan="2">S/ ${totalLoteMp.toFixed(2)}</td></tr>
        <tr style="background-color:#eff6ff; font-weight:bold;"><td style="color:${BRAND.MAGENTA}; text-align:left;">GRANEL LITRO</td><td colspan="2" style="color:${BRAND.AZUL}">S/ ${costoLitroGranel.toFixed(2)}</td></tr>
    `;

    const itemsVisibles = (producto.presentaciones || []).filter(p => listaItemsActivos.includes(p.id));

    let htmlEnv = `<thead>
        <tr>
            <th class="text-left" style="background:${BRAND.AZUL}; color:white; vertical-align: bottom; padding-bottom: 10px;">DESCRIPCIÓN</th>
            ${itemsVisibles.map(p => `
                <th style="background:${BRAND.AZUL}; color:white; vertical-align: top; padding: 10px; text-align: center; position: relative;">
                    <span class="remove-col" onclick="eliminarColumna('${p.id}')" style="position: absolute; top: 5px; right: 5px; color:${BRAND.MAGENTA}; cursor:pointer; background:white; border-radius:50%; width:16px; height:16px; line-height:16px; display:block;" title="Eliminar columna">×</span>
                    <div style="font-size:11px; font-weight:bold; color:#fff; margin-top: 5px; margin-bottom:2px;">${p.codigo || p.id}</div>
                    <div style="font-size:11px; font-weight:bold;">${p.vol.toFixed(3)} L</div>
                </th>
            `).join('')}
        </tr>
    </thead>
    <tbody>`;

    htmlEnv += `<tr><td class="text-left" style="color:${BRAND.GRIS}">Producto a granel</td>${itemsVisibles.map(p => `<td style="text-align:center">S/ ${round6(costoLitroGranel * p.vol).toFixed(2)}</td>`).join('')}</tr>`;
    htmlEnv += `<tr><td class="text-left" style="color:${BRAND.GRIS}">Envase</td>${itemsVisibles.map(p => `<td style="text-align:center">S/ ${p.env.toFixed(2)}</td>`).join('')}</tr>`;
    htmlEnv += `<tr><td class="text-left" style="color:${BRAND.GRIS}">Etiqueta</td>${itemsVisibles.map(p => `<td style="text-align:center">S/ ${p.eti.toFixed(2)}</td>`).join('')}</tr>`;
    htmlEnv += `<tr><td class="text-left" style="color:${BRAND.GRIS}">Flete y otros</td>${itemsVisibles.map(p => `<td style="text-align:center; padding:2px;"><input type="number" step="0.01" value="${p.flete.toFixed(2)}" onchange="actualizarFlete('${p.id}', this.value)" style="width:60px; text-align:center; border:1px solid #ccc; border-radius:4px;"></td>`).join('')}</tr>`;

    htmlEnv += `<tr class="bg-cream font-bold"><td class="text-left" style="color:${BRAND.MAGENTA}">SUB-TOTAL</td>${itemsVisibles.map(p => {
        p.subtotalUnit = round6((costoLitroGranel * p.vol) + p.env + p.eti + p.flete);
        return `<td style="color:${BRAND.AZUL}; text-align:center">S/ ${p.subtotalUnit.toFixed(2)}</td>`;
    }).join('')}</tr>`;

    htmlEnv += `<tr><td class="text-left">IGV 18%</td>${itemsVisibles.map(p => {
        p.igvUnit = round6(p.subtotalUnit * 0.18);
        return `<td style="text-align:center">S/ ${p.igvUnit.toFixed(2)}</td>`;
    }).join('')}</tr>`;

    htmlEnv += `<tr class="row-dark"><td class="text-left">TOTAL COSTO</td>${itemsVisibles.map(p => {
        p.costoFinalUnit = round6(p.subtotalUnit + p.igvUnit);
        return `<td style="text-align:center">S/ ${p.costoFinalUnit.toFixed(2)}</td>`;
    }).join('')}</tr></tbody>`;

    document.getElementById('tablaEnvasado').innerHTML = htmlEnv;

    let htmlRentSimple = `<thead>
        <tr>
            <th class="text-left" style="background:${bgHeader}; color:${colorHeader}">${labelPrecio}</th>
            <th style="background:${bgHeader}; color:${colorHeader}">P.V PROMEDIO</th>
            <th style="background:${bgHeader}; color:${colorHeader}">COSTO PROD.</th>
            <th style="background:${bgHeader}; color:${colorHeader}">UTILIDAD</th>
        </tr>
    </thead><tbody>`;

    let htmlPacks = `<thead>
        <tr>
            <th class="text-left" style="background:${colorHeader}; color:white; vertical-align: bottom; padding-bottom: 10px;">UTILIDAD FINAL</th>
            ${itemsVisibles.map(p => `
                <th style="background:${colorHeader}; color:white; vertical-align: top; padding: 10px; text-align: center; position: relative;">
                    <span onclick="eliminarColumna('${p.id}')" style="position: absolute; top: 5px; right: 5px; cursor:pointer; color:white; background:rgba(0,0,0,0.2); border-radius:50%; width:16px; height:16px; line-height:16px;" title="Eliminar columna">×</span>
                    <div style="font-size:11px; font-weight:bold; color:#fff; margin-top: 5px; margin-bottom:5px;">${p.codigoPack ? p.codigoPack : (p.codigo || p.id)}</div>
                    <div style="margin-bottom:5px;">
                        <input type="number" value="${p.pack}" onchange="actualizarPackSize('${p.id}', this.value)" style="width:50px; text-align:center; border:none; border-radius:3px; font-size:11px; font-weight:bold; color:${BRAND.AZUL};">
                    </div>
                    <div style="font-size:10px; color:#fff;">${p.vol.toFixed(3)} L</div>
                </th>`).join('')}
        </tr>
    </thead><tbody>`;

    let filaPV = `<tr><td class="text-left">Precio de Venta</td>`;
    let filaCP = `<tr><td class="text-left">Costo x Paquete</td>`;
    let filaEMB = `<tr><td class="text-left">Embalaje</td>`;
    let filaUtil = `<tr class="util-cell"><td class="text-left font-bold" style="color:${colorHeader}">UTILIDAD</td>`;
    let filaMargen = `<tr><td class="text-left font-bold">MARGEN %</td>`;

    let htmlResumen = `<thead>
        <tr>
            <th class="text-left" style="background:${BRAND.AZUL}; color:white">PRODUCTO</th>
            <th style="background:${BRAND.AZUL}; color:white">CANT. MÍN</th>
            <th style="background:${BRAND.AZUL}; color:white">COSTO TOTAL</th>
            <th style="background:${BRAND.AZUL}; color:white">VENTA TOTAL</th>
            <th style="background:${BRAND.AZUL}; color:white">UTILIDAD NETA</th>
            <th style="background:${BRAND.AZUL}; color:white">MARGEN %</th>
        </tr>
    </thead><tbody>`;

    itemsVisibles.forEach(p => {
        let pvUnit = p[nivelKey] || 0;
        let isAuto = false;

        if(pvUnit === 0 && p.pvMin > 0) {
             if(nivelKey === 'pvMay') {
                 pvUnit = p.pvMin * 0.90;
                 isAuto = true;
             } else if(nivelKey === 'pvDist') {
                 pvUnit = p.pvMin * 0.85;
                 isAuto = true;
             } else {
                 pvUnit = p.pvMin;
             }
        }

        const costoUnit = p.costoFinalUnit || 0;
        const utilUnit = pvUnit - costoUnit;

        htmlRentSimple += `<tr class="row-dark">
            <td class="text-center" style="background:rgba(255,255,255,0.4); font-weight:bold; color:${BRAND.AZUL}">${p.vol.toFixed(3)} L</td>
            <td style="text-align:center">S/ ${pvUnit.toFixed(2)}</td>
            <td style="text-align:center">S/ ${costoUnit.toFixed(2)}</td>
            <td class="util-cell" style="text-align:center; color:${utilUnit>0 ? BRAND.AZUL : BRAND.MAGENTA}">S/ ${utilUnit.toFixed(2)}</td>
        </tr>`;

        const pvPack = pvUnit * p.pack;
        const costoSoloProducto = round6(costoUnit * p.pack);
        const costoTotalPack = round6(costoSoloProducto + p.emb);
        const utilPack = pvPack - costoTotalPack;
        const margen = pvPack > 0 ? (utilPack / pvPack) * 100 : 0;

        const inputStyle = isAuto
            ? `border:2px dashed ${BRAND.AZUL}; color:#666; font-style:italic;`
            : `border:2px solid ${BRAND.AZUL}; color:${BRAND.AZUL}; font-weight:bold;`;

        filaPV += `<td class="text-center" style="padding:4px;">
                <input type="number" step="1.00" value="${pvPack.toFixed(2)}"
                       onchange="actualizarPrecioPack('${p.id}', this.value)"
                       style="width:80px; text-align:center; outline:none; border-radius:4px; ${inputStyle}">
            </td>`;

        filaCP += `<td style="text-align:center">S/ ${costoSoloProducto.toFixed(2)}</td>`;
        filaEMB += `<td style="text-align:center">S/ ${p.emb.toFixed(2)}</td>`;
        filaUtil += `<td style="text-align:center; font-weight:bold; color:${utilPack>0 ? BRAND.AZUL : BRAND.MAGENTA}">S/ ${utilPack.toFixed(2)}</td>`;

        let colorMargen = margen < 20 ? BRAND.MAGENTA : BRAND.AZUL;
        filaMargen += `<td style="text-align:center; color:${colorMargen}; font-weight:bold">${margen.toFixed(0)}%</td>`;

        let cantMin = p.cantMinima || 1;
        let totalCosto = costoTotalPack * cantMin;
        let totalVenta = pvPack * cantMin;
        let totalUtil = utilPack * cantMin;

        htmlResumen += `<tr>
            <td class="text-left font-bold">${p.nombrePack ? p.nombrePack : p.nombre}</td>
            <td style="text-align:center">
                <input type="number" min="1" step="1" value="${cantMin}"
                       onchange="actualizarCantMinima('${p.id}', this.value)"
                       style="width:60px; text-align:center; border:1px solid #ccc; border-radius:4px;">
            </td>
            <td style="text-align:center">S/ ${totalCosto.toFixed(2)}</td>
            <td style="text-align:center">S/ ${totalVenta.toFixed(2)}</td>
            <td class="font-bold" style="text-align:center; color:${totalUtil>0 ? BRAND.AZUL : BRAND.MAGENTA}">S/ ${totalUtil.toFixed(2)}</td>
            <td style="white-space:nowrap; text-align:center">
                <div class="utility-bar-container" style="display:inline-block; width:50px; vertical-align:middle; margin-right:5px; background:#eee;">
                    <div class="utility-bar" style="width:${Math.max(0, Math.min(100, margen))}%; height:6px; background:${colorMargen}; border-radius:3px;"></div>
                </div>
                ${margen.toFixed(1)}%
            </td>
        </tr>`;
    });

    htmlRentSimple += "</tbody>";
    htmlPacks += filaPV + "</tr>" + filaCP + "</tr>" + filaEMB + "</tr>" + filaUtil + "</tr>" + filaMargen + "</tr></tbody>";
    htmlResumen += "</tbody>";

    document.getElementById('tablaRentSimple').innerHTML = htmlRentSimple;
    document.getElementById('tablaPacks').innerHTML = htmlPacks;
    document.getElementById('tablaResumen').innerHTML = htmlResumen;

    let htmlComp = `<thead>
        <tr>
            <th class="text-left" style="background:${BRAND.AZUL}; color:white">PRODUCTO</th>
            <th style="background:${BRAND.AZUL}; color:white">NIVEL</th>
            <th style="background:${BRAND.AZUL}; color:white">PRECIO PACK</th>
            <th style="background:${BRAND.AZUL}; color:white">CANT. MÍN</th>
            <th style="background:${BRAND.AZUL}; color:white">COSTO TOTAL</th>
            <th style="background:${BRAND.AZUL}; color:white">VENTA TOTAL</th>
            <th style="background:${BRAND.AZUL}; color:white">UTILIDAD</th>
        </tr>
    </thead><tbody>`;

    itemsVisibles.forEach(p => {
        const qty = p.cantMinima || 1;
        const costoSoloProducto = p.costoFinalUnit * p.pack;
        const costPack = costoSoloProducto + p.emb;
        const totalCost = costPack * qty;

        const pvMin = p.pvMin || 0;
        const pvMay = p.pvMay || (pvMin * 0.90);
        const pvDist = p.pvDist || (pvMin * 0.85);

        const levels = [
            { lbl: "MINORISTA", val: pvMin, bg: "#f0f9ff", txt: BRAND.AZUL },
            { lbl: "MAYORISTA", val: pvMay, bg: "#fdf2f8", txt: BRAND.MAGENTA },
            { lbl: "DISTRIBUIDOR", val: pvDist, bg: "#ffffff", txt: BRAND.GRIS }
        ];

        levels.forEach((l, index) => {
            const pvPack = l.val * p.pack;
            const totalVenta = pvPack * qty;
            const util = totalVenta - totalCost;

            htmlComp += `<tr>`;
            if(index === 0) {
                htmlComp += `<td rowspan="3" class="text-left font-bold" style="vertical-align:middle; background:#fff;">${p.nombrePack ? p.nombrePack : p.nombre}</td>`;
            }
            htmlComp += `
                <td style="background:${l.bg}; color:${l.txt}; font-weight:bold;">${l.lbl}</td>
                <td style="text-align:center">S/ ${pvPack.toFixed(2)}</td>
                <td style="text-align:center">${qty}</td>
                <td style="text-align:center">S/ ${totalCost.toFixed(2)}</td>
                <td style="text-align:center">S/ ${totalVenta.toFixed(2)}</td>
                <td style="text-align:center; font-weight:bold; color:${util > 0 ? BRAND.AZUL : BRAND.MAGENTA}">S/ ${util.toFixed(2)}</td>
            </tr>`;
        });
    });

    htmlComp += "</tbody>";
    document.getElementById('tablaComparativa').innerHTML = htmlComp;
}

function procesarArchivo(input) {
    const archivo = input.files[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = function(e) {
        try {
            const json = JSON.parse(e.target.result);
            if (json.main) {
                Object.keys(DATA).forEach(k => delete DATA[k]);
                Object.assign(DATA, json.main);
            }
            if (json.prod_sel) {
                document.getElementById('productoSelect').value = json.prod_sel;
                const prod = DATA[json.prod_sel];
                document.getElementById('inputBusquedaMain').value = prod?.nombreLargo || "";
            }
            if (json.items) listaItemsActivos = json.items;
            actualizarTodo();
            alert("Archivo JSON importado.");
        } catch (err) {
            alert("No se pudo leer el archivo.");
        }
        input.value = "";
    };
    lector.readAsText(archivo);
}

window.onload = inicializar;