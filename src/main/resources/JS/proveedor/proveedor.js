let todosLosProveedores = [];
let paginaActual = 1;
const proveedoresPorPagina = 15;

const modalElement = document.getElementById("proveedorModal");
const buscarInput = document.getElementById("buscarInput");
const sugerenciasDropdown = document.getElementById("sugerenciasDropdown");
const NOT_AVAILABLE = "N/A";

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function ocultarSugerencias() {
    sugerenciasDropdown.classList.add("hidden");
}

function mostrarModal() {
    modalElement.classList.remove('hidden', 'opacity-0');
    modalElement.classList.add('flex', 'opacity-100');
}

function ocultarModal() {
    modalElement.classList.remove('flex', 'opacity-100');
    modalElement.classList.add('opacity-0');
    setTimeout(() => {
        modalElement.classList.add('hidden');
    }, 300);
}

async function cargarProveedores(filtro = null) {
    let url = "/proveedores";
    let isSearch = false;

    if (filtro && filtro.trim() !== "") {
        url = `/buscarProveedor?busqueda=${encodeURIComponent(filtro.trim())}`;
        isSearch = true;
    }

    ocultarSugerencias();

    try {
        const res = await fetch(url);

        if (!res.ok) {
            const errorBody = await res.text();
            throw new Error(`Error en el servidor (${res.status}): ${errorBody.substring(0, 100)}...`);
        }

        const data = await res.json();
        todosLosProveedores = Array.isArray(data) ? data : [];

        paginaActual = 1;
        mostrarPagina(paginaActual);

    } catch (error) {
        console.error("Error al cargar/buscar proveedores:", error);
        todosLosProveedores = [];
        mostrarPagina(1);

        Swal.fire({
            icon: 'error',
            title: isSearch ? 'Error de Búsqueda' : 'Error de Conexión',
            html: `No se pudieron cargar los datos. Por favor, revise la conexión con el servidor. Mensaje: <strong>${error.message || 'Error desconocido'}</strong>.`,
            background: '#ffffff',
            color: '#1e293b',
            confirmButtonColor: '#3b82f6',
        });
    }
}

function mostrarPagina(pagina) {
    paginaActual = pagina;
    const inicio = (pagina - 1) * proveedoresPorPagina;
    const fin = inicio + proveedoresPorPagina;
    const listaPagina = todosLosProveedores.slice(inicio, fin);

    const tbody = document.getElementById("proveedorTableBody");
    tbody.innerHTML = "";

    if (listaPagina.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="py-4 text-center text-gray-500">
                    No se encontraron proveedores que coincidan con la búsqueda.
                </td>
            </tr>
        `;
        renderizarPaginacion(true);
        return;
    }

    listaPagina.forEach(p => {
        const correo = p.correo || NOT_AVAILABLE;
        const telefono = p.telefono || NOT_AVAILABLE;
        const ciudad = p.ciudad || NOT_AVAILABLE;
        const direccion = p.direccion || NOT_AVAILABLE;

        const tr = document.createElement("tr");
        tr.className = "border-b border-gray-200 hover:bg-gray-100 transition duration-150";
        tr.innerHTML = `
            <td class="font-semibold">${p.ruc}</td>
            <td>${p.razonSocial}</td>
            <td class="hidden sm:table-cell text-gray-600">${correo}</td>
            <td class="hidden md:table-cell text-gray-600">${telefono}</td>
            <td class="hidden lg:table-cell text-gray-600">${ciudad}</td>
            <td class="hidden xl:table-cell text-gray-600">${direccion}</td>

            <td class="text-center space-x-1 whitespace-nowrap">
                <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-2.5 rounded-md transition duration-150 shadow-md"
                        onclick="verCompras(${p.id}, '${p.razonSocial ? p.razonSocial.replace(/'/g, "\\'") : ''}')" title="Ver Compras">
                    <i class="bi bi-box-arrow-up-right text-sm"></i>
                </button>
                <button class="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1.5 px-2.5 rounded-md transition duration-150 shadow-md"
                        onclick="editarProveedor(${p.id})" title="Editar">
                    <i class="bi bi-pencil-square text-sm"></i>
                </button>
                <button class="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-2.5 rounded-md transition duration-150 shadow-md"
                        onclick="confirmarEliminacion(${p.id})" title="Eliminar">
                    <i class="bi bi-trash3 text-sm"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    renderizarPaginacion();
}

