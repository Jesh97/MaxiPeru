// Constantes de Elementos
const clienteModalEl = document.getElementById("clienteModal");
const modalContentEl = document.getElementById("modalContent");
const customConfirmModalEl = document.getElementById("customConfirmModal");

// Variables globales para la gestión de datos
let todosLosClientes = [];
let paginaActual = 1;
const clientesPorPagina = 25;

// --- Funciones de Modal ---

window.mostrarModalCliente = function() {
    clienteModalEl.classList.remove('hidden', 'opacity-0');
    clienteModalEl.classList.add('opacity-100');
    modalContentEl.classList.remove('scale-95');
    modalContentEl.classList.add('scale-100');
}

window.cerrarModal = function() {
    modalContentEl.classList.remove('scale-100');
    modalContentEl.classList.add('scale-95');
    clienteModalEl.classList.remove('opacity-100');
    clienteModalEl.classList.add('opacity-0');
    setTimeout(() => {
        clienteModalEl.classList.add('hidden');
    }, 300);
}

window.cerrarModalExterno = function(event) {
    if (event.target === clienteModalEl) {
        window.cerrarModal();
    }
}

function showCustomConfirm(message, onConfirm) {
    document.getElementById("confirmMessage").textContent = message;
    customConfirmModalEl.classList.remove('hidden', 'opacity-0');
    customConfirmModalEl.classList.add('opacity-100');

    const executeBtn = document.getElementById("btnExecuteConfirm");
    const cancelBtn = document.getElementById("btnCancelConfirm");

    // Clonar para asegurar que el evento 'once' se adjunte correctamente
    const newExecuteBtn = executeBtn.cloneNode(true);
    executeBtn.parentNode.replaceChild(newExecuteBtn, executeBtn);

    newExecuteBtn.addEventListener('click', () => {
        customConfirmModalEl.classList.remove('opacity-100');
        customConfirmModalEl.classList.add('opacity-0', 'hidden');
        onConfirm();
    }, { once: true });

    cancelBtn.onclick = () => {
        customConfirmModalEl.classList.remove('opacity-100');
        customConfirmModalEl.classList.add('opacity-0', 'hidden');
    };
}

