// ── LISTA EN MEMORIA ───────────────────────────────────────
let listaCompras = []
let detallesCompra = [] // detalles del formulario antes de guardar

// ── CARGAR COMPRAS ─────────────────────────────────────────
async function cargarCompras() {
    const tbody = document.getElementById('cuerpoTablaCompras')

    try {
        const data = await apiFetch('/compras')

        if (data.success) {
            listaCompras = data.compras
            renderTablaCompras(listaCompras)
        } else {
            tbody.innerHTML = mensajeFilaTabla('Error al cargar compras', 6)
        }
    } catch (error) {
        tbody.innerHTML = mensajeFilaTabla('No se pudo conectar con el servidor', 6)
    }
}

// ── RENDER TABLA ───────────────────────────────────────────
function renderTablaCompras(compras) {
    const tbody = document.getElementById('cuerpoTablaCompras')

    if (compras.length === 0) {
        tbody.innerHTML = mensajeFilaTabla('No hay compras registradas', 5)
        return
    }

    tbody.innerHTML = compras.map(c => {
        return `
            <tr>
                <td>#${c.idcompra}</td>
                <td>${new Date(c.fechacompra).toLocaleDateString('es-CO')}</td>
                <td>${c.nombreproveedor}</td>
                <td>$${parseFloat(c.totalcompra).toLocaleString('es-CO')}</td>
                <td>
                    <div class="botones-accion">
                        <button class="boton-accion" title="Ver detalles" onclick="verDetallesCompra(${c.idcompra})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `
    }).join('')
}

// ── BÚSQUEDA ───────────────────────────────────────────────
document.getElementById('inputBusquedaCompra').addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase().trim()

    const filtrados = listaCompras.filter(c =>
        c.idcompra.toString().includes(termino) ||
        c.nombreproveedor.toLowerCase().includes(termino)
    )

    renderTablaCompras(filtrados)
})

// ── MODAL REGISTRO ─────────────────────────────────────────
const modalCompra = document.getElementById('modalCompra')

document.getElementById('btnAbrirModalCompra').addEventListener('click', async () => {
    await cargarSelectores()
    detallesCompra = []
    renderDetalles()
    modalCompra.style.display = 'flex'
})

document.getElementById('btnCerrarModalCompra').addEventListener('click', cerrarModalCompra)
document.getElementById('btnCancelarModalCompra').addEventListener('click', cerrarModalCompra)

modalCompra.addEventListener('click', (e) => {
    if (e.target === modalCompra) cerrarModalCompra()
})

function cerrarModalCompra() {
    modalCompra.style.display = 'none'
    document.getElementById('formNuevaCompra').reset()
    detallesCompra = []
    renderDetalles()
    ocultarMensaje('mensajeCompra')
    document.getElementById('btnRegistrarCompra').disabled = true
}

// Cargar proveedores e insumos en los selectores del modal
async function cargarSelectores() {
    try {
        const [provData, insData] = await Promise.all([
            apiFetch('/proveedores'),
            apiFetch('/insumos')
        ])

        // Llenar selector de proveedores (solo activos)
        const selectProv = document.getElementById('idProveedorCompra')
        selectProv.innerHTML = '<option value="" disabled selected>Selecciona un proveedor</option>'
        provData.proveedores
            .filter(p => p.estado === 'activo')
            .forEach(p => {
                selectProv.innerHTML += `<option value="${p.idproveedor}">${p.nombreproveedor}</option>`
            })

        // Llenar selector de insumos (solo activos)
        const selectIns = document.getElementById('detalleInsumo')
        selectIns.innerHTML = '<option value="" disabled selected>Selecciona</option>'
        insData.insumos
            .filter(i => i.estado === 'activo')
            .forEach(i => {
                selectIns.innerHTML += `<option value="${i.idinsumo}" data-unidad="${i.unidadmedida}">${i.nombreinsumo} (${i.unidadmedida})</option>`
            })
    } catch (error) {
        console.error('Error al cargar selectores:', error)
    }
}

// ── AGREGAR DETALLE ────────────────────────────────────────
function agregarDetalleCompra() {
    const selectInsumo = document.getElementById('detalleInsumo')
    const cantidad = parseFloat(document.getElementById('detalleCantidad').value)
    const precio = parseFloat(document.getElementById('detallePrecio').value)
    const fechaCaducidad = document.getElementById('fechaCaducidadDetalle').value

    if (!selectInsumo.value || !cantidad || !precio) {
        alert('Completa todos los campos del detalle')
        return
    }

    const idInsumo = parseInt(selectInsumo.value)
    const nombreInsumo = selectInsumo.options[selectInsumo.selectedIndex].text

    // Verificar si el insumo ya está en la lista
    const existente = detallesCompra.find(d => d.idInsumo === idInsumo)
    if (existente) {
        existente.cantidadCompra += cantidad
        existente.precioUnitario = precio
    } else {
        detallesCompra.push({ idInsumo, nombreInsumo, cantidadCompra: cantidad, precioUnitario: precio, fechaCaducidad })
    }

    // Limpiar campos
    selectInsumo.value = ''
    document.getElementById('detalleCantidad').value = 1
    document.getElementById('detallePrecio').value = ''
    document.getElementById('fechaCaducidadDetalle').value = ''

    renderDetalles()
}

