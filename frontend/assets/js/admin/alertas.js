const ALERTAS_ADMIN_KEY = 'alertas_admin_leidas'

// ── PERSISTENCIA EN LOCALSTORAGE ────────────────────────────────
function obtenerLeidasAdmin() {
    try { return JSON.parse(localStorage.getItem(ALERTAS_ADMIN_KEY)) || [] }
    catch { return [] }
}

function guardarLeidasAdmin(ids) {
    localStorage.setItem(ALERTAS_ADMIN_KEY, JSON.stringify(ids))
}

// ── VERIFICAR Y ACTUALIZAR BADGE ────────────────────────────────
/** Obtiene gastos de la API, filtra los que vencen en 3 días y actualiza el badge del admin */
async function verificarAlertasAdmin() {
    try {
        const resp = await fetch(API_GASTOS, { headers: { 'Authorization': `Bearer ${token}` } })
        const data = await resp.json()
        if (!data.success) return { proximos: [], leidas: [] }

        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const en3Dias = new Date(hoy)
        en3Dias.setDate(en3Dias.getDate() + 3)

        const proximos = data.gastos.filter(g => {
            if (!g.fechavencimiento || g.estadogasto === 'pagado') return false
            const vence = new Date(g.fechavencimiento)
            vence.setHours(0, 0, 0, 0)
            return vence <= en3Dias && vence >= hoy
        })

        const leidas = obtenerLeidasAdmin()
        const noLeidas = proximos.filter(g => !leidas.includes(g.idgastooperativo))

        const badge = document.getElementById('badge-alertas-admin')
        if (badge) {
            badge.textContent = noLeidas.length
            badge.style.display = noLeidas.length > 0 ? 'inline-flex' : 'none'
        }

        return { proximos, leidas }
    } catch {
        return { proximos: [], leidas: [] }
    }
}

// ── CARGAR SECCIÓN ALERTAS ──────────────────────────────────────
/** Verifica y renderiza la sección completa de alertas del panel administrador */
async function cargarAlertasAdmin() {
    const lista = document.getElementById('lista-alertas-admin')
    if (!lista) return
    const { proximos, leidas } = await verificarAlertasAdmin()
    renderAlertasAdmin(proximos, leidas)
}

// ── RENDER ALERTAS ──────────────────────────────────────────────
function renderAlertasAdmin(proximos, leidas) {
    const lista = document.getElementById('lista-alertas-admin')
    if (!lista) return

    if (proximos.length === 0) {
        lista.innerHTML = `
        <div class="alerta-vacia">
            <i class="fas fa-check-circle"></i>
            <p>No hay gastos próximos a vencer</p>
        </div>`
        return
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    lista.innerHTML = proximos.map(g => {
        const leida = leidas.includes(g.idgastooperativo)
        const vence = new Date(g.fechavencimiento)
        vence.setHours(0, 0, 0, 0)
        const diasRestantes = Math.round((vence - hoy) / (1000 * 60 * 60 * 24))
        const urgente = diasRestantes <= 1

        const textoVence = diasRestantes === 0
            ? 'vence hoy'
            : diasRestantes === 1
                ? 'vence mañana'
                : `vence en ${diasRestantes} días`

        return `
        <div class="alerta-card${leida ? '' : ' no-leida'}${urgente ? ' urgente' : ''}">
            <div class="alerta-icono">
                <i class="fas fa-${urgente ? 'exclamation-triangle' : 'bell'}"></i>
            </div>
            <div class="alerta-info">
                <strong>${g.categoriagasto}</strong>
                <span>${textoVence} — $${parseFloat(g.montogasto).toLocaleString('es-CO')}</span>
                <small>${new Date(g.fechavencimiento).toLocaleDateString('es-CO')}</small>
            </div>
            ${!leida ? `
            <button class="alerta-btn-leida" title="Marcar como leída"
                onclick="marcarAlertaLeidaAdmin(${g.idgastooperativo})">
                <i class="fas fa-check"></i>
            </button>` : ''}
        </div>`
    }).join('')
}

// ── MARCAR UNA COMO LEÍDA ───────────────────────────────────────
function marcarAlertaLeidaAdmin(id) {
    const leidas = obtenerLeidasAdmin()
    if (!leidas.includes(id)) {
        leidas.push(id)
        guardarLeidasAdmin(leidas)
    }
    cargarAlertasAdmin()
}

// ── MARCAR TODAS COMO LEÍDAS ────────────────────────────────────
/** Marca todos los gastos próximos a vencer como leídos en localStorage */
async function marcarTodasLeidasAdmin() {
    try {
        const resp = await fetch(API_GASTOS, { headers: { 'Authorization': `Bearer ${token}` } })
        const data = await resp.json()
        if (!data.success) return

        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const en3Dias = new Date(hoy)
        en3Dias.setDate(en3Dias.getDate() + 3)

        const proximos = data.gastos.filter(g => {
            if (!g.fechavencimiento || g.estadogasto === 'pagado') return false
            const vence = new Date(g.fechavencimiento)
            vence.setHours(0, 0, 0, 0)
            return vence <= en3Dias && vence >= hoy
        })

        guardarLeidasAdmin(proximos.map(g => g.idgastooperativo))
        cargarAlertasAdmin()
    } catch {}
}

// ── INICIALIZACIÓN ──────────────────────────────────────────────
// Cargar badge al inicio sin mostrar la sección
;(async () => {
    await verificarAlertasAdmin()
})()

// Re-verificar cada 6 horas
setInterval(verificarAlertasAdmin, 6 * 60 * 60 * 1000)
