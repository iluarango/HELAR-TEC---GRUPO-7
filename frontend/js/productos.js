const API_PRODUCTOS = 'http://localhost:3000/api/productos'

// ── LISTA EN MEMORIA ───────────────────────────────────────
let listaProductos = []

// ── CARGAR PRODUCTOS ───────────────────────────────────────
async function cargarProductos() {
    const tbody = document.getElementById('cuerpoTablaProductos')

    try {
        const response = await fetch(API_PRODUCTOS, {
            headers: { 'Authorization': `Bearer ${token}` }
        })

        const data = await response.json()

        if (data.success) {
            listaProductos = data.productos
            renderTablaProductos(listaProductos)
        } else {
            tbody.innerHTML = mensajeFilaProducto('Error al cargar productos', 6)
        }
    } catch (error) {
        tbody.innerHTML = mensajeFilaProducto('No se pudo conectar con el servidor', 6)
    }
}

// ── RENDER TABLA ───────────────────────────────────────────
function renderTablaProductos(productos) {
    const tbody = document.getElementById('cuerpoTablaProductos')

    if (productos.length === 0) {
        tbody.innerHTML = mensajeFilaProducto('No hay productos registrados', 6)
        return
    }

    tbody.innerHTML = productos.map(p => `
        <tr>
            <td>${p.nombreproducto}</td>
            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${p.descripcionproducto || '<span style="color:#ccc">Sin descripción</span>'}
            </td>
            <td>${p.categoria}</td>
            <td>$${parseFloat(p.preciobase).toLocaleString('es-CO')}</td>
            <td>
                <div class="estado-dropdown-wrapper">
                    <span class="badge-clickeable ${p.estado === 'activo' ? 'estado-disponible' : 'estado-bajo'}"
                        onclick="toggleDropdownEstadoProducto(${p.idproducto}, event)">
                        ${p.estado}
                    </span>
                    <div class="estado-dropdown" id="dropdown-producto-${p.idproducto}">
                        <div class="estado-opcion" onclick="cambiarEstadoProducto(${p.idproducto}, 'activo')">activo</div>
                        <div class="estado-opcion" onclick="cambiarEstadoProducto(${p.idproducto}, 'inactivo')">inactivo</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="botones-accion">
                    <button class="boton-accion" title="Editar" onclick="abrirModalEditarProducto(${p.idproducto})">
                        <i class="fas fa-pen"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('')
}

function mensajeFilaProducto(texto, colspan) {
    return `
        <tr>
            <td colspan="${colspan}" style="text-align: center; padding: 40px; color: #999;">
                ${texto}
            </td>
        </tr>
    `
}

// ── BÚSQUEDA ───────────────────────────────────────────────
document.getElementById('inputBusquedaProducto').addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase().trim()

    const filtrados = listaProductos.filter(p =>
        p.nombreproducto.toLowerCase().includes(termino) ||
        p.categoria.toLowerCase().includes(termino)
    )

    renderTablaProductos(filtrados)
})

// ── DROPDOWN ESTADO ────────────────────────────────────────
function toggleDropdownEstadoProducto(id, event) {
    event.stopPropagation()

    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => d.classList.remove('abierto'))

    const dropdown = document.getElementById(`dropdown-producto-${id}`)
    const rect = event.target.getBoundingClientRect()
    dropdown.style.top = `${rect.bottom + window.scrollY + 4}px`
    dropdown.style.left = `${rect.left + window.scrollX}px`
    dropdown.classList.toggle('abierto')
}

async function cambiarEstadoProducto(id, nuevoEstado) {
    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => d.classList.remove('abierto'))

    try {
        const response = await fetch(`${API_PRODUCTOS}/${id}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: nuevoEstado })
        })

        const data = await response.json()

        if (data.success) {
            const producto = listaProductos.find(p => p.idproducto === id)
            if (producto) producto.estado = nuevoEstado
            renderTablaProductos(listaProductos)
        }
    } catch (error) {
        console.error('Error al cambiar estado:', error)
    }
}

// ── MODAL REGISTRO ─────────────────────────────────────────
const modalProducto = document.getElementById('modalProducto')

document.getElementById('btnAbrirModalProducto').addEventListener('click', () => {
    modalProducto.style.display = 'flex'
})

