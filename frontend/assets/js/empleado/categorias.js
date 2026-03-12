// ── LISTAS EN MEMORIA ──────────────────────────────────────
let listaCategorias = []
let listaSabores = []

// ══════════════════════════════════════════════════════════
// CATEGORÍAS
// ══════════════════════════════════════════════════════════

async function cargarCategorias() {
    const tbody = document.getElementById('cuerpoTablaCategorias')

    try {
        const data = await apiFetch('/categorias')

        if (data.success) {
            listaCategorias = data.categorias
            renderTablaCategorias(listaCategorias)
        } else {
            tbody.innerHTML = mensajeFilaTabla('Error al cargar categorías', 3)
        }
    } catch (error) {
        tbody.innerHTML = mensajeFilaTabla('No se pudo conectar con el servidor', 3)
    }
}

function renderTablaCategorias(categorias) {
    const tbody = document.getElementById('cuerpoTablaCategorias')

    if (categorias.length === 0) {
        tbody.innerHTML = mensajeFilaTabla('No hay categorías registradas', 3)
        return
    }

    tbody.innerHTML = categorias.map(c => `
        <tr>
            <td>${c.nombrecategoria}</td>
            <td>
                <div class="estado-dropdown-wrapper">
                    <span class="badge-clickeable ${c.estado === 'activo' ? 'estado-disponible' : 'estado-bajo'}"
                        onclick="toggleDropdownEstadoCategoria(${c.idcategoria}, event)">
                        ${c.estado} <i class="fas fa-chevron-down" style="font-size:9px;"></i>
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
    const badge = event.currentTarget || event.target.closest('.badge-clickeable') || event.target
    const rect = badge.getBoundingClientRect()
    dropdown.style.top = `${rect.top}px`
    dropdown.style.left = `${rect.right + 8}px`
    dropdown.classList.toggle('abierto')
}

async function cambiarEstadoCategoria(id, nuevoEstado) {
    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => d.classList.remove('abierto'))
    try {
        const data = await apiFetch(`/categorias/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        })
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
    const url = id ? `/categorias/${id}` : '/categorias'
    const method = id ? 'PUT' : 'POST'

    try {
        const data = await apiFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
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
        const data = await apiFetch('/sabores')

        if (data.success) {
            listaSabores = data.sabores
            renderTablaSabores(listaSabores)
        } else {
            tbody.innerHTML = mensajeFilaTabla('Error al cargar sabores', 3)
        }
    } catch (error) {
        tbody.innerHTML = mensajeFilaTabla('No se pudo conectar con el servidor', 3)
    }
}

function renderTablaSabores(sabores) {
    const tbody = document.getElementById('cuerpoTablaSabores')

    if (sabores.length === 0) {
        tbody.innerHTML = mensajeFilaTabla('No hay sabores registrados', 3)
        return
    }

    tbody.innerHTML = sabores.map(s => `
        <tr>
            <td>${s.nombresabor}</td>
            <td>
                <div class="estado-dropdown-wrapper">
                    <span class="badge-clickeable ${s.estado === 'activo' ? 'estado-disponible' : 'estado-bajo'}"
                        onclick="toggleDropdownEstadoSabor(${s.idsabor}, event)">
                        ${s.estado} <i class="fas fa-chevron-down" style="font-size:9px;"></i>
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
    const badge = event.currentTarget || event.target.closest('.badge-clickeable') || event.target
    const rect = badge.getBoundingClientRect()
    dropdown.style.top = `${rect.top}px`
    dropdown.style.left = `${rect.right + 8}px`
    dropdown.classList.toggle('abierto')
}

async function cambiarEstadoSabor(id, nuevoEstado) {
    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => d.classList.remove('abierto'))
    try {
        const data = await apiFetch(`/sabores/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        })
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
    const url = id ? `/sabores/${id}` : '/sabores'
    const method = id ? 'PUT' : 'POST'

    try {
        const data = await apiFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
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

// ══════════════════════════════════════════════════════════
// ADICIONALES
// ══════════════════════════════════════════════════════════

let listaAdicionales = []

async function cargarAdicionales() {
    const tbody = document.getElementById('cuerpoTablaAdicionales')
    try {
        const data = await apiFetch('/adicionales')
        if (data.success) {
            listaAdicionales = data.adicionales
            renderTablaAdicionales(listaAdicionales)
        } else {
            tbody.innerHTML = mensajeFilaTabla('Error al cargar adicionales', 4)
        }
    } catch (error) {
        tbody.innerHTML = mensajeFilaTabla('No se pudo conectar con el servidor', 4)
    }
}

function renderTablaAdicionales(adicionales) {
    const tbody = document.getElementById('cuerpoTablaAdicionales')
    if (adicionales.length === 0) {
        tbody.innerHTML = mensajeFilaTabla('No hay adicionales registrados', 4)
        return
    }
    tbody.innerHTML = adicionales.map(a => `
        <tr>
            <td>${a.nombre}</td>
            <td>$${parseFloat(a.precio).toLocaleString('es-CO')}</td>
            <td>
                <div class="estado-dropdown-wrapper">
                    <span class="badge-clickeable ${a.estado === 'activo' ? 'estado-disponible' : 'estado-bajo'}"
                        onclick="toggleDropdownEstadoAdicional(${a.idadicional}, event)">
                        ${a.estado} <i class="fas fa-chevron-down" style="font-size:9px;"></i>
                    </span>
                    <div class="estado-dropdown" id="dropdown-adicional-${a.idadicional}">
                        <div class="estado-opcion" onclick="cambiarEstadoAdicional(${a.idadicional}, 'activo')">activo</div>
                        <div class="estado-opcion" onclick="cambiarEstadoAdicional(${a.idadicional}, 'inactivo')">inactivo</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="botones-accion">
                    <button class="boton-accion" title="Editar" onclick="abrirModalAdicional(${a.idadicional})">
                        <i class="fas fa-pen"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('')
}

function toggleDropdownEstadoAdicional(id, event) {
    event.stopPropagation()
    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => d.classList.remove('abierto'))
    const dropdown = document.getElementById(`dropdown-adicional-${id}`)
    const badge = event.currentTarget || event.target.closest('.badge-clickeable') || event.target
    const rect = badge.getBoundingClientRect()
    dropdown.style.top = `${rect.top}px`
    dropdown.style.left = `${rect.right + 8}px`
    dropdown.classList.toggle('abierto')
}

async function cambiarEstadoAdicional(id, nuevoEstado) {
    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => d.classList.remove('abierto'))
    try {
        const data = await apiFetch(`/adicionales/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        })
        if (data.success) {
            const ad = listaAdicionales.find(a => a.idadicional === id)
            if (ad) ad.estado = nuevoEstado
            renderTablaAdicionales(listaAdicionales)
        }
    } catch (error) {
        console.error('Error al cambiar estado:', error)
    }
}

