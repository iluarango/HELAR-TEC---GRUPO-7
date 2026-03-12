// ── LISTA EN MEMORIA ──────────────────────────────────────────
let listaPedidos = [];

// ── CARGAR PEDIDOS ────────────────────────────────────────────
async function cargarPedidos() {
    const tbody = document.getElementById("cuerpoTablaPedidos");
    try {
        const data = await apiFetch('/pedidos');
        if (data.success) {
            listaPedidos = data.pedidos;
            renderTablaPedidos(listaPedidos);
        } else {
            tbody.innerHTML = mensajeFilaTabla("Error al cargar pedidos", 6);
        }
    } catch (error) {
        tbody.innerHTML = mensajeFilaTabla("No se pudo conectar con el servidor", 6);
    }
}

// ── RENDER TABLA ──────────────────────────────────────────────
function renderTablaPedidos(pedidos) {
    const tbody = document.getElementById("cuerpoTablaPedidos");
    if (pedidos.length === 0) {
        tbody.innerHTML = mensajeFilaTabla("No hay pedidos registrados", 6);
        return;
    }
    tbody.innerHTML = pedidos.map(p => {
        const fecha = new Date(p.fechapedido).toLocaleDateString("es-CO");
        const total = parseFloat(p.totalventa || 0).toLocaleString("es-CO");
        const esEntregado = p.estadopedido === "entregado";
        const esCancelado = p.estadopedido === "cancelado";
        const esPendiente = !esEntregado && !esCancelado;
        const claseEstado = esEntregado ? 'estado-disponible' : esCancelado ? 'estado-cancelado' : 'estado-pendiente';
        return `
            <tr>
                <td>#${p.idpedido}</td>
                <td>${fecha}</td>
                <td>${p.nombreusuario}</td>
                <td>$${total}</td>
                <td>
                    <span class="badge-estado ${claseEstado}">
                        ${p.estadopedido}
                    </span>
                </td>
                <td>
                    <div class="botones-accion">
                        ${esPendiente ? `
                        <button class="boton-accion" title="Marcar entregado"
                            onclick="abrirConfirmarEntrega(${p.idpedido})">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="boton-accion boton-cancelar-pedido" title="Cancelar pedido"
                            onclick="abrirCancelarPedido(${p.idpedido})">
                            <i class="fas fa-times"></i>
                        </button>` : ""}
                        <button class="boton-accion" title="Ver detalles"
                            onclick="verDetallesPedido(${p.idpedido})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// ── BÚSQUEDA ──────────────────────────────────────────────────
document.getElementById("inputBusquedaPedido").addEventListener("input", (e) => {
    const termino = e.target.value.toLowerCase().trim();
    const filtrados = listaPedidos.filter(p =>
        String(p.idpedido).includes(termino) ||
        p.estadopedido.toLowerCase().includes(termino) ||
        p.nombreusuario.toLowerCase().includes(termino)
    );
    renderTablaPedidos(filtrados);
});

// ── MODALES CONFIRMAR ENTREGA / CANCELAR ──────────────────────
let _idPedidoAccion = null

function abrirConfirmarEntrega(id) {
    _idPedidoAccion = id
    document.getElementById('modalConfirmarEntrega').style.display = 'flex'
}

function cerrarConfirmarEntrega() {
    _idPedidoAccion = null
    document.getElementById('modalConfirmarEntrega').style.display = 'none'
}

function abrirCancelarPedido(id) {
    _idPedidoAccion = id
    document.getElementById('modalCancelarPedido').style.display = 'flex'
}

function cerrarCancelarPedido() {
    _idPedidoAccion = null
    document.getElementById('modalCancelarPedido').style.display = 'none'
}

document.getElementById('btnConfirmarEntrega').addEventListener('click', async () => {
    if (!_idPedidoAccion) return
    const id = _idPedidoAccion
    cerrarConfirmarEntrega()
    try {
        const data = await apiFetch(`/pedidos/${id}/entregar`, { method: "PUT" })
        if (data.success) await cargarPedidos()
    } catch (error) {
        console.error("Error al entregar pedido:", error)
    }
})

document.getElementById('btnConfirmarCancelar').addEventListener('click', async () => {
    if (!_idPedidoAccion) return
    const id = _idPedidoAccion
    cerrarCancelarPedido()
    try {
        const data = await apiFetch(`/pedidos/${id}/cancelar`, { method: "PUT" })
        if (data.success) await cargarPedidos()
    } catch (error) {
        console.error("Error al cancelar pedido:", error)
    }
})

// ── VER DETALLES ──────────────────────────────────────────────
function verDetallesPedido(id) {
    const pedido = listaPedidos.find(p => p.idpedido === id)
    if (!pedido) return

    document.getElementById('tituloDetallesPedido').textContent = `Pedido #${pedido.idpedido}`
    document.getElementById('infoDetallesPedido').innerHTML =
        `Fecha: ${new Date(pedido.fechapedido).toLocaleDateString('es-CO')} &nbsp;|&nbsp;
         Empleado: ${pedido.nombreusuario} &nbsp;|&nbsp;
         Estado: <strong>${pedido.estadopedido}</strong>`

    const tbody = document.getElementById('cuerpoDetallesPedido')
    tbody.innerHTML = pedido.detalles.map(d => {
        const sabores = d.sabores || '-'
        const salsas = d.salsas || '-'
        const ads = Array.isArray(d.adicionales) && d.adicionales.length
            ? d.adicionales.map(a => a.nombre).join(', ')
            : '-'
        return `
            <tr>
                <td>${d.nombreproducto}</td>
                <td>${d.cantidad}</td>
                <td>${sabores}</td>
                <td>${salsas}</td>
                <td>${ads}</td>
                <td>$${parseFloat(d.subtotal).toLocaleString('es-CO')}</td>
            </tr>`
    }).join('')

    document.getElementById('totalDetallesPedido').textContent =
        `$${parseFloat(pedido.totalventa || 0).toLocaleString('es-CO')}`

    document.getElementById('modalDetallesPedido').style.display = 'flex'
}

document.getElementById('btnCerrarDetallesPedido').addEventListener('click', () => {
    document.getElementById('modalDetallesPedido').style.display = 'none'
})
document.getElementById('modalDetallesPedido').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalDetallesPedido'))
        document.getElementById('modalDetallesPedido').style.display = 'none'
})

