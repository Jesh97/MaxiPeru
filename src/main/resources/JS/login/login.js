document.addEventListener('DOMContentLoaded', function() {

    const errorModal = document.getElementById('errorModal');
    const modalMessage = document.getElementById('modalMessage');
    const modalOkButton = document.getElementById('modalOkButton');
    const closeButton = errorModal ? errorModal.querySelector('.close-button') : null;

    function obtenerParametroURL(nombre) {
        nombre = nombre.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + nombre + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(window.location.href);
        if (!results || !results[2]) return null;
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    function mostrarErrorModal(mensaje) {
        if (errorModal && modalMessage) {
            modalMessage.textContent = mensaje;
            errorModal.style.display = 'block';
        }
    }

    function ocultarErrorModal() {
        if (errorModal) {
            errorModal.style.display = 'none';
        }
    }

    if (closeButton) {
        closeButton.onclick = ocultarErrorModal;
    }
    if (modalOkButton) {
        modalOkButton.onclick = ocultarErrorModal;
    }
    window.onclick = function(event) {
        if (event.target === errorModal) {
            ocultarErrorModal();
        }
    };

    const error = obtenerParametroURL('error');
    let mensaje = '';

    if (error) {
        switch (error) {
            case 'horario':
                mensaje = 'No se puede iniciar sesión en esta hora. El acceso está restringido por horario (08:00 a 17:00).';
                break;
            case 'deshabilitado':
                mensaje = 'Su cuenta está inactiva, deshabilitada o pendiente de aprobación. Contacte al administrador.';
                break;
            case 'rechazado':
                mensaje = 'Su solicitud de registro fue rechazada. No puede acceder a la plataforma con esta cuenta. Contacte al administrador si cree que es un error.';
                break;
            case 'credenciales':
                mensaje = 'Credenciales inválidas. Verifique su usuario y contraseña e intente nuevamente.';
                break;
            default:
                mensaje = 'Ha ocurrido un error inesperado durante el inicio de sesión.';
                break;
        }

        mostrarErrorModal(mensaje);
    }

    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('.password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    }
});