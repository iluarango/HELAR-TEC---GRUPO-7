// ── LISTA EN MEMORIA ──────────────────────────────────────────
let listaVentas = []

// ── CARGAR VENTAS ─────────────────────────────────────────────
async function cargarVentas() {
    const tbody = document.getElementById('cuerpoTablaVentas')

    try {
        const data = await apiFetch('/ventas')

        if (data.success) {
            listaVentas = data.ventas
            renderTablaVentas(listaVentas)
        } else {
            tbody.innerHTML = mensajeFilaTabla('Error al cargar ventas', 5)
        }
    } catch (error) {
        tbody.innerHTML = mensajeFilaTabla('No se pudo conectar con el servidor', 5)
    }
}

// ── RENDER TABLA ──────────────────────────────────────────────
function renderTablaVentas(ventas) {
    const tbody = document.getElementById('cuerpoTablaVentas')

    if (ventas.length === 0) {
        tbody.innerHTML = mensajeFilaTabla('No hay ventas registradas', 5)
        return
    }

    tbody.innerHTML = ventas.map(v => `
        <tr>
            <td>#${v.idventa}</td>
            <td>${new Date(v.fechaventa).toLocaleDateString('es-CO')}</td>
            <td>#${v.idpedido}</td>
            <td>$${parseFloat(v.totalventa).toLocaleString('es-CO')}</td>
            <td>
                <div class="botones-accion">
                    <button class="boton-accion" title="Ver detalles" onclick="verDetallesVenta(${v.idventa})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${!v.tiene_factura ? `
                    <button class="boton-accion" title="Generar factura" onclick="abrirModalFactura(${v.idventa})">
                        <i class="fas fa-file-invoice"></i>
                    </button>` : `
                    <span style="font-size:12px; color:#6b7280; padding: 0 8px;">Facturado</span>`}
                </div>
            </td>
        </tr>
    `).join('')
}

// ── BÚSQUEDA ──────────────────────────────────────────────────
document.getElementById('inputBusquedaVenta').addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase().trim()
    const filtrados = listaVentas.filter(v =>
        v.idventa.toString().includes(termino) ||
        v.idpedido.toString().includes(termino)
    )
    renderTablaVentas(filtrados)
})

// ── VER DETALLES ──────────────────────────────────────────────
/** Consulta la API por el id de venta y muestra el modal de detalles con líneas de producto */
async function verDetallesVenta(id) {
    try {
        const data = await apiFetch(`/ventas/${id}`)
        if (!data.success) { alert('Error al obtener detalles'); return }

        const v = data.venta

        document.getElementById('tituloDetallesVenta').textContent = `Venta #${v.idventa}`
        document.getElementById('infoDetallesVenta').innerHTML =
            `Fecha: ${new Date(v.fechaventa).toLocaleDateString('es-CO')} &nbsp;|&nbsp;
             Pedido: #${v.idpedido} &nbsp;|&nbsp;
             Empleado: <strong>${v.nombreusuario}</strong>`

        const tbody = document.getElementById('cuerpoDetallesVenta')
        tbody.innerHTML = v.detalles.map(d => `
            <tr>
                <td>${d.nombreproducto}</td>
                <td>${d.cantidad}</td>
                <td>$${parseFloat(d.subtotal).toLocaleString('es-CO')}</td>
            </tr>`
        ).join('')

        document.getElementById('totalDetallesVenta').textContent =
            `$${parseFloat(v.totalventa).toLocaleString('es-CO')}`

        document.getElementById('modalDetallesVenta').style.display = 'flex'
    } catch (error) {
        console.error('Error:', error)
    }
}

document.getElementById('btnCerrarDetallesVenta').addEventListener('click', () => {
    document.getElementById('modalDetallesVenta').style.display = 'none'
})
document.getElementById('modalDetallesVenta').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalDetallesVenta'))
        document.getElementById('modalDetallesVenta').style.display = 'none'
})

