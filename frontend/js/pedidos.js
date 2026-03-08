const API_PEDIDOS = 'http://localhost:3000/api/pedidos'
const API_PRODUCTOS_PEDIDO = 'http://localhost:3000/api/productos'

// ── LISTA EN MEMORIA ───────────────────────────────────────
let listaPedidos = []
let detallesPedido = []

// ── CARGAR PEDIDOS ─────────────────────────────────────────
async function cargarPedidos() {
    const tbody = document.getElementById('cuerpoTablaPedidos')

    try {
        const response = await fetch(API_PEDIDOS, {
            headers: { 'Authorization': `Bearer ${token}` }
        })

        const data = await response.json()

        if (data.success) {
            listaPedidos = data.pedidos
            renderTablaPedidos(listaPedidos)
        } else {
            tbody.innerHTML = mensajeFilaPedido('Error al cargar pedidos', 6)
        }
    } catch (error) {
        tbody.innerHTML = mensajeFilaPedido('No se pudo conectar con el servidor', 6)
    }
}

// ── RENDER TABLA ───────────────────────────────────────────
function renderTablaPedidos(pedidos) {
    const tbody = document.getElementById('cuerpoTablaPedidos')

    if (pedidos.length === 0) {
        tbody.innerHTML = mensajeFilaPedido('No hay pedidos registrados', 6)
        return
    }

    tbody.innerHTML = pedidos.map(p => {
        const total = p.detalles.reduce((acc, d) => acc + parseFloat(d.subtotal), 0)
        const esPendiente = p.estadopedido === 'pendiente'

        return `
            <tr>
                <td>#${p.idpedido}</td>
                <td>${new Date(p.fechapedido).toLocaleDateString('es-CO')}</td>
                <td>${p.nombreusuario}</td>
                <td>$${total.toLocaleString('es-CO')}</td>
                <td>
                    <span class="${esPendiente ? 'estado-pendiente' : 'estado-completado'}">
                        ${p.estadopedido}
                    </span>
                </td>
                <td>
                    <div class="botones-accion">
                        <button class="boton-accion" title="Ver detalles" onclick="verDetallesPedido(${p.idpedido})">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${esPendiente ? `
                        <button class="boton-accion" title="Marcar como entregado" onclick="marcarEntregado(${p.idpedido})" style="color: #065f46;">
                            <i class="fas fa-check"></i>
                        </button>` : ''}
                    </div>
                </td>
            </tr>
        `
    }).join('')
}

function mensajeFilaPedido(texto, colspan) {
    return `
        <tr>
            <td colspan="${colspan}" style="text-align: center; padding: 40px; color: #999;">
                ${texto}
            </td>
        </tr>
    `
}

// ── BÚSQUEDA ───────────────────────────────────────────────
document.getElementById('inputBusquedaPedido').addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase().trim()

    const filtrados = listaPedidos.filter(p =>
        p.idpedido.toString().includes(termino) ||
        p.estadopedido.toLowerCase().includes(termino) ||
        p.nombreusuario.toLowerCase().includes(termino)
    )

    renderTablaPedidos(filtrados)
})