// ══════════════════════════════════════════════════════════════
// MODAL REGISTRAR PEDIDO
// ══════════════════════════════════════════════════════════════

const modalPedido          = document.getElementById("modalPedido");
const btnAbrirModal        = document.getElementById("btnAbrirModalPedido");
const btnCerrarModal       = document.getElementById("btnCerrarModalPedido");
const btnCancelar          = document.getElementById("btnCancelarModalPedido");
const btnRegistrar         = document.getElementById("btnRegistrarPedido");
const btnAgregarDetalle    = document.getElementById("btnAgregarDetalle");
const selectProducto       = document.getElementById("detalleProducto");
const inputCantidad        = document.getElementById("detalleCantidadPedido");
const contenedorSabores    = document.getElementById("listaSabores");
const contenedorAdicionales = document.getElementById("listaAdicionales");
const contenedorSalsas = document.getElementById("listaSalsas")

let detallesPedido        = [];
let saboresDisponibles    = [];
let saboresSeleccionados  = [];
let adicionalesDisponibles   = [];
let adicionalesSeleccionados = []; // [{ idAdicional, nombre, precio, cantidad }]
let salsasDisponibles    = []
let salsasSeleccionadas  = []

// ── MOSTRAR DESCRIPCIÓN AL SELECCIONAR PRODUCTO ───────────────
selectProducto.addEventListener('change', () => {
    const option = selectProducto.selectedOptions[0];
    const divDesc = document.getElementById('descripcionProductoSeleccionado');
    if (!divDesc) return;
    const desc = option?.dataset?.descripcion?.trim();
    if (desc) {
        divDesc.textContent = desc;
        divDesc.style.display = 'block';
    } else {
        divDesc.style.display = 'none';
    }
});

