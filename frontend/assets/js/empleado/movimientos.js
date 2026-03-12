// ── BÚSQUEDA MOVIMIENTOS ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const inputBusqueda = document.getElementById('inputBusquedaMovimiento')
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', (e) => {
            const t = e.target.value.toLowerCase().trim()
            const filtrados = listaMovimientos.filter(m =>
                m.nombreinsumo.toLowerCase().includes(t) ||
                m.motivomovimiento.toLowerCase().includes(t) ||
                m.nombreusuario.toLowerCase().includes(t)
            )
            renderTablaMovimientos(filtrados)
        })
    }
})

// ── PESTAÑAS INVENTARIO ────────────────────────────────────────
/** Alterna entre las pestañas de insumos y movimientos en la sección de inventario */
function cambiarPestanaInventario(pestana) {
    document.getElementById('pestanaInsumos').classList.toggle('activa', pestana === 'insumos')
    document.getElementById('pestanaMovimientos').classList.toggle('activa', pestana === 'movimientos')
    document.getElementById('panelInsumos').style.display = pestana === 'insumos' ? 'block' : 'none'
    document.getElementById('panelMovimientos').style.display = pestana === 'movimientos' ? 'block' : 'none'
    document.getElementById('btnAbrirModalInsumo').style.display = pestana === 'insumos' ? '' : 'none'
    document.getElementById('btnAbrirModalMovimiento').style.display = pestana === 'movimientos' ? '' : 'none'
    if (pestana === 'movimientos') cargarMovimientos()
}

// ── LISTA EN MEMORIA ───────────────────────────────────────────
let listaMovimientos = []

// ── CARGAR MOVIMIENTOS ─────────────────────────────────────────
async function cargarMovimientos() {
    const tbody = document.getElementById('cuerpoTablaMovimientos')
    try {
        const data = await apiFetch('/movimientos')
        if (data.success) {
            listaMovimientos = data.movimientos
            renderTablaMovimientos(listaMovimientos)
        } else {
            tbody.innerHTML = mensajeFilaTabla('Error al cargar movimientos', 7)
        }
    } catch {
        tbody.innerHTML = mensajeFilaTabla('No se pudo conectar con el servidor', 7)
    }
}

// ── RENDER TABLA ───────────────────────────────────────────────
function renderTablaMovimientos(movimientos) {
    const tbody = document.getElementById('cuerpoTablaMovimientos')

    if (movimientos.length === 0) {
        tbody.innerHTML = mensajeFilaTabla('No hay movimientos registrados', 7)
        return
    }

    tbody.innerHTML = movimientos.map(m => `
        <tr>
            <td>#${m.idmovimiento}</td>
            <td>${m.nombreinsumo}</td>
            <td style="color:#ef4444; font-weight:600;">-${m.cantidadmovimiento} ${m.unidadmedida}</td>
            <td>${new Date(m.fechamovimiento).toLocaleDateString('es-CO')}</td>
            <td>${m.motivomovimiento}</td>
            <td>${m.nombreusuario}</td>
        </tr>
    `).join('')
}

// ── MODAL ──────────────────────────────────────────────────────
const modalMovimiento = document.getElementById('modalMovimiento')

document.getElementById('btnAbrirModalMovimiento').addEventListener('click', async () => {
    document.getElementById('formMovimiento').reset()
    ocultarMensaje('mensajeMovimiento')
    document.getElementById('stockActualMovimiento').style.display = 'none'

    // Cargar insumos activos
    try {
        const data = await apiFetch('/insumos')
        const select = document.getElementById('selectInsumoMovimiento')
        select.innerHTML = '<option value="" disabled selected>Selecciona un insumo</option>'
        data.insumos
            .filter(i => i.estado === 'activo')
            .forEach(i => {
                const opt = document.createElement('option')
                opt.value = i.idinsumo
                opt.textContent = `${i.nombreinsumo} (Stock: ${i.stock} ${i.unidadmedida})`
                opt.dataset.stock = i.stock
                select.appendChild(opt)
            })
    } catch {
        mostrarMensaje('mensajeMovimiento', 'Error al cargar insumos', 'error')
    }

    modalMovimiento.style.display = 'flex'
})

// Mostrar stock al seleccionar insumo
document.getElementById('selectInsumoMovimiento').addEventListener('change', (e) => {
    const opt = e.target.selectedOptions[0]
    const stock = opt?.dataset?.stock
    if (stock !== undefined) {
        document.getElementById('valorStockActual').textContent = stock
        document.getElementById('stockActualMovimiento').style.display = 'block'
    }
})

function cerrarModalMovimiento() {
    modalMovimiento.style.display = 'none'
    document.getElementById('formMovimiento').reset()
    ocultarMensaje('mensajeMovimiento')
    document.getElementById('stockActualMovimiento').style.display = 'none'
}

document.getElementById('btnCerrarModalMovimiento').addEventListener('click', cerrarModalMovimiento)
document.getElementById('btnCancelarModalMovimiento').addEventListener('click', cerrarModalMovimiento)
modalMovimiento.addEventListener('click', (e) => { if (e.target === modalMovimiento) cerrarModalMovimiento() })

// ── REGISTRAR MOVIMIENTO ───────────────────────────────────────
document.getElementById('formMovimiento').addEventListener('submit', async (e) => {
    e.preventDefault()

    const idInsumo = parseInt(document.getElementById('selectInsumoMovimiento').value)
    const cantidad = parseInt(document.getElementById('cantidadMovimiento').value)
    const motivo   = document.getElementById('motivoMovimiento').value.trim()

    const btn = document.getElementById('btnSubmitMovimiento')
    btn.disabled = true
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...'

    try {
        const data = await apiFetch('/movimientos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idInsumo, cantidad, motivo })
        })

        if (data.success) {
            let mensaje = `Salida registrada. Stock restante: ${data.stockRestante}`
            if (data.alertaStock) mensaje += ' — Stock bajo mínimo'
            mostrarMensaje('mensajeMovimiento', mensaje, data.alertaStock ? 'error' : 'success')
            await cargarMovimientos()
            await cargarInsumos()
            setTimeout(() => cerrarModalMovimiento(), 2000)
        } else {
            mostrarMensaje('mensajeMovimiento', data.message || 'Error al registrar', 'error')
        }
    } catch {
        mostrarMensaje('mensajeMovimiento', 'No se pudo conectar con el servidor', 'error')
    } finally {
        btn.disabled = false
        btn.innerHTML = '<i class="fas fa-minus-circle"></i> Registrar salida'
    }
})
