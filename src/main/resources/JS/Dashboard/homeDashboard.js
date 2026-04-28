(function () {
    function fmtNum(n) {
        if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
        return Number(n).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 4 });
    }

    function badgeClass(estado) {
        if (estado === 'Crítico') return 'badge-estado badge-critico';
        if (estado === 'Bajo') return 'badge-estado badge-bajo';
        if (estado === 'OK') return 'badge-estado badge-ok';
        return 'badge-estado badge-sin';
    }

    function render(data) {
        const err = document.getElementById('home-error');
        const warn = document.getElementById('home-aviso');
        const main = document.getElementById('home-main');
        if (data.error) {
            err.textContent = data.error;
            err.style.display = 'block';
            if (warn) warn.style.display = 'none';
            main.style.display = 'none';
            return;
        }
        err.style.display = 'none';
        main.style.display = 'block';
        if (warn) {
            if (data.aviso) {
                warn.textContent = data.aviso;
                warn.style.display = 'block';
            } else {
                warn.style.display = 'none';
            }
        }

        const k = data.kpis || {};
        document.getElementById('kpi-critico').textContent = k.stockCritico ?? '0';
        document.getElementById('kpi-critico-sub').textContent = k.stockCriticoSub || '';
        document.getElementById('kpi-bajo').textContent = k.stockBajo ?? '0';
        document.getElementById('kpi-bajo-sub').textContent = k.stockBajoSub || '';
        document.getElementById('kpi-lotes').textContent = k.lotesVencer ?? '0';
        document.getElementById('kpi-lotes-sub').textContent = k.lotesVencerSub || '';
        document.getElementById('kpi-ventas').textContent = k.ventasMesFormatted || 'S/ 0';
        document.getElementById('kpi-ventas-sub').textContent = k.ventasMesSub || '';

        const tb = document.getElementById('tabla-stock');
        if (!tb) {
            return;
        }
        tb.innerHTML = '';
        const stockRows = data.stockMinimo || [];
        if (stockRows.length === 0) {
            var msgSinMin = data.aviso
                ? 'Cuando agregue la columna <strong>stock_minimo</strong> y valores en productos, verá aquí el detalle.'
                : 'No hay artículos con stock mínimo configurado. Asigne <strong>stock mínimo</strong> en productos para ver alertas.';
            tb.innerHTML = '<tr><td colspan="4" class="muted">' + msgSinMin + '</td></tr>';
        } else {
            stockRows.forEach(function (r) {
                const tr = document.createElement('tr');
                const sub = (r.categoria || '—') + ' · ' + (r.unidad || '—');
                tr.innerHTML =
                    '<td><div class="art-desc">' + escapeHtml(r.descripcion || '') + '</div>' +
                    '<div class="art-sub">' + escapeHtml(sub) + '</div></td>' +
                    '<td>' + fmtNum(r.actual) + '</td>' +
                    '<td>' + fmtNum(r.minimo) + '</td>' +
                    '<td><span class="' + badgeClass(r.estado) + '">' + escapeHtml(r.estado || '') + '</span></td>';
                tb.appendChild(tr);
            });
        }

        const lotesEl = document.getElementById('lista-lotes');
        lotesEl.innerHTML = '';
        const lotes = data.lotesPorVencer || [];
        if (lotes.length === 0) {
            lotesEl.innerHTML = '<div class="muted">No hay lotes con vencimiento en los próximos 30 días.</div>';
        } else {
            lotes.forEach(function (l) {
                const div = document.createElement('div');
                div.className = 'lote-item';
                const dias = typeof l.dias === 'number' ? l.dias : parseInt(l.dias, 10);
                const diasTxt = !Number.isNaN(dias) ? dias + ' día' + (dias === 1 ? '' : 's') : '—';
                const meta = (l.codigoLote || '—') + ' · ' + fmtNum(l.cantidad) + ' ' + (l.unidad || '').trim();
                div.innerHTML =
                    '<div class="lote-body">' +
                    '<div class="lote-nombre">' + escapeHtml(l.descripcion || '') + '</div>' +
                    '<div class="lote-meta">' + escapeHtml(meta) + '</div></div>' +
                    '<span class="lote-dias">' + escapeHtml(diasTxt) + '</span>';
                lotesEl.appendChild(div);
            });
        }
    }

    function escapeHtml(s) {
        if (!s) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function cargar() {
        fetch('/dashboardResumen', { credentials: 'same-origin' })
            .then(function (r) {
                if (r.status === 401) {
                    return { error: 'Sesión expirada. Vuelva a iniciar sesión.' };
                }
                return r.text().then(function (text) {
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        return { error: 'Respuesta no válida del servidor.' };
                    }
                });
            })
            .then(function (data) {
                try {
                    render(data);
                } catch (e) {
                    render({ error: 'Error al mostrar el panel: ' + (e && e.message ? e.message : String(e)) });
                }
            })
            .catch(function (e) {
                render({
                    error: 'No se pudo contactar al servidor (/dashboardResumen). '
                        + (e && e.message ? e.message : 'Revise que la aplicación esté en ejecución.')
                });
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cargar);
    } else {
        cargar();
    }
})();
