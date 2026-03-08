const API_URL = 'http://localhost:3000/api/usuarios'

// ── PROTECCIÓN DE RUTA ─────────────────────────────────────
const token = localStorage.getItem('token')
const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

if (!token || !usuario) {
    window.location.href = './login.html'
} else {
    document.getElementById('nombreAdmin').textContent = usuario.nombreUsuario
    document.getElementById('avatarAdmin').textContent = usuario.nombreUsuario.substring(0, 2).toUpperCase()
}

// ── LISTA EN MEMORIA ───────────────────────────────────────
let listaUsuarios = []

// ── CARGAR USUARIOS ────────────────────────────────────────
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

btnAjustes.addEventListener('click', () => {
    btnAjustes.classList.toggle('abierto')
    submenuAjustes.classList.toggle('abierto')
})

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
    window.location.href = './login.html'
})