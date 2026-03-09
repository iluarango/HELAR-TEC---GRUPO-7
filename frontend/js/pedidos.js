// ELIMINADA la declaración de token (ya está en empleado.js)
const API_PEDIDOS = "http://localhost:3000/api/pedidos";
const API_PRODUCTOS_PED = "http://localhost:3000/api/productos";
const API_SABORES_PED = "http://localhost:3000/api/sabores";

// ── LISTA EN MEMORIA ──────────────────────────────────────────
let listaPedidos = [];

// Función auxiliar para mensajes de tabla
function mensajeFilaPedido(texto, colspan) {
    return `<tr><td colspan="${colspan}" style="text-align:center; padding:40px; color:#999;">${texto}</td></tr>`;
}

// ── CARGAR PEDIDOS ────────────────────────────────────────────
async function cargarPedidos() {
    const tbody = document.getElementById("cuerpoTablaPedidos");
    try {
        const res = await fetch(API_PEDIDOS, {
            headers: { "Authorization": "Bearer " + token }
        });
        const data = await res.json();
        if (data.success) {
            listaPedidos = data.pedidos;
            renderTablaPedidos(listaPedidos);
        } else {
            tbody.innerHTML = mensajeFilaPedido("Error al cargar pedidos", 6);
        }
    } catch (error) {
        tbody.innerHTML = mensajeFilaPedido("No se pudo conectar con el servidor", 6);
    }
}