// ── ABRIR MODAL ───────────────────────────────────────────────
btnAbrirModal.addEventListener("click", async () => {
    await Promise.all([
        cargarProductosModal(),
        cargarSaboresModal(),
        cargarSalsasModal(),
        cargarAdicionalesModal()
    ]);
    detallesPedido = [];
    saboresSeleccionados = [];
    adicionalesSeleccionados = [];
    salsasSeleccionadas = [];
    renderDetallesPedido();
    actualizarBtnRegistrar();
    modalPedido.style.display = "flex";
});

// ── AGREGAR DETALLE ───────────────────────────────────────────
/** Agrega el producto seleccionado con sus sabores, salsas y adicionales al array de detalles */
function agregarDetallePedido() {
    const option = selectProducto.selectedOptions[0];
    if (!option || !option.value) {
        mostrarMensaje('mensajePedido', 'Selecciona un producto primero', 'error')
        return;
    }

    const idProducto     = parseInt(option.value);
    const nombreProducto = option.textContent.trim();
    const precio         = parseFloat(option.dataset.precio) || 0;
    const cantidad       = parseInt(inputCantidad.value) || 1;

    // Calcular costo de adicionales seleccionados
    const costoAdicionales = adicionalesSeleccionados.reduce(
        (sum, a) => sum + (a.precio * a.cantidad), 0
    );
    const subtotal = (precio * cantidad) + costoAdicionales;

    detallesPedido.push({
        idProducto,
        nombreProducto,
        cantidad,
        precio,
        sabores: saboresSeleccionados.map(s => s.id),
        nombresSabores: saboresSeleccionados.map(s => s.nombre),
        salsas: salsasSeleccionadas.map(s => s.id),
        nombresSalsas: salsasSeleccionadas.map(s => s.nombre),
        adicionales: adicionalesSeleccionados.map(a => ({
            idAdicional: a.idAdicional,
            nombre: a.nombre,
            precio: a.precio,
            cantidad: a.cantidad
        })),
        subtotal
    });

    limpiarFormularioDetalle();
    renderDetallesPedido();
    actualizarBtnRegistrar();
}

btnAgregarDetalle.addEventListener("click", agregarDetallePedido);

// ── CERRAR MODAL ──────────────────────────────────────────────
function cerrarModalPedido() {
    modalPedido.style.display = "none";
    detallesPedido = [];
    saboresSeleccionados = [];
    adicionalesSeleccionados = [];
    salsasSeleccionadas = [];
}

btnCerrarModal.addEventListener("click", cerrarModalPedido);
btnCancelar.addEventListener("click", cerrarModalPedido);
modalPedido.addEventListener("click", (e) => {
    if (e.target === modalPedido) cerrarModalPedido();
});

// ── CARGAR PRODUCTOS ──────────────────────────────────────────
async function cargarProductosModal() {
    try {
        const data = await apiFetch('/productos');
        selectProducto.innerHTML = `<option value="" disabled selected>Selecciona un producto</option>`;
        data.productos
            .filter(p => p.estado === "activo")
            .forEach(prod => {
                const option = document.createElement("option");
                option.value = prod.idproducto;
                option.textContent = prod.nombreproducto;
                option.dataset.precio = prod.preciobase;
                option.dataset.descripcion = prod.descripcionproducto || '';
                selectProducto.appendChild(option);
            });
    } catch (error) {
        console.error("Error cargando productos", error);
    }
}

// ── CARGAR SABORES ────────────────────────────────────────────
async function cargarSaboresModal() {
    try {
        const data = await apiFetch('/sabores');
        saboresDisponibles = data.sabores.filter(s => s.estado === "activo");
        renderSabores();
    } catch (error) {
        console.error("Error cargando sabores", error);
    }
}

// ── CARGAR ADICIONALES ────────────────────────────────────────
async function cargarAdicionalesModal() {
    try {
        const data = await apiFetch('/adicionales');
        adicionalesDisponibles = data.adicionales.filter(a => a.estado === "activo");
        renderAdicionales();
    } catch (error) {
        console.error("Error cargando adicionales", error);
    }
}