// ── MODAL ADICIONAL ────────────────────────────────────────
const modalAdicional = document.getElementById('modalAdicional')

function abrirModalAdicional(id = null) {
    const titulo    = document.getElementById('tituloModalAdicional')
    const btnSubmit = document.getElementById('btnSubmitAdicional')
    document.getElementById('formAdicional').reset()
    document.getElementById('idAdicionalEditar').value = ''
    ocultarMensaje('mensajeAdicional')

    if (id) {
        const ad = listaAdicionales.find(a => a.idadicional === id)
        if (!ad) return
        titulo.textContent = 'Editar Adicional'
        btnSubmit.textContent = 'Guardar cambios'
        document.getElementById('idAdicionalEditar').value = ad.idadicional
        document.getElementById('nombreAdicional').value = ad.nombre
        document.getElementById('precioAdicional').value = ad.precio
    } else {
        titulo.textContent = 'Registrar Adicional'
        btnSubmit.textContent = 'Registrar'
    }
    modalAdicional.style.display = 'flex'
}

document.getElementById('btnAbrirModalAdicional').addEventListener('click', () => abrirModalAdicional())
document.getElementById('btnCerrarModalAdicional').addEventListener('click', () => cerrarModal(modalAdicional, 'formAdicional', 'mensajeAdicional'))
document.getElementById('btnCancelarModalAdicional').addEventListener('click', () => cerrarModal(modalAdicional, 'formAdicional', 'mensajeAdicional'))
modalAdicional.addEventListener('click', (e) => { if (e.target === modalAdicional) cerrarModal(modalAdicional, 'formAdicional', 'mensajeAdicional') })

document.getElementById('formAdicional').addEventListener('submit', async (e) => {
    e.preventDefault()
    const id = document.getElementById('idAdicionalEditar').value
    const body = {
        nombre: document.getElementById('nombreAdicional').value.trim(),
        precio: document.getElementById('precioAdicional').value
    }
    const url    = id ? `/adicionales/${id}` : '/adicionales'
    const method = id ? 'PUT' : 'POST'

    try {
        const data = await apiFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        if (data.success) {
            mostrarMensaje('mensajeAdicional', id ? 'Adicional actualizado' : 'Adicional registrado', 'success')
            await cargarAdicionales()
            setTimeout(() => cerrarModal(modalAdicional, 'formAdicional', 'mensajeAdicional'), 1500)
        } else {
            mostrarMensaje('mensajeAdicional', data.message || 'Error al guardar', 'error')
        }
    } catch (error) {
        mostrarMensaje('mensajeAdicional', 'No se pudo conectar con el servidor', 'error')
    }
})

// ── HELPER LOCAL ────────────────────────────────────────────
/** Cierra el modal dado, resetea su formulario y oculta el mensaje de feedback */
function cerrarModal(modal, formId, mensajeId) {
    modal.style.display = 'none'
    document.getElementById(formId).reset()
    ocultarMensaje(mensajeId)
}
