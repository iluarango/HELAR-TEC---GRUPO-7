// ── HELPERS DE UI ──────────────────────────────────────────
// Rastrea secciones ya cargadas para evitar doble carga al navegar
const _adminSeccionesYaCargadas = new Set()

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

function mensajeFila(texto, colspan) {
    return `
        <tr>
            <td colspan="${colspan}" style="text-align: center; padding: 40px; color: #999;">
                ${texto}
            </td>
        </tr>
    `
}

// ── VALIDACIÓN DE FORMULARIOS ──────────────────────────────
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
                const msgEl = form.querySelector('[id*="mensaje"]')
                    || form.closest('.modal-contenido')?.querySelector('[id*="mensaje"]')
                if (msgEl) {
                    mostrarMensaje(msgEl.id, 'Completa todos los campos obligatorios', 'error')
                }
            }
        }, true)
    })
})

// ── DROPDOWN ESTADO ────────────────────────────────────────

function toggleDropdownEstado(event, id) {
    event.stopPropagation()

    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => {
        if (d.id !== `dropdown-${id}`) d.classList.remove('abierto')
    })

    const dropdown = document.getElementById(`dropdown-${id}`)
    const badge = event.currentTarget
    const rect = badge.getBoundingClientRect()

    dropdown.style.top = `${rect.top}px`
    dropdown.style.left = `${rect.right + 8}px`

    dropdown.classList.toggle('abierto')
}

document.addEventListener('click', () => {
    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => {
        d.classList.remove('abierto')
    })
})

async function cambiarEstado(id, nuevoEstado) {
    document.getElementById(`dropdown-${id}`).classList.remove('abierto')

    try {
        const response = await fetch(`${API_URL}/${id}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: nuevoEstado })
        })

        const data = await response.json()

        if (data.success) await cargarUsuarios()
    } catch (error) {
        console.error('Error al cambiar estado:', error)
    }
}