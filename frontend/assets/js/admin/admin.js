const API_URL = 'https://helar-tec-grupo-7.onrender.com/api/usuarios'

// ── PROTECCIÓN DE RUTA ─────────────────────────────────────
const token = localStorage.getItem('token')
const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

if (!token || !usuario) {
    window.location.replace('./login.html')
} else {
    document.getElementById('nombreAdmin').textContent = usuario.nombreUsuario
    document.getElementById('avatarAdmin').textContent = usuario.nombreUsuario.substring(0, 2).toUpperCase()
}

// ── LISTA EN MEMORIA ───────────────────────────────────────
let listaUsuarios = []

// ── CARGAR USUARIOS ────────────────────────────────────────
/** Obtiene la lista de usuarios desde la API y la renderiza en la tabla */
async function cargarUsuarios() {
    const tbody = document.getElementById('tablaEmpleadosBody')

    try {
        const response = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        })

        const data = await response.json()

        if (data.success) {
            listaUsuarios = data.usuarios
            renderTabla(listaUsuarios)
        } else {
            tbody.innerHTML = mensajeFila('Error al cargar usuarios', 6)
        }
    } catch (error) {
        tbody.innerHTML = mensajeFila('No se pudo conectar con el servidor', 6)
    }
}

// ── RENDER TABLA ───────────────────────────────────────────
/** Genera las filas de la tabla de usuarios con dropdowns de estado y botones de acción */
function renderTabla(usuarios) {
    const tbody = document.getElementById('tablaEmpleadosBody')

    if (usuarios.length === 0) {
        tbody.innerHTML = mensajeFila('No se encontraron usuarios', 6)
        return
    }

    tbody.innerHTML = usuarios.map(u => {
        const esActivo = u.estado === 'activo'

        return `
            <tr>
                <td>${u.idusuario}</td>
                <td>${u.nombreusuario}</td>
                <td>${u.correousuario}</td>
                <td>
                    <span class="badge-rol ${u.nombrerol === 'administrador' ? 'badge-admin' : 'badge-empleado'}">
                        ${u.nombrerol || 'Sin rol'}
                    </span>
                </td>
                <td>
                    <div class="estado-dropdown-wrapper">
                        <span 
                            class="badge-estado ${esActivo ? 'badge-activo' : 'badge-inactivo'} badge-clickeable"
                            onclick="toggleDropdownEstado(event, ${u.idusuario})"
                        >
                            ${esActivo ? 'Activo' : 'Inactivo'}
                            <i class="fas fa-chevron-down" style="font-size: 10px; margin-left: 4px;"></i>
                        </span>
                        <div class="estado-dropdown" id="dropdown-${u.idusuario}">
                            <div 
                                class="estado-opcion ${esActivo ? 'opcion-seleccionada' : ''}" 
                                onclick="cambiarEstado(${u.idusuario}, 'activo')"
                            >
                                <i class="fas fa-check" style="margin-right: 6px; opacity: ${esActivo ? '1' : '0'};"></i>
                                Activo
                            </div>
                            <div 
                                class="estado-opcion ${!esActivo ? 'opcion-seleccionada' : ''}" 
                                onclick="cambiarEstado(${u.idusuario}, 'inactivo')"
                            >
                                <i class="fas fa-check" style="margin-right: 6px; opacity: ${!esActivo ? '1' : '0'};"></i>
                                Inactivo
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <button class="btn-accion-tabla" title="Editar rol" onclick="abrirModalEditar(${u.idusuario}, '${u.nombreusuario}', ${u.idrol})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-accion-tabla" title="Eliminar" onclick="abrirModalEliminar(${u.idusuario}, '${u.nombreusuario}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `
    }).join('')
}

_adminSeccionesYaCargadas.add('empleados')
cargarUsuarios()

// ── BÚSQUEDA ───────────────────────────────────────────────
document.getElementById('inputBusqueda').addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase().trim()

    const filtrados = listaUsuarios.filter(u =>
        u.nombreusuario.toLowerCase().includes(termino) ||
        u.correousuario.toLowerCase().includes(termino)
    )

    renderTabla(filtrados)
})

// ── SUBMENU AJUSTES ────────────────────────────────────────
const btnAjustes = document.getElementById('btnAjustes')
const submenuAjustes = document.getElementById('submenuAjustes')

btnAjustes.addEventListener('click', (e) => {
    e.stopPropagation()
    submenuAjustes.classList.toggle('abierto')
})

document.addEventListener('click', () => {
    submenuAjustes.classList.remove('abierto')
})

submenuAjustes.addEventListener('click', (e) => e.stopPropagation())

// ── LOGOUT ─────────────────────────────────────────────────
const modalLogout = document.getElementById('modalLogout')

document.getElementById('abrirModalLogout').addEventListener('click', () => {
    modalLogout.classList.add('active')
})

document.getElementById('cancelarLogout').addEventListener('click', () => {
    modalLogout.classList.remove('active')
})

document.getElementById('confirmarLogout').addEventListener('click', () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    window.location.replace('./login.html')
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
    btn.innerHTML = `<svg class="icono-submenu-admin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="${esDark ? 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z' : 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'}"/></svg> ${esDark ? 'Modo claro' : 'Modo oscuro'}`
}

// Apply saved theme on load
;(function() {
    const saved = localStorage.getItem('tema') || 'claro'
    document.documentElement.setAttribute('data-tema', saved)
})()

/** Abre o cierra el sidebar lateral en vistas móviles */
function toggleSidebar() {
    document.querySelector('.barra-lateral-izquierda').classList.toggle('abierta')
    document.getElementById('overlaySidebar').classList.toggle('activo')
}

document.addEventListener('DOMContentLoaded', actualizarBtnTema)