    const SERVLET_URL = "/ProduccionServlet";

    const BRAND = {
        AZUL: "#005EB8",
        MAGENTA: "#E3007E",
        CELESTE: "#009FE3",
        GRIS: "#6D6E71",
        BG_AZUL_LIGHT: "rgba(0, 94, 184, 0.05)",
        BG_MAGENTA_LIGHT: "rgba(227, 0, 126, 0.05)"
    };

    const CATALOGO_PRODUCTOS = [
        { id: "alcohol_gel", nombre: "ALCOHOL EN GEL" },
        { id: "jabon_liq", nombre: "JABÓN LÍQUIDO (Demo)" },
        { id: "lejia", nombre: "LEJÍA (Demo)" }
    ];

    const DATA = {
        alcohol_gel: {
            nombreLargo: "ALCOHOL EN GEL",
            insumos: [
                { cod: "CARB", nombre: "Carbopol", dens: 1.000, costoKg: 67.16, cilL: 0.700 },
                { cod: "GLINA", nombre: "Glicerina", dens: 1.210, costoKg: 5.95, cilL: 3.000 },
                { cod: "PROPL", nombre: "Propilenglicol", dens: 0.995, costoKg: 10.17, cilL: 1.200 },
                { cod: "ALET96", nombre: "Alcohol etílico 96°", dens: 1.000, costoKg: 3.517, cilL: 190.000 },
                { cod: "TRIENA", nombre: "Trietalonamina", dens: 1.080, costoKg: 0.957, cilL: 0.170 },
                { cod: "H2OB", nombre: "Agua embotellada", dens: 0.960, costoKg: 0.254, cilL: 80.000 },
                { cod: "PROPB", nombre: "Propilparabeno", dens: 1.000, costoKg: 59.322, cilL: 0.040 }
            ],
            presentaciones: [
                { id: "350ML", nombre: "400 ML Caja x12", nombreEnvase: "Envase 400 ML", vol: 0.350, env: 0.43, eti: 0.09, flete: 0.09, pack: 12, emb: 1.50, pvMin: 8.75, pvMay: 7.50, pvDist: 6.80, cantMinima: 1 },
                { id: "500ML", nombre: "500 ML Caja x9", nombreEnvase: "Envase 500 ML", vol: 0.500, env: 2.11, eti: 0.09, flete: 0.09, pack: 9, emb: 1.50, pvMin: 10.83, pvMay: 9.50, pvDist: 8.50, cantMinima: 1 },
                { id: "1LTAPA", nombre: "C/Tapa Caja x12", nombreEnvase: "Envase 1L Tapa", vol: 1.000, env: 0.55, eti: 0.09, flete: 0.09, pack: 12, emb: 1.84, pvMin: 10.00, pvMay: 9.00, pvDist: 8.00, cantMinima: 1 },
                { id: "1LVALV", nombre: "C/Vál. Caja x12", nombreEnvase: "Envase 1L Válvula", vol: 1.000, env: 0.94, eti: 0.09, flete: 0.09, pack: 12, emb: 1.84, pvMin: 11.00, pvMay: 10.00, pvDist: 9.00, cantMinima: 1 },
                { id: "GALON", nombre: "Caja x 4 gln", nombreEnvase: "Galonera 3.8L", vol: 3.800, env: 2.01, eti: 0.09, flete: 0.09, pack: 4, emb: 1.83, pvMin: 30.00, pvMay: 27.00, pvDist: 25.00, cantMinima: 1 },
                { id: "BIDON", nombre: "Bidón 17.5L", nombreEnvase: "Bidón 17.5L", vol: 17.500, env: 5.92, eti: 0.09, flete: 0.09, pack: 1, emb: 0.00, pvMin: 125.00, pvMay: 115.00, pvDist: 105.00, cantMinima: 1 }
            ]
        },
        jabon_liq: {
            nombreLargo: "JABÓN LÍQUIDO (Demo)",
            insumos: [ { cod: "TEX", nombre: "Texapon 70", dens: 1.1, costoKg: 8.50, cilL: 40.000 }, { cod: "H2O", nombre: "Agua", dens: 1.0, costoKg: 0.10, cilL: 150.000 } ],
            presentaciones: [ { id: "1L-JAB", nombre: "1 Litro Jabón", nombreEnvase: "Envase 1L", vol: 1.0, env: 1.20, eti: 0.10, flete: 0.10, pack: 12, emb: 2.00, pvMin: 15.00, pvMay: 12.00, pvDist: 10.00, cantMinima: 1 } ]
        },
        lejia: {
            nombreLargo: "LEJÍA (Demo)",
            insumos: [ { cod: "HIPO", nombre: "Hipoclorito", dens: 1.2, costoKg: 1.50, cilL: 200.000 } ],
            presentaciones: [ { id: "1GL-LEJ", nombre: "1 Galón Lejía", nombreEnvase: "Galonera", vol: 3.8, env: 1.50, eti: 0.10, flete: 0.10, pack: 4, emb: 1.50, pvMin: 8.00, pvMay: 7.00, pvDist: 6.00, cantMinima: 1 } ]
        }
    };

    let listaActivaEnvasado = [];
    let listaActivaRentabilidad = [];
    let timeoutBusqueda = null;
    let timeoutBusquedaPack = null;
    let timeoutBusquedaMain = null;

    function inicializar() {
        document.getElementById('inputBusquedaMain').value = "ALCOHOL EN GEL";
        cargarProductoInicial("alcohol_gel");

        const now = new Date();
        document.getElementById('fechaImpresion').innerText = `Fecha: ${now.toLocaleDateString()}`;
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
            listaActivaEnvasado = DATA[key].presentaciones.map(p => p.id);
            listaActivaRentabilidad = DATA[key].presentaciones.map(p => p.id);
            actualizarTodo();
        }
    }

    function buscarProductoMain(texto) {
        const lista = document.getElementById('listaSugerenciasMain');
        if (texto.length < 1) {
            lista.style.display = 'none';
            return;
        }

        clearTimeout(timeoutBusquedaMain);
        timeoutBusquedaMain = setTimeout(() => {
            const resultados = CATALOGO_PRODUCTOS.filter(p => p.nombre.toLowerCase().includes(texto.toLowerCase()));
            renderizarSugerenciasMain(resultados);
        }, 200);
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
            li.innerHTML = `<div class="item-desc">${item.nombre}</div>`;
            li.onclick = () => seleccionarProductoMain(item);
            lista.appendChild(li);
        });
        lista.style.display = 'block';
    }

    function seleccionarProductoMain(item) {
        document.getElementById('inputBusquedaMain').value = item.nombre;
        document.getElementById('productoSelect').value = item.id;
        document.getElementById('listaSugerenciasMain').style.display = 'none';

        if(DATA[item.id]) {
            cargarProductoInicial(item.id);
        } else {
            alert("Datos de producción no cargados para este demo.");
        }
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
        const top5 = data.slice(0, 5);
        top5.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <div class="item-desc">${item.descripcion}</div>
                    <div class="item-meta">Código: ${item.codigo}</div>
                </div>
                <div style="text-align:right">
                    <div class="item-desc">Cap: ${item.capacidad} ${item.unidad_capacidad || 'L'}</div>
                    <div class="item-meta">S/ ${item.precio_compra}</div>
                </div>
            `;
            li.onclick = () => seleccionarItem(item);
            lista.appendChild(li);
        });
        lista.style.display = 'block';
    }

    function seleccionarItem(item) {
        document.getElementById('inputBusqueda').value = item.descripcion;
        document.getElementById('inputCapacidad').value = item.capacidad > 0 ? item.capacidad : "";
        document.getElementById('inputPrecioBD').value = item.precio_compra;
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
        const top5 = data.slice(0, 5);
        top5.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <div class="item-desc">${item.descripcion}</div>
                    <div class="item-meta">Cód: ${item.codigo}</div>
                </div>
                <div style="text-align:right">
                    <div class="item-desc">S/ ${item.precio_compra}</div>
                </div>
            `;
            li.onclick = () => seleccionarItemPack(item);
            lista.appendChild(li);
        });
        lista.style.display = 'block';
    }

    function seleccionarItemPack(item) {
        document.getElementById('inputBusquedaPack').value = item.descripcion;
        document.getElementById('inputPrecioPackBD').value = item.precio_compra;
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
        const nombreBuscado = inputBusqueda.value;
        const capManual = parseFloat(inputCap.value);
        const precioEnvase = parseFloat(inputPrecio.value) || 0;

        if (!capManual || capManual <= 0) {
            alert("Ingrese una capacidad válida o seleccione un producto de la lista.");
            return;
        }
        procesarAgregar(nombreBuscado, capManual, null, precioEnvase);
        inputBusqueda.value = "";
        inputCap.value = "";
        inputPrecio.value = "0";
    }

    function agregarPack() {
        const inputBusquedaPack = document.getElementById('inputBusquedaPack');
        const inputCantPack = document.getElementById('inputCantPack');
        const inputPrecioPackBD = document.getElementById('inputPrecioPackBD');
        const nombreBuscado = inputBusquedaPack.value;
        const cantPack = parseInt(inputCantPack.value);
        const precioCajaBD = parseFloat(inputPrecioPackBD.value) || 0;

        if (!cantPack || cantPack <= 0) {
            alert("Ingrese una cantidad de envases válida.");
            return;
        }
        procesarAgregar(nombreBuscado, null, cantPack, 0, precioCajaBD);
        inputBusquedaPack.value = "";
        inputCantPack.value = "";
        inputPrecioPackBD.value = "0";
    }

    function procesarAgregar(nombreBuscado, capManual, cantPackManual, precioEnvaseBD, precioCajaBD = 0) {
        const prodKey = document.getElementById('productoSelect').value;
        const productoData = DATA[prodKey];

        let itemExistente = productoData.presentaciones.find(p => p.nombreEnvase === nombreBuscado || p.nombre === nombreBuscado);

        if (!itemExistente && !capManual && !cantPackManual) {
             alert("Producto no encontrado. Especifique detalles.");
             return;
        }

        let idFinal;
        let nuevoItem = null;

        if (itemExistente) {
            if (cantPackManual && cantPackManual !== itemExistente.pack) {
                 idFinal = itemExistente.id + "-P" + cantPackManual;
                 let costoEmb = precioCajaBD > 0 ? precioCajaBD : itemExistente.emb;
                 nuevoItem = { ...itemExistente, id: idFinal, pack: cantPackManual, emb: costoEmb, nombre: itemExistente.nombre + " (x" + cantPackManual + ")", cantMinima: 1 };
            }
            else if (capManual && Math.abs(itemExistente.vol - capManual) > 0.001) {
                 idFinal = "CUST-" + capManual.toFixed(3);
                 nuevoItem = { ...itemExistente, id: idFinal, vol: capManual, nombreEnvase: `Env. ${capManual}L`, cantMinima: 1 };
            }
            else {
                idFinal = itemExistente.id;
            }
        } else {
            let vol = capManual || 1.0;
            let pack = cantPackManual || 1;
            idFinal = "CUST-" + vol.toFixed(3) + (pack > 1 ? "-P"+pack : "");

            nuevoItem = {
                id: idFinal,
                nombre: `Pack Cust ${vol}L (x${pack})`,
                nombreEnvase: nombreBuscado || `Env. ${vol}L`,
                vol: vol,
                env: precioEnvaseBD || 0,
                eti: 0.10, flete: 0.05,
                pack: pack, emb: precioCajaBD || 0,
                pvMin: 0, pvMay: 0, pvDist: 0,
                cantMinima: 1
            };
        }

        if (nuevoItem) {
            const yaExisteEnData = productoData.presentaciones.find(p => p.id === nuevoItem.id);
            if (!yaExisteEnData) {
                productoData.presentaciones.push(nuevoItem);
            }
        }

        if (!listaActivaEnvasado.includes(idFinal)) {
            listaActivaEnvasado.push(idFinal);
        }
        if (!listaActivaRentabilidad.includes(idFinal)) {
            listaActivaRentabilidad.push(idFinal);
        }

        actualizarTodo();
    }

    function eliminarColumnaEnvasado(id) {
        if(confirm(`¿Desea eliminar la columna ${id} de la tabla Envasado?`)){
            listaActivaEnvasado = listaActivaEnvasado.filter(i => i !== id);
            actualizarTodo();
        }
    }

    function eliminarColumnaRentabilidad(id) {
        if(confirm(`¿Desea eliminar la columna ${id} de la tabla Rentabilidad?`)){
            listaActivaRentabilidad = listaActivaRentabilidad.filter(i => i !== id);
            actualizarTodo();
        }
    }

    function actualizarPrecioPack(idProducto, nuevoValorPack) {
        const prodKey = document.getElementById('productoSelect').value;
        const nivelKey = document.getElementById('nivelSelect').value;
        const producto = DATA[prodKey].presentaciones.find(p => p.id === idProducto);

        if (producto) {
            const nuevoUnitario = parseFloat(nuevoValorPack) / producto.pack;
            producto[nivelKey] = nuevoUnitario || 0;
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

    function actualizarTodo() {
        const prodKey = document.getElementById('productoSelect').value;
        const nivelKey = document.getElementById('nivelSelect').value;
        const producto = DATA[prodKey];

        if (!producto) return;

        const nivelSelect = document.getElementById('nivelSelect');
        const nivelTexto = nivelSelect.options[nivelSelect.selectedIndex].text;

        const nombreProd = producto.nombreLargo || "PRODUCTO";

        document.getElementById('verticalNombre').innerText = nombreProd;
        document.getElementById('lblProductoScreen').innerText = nombreProd;
        document.getElementById('lblProductoPrint').innerText = nombreProd;

        document.getElementById('labelModo').innerText = `MODO: ${nivelTexto}`;
        document.getElementById('tituloRentabilidad').innerText = `ANÁLISIS DE RENTABILIDAD A ${nivelTexto}`;

        let labelPrecio = "PRECIO MINORISTA";
        if (nivelKey === 'pvMay') labelPrecio = "PRECIO MAYORISTA";
        if (nivelKey === 'pvDist') labelPrecio = "PRECIO DISTRIB.";

        let totalLoteMp = 0;
        let htmlMP = "";
        let htmlGranel = "";

        producto.insumos.forEach(i => {
            const kgLote = i.cilL * i.dens;
            const subtotal = kgLote * i.costoKg;
            totalLoteMp += subtotal;

            htmlMP += `<tr>
                <td class="text-left font-bold" style="color:${BRAND.AZUL}">${i.cod}</td><td class="text-left">${i.nombre}</td><td>${i.dens.toFixed(3)}</td><td>S/ ${i.costoKg.toFixed(2)}</td><td>${i.cilL.toFixed(3)}</td>
                <td>${kgLote.toFixed(3)}</td><td>${(kgLote/2).toFixed(3)}</td><td>${(kgLote/4).toFixed(3)}</td><td>${(kgLote/12).toFixed(3)}</td><td>${(kgLote/60).toFixed(3)}</td><td>${(kgLote/240).toFixed(3)}</td>
            </tr>`;

            htmlGranel += `<tr><td class="text-left">1.000</td><td>S/ ${i.costoKg.toFixed(3)}</td><td>S/ ${subtotal.toFixed(2)}</td></tr>`;
        });

        const costoLitroGranel = totalLoteMp / 240;
        document.getElementById('bodyMP').innerHTML = htmlMP;
        document.getElementById('bodyGranel').innerHTML = htmlGranel;

        document.getElementById('footGranel').innerHTML = `
            <tr class="row-dark"><td>TOTAL LOTE</td><td colspan="2">S/ ${totalLoteMp.toFixed(2)}</td></tr>
            <tr class="bg-cream font-bold"><td style="color:${BRAND.MAGENTA}">GRANEL LITRO</td><td colspan="2" style="color:${BRAND.AZUL}">S/ ${costoLitroGranel.toFixed(2)}</td></tr>
        `;

        const itemsEnvasado = producto.presentaciones.filter(p => listaActivaEnvasado.includes(p.id));

        let htmlEnv = `<thead>
            <tr>
                <th class="text-left" style="background:${BRAND.AZUL}; color:white; vertical-align: bottom; padding-bottom: 10px;">DESCRIPCIÓN</th>
                ${itemsEnvasado.map(p => `
                    <th style="background:${BRAND.AZUL}; color:white; vertical-align: top; padding: 10px; text-align: center;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <span style="font-size:11px; font-weight:bold; color:#fff;">${p.id}</span>
                            <span class="remove-col" onclick="eliminarColumnaEnvasado('${p.id}')" style="color:${BRAND.MAGENTA}; cursor:pointer; background:white; border-radius:50%; width:16px; height:16px; line-height:16px; display:block;" title="Eliminar columna">×</span>
                        </div>
                        <div style="font-size:10px; color:#e2e8f0; line-height:1.2; margin-bottom:2px;">${p.nombreEnvase || p.nombre}</div>
                        <div style="font-size:11px; font-weight:bold;">${p.vol.toFixed(3)} L</div>
                    </th>
                `).join('')}
            </tr>
        </thead>
        <tbody>`;

        const filasEnv = [
            { n: "Producto a granel", f: (p) => costoLitroGranel * p.vol },
            { n: "Envase", f: (p) => p.env },
            { n: "Etiqueta", f: (p) => p.eti },
            { n: "Flete y otros", f: (p) => p.flete }
        ];

        filasEnv.forEach(fila => {
            htmlEnv += `<tr><td class="text-left" style="color:${BRAND.GRIS}">${fila.n}</td>${itemsEnvasado.map(p => `<td style="text-align:center">S/ ${fila.f(p).toFixed(2)}</td>`).join('')}</tr>`;
        });

        htmlEnv += `<tr class="bg-cream font-bold"><td class="text-left" style="color:${BRAND.MAGENTA}">SUB-TOTAL</td>${itemsEnvasado.map(p => {
            p.subtotalUnit = (costoLitroGranel * p.vol) + p.env + p.eti + p.flete;
            return `<td style="color:${BRAND.AZUL}; text-align:center">S/ ${p.subtotalUnit.toFixed(2)}</td>`;
        }).join('')}</tr>`;

        htmlEnv += `<tr><td class="text-left">IGV 18%</td>${itemsEnvasado.map(p => {
            p.igvUnit = p.subtotalUnit * 0.18;
            return `<td style="text-align:center">S/ ${p.igvUnit.toFixed(2)}</td>`;
        }).join('')}</tr>`;

        htmlEnv += `<tr class="row-dark"><td class="text-left">TOTAL COSTO</td>${itemsEnvasado.map(p => {
            p.costoFinalUnit = p.subtotalUnit + p.igvUnit;
            return `<td style="text-align:center">S/ ${p.costoFinalUnit.toFixed(2)}</td>`;
        }).join('')}</tr></tbody>`;

        document.getElementById('tablaEnvasado').innerHTML = htmlEnv;

        const itemsRentabilidad = producto.presentaciones.filter(p => listaActivaRentabilidad.includes(p.id));

        let htmlRentSimple = `<thead>
            <tr>
                <th class="text-left" style="background:${BRAND.BG_AZUL_LIGHT}; color:${BRAND.AZUL}">${labelPrecio}</th>
                <th style="background:${BRAND.BG_AZUL_LIGHT}; color:${BRAND.AZUL}">P.V PROMEDIO</th>
                <th style="background:${BRAND.BG_AZUL_LIGHT}; color:${BRAND.AZUL}">COSTO PROD.</th>
                <th style="background:${BRAND.BG_AZUL_LIGHT}; color:${BRAND.AZUL}">UTILIDAD</th>
            </tr>
        </thead><tbody>`;

        let htmlPacks = `<thead>
            <tr>
                <th class="text-left" style="background:${BRAND.AZUL}; color:white; vertical-align: bottom; padding-bottom: 10px;">UTILIDAD FINAL</th>
                ${itemsRentabilidad.map(p => `
                    <th style="background:${BRAND.AZUL}; color:white; vertical-align: top; padding: 10px; text-align: center;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <span style="font-size:11px; font-weight:bold; color:#fff; margin-bottom:2px;">${p.id}</span>
                            <span onclick="eliminarColumnaRentabilidad('${p.id}')" style="cursor:pointer; color:${BRAND.MAGENTA}; background:white; border-radius:50%; width:16px; height:16px; line-height:16px; margin-left:5px;" title="Eliminar columna">×</span>
                        </div>
                        <div style="margin-top:2px; margin-bottom:2px;">
                            <input type="number" value="${p.pack}" onchange="actualizarPackSize('${p.id}', this.value)" style="width:50px; text-align:center; border:none; border-radius:3px; font-size:11px; font-weight:bold; color:${BRAND.AZUL};">
                        </div>
                        <div style="font-size:10px; color:#e2e8f0;">${p.vol.toFixed(3)} L</div>
                    </th>`).join('')}
            </tr>
        </thead><tbody>`;

        let filaPV = `<tr><td class="text-left">Precio de Venta</td>`;
        let filaCP = `<tr><td class="text-left">Costo x Paquete</td>`;
        let filaEMB = `<tr><td class="text-left">Embalaje</td>`;
        let filaUtil = `<tr class="util-cell"><td class="text-left font-bold" style="color:${BRAND.AZUL}">UTILIDAD</td>`;
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

        itemsRentabilidad.forEach(p => {
            const pvUnit = p[nivelKey];
            const costoUnit = p.costoFinalUnit;
            const utilUnit = pvUnit - costoUnit;

            htmlRentSimple += `<tr class="row-dark">
                <td class="text-center" style="background:rgba(255,255,255,0.4)">S/ ${pvUnit.toFixed(2)}</td>
                <td style="text-align:center">S/ ${pvUnit.toFixed(2)}</td>
                <td style="text-align:center">S/ ${costoUnit.toFixed(2)}</td>
                <td class="util-cell" style="text-align:center; color:${utilUnit>0 ? BRAND.AZUL : BRAND.MAGENTA}">S/ ${utilUnit.toFixed(2)}</td>
            </tr>`;

            const pvPack = pvUnit * p.pack;
            const costoPack = (costoUnit * p.pack) + p.emb;
            const utilPack = pvPack - costoPack;
            const margen = (utilPack / pvPack) * 100;

            filaPV += `<td class="text-center" style="padding:4px;">
                    <input type="number" step="1.00" value="${pvPack.toFixed(2)}"
                           onchange="actualizarPrecioPack('${p.id}', this.value)"
                           style="width:80px; text-align:center; border:2px solid ${BRAND.CELESTE}; border-radius:4px; font-weight:bold; color:${BRAND.AZUL}; outline:none;">
                </td>`;

            filaCP += `<td style="text-align:center">S/ ${costoPack.toFixed(2)}</td>`;
            filaEMB += `<td style="text-align:center">S/ ${p.emb.toFixed(2)}</td>`;
            filaUtil += `<td style="text-align:center; font-weight:bold; color:${utilPack>0 ? BRAND.AZUL : BRAND.MAGENTA}">S/ ${utilPack.toFixed(2)}</td>`;

            let colorMargen = margen < 20 ? BRAND.MAGENTA : BRAND.AZUL;
            filaMargen += `<td style="text-align:center; color:${colorMargen}; font-weight:bold">${margen.toFixed(0)}%</td>`;

            let cantMin = p.cantMinima || 1;
            let totalCosto = costoPack * cantMin;
            let totalVenta = pvPack * cantMin;
            let totalUtil = utilPack * cantMin;

            htmlResumen += `<tr>
                <td class="text-left font-bold">${p.nombre}</td>
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

        itemsRentabilidad.forEach(p => {
            const qty = p.cantMinima || 1;
            const costPack = (p.costoFinalUnit * p.pack) + p.emb;
            const totalCost = costPack * qty;

            const levels = [
                { lbl: "MINORISTA", val: p.pvMin, bg: "#f0f9ff", txt: BRAND.AZUL },
                { lbl: "MAYORISTA", val: p.pvMay, bg: "#fdf2f8", txt: BRAND.MAGENTA },
                { lbl: "DISTRIBUIDOR", val: p.pvDist, bg: "#ffffff", txt: BRAND.GRIS }
            ];

            levels.forEach((l, index) => {
                const pvPack = l.val * p.pack;
                const totalVenta = pvPack * qty;
                const util = totalVenta - totalCost;

                htmlComp += `<tr>`;
                if(index === 0) {
                    htmlComp += `<td rowspan="3" class="text-left font-bold" style="vertical-align:middle; background:#fff;">${p.nombre}</td>`;
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

    window.onload = inicializar;