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
        return `
            <tr>
                <td>#${p.idpedido}</td>
                <td>${fecha}</td>
                <td>${p.nombreusuario}</td>
                <td>$${total}</td>
                <td>
                    <span class="badge-estado ${esEntregado ? 'estado-disponible' : 'estado-pendiente'}">
                        ${p.estadopedido}
                    </span>
                </td>
                <td>
                    <div class="botones-accion">
                        ${!esEntregado ? `
                        <button class="boton-accion" title="Marcar entregado"
                            onclick="marcarEntregado(${p.idpedido})">
                            <i class="fas fa-check"></i>
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

// ── MARCAR ENTREGADO ──────────────────────────────────────────
async function marcarEntregado(id) {
    if (!confirm("¿Marcar este pedido como entregado?")) return;
    try {
        const data = await apiFetch(`/pedidos/${id}/entregar`, { method: "PUT" });
        if (data.success) {
            alert("Pedido entregado. Venta registrada.");
            await cargarPedidos();
        } else {
            alert(data.message || "Error al entregar pedido");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

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
        const ads = Array.isArray(d.adicionales) && d.adicionales.length
            ? d.adicionales.map(a => a.nombre).join(', ')
            : '-'
        return `
            <tr>
                <td>${d.nombreproducto}</td>
                <td>${d.cantidad}</td>
                <td>${sabores}</td>
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

let detallesPedido        = [];
let saboresDisponibles    = [];
let saboresSeleccionados  = [];
let adicionalesDisponibles   = [];
let adicionalesSeleccionados = []; // [{ idAdicional, nombre, precio, cantidad }]

// ── ABRIR MODAL ───────────────────────────────────────────────
btnAbrirModal.addEventListener("click", async () => {
    await Promise.all([
        cargarProductosModal(),
        cargarSaboresModal(),
        cargarAdicionalesModal()
    ]);
    detallesPedido = [];
    saboresSeleccionados = [];
    adicionalesSeleccionados = [];
    renderDetallesPedido();
    actualizarBtnRegistrar();
    modalPedido.style.display = "flex";
});

// ── AGREGAR DETALLE ───────────────────────────────────────────
function agregarDetallePedido() {
    const option = selectProducto.selectedOptions[0];
    if (!option || !option.value) {
        alert("Seleccione un producto");
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

// ── LIMPIAR FORMULARIO ────────────────────────────────────────
function limpiarFormularioDetalle() {
    selectProducto.value = "";
    inputCantidad.value = 1;
    limpiarSabores();
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

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${det.nombreProducto}</td>
            <td>${det.cantidad}</td>
            <td>${det.nombresSabores.length ? det.nombresSabores.join(", ") : "-"}</td>
            <td>${nombresAd}</td>
            <td>$${det.subtotal.toLocaleString("es-CO")}</td>
            <td>
                <button onclick="eliminarDetallePedido(${index})"
                        style="background:none;border:none;cursor:pointer;font-size:16px;">
                    ❌
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
function actualizarBtnRegistrar() {
    btnRegistrar.disabled = detallesPedido.length === 0;
}

// ── REGISTRAR PEDIDO ──────────────────────────────────────────
document.getElementById("formNuevoPedido").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (detallesPedido.length === 0) {
        alert("Debe agregar al menos un producto");
        return;
    }

    // Enviar solo los campos necesarios al backend
    const payload = detallesPedido.map(det => ({
        idProducto:  det.idProducto,
        cantidad:    det.cantidad,
        precio:      det.precio,
        sabores:     det.nombresSabores,
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