// ── MODAL FACTURA ─────────────────────────────────────────────
const modalFactura = document.getElementById('modalFactura')
let totalVentaActual = 0

/** Abre el modal de factura, precarga la dirección por defecto y carga el total de la venta */
async function abrirModalFactura(idVenta) {
    document.getElementById('formFactura').reset()
    document.getElementById('idVentaFactura').value = idVenta
    document.getElementById('direccionFactura').value = 'CR 34 CL 116 E - 7'
    document.getElementById('calculadorCambio').style.display = 'none'
    document.getElementById('valorCambio').textContent = '$0'
    ocultarMensaje('mensajeFactura')
    document.getElementById('tituloModalFactura').textContent = `Generar Factura - Venta #${idVenta}`

    // Cargar total de la venta para el calculador
    try {
        const data = await apiFetch(`/ventas/${idVenta}`)
        if (data.success) {
            totalVentaActual = parseFloat(data.venta.totalventa)
            document.getElementById('totalAPagar').textContent = `$${totalVentaActual.toLocaleString('es-CO')}`
        }
    } catch { totalVentaActual = 0 }

    modalFactura.style.display = 'flex'
}

function cerrarModalFactura() {
    modalFactura.style.display = 'none'
    document.getElementById('formFactura').reset()
    document.getElementById('calculadorCambio').style.display = 'none'
    ocultarMensaje('mensajeFactura')
    totalVentaActual = 0
}

// Mostrar calculador solo si es efectivo
document.getElementById('metodoPago').addEventListener('change', (e) => {
    const calculador = document.getElementById('calculadorCambio')
    if (e.target.value === 'efectivo') {
        calculador.style.display = 'block'
        document.getElementById('montoRecibido').value = ''
        document.getElementById('valorCambio').textContent = '$0'
    } else {
        calculador.style.display = 'none'
    }
})

/** Calcula el cambio a devolver en efectivo según el monto recibido y el total de la venta */
function calcularCambio() {
    const recibido = parseFloat(document.getElementById('montoRecibido').value) || 0
    const cambio = recibido - totalVentaActual
    const el = document.getElementById('valorCambio')
    if (cambio < 0) {
        el.textContent = `Faltan $${Math.abs(cambio).toLocaleString('es-CO')}`
        el.style.color = '#ef4444'
    } else {
        el.textContent = `$${cambio.toLocaleString('es-CO')}`
        el.style.color = '#10b981'
    }
}

document.getElementById('btnCerrarModalFactura').addEventListener('click', cerrarModalFactura)
document.getElementById('btnCancelarModalFactura').addEventListener('click', cerrarModalFactura)
modalFactura.addEventListener('click', (e) => { if (e.target === modalFactura) cerrarModalFactura() })

// ── REGISTRAR FACTURA ─────────────────────────────────────────
document.getElementById('formFactura').addEventListener('submit', async (e) => {
    e.preventDefault()

    const idVenta = document.getElementById('idVentaFactura').value
    const body = {
        idVenta: parseInt(idVenta),
        direccionFactura: document.getElementById('direccionFactura').value.trim(),
        metodoPago: document.getElementById('metodoPago').value,
        adicionales: document.getElementById('adicionalesFactura').value.trim()
    }

    const btnSubmit = document.getElementById('btnSubmitFactura')
    btnSubmit.disabled = true
    btnSubmit.textContent = 'Generando...'

    try {
        const data = await apiFetch('/facturas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        if (data.success) {
            mostrarMensaje('mensajeFactura', 'Factura generada exitosamente', 'success')
            await cargarVentas()
            setTimeout(() => cerrarModalFactura(), 1500)
        } else {
            mostrarMensaje('mensajeFactura', data.message || 'Error al generar factura', 'error')
        }
    } catch (error) {
        mostrarMensaje('mensajeFactura', 'No se pudo conectar con el servidor', 'error')
    } finally {
        btnSubmit.disabled = false
        btnSubmit.textContent = 'Generar factura'
    }
})