// ── RENDER BOTONES SABORES ────────────────────────────────────
function renderSabores() {
    contenedorSabores.innerHTML = "";
    saboresDisponibles.forEach(sabor => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-sabor";
        btn.textContent = sabor.nombresabor;
        btn.dataset.id = sabor.idsabor;
        btn.dataset.nombre = sabor.nombresabor;
        btn.addEventListener("click", () => seleccionarSabor(btn));
        contenedorSabores.appendChild(btn);
    });
}

// ── RENDER BOTONES ADICIONALES ────────────────────────────────
function renderAdicionales() {
    contenedorAdicionales.innerHTML = "";
    if (adicionalesDisponibles.length === 0) {
        contenedorAdicionales.innerHTML = `<span style="color:#999; font-size:12px; padding:4px;">Sin adicionales disponibles</span>`;
        return;
    }
    adicionalesDisponibles.forEach(ad => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-sabor";
        btn.textContent = `${ad.nombre} (+$${parseFloat(ad.precio).toLocaleString('es-CO')})`;
        btn.dataset.id = ad.idadicional;
        btn.dataset.nombre = ad.nombre;
        btn.dataset.precio = ad.precio;
        btn.addEventListener("click", () => seleccionarAdicional(btn));
        contenedorAdicionales.appendChild(btn);
    });
}

// ── SELECCIONAR SABOR ─────────────────────────────────────────
function seleccionarSabor(btn) {
    const id = parseInt(btn.dataset.id);
    const nombre = btn.dataset.nombre;
    const index = saboresSeleccionados.findIndex(s => s.id === id);
    if (index >= 0) {
        saboresSeleccionados.splice(index, 1);
        btn.classList.remove("activo");
    } else {
        saboresSeleccionados.push({ id, nombre });
        btn.classList.add("activo");
    }
}

// ── SELECCIONAR ADICIONAL ─────────────────────────────────────
function seleccionarAdicional(btn) {
    const idAdicional = parseInt(btn.dataset.id);
    const nombre = btn.dataset.nombre;
    const precio = parseFloat(btn.dataset.precio);
    const index = adicionalesSeleccionados.findIndex(a => a.idAdicional === idAdicional);
    if (index >= 0) {
        adicionalesSeleccionados.splice(index, 1);
        btn.classList.remove("activo");
    } else {
        adicionalesSeleccionados.push({ idAdicional, nombre, precio, cantidad: 1 });
        btn.classList.add("activo");
    }
}

// ── LIMPIAR SABORES ───────────────────────────────────────────
function limpiarSabores() {
    saboresSeleccionados = [];
    contenedorSabores.querySelectorAll(".btn-sabor").forEach(b => b.classList.remove("activo"));
}

// ── LIMPIAR ADICIONALES ───────────────────────────────────────
function limpiarAdicionales() {
    adicionalesSeleccionados = [];
    contenedorAdicionales.querySelectorAll(".btn-sabor").forEach(b => b.classList.remove("activo"));
}

// ── CARGAR SALSAS ─────────────────────────────────────────────
async function cargarSalsasModal() {
    try {
        const data = await apiFetch('/salsas')
        salsasDisponibles = data.salsas.filter(s => s.estado === 'activo')
        renderSalsas()
    } catch (error) {
        console.error('Error cargando salsas', error)
    }
}

// ── RENDER BOTONES SALSAS ─────────────────────────────────────
function renderSalsas() {
    if (!contenedorSalsas) return
    contenedorSalsas.innerHTML = ''
    salsasDisponibles.forEach(salsa => {
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'btn-sabor'
        btn.textContent = salsa.nombresalsa
        btn.dataset.id = salsa.idsalsa
        btn.dataset.nombre = salsa.nombresalsa
        btn.addEventListener('click', () => seleccionarSalsa(btn))
        contenedorSalsas.appendChild(btn)
    })
}

// ── SELECCIONAR SALSA ─────────────────────────────────────────
function seleccionarSalsa(btn) {
    const id = parseInt(btn.dataset.id)
    const nombre = btn.dataset.nombre
    const index = salsasSeleccionadas.findIndex(s => s.id === id)
    if (index >= 0) {
        salsasSeleccionadas.splice(index, 1)
        btn.classList.remove('activo')
    } else {
        salsasSeleccionadas.push({ id, nombre })
        btn.classList.add('activo')
    }
}