// ── MARCAR COMO ENTREGADO ──────────────────────────────────
async function marcarEntregado(id) {
    if (!confirm('¿Confirmas que el pedido fue entregado al cliente?')) return

    try {
        const response = await fetch(`${API_PEDIDOS}/${id}/entregar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        const data = await response.json()

        if (data.success) {
            await cargarPedidos()
        } else {
            alert(data.message || 'Error al actualizar el pedido')
        }
    } catch (error) {
        alert('No se pudo conectar con el servidor')
    }
}

// ── VER DETALLES ───────────────────────────────────────────
function verDetallesPedido(id) {
    const pedido = listaPedidos.find(p => p.idpedido === id)
    if (!pedido) return

    const total = pedido.detalles.reduce((acc, d) => acc + parseFloat(d.subtotal), 0)

    const info = `
Pedido #${pedido.idpedido}
Fecha: ${new Date(pedido.fechapedido).toLocaleDateString('es-CO')}
Empleado: ${pedido.nombreusuario}
Estado: ${pedido.estadopedido}

Productos:
${pedido.detalles.map(d => {
    let linea = `- ${d.nombreproducto} x${d.cantidad} = $${parseFloat(d.subtotal).toLocaleString('es-CO')}`
    if (d.toppings) linea += `\n  Toppings: ${d.toppings}`
    if (d.adicionales) linea += `\n  Adicionales: ${d.adicionales} (+$${parseFloat(d.precioadicionales).toLocaleString('es-CO')})`
    return linea
}).join('\n')}

Total: $${total.toLocaleString('es-CO')}
    `
    alert(info)
}

// ── MODAL REGISTRO ─────────────────────────────────────────
const modalPedido = document.getElementById('modalPedido')

document.getElementById('btnAbrirModalPedido').addEventListener('click', async () => {
    await cargarSelectoresProductos()
    detallesPedido = []
    renderDetallesPedido()
    modalPedido.style.display = 'flex'
})

document.getElementById('btnCerrarModalPedido').addEventListener('click', cerrarModalPedido)
document.getElementById('btnCancelarModalPedido').addEventListener('click', cerrarModalPedido)

modalPedido.addEventListener('click', (e) => {
    if (e.target === modalPedido) cerrarModalPedido()
})

function cerrarModalPedido() {
    modalPedido.style.display = 'none'
    document.getElementById('formNuevoPedido').reset()
    detallesPedido = []
    renderDetallesPedido()
    ocultarMensajePedido('mensajePedido')
    document.getElementById('btnRegistrarPedido').disabled = true
}

// Cargar productos activos en el selector
async function cargarSelectoresProductos() {
    try {
        const response = await fetch(API_PRODUCTOS_PEDIDO, {
            headers: { 'Authorization': `Bearer ${token}` }
        })

        const data = await response.json()

        const select = document.getElementById('detalleProducto')
        select.innerHTML = '<option value="" disabled selected>Selecciona un producto</option>'

        // Agrupar por categoría
        const categorias = {}
        data.productos
            .filter(p => p.estado === 'activo')
            .forEach(p => {
                if (!categorias[p.categoria]) categorias[p.categoria] = []
                categorias[p.categoria].push(p)
            })

        Object.entries(categorias).forEach(([categoria, productos]) => {
            const optgroup = document.createElement('optgroup')
            optgroup.label = categoria
            productos.forEach(p => {
                optgroup.innerHTML += `<option value="${p.idproducto}" data-precio="${p.preciobase}">${p.nombreproducto} - $${parseFloat(p.preciobase).toLocaleString('es-CO')}</option>`
            })
            select.appendChild(optgroup)
        })
    } catch (error) {
        console.error('Error al cargar productos:', error)
    }
}

// ── AGREGAR DETALLE ────────────────────────────────────────
function agregarDetallePedido() {
    const selectProducto = document.getElementById('detalleProducto')
    const cantidad = parseInt(document.getElementById('detalleCantidadPedido').value)
    const toppings = document.getElementById('detalleToppings').value.trim()
    const adicionales = document.getElementById('detalleAdicionales').value.trim()
    const precioAdicionales = parseFloat(document.getElementById('detallePrecioAdicionales').value) || 0

    if (!selectProducto.value || !cantidad) {
        alert('Selecciona un producto y una cantidad')
        return
    }

    const idProducto = parseInt(selectProducto.value)
    const nombreProducto = selectProducto.options[selectProducto.selectedIndex].text
    const precio = parseFloat(selectProducto.options[selectProducto.selectedIndex].dataset.precio)

    detallesPedido.push({ idProducto, nombreProducto, cantidad, precio, toppings, adicionales, precioAdicionales })

    // Limpiar campos
    selectProducto.value = ''
    document.getElementById('detalleCantidadPedido').value = 1
    document.getElementById('detalleToppings').value = ''
    document.getElementById('detalleAdicionales').value = ''
    document.getElementById('detallePrecioAdicionales').value = ''

    renderDetallesPedido()
}

// Renderiza la tabla de detalles dentro del modal
function renderDetallesPedido() {
    const tbody = document.getElementById('tablaDetallesPedido')
    const btnRegistrar = document.getElementById('btnRegistrarPedido')

    if (detallesPedido.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: #999;">Sin productos agregados</td></tr>`
        btnRegistrar.disabled = true
        document.getElementById('totalPedido').textContent = '$0.00'
        return
    }

    let total = 0

    tbody.innerHTML = detallesPedido.map((d, index) => {
        const subtotal = (d.precio * d.cantidad) + d.precioAdicionales
        total += subtotal

        return `
            <tr>
                <td style="padding: 10px;">${d.nombreProducto}</td>
                <td style="padding: 10px;">${d.cantidad}</td>
                <td style="padding: 10px;">${d.toppings || '<span style="color:#ccc">-</span>'}</td>
                <td style="padding: 10px;">${d.adicionales || '<span style="color:#ccc">-</span>'}${d.precioAdicionales > 0 ? ` <span style="color:#a47c7c">(+$${d.precioAdicionales.toLocaleString('es-CO')})</span>` : ''}</td>
                <td style="padding: 10px;">$${subtotal.toLocaleString('es-CO')}</td>
                <td style="padding: 10px;">
                    <button type="button" onclick="eliminarDetallePedido(${index})" style="background:none; border:none; color:#d9534f; cursor:pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `
    }).join('')

    document.getElementById('totalPedido').textContent = `$${total.toLocaleString('es-CO')}`
    btnRegistrar.disabled = false
}

function eliminarDetallePedido(index) {
    detallesPedido.splice(index, 1)
    renderDetallesPedido()
}

// ── REGISTRAR PEDIDO ───────────────────────────────────────
document.getElementById('formNuevoPedido').addEventListener('submit', async (e) => {
    e.preventDefault()

    if (detallesPedido.length === 0) {
        mostrarMensajePedido('mensajePedido', 'Agrega al menos un producto', 'error')
        return
    }

    const btnRegistrar = document.getElementById('btnRegistrarPedido')
    btnRegistrar.disabled = true
    btnRegistrar.textContent = 'Registrando...'

    try {
        const response = await fetch(API_PEDIDOS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ detalles: detallesPedido })
        })

        const data = await response.json()

        if (data.success) {
            mostrarMensajePedido('mensajePedido', 'Pedido registrado exitosamente', 'success')
            await cargarPedidos()
            setTimeout(() => cerrarModalPedido(), 1500)
        } else {
            mostrarMensajePedido('mensajePedido', data.message || 'Error al registrar', 'error')
        }
    } catch (error) {
        mostrarMensajePedido('mensajePedido', 'No se pudo conectar con el servidor', 'error')
    } finally {
        btnRegistrar.disabled = false
        btnRegistrar.textContent = 'Registrar pedido'
    }
})

// ── HELPERS ────────────────────────────────────────────────
function mostrarMensajePedido(elementId, texto, tipo) {
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

function ocultarMensajePedido(elementId) {
    const el = document.getElementById(elementId)
    el.textContent = ''
    el.style.display = 'none'
}