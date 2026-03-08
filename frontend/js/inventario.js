const API_INSUMOS = 'http://localhost:3000/api/insumos'

// ── LISTA EN MEMORIA ───────────────────────────────────────
let listaInsumos = []

// ── CARGAR INSUMOS ─────────────────────────────────────────
async function cargarInsumos() {
    const tbody = document.getElementById('cuerpoTablaInsumos')

    try {
        const response = await fetch(API_INSUMOS, {
            headers: { 'Authorization': `Bearer ${token}` }
        })

        const data = await response.json()

        if (data.success) {
            listaInsumos = data.insumos
            renderTablaInsumos(listaInsumos)
        } else {
            tbody.innerHTML = mensajeFilaInsumo('Error al cargar insumos', 8)
        }
    } catch (error) {
        tbody.innerHTML = mensajeFilaInsumo('No se pudo conectar con el servidor', 8)
    }
}

// ── RENDER TABLA ───────────────────────────────────────────
function renderTablaInsumos(insumos) {
    const tbody = document.getElementById('cuerpoTablaInsumos')

    if (insumos.length === 0) {
        tbody.innerHTML = mensajeFilaInsumo('No hay insumos registrados', 8)
        return
    }

    tbody.innerHTML = insumos.map(i => {
        const esActivo = i.estado === 'activo'
        const stockBajo = i.stock <= i.stockminimo

        return `
            <tr>
                <td>${i.nombreinsumo}</td>
                <td>${i.tipoinsumo}</td>
                <td style="color: ${stockBajo ? '#d9534f' : '#333'}; font-weight: ${stockBajo ? '600' : '400'}">
                    ${i.stock}
                    ${stockBajo ? '<i class="fas fa-exclamation-triangle" title="Stock bajo" style="color:#d9534f; margin-left:5px;"></i>' : ''}
                </td>
                <td>${i.stockminimo}</td>
                <td>${i.unidadmedida}</td>
                <td>${i.fechacaducidad ? new Date(i.fechacaducidad).toLocaleDateString('es-CO') : '—'}</td>
                <td>
                    <div class="estado-dropdown-wrapper">
                        <span 
                            class="etiqueta-estado ${esActivo ? 'estado-disponible' : 'estado-bajo'} badge-clickeable"
                            onclick="toggleDropdownEstadoInsumo(event, ${i.idinsumo})"
                        >
                            ${esActivo ? 'Activo' : 'Inactivo'}
                            <i class="fas fa-chevron-down" style="font-size: 10px; margin-left: 4px;"></i>
                        </span>
                        <div class="estado-dropdown" id="dropdown-insumo-${i.idinsumo}">
                            <div class="estado-opcion ${esActivo ? 'opcion-seleccionada' : ''}" onclick="cambiarEstadoInsumo(${i.idinsumo}, 'activo')">
                                <i class="fas fa-check" style="margin-right: 6px; opacity: ${esActivo ? '1' : '0'};"></i>
                                Activo
                            </div>
                            <div class="estado-opcion ${!esActivo ? 'opcion-seleccionada' : ''}" onclick="cambiarEstadoInsumo(${i.idinsumo}, 'inactivo')">
                                <i class="fas fa-check" style="margin-right: 6px; opacity: ${!esActivo ? '1' : '0'};"></i>
                                Inactivo
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="botones-accion">
                        <button class="boton-accion" title="Editar" onclick="abrirModalEditarInsumo(${i.idinsumo})">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `
    }).join('')
}

function mensajeFilaInsumo(texto, colspan) {
    return `
        <tr>
            <td colspan="${colspan}" style="text-align: center; padding: 40px; color: #999;">
                ${texto}
            </td>
        </tr>
    `
}

cargarInsumos()

// ── BÚSQUEDA ───────────────────────────────────────────────
document.getElementById('inputBusquedaInsumo').addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase().trim()

    const filtrados = listaInsumos.filter(i =>
        i.nombreinsumo.toLowerCase().includes(termino) ||
        i.tipoinsumo.toLowerCase().includes(termino)
    )

    renderTablaInsumos(filtrados)
})

// ── DROPDOWN ESTADO ────────────────────────────────────────
function toggleDropdownEstadoInsumo(event, id) {
    event.stopPropagation()

    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => {
        if (d.id !== `dropdown-insumo-${id}`) d.classList.remove('abierto')
    })

    const dropdown = document.getElementById(`dropdown-insumo-${id}`)
    const badge = event.currentTarget
    const rect = badge.getBoundingClientRect()

    dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`
    dropdown.style.left = `${rect.left + window.scrollX}px`

    dropdown.classList.toggle('abierto')
}

document.addEventListener('click', () => {
    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => {
        d.classList.remove('abierto')
    })
})

async function cambiarEstadoInsumo(id, nuevoEstado) {
    document.getElementById(`dropdown-insumo-${id}`).classList.remove('abierto')

    try {
        const response = await fetch(`${API_INSUMOS}/${id}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: nuevoEstado })
        })

        const data = await response.json()
        if (data.success) await cargarInsumos()
    } catch (error) {
        console.error('Error al cambiar estado del insumo:', error)
    }
}

// ── MODAL REGISTRO ─────────────────────────────────────────
const modalInsumo = document.getElementById('modalInsumo')

document.getElementById('btnAbrirModalInsumo').addEventListener('click', () => {
    modalInsumo.style.display = 'flex'
})

document.getElementById('btnCerrarModalInsumo').addEventListener('click', cerrarModalInsumo)
document.getElementById('btnCancelarModalInsumo').addEventListener('click', cerrarModalInsumo)

