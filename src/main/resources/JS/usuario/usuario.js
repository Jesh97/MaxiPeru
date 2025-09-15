let actividades = [];
let actividadesFiltradas = [];
let actividadesPorPagina = 10;
let paginaActual = 1;
let usandoFiltro = false;

fetch('/listarUsuario')
    .then(res => res.json())
    .then(data => {
        const tbody = document.querySelector("#tablaUsuarios tbody");
        data.forEach(usuario => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.correo}</td>
                <td>${usuario.username}</td>
                <td>${usuario.rol}</td>
                <td>${usuario.estado === 1 ? 'Habilitado' : 'Deshabilitado'}</td>
                <td class="text-center">
                    <a href="editarUsuario?id=${usuario.id}" class="btn btn-warning btn-sm me-1">
                        <i class="fas fa-edit"></i> Editar
                    </a>
                    <button class="btn ${usuario.estado === 1 ? 'btn-danger' : 'btn-success'} btn-sm me-1"
                        onclick="cambiarEstadoUsuario(${usuario.id}, ${usuario.estado === 1 ? 0 : 1})">
                        <i class="fas ${usuario.estado === 1 ? 'fa-user-slash' : 'fa-user-check'}"></i>
                        ${usuario.estado === 1 ? 'Deshabilitar' : 'Habilitar'}
                    </button>
                    <button class="btn btn-info btn-sm" onclick="verActividades(${usuario.id}, '${usuario.nombre}')">
                        <i class="fas fa-chart-line"></i> Actividades
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    });

function cambiarEstadoUsuario(id, estado) {
    const confirmMsg = estado === 0 ? '¿Seguro que deseas deshabilitar este usuario?' : '¿Deseas habilitar este usuario?';
    if (!confirm(confirmMsg)) return;

    fetch(`/usuario/deshabilitar?id=${id}&estado=${estado}`, {
        method: 'POST'
    })
        .then(res => {
            if (!res.ok) throw new Error('Error al actualizar el estado');
            return res.text();
        })
        .then(() => {
            alert('Estado actualizado correctamente.');
            location.reload();
        })
        .catch(err => {
            alert('Hubo un problema: ' + err.message);
        });
}

function verActividades(usuarioId, nombre) {
    fetch(`/ListarActividad?id=${usuarioId}`)
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
