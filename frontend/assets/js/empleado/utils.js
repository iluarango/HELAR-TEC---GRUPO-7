// ── MENSAJES ────────────────────────────────────────────────

function mostrarMensaje(elementId, texto, tipo) {
    const el = document.getElementById(elementId)
    if (!el) return
    const icono = tipo === 'success'
        ? '<i class="fas fa-check-circle" style="margin-right:6px;"></i>'
        : '<i class="fas fa-exclamation-triangle" style="margin-right:6px;"></i>'
    el.innerHTML = icono + texto
    el.style.display = 'block'
    el.style.padding = '10px 14px'
    el.style.borderRadius = '10px'
    el.style.fontSize = '13px'
    el.style.marginBottom = '10px'
    el.style.backgroundColor = tipo === 'success' ? '#d1fae5' : '#fee2e2'
    el.style.color = tipo === 'success' ? '#065f46' : '#991b1b'
}

function ocultarMensaje(elementId) {
    const el = document.getElementById(elementId)
    if (!el) return
    el.innerHTML = ''
    el.style.display = 'none'
}

function mensajeFilaTabla(texto, colspan) {
    return `
        <tr>
            <td colspan="${colspan}" style="text-align: center; padding: 40px; color: #999;">
                ${texto}
            </td>
        </tr>
    `
}

// ── VALIDACIÓN DE FORMULARIOS (intercepta todos los forms con novalidate) ──
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form[novalidate]').forEach(form => {
        form.addEventListener('submit', (e) => {
            let hayErrores = false

            form.querySelectorAll('[required]').forEach(input => {
                if (!input.value || !input.value.trim()) {
                    hayErrores = true
                    input.classList.add('input-invalido')
                    const quitarError = () => {
                        input.classList.remove('input-invalido')
                        input.removeEventListener('input', quitarError)
                        input.removeEventListener('change', quitarError)
                    }
                    input.addEventListener('input', quitarError)
                    input.addEventListener('change', quitarError)
                }
            })

            if (hayErrores) {
                e.preventDefault()
                e.stopImmediatePropagation()
                // Buscar div de mensaje dentro del modal más cercano
                const msgEl = form.querySelector('[id*="mensaje"]')
                    || form.closest('.modal-contenido')?.querySelector('[id*="mensaje"]')
                if (msgEl) {
                    mostrarMensaje(msgEl.id, 'Completa todos los campos obligatorios', 'error')
                }
            }
        }, true) // fase captura — corre antes que los handlers individuales
    })
})
