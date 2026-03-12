const pool = require('../config/database.config')
const asyncHandler = require('../utils/asyncHandler')

/** Devuelve todas las ventas con flag tiene_factura para saber si ya fueron facturadas */
exports.getVentas = asyncHandler(async (req, res) => {
    const result = await pool.query(`
        SELECT
            v.idventa,
            v.fechaventa,
            v.idpedido,
            v.idusuario,
            v.totalventa,
            u.nombreusuario,
            EXISTS (
                SELECT 1 FROM facturas f WHERE f.idventa = v.idventa
            ) AS tiene_factura
        FROM ventas v
        INNER JOIN usuarios u ON v.idusuario = u.idusuario
        ORDER BY v.idventa DESC
    `)
    res.json({ success: true, ventas: result.rows })
})

/** Devuelve una venta por id con sus líneas de detalle del pedido asociado */
exports.getVentaById = asyncHandler(async (req, res) => {
    const { id } = req.params

    const ventaResult = await pool.query(`
        SELECT
            v.idventa,
            v.fechaventa,
            v.idpedido,
            v.idusuario,
            v.totalventa,
            u.nombreusuario
        FROM ventas v
        INNER JOIN usuarios u ON v.idusuario = u.idusuario
        WHERE v.idventa = $1
    `, [id])

    if (ventaResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Venta no encontrada' })
    }

    const detallesResult = await pool.query(`
        SELECT
            dp.cantidad,
            dp.precio,
            dp.subtotal,
            dp.sabores,
            pr.nombreproducto
        FROM detalle_pedido dp
        INNER JOIN productos pr ON dp.idproducto = pr.idproducto
        WHERE dp.idpedido = $1
    `, [ventaResult.rows[0].idpedido])

    res.json({
        success: true,
        venta: { ...ventaResult.rows[0], detalles: detallesResult.rows }
    })
})
