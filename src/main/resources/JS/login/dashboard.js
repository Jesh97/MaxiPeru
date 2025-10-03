    document.addEventListener("DOMContentLoaded", () => {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const navLinks = document.getElementById('nav-links');
        const contentFrame = document.getElementById('contentFrame');
        const tituloPagina = document.getElementById("titulo-pagina");
        const appWrapper = document.getElementById('app-wrapper');
        const mainArea = document.getElementById('main-area');
        const toggleIcon = sidebarToggle.querySelector('i');

        const updateTitle = (url) => {
            const link = document.querySelector(`#nav-links a[href="${url}"]`);
            if (link) {
                const title = link.textContent.trim();
                tituloPagina.textContent = title;
            } else {
                tituloPagina.textContent = 'Panel de Control';
            }
        };

        const updateActiveLink = (url) => {
            const links = document.querySelectorAll('#nav-links a');
            links.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === url) {
                    link.classList.add('active');
                }
            });
        };

        // Función para actualizar el ícono del botón de alternancia (toggle)
        const updateToggleIcon = () => {
            const isCollapsed = appWrapper.classList.contains('is-collapsed');
            if (window.innerWidth >= 769) {
                // Desktop: Flecha izquierda (Expandido) o Barras (Colapsado)
                if (isCollapsed) {
                    toggleIcon.classList.replace('fa-arrow-left', 'fa-bars');
                } else {
                    toggleIcon.classList.replace('fa-bars', 'fa-arrow-left');
                }
            } else {
                // Mobile: Barras (Oculto/Colapsado) o X (Visible/Expandido)
                if (isCollapsed) {
                    toggleIcon.classList.replace('fa-times', 'fa-bars');
                } else {
                    toggleIcon.classList.replace('fa-bars', 'fa-times');
                }
            }
        };

        // Lógica de alternancia del menú
        sidebarToggle.addEventListener('click', () => {
            appWrapper.classList.toggle('is-collapsed');
            updateToggleIcon();
        });

        // Cierre automático del menú en móvil al hacer clic en un enlace
        navLinks.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                const link = e.target.closest('a');
                const url = link.getAttribute('href');
                updateActiveLink(url);
                updateTitle(url);

                if (window.innerWidth < 769) {
                    // Cierra el menú en móvil después de hacer clic
                    appWrapper.classList.add('is-collapsed');
                    updateToggleIcon();
                }
            }
        });

        // Cierre del menú en móvil al hacer clic fuera (en el overlay)
        mainArea.addEventListener('click', (e) => {
            // Verifica que estemos en móvil y el menú esté abierto (sin 'is-collapsed')
            if (window.innerWidth < 769 && !appWrapper.classList.contains('is-collapsed')) {
                // Asumimos que si se hace clic en 'main-area', es fuera del sidebar
                // Nota: Usamos e.target para asegurarnos de que el clic no fue dentro de un elemento interactivo
                appWrapper.classList.add('is-collapsed');
                updateToggleIcon();
            }
        });

        contentFrame.onload = () => {
            try {
                const currentUrl = contentFrame.contentWindow.location.pathname.split('/').pop();
                const currentLink = document.querySelector(`#nav-links a[href*="${currentUrl}"]`);
                if (currentLink) {
                    updateActiveLink(currentLink.getAttribute('href'));
                    updateTitle(currentLink.getAttribute('href'));
                }
            } catch (e) {
                console.warn('No se pudo acceder a la URL del iframe (posiblemente debido a restricciones de seguridad de origen cruzado).');
            }
        };

        const initialLink = document.querySelector('#nav-links a.active');
        if (initialLink) {
             updateTitle(initialLink.getAttribute('href'));
        }

        // Inicializa el estado del menú basado en el tamaño de la pantalla
        const initialCollapseState = () => {
             if (window.innerWidth >= 769) {
                 // Desktop: Default expandido
                 appWrapper.classList.remove('is-collapsed');
             } else {
                 // Mobile: Default oculto
                 appWrapper.classList.add('is-collapsed');
             }
             updateToggleIcon();
        };

        initialCollapseState();
        window.addEventListener('resize', initialCollapseState);
    });