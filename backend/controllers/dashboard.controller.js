const pool = require('../config/database.config')
const asyncHandler = require('../utils/asyncHandler')

exports.getDashboard = asyncHandler(async (req, res) => {
    const [
        pedidosHoy,
        pedidosPendientes,
        ventasMes,
        totalProveedores,
        totalInsumos,
        insumosStockBajo,
        totalProductos
    ] = await Promise.all([
        pool.query("SELECT COUNT(*) FROM pedidos WHERE DATE(fechapedido) = CURRENT_DATE"),
        pool.query("SELECT COUNT(*) FROM pedidos WHERE estadopedido = 'pendiente'"),
        pool.query("SELECT COALESCE(SUM(totalventa), 0) AS total FROM ventas WHERE DATE_TRUNC('month', fechaventa) = DATE_TRUNC('month', NOW())"),
        pool.query("SELECT COUNT(*) FROM proveedores WHERE estado = 'activo'"),
        pool.query("SELECT COUNT(*) FROM insumos WHERE estado = 'activo'"),
        pool.query("SELECT COUNT(*) FROM insumos WHERE stock <= stockminimo AND estado = 'activo'"),
        pool.query("SELECT COUNT(*) FROM productos WHERE estado = 'activo'")
    ])

    res.json({
        success: true,
        dashboard: {
            pedidosHoy:        parseInt(pedidosHoy.rows[0].count),
            pedidosPendientes: parseInt(pedidosPendientes.rows[0].count),
            ventasMes:         parseFloat(ventasMes.rows[0].total),
            totalProveedores:  parseInt(totalProveedores.rows[0].count),
            totalInsumos:      parseInt(totalInsumos.rows[0].count),
            insumosStockBajo:  parseInt(insumosStockBajo.rows[0].count),
            totalProductos:    parseInt(totalProductos.rows[0].count)
        }
    })
})