// Renderiza la tabla de detalles dentro del modal
function renderDetalles() {
    const tbody = document.getElementById('tablaDetallesCompra')
    const btnRegistrar = document.getElementById('btnRegistrarCompra')

    if (detallesCompra.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: #999;">Sin detalles agregados</td></tr>`
        btnRegistrar.disabled = true
        document.getElementById('totalCompra').textContent = '$0.00'
        return
    }

    let total = 0

    tbody.innerHTML = detallesCompra.map((d, index) => {
        const subtotal = d.cantidadCompra * d.precioUnitario
        total += subtotal

        return `
            <tr>
                <td style="padding: 10px;">${d.nombreInsumo}</td>
                <td style="padding: 10px;">${d.cantidadCompra}</td>
                <td style="padding: 10px;">$${d.precioUnitario.toLocaleString('es-CO')}</td>
                <td style="padding: 10px;">$${subtotal.toLocaleString('es-CO')}</td>
                <td style="padding: 10px;">
                    <button type="button" onclick="eliminarDetalleCompra(${index})" style="background:none; border:none; color:#d9534f; cursor:pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `
    }).join('')

    document.getElementById('totalCompra').textContent = `$${total.toLocaleString('es-CO')}`
    btnRegistrar.disabled = false
}

function eliminarDetalleCompra(index) {
    detallesCompra.splice(index, 1)
    renderDetalles()
}

// ── REGISTRAR COMPRA ───────────────────────────────────────
document.getElementById('formNuevaCompra').addEventListener('submit', async (e) => {
    e.preventDefault()

    const idProveedor = document.getElementById('idProveedorCompra').value
    const fechaCompra = document.getElementById('fechaCompra').value

    if (!idProveedor) {
        mostrarMensaje('mensajeCompra', 'Selecciona un proveedor', 'error')
        return
    }

    if (detallesCompra.length === 0) {
        mostrarMensaje('mensajeCompra', 'Agrega al menos un insumo', 'error')
        return
    }

    const btnRegistrar = document.getElementById('btnRegistrarCompra')
    btnRegistrar.disabled = true
    btnRegistrar.textContent = 'Registrando...'

    try {
        const data = await apiFetch('/compras', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idProveedor, fechaCompra, detalles: detallesCompra })
        })

        if (data.success) {
            mostrarMensaje('mensajeCompra', 'Compra registrada exitosamente', 'success')
            await cargarCompras()
            setTimeout(() => cerrarModalCompra(), 1500)
        } else {
            mostrarMensaje('mensajeCompra', data.message || 'Error al registrar', 'error')
        }
    } catch (error) {
        mostrarMensaje('mensajeCompra', 'No se pudo conectar con el servidor', 'error')
    } finally {
        btnRegistrar.disabled = false
        btnRegistrar.textContent = 'Registrar compra'
    }
})

// ── VER DETALLES ───────────────────────────────────────────
function verDetallesCompra(id) {
    const compra = listaCompras.find(c => c.idcompra === id)
    if (!compra) return

    document.getElementById('tituloDetallesCompra').textContent = `Compra #${compra.idcompra}`
    document.getElementById('infoDetallesCompra').innerHTML =
        `Proveedor: <strong>${compra.nombreproveedor}</strong> &nbsp;|&nbsp;
         Fecha: ${new Date(compra.fechacompra).toLocaleDateString('es-CO')}`

    document.getElementById('cuerpoDetallesCompra').innerHTML = compra.detalles.map(d => `
        <tr>
            <td>${d.nombreinsumo}</td>
            <td>${parseFloat(d.cantidadcompra).toLocaleString('es-CO')} ${d.unidadmedida}</td>
            <td>$${parseFloat(d.preciounitario).toLocaleString('es-CO')}</td>
            <td>$${parseFloat(d.subtotal).toLocaleString('es-CO')}</td>
            <td>${d.fechacaducidad ? new Date(d.fechacaducidad).toLocaleDateString('es-CO') : '-'}</td>
        </tr>`).join('')

    document.getElementById('totalDetallesCompra').textContent =
        `$${parseFloat(compra.totalcompra || 0).toLocaleString('es-CO')}`

    document.getElementById('modalDetallesCompra').style.display = 'flex'
}

document.getElementById('btnCerrarDetallesCompra').addEventListener('click', () => {
    document.getElementById('modalDetallesCompra').style.display = 'none'
})
document.getElementById('modalDetallesCompra').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalDetallesCompra'))
        document.getElementById('modalDetallesCompra').style.display = 'none'
})
