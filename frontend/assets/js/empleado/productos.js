// ── LISTA EN MEMORIA ───────────────────────────────────────
let listaProductos = []

// ── PESTAÑAS ───────────────────────────────────────────────
/** Cambia la pestaña activa en la sección de productos y dispara la carga correspondiente */
function cambiarPestana(pestana) {
    document.getElementById('pestanaProductos').classList.toggle('activa', pestana === 'productos')
    document.getElementById('pestanaCategorias').classList.toggle('activa', pestana === 'categorias')
    document.getElementById('pestanaSabores').classList.toggle('activa', pestana === 'sabores')
    document.getElementById('pestanaAdicionales').classList.toggle('activa', pestana === 'adicionales')

    document.getElementById('panelProductos').style.display = pestana === 'productos' ? 'block' : 'none'
    document.getElementById('panelCategorias').style.display = pestana === 'categorias' ? 'block' : 'none'
    document.getElementById('panelSabores').style.display = pestana === 'sabores' ? 'block' : 'none'
    document.getElementById('panelAdicionales').style.display = pestana === 'adicionales' ? 'block' : 'none'

    document.getElementById('btnAbrirModalProducto').style.display = pestana === 'productos' ? '' : 'none'
    document.getElementById('btnAbrirModalCategoria').style.display = pestana === 'categorias' ? '' : 'none'
    document.getElementById('btnAbrirModalSabor').style.display = pestana === 'sabores' ? '' : 'none'
    document.getElementById('btnAbrirModalAdicional').style.display = pestana === 'adicionales' ? '' : 'none'

    if (pestana === 'categorias') cargarCategorias()
    if (pestana === 'sabores') cargarSabores()
    if (pestana === 'adicionales') cargarAdicionales()
}

// ── CARGAR PRODUCTOS ───────────────────────────────────────
async function cargarProductos() {
    const tbody = document.getElementById('cuerpoTablaProductos')

    try {
        const data = await apiFetch('/productos')

        if (data.success) {
            listaProductos = data.productos
            renderTablaProductos(listaProductos)
        } else {
            tbody.innerHTML = mensajeFilaTabla('Error al cargar productos', 6)
        }
    } catch (error) {
        tbody.innerHTML = mensajeFilaTabla('No se pudo conectar con el servidor', 6)
    }
}

// ── RENDER TABLA ───────────────────────────────────────────
function renderTablaProductos(productos) {
    const tbody = document.getElementById('cuerpoTablaProductos')

    if (productos.length === 0) {
        tbody.innerHTML = mensajeFilaTabla('No hay productos registrados', 6)
        return
    }

    tbody.innerHTML = productos.map(p => `
        <tr>
            <td>${p.nombreproducto}</td>
            <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                ${p.descripcionproducto || '<span style="color:#ccc">Sin descripción</span>'}
            </td>
            <td>${p.nombrecategoria}</td>
            <td>$${parseFloat(p.preciobase).toLocaleString('es-CO')}</td>
            <td>
                <div class="estado-dropdown-wrapper">
                    <span class="badge-clickeable ${p.estado === 'activo' ? 'estado-disponible' : 'estado-bajo'}"
                        onclick="toggleDropdownEstadoProducto(${p.idproducto}, event)">
                        ${p.estado} <i class="fas fa-chevron-down" style="font-size:9px;"></i>
                    </span>
                    <div class="estado-dropdown" id="dropdown-producto-${p.idproducto}">
                        <div class="estado-opcion" onclick="cambiarEstadoProducto(${p.idproducto}, 'activo')">activo</div>
                        <div class="estado-opcion" onclick="cambiarEstadoProducto(${p.idproducto}, 'inactivo')">inactivo</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="botones-accion">
                    <button class="boton-accion" title="Editar" onclick="abrirModalProducto(${p.idproducto})">
                        <i class="fas fa-pen"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('')
}

// ── BÚSQUEDA ───────────────────────────────────────────────
document.getElementById('inputBusquedaProducto').addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase().trim()
    const filtrados = listaProductos.filter(p =>
        p.nombreproducto.toLowerCase().includes(termino) ||
        p.nombrecategoria.toLowerCase().includes(termino)
    )
    renderTablaProductos(filtrados)
})

// ── DROPDOWN ESTADO ────────────────────────────────────────
function toggleDropdownEstadoProducto(id, event) {
    event.stopPropagation()
    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => d.classList.remove('abierto'))
    const dropdown = document.getElementById(`dropdown-producto-${id}`)
    const badge = event.currentTarget || event.target.closest('.badge-clickeable') || event.target
    const rect = badge.getBoundingClientRect()
    dropdown.style.top = `${rect.top}px`
    dropdown.style.left = `${rect.right + 8}px`
    dropdown.classList.toggle('abierto')
}

async function cambiarEstadoProducto(id, nuevoEstado) {
    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => d.classList.remove('abierto'))

    try {
        const data = await apiFetch(`/productos/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        })
        if (data.success) {
            const producto = listaProductos.find(p => p.idproducto === id)
            if (producto) producto.estado = nuevoEstado
            renderTablaProductos(listaProductos)
        }
    } catch (error) {
        console.error('Error al cambiar estado:', error)
    }
}

