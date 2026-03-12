const pool = require('../config/database.config')
const asyncHandler = require('../utils/asyncHandler')

/** Ejecuta en paralelo todas las consultas de reporte: ventas, top productos, insumos usados, compras y gastos */
exports.getReportes = asyncHandler(async (req, res) => {
    const [
        ventasHoyResult,
        ventasMesResult,
        topProductosResult,
        insumosUsadosResult,
        comprasPorSemanaResult,
        gastosPorCategoriaResult
    ] = await Promise.all([
        pool.query(`
            SELECT COALESCE(SUM(totalventa), 0) AS total
            FROM ventas
            WHERE DATE(fechaventa) = CURRENT_DATE
        `),
        pool.query(`
            SELECT COALESCE(SUM(totalventa), 0) AS total
            FROM ventas
            WHERE DATE_TRUNC('month', fechaventa) = DATE_TRUNC('month', NOW())
        `),
        pool.query(`
            SELECT p.nombreproducto, SUM(dp.cantidad) AS total
            FROM detalle_pedido dp
            INNER JOIN productos p ON dp.idproducto = p.idproducto
            GROUP BY p.nombreproducto
            ORDER BY total DESC
            LIMIT 5
        `),
        pool.query(`
            SELECT i.nombreinsumo, SUM(ABS(m.cantidadmovimiento)) AS total
            FROM movimientos_inventario m
            INNER JOIN insumos i ON m.idinsumo = i.idinsumo
            GROUP BY i.nombreinsumo
            ORDER BY total DESC
            LIMIT 5
        `),
        pool.query(`
            SELECT DATE_TRUNC('week', fechacompra) AS semana, SUM(totalcompra) AS total
            FROM compras
            WHERE fechacompra >= NOW() - INTERVAL '4 weeks'
            GROUP BY semana
            ORDER BY semana ASC
        `),
        pool.query(`
            SELECT categoriagasto, SUM(montogasto) AS total
            FROM gastos_operativos
            GROUP BY categoriagasto
            ORDER BY total DESC
        `)
    ])

    res.json({
        success: true,
        reportes: {
            ventasHoy:          parseFloat(ventasHoyResult.rows[0].total),
            ventasMes:          parseFloat(ventasMesResult.rows[0].total),
            topProductos:       topProductosResult.rows,
            insumosUsados:      insumosUsadosResult.rows,
            comprasPorSemana:   comprasPorSemanaResult.rows,
            gastosPorCategoria: gastosPorCategoriaResult.rows
        }
    })
})
