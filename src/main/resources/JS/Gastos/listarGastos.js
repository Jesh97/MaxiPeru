document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/GastoServlet');
        const data = await res.json();

        const tabla = document.getElementById('tabla-gastos');
        tabla.innerHTML = '';

        data.forEach(g => {
            tabla.innerHTML += `
                <tr>
                    <td class="px-4 py-3 text-center">${g.fecha}</td>
                    <td class="px-4 py-3">${g.motivo}</td>
                    <td class="px-4 py-3 text-center">${g.idProveedor}</td>
                    <td class="px-4 py-3 text-center">${g.idMoneda}</td>
                    <td class="px-4 py-3 text-center">S/ ${g.subtotal}</td>
                    <td class="px-4 py-3 text-center">S/ ${g.igv}</td>
                    <td class="px-4 py-3 text-center font-bold text-indigo-700">S/ ${g.total}</td>
                    <td class="px-4 py-3 text-center">
                        <button class="text-indigo-600 hover:text-indigo-900">
                            <i class="bi bi-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error('Error cargando gastos:', error);
    }
});