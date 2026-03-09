// ── LISTA EN MEMORIA ───────────────────────────────────────
let listaProveedores = []

// ── CARGAR PROVEEDORES ─────────────────────────────────────
async function cargarProveedores() {
    const tbody = document.getElementById('cuerpoTablaProveedores')

    try {
        const data = await apiFetch('/proveedores')

        if (data.success) {
            listaProveedores = data.proveedores
            renderTablaProveedores(listaProveedores)
        } else {
            tbody.innerHTML = mensajeFilaTabla('Error al cargar proveedores', 6)
        }
    } catch (error) {
        tbody.innerHTML = mensajeFilaTabla('No se pudo conectar con el servidor', 6)
    }
}

// ── RENDER TABLA ───────────────────────────────────────────
function renderTablaProveedores(proveedores) {
    const tbody = document.getElementById('cuerpoTablaProveedores')

    if (proveedores.length === 0) {
        tbody.innerHTML = mensajeFilaTabla('No hay proveedores registrados', 6)
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
        const data = await apiFetch(`/proveedores/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        })
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
    ocultarMensaje('mensajeProveedor')

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
    ocultarMensaje('mensajeProveedor')
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

    const url = id ? `/proveedores/${id}` : '/proveedores'
    const method = id ? 'PUT' : 'POST'

    try {
        const data = await apiFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        if (data.success) {
            mostrarMensaje('mensajeProveedor', id ? 'Proveedor actualizado exitosamente' : 'Proveedor registrado exitosamente', 'success')
            await cargarProveedores()
            setTimeout(() => cerrarModalProveedor(), 1500)
        } else {
            mostrarMensaje('mensajeProveedor', data.message || 'Error al guardar', 'error')
        }
    } catch (error) {
        mostrarMensaje('mensajeProveedor', 'No se pudo conectar con el servidor', 'error')
    }
})
