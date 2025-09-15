// Mostrar/ocultar contraseña
document.querySelector('.toggle-password').addEventListener('click', function () {
    const passwordInput = document.querySelector('.password');
    const icon = this;
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
});

// Validación en tiempo real
const passwordInput = document.querySelector('.password');
const lengthCheck = document.getElementById('lengthCheck');
const uppercaseCheck = document.getElementById('uppercaseCheck');
const numberCheck = document.getElementById('numberCheck');
const specialCheck = document.getElementById('specialCheck');

passwordInput.addEventListener('input', () => {
    const value = passwordInput.value;

    updateRule(lengthCheck, value.length >= 8);
    updateRule(uppercaseCheck, /[A-Z]/.test(value));
    updateRule(numberCheck, /\d/.test(value));
    updateRule(specialCheck, /[@$!%*?&]/.test(value));
});

function updateRule(element, isValid) {
    element.className = isValid ? 'valid' : 'invalid';
    element.innerHTML = isValid
        ? '<i class="fas fa-check-circle"></i>'
        : '<i class="fas fa-times-circle"></i>';
}

// Enviar formulario con fetch
document.getElementById('registroForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = new URLSearchParams(formData);

    try {
        const response = await fetch('/registrarUsuario', {
            method: 'POST',
            body: data
        });

        if (!response.ok) {
            const errores = await response.json();
            mostrarErrores(errores);
        } else {
            window.location.href = "index.html";
        }
    } catch (error) {
        mostrarErrores(["Error inesperado al registrar."]);
    }
});

// Mostrar errores en modal
function mostrarErrores(errores) {
    const modal = document.getElementById('errorModal');
    const listaErrores = document.getElementById('modalErrores');

    listaErrores.innerHTML = "";
    errores.forEach(err => {
        const li = document.createElement("li");
        li.textContent = err;
        listaErrores.appendChild(li);
    });

    modal.classList.remove('hidden');
}

// Cerrar modal
document.getElementById('cerrarModal').addEventListener('click', () => {
    document.getElementById('errorModal').classList.add('hidden');
});
document.querySelector('.close-button').addEventListener('click', () => {
    document.getElementById('errorModal').classList.add('hidden');
});
