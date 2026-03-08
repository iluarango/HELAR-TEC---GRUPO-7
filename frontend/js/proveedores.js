const API_PROVEEDORES = 'http://localhost:3000/api/proveedores'

// ── LISTA EN MEMORIA ───────────────────────────────────────
let listaProveedores = []

// ── CARGAR PROVEEDORES ─────────────────────────────────────
async function cargarProveedores() {
    const tbody = document.getElementById('cuerpoTablaProveedores')

    try {
        const response = await fetch(API_PROVEEDORES, {
            headers: { 'Authorization': `Bearer ${token}` }
        })

        const data = await response.json()

        if (data.success) {
            listaProveedores = data.proveedores
            renderTablaProveedores(listaProveedores)
        } else {
            tbody.innerHTML = mensajeFilaProveedor('Error al cargar proveedores', 6)
        }
    } catch (error) {
        tbody.innerHTML = mensajeFilaProveedor('No se pudo conectar con el servidor', 6)
    }
}

// ── RENDER TABLA ───────────────────────────────────────────
function renderTablaProveedores(proveedores) {
    const tbody = document.getElementById('cuerpoTablaProveedores')

    if (proveedores.length === 0) {
        tbody.innerHTML = mensajeFilaProveedor('No hay proveedores registrados', 6)
        return
    }

    tbody.innerHTML = proveedores.map(p => {
        const esActivo = p.estado === 'activo'

        return `
            <tr>
                <td>${p.nombreproveedor}</td>
                <td>${p.contactoproveedor || '—'}</td>
                <td>${p.telefonoproveedor || '—'}</td>
                <td>${p.correoproveedor || '—'}</td>
                <td>
                    <div class="estado-dropdown-wrapper">
                        <span 
                            class="etiqueta-estado ${esActivo ? 'estado-disponible' : 'estado-bajo'} badge-clickeable"
                            onclick="toggleDropdownEstadoProveedor(event, ${p.idproveedor})"
                        >
                            ${esActivo ? 'Activo' : 'Inactivo'}
                            <i class="fas fa-chevron-down" style="font-size: 10px; margin-left: 4px;"></i>
                        </span>
                        <div class="estado-dropdown" id="dropdown-proveedor-${p.idproveedor}">
                            <div class="estado-opcion ${esActivo ? 'opcion-seleccionada' : ''}" onclick="cambiarEstadoProveedor(${p.idproveedor}, 'activo')">
                                <i class="fas fa-check" style="margin-right: 6px; opacity: ${esActivo ? '1' : '0'};"></i>
                                Activo
                            </div>
                            <div class="estado-opcion ${!esActivo ? 'opcion-seleccionada' : ''}" onclick="cambiarEstadoProveedor(${p.idproveedor}, 'inactivo')">
                                <i class="fas fa-check" style="margin-right: 6px; opacity: ${!esActivo ? '1' : '0'};"></i>
                                Inactivo
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="botones-accion">
                        <button class="boton-accion" title="Editar" onclick="abrirModalEditarProveedor(${p.idproveedor})">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `
    }).join('')
}

function mensajeFilaProveedor(texto, colspan) {
    return `
        <tr>
            <td colspan="${colspan}" style="text-align: center; padding: 40px; color: #999;">
                ${texto}
            </td>
        </tr>
    `
}

// ── BÚSQUEDA ───────────────────────────────────────────────
document.getElementById('inputBusquedaProveedor').addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase().trim()

    const filtrados = listaProveedores.filter(p =>
        p.nombreproveedor.toLowerCase().includes(termino)
    )

    renderTablaProveedores(filtrados)
})

// ── DROPDOWN ESTADO ────────────────────────────────────────
function toggleDropdownEstadoProveedor(event, id) {
    event.stopPropagation()

    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => {
        if (d.id !== `dropdown-proveedor-${id}`) d.classList.remove('abierto')
    })

    const dropdown = document.getElementById(`dropdown-proveedor-${id}`)
    const badge = event.currentTarget
    const rect = badge.getBoundingClientRect()

    dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`
    dropdown.style.left = `${rect.left + window.scrollX}px`

    dropdown.classList.toggle('abierto')
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.estado-dropdown-wrapper')) {
        document.querySelectorAll('.estado-dropdown.abierto').forEach(d => {
            d.classList.remove('abierto')
        })
    }
})

async function cambiarEstadoProveedor(id, nuevoEstado) {
    document.getElementById(`dropdown-proveedor-${id}`).classList.remove('abierto')

    try {
        const response = await fetch(`${API_PROVEEDORES}/${id}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: nuevoEstado })
        })

        const data = await response.json()
        if (data.success) await cargarProveedores()
    } catch (error) {
        console.error('Error al cambiar estado del proveedor:', error)
    }
}

// ── MODAL REGISTRO ─────────────────────────────────────────
const modalProveedor = document.getElementById('modalProveedor')

document.getElementById('btnAbrirModalProveedor').addEventListener('click', () => {
    modalProveedor.style.display = 'flex'
})

