let actividades = [];
let actividadesFiltradas = [];
let actividadesPorPagina = 10;
let paginaActual = 1;
let usandoFiltro = false;

const SERVLET_URL = '/listarUsuario';
let listadoUsuariosCache = [];

document.addEventListener('DOMContentLoaded', () => {
    listarUsuarios();
    document.getElementById('formEditarUsuario').addEventListener('submit', enviarEdicionUsuario);
});

function listarUsuarios() {
    fetch(SERVLET_URL + '?accion=listar')
        .then(res => {
            if (!res.ok) throw new Error("Error al cargar la lista de usuarios.");
            return res.json();
        })
        .then(data => {
            listadoUsuariosCache = data;
            const tbody = document.querySelector("#tablaUsuarios tbody");
            tbody.innerHTML = '';
            data.forEach(usuario => {
                const row = crearFilaUsuario(usuario);
                tbody.appendChild(row);
            });
        })
        .catch(err => {
            alert('Error: ' + err.message);
        });
}

function crearFilaUsuario(usuario) {
    const row = document.createElement("tr");

    const estadoTexto = usuario.estado === 1 ? '<span class="badge bg-success">Habilitado</span>' : '<span class="badge bg-danger">PENDIENTE</span>';
    const permisoTexto = usuario.permiteAccesoIrrestricto === 1 ? '<span class="badge bg-success">SÍ (24/7)</span>' : '<span class="badge bg-danger">NO</span>';

    let botonesAccion = `
        <button class="btn btn-warning btn-sm me-1 mb-1" onclick="abrirModalEditar(${usuario.id})" title="Editar">
            <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-info btn-sm me-1 mb-1" onclick="verActividades(${usuario.id}, '${usuario.nombre}')" title="Ver Actividades">
            <i class="fas fa-chart-line"></i>
        </button>
    `;

    if (usuario.estado === 1) {
        const estadoNuevo = 0;
        const claseBtn = 'btn-danger';
        const icono = 'fa-user-slash';
        const texto = 'Deshabilitar';

        botonesAccion += `
            <button class="btn ${claseBtn} btn-sm me-1 mb-1"
                onclick="cambiarEstadoUsuario(${usuario.id}, ${estadoNuevo})" title="${texto}">
                <i class="fas ${icono}"></i> ${texto}
            </button>
        `;

        if (usuario.rol === 'produccion') {
            const permisoNuevo = usuario.permiteAccesoIrrestricto === 1 ? 0 : 1;
            const clasePermiso = usuario.permiteAccesoIrrestricto === 1 ? 'btn-secondary' : 'btn-primary';
            const textoPermiso = usuario.permiteAccesoIrrestricto === 1 ? 'Revocar 24/7' : 'Otorgar 24/7';

            botonesAccion += `
                <button class="btn ${clasePermiso} btn-sm mb-1"
                    onclick="cambiarPermisoIrrestricto(${usuario.id}, ${permisoNuevo})" title="${textoPermiso}">
                    <i class="fas fa-clock"></i>
                    ${textoPermiso}
                </button>
            `;
        }
    } else {
        botonesAccion += `
            <button class="btn btn-success btn-sm me-1 mb-1"
                onclick="aceptarUsuario(${usuario.id})" title="Aprobar Cuenta">
                <i class="fas fa-check-circle"></i> Aceptar Cuenta
            </button>
        `;
    }

    row.innerHTML = `
        <td>${usuario.nombre}</td>
        <td>${usuario.correo}</td>
        <td>${usuario.username}</td>
        <td>${usuario.rol}</td>
        <td>${estadoTexto}</td>
        <td>${permisoTexto}</td>
        <td class="text-center">${botonesAccion}</td>
    `;
    return row;
}

function abrirModalEditar(id) {
    const usuario = listadoUsuariosCache.find(u => u.id === id);
    if (!usuario) {
        alert("Usuario no encontrado en la caché.");
        return;
    }

    document.getElementById('editId').value = usuario.id;
    document.getElementById('editNombre').value = usuario.nombre;
    document.getElementById('editCorreo').value = usuario.correo;
    document.getElementById('editUsername').value = usuario.username;
    document.getElementById('editRol').value = usuario.rol;
    document.getElementById('editEstado').value = usuario.estado;

    document.getElementById('editPassword').value = '';

    const modal = new bootstrap.Modal(document.getElementById("modalEditarUsuario"));
    modal.show();
}

function enviarEdicionUsuario(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    const params = new URLSearchParams();

    params.append('accion', 'editar');

    for (const pair of formData.entries()) {
        params.append(pair[0], pair[1]);
    }

    const url = SERVLET_URL;

    fetch(url, {
        method: 'POST',
        body: params
    })
    .then(res => {
        if (!res.ok) {
            return res.text().then(text => { throw new Error(text); });
        }
        return res.text();
    })
    .then(msg => {
        alert(msg);

        const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditarUsuario"));
        modal.hide();
        listarUsuarios();
    })
    .catch(err => {
        alert('Error al guardar cambios: ' + err.message);
    });
}

