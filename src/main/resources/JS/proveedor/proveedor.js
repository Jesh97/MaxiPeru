let todosLosProveedores = [];
let paginaActual = 1;
const proveedoresPorPagina = 15;
const proveedorModal = new bootstrap.Modal(document.getElementById("proveedorModal"));

async function cargarProveedores(filtro = "") {
    let url = "/proveedores";
    if (filtro) url += "?buscar=" + encodeURIComponent(filtro);

    const res = await fetch(url);
    todosLosProveedores = await res.json();
    paginaActual = 1;
    mostrarPagina(paginaActual);
}

function mostrarPagina(pagina) {
    paginaActual = pagina;
    const inicio = (pagina - 1) * proveedoresPorPagina;
    const fin = inicio + proveedoresPorPagina;
    const listaPagina = todosLosProveedores.slice(inicio, fin);

    const tbody = document.getElementById("proveedorTableBody");
    tbody.innerHTML = "";

    listaPagina.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.ruc}</td>
            <td>${p.razonSocial}</td>
            <td>${p.ciudad}</td>
            <td>${p.direccion}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editarProveedor(${p.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarProveedor(${p.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    renderizarPaginacion();
}

function renderizarPaginacion() {
    const contenedor = document.getElementById("paginacion");
    contenedor.innerHTML = "";
    const totalPaginas = Math.ceil(todosLosProveedores.length / proveedoresPorPagina);

    for (let i = 1; i <= totalPaginas; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === paginaActual ? "active" : ""}`;
        li.innerHTML = `<button class="page-link" onclick="mostrarPagina(${i})">${i}</button>`;
        contenedor.appendChild(li);
    }
}

function abrirModalNuevo() {
    document.getElementById("proveedorForm").reset();
    document.getElementById("id").value = "";
    document.getElementById("proveedorModalLabel").innerText = "Registrar Proveedor";
    proveedorModal.show();
}

function editarProveedor(id) {
    const p = todosLosProveedores.find(prov => prov.id === id);
    if (!p) return;

    document.getElementById("id").value = p.id;
    document.getElementById("ruc").value = p.ruc;
    document.getElementById("razonSocial").value = p.razonSocial;
    document.getElementById("ciudad").value = p.ciudad;
    document.getElementById("direccion").value = p.direccion;
    document.getElementById("proveedorModalLabel").innerText = "Editar Proveedor";
    proveedorModal.show();
}

async function eliminarProveedor(id) {
    if (confirm("¿Eliminar este proveedor?")) {
        await fetch(`/proveedores?id=${id}`, { method: "DELETE" });
        await cargarProveedores();
    }
}

document.getElementById("proveedorForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const proveedor = {
        id: document.getElementById("id").value || 0,
        ruc: document.getElementById("ruc").value,
        razonSocial: document.getElementById("razonSocial").value,
        ciudad: document.getElementById("ciudad").value,
        direccion: document.getElementById("direccion").value
    };

    const method = proveedor.id == 0 ? "POST" : "PUT";
    await fetch("/proveedores", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proveedor)
    });

    proveedorModal.hide();
    cargarProveedores();
});

function buscarProveedores() {
    const filtro = document.getElementById("buscarInput").value;
    cargarProveedores(filtro);
}

if (document.getElementById("proveedorTableBody")) {
    cargarProveedores();
}