function verCompras(id, razonSocial) {
    const url = `/compras?proveedorId=${id}`;

    Swal.fire({
        icon: 'info',
        title: 'Navegación Simulada',
        html: `Se simula la navegación para ver las compras del proveedor <strong>${razonSocial} (ID: ${id})</strong>.<br>URL de destino: <code>${url}</code>`,
        background: '#ffffff',
        color: '#1e293b',
        confirmButtonColor: '#3b82f6',
    });

    console.log("Intento de navegación a la página de compras:", url);
}

function renderizarPaginacion(hide = false) {
    const contenedor = document.getElementById("paginacion");
    contenedor.innerHTML = "";

    if (hide) return;

    const totalPaginas = Math.ceil(todosLosProveedores.length / proveedoresPorPagina);

    if (totalPaginas <= 1) return;

    const liPrev = document.createElement("li");
    liPrev.className = `pagination-item`;
    const prevButton = document.createElement("button");
    prevButton.className = "pagination-link text-sm flex items-center";
    prevButton.innerHTML = '<i class="bi bi-chevron-left mr-1"></i> Anterior';
    prevButton.onclick = () => { if (paginaActual > 1) mostrarPagina(paginaActual - 1); };
    prevButton.disabled = paginaActual === 1;
    liPrev.appendChild(prevButton);
    contenedor.appendChild(liPrev);

    const maxPagesToShow = 5;
    let startPage = Math.max(1, paginaActual - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPaginas, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement("li");
        li.className = `pagination-item ${i === paginaActual ? "active" : ""}`;
        li.innerHTML = `<button class="pagination-link text-sm" onclick="mostrarPagina(${i})">${i}</button>`;
        contenedor.appendChild(li);
    }

    const liNext = document.createElement("li");
    liNext.className = `pagination-item`;
    const nextButton = document.createElement("button");
    nextButton.className = "pagination-link text-sm flex items-center";
    nextButton.innerHTML = 'Siguiente <i class="bi bi-chevron-right ml-1"></i>';
    nextButton.onclick = () => { if (paginaActual < totalPaginas) mostrarPagina(paginaActual + 1); };
    nextButton.disabled = paginaActual === totalPaginas;
    liNext.appendChild(nextButton);
    contenedor.appendChild(liNext);
}

function abrirModalNuevo() {
    document.getElementById("proveedorForm").reset();
    document.getElementById("id").value = "";
    document.getElementById("proveedorModalLabel").innerText = "Registrar Proveedor";
    mostrarModal();
}

function editarProveedor(id) {
    const p = todosLosProveedores.find(prov => prov.id === id);
    if (!p) return;

    document.getElementById("id").value = p.id;
    document.getElementById("ruc").value = p.ruc;
    document.getElementById("razonSocial").value = p.razonSocial;
    document.getElementById("correo").value = p.correo || '';
    document.getElementById("telefono").value = p.telefono || '';
    document.getElementById("ciudad").value = p.ciudad;
    document.getElementById("direccion").value = p.direccion;
    document.getElementById("proveedorModalLabel").innerText = "Editar Proveedor";
    mostrarModal();
}

async function confirmarEliminacion(id) {
    const p = todosLosProveedores.find(prov => prov.id === id);
    if (!p) return;

    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Se eliminará al proveedor ${p.razonSocial}. ¡Esta acción es irreversible!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        background: '#ffffff',
        color: '#1e293b'
    });

    if (result.isConfirmed) {
        await eliminarProveedor(id);
    }
}

async function eliminarProveedor(id) {
    try {
        const res = await fetch(`/proveedores?id=${id}`, { method: "DELETE" });

        if (!res.ok) {
            const errorBody = await res.text();
            throw new Error(`Error al eliminar en el servidor (${res.status}): ${errorBody.substring(0, 100)}...`);
        }

        Swal.fire({
            title: 'Eliminado!',
            text: 'El proveedor ha sido eliminado con éxito.',
            icon: 'success',
            confirmButtonColor: '#3b82f6',
            background: '#ffffff',
            color: '#1e293b'
        });

        await cargarProveedores();
    } catch (error) {
        console.error("Error al eliminar proveedor:", error);
         Swal.fire({
            icon: 'error',
            title: 'Error de Eliminación',
            html: `No se pudo eliminar el proveedor. Mensaje: <strong>${error.message}</strong>`,
            background: '#ffffff',
            color: '#1e293b',
            confirmButtonColor: '#3b82f6',
        });
    }
}

