document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', () => {
        const input = icon.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (error) {
        const modal = document.getElementById("errorModal");
        const modalText = document.getElementById("modalMessage");
        const closeBtn = document.querySelector(".close-button");
        const okBtn = document.getElementById("modalOkButton");

        switch (error) {
            case "credenciales":
                modalText.textContent = "Usuario o contraseña incorrectos.";
                break;
            case "deshabilitado":
                modalText.textContent = "Tu cuenta está deshabilitada. Contacta al administrador.";
                break;
            default:
                return;
        }

        modal.style.display = "flex";

        const cerrarModal = () => {
            modal.style.display = "none";
            history.replaceState(null, "", window.location.pathname);
        };

        closeBtn.addEventListener("click", cerrarModal);
        okBtn.addEventListener("click", cerrarModal);
        window.addEventListener("click", e => {
            if (e.target === modal) cerrarModal();
        });
    }
});