modalInsumo.addEventListener('click', (e) => {
    if (e.target === modalInsumo) cerrarModalInsumo()
})

function cerrarModalInsumo() {
    modalInsumo.style.display = 'none'
    document.getElementById('formNuevoInsumo').reset()
    ocultarMensajeInsumo('mensajeInsumo')
}

document.getElementById('formNuevoInsumo').addEventListener('submit', async (e) => {
    e.preventDefault()

    const nombreInsumo   = document.getElementById('nombreInsumo').value.trim()
    const tipoInsumo     = document.getElementById('tipoInsumo').value
    const stock          = document.getElementById('stock').value
    const stockMinimo    = document.getElementById('stockMinimo').value
    const unidadMedida   = document.getElementById('unidadMedida').value
    const fechaCaducidad = document.getElementById('fechaCaducidad').value

    const btnRegistrar = e.target.querySelector('.btn-registrar')
    btnRegistrar.disabled = true
    btnRegistrar.textContent = 'Registrando...'

    try {
        const response = await fetch(API_INSUMOS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nombreInsumo, tipoInsumo, stock, stockMinimo, unidadMedida, fechaCaducidad })
        })

        const data = await response.json()

        if (data.success) {
            mostrarMensajeInsumo('mensajeInsumo', 'Insumo registrado exitosamente', 'success')
            await cargarInsumos()
            setTimeout(() => cerrarModalInsumo(), 1500)
        } else {
            mostrarMensajeInsumo('mensajeInsumo', data.message || 'Error al registrar', 'error')
        }
    } catch (error) {
        mostrarMensajeInsumo('mensajeInsumo', 'No se pudo conectar con el servidor', 'error')
    } finally {
        btnRegistrar.disabled = false
        btnRegistrar.textContent = 'Registrar'
    }
})

// ── MODAL EDITAR ───────────────────────────────────────────
const modalEditarInsumo = document.getElementById('modalEditarInsumo')

function abrirModalEditarInsumo(id) {
    const insumo = listaInsumos.find(i => i.idinsumo === id)
    if (!insumo) return

    document.getElementById('editIdInsumo').value        = insumo.idinsumo
    document.getElementById('editNombreInsumo').value    = insumo.nombreinsumo
    document.getElementById('editTipoInsumo').value      = insumo.tipoinsumo
    document.getElementById('editStock').value           = insumo.stock
    document.getElementById('editStockMinimo').value     = insumo.stockminimo
    document.getElementById('editUnidadMedida').value    = insumo.unidadmedida
    document.getElementById('editFechaCaducidad').value  = insumo.fechacaducidad
        ? insumo.fechacaducidad.split('T')[0]
        : ''

    modalEditarInsumo.style.display = 'flex'
}

document.getElementById('btnCerrarModalEditar').addEventListener('click', cerrarModalEditarInsumo)
document.getElementById('btnCancelarModalEditar').addEventListener('click', cerrarModalEditarInsumo)

modalEditarInsumo.addEventListener('click', (e) => {
    if (e.target === modalEditarInsumo) cerrarModalEditarInsumo()
})

function cerrarModalEditarInsumo() {
    modalEditarInsumo.style.display = 'none'
    ocultarMensajeInsumo('mensajeEditarInsumo')
}

document.getElementById('formEditarInsumo').addEventListener('submit', async (e) => {
    e.preventDefault()

    const id             = document.getElementById('editIdInsumo').value
    const nombreInsumo   = document.getElementById('editNombreInsumo').value.trim()
    const tipoInsumo     = document.getElementById('editTipoInsumo').value
    const stock          = document.getElementById('editStock').value
    const stockMinimo    = document.getElementById('editStockMinimo').value
    const unidadMedida   = document.getElementById('editUnidadMedida').value
    const fechaCaducidad = document.getElementById('editFechaCaducidad').value

    const btnGuardar = e.target.querySelector('.btn-registrar')
    btnGuardar.disabled = true
    btnGuardar.textContent = 'Guardando...'

    try {
        const response = await fetch(`${API_INSUMOS}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nombreInsumo, tipoInsumo, stock, stockMinimo, unidadMedida, fechaCaducidad })
        })

        const data = await response.json()

        if (data.success) {
            mostrarMensajeInsumo('mensajeEditarInsumo', 'Insumo actualizado exitosamente', 'success')
            await cargarInsumos()
            setTimeout(() => cerrarModalEditarInsumo(), 1500)
        } else {
            mostrarMensajeInsumo('mensajeEditarInsumo', data.message || 'Error al actualizar', 'error')
        }
    } catch (error) {
        mostrarMensajeInsumo('mensajeEditarInsumo', 'No se pudo conectar con el servidor', 'error')
    } finally {
        btnGuardar.disabled = false
        btnGuardar.textContent = 'Guardar cambios'
    }
})

// ── HELPERS ────────────────────────────────────────────────
function mostrarMensajeInsumo(elementId, texto, tipo) {
    const el = document.getElementById(elementId)
    el.textContent = texto
    el.style.display = 'block'
    el.style.padding = '10px 14px'
    el.style.borderRadius = '10px'
    el.style.fontSize = '13px'
    el.style.marginBottom = '10px'
    el.style.backgroundColor = tipo === 'success' ? '#d1fae5' : '#fee2e2'
    el.style.color = tipo === 'success' ? '#065f46' : '#991b1b'
}

function ocultarMensajeInsumo(elementId) {
    const el = document.getElementById(elementId)
    el.textContent = ''
    el.style.display = 'none'
}