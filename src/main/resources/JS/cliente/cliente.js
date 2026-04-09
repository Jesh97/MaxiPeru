const clienteModalEl = document.getElementById("clienteModal");
const modalContentEl = document.getElementById("modalContent");
const customConfirmModalEl = document.getElementById("customConfirmModal");
const clienteForm = document.getElementById("clienteForm");

let todosLosClientes = [];
let paginaActual = 1;
const clientesPorPagina = 25;

window.mostrarModalCliente = function() {
    clienteModalEl.classList.remove('hidden');
    setTimeout(() => {
        clienteModalEl.classList.add('opacity-100');
        modalContentEl.classList.remove('scale-95');
        modalContentEl.classList.add('scale-100');
    }, 10);
}

window.cerrarModal = function() {
    modalContentEl.classList.remove('scale-100');
    modalContentEl.classList.add('scale-95');
    clienteModalEl.classList.remove('opacity-100');
    setTimeout(() => {
        clienteModalEl.classList.add('hidden');
        clienteForm.reset();
    }, 300);
}

clienteModalEl.addEventListener('click', (e) => {
    if (e.target === clienteModalEl) window.cerrarModal();
});

function showCustomConfirm(message, onConfirm) {
    document.getElementById("confirmMessage").textContent = message;
    customConfirmModalEl.classList.remove('hidden');
    setTimeout(() => customConfirmModalEl.classList.add('opacity-100'), 10);
    const executeBtn = document.getElementById("btnExecuteConfirm");
    const cancelBtn = document.getElementById("btnCancelConfirm");
    const newExecuteBtn = executeBtn.cloneNode(true);
    executeBtn.parentNode.replaceChild(newExecuteBtn, executeBtn);
    newExecuteBtn.onclick = () => {
        customConfirmModalEl.classList.remove('opacity-100');
        setTimeout(() => customConfirmModalEl.classList.add('hidden'), 300);
        onConfirm();
    };
    cancelBtn.onclick = () => {
        customConfirmModalEl.classList.remove('opacity-100');
        setTimeout(() => customConfirmModalEl.classList.add('hidden'), 300);
    };
}

function alertSimulado(message) {
    const temp = document.createElement('div');
    temp.className = 'fixed bottom-5 right-5 z-[100] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl transform transition-all duration-500 translate-y-20 opacity-0';
    temp.textContent = message;
    document.body.appendChild(temp);
    setTimeout(() => temp.classList.remove('translate-y-20', 'opacity-0'), 100);
    setTimeout(() => {
        temp.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => temp.remove(), 500);
    }, 3000);
}

async function cargarClientes(filtro = "") {
    let url = "/clientes";
    if (filtro) url += "?buscar=" + encodeURIComponent(filtro);
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        todosLosClientes = await res.json();
    } catch (error) {
        todosLosClientes = [];
    }
    mostrarPagina(1);
}

function mostrarPagina(pagina) {
    paginaActual = pagina;
    const inicio = (pagina - 1) * clientesPorPagina;
    const fin = inicio + clientesPorPagina;
    const clientesPagina = todosLosClientes.slice(inicio, fin);
    const tbody = document.getElementById("clienteTableBody");
    tbody.innerHTML = "";
    if (!clientesPagina || clientesPagina.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="py-10 text-center text-gray-500 font-medium italic">No hay clientes disponibles en la base de datos</td></tr>`;
    } else {
        clientesPagina.forEach(c => {
            const tr = document.createElement("tr");
            tr.className = "hover:bg-blue-50 transition duration-150";
            tr.innerHTML = `
                <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-800">${c.n_Documento || null}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700">${c.razonSocial || null}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">${c.direccion || null}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-deep-blue hidden lg:table-cell">${c.correo || null}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">${c.telefono || null}</td>
                <td class="px-4 py-3 whitespace-nowrap text-center text-sm space-x-1">
                    <button onclick="window.editarCliente(${c.id})" class="text-deep-blue p-1.5 hover:bg-blue-100 rounded-full"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                    <button onclick="window.eliminarCliente(${c.id})" class="text-red-600 p-1.5 hover:bg-red-100 rounded-full"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    lucide.createIcons();
    renderizarPaginacion();
}

function renderizarPaginacion() {
    const contenedor = document.getElementById("paginacion");
    contenedor.innerHTML = "";
    const totalPaginas = Math.ceil(todosLosClientes.length / clientesPorPagina);
    if (totalPaginas <= 1) return;
    const nav = document.createElement("div");
    nav.className = "flex items-center space-x-1 bg-white p-1 rounded-lg shadow border";
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement("button");
        btn.className = `w-8 h-8 rounded ${i === paginaActual ? 'bg-deep-blue text-white' : 'hover:bg-gray-100 text-gray-700'}`;
        btn.textContent = i;
        btn.onclick = () => mostrarPagina(i);
        nav.appendChild(btn);
    }
    contenedor.appendChild(nav);
}

window.editarCliente = function(id) {
    const c = todosLosClientes.find(item => item.id === id);
    if (!c) return;
    document.getElementById("clienteModalLabel").innerText = "Editar Cliente";
    document.getElementById("id").value = c.id;
    document.getElementById("n_Documento").value = c.n_Documento || "";
    document.getElementById("razonSocial").value = c.razonSocial || "";
    document.getElementById("direccion").value = c.direccion || "";
    document.getElementById("correo").value = c.correo || "";
    document.getElementById("telefono").value = c.telefono || "";
    window.mostrarModalCliente();
}

window.eliminarCliente = function(id) {
    showCustomConfirm("¿Eliminar este cliente permanentemente?", async () => {
        try {
            const res = await fetch(`/clientes?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                alertSimulado("Cliente eliminado con éxito");
                cargarClientes();
            }
        } catch (e) {
            alertSimulado("Error al eliminar");
        }
    });
}

clienteForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    const idValue = document.getElementById("id").value;
    const cliente = {
        id: idValue ? parseInt(idValue) : 0,
        n_Documento: document.getElementById("n_Documento").value || null,
        razonSocial: document.getElementById("razonSocial").value || null,
        direccion: document.getElementById("direccion").value || null,
        correo: document.getElementById("correo").value || null,
        telefono: document.getElementById("telefono").value || null
    };

    try {
        const method = cliente.id === 0 ? "POST" : "PUT";
        const res = await fetch("/clientes", {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cliente)
        });
        if (res.ok) {
            window.cerrarModal();
            cargarClientes();
            alertSimulado(cliente.id === 0 ? "Registrado correctamente" : "Actualizado correctamente");
        }
    } catch (error) {
        alertSimulado("Error al procesar la solicitud");
    }
});

let searchTimer;
document.getElementById("buscarInput").addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => cargarClientes(e.target.value), 300);
});

document.getElementById("btnNuevoCliente").onclick = () => {
    document.getElementById("clienteModalLabel").innerText = "Registrar Cliente";
    document.getElementById("id").value = "";
    clienteForm.reset();
    window.mostrarModalCliente();
};

window.onload = () => {
    cargarClientes();
    lucide.createIcons();
};