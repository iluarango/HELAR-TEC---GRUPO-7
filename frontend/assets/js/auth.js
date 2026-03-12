const API_URL = 'http://localhost:3000/api/auth'

const loginForm = document.getElementById('loginForm')

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault()

        const nombreUsuario = document.getElementById('usuario').value.trim()
        const contrasenaUsuario = document.getElementById('contrasena').value.trim()
        const btnSubmit = loginForm.querySelector('button[type="submit"]')

        btnSubmit.disabled = true
        btnSubmit.textContent = 'Iniciando sesión...'

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombreUsuario, contrasenaUsuario })
            })

            const data = await response.json()
            if (data.success) {
                localStorage.setItem('token', data.token)
                localStorage.setItem('usuario', JSON.stringify(data.usuario))
                sessionStorage.setItem('loginExitoso', '1')
                btnSubmit.textContent = 'Ingresando...'
                const destino = data.usuario.rol === 'administrador' ? './admin.html' : './empleado.html'
                setTimeout(() => {
                    window.location.href = destino
                }, 3000)
                return
            } else {
                mostrarErrorLogin(data.message || 'Credenciales incorrectas')
            }
        } catch (error) {
            mostrarErrorLogin('No se pudo conectar con el servidor')
        }

        btnSubmit.disabled = false
        btnSubmit.textContent = 'Iniciar sesión'
    })
}

/** Crea o reutiliza el div de error bajo el formulario y muestra el mensaje */
function mostrarErrorLogin(mensaje) {
    
    let errorEl = document.getElementById('mensajeError')

    if (!errorEl) {
        errorEl = document.createElement('div')
        errorEl.id = 'mensajeError'
        errorEl.style.cssText = `
            background: #fee2e2;
            color: #991b1b;
            padding: 10px 14px;
            border-radius: 10px;
            font-size: 13px;
            margin-top: 10px;
        `
        loginForm.appendChild(errorEl)
    }

    errorEl.textContent = mensaje
    errorEl.style.display = 'block'
}