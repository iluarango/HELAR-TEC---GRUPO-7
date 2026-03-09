const token = localStorage.getItem("token") || "";  // ✅ Agregado || "" para evitar undefined

if (!token) {
    window.location.href = "../pages/login.html"
    throw new Error("No hay token");  // ✅ Detiene la ejecución
}

// ── DECODIFICAR JWT ───────────────────────────────────────────
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
function cambiarSeccion(seccion, elemento) {

    document.querySelectorAll(".seccion-contenido")
        .forEach(s => s.classList.remove("activa"))

    const contenido = document.getElementById("contenido-" + seccion)
    if (contenido) contenido.classList.add("activa")

    document.querySelectorAll(".opcion-menu")
        .forEach(op => op.classList.remove("activa"))
    if (elemento) elemento.classList.add("activa")

    switch (seccion) {
        case "general":     if (typeof cargarDashboard   === "function") cargarDashboard();   break
        case "inventario":  if (typeof cargarInsumos     === "function") cargarInsumos();     break
        case "proveedores": if (typeof cargarProveedores === "function") cargarProveedores(); break
        case "compras":     if (typeof cargarCompras     === "function") cargarCompras();     break
        case "productos":   if (typeof cargarProductos   === "function") cargarProductos();   break
        case "pedidos":     if (typeof cargarPedidos     === "function") cargarPedidos();     break
        case "ventas":      if (typeof cargarVentas      === "function") cargarVentas();      break
    }
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

    // Carga inicial
    if (typeof cargarDashboard === "function") cargarDashboard()

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

    // ── CALENDARIO ───────────────────────────────────────────
    const meses = [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ]

    let mesActual  = new Date().getMonth()
    let anioActual = new Date().getFullYear()

    function renderCalendario(mes, anio) {

        document.getElementById("mes-actual").textContent = meses[mes] + " " + anio

        const grilla      = document.getElementById("grillaCalendario")
        const encabezados = Array.from(grilla.querySelectorAll(".etiqueta-dia-semana"))

        grilla.innerHTML = ""
        encabezados.forEach(e => grilla.appendChild(e))

        const primerDia = new Date(anio, mes, 1).getDay()
        const diasMes   = new Date(anio, mes + 1, 0).getDate()
        const hoy       = new Date()

        for (let i = 0; i < primerDia; i++) {
            grilla.appendChild(document.createElement("div"))
        }

        for (let d = 1; d <= diasMes; d++) {
            const div = document.createElement("div")
            div.className   = "dia-calendario"
            div.textContent = d
            if (d === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()) {
                div.classList.add("dia-hoy")
            }
            grilla.appendChild(div)
        }
    }

    renderCalendario(mesActual, anioActual)

    document.getElementById("btnMesAnterior").addEventListener("click", () => {
        if (--mesActual < 0) { mesActual = 11; anioActual-- }
        renderCalendario(mesActual, anioActual)
    })

    document.getElementById("btnMesSiguiente").addEventListener("click", () => {
        if (++mesActual > 11) { mesActual = 0; anioActual++ }
        renderCalendario(mesActual, anioActual)
    })

    // ── HORA EN TIEMPO REAL ───────────────────────────────────
    const diasSemana = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"]

    function actualizarHora() {
        const ahora   = new Date()
        const h       = String(ahora.getHours()).padStart(2, "0")
        const m       = String(ahora.getMinutes()).padStart(2, "0")
        document.getElementById("horaTiempoReal").textContent = h + ":" + m
        document.getElementById("fechaTiempoReal").textContent =
            diasSemana[ahora.getDay()] + ", " + ahora.getDate() + " de " + meses[ahora.getMonth()]
    }

    actualizarHora()
    setInterval(actualizarHora, 60000)

    // ── CERRAR DROPDOWNS ESTADO AL CLIC FUERA ────────────────
    document.addEventListener("click", () => {
        document.querySelectorAll(".estado-dropdown.abierto")
            .forEach(d => d.classList.remove("abierto"))
    })

})