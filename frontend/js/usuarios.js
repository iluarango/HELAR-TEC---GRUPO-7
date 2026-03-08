// ── MODAL REGISTRO ─────────────────────────────────────────
const modal = document.getElementById('modalEmpleado')

document.getElementById('btnAbrirModalEmpleado').addEventListener('click', () => {
    modal.style.display = 'flex'
})

document.getElementById('btnCerrarModal').addEventListener('click', cerrarModal)
document.getElementById('btnCancelarModal').addEventListener('click', cerrarModal)

modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal()
})

function cerrarModal() {
    modal.style.display = 'none'
    document.getElementById('formRegistroEmpleado').reset()
    document.getElementById('requisitosContrasena').style.display = 'none'
    document.getElementById('btnRegistrar').disabled = true
    ocultarMensaje('mensajeRegistro')
}

// ── VALIDACIÓN DE CONTRASEÑA ───────────────────────────────
const requisitos = {
    length:    { id: 'req-length',    regex: /^.{12,16}$/ },
    uppercase: { id: 'req-uppercase', regex: /[A-Z]/      },
    lowercase: { id: 'req-lowercase', regex: /[a-z]/      },
    number:    { id: 'req-number',    regex: /[0-9]/      },
    special:   { id: 'req-special',   regex: /[@$!%*?&]/  }
}

document.getElementById('contrasenaUsuario').addEventListener('input', (e) => {
    const valor = e.target.value
    const checklist = document.getElementById('requisitosContrasena')
    checklist.style.display = valor.length > 0 ? 'block' : 'none'

    let todosValidos = true

    for (const [key, requisito] of Object.entries(requisitos)) {
        const el = document.getElementById(requisito.id)
        const valido = requisito.regex.test(valor)
        el.style.color = valido ? '#065f46' : '#999'
        el.querySelector('i').className = valido ? 'fas fa-check-circle' : 'fas fa-circle'
        if (!valido) todosValidos = false
    }

    document.getElementById('btnRegistrar').disabled = !todosValidos
})

// ── REGISTRO ───────────────────────────────────────────────
document.getElementById('formRegistroEmpleado').addEventListener('submit', async (e) => {
    e.preventDefault()

    const nombreUsuario = document.getElementById('nombreUsuario').value.trim()
    const correoUsuario = document.getElementById('correoUsuario').value.trim()
    const contrasenaUsuario = document.getElementById('contrasenaUsuario').value.trim()
    const idRol = document.getElementById('idRol').value
    const btnRegistrar = document.getElementById('btnRegistrar')

    btnRegistrar.disabled = true
    btnRegistrar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...'

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nombreUsuario, correoUsuario, contrasenaUsuario, idRol })
        })

        const data = await response.json()

        if (data.success) {
            mostrarMensaje('mensajeRegistro', 'Usuario registrado exitosamente', 'success')
            document.getElementById('formRegistroEmpleado').reset()
            document.getElementById('requisitosContrasena').style.display = 'none'
            await cargarUsuarios()
            setTimeout(() => cerrarModal(), 1500)
        } else {
            mostrarMensaje('mensajeRegistro', data.message || 'Error al registrar', 'error')
            btnRegistrar.disabled = false
            btnRegistrar.innerHTML = '<i class="fas fa-save"></i> Registrar'
        }
    } catch (error) {
        mostrarMensaje('mensajeRegistro', 'No se pudo conectar con el servidor', 'error')
        btnRegistrar.disabled = false
        btnRegistrar.innerHTML = '<i class="fas fa-save"></i> Registrar'
    }
})

// ── MODAL EDITAR ROL ───────────────────────────────────────
const modalEditar = document.getElementById('modalEditarRol')

function abrirModalEditar(id, nombre, idRolActual) {
    document.getElementById('editIdUsuario').value = id
    document.getElementById('editNombreUsuario').value = nombre
    document.getElementById('editIdRol').value = idRolActual
    modalEditar.style.display = 'flex'
}

document.getElementById('btnCerrarModalEditar').addEventListener('click', cerrarModalEditar)
document.getElementById('btnCancelarModalEditar').addEventListener('click', cerrarModalEditar)

modalEditar.addEventListener('click', (e) => {
    if (e.target === modalEditar) cerrarModalEditar()
})

function cerrarModalEditar() {
    modalEditar.style.display = 'none'
    ocultarMensaje('mensajeEditar')
}

document.getElementById('formEditarRol').addEventListener('submit', async (e) => {
    e.preventDefault()

    const id = document.getElementById('editIdUsuario').value
    const idRol = document.getElementById('editIdRol').value
    const btnActualizar = e.target.querySelector('.btn-registrar')

    btnActualizar.disabled = true
    btnActualizar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...'

    try {
        const response = await fetch(`${API_URL}/${id}/rol`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ idRol })
        })

        const data = await response.json()

        if (data.success) {
            mostrarMensaje('mensajeEditar', 'Rol actualizado exitosamente', 'success')
            await cargarUsuarios()
            setTimeout(() => cerrarModalEditar(), 1500)
        } else {
            mostrarMensaje('mensajeEditar', data.message || 'Error al actualizar', 'error')
        }
    } catch (error) {
        mostrarMensaje('mensajeEditar', 'No se pudo conectar con el servidor', 'error')
    } finally {
        btnActualizar.disabled = false
        btnActualizar.innerHTML = '<i class="fas fa-save"></i> Actualizar'
    }
})

// ── ELIMINAR USUARIO ───────────────────────────────────────
const modalEliminar = document.getElementById('modalEliminar')
let idUsuarioAEliminar = null

function abrirModalEliminar(id, nombre) {
    idUsuarioAEliminar = id
    document.getElementById('nombreEliminar').textContent = nombre
    modalEliminar.classList.add('active')
}

document.getElementById('cancelarEliminar').addEventListener('click', () => {
    modalEliminar.classList.remove('active')
    idUsuarioAEliminar = null
})

document.getElementById('confirmarEliminar').addEventListener('click', async () => {
    if (!idUsuarioAEliminar) return

    try {
        const response = await fetch(`${API_URL}/${idUsuarioAEliminar}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })

        const data = await response.json()

        if (data.success) {
            modalEliminar.classList.remove('active')
            idUsuarioAEliminar = null
            await cargarUsuarios()
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error)
    }
})