// ── LIMPIAR SALSAS ────────────────────────────────────────────
function limpiarSalsas() {
    salsasSeleccionadas = []
    if (contenedorSalsas) contenedorSalsas.querySelectorAll('.btn-sabor').forEach(b => b.classList.remove('activo'))
}

// ── LIMPIAR FORMULARIO ────────────────────────────────────────
/** Resetea producto, cantidad, sabores, salsas y adicionales del formulario de detalle */
function limpiarFormularioDetalle() {
    selectProducto.value = "";
    inputCantidad.value = 1;
    const divDesc = document.getElementById('descripcionProductoSeleccionado');
    if (divDesc) divDesc.style.display = 'none';
    limpiarSabores();
    limpiarSalsas();
    limpiarAdicionales();
}

// ── RENDER TABLA DETALLES ─────────────────────────────────────
function renderDetallesPedido() {
    const tabla    = document.getElementById("tablaDetallesPedido");
    const totalSpan = document.getElementById("totalPedido");
    tabla.innerHTML = "";
    let total = 0;

    detallesPedido.forEach((det, index) => {
        total += det.subtotal;

        const nombresAd = det.adicionales.length
            ? det.adicionales.map(a => `${a.nombre}`).join(", ")
            : "-";

        const saboresTexto = det.nombresSabores.length ? det.nombresSabores.join(", ") : "-";
        const salsasTexto = (det.nombresSalsas && det.nombresSalsas.length) ? det.nombresSalsas.join(", ") : "-";
        const adTexto = nombresAd !== "-" ? `<br><span style="color:#999;font-size:11px;">${nombresAd}</span>` : "";

        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #f0f0f0";
        tr.innerHTML = `
            <td style="padding:8px;">${det.nombreProducto}${adTexto}</td>
            <td style="padding:8px; text-align:center;">${det.cantidad}</td>
            <td style="padding:8px; font-size:12px; color:#666;">${saboresTexto}</td>
            <td style="padding:8px; font-size:12px; color:#666;">${salsasTexto}</td>
            <td style="padding:8px; text-align:right; font-weight:600; color:#a47c7c;">$${det.subtotal.toLocaleString("es-CO")}</td>
            <td style="padding:8px; text-align:center;">
                <button onclick="eliminarDetallePedido(${index})"
                        style="background:none;border:none;cursor:pointer;color:#d9534f;font-size:14px;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tabla.appendChild(tr);
    });

    totalSpan.textContent = "$" + total.toLocaleString("es-CO");
}

// ── ELIMINAR DETALLE ──────────────────────────────────────────
function eliminarDetallePedido(index) {
    detallesPedido.splice(index, 1);
    renderDetallesPedido();
    actualizarBtnRegistrar();
}

// ── HABILITAR BOTÓN REGISTRAR ─────────────────────────────────
/** Habilita o deshabilita el botón registrar según si hay detalles en el pedido */
function actualizarBtnRegistrar() {
    btnRegistrar.disabled = detallesPedido.length === 0;
}

// ── REGISTRAR PEDIDO ──────────────────────────────────────────
document.getElementById("formNuevoPedido").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (detallesPedido.length === 0) {
        mostrarMensaje('mensajePedido', 'Agrega al menos un producto al pedido', 'error')
        return;
    }

    // Enviar solo los campos necesarios al backend
    const payload = detallesPedido.map(det => ({
        idProducto:  det.idProducto,
        cantidad:    det.cantidad,
        precio:      det.precio,
        sabores:     det.nombresSabores,
        salsas:      det.nombresSalsas,
        adicionales: det.adicionales.map(a => ({
            idAdicional: a.idAdicional,
            cantidad:    a.cantidad
        }))
    }));

    try {
        const data = await apiFetch('/pedidos', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ detalles: payload })
        });
        if (data.success) {
            mostrarMensaje('mensajePedido', 'Pedido registrado correctamente', 'success')
            await cargarPedidos();
            setTimeout(() => cerrarModalPedido(), 1500);
        } else {
            alert(data.message || "Error al registrar pedido");
        }
    } catch (error) {
        console.error("Error registrando pedido", error);
    }
});