function cambiarEstadoUsuario(id, estado) {
    const confirmMsg = '¿Seguro que deseas deshabilitar este usuario?';
    if (!confirm(confirmMsg)) return;

    fetch(SERVLET_URL + `?accion=deshabilitar&id=${id}&estado=${estado}`, {
        method: 'POST'
    })
    .then(res => {
        if (!res.ok) throw new Error('Error al deshabilitar el usuario');
        return res.text();
    })
    .then(msg => {
        alert(msg);
        listarUsuarios();
    })
    .catch(err => {
        alert('Hubo un problema: ' + err.message);
    });
}

function aceptarUsuario(id) {
    const confirmMsg = '¿Deseas APROBAR y HABILITAR esta cuenta de usuario?';
    if (!confirm(confirmMsg)) return;

    fetch(SERVLET_URL + `?accion=aceptar&id=${id}`, {
        method: 'POST'
    })
    .then(res => {
        if (!res.ok) throw new Error('Error al aprobar la cuenta');
        return res.text();
    })
    .then(msg => {
        alert(msg);
        listarUsuarios();
    })
    .catch(err => {
        alert('Hubo un problema: ' + err.message);
    });
}

function cambiarPermisoIrrestricto(id, permisoNuevo) {
    const confirmMsg = permisoNuevo === 1
        ? '¿Seguro que deseas OTORGAR acceso irrestricto (24/7) a este usuario de Producción?'
        : '¿Seguro que deseas REVOCAR el acceso irrestricto?';

    if (!confirm(confirmMsg)) return;

    fetch(SERVLET_URL + `?accion=permisoIrrestricto&id=${id}&permiso=${permisoNuevo}`, {
        method: 'POST'
    })
    .then(res => {
        if (!res.ok) throw new Error('Error al actualizar el permiso irrestricto');
        return res.text();
    })
    .then(msg => {
        alert(msg);
        listarUsuarios();
    })
    .catch(err => {
        alert('Hubo un problema: ' + err.message);
    });
}

function verActividades(usuarioId, nombre) {
    fetch(SERVLET_URL + `?accion=listarActividades&id=${usuarioId}`)
        .then(res => {
            if (!res.ok) throw new Error("No autorizado o error de red");
            return res.json();
        })
        .then(data => {
            actividades = data;
            actividadesFiltradas = [];
            usandoFiltro = false;
            paginaActual = 1;

            limpiarFiltroFechas();
            renderizarActividades();

            const modal = new bootstrap.Modal(document.getElementById("modalActividades"));
            modal.show();
        })
        .catch(err => {
            alert("No se pudo cargar actividades: " + err.message);
        });
}

function renderizarActividades() {
    const lista = usandoFiltro ? actividadesFiltradas : actividades;
    const tbody = document.getElementById("tablaActividadesBody");
    tbody.innerHTML = "";

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">No hay actividades registradas.</td></tr>`;
        document.getElementById("paginacionActividades").innerHTML = "";
        return;
    }

    const inicio = (paginaActual - 1) * actividadesPorPagina;
    const fin = inicio + actividadesPorPagina;
    const pagina = lista.slice(inicio, fin);

    pagina.forEach(act => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${act.tipo}</td>
            <td>${act.description}</td>
            <td>${act.fecha}</td>
        `;
        tbody.appendChild(row);
    });

    renderizarPaginacion(lista.length);
}

function renderizarPaginacion(totalItems) {
    const totalPaginas = Math.ceil(totalItems / actividadesPorPagina);
    const contenedor = document.getElementById("paginacionActividades");
    contenedor.innerHTML = "";

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement("button");
        btn.className = `btn btn-sm ${i === paginaActual ? 'btn-primary' : 'btn-outline-primary'} me-1 mb-1`;
        btn.textContent = i;
        btn.onclick = () => {
            paginaActual = i;
            renderizarActividades();
        };
        contenedor.appendChild(btn);
    }
}

function filtrarActividadesPorFecha() {
    const fechaInicio = document.getElementById("fechaInicio").value;
    const fechaFin = document.getElementById("fechaFin").value;

    if (!fechaInicio || !fechaFin) {
        alert("Selecciona ambas fechas para filtrar.");
        return;
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);

    actividadesFiltradas = actividades.filter(act => {
        const fechaAct = new Date(act.fecha);
        return fechaAct >= inicio && fechaAct <= fin;
    });

    usandoFiltro = true;
    paginaActual = 1;
    renderizarActividades();
}

function limpiarFiltroFechas() {
    const fechaInicio = document.getElementById("fechaInicio");
    const fechaFin = document.getElementById("fechaFin");
    if (fechaInicio) fechaInicio.value = "";
    if (fechaFin) fechaFin.value = "";

    usandoFiltro = false;
    actividadesFiltradas = [];
    paginaActual = 1;
    renderizarActividades();
}