document.getElementById("proveedorForm").addEventListener("submit", async function (e) {
    debugger;
    e.preventDefault();

    if (!this.checkValidity()) {
        this.classList.add('was-validated');
        return;
    }

    this.classList.remove('was-validated');

    const isNew = document.getElementById("id").value === "";
    const id = isNew ? "temp-id-" + Date.now() : document.getElementById("id").value;

    const proveedor = {
       // id: id,
        ruc: document.getElementById("ruc").value,
        razonSocial: document.getElementById("razonSocial").value,
        correo: document.getElementById("correo").value,
        telefono: document.getElementById("telefono").value,
        ciudad: document.getElementById("ciudad").value,
        direccion: document.getElementById("direccion").value
    };
    if (!isNew) {
        proveedor.id = parseInt(document.getElementById("id").value);
    }
    const method = isNew ? "POST" : "PUT";
    const actionText = isNew ? "creado" : "actualizado";

    try {
        const res = await fetch("/proveedores", {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(proveedor)
        });

        if (!res.ok) {
            const errorBody = await res.text();
            throw new Error(`Error en el servidor (${res.status}): ${errorBody.substring(0, 100)}...`);
        }


        ocultarModal();

        Swal.fire({
            title: 'Éxito!',
            text: `El proveedor ha sido ${actionText} con éxito.`,
            icon: 'success',
            confirmButtonColor: '#3b82f6',
            background: '#ffffff',
            color: '#1e293b'
        });

        cargarProveedores();
    } catch (error) {
        console.error("Error al guardar proveedor:", error);
         Swal.fire({
            icon: 'error',
            title: `Error al ${isNew ? 'crear' : 'actualizar'}`,
            html: `No se pudo guardar el proveedor. Mensaje: <strong>${error.message}</strong>`,
            background: '#ffffff',
            color: '#1e293b',
            confirmButtonColor: '#3b82f6',
        });
    }
});

async function obtenerSugerencias(filtro) {
    const busqueda = filtro.trim();
    const minLength = 1;

    if (busqueda.length < minLength) {
        ocultarSugerencias();
        return;
    }

    sugerenciasDropdown.classList.remove("hidden");
    sugerenciasDropdown.innerHTML = `
        <div class="sugerencia-item text-gray-500 italic flex items-center justify-center" style="cursor: default; background-color: #f8fafc;">
            <i class="bi bi-arrow-clockwise animate-spin mr-2"></i> Cargando sugerencias...
        </div>
    `;

    const url = `/buscarProveedor?busqueda=${encodeURIComponent(busqueda)}`;

    try {
        const res = await fetch(url);

        if (!res.ok) {
            sugerenciasDropdown.innerHTML = `
                <div class="sugerencia-item text-red-500 italic flex items-center justify-center" style="cursor: default;">
                    Error de conexión.
                </div>
            `;
            console.error("Error al obtener sugerencias del servidor.", res.status);
            return;
        }

        const data = await res.json();
        const topSugerencias = Array.isArray(data) ? data.slice(0, 10) : [];

        mostrarSugerencias(topSugerencias);

    } catch (error) {
        console.error("Error de conexión al obtener sugerencias:", error);
        ocultarSugerencias();
    }
}

function mostrarSugerencias(sugerencias) {
    sugerenciasDropdown.innerHTML = "";

    if (sugerencias.length === 0) {
        sugerenciasDropdown.innerHTML = `
            <div class="sugerencia-item text-gray-500 italic flex items-center justify-center" style="cursor: default;">
                No hay coincidencias.
            </div>
        `;
        sugerenciasDropdown.classList.remove("hidden");
        return;
    }

    sugerenciasDropdown.classList.remove("hidden");

    sugerencias.forEach(p => {
        const item = document.createElement("div");
        item.className = "sugerencia-item text-sm";

        item.innerHTML = `<span class="font-bold text-blue-800">${p.ruc || NOT_AVAILABLE}</span> - <span>${p.razonSocial}</span>`;

        item.onclick = () => {
            buscarInput.value = p.razonSocial;
            buscarProveedores();
        };

        item.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });

        sugerenciasDropdown.appendChild(item);
    });
}

function buscarProveedores() {
    const filtro = buscarInput.value;
    cargarProveedores(filtro.trim());
    ocultarSugerencias();
}

const manejarEntradaBusqueda = debounce((e) => {
    obtenerSugerencias(e.target.value);
}, 300);

document.getElementById("buscarInput").addEventListener("input", manejarEntradaBusqueda);

document.getElementById("buscarInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        buscarProveedores();
    }
});

document.addEventListener("click", (e) => {
    const searchContainer = document.getElementById("searchContainer");
    if (!searchContainer.contains(e.target)) {
        ocultarSugerencias();
    }
});

document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("proveedorTableBody")) {
        cargarProveedores();
    }
});