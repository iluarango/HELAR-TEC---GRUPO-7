const API_REPORTES = 'https://helar-tec-grupo-7.onrender.com/api/reportes'

let chartProductos = null
let chartInsumos   = null
let chartCompras   = null
let chartGastos    = null

// ── CARGAR REPORTES ─────────────────────────────────────────────
/** Obtiene datos del endpoint de reportes y renderiza los cuatro gráficos Chart.js */
async function cargarReportes() {
    try {
        const response = await fetch(API_REPORTES, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()

        if (!data.success || !data.reportes) {
            mostrarMensajeReporte('Error:' + (data.message || 'No se pudieron cargar los datos'), 'error')
            return
        }

        const { ventasHoy, ventasMes, topProductos, insumosUsados, comprasPorSemana, gastosPorCategoria } = data.reportes

        document.getElementById('reporteVentasHoy').textContent = '$' + parseFloat(ventasHoy).toLocaleString('es-CO')
        document.getElementById('reporteVentasMes').textContent = '$' + parseFloat(ventasMes).toLocaleString('es-CO')

        if (chartProductos) chartProductos.destroy()
        chartProductos = new Chart(document.getElementById('chartProductos').getContext('2d'), {
            type: 'bar',
            data: {
                labels: topProductos.map(p => p.nombreproducto),
                datasets: [{ label: 'Cantidad vendida', data: topProductos.map(p => parseFloat(p.total)), backgroundColor: '#a47c7c', borderRadius: 6 }]
            },
            options: { indexAxis: 'y', responsive: true, animation: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } }
        })

        if (chartInsumos) chartInsumos.destroy()
        chartInsumos = new Chart(document.getElementById('chartInsumos').getContext('2d'), {
            type: 'bar',
            data: {
                labels: insumosUsados.map(i => i.nombreinsumo),
                datasets: [{ label: 'Cantidad usada', data: insumosUsados.map(i => parseFloat(i.total)), backgroundColor: '#c9956c', borderRadius: 6 }]
            },
            options: { indexAxis: 'y', responsive: true, animation: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } }
        })

        if (chartCompras) chartCompras.destroy()
        chartCompras = new Chart(document.getElementById('chartCompras').getContext('2d'), {
            type: 'line',
            data: {
                labels: comprasPorSemana.map(c => new Date(c.semana).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })),
                datasets: [{ label: 'Total compras', data: comprasPorSemana.map(c => parseFloat(c.total)), borderColor: '#a47c7c', backgroundColor: 'rgba(164,124,124,0.15)', fill: true, tension: 0.4, pointBackgroundColor: '#a47c7c', pointRadius: 5 }]
            },
            options: { responsive: true, animation: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        })

        if (chartGastos) chartGastos.destroy()
        chartGastos = new Chart(document.getElementById('chartGastos').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: gastosPorCategoria.map(g => g.categoriagasto),
                datasets: [{ data: gastosPorCategoria.map(g => parseFloat(g.total)), backgroundColor: ['#a47c7c', '#c9956c', '#d4a574', '#e8b4b8', '#8b6565', '#c4847a', '#deba9b'], borderWidth: 2, borderColor: '#fff' }]
            },
            options: { responsive: true, animation: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 16 } } } }
        })

    } catch (err) {
        console.error('Error al cargar reportes:', err)
        mostrarMensajeReporte('Error:Error al cargar los datos del reporte', 'error')
    }
}

