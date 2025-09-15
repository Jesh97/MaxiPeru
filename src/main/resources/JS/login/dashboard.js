document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".nav-link[data-url]");
    const contenedor = document.getElementById("contenido-dinamico");
    const tituloPagina = document.getElementById("titulo-pagina");

    // Establecer el título siempre en "Bienvenidos"
    tituloPagina.textContent = "Bienvenidos";

    links.forEach(link => {
        link.addEventListener("click", async (e) => {
            e.preventDefault();

            // Marcar como activo el link clickeado
            links.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            const url = link.getAttribute("data-url");

            try {
                const respuesta = await fetch(url);
                if (!respuesta.ok) throw new Error("No se pudo cargar el contenido");

                const html = await respuesta.text();
                contenedor.innerHTML = html;

                // Ejecutar scripts dentro del HTML cargado dinámicamente
                const scripts = contenedor.querySelectorAll("script");
                scripts.forEach(oldScript => {
                    const newScript = document.createElement("script");
                    if (oldScript.src) {
                        newScript.src = oldScript.src;
                        newScript.async = false;
                    } else {
                        newScript.textContent = oldScript.textContent;
                    }
                    document.body.appendChild(newScript);
                });

                // Re-iniciar eventos para los botones de la tabla
                initEventosProveedor();
                initEventosCliente();
            } catch (error) {
                contenedor.innerHTML = `<div class="alert alert-danger">Error al cargar el contenido: ${error.message}</div>`;
            }
        });
    });

    // Cargar por defecto
    document.querySelector('.nav-link.active')?.click();
});

// Cargar dinámicamente el contenido de los clientes
function initEventosCliente() {
    const botonesEditar = document.querySelectorAll(".btn-warning");
    const botonesEliminar = document.querySelectorAll(".btn-danger");

    botonesEditar.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const idCliente = e.target.closest("button").getAttribute("onclick").match(/\d+/)[0];
            editarCliente(idCliente);
        });
    });

    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const idCliente = e.target.closest("button").getAttribute("onclick").match(/\d+/)[0];
            eliminarCliente(idCliente);
        });
    });
}

function initEventosProveedor() {
    // Buscar todos los botones de editar y eliminar
    const botonesEditar = document.querySelectorAll(".btn-warning");
    const botonesEliminar = document.querySelectorAll(".btn-danger");

    botonesEditar.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const idProveedor = e.target.closest("button").getAttribute("onclick").match(/\d+/)[0];
            editarProveedor(idProveedor);
        });
    });

    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const idProveedor = e.target.closest("button").getAttribute("onclick").match(/\d+/)[0];
            eliminarProveedor(idProveedor);
        });
    });
}
