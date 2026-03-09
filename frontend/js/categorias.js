const API_CATEGORIAS_BASE = 'http://localhost:3000/api/categorias'
const API_SABORES_BASE = 'http://localhost:3000/api/sabores'

// ── LISTAS EN MEMORIA ──────────────────────────────────────
let listaCategorias = []
let listaSabores = []  // ✅ Esto está bien, es diferente de la variable en pedidos.js

// ══════════════════════════════════════════════════════════
// CATEGORÍAS
// ══════════════════════════════════════════════════════════

async function cargarCategorias() {
    const tbody = document.getElementById('cuerpoTablaCategorias')

    try {
        const response = await fetch(API_CATEGORIAS_BASE, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()

        if (data.success) {
            listaCategorias = data.categorias
            renderTablaCategorias(listaCategorias)
        } else {
            tbody.innerHTML = mensajeFila('Error al cargar categorías', 3)
        }
    } catch (error) {
        tbody.innerHTML = mensajeFila('No se pudo conectar con el servidor', 3)
    }
}

function renderTablaCategorias(categorias) {
    const tbody = document.getElementById('cuerpoTablaCategorias')

    if (categorias.length === 0) {
        tbody.innerHTML = mensajeFila('No hay categorías registradas', 3)
        return
    }

    tbody.innerHTML = categorias.map(c => `
        <tr>
            <td>${c.nombrecategoria}</td>
            <td>
                <div class="estado-dropdown-wrapper">
                    <span class="badge-clickeable ${c.estado === 'activo' ? 'estado-disponible' : 'estado-bajo'}"
                        onclick="toggleDropdownEstadoCategoria(${c.idcategoria}, event)">
                        ${c.estado}
                    </span>
                    <div class="estado-dropdown" id="dropdown-categoria-${c.idcategoria}">
                        <div class="estado-opcion" onclick="cambiarEstadoCategoria(${c.idcategoria}, 'activo')">activo</div>
                        <div class="estado-opcion" onclick="cambiarEstadoCategoria(${c.idcategoria}, 'inactivo')">inactivo</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="botones-accion">
                    <button class="boton-accion" title="Editar" onclick="abrirModalCategoria(${c.idcategoria})">
                        <i class="fas fa-pen"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('')
}

// ── DROPDOWN ESTADO CATEGORÍA ──────────────────────────────
function toggleDropdownEstadoCategoria(id, event) {
    event.stopPropagation()
    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => d.classList.remove('abierto'))
    const dropdown = document.getElementById(`dropdown-categoria-${id}`)
    const rect = event.target.getBoundingClientRect()
    dropdown.style.top = `${rect.bottom + window.scrollY + 4}px`
    dropdown.style.left = `${rect.left + window.scrollX}px`
    dropdown.classList.toggle('abierto')
}

async function cambiarEstadoCategoria(id, nuevoEstado) {
    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => d.classList.remove('abierto'))
    try {
        const response = await fetch(`${API_CATEGORIAS_BASE}/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ estado: nuevoEstado })
        })
        const data = await response.json()
        if (data.success) {
            const cat = listaCategorias.find(c => c.idcategoria === id)
            if (cat) cat.estado = nuevoEstado
            renderTablaCategorias(listaCategorias)
        }
    } catch (error) {
        console.error('Error al cambiar estado:', error)
    }
}

// ── MODAL CATEGORÍA ────────────────────────────────────────
const modalCategoria = document.getElementById('modalCategoria')

function abrirModalCategoria(id = null) {
    const titulo = document.getElementById('tituloModalCategoria')
    const btnSubmit = document.getElementById('btnSubmitCategoria')

    document.getElementById('formCategoria').reset()
    document.getElementById('idCategoriaEditar').value = ''
    ocultarMensaje('mensajeCategoria')

    if (id) {
        const cat = listaCategorias.find(c => c.idcategoria === id)
        if (!cat) return
        titulo.textContent = 'Editar Categoría'
        btnSubmit.textContent = 'Guardar cambios'
        document.getElementById('idCategoriaEditar').value = cat.idcategoria
        document.getElementById('nombreCategoria').value = cat.nombrecategoria
    } else {
        titulo.textContent = 'Registrar Categoría'
        btnSubmit.textContent = 'Registrar'
    }

    modalCategoria.style.display = 'flex'
}