function alertSimulado(message) {
    const tempModal = document.createElement('div');
    tempModal.className = 'fixed inset-0 z-[60] flex items-center justify-center bg-gray-900 bg-opacity-50 transition-opacity duration-300';
    tempModal.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full transform scale-100 transition-transform duration-300 ease-out">
            <h3 class="text-xl font-bold text-deep-blue mb-3">Acción de Ventas</h3>
            <p class="text-sm text-gray-700 mb-5">${message}</p>
            <div class="flex justify-end">
                <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-deep-blue text-white text-sm font-semibold rounded-lg hover:bg-primary-blue transition duration-150">Cerrar</button>
            </div>
        </div>
    `;
    document.body.appendChild(tempModal);
    setTimeout(() => tempModal.remove(), 5000);
}

window.verVentas = function(id) {
    const cliente = todosLosClientes.find(c => c.id === id);
    const nombreCliente = cliente ? cliente.razonSocial : 'Cliente Desconocido';
    console.log(`Simulando navegación a la página de ventas del cliente ID: ${id} (${nombreCliente}).`);

    alertSimulado(`Mostrando historial de ventas para: ${nombreCliente} (ID: ${id})`);
}

// --- Funciones de Datos y Tabla ---

async function cargarClientes(filtro = "") {
    // NOTA: Esta URL depende de tu backend, el código asume una API REST en /clientes
    let url = "/clientes";
    if (filtro) url += "?buscar=" + encodeURIComponent(filtro);

    try {
        const res = await fetch(url);
        // Si el backend no existe o no devuelve un array, se puede simular datos
        if (!res.ok) {
            console.warn("La llamada a la API falló o devolvió un estado no OK. Usando datos simulados.");
            todosLosClientes = simularDatosClientes(); // Función de simulación
        } else {
            todosLosClientes = await res.json();
        }
    } catch (error) {
        console.error("Error al cargar clientes desde la API:", error);
        todosLosClientes = simularDatosClientes(); // Usar datos simulados en caso de error de red
    }

    paginaActual = 1;
    mostrarPagina(paginaActual);
}

function simularDatosClientes() {
    // Datos de ejemplo para que la tabla no esté vacía en un entorno sin backend
    const data = [];
    for (let i = 1; i <= 40; i++) {
        data.push({
            id: i,
            n_Documento: `DOC-${1000 + i}`,
            razonSocial: `Cliente S.A. ${i}`,
            direccion: `Calle Falsa ${i} - Ciudad`,
            correo: `cliente${i}@mail.com`,
            telefono: `9876543${i.toString().padStart(2, '0')}`
        });
    }
    return data;
}

function mostrarPagina(pagina) {
    paginaActual = pagina;
    const inicio = (pagina - 1) * clientesPorPagina;
    const fin = inicio + clientesPorPagina;
    const clientesPagina = todosLosClientes.slice(inicio, fin);

    const tbody = document.getElementById("clienteTableBody");
    tbody.innerHTML = "";

    if (clientesPagina.length === 0) {
        const numColumnas = 6;
        const trVacio = document.createElement("tr");
        trVacio.className = "empty-table-row";

        trVacio.innerHTML = `
            <td colspan="${numColumnas}" style="height: 100%; display: flex; align-items: center; justify-content: center; min-height: 300px;">
                <i data-lucide="info" class="w-5 h-5 inline mr-1 text-deep-blue"></i>
                No se encontraron clientes. ¡Empieza a registrar uno!
            </td>
        `;
        tbody.appendChild(trVacio);
    } else {
        clientesPagina.forEach(c => {
            const tr = document.createElement("tr");
            tr.className = "hover:bg-blue-50 transition duration-150";

            const n_Documento = c.n_Documento || 'N/A';
            const razonSocial = c.razonSocial || 'Sin Nombre';
            const direccion = c.direccion || 'No especificada';
            const correo = c.correo || 'No disponible';
            const telefono = c.telefono || 'Sin teléfono';

            tr.innerHTML = `
                <td class="whitespace-nowrap text-sm font-semibold text-gray-800">${n_Documento}</td>
                <td class="whitespace-nowrap text-sm font-medium text-gray-700">${razonSocial}</td>
                <td class="whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">${direccion}</td>
                <td class="whitespace-nowrap text-sm text-deep-blue hidden lg:table-cell">${correo}</td>
                <td class="whitespace-nowrap text-center text-sm font-medium space-x-1">
                    <button class="text-accent-green hover:text-green-700 p-2 rounded-full hover:bg-green-100 transition duration-150" onclick="window.verVentas(${c.id})" title="Ver Ventas">
                        <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                    </button>
                    <button class="text-deep-blue hover:text-blue-900 p-2 rounded-full hover:bg-blue-100 transition duration-150" onclick="window.editarCliente(${c.id})" title="Editar">
                        <i data-lucide="pencil" class="w-4 h-4"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition duration-150" onclick="window.eliminarCliente(${c.id})" title="Eliminar">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
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

    const navDiv = document.createElement("div");
    navDiv.className = "flex items-center space-x-1 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-sm";

    const prevBtn = document.createElement("button");
    prevBtn.className = `px-4 py-2 font-semibold rounded-lg transition duration-150 flex items-center shadow-sm ${paginaActual === 1
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-deep-blue'}`;
    prevBtn.innerHTML = '<i data-lucide="chevron-left" class="w-4 h-4 inline mr-1"></i> Anterior';
    prevBtn.disabled = paginaActual === 1;
    prevBtn.onclick = () => mostrarPagina(paginaActual - 1);
    navDiv.appendChild(prevBtn);

    let startPage = Math.max(1, paginaActual - 2);
    let endPage = Math.min(totalPaginas, paginaActual + 2);

    if (paginaActual <= 3) {
        endPage = Math.min(totalPaginas, 5);
    } else if (paginaActual > totalPaginas - 2) {
        startPage = Math.max(1, totalPaginas - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement("button");
        btn.className = `w-10 h-10 flex items-center justify-center text-base font-bold rounded-full transition duration-150 ${i === paginaActual
            ? 'bg-deep-blue text-white shadow-lg'
            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-deep-blue'}`;
        btn.textContent = i;
        btn.onclick = () => mostrarPagina(i);
        navDiv.appendChild(btn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.className = `px-4 py-2 font-semibold rounded-lg transition duration-150 flex items-center shadow-sm ${paginaActual === totalPaginas
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-deep-blue'}`;
    nextBtn.innerHTML = 'Siguiente <i data-lucide="chevron-right" class="w-4 h-4 inline ml-1"></i>';
    nextBtn.disabled = paginaActual === totalPaginas;
    nextBtn.onclick = () => mostrarPagina(paginaActual + 1);
    navDiv.appendChild(nextBtn);

    contenedor.appendChild(navDiv);
    lucide.createIcons();
}

// --- Funciones de CRUD ---

function abrirModalNuevo() {
    document.getElementById("clienteForm").reset();
    document.getElementById("id").value = "";
    document.getElementById("clienteModalLabel").innerText = "Registrar Cliente";
    window.mostrarModalCliente();
}

window.editarCliente = function(id) {
    const cliente = todosLosClientes.find(c => c.id === id);
    if (!cliente) return;

    document.getElementById("clienteModalLabel").innerText = "Editar Cliente";
    document.getElementById("id").value = cliente.id || '';
    document.getElementById("documento").value = cliente.n_Documento || '';
    document.getElementById("nombre").value = cliente.razonSocial || '';
    document.getElementById("direccion").value = cliente.direccion || '';
    document.getElementById("correo").value = cliente.correo || '';
    document.getElementById("telefono").value = cliente.telefono || '';

    window.mostrarModalCliente();
}

window.eliminarCliente = async function(id) {
    showCustomConfirm("¿Estás seguro de que quieres eliminar permanentemente este cliente?", async () => {
        // Asume que el backend gestiona la eliminación en la ruta /clientes/{id}
        await fetch(`/clientes/${id}`, { method: "DELETE" });
        cargarClientes();
    });
}

// --- Manejadores de Eventos ---

document.getElementById("clienteForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const cliente = {
        id: document.getElementById("id").value ? parseInt(document.getElementById("id").value) : 0,
        n_Documento: document.getElementById("documento").value,
        razonSocial: document.getElementById("nombre").value,
        direccion: document.getElementById("direccion").value,
        correo: document.getElementById("correo").value,
        telefono: document.getElementById("telefono").value
    };

    const method = cliente.id == 0 ? "POST" : "PUT";
    // Asume que el backend gestiona la creación/edición en la ruta /clientes
    await fetch("/clientes", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente)
    });

    window.cerrarModal();
    cargarClientes();
});

document.getElementById("buscarInput").addEventListener("input", () => {
    // Implementación de búsqueda en vivo al escribir
    const filtro = document.getElementById("buscarInput").value;
    cargarClientes(filtro);
});

document.getElementById("btnBuscar").addEventListener("click", () => {
    // Botón de búsqueda (Aunque el evento 'input' ya lo gestiona, se mantiene por si se quiere un evento explícito)
    const filtro = document.getElementById("buscarInput").value;
    cargarClientes(filtro);
});

document.getElementById("btnNuevoCliente").addEventListener("click", abrirModalNuevo);

// Inicialización
cargarClientes();

window.onload = () => {
     lucide.createIcons();
};