// ── MODAL UNIFICADO ────────────────────────────────────────
const modalProducto = document.getElementById('modalProducto')

async function abrirModalProducto(id = null) {
    const titulo = document.getElementById('tituloModalProducto')
    const btnSubmit = document.getElementById('btnSubmitProducto')

    document.getElementById('formProducto').reset()
    document.getElementById('idProductoEditar').value = ''
    ocultarMensaje('mensajeProducto')

    await cargarCategoriasSelector()

    if (id) {
        const producto = listaProductos.find(p => p.idproducto === id)
        if (!producto) return

        titulo.textContent = 'Editar Producto'
        btnSubmit.textContent = 'Guardar cambios'

        document.getElementById('idProductoEditar').value = producto.idproducto
        document.getElementById('nombreProducto').value = producto.nombreproducto
        document.getElementById('descripcionProducto').value = producto.descripcionproducto || ''
        document.getElementById('categoriaProducto').value = producto.idcategoria
        document.getElementById('precioProducto').value = producto.preciobase
    } else {
        titulo.textContent = 'Registrar Producto'
        btnSubmit.textContent = 'Registrar'
    }

    modalProducto.style.display = 'flex'
}

/** Rellena el select de categorías del modal de producto con las categorías activas */
async function cargarCategoriasSelector() {
    try {
        const data = await apiFetch('/categorias')
        const select = document.getElementById('categoriaProducto')
        select.innerHTML = '<option value="" disabled selected>Selecciona categoría</option>'
        data.categorias
            .filter(c => c.estado === 'activo')
            .forEach(c => {
                select.innerHTML += `<option value="${c.idcategoria}">${c.nombrecategoria}</option>`
            })
    } catch (error) {
        console.error('Error al cargar categorías:', error)
    }
}

document.getElementById('btnAbrirModalProducto').addEventListener('click', () => abrirModalProducto())
document.getElementById('btnCerrarModalProducto').addEventListener('click', cerrarModalProducto)
document.getElementById('btnCancelarModalProducto').addEventListener('click', cerrarModalProducto)
modalProducto.addEventListener('click', (e) => { if (e.target === modalProducto) cerrarModalProducto() })

function cerrarModalProducto() {
    modalProducto.style.display = 'none'
    document.getElementById('formProducto').reset()
    ocultarMensaje('mensajeProducto')
}

// ── SUBMIT FORM ────────────────────────────────────────────
document.getElementById('formProducto').addEventListener('submit', async (e) => {
    e.preventDefault()

    const id = document.getElementById('idProductoEditar').value
    const body = {
        nombreProducto: document.getElementById('nombreProducto').value.trim(),
        descripcionProducto: document.getElementById('descripcionProducto').value.trim(),
        idCategoria: document.getElementById('categoriaProducto').value,
        precioBase: document.getElementById('precioProducto').value
    }

    const url = id ? `/productos/${id}` : '/productos'
    const method = id ? 'PUT' : 'POST'

    try {
        const data = await apiFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        if (data.success) {
            mostrarMensaje('mensajeProducto', id ? 'Producto actualizado exitosamente' : 'Producto registrado exitosamente', 'success')
            await cargarProductos()
            setTimeout(() => cerrarModalProducto(), 1500)
        } else {
            mostrarMensaje('mensajeProducto', data.message || 'Error al guardar', 'error')
        }
    } catch (error) {
        mostrarMensaje('mensajeProducto', 'No se pudo conectar con el servidor', 'error')
    }
})