document.getElementById('btnCerrarModalProducto').addEventListener('click', cerrarModalProducto)
document.getElementById('btnCancelarModalProducto').addEventListener('click', cerrarModalProducto)

modalProducto.addEventListener('click', (e) => {
    if (e.target === modalProducto) cerrarModalProducto()
})

function cerrarModalProducto() {
    modalProducto.style.display = 'none'
    document.getElementById('formNuevoProducto').reset()
    ocultarMensajeProducto('mensajeProducto')
}

document.getElementById('formNuevoProducto').addEventListener('submit', async (e) => {
    e.preventDefault()

    const nombreProducto = document.getElementById('nombreProducto').value.trim()
    const descripcionProducto = document.getElementById('descripcionProducto').value.trim()
    const categoriaProducto = document.getElementById('categoriaProducto').value
    const precioProducto = document.getElementById('precioProducto').value

    try {
        const response = await fetch(API_PRODUCTOS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nombreProducto,
                descripcionProducto,
                categoria: categoriaProducto,
                precioBase: precioProducto
            })
        })

        const data = await response.json()

        if (data.success) {
            mostrarMensajeProducto('mensajeProducto', 'Producto registrado exitosamente', 'success')
            await cargarProductos()
            setTimeout(() => cerrarModalProducto(), 1500)
        } else {
            mostrarMensajeProducto('mensajeProducto', data.message || 'Error al registrar', 'error')
        }
    } catch (error) {
        mostrarMensajeProducto('mensajeProducto', 'No se pudo conectar con el servidor', 'error')
    }
})

// ── MODAL EDITAR ───────────────────────────────────────────
const modalEditarProducto = document.getElementById('modalEditarProducto')

function abrirModalEditarProducto(id) {
    const producto = listaProductos.find(p => p.idproducto === id)
    if (!producto) return

    document.getElementById('editIdProducto').value = producto.idproducto
    document.getElementById('editNombreProducto').value = producto.nombreproducto
    document.getElementById('editDescripcionProducto').value = producto.descripcionproducto || ''
    document.getElementById('editCategoriaProducto').value = producto.categoria
    document.getElementById('editPrecioProducto').value = producto.preciobase

    modalEditarProducto.style.display = 'flex'
}

document.getElementById('btnCerrarModalEditarProducto').addEventListener('click', cerrarModalEditarProducto)
document.getElementById('btnCancelarModalEditarProducto').addEventListener('click', cerrarModalEditarProducto)

modalEditarProducto.addEventListener('click', (e) => {
    if (e.target === modalEditarProducto) cerrarModalEditarProducto()
})

function cerrarModalEditarProducto() {
    modalEditarProducto.style.display = 'none'
    document.getElementById('formEditarProducto').reset()
    ocultarMensajeProducto('mensajeEditarProducto')
}

document.getElementById('formEditarProducto').addEventListener('submit', async (e) => {
    e.preventDefault()

    const id = document.getElementById('editIdProducto').value
    const nombreProducto = document.getElementById('editNombreProducto').value.trim()
    const descripcionProducto = document.getElementById('editDescripcionProducto').value.trim()
    const categoriaProducto = document.getElementById('editCategoriaProducto').value
    const precioProducto = document.getElementById('editPrecioProducto').value

    try {
        const response = await fetch(`${API_PRODUCTOS}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nombreProducto,
                descripcionProducto,
                categoria: categoriaProducto,
                precioBase: precioProducto
            })
        })

        const data = await response.json()

        if (data.success) {
            mostrarMensajeProducto('mensajeEditarProducto', 'Producto actualizado exitosamente', 'success')
            await cargarProductos()
            setTimeout(() => cerrarModalEditarProducto(), 1500)
        } else {
            mostrarMensajeProducto('mensajeEditarProducto', data.message || 'Error al actualizar', 'error')
        }
    } catch (error) {
        mostrarMensajeProducto('mensajeEditarProducto', 'No se pudo conectar con el servidor', 'error')
    }
})

// ── HELPERS ────────────────────────────────────────────────
function mostrarMensajeProducto(elementId, texto, tipo) {
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

function ocultarMensajeProducto(elementId) {
    const el = document.getElementById(elementId)
    el.textContent = ''
    el.style.display = 'none'
}