document.getElementById('btnCerrarModalProveedor').addEventListener('click', cerrarModalProveedor)
document.getElementById('btnCancelarModalProveedor').addEventListener('click', cerrarModalProveedor)

modalProveedor.addEventListener('click', (e) => {
    if (e.target === modalProveedor) cerrarModalProveedor()
})

function cerrarModalProveedor() {
    modalProveedor.style.display = 'none'
    document.getElementById('formNuevoProveedor').reset()
    ocultarMensajeProveedor('mensajeProveedor')
}

document.getElementById('formNuevoProveedor').addEventListener('submit', async (e) => {
    e.preventDefault()

    const nombreProveedor   = document.getElementById('nombreProveedor').value.trim()
    const contactoProveedor = document.getElementById('contactoProveedor').value.trim()
    const telefonoProveedor = document.getElementById('telefonoProveedor').value.trim()
    const correoProveedor   = document.getElementById('correoProveedor').value.trim()

    const btnRegistrar = e.target.querySelector('.btn-registrar')
    btnRegistrar.disabled = true
    btnRegistrar.textContent = 'Registrando...'

    try {
        const response = await fetch(API_PROVEEDORES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nombreProveedor, contactoProveedor, telefonoProveedor, correoProveedor })
        })

        const data = await response.json()

        if (data.success) {
            mostrarMensajeProveedor('mensajeProveedor', 'Proveedor registrado exitosamente', 'success')
            await cargarProveedores()
            setTimeout(() => cerrarModalProveedor(), 1500)
        } else {
            mostrarMensajeProveedor('mensajeProveedor', data.message || 'Error al registrar', 'error')
        }
    } catch (error) {
        mostrarMensajeProveedor('mensajeProveedor', 'No se pudo conectar con el servidor', 'error')
    } finally {
        btnRegistrar.disabled = false
        btnRegistrar.textContent = 'Registrar'
    }
})

// ── MODAL EDITAR ───────────────────────────────────────────
const modalEditarProveedor = document.getElementById('modalEditarProveedor')

function abrirModalEditarProveedor(id) {
    const proveedor = listaProveedores.find(p => p.idproveedor === id)
    if (!proveedor) return

    document.getElementById('editIdProveedor').value          = proveedor.idproveedor
    document.getElementById('editNombreProveedor').value      = proveedor.nombreproveedor
    document.getElementById('editContactoProveedor').value    = proveedor.contactoproveedor || ''
    document.getElementById('editTelefonoProveedor').value    = proveedor.telefonoproveedor || ''
    document.getElementById('editCorreoProveedor').value      = proveedor.correoproveedor || ''

    modalEditarProveedor.style.display = 'flex'
}

document.getElementById('btnCerrarModalEditarProveedor').addEventListener('click', cerrarModalEditarProveedor)
document.getElementById('btnCancelarModalEditarProveedor').addEventListener('click', cerrarModalEditarProveedor)

modalEditarProveedor.addEventListener('click', (e) => {
    if (e.target === modalEditarProveedor) cerrarModalEditarProveedor()
})

function cerrarModalEditarProveedor() {
    modalEditarProveedor.style.display = 'none'
    ocultarMensajeProveedor('mensajeEditarProveedor')
}

document.getElementById('formEditarProveedor').addEventListener('submit', async (e) => {
    e.preventDefault()

    const id                = document.getElementById('editIdProveedor').value
    const nombreProveedor   = document.getElementById('editNombreProveedor').value.trim()
    const contactoProveedor = document.getElementById('editContactoProveedor').value.trim()
    const telefonoProveedor = document.getElementById('editTelefonoProveedor').value.trim()
    const correoProveedor   = document.getElementById('editCorreoProveedor').value.trim()

    const btnGuardar = e.target.querySelector('.btn-registrar')
    btnGuardar.disabled = true
    btnGuardar.textContent = 'Guardando...'

    try {
        const response = await fetch(`${API_PROVEEDORES}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nombreProveedor, contactoProveedor, telefonoProveedor, correoProveedor })
        })

        const data = await response.json()

        if (data.success) {
            mostrarMensajeProveedor('mensajeEditarProveedor', 'Proveedor actualizado exitosamente', 'success')
            await cargarProveedores()
            setTimeout(() => cerrarModalEditarProveedor(), 1500)
        } else {
            mostrarMensajeProveedor('mensajeEditarProveedor', data.message || 'Error al actualizar', 'error')
        }
    } catch (error) {
        mostrarMensajeProveedor('mensajeEditarProveedor', 'No se pudo conectar con el servidor', 'error')
    } finally {
        btnGuardar.disabled = false
        btnGuardar.textContent = 'Guardar cambios'
    }
})

// ── HELPERS ────────────────────────────────────────────────
function mostrarMensajeProveedor(elementId, texto, tipo) {
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

function ocultarMensajeProveedor(elementId) {
    const el = document.getElementById(elementId)
    el.textContent = ''
    el.style.display = 'none'
}