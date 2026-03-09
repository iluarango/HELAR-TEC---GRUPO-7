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
        const stockBajo = i.stock <= i.stockminimo
        const fechaCad = i.fechacaducidad
            ? new Date(i.fechacaducidad).toLocaleDateString('es-CO')
            : '<span style="color:#ccc">-</span>'

        return `
            <tr>
                <td>${i.nombreinsumo}</td>
                <td>${i.tipoinsumo}</td>
                <td style="color: ${stockBajo ? '#991b1b' : 'inherit'}; font-weight: ${stockBajo ? '600' : 'normal'};">
                    ${i.stock} ${stockBajo ? '<i class="fas fa-exclamation-triangle" style="color:#991b1b; font-size:12px;"></i>' : ''}
                </td>
                <td>${i.stockminimo}</td>
                <td>${i.unidadmedida}</td>
                <td>${fechaCad}</td>
                <td>
                    <div class="estado-dropdown-wrapper">
                        <span class="badge-clickeable ${i.estado === 'activo' ? 'estado-disponible' : 'estado-bajo'}"
                            onclick="toggleDropdownEstadoInsumo(${i.idinsumo}, event)">
                            ${i.estado}
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

function mensajeFilaInsumo(texto, colspan) {
    return `<tr><td colspan="${colspan}" style="text-align:center; padding:40px; color:#999;">${texto}</td></tr>`
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
    const rect = event.target.getBoundingClientRect()
    dropdown.style.top = `${rect.bottom + window.scrollY + 4}px`
    dropdown.style.left = `${rect.left + window.scrollX}px`
    dropdown.classList.toggle('abierto')
}

async function cambiarEstadoInsumo(id, nuevoEstado) {
    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => d.classList.remove('abierto'))

    try {
        const response = await fetch(`${API_INSUMOS}/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ estado: nuevoEstado })
        })
        const data = await response.json()
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

function abrirModalInsumo(id = null) {
    const titulo = document.getElementById('tituloModalInsumo')
    const subtitulo = document.getElementById('subtituloModalInsumo')
    const btnSubmit = document.getElementById('btnSubmitInsumo')

    document.getElementById('formInsumo').reset()
    document.getElementById('idInsumoEditar').value = ''
    ocultarMensajeInsumo('mensajeInsumo')

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
    ocultarMensajeInsumo('mensajeInsumo')
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

    const url = id ? `${API_INSUMOS}/${id}` : API_INSUMOS
    const method = id ? 'PUT' : 'POST'

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body)
        })

        const data = await response.json()

        if (data.success) {
            mostrarMensajeInsumo('mensajeInsumo', id ? 'Insumo actualizado exitosamente' : 'Insumo registrado exitosamente', 'success')
            await cargarInsumos()
            setTimeout(() => cerrarModalInsumo(), 1500)
        } else {
            mostrarMensajeInsumo('mensajeInsumo', data.message || 'Error al guardar', 'error')
        }
    } catch (error) {
        mostrarMensajeInsumo('mensajeInsumo', 'No se pudo conectar con el servidor', 'error')
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