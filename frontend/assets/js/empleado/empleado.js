const token = localStorage.getItem("token") || "";  // || "" para evitar undefined al leer el token

if (!token) {
    window.location.href = "../pages/login.html"
    throw new Error("No hay token");  // detiene la ejecución del resto del script
}

// ── DECODIFICAR JWT ───────────────────────────────────────────
/** Decodifica el payload de un JWT sin verificar firma (solo para leer datos del cliente) */
function decodeJWT(t) {
    try {
        return JSON.parse(atob(t.split(".")[1]))
    } catch {
        return null
    }
}

const payload = decodeJWT(token)

if (payload) {
    const nombre = payload.nombreUsuario || "Usuario"
    document.getElementById("nombreUsuario").textContent = nombre
    document.getElementById("avatarUsuario").textContent =
        nombre.substring(0, 2).toUpperCase()
}

// ── CAMBIAR SECCIÓN ───────────────────────────────────────────
// Rastrea qué secciones ya cargaron sus datos para evitar doble carga
const _seccionesYaCargadas = new Set()

/** Muestra la sección solicitada, oculta las demás y dispara su función de carga (solo una vez por sección) */
function cambiarSeccion(seccion, elemento) {

    document.querySelectorAll(".seccion-contenido")
        .forEach(s => s.classList.remove("activa"))

    const contenido = document.getElementById("contenido-" + seccion)
    if (contenido) contenido.classList.add("activa")

    document.querySelectorAll(".opcion-menu")
        .forEach(op => op.classList.remove("activa"))
    if (elemento) elemento.classList.add("activa")

    // General siempre refresca (KPIs en tiempo real); las demás solo cargan una vez
    if (seccion === "general" || !_seccionesYaCargadas.has(seccion)) {
        _seccionesYaCargadas.add(seccion)
        switch (seccion) {
            case "general":     if (typeof cargarDashboard   === "function") cargarDashboard();   break
            case "inventario":  if (typeof cargarInsumos     === "function") cargarInsumos();     break
            case "proveedores": if (typeof cargarProveedores === "function") cargarProveedores(); break
            case "compras":     if (typeof cargarCompras     === "function") cargarCompras();     break
            case "productos":   if (typeof cargarProductos   === "function") cargarProductos();   break
            case "pedidos":     if (typeof cargarPedidos     === "function") cargarPedidos();     break
            case "ventas":      if (typeof cargarVentas      === "function") cargarVentas();      break
            case "alertas":     if (typeof cargarAlertas     === "function") cargarAlertas();     break
        }
    }
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

    // Carga inicial
    if (typeof cargarDashboard === "function") cargarDashboard()

    // Verificar alertas de vencimiento al cargar la página
    if (typeof verificarAlertasVencimiento === "function") {
        verificarAlertasVencimiento()
    } else if (typeof actualizarBadgeAlertas === "function") {
        actualizarBadgeAlertas()
    }

    // ── MENÚ AJUSTES ──────────────────────────────────────────
    const btnAjustes  = document.getElementById("btnAjustes")
    const menuAjustes = document.getElementById("menuAjustes")

    // Estado inicial: oculto
    menuAjustes.style.display = "none"

    btnAjustes.addEventListener("click", e => {
        e.stopPropagation()
        const visible = menuAjustes.style.display === "block"
        menuAjustes.style.display = visible ? "none" : "block"
    })

    document.addEventListener("click", () => {
        menuAjustes.style.display = "none"
    })

    menuAjustes.addEventListener("click", e => e.stopPropagation())

    // ── MODAL LOGOUT ──────────────────────────────────────────
    const modalLogout     = document.getElementById("modalLogout")
    const abrirLogout     = document.getElementById("abrirModalLogout")
    const cancelarLogout  = document.getElementById("cancelarLogout")
    const confirmarLogout = document.getElementById("confirmarLogout")

    abrirLogout.addEventListener("click", () => {
        menuAjustes.style.display = "none"
        modalLogout.style.display = "flex"
    })

    cancelarLogout.addEventListener("click", () => {
        modalLogout.style.display = "none"
    })

    confirmarLogout.addEventListener("click", () => {
        localStorage.removeItem("token")
        window.location.href = "../pages/login.html"
    })

    // ── CALENDARIO FLATPICKR ──────────────────────────────────
    flatpickr("#calendarioEmpleado", {
        inline: true,
        defaultDate: "today",
        locale: "es"
    })

    const diasSemanaTexto = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"]
    const mesesTexto = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]

    // ── HORA EN TIEMPO REAL ───────────────────────────────────
    function actualizarHora() {
        const ahora = new Date()
        const h = String(ahora.getHours()).padStart(2, "0")
        const m = String(ahora.getMinutes()).padStart(2, "0")
        document.getElementById("horaTiempoReal").textContent = h + ":" + m
        document.getElementById("fechaTiempoReal").textContent =
            diasSemanaTexto[ahora.getDay()] + ", " + ahora.getDate() + " de " + mesesTexto[ahora.getMonth()]
    }

    actualizarHora()
    setInterval(actualizarHora, 60000)

    // ── CERRAR DROPDOWNS ESTADO AL CLIC FUERA ────────────────
    document.addEventListener("click", () => {
        document.querySelectorAll(".estado-dropdown.abierto")
            .forEach(d => d.classList.remove("abierto"))
    })

})

// ── DARK MODE ────────────────────────────────────────────────
/** Alterna entre tema claro y oscuro y persiste la preferencia en localStorage */
function toggleTema() {
    const esDark = document.documentElement.getAttribute('data-tema') === 'oscuro'
    const nuevo = esDark ? 'claro' : 'oscuro'
    document.documentElement.setAttribute('data-tema', nuevo)
    localStorage.setItem('tema', nuevo)
    actualizarBtnTema()
}

function actualizarBtnTema() {
    const btn = document.getElementById('btnToggleTema')
    if (!btn) return
    const esDark = document.documentElement.getAttribute('data-tema') === 'oscuro'
    btn.innerHTML = `<i class="${esDark ? 'fas fa-sun' : 'fas fa-moon'}" style="margin-right:8px;font-size:14px;"></i> ${esDark ? 'Modo claro' : 'Modo oscuro'}`
}

;(function() {
    const saved = localStorage.getItem('tema') || 'claro'
    document.documentElement.setAttribute('data-tema', saved)
})()

/** Abre o cierra el sidebar lateral en vistas móviles */
function toggleSidebar() {
    document.querySelector('.barra-lateral').classList.toggle('abierta')
    document.getElementById('overlaySidebar').classList.toggle('activo')
}

document.addEventListener('DOMContentLoaded', actualizarBtnTema)