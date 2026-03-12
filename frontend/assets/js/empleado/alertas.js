// ── ALERTAS DE VENCIMIENTO ──────────────────────────────────────
// Revisa cada 6 horas si hay insumos próximos a vencer (3 días)
// Guarda las alertas en localStorage para persistencia entre recargas

const ALERTAS_KEY = 'helar_alertas_vencimiento'
const ALERTAS_ULTIMA_REVISION = 'helar_alertas_ultima_revision'
const INTERVALO_REVISION = 6 * 60 * 60 * 1000 // 6 horas

function obtenerAlertas() {
    try {
        return JSON.parse(localStorage.getItem(ALERTAS_KEY) || '[]')
    } catch {
        return []
    }
}

function guardarAlertas(alertas) {
    localStorage.setItem(ALERTAS_KEY, JSON.stringify(alertas))
}

/** Consulta insumos próximos a vencer, agrega los nuevos a localStorage y actualiza el badge */
async function verificarAlertasVencimiento() {
    try {
        const data = await apiFetch('/insumos/proximos-vencer')
        if (!data.success) return

        const alertasExistentes = obtenerAlertas()
        const idsExistentes = new Set(alertasExistentes.map(a => a.idinsumo))

        const nuevasAlertas = data.insumos
            .filter(i => !idsExistentes.has(i.idinsumo))
            .map(i => ({
                idinsumo: i.idinsumo,
                nombre: i.nombreinsumo,
                fechacaducidad: i.fechacaducidad,
                leida: false,
                timestamp: Date.now()
            }))

        if (nuevasAlertas.length > 0) {
            guardarAlertas([...alertasExistentes, ...nuevasAlertas])
        }

        // Actualizar insumos ya existentes en alerta (por si cambió fecha)
        localStorage.setItem(ALERTAS_ULTIMA_REVISION, Date.now().toString())

        actualizarBadgeAlertas()
    } catch (err) {
        console.error('Error al verificar alertas de vencimiento:', err)
    }
}

/** Actualiza el contador del badge de alertas según las no leídas en localStorage */
function actualizarBadgeAlertas() {
    const alertas = obtenerAlertas()
    const noLeidas = alertas.filter(a => !a.leida).length
    const badge = document.getElementById('badge-alertas')
    if (badge) {
        badge.textContent = noLeidas
        badge.style.display = noLeidas > 0 ? 'inline-flex' : 'none'
    }
}

function marcarAlertaLeida(idinsumo) {
    const alertas = obtenerAlertas()
    const alerta = alertas.find(a => a.idinsumo === idinsumo)
    if (alerta) {
        alerta.leida = true
        guardarAlertas(alertas)
    }
    renderAlertas()
    actualizarBadgeAlertas()
}

function marcarTodasLeidas() {
    const alertas = obtenerAlertas().map(a => ({ ...a, leida: true }))
    guardarAlertas(alertas)
    renderAlertas()
    actualizarBadgeAlertas()
}

function renderAlertas() {
    const lista = document.getElementById('lista-alertas')
    if (!lista) return

    const alertas = obtenerAlertas()

    if (alertas.length === 0) {
        lista.innerHTML = `
            <div class="alerta-vacia">
                <i class="fas fa-bell-slash" style="font-size:40px; color:#d4b5a8; margin-bottom:12px;"></i>
                <p>No hay alertas de vencimiento</p>
                <span>Los insumos próximos a vencer aparecerán aquí</span>
            </div>
        `
        return
    }

    lista.innerHTML = alertas.map(a => {
        const fecha = new Date(a.fechacaducidad)
        const hoy = new Date()
        const diffDias = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24))
        const urgente = diffDias <= 1

        return `
            <div class="alerta-card ${a.leida ? 'leida' : 'no-leida'} ${urgente ? 'urgente' : ''}">
                <div class="alerta-icono">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="alerta-info">
                    <div class="alerta-titulo">${a.nombre}</div>
                    <div class="alerta-detalle">
                        Vence el <strong>${fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
                        &mdash; <span class="${urgente ? 'texto-urgente' : 'texto-proximo'}">${diffDias === 0 ? 'hoy' : diffDias === 1 ? 'mañana' : `en ${diffDias} días`}</span>
                    </div>
                </div>
                ${!a.leida ? `
                <button class="alerta-btn-leida" onclick="marcarAlertaLeida(${a.idinsumo})" title="Marcar como leída">
                    <i class="fas fa-check"></i>
                </button>` : ''}
            </div>
        `
    }).join('')
}

/** Revisa el servidor si pasaron 6 h desde la última consulta, luego renderiza las alertas */
async function cargarAlertas() {
    const ultimaRevision = parseInt(localStorage.getItem(ALERTAS_ULTIMA_REVISION) || '0')
    const ahora = Date.now()

    // Revisar si pasaron 6 horas desde la última consulta al servidor
    if (ahora - ultimaRevision >= INTERVALO_REVISION) {
        await verificarAlertasVencimiento()
    } else {
        actualizarBadgeAlertas()
    }

    renderAlertas()
}

// Revisión periódica cada 6 horas mientras la página esté abierta
setInterval(verificarAlertasVencimiento, INTERVALO_REVISION)
