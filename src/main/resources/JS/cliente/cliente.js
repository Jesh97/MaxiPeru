let todosLosClientes = [];
let paginaActual = 1;
const clientesPorPagina = 25;
const clienteModal = new bootstrap.Modal(document.getElementById("clienteModal"));

async function cargarClientes(filtro = "") {
    let url = "/clientes";
    if (filtro) url += "?buscar=" + encodeURIComponent(filtro);

    const res = await fetch(url);
    todosLosClientes = await res.json();
    paginaActual = 1;
    mostrarPagina(paginaActual);
}

function mostrarPagina(pagina) {
    paginaActual = pagina;
    const inicio = (pagina - 1) * clientesPorPagina;
    const fin = inicio + clientesPorPagina;
    const clientesPagina = todosLosClientes.slice(inicio, fin);

    const tbody = document.getElementById("clienteTableBody");
    tbody.innerHTML = "";

    clientesPagina.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${c.n_Documento}</td>
            <td>${c.razonSocial}</td>
            <td>${c.direccion}</td>
            <td>${c.correo}</td>
            <td>${c.telefono}</td>
            <td class="text-nowrap">
                <button class="btn btn-sm btn-warning me-2" onclick="editarCliente(${c.id})" title="Editar">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarCliente(${c.id})" title="Eliminar">
                    <i class="bi bi-trash-fill"></i>
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
    const totalPaginas = Math.ceil(todosLosClientes.length / clientesPorPagina);

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement("button");
        btn.className = `btn btn-sm ${i === paginaActual ? 'btn-primary' : 'btn-outline-primary'} mx-1`;
        btn.textContent = i;
        btn.onclick = () => mostrarPagina(i);
        contenedor.appendChild(btn);
    }
}

function abrirModalNuevo() {
    document.getElementById("clienteForm").reset();
    document.getElementById("id").value = "";
    document.getElementById("clienteModalLabel").innerText = "Registrar Cliente";
    clienteModal.show();
}

function editarCliente(id) {
    const cliente = todosLosClientes.find(c => c.id === id);
    if (!cliente) return;

    document.getElementById("clienteModalLabel").innerText = "Editar Cliente";
    document.getElementById("id").value = cliente.id;
    document.getElementById("documento").value = cliente.n_Documento;
    document.getElementById("nombre").value = cliente.razonSocial;
    document.getElementById("direccion").value = cliente.direccion;
    document.getElementById("correo").value = cliente.correo;
    document.getElementById("telefono").value = cliente.telefono;

    clienteModal.show();
}

async function eliminarCliente(id) {
    if (confirm("¿Eliminar este cliente?")) {
        await fetch(`/clientes?id=${id}`, { method: "DELETE" });
        await cargarClientes();
    }
}

document.getElementById("clienteForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const cliente = {
        id: document.getElementById("id").value || 0,
        n_Documento: document.getElementById("documento").value,
        razonSocial: document.getElementById("nombre").value,
        direccion: document.getElementById("direccion").value,
        correo: document.getElementById("correo").value,
        telefono: document.getElementById("telefono").value
    };

    const method = cliente.id == 0 ? "POST" : "PUT";
    await fetch("/clientes", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente)
    });

    clienteModal.hide();
    cargarClientes();
});

document.getElementById("btnBuscar").addEventListener("click", () => {
    const filtro = document.getElementById("buscarInput").value;
    cargarClientes(filtro);
});

document.getElementById("btnNuevoCliente").addEventListener("click", abrirModalNuevo);

cargarClientes();