// ── GENERAR Y DESCARGAR PDF ──────────────────────────────────────
// Construye el PDF directamente con jsPDF usando chart.toBase64Image().
// No se usa html2canvas para evitar el problema de canvas vacíos en el clon.
async function generarArchivo() {
    if (!window.jspdf) {
        mostrarMensajeReporte('Error:jsPDF no disponible. Recarga la página.', 'error')
        return
    }
    if (!chartProductos || !chartInsumos || !chartCompras || !chartGastos) {
        mostrarMensajeReporte('Error:Los gráficos aún no están listos. Espera un momento.', 'error')
        return
    }

    const { jsPDF } = window.jspdf
    const btn = document.getElementById('btnGenerarArchivo')
    btn.disabled = true
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...'

    try {
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const pageW  = 210
        const margin = 14
        const colW   = (pageW - margin * 2 - 8) / 2   // ancho de cada columna

        // ── Encabezado ──────────────────────────────────────────
        pdf.setFillColor(252, 234, 234)
        pdf.rect(0, 0, pageW, 28, 'F')
        pdf.setFontSize(18)
        pdf.setTextColor(164, 124, 124)
        pdf.text('HELAR-TEC — Reporte General', margin, 18)
        pdf.setFontSize(9)
        pdf.setTextColor(160, 140, 140)
        const fechaStr = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
        pdf.text(fechaStr, pageW - margin, 18, { align: 'right' })

        // ── Tarjetas de ventas ───────────────────────────────────
        const ventasHoy = document.getElementById('reporteVentasHoy').textContent
        const ventasMes = document.getElementById('reporteVentasMes').textContent
        let y = 35

        ;[
            { label: 'Ventas de hoy', valor: ventasHoy,  x: margin },
            { label: 'Ventas del mes', valor: ventasMes, x: margin + colW + 8 }
        ].forEach(({ label, valor, x }) => {
            pdf.setFillColor(255, 245, 245)
            pdf.setDrawColor(230, 200, 200)
            pdf.setLineWidth(0.3)
            pdf.roundedRect(x, y, colW, 20, 3, 3, 'FD')
            pdf.setFontSize(8)
            pdf.setTextColor(130, 100, 100)
            pdf.text(label, x + 5, y + 7)
            pdf.setFontSize(15)
            pdf.setTextColor(164, 124, 124)
            pdf.text(valor, x + 5, y + 16)
        })

        y += 26

        // ── Gráficos (2 columnas x 2 filas) ─────────────────────
        const chartH = 62
        const charts = [
            { inst: chartProductos, titulo: 'Productos más vendidos'             },
            { inst: chartInsumos,   titulo: 'Insumos más usados'                 },
            { inst: chartCompras,   titulo: 'Compras por semana'                 },
            { inst: chartGastos,    titulo: 'Gastos por categoría'               }
        ]

        charts.forEach(({ inst, titulo }, i) => {
            const col = i % 2
            const row = Math.floor(i / 2)
            const cx  = margin + col * (colW + 8)
            const cy  = y + row * (chartH + 18)

            // Marco de la tarjeta
            pdf.setFillColor(255, 255, 255)
            pdf.setDrawColor(235, 210, 210)
            pdf.setLineWidth(0.3)
            pdf.roundedRect(cx, cy, colW, chartH + 10, 3, 3, 'FD')

            // Título del gráfico
            pdf.setFontSize(8)
            pdf.setTextColor(164, 124, 124)
            pdf.text(titulo, cx + 4, cy + 7)

            // Imagen del chart
            const imgData = inst.toBase64Image('image/png', 1.0)
            pdf.addImage(imgData, 'PNG', cx + 2, cy + 10, colW - 4, chartH - 2)
        })

        // ── Descargar ────────────────────────────────────────────
        const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')
        pdf.save(`reporte-${ts}.pdf`)
        mostrarToastReporte('PDF descargado correctamente')

    } catch (err) {
        console.error('Error al generar PDF:', err)
        mostrarMensajeReporte('Error:No se pudo generar el PDF: ' + err.message, 'error')
    } finally {
        btn.disabled = false
        btn.innerHTML = '<i class="fas fa-file-arrow-down"></i> Descargar PDF'
    }
}

// ── TOAST ────────────────────────────────────────────────────────
/** Muestra un toast de confirmación y lo oculta automáticamente tras 3 segundos */
function mostrarToastReporte(texto) {
    const toast = document.getElementById('toastReporte')
    toast.querySelector('.toast-texto').textContent = texto
    toast.style.display = 'flex'
    toast.style.opacity = '1'
    setTimeout(() => {
        toast.style.transition = 'opacity 0.5s'
        toast.style.opacity = '0'
        setTimeout(() => { toast.style.display = 'none'; toast.style.transition = '' }, 500)
    }, 3000)
}

function mostrarMensajeReporte(texto, tipo) {
    const el = document.getElementById('mensajeReporte')
    if (!el) return
    el.textContent = texto
    el.style.display = 'block'
    el.style.padding = '10px 16px'
    el.style.borderRadius = '8px'
    el.style.fontSize = '14px'
    el.style.background = tipo === 'success' ? '#d1fae5' : '#fee2e2'
    el.style.color = tipo === 'success' ? '#065f46' : '#991b1b'
    setTimeout(() => { el.style.display = 'none' }, 5000)
}
