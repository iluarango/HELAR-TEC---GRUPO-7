// ── MENSAJES ────────────────────────────────────────────────

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

function mensajeFilaTabla(texto, colspan) {
    return `
        <tr>
            <td colspan="${colspan}" style="text-align: center; padding: 40px; color: #999;">
                ${texto}
            </td>
        </tr>
    `
}
