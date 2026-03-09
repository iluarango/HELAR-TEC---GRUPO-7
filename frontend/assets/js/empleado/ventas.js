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
            <td>$${parseFloat(v.totalventas).toLocaleString('es-CO')}</td>
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
async function verDetallesVenta(id) {
    try {
        const data = await apiFetch(`/ventas/${id}`)
        if (!data.success) { alert('Error al obtener detalles'); return }

        const v = data.venta
        const detalles = v.detalles.map(d =>
            `- ${d.nombreproducto} x${d.cantidad}: $${parseFloat(d.subtotal).toLocaleString('es-CO')}${d.adicionales ? ` | ${d.adicionales}` : ''}`
        ).join('\n')

        alert(`Venta #${v.idventa}
Pedido: #${v.idpedido}
Fecha: ${new Date(v.fechaventa).toLocaleDateString('es-CO')}
Empleado: ${v.nombreusuario}
Total: $${parseFloat(v.totalventas).toLocaleString('es-CO')}

Productos:
${detalles}`)
    } catch (error) {
        console.error('Error:', error)
    }
}

// ── MODAL FACTURA ─────────────────────────────────────────────
const modalFactura = document.getElementById('modalFactura')

function abrirModalFactura(idVenta) {
    document.getElementById('idVentaFactura').value = idVenta
    document.getElementById('formFactura').reset()
    document.getElementById('idVentaFactura').value = idVenta
    ocultarMensaje('mensajeFactura')
    document.getElementById('tituloModalFactura').textContent = `Generar Factura - Venta #${idVenta}`
    modalFactura.style.display = 'flex'
}

function cerrarModalFactura() {
    modalFactura.style.display = 'none'
    document.getElementById('formFactura').reset()
    ocultarMensaje('mensajeFactura')
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
