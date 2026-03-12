// Importar las funciones de api.js
import { api } from './api.js';

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
            // ✅ Usar la función login de api.js (que ya tiene la URL correcta de Render)
            const data = await api.login({ 
                nombreUsuario, 
                contrasenaUsuario 
            });
            
            console.log('Respuesta del servidor:', data); // Para depuración
            
            if (data.success) {
                // Guardar token y datos del usuario
                localStorage.setItem('token', data.token)
                localStorage.setItem('usuario', JSON.stringify(data.usuario))
                sessionStorage.setItem('loginExitoso', '1')
                
                btnSubmit.textContent = 'Ingresando...'
                
                // Redirigir según el rol
                const destino = data.usuario.rol === 'administrador' ? './admin.html' : './empleado.html'
                
                setTimeout(() => {
                    window.location.href = destino
                }, 2000) // Reducido a 2 segundos
                
                return
            } else {
                mostrarErrorLogin(data.message || 'Credenciales incorrectas')
            }
        } catch (error) {
            console.error('Error en login:', error);
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
            text-align: center;
        `
        loginForm.appendChild(errorEl)
    }

    errorEl.textContent = mensaje
    errorEl.style.display = 'block'
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        if (errorEl) {
            errorEl.style.display = 'none'
        }
    }, 5000)
}