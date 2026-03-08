const token = localStorage.getItem('token')
const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

if (!token || !usuario) {
    window.location.href = './login.html'
}

document.getElementById('nombreUsuario').textContent = usuario.nombreUsuario
document.getElementById('avatarUsuario').textContent = usuario.nombreUsuario.substring(0, 2).toUpperCase()

// ── SUBMENU AJUSTES ────────────────────────────────────────
const btnAjustes = document.getElementById('btnAjustes')
const menuAjustes = document.getElementById('menuAjustes')

btnAjustes.addEventListener('click', () => {
    menuAjustes.classList.toggle('activo')
})

function cambiarSeccion(seccion, elemento) {
    document.querySelectorAll('.seccion-contenido').forEach(s => {
        s.classList.remove('activa')
    })
    document.querySelectorAll('.opcion-menu').forEach(o => {
        o.classList.remove('activa')
    })

    document.getElementById(`contenido-${seccion}`)?.classList.add('activa')
    elemento.classList.add('activa')

    if (seccion === 'inventario') cargarInsumos()
    if (seccion === 'proveedores') cargarProveedores()
    if (seccion === 'compras') cargarCompras()   
    if (seccion === 'productos') cargarProductos()
    if (seccion === 'pedidos') cargarPedidos()
}

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