document.getElementById('btnAbrirModalCategoria').addEventListener('click', () => abrirModalCategoria())
document.getElementById('btnCerrarModalCategoria').addEventListener('click', () => cerrarModal(modalCategoria, 'formCategoria', 'mensajeCategoria'))
document.getElementById('btnCancelarModalCategoria').addEventListener('click', () => cerrarModal(modalCategoria, 'formCategoria', 'mensajeCategoria'))
modalCategoria.addEventListener('click', (e) => { if (e.target === modalCategoria) cerrarModal(modalCategoria, 'formCategoria', 'mensajeCategoria') })

document.getElementById('formCategoria').addEventListener('submit', async (e) => {
    e.preventDefault()
    const id = document.getElementById('idCategoriaEditar').value
    const body = { nombreCategoria: document.getElementById('nombreCategoria').value.trim() }
    const url = id ? `${API_CATEGORIAS_BASE}/${id}` : API_CATEGORIAS_BASE
    const method = id ? 'PUT' : 'POST'

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body)
        })
        const data = await response.json()
        if (data.success) {
            mostrarMensaje('mensajeCategoria', id ? 'Categoría actualizada' : 'Categoría registrada', 'success')
            await cargarCategorias()
            setTimeout(() => cerrarModal(modalCategoria, 'formCategoria', 'mensajeCategoria'), 1500)
        } else {
            mostrarMensaje('mensajeCategoria', data.message || 'Error al guardar', 'error')
        }
    } catch (error) {
        mostrarMensaje('mensajeCategoria', 'No se pudo conectar con el servidor', 'error')
    }
})

// ══════════════════════════════════════════════════════════
// SABORES
// ══════════════════════════════════════════════════════════

async function cargarSabores() {
    const tbody = document.getElementById('cuerpoTablaSabores')

    try {
        const response = await fetch(API_SABORES_BASE, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()

        if (data.success) {
            listaSabores = data.sabores
            renderTablaSabores(listaSabores)
        } else {
            tbody.innerHTML = mensajeFila('Error al cargar sabores', 3)
        }
    } catch (error) {
        tbody.innerHTML = mensajeFila('No se pudo conectar con el servidor', 3)
    }
}

function renderTablaSabores(sabores) {
    const tbody = document.getElementById('cuerpoTablaSabores')

    if (sabores.length === 0) {
        tbody.innerHTML = mensajeFila('No hay sabores registrados', 3)
        return
    }

    tbody.innerHTML = sabores.map(s => `
        <tr>
            <td>${s.nombresabor}</td>
            <td>
                <div class="estado-dropdown-wrapper">
                    <span class="badge-clickeable ${s.estado === 'activo' ? 'estado-disponible' : 'estado-bajo'}"
                        onclick="toggleDropdownEstadoSabor(${s.idsabor}, event)">
                        ${s.estado}
                    </span>
                    <div class="estado-dropdown" id="dropdown-sabor-${s.idsabor}">
                        <div class="estado-opcion" onclick="cambiarEstadoSabor(${s.idsabor}, 'activo')">activo</div>
                        <div class="estado-opcion" onclick="cambiarEstadoSabor(${s.idsabor}, 'inactivo')">inactivo</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="botones-accion">
                    <button class="boton-accion" title="Editar" onclick="abrirModalSabor(${s.idsabor})">
                        <i class="fas fa-pen"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('')
}

// ── DROPDOWN ESTADO SABOR ──────────────────────────────────
function toggleDropdownEstadoSabor(id, event) {
    event.stopPropagation()
    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => d.classList.remove('abierto'))
    const dropdown = document.getElementById(`dropdown-sabor-${id}`)
    const rect = event.target.getBoundingClientRect()
    dropdown.style.top = `${rect.bottom + window.scrollY + 4}px`
    dropdown.style.left = `${rect.left + window.scrollX}px`
    dropdown.classList.toggle('abierto')
}

async function cambiarEstadoSabor(id, nuevoEstado) {
    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => d.classList.remove('abierto'))
    try {
        const response = await fetch(`${API_SABORES_BASE}/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ estado: nuevoEstado })
        })
        const data = await response.json()
        if (data.success) {
            const sabor = listaSabores.find(s => s.idsabor === id)
            if (sabor) sabor.estado = nuevoEstado
            renderTablaSabores(listaSabores)
        }
    } catch (error) {
        console.error('Error al cambiar estado:', error)
    }
}

