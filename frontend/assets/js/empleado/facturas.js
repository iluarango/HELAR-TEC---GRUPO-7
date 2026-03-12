// ── PESTAÑAS VENTAS/FACTURAS ───────────────────────────────────
/** Alterna entre las pestañas de ventas y facturas dentro de la misma sección */
function cambiarPestanaVentas(pestana) {
    document.getElementById('pestanaVentas').classList.toggle('activa', pestana === 'ventas')
    document.getElementById('pestanaFacturas').classList.toggle('activa', pestana === 'facturas')
    document.getElementById('panelVentas').style.display = pestana === 'ventas' ? 'block' : 'none'
    document.getElementById('panelFacturas').style.display = pestana === 'facturas' ? 'block' : 'none'
    if (pestana === 'facturas') cargarFacturas()
}

// ── LISTA EN MEMORIA ───────────────────────────────────────────
let listaFacturas = []

// ── CARGAR FACTURAS ────────────────────────────────────────────
async function cargarFacturas() {
    const tbody = document.getElementById('cuerpoTablaFacturas')
    try {
        const data = await apiFetch('/facturas')
        if (data.success) {
            listaFacturas = data.facturas
            renderTablaFacturas(listaFacturas)
        } else {
            tbody.innerHTML = mensajeFilaTabla('Error al cargar facturas', 5)
        }
    } catch {
        tbody.innerHTML = mensajeFilaTabla('No se pudo conectar con el servidor', 5)
    }
}

// ── RENDER TABLA ───────────────────────────────────────────────
function renderTablaFacturas(facturas) {
    const tbody = document.getElementById('cuerpoTablaFacturas')

    if (facturas.length === 0) {
        tbody.innerHTML = mensajeFilaTabla('No hay facturas registradas', 5)
        return
    }

    tbody.innerHTML = facturas.map(f => `
        <tr>
            <td>#${f.idfactura}</td>
            <td>${new Date(f.fechafactura).toLocaleDateString('es-CO')}</td>
            <td>#${f.idventa}</td>
            <td>$${parseFloat(f.total).toLocaleString('es-CO')}</td>
            <td>
                <button class="boton-accion" title="Ver factura" onclick="verRecibo(${f.idfactura})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('')
}

// ── BÚSQUEDA FACTURAS ──────────────────────────────────────────
document.getElementById('inputBusquedaFactura').addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase().trim()
    const filtradas = listaFacturas.filter(f =>
        f.idfactura.toString().includes(termino) ||
        new Date(f.fechafactura).toLocaleDateString('es-CO').includes(termino)
    )
    renderTablaFacturas(filtradas)
})

// ── VER RECIBO ─────────────────────────────────────────────────
/** Carga los detalles de la venta asociada y muestra el recibo imprimible de la factura */
async function verRecibo(id) {
    const factura = listaFacturas.find(f => f.idfactura === id)
    if (!factura) return

    // Cargar detalles del pedido asociado a la venta
    let detalles = []
    try {
        const data = await apiFetch(`/ventas/${factura.idventa}`)
        if (data.success) detalles = data.venta.detalles
    } catch { /* si falla, recibo sin productos */ }

    document.getElementById('reciboId').textContent     = `#${factura.idfactura}`
    document.getElementById('reciboDir').textContent    = factura.direccionfactura || 'CR 34 CL 116 E - 7'
    document.getElementById('reciboFecha').textContent  = new Date(factura.fechafactura).toLocaleDateString('es-CO')
    document.getElementById('reciboEmpleado').textContent = factura.nombreusuario
    document.getElementById('reciboMetodo').textContent = factura.metodopago
    document.getElementById('reciboDireccion').textContent = factura.direccionfactura || 'CR 34 CL 116 E - 7'

    document.getElementById('reciboProductos').innerHTML = detalles.map(d => `
        <tr>
            <td style="padding:3px 0;">${d.nombreproducto}</td>
            <td style="text-align:center;">${d.cantidad}</td>
            <td style="text-align:right;">$${parseFloat(d.subtotal).toLocaleString('es-CO')}</td>
        </tr>
    `).join('')

    document.getElementById('reciboTotal').textContent = `$${parseFloat(factura.total).toLocaleString('es-CO')}`

    const obsEl = document.getElementById('reciboObservaciones')
    if (factura.adicionales) {
        obsEl.textContent = `Observaciones: ${factura.adicionales}`
        obsEl.style.display = 'block'
    } else {
        obsEl.style.display = 'none'
    }

    document.getElementById('modalReciboFactura').style.display = 'flex'
}