// ── RENDER TABLA ──────────────────────────────────────────────
function renderTablaPedidos(pedidos) {
    const tbody = document.getElementById("cuerpoTablaPedidos");
    if (pedidos.length === 0) {
        tbody.innerHTML = mensajeFilaPedido("No hay pedidos registrados", 6);
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
window.marcarEntregado = async function(id) {
    if (!confirm("¿Marcar este pedido como entregado?")) return;
    try {
        const res = await fetch(`${API_PEDIDOS}/${id}/entregar`, {
            method: "PUT",
            headers: { "Authorization": "Bearer " + token }
        });
        const data = await res.json();
        if (data.success) {
            alert("Pedido entregado. Venta registrada.");
            await cargarPedidos();
        } else {
            alert(data.message || "Error al entregar pedido");
        }
    } catch (error) {
        console.error("Error:", error);
    }
};

// ── VER DETALLES ──────────────────────────────────────────────
window.verDetallesPedido = function(id) {
    alert("Detalles del pedido #" + id);
};

// ══════════════════════════════════════════════════════════════
// MODAL REGISTRAR PEDIDO
// ══════════════════════════════════════════════════════════════

// Declaraciones del modal
const modalPedido = document.getElementById("modalPedido");
const btnAbrirModal = document.getElementById("btnAbrirModalPedido");
const btnCerrarModal = document.getElementById("btnCerrarModalPedido");
const btnCancelar = document.getElementById("btnCancelarModalPedido");
const btnRegistrar = document.getElementById("btnRegistrarPedido");
const btnAgregarDetalle = document.getElementById("btnAgregarDetalle"); // ✅ AGREGADO

const selectProducto = document.getElementById("detalleProducto");
const inputCantidad = document.getElementById("detalleCantidad");
const inputAdicionales = document.getElementById("detalleAdicionales");
const inputPrecioAdicionales = document.getElementById("detallePrecioAdicionales");
const listaSabores = document.getElementById("listaSabores");
const mensajePedido = document.getElementById("mensajePedido"); // ✅ AGREGADO

let detallesPedido = [];
let saboresDisponibles = [];
let saboresSeleccionados = [];

// ── ABRIR MODAL ───────────────────────────────────────────────
btnAbrirModal.addEventListener("click", async () => {
    await cargarProductosModal();
    await cargarSaboresModal();
    detallesPedido = [];
    saboresSeleccionados = [];
    renderDetallesPedido();
    actualizarBtnRegistrar();
    modalPedido.style.display = "flex";
});

// ── EVENT LISTENER PARA EL BOTÓN AGREGAR ──────────────────────
btnAgregarDetalle.addEventListener("click", agregarDetallePedido); // ✅ AGREGADO

// ── CERRAR MODAL ──────────────────────────────────────────────
function cerrarModalPedido() {
    modalPedido.style.display = "none";
    detallesPedido = [];
    saboresSeleccionados = [];
}

btnCerrarModal.addEventListener("click", cerrarModalPedido);
btnCancelar.addEventListener("click", cerrarModalPedido);
modalPedido.addEventListener("click", (e) => {
    if (e.target === modalPedido) cerrarModalPedido();
});

// ── CARGAR PRODUCTOS ──────────────────────────────────────────
async function cargarProductosModal() {
    try {
        const res = await fetch(API_PRODUCTOS_PED, {
            headers: { "Authorization": "Bearer " + token }
        });
        const data = await res.json();
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
        const res = await fetch(API_SABORES_PED, {
            headers: { "Authorization": "Bearer " + token }
        });
        const data = await res.json();
        saboresDisponibles = data.sabores.filter(s => s.estado === "activo");
        renderSabores();
    } catch (error) {
        console.error("Error cargando sabores", error);
    }
}

// ── RENDER BOTONES SABORES ────────────────────────────────────
function renderSabores() {
    listaSabores.innerHTML = "";
    saboresDisponibles.forEach(sabor => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-sabor";
        btn.textContent = sabor.nombresabor;
        btn.dataset.id = sabor.idsabor;
        btn.dataset.nombre = sabor.nombresabor;
        btn.addEventListener("click", () => seleccionarSabor(btn));
        listaSabores.appendChild(btn);
    });
}

// ── SELECCIONAR / DESELECCIONAR SABOR ─────────────────────────
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

// ── LIMPIAR SABORES ───────────────────────────────────────────
function limpiarSabores() {
    saboresSeleccionados = [];
    listaSabores.querySelectorAll(".btn-sabor").forEach(b => b.classList.remove("activo"));
}

// ── AGREGAR DETALLE ───────────────────────────────────────────
window.agregarDetallePedido = function() {
    const option = selectProducto.selectedOptions[0];
    if (!option || !option.value) {
        alert("Seleccione un producto");
        return;
    }
    const idProducto = parseInt(option.value);
    const nombreProducto = option.textContent.trim();
    const precio = parseFloat(option.dataset.precio) || 0;
    const cantidad = parseInt(inputCantidad.value) || 1;
    const adicionales = inputAdicionales.value.trim() || null;
    const precioAdicionales = parseFloat(inputPrecioAdicionales.value) || 0;
    const sabores = saboresSeleccionados.map(s => s.id);
    const nombresSabores = saboresSeleccionados.map(s => s.nombre);

    detallesPedido.push({
        idProducto,
        nombreProducto,
        cantidad,
        precio,
        sabores,
        nombresSabores,
        adicionales,
        precioAdicionales
    });

    limpiarFormularioDetalle();
    renderDetallesPedido();
    actualizarBtnRegistrar();
};

// ── LIMPIAR FORMULARIO ────────────────────────────────────────
function limpiarFormularioDetalle() {
    selectProducto.value = "";
    inputCantidad.value = 1;
    inputAdicionales.value = "";
    inputPrecioAdicionales.value = "";
    limpiarSabores();
}

// ── RENDER TABLA DETALLES ─────────────────────────────────────
function renderDetallesPedido() {
    const tabla = document.getElementById("tablaDetallesPedido");
    const totalSpan = document.getElementById("totalPedido");
    tabla.innerHTML = "";
    let total = 0;

    detallesPedido.forEach((det, index) => {
        const subtotal = (det.precio * det.cantidad) + det.precioAdicionales;
        total += subtotal;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${det.nombreProducto}</td>
            <td>${det.cantidad}</td>
            <td>${det.nombresSabores.length ? det.nombresSabores.join(", ") : "-"}</td>
            <td>${det.adicionales ?? "-"}</td>
            <td>$${subtotal.toLocaleString("es-CO")}</td>
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
window.eliminarDetallePedido = function(index) {
    detallesPedido.splice(index, 1);
    renderDetallesPedido();
    actualizarBtnRegistrar();
};

// ── HABILITAR / DESHABILITAR BOTÓN REGISTRAR ─────────────────
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
    try {
        const res = await fetch(API_PEDIDOS, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ detalles: detallesPedido })
        });
        const data = await res.json();
        if (data.success) {
            alert("Pedido registrado correctamente");
            cerrarModalPedido();
            await cargarPedidos();
        } else {
            alert(data.message || "Error al registrar pedido");
        }
    } catch (error) {
        console.error("Error registrando pedido", error);
    }
});