// ── LISTA EN MEMORIA ───────────────────────────────────────
let listaInsumos = []

// ── CARGAR INSUMOS ─────────────────────────────────────────
async function cargarInsumos() {
    const tbody = document.getElementById('cuerpoTablaInsumos')

    try {
        const data = await apiFetch('/insumos')

        if (data.success) {
            listaInsumos = data.insumos
            renderTablaInsumos(listaInsumos)
        } else {
            tbody.innerHTML = mensajeFilaTabla('Error al cargar insumos', 8)
        }
    } catch (error) {
        tbody.innerHTML = mensajeFilaTabla('No se pudo conectar con el servidor', 8)
    }
}

// ── RENDER TABLA ───────────────────────────────────────────
function renderTablaInsumos(insumos) {
    const tbody = document.getElementById('cuerpoTablaInsumos')

    if (insumos.length === 0) {
        tbody.innerHTML = mensajeFilaTabla('No hay insumos registrados', 8)
        return
    }

    tbody.innerHTML = insumos.map(i => {
        const stockBajo = i.stock <= i.stockminimo
        const fechaCad = i.fechacaducidad
            ? new Date(i.fechacaducidad).toLocaleDateString('es-CO')
            : '<span style="color:#ccc">-</span>'

        return `
            <tr>
                <td>${i.nombreinsumo}</td>
                <td>${i.tipoinsumo}</td>
                <td style="color: ${stockBajo ? '#dc2626' : 'inherit'}; font-weight: ${stockBajo ? '600' : 'normal'};">
                    ${i.stock} ${stockBajo ? '<i class="fas fa-exclamation-triangle" style="color:#dc2626; font-size:12px;"></i>' : ''}
                </td>
                <td>${i.stockminimo}</td>
                <td>${i.unidadmedida}</td>
                <td>${fechaCad}</td>
                <td>
                    <div class="estado-dropdown-wrapper">
                        <span class="badge-clickeable ${i.estado === 'activo' ? 'estado-disponible' : 'estado-bajo'}"
                            onclick="toggleDropdownEstadoInsumo(${i.idinsumo}, event)">
                            ${i.estado} <i class="fas fa-chevron-down" style="font-size:9px;"></i>
                        </span>
                        <div class="estado-dropdown" id="dropdown-insumo-${i.idinsumo}">
                            <div class="estado-opcion" onclick="cambiarEstadoInsumo(${i.idinsumo}, 'activo')">activo</div>
                            <div class="estado-opcion" onclick="cambiarEstadoInsumo(${i.idinsumo}, 'inactivo')">inactivo</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="botones-accion">
                        <button class="boton-accion" title="Editar" onclick="abrirModalInsumo(${i.idinsumo})">
                            <i class="fas fa-pen"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `
    }).join('')
}


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
function toggleDropdownEstadoInsumo(id, event) {
    event.stopPropagation()
    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => d.classList.remove('abierto'))
    const dropdown = document.getElementById(`dropdown-insumo-${id}`)
    const badge = event.currentTarget || event.target.closest('.badge-clickeable') || event.target
    const rect = badge.getBoundingClientRect()
    dropdown.style.top = `${rect.top}px`
    dropdown.style.left = `${rect.right + 8}px`
    dropdown.classList.toggle('abierto')
}

async function cambiarEstadoInsumo(id, nuevoEstado) {
    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => d.classList.remove('abierto'))

    try {
        const data = await apiFetch(`/insumos/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        })
        if (data.success) {
            const insumo = listaInsumos.find(i => i.idinsumo === id)
            if (insumo) insumo.estado = nuevoEstado
            renderTablaInsumos(listaInsumos)
        }
    } catch (error) {
        console.error('Error al cambiar estado:', error)
    }
}

// ── MODAL UNIFICADO ────────────────────────────────────────
const modalInsumo = document.getElementById('modalInsumo')

/** Abre el modal en modo edición (si se pasa id) o en modo registro (sin id) */
function abrirModalInsumo(id = null) {
    const titulo = document.getElementById('tituloModalInsumo')
    const subtitulo = document.getElementById('subtituloModalInsumo')
    const btnSubmit = document.getElementById('btnSubmitInsumo')

    document.getElementById('formInsumo').reset()
    document.getElementById('idInsumoEditar').value = ''
    ocultarMensaje('mensajeInsumo')

    if (id) {
        const insumo = listaInsumos.find(i => i.idinsumo === id)
        if (!insumo) return

        titulo.textContent = 'Editar Insumo'
        subtitulo.textContent = 'Modifica los datos del insumo'
        btnSubmit.textContent = 'Guardar cambios'

        document.getElementById('idInsumoEditar').value = insumo.idinsumo
        document.getElementById('nombreInsumo').value = insumo.nombreinsumo
        document.getElementById('tipoInsumo').value = insumo.tipoinsumo
        document.getElementById('stock').value = insumo.stock
        document.getElementById('stockMinimo').value = insumo.stockminimo
        document.getElementById('unidadMedida').value = insumo.unidadmedida
        document.getElementById('fechaCaducidad').value = insumo.fechacaducidad
            ? insumo.fechacaducidad.split('T')[0] : ''
    } else {
        titulo.textContent = 'Registrar Insumo'
        subtitulo.textContent = 'Agrega un nuevo insumo al inventario'
        btnSubmit.textContent = 'Registrar'
    }

    modalInsumo.style.display = 'flex'
}

document.getElementById('btnAbrirModalInsumo').addEventListener('click', () => abrirModalInsumo())
document.getElementById('btnCerrarModalInsumo').addEventListener('click', cerrarModalInsumo)
document.getElementById('btnCancelarModalInsumo').addEventListener('click', cerrarModalInsumo)
modalInsumo.addEventListener('click', (e) => { if (e.target === modalInsumo) cerrarModalInsumo() })

function cerrarModalInsumo() {
    modalInsumo.style.display = 'none'
    document.getElementById('formInsumo').reset()
    ocultarMensaje('mensajeInsumo')
}

// ── SUBMIT FORM ────────────────────────────────────────────
document.getElementById('formInsumo').addEventListener('submit', async (e) => {
    e.preventDefault()

    const id = document.getElementById('idInsumoEditar').value
    const body = {
        nombreInsumo: document.getElementById('nombreInsumo').value.trim(),
        tipoInsumo: document.getElementById('tipoInsumo').value,
        stock: document.getElementById('stock').value,
        stockMinimo: document.getElementById('stockMinimo').value,
        unidadMedida: document.getElementById('unidadMedida').value,
        fechaCaducidad: document.getElementById('fechaCaducidad').value || null
    }

    const url = id ? `/insumos/${id}` : '/insumos'
    const method = id ? 'PUT' : 'POST'

    try {
        const data = await apiFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        if (data.success) {
            mostrarMensaje('mensajeInsumo', id ? 'Insumo actualizado exitosamente' : 'Insumo registrado exitosamente', 'success')
            await cargarInsumos()
            setTimeout(() => cerrarModalInsumo(), 1500)
        } else {
            mostrarMensaje('mensajeInsumo', data.message || 'Error al guardar', 'error')
        }
    } catch (error) {
        mostrarMensaje('mensajeInsumo', 'No se pudo conectar con el servidor', 'error')
    }
})
