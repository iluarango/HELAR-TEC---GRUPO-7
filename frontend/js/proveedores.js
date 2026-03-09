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

    tbody.innerHTML = proveedores.map(p => `
        <tr>
            <td>${p.nombreproveedor}</td>
            <td>${p.contactoproveedor || '<span style="color:#ccc">-</span>'}</td>
            <td>${p.telefonoproveedor || '<span style="color:#ccc">-</span>'}</td>
            <td>${p.correoproveedor || '<span style="color:#ccc">-</span>'}</td>
            <td>
                <div class="estado-dropdown-wrapper">
                    <span class="badge-clickeable ${p.estado === 'activo' ? 'estado-disponible' : 'estado-bajo'}"
                        onclick="toggleDropdownEstadoProveedor(${p.idproveedor}, event)">
                        ${p.estado}
                    </span>
                    <div class="estado-dropdown" id="dropdown-proveedor-${p.idproveedor}">
                        <div class="estado-opcion" onclick="cambiarEstadoProveedor(${p.idproveedor}, 'activo')">activo</div>
                        <div class="estado-opcion" onclick="cambiarEstadoProveedor(${p.idproveedor}, 'inactivo')">inactivo</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="botones-accion">
                    <button class="boton-accion" title="Editar" onclick="abrirModalProveedor(${p.idproveedor})">
                        <i class="fas fa-pen"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('')
}

function mensajeFilaProveedor(texto, colspan) {
    return `<tr><td colspan="${colspan}" style="text-align:center; padding:40px; color:#999;">${texto}</td></tr>`
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
function toggleDropdownEstadoProveedor(id, event) {
    event.stopPropagation()
    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => d.classList.remove('abierto'))
    const dropdown = document.getElementById(`dropdown-proveedor-${id}`)
    const rect = event.target.getBoundingClientRect()
    dropdown.style.top = `${rect.bottom + window.scrollY + 4}px`
    dropdown.style.left = `${rect.left + window.scrollX}px`
    dropdown.classList.toggle('abierto')
}

async function cambiarEstadoProveedor(id, nuevoEstado) {
    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => d.classList.remove('abierto'))

    try {
        const response = await fetch(`${API_PROVEEDORES}/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ estado: nuevoEstado })
        })
        const data = await response.json()
        if (data.success) {
            const proveedor = listaProveedores.find(p => p.idproveedor === id)
            if (proveedor) proveedor.estado = nuevoEstado
            renderTablaProveedores(listaProveedores)
        }
    } catch (error) {
        console.error('Error al cambiar estado:', error)
    }
}

// ── MODAL UNIFICADO ────────────────────────────────────────
const modalProveedor = document.getElementById('modalProveedor')

function abrirModalProveedor(id = null) {
    const titulo = document.getElementById('tituloModalProveedor')
    const btnSubmit = document.getElementById('btnSubmitProveedor')

    document.getElementById('formProveedor').reset()
    document.getElementById('idProveedorEditar').value = ''
    ocultarMensajeProveedor('mensajeProveedor')

    if (id) {
        const proveedor = listaProveedores.find(p => p.idproveedor === id)
        if (!proveedor) return

        titulo.textContent = 'Editar Proveedor'
        btnSubmit.textContent = 'Guardar cambios'

        document.getElementById('idProveedorEditar').value = proveedor.idproveedor
        document.getElementById('nombreProveedor').value = proveedor.nombreproveedor
        document.getElementById('contactoProveedor').value = proveedor.contactoproveedor || ''
        document.getElementById('telefonoProveedor').value = proveedor.telefonoproveedor || ''
        document.getElementById('correoProveedor').value = proveedor.correoproveedor || ''
    } else {
        titulo.textContent = 'Registrar Proveedor'
        btnSubmit.textContent = 'Registrar'
    }

    modalProveedor.style.display = 'flex'
}

document.getElementById('btnAbrirModalProveedor').addEventListener('click', () => abrirModalProveedor())
document.getElementById('btnCerrarModalProveedor').addEventListener('click', cerrarModalProveedor)
document.getElementById('btnCancelarModalProveedor').addEventListener('click', cerrarModalProveedor)
modalProveedor.addEventListener('click', (e) => { if (e.target === modalProveedor) cerrarModalProveedor() })

function cerrarModalProveedor() {
    modalProveedor.style.display = 'none'
    document.getElementById('formProveedor').reset()
    ocultarMensajeProveedor('mensajeProveedor')
}

// ── SUBMIT FORM ────────────────────────────────────────────
document.getElementById('formProveedor').addEventListener('submit', async (e) => {
    e.preventDefault()

    const id = document.getElementById('idProveedorEditar').value
    const body = {
        nombreProveedor: document.getElementById('nombreProveedor').value.trim(),
        contactoProveedor: document.getElementById('contactoProveedor').value.trim(),
        telefonoProveedor: document.getElementById('telefonoProveedor').value.trim(),
        correoProveedor: document.getElementById('correoProveedor').value.trim()
    }

    const url = id ? `${API_PROVEEDORES}/${id}` : API_PROVEEDORES
    const method = id ? 'PUT' : 'POST'

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body)
        })

        const data = await response.json()

        if (data.success) {
            mostrarMensajeProveedor('mensajeProveedor', id ? 'Proveedor actualizado exitosamente' : 'Proveedor registrado exitosamente', 'success')
            await cargarProveedores()
            setTimeout(() => cerrarModalProveedor(), 1500)
        } else {
            mostrarMensajeProveedor('mensajeProveedor', data.message || 'Error al guardar', 'error')
        }
    } catch (error) {
        mostrarMensajeProveedor('mensajeProveedor', 'No se pudo conectar con el servidor', 'error')
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