// ── MODAL SABOR ────────────────────────────────────────────
const modalSabor = document.getElementById('modalSabor')

function abrirModalSabor(id = null) {
    const titulo = document.getElementById('tituloModalSabor')
    const btnSubmit = document.getElementById('btnSubmitSabor')

    document.getElementById('formSabor').reset()
    document.getElementById('idSaborEditar').value = ''
    ocultarMensaje('mensajeSabor')

    if (id) {
        const sabor = listaSabores.find(s => s.idsabor === id)
        if (!sabor) return
        titulo.textContent = 'Editar Sabor'
        btnSubmit.textContent = 'Guardar cambios'
        document.getElementById('idSaborEditar').value = sabor.idsabor
        document.getElementById('nombreSabor').value = sabor.nombresabor
    } else {
        titulo.textContent = 'Registrar Sabor'
        btnSubmit.textContent = 'Registrar'
    }

    modalSabor.style.display = 'flex'
}

document.getElementById('btnAbrirModalSabor').addEventListener('click', () => abrirModalSabor())
document.getElementById('btnCerrarModalSabor').addEventListener('click', () => cerrarModal(modalSabor, 'formSabor', 'mensajeSabor'))
document.getElementById('btnCancelarModalSabor').addEventListener('click', () => cerrarModal(modalSabor, 'formSabor', 'mensajeSabor'))
modalSabor.addEventListener('click', (e) => { if (e.target === modalSabor) cerrarModal(modalSabor, 'formSabor', 'mensajeSabor') })

document.getElementById('formSabor').addEventListener('submit', async (e) => {
    e.preventDefault()
    const id = document.getElementById('idSaborEditar').value
    const body = { nombreSabor: document.getElementById('nombreSabor').value.trim() }
    const url = id ? `${API_SABORES_BASE}/${id}` : API_SABORES_BASE
    const method = id ? 'PUT' : 'POST'

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body)
        })
        const data = await response.json()
        if (data.success) {
            mostrarMensaje('mensajeSabor', id ? 'Sabor actualizado' : 'Sabor registrado', 'success')
            await cargarSabores()
            setTimeout(() => cerrarModal(modalSabor, 'formSabor', 'mensajeSabor'), 1500)
        } else {
            mostrarMensaje('mensajeSabor', data.message || 'Error al guardar', 'error')
        }
    } catch (error) {
        mostrarMensaje('mensajeSabor', 'No se pudo conectar con el servidor', 'error')
    }
})

// ── HELPERS COMPARTIDOS ────────────────────────────────────
function cerrarModal(modal, formId, mensajeId) {
    modal.style.display = 'none'
    document.getElementById(formId).reset()
    ocultarMensaje(mensajeId)
}

function mostrarMensaje(elementId, texto, tipo) {
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

function ocultarMensaje(elementId) {
    const el = document.getElementById(elementId)
    el.textContent = ''
    el.style.display = 'none'
}

function mensajeFila(texto, colspan) {
    return `<tr><td colspan="${colspan}" style="text-align:center; padding:40px; color:#999;">${texto}</td></tr>`
}