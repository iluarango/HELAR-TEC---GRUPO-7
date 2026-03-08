// ── HELPERS DE UI ──────────────────────────────────────────

function mostrarMensaje(elementId, texto, tipo) {
    const el = document.getElementById(elementId)
    el.textContent = texto
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
    el.textContent = ''
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

// ── DROPDOWN ESTADO ────────────────────────────────────────

function toggleDropdownEstado(event, id) {
    event.stopPropagation()

    document.querySelectorAll('.estado-dropdown.abierto').forEach(d => {
        if (d.id !== `dropdown-${id}`) d.classList.remove('abierto')
    })

    const dropdown = document.getElementById(`dropdown-${id}`)
    const badge = event.currentTarget
    const rect = badge.getBoundingClientRect()

    dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`
    dropdown.style.left = `${rect.left + window.scrollX}px`

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