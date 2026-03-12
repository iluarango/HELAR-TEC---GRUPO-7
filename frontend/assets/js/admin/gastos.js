const API_GASTOS = 'https://helar-tec-grupo-7.onrender.com/api/gastos'

// ── CAMBIAR SECCIÓN ────────────────────────────────────────────

/** Muestra la sección del panel admin seleccionada y dispara su función de carga (solo una vez por sección) */
function cambiarSeccionAdmin(seccion, elemento) {
    document.getElementById('seccion-empleados').style.display      = seccion === 'empleados' ? 'block' : 'none'
    document.getElementById('seccion-gastos').style.display         = seccion === 'gastos'    ? 'block' : 'none'
    document.getElementById('seccion-reportes').style.display       = seccion === 'reportes'  ? 'block' : 'none'
    document.getElementById('seccion-alertas-admin').style.display  = seccion === 'alertas'   ? 'block' : 'none'
    document.getElementById('seccion-manual-admin').style.display   = seccion === 'manual'    ? 'block' : 'none'

    document.querySelectorAll('.item-menu').forEach(i => i.classList.remove('activo'))
    if (elemento) elemento.classList.add('activo')

    if (!_adminSeccionesYaCargadas.has(seccion)) {
        _adminSeccionesYaCargadas.add(seccion)
        if (seccion === 'gastos')     cargarGastos()
        if (seccion === 'empleados')  cargarUsuarios()
        if (seccion === 'reportes')   cargarReportes()
        if (seccion === 'alertas')    cargarAlertasAdmin()
    }
}

// ── CARGAR GASTOS ──────────────────────────────────────────────
async function cargarGastos() {
    const tbody = document.getElementById('tablaGastosBody')
    try {
        const response = await fetch(API_GASTOS, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) renderTablaGastos(data.gastos)
        else tbody.innerHTML = mensajeFila('Error al cargar gastos', 8)
    } catch {
        tbody.innerHTML = mensajeFila('No se pudo conectar con el servidor', 8)
    }
}

// ── RENDER TABLA ───────────────────────────────────────────────
function renderTablaGastos(gastos) {
    const tbody = document.getElementById('tablaGastosBody')

    if (gastos.length === 0) {
        tbody.innerHTML = mensajeFila('No hay gastos registrados', 8)
        return
    }

    tbody.innerHTML = gastos.map(g => {
        const esPagado = g.estadogasto === 'pagado'
        return `
        <tr>
            <td>#${g.idgastooperativo}</td>
            <td>${new Date(g.fechagasto).toLocaleDateString('es-CO')}</td>
            <td>${g.categoriagasto}</td>
            <td>$${parseFloat(g.montogasto).toLocaleString('es-CO')}</td>
            <td>${g.metodopago}</td>
            <td>${g.fechavencimiento ? new Date(g.fechavencimiento).toLocaleDateString('es-CO') : '-'}</td>
            <td>
                ${esPagado
                    ? `<span class="badge-rol badge-activo">${g.estadogasto}</span>`
                    : `<div class="estado-dropdown-wrapper">
                        <span
                            class="badge-rol badge-inactivo badge-clickeable"
                            onclick="toggleDropdownEstado(event, 'gasto-${g.idgastooperativo}')">
                            ${g.estadogasto}
                            <i class="fas fa-chevron-down" style="font-size:10px; margin-left:4px;"></i>
                        </span>
                        <div class="estado-dropdown" id="dropdown-gasto-${g.idgastooperativo}">
                            <div class="estado-opcion opcion-seleccionada">
                                <i class="fas fa-check" style="margin-right:6px;"></i>
                                Pendiente
                            </div>
                            <div class="estado-opcion"
                                onclick="cambiarEstadoGasto(${g.idgastooperativo}, 'pagado')">
                                <i class="fas fa-check" style="margin-right:6px; opacity:0;"></i>
                                Pagado
                            </div>
                        </div>
                    </div>`
                }
            </td>
            <td>${g.nombreusuario}</td>
        </tr>`
    }).join('')
}

/** Si el estado es 'pagado' abre el modal de método de pago; si no, actualiza directo */
function cambiarEstadoGasto(id, estado) {
    document.getElementById(`dropdown-gasto-${id}`).classList.remove('abierto')

    if (estado === 'pagado') {
        document.getElementById('formPagarGasto').reset()
        document.getElementById('idGastoPagar').value = id
        document.getElementById('mensajePago').textContent = ''
        document.getElementById('modalPagarGasto').style.display = 'flex'
        return
    }

    // Si es pendiente, cambia directo sin modal
    actualizarEstadoGasto(id, 'pendiente', null)
}

async function actualizarEstadoGasto(id, estado, metodoPago) {
    try {
        const response = await fetch(`${API_GASTOS}/${id}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado, metodoPago })
        })
        const data = await response.json()
        if (data.success) await cargarGastos()
    } catch (error) {
        console.error('Error al cambiar estado:', error)
    }
}

// ── MODAL PAGAR ────────────────────────────────────────────────
const modalPagarGasto = document.getElementById('modalPagarGasto')

function cerrarModalPago() {
    modalPagarGasto.style.display = 'none'
}

document.getElementById('btnCerrarModalPago').addEventListener('click', cerrarModalPago)
document.getElementById('btnCancelarModalPago').addEventListener('click', cerrarModalPago)
modalPagarGasto.addEventListener('click', (e) => { if (e.target === modalPagarGasto) cerrarModalPago() })

document.getElementById('formPagarGasto').addEventListener('submit', async (e) => {
    e.preventDefault()
    const id = document.getElementById('idGastoPagar').value
    const metodoPago = document.getElementById('metodoPagarGasto').value

    try {
        const response = await fetch(`${API_GASTOS}/${id}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: 'pagado', metodoPago })
        })
        const data = await response.json()
        if (data.success) {
            cerrarModalPago()
            await cargarGastos()
        } else {
            mostrarMensaje('mensajePago', data.message || 'Error al actualizar', 'error')
        }
    } catch {
        mostrarMensaje('mensajePago', 'No se pudo conectar con el servidor', 'error')
    }
})

// ── MODAL ──────────────────────────────────────────────────────
const modalGasto = document.getElementById('modalGasto')

document.getElementById('btnAbrirModalGasto').addEventListener('click', () => {
    document.getElementById('formGasto').reset()
    document.getElementById('mensajeGasto').textContent = ''
    // Poner fecha de hoy por defecto
    document.getElementById('fechaGasto').value = new Date().toISOString().split('T')[0]
    modalGasto.style.display = 'flex'
})

function cerrarModalGasto() {
    modalGasto.style.display = 'none'
    document.getElementById('formGasto').reset()
    document.getElementById('mensajeGasto').textContent = ''
}

document.getElementById('btnCerrarModalGasto').addEventListener('click', cerrarModalGasto)
document.getElementById('btnCancelarModalGasto').addEventListener('click', cerrarModalGasto)
modalGasto.addEventListener('click', (e) => { if (e.target === modalGasto) cerrarModalGasto() })

// ── REGISTRAR GASTO ────────────────────────────────────────────
document.getElementById('formGasto').addEventListener('submit', async (e) => {
    e.preventDefault()

    const body = {
        fechaGasto:       document.getElementById('fechaGasto').value,
        categoriaGasto:   document.getElementById('categoriaGasto').value,
        montoGasto:       parseFloat(document.getElementById('montoGasto').value),
        metodoPago:       document.getElementById('metodoPagoGasto').value,
        fechaVencimiento: document.getElementById('fechaVencimientoGasto').value || null
    }

    const btn = document.getElementById('btnRegistrarGasto')
    btn.disabled = true

    try {
        const response = await fetch(API_GASTOS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        })
        const data = await response.json()

        if (data.success) {
            mostrarMensaje('mensajeGasto', 'Gasto registrado exitosamente', 'success')
            await cargarGastos()
            if (typeof verificarAlertasAdmin === 'function') verificarAlertasAdmin()
            setTimeout(() => cerrarModalGasto(), 1500)
        } else {
            mostrarMensaje('mensajeGasto', data.message || 'Error al registrar', 'error')
        }
    } catch {
        mostrarMensaje('mensajeGasto', 'No se pudo conectar con el servidor', 'error')
    } finally {
        btn.disabled = false
    }
})
