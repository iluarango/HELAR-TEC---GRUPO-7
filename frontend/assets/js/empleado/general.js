/** Obtiene los KPIs del dashboard y los inyecta en las tarjetas del panel general */
async function cargarDashboard() {
    try {
        const data = await apiFetch('/dashboard')
        if (!data.success) return

        const d = data.dashboard
        document.getElementById('card-pedidos-hoy').textContent      = d.pedidosHoy
        document.getElementById('card-pendientes').textContent        = d.pedidosPendientes
        document.getElementById('card-ventas-hoy').textContent       = `$${d.ventasHoy.toLocaleString('es-CO')}`
        document.getElementById('card-ventas-mes').textContent        = `$${d.ventasMes.toLocaleString('es-CO')}`
        document.getElementById('card-proveedores').textContent       = d.totalProveedores
        document.getElementById('card-insumos').textContent           = d.totalInsumos
        document.getElementById('card-stock-bajo').textContent        = d.insumosStockBajo
        document.getElementById('card-productos').textContent         = d.totalProductos
    } catch (error) {
        console.error('Error cargando dashboard', error)
    }
}
