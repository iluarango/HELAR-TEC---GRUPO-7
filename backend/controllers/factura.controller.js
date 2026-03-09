const pool = require('../config/database.config')
const asyncHandler = require('../utils/asyncHandler')

exports.getFacturas = asyncHandler(async (req, res) => {
    const result = await pool.query(`
        SELECT
            f.idfactura,
            f.fechafactura,
            f.direccionfactura,
            f.subtotal,
            f.total,
            f.metodopago,
            f.adicionales,
            f.idventa,
            f.idusuario,
            u.nombreusuario
        FROM facturas f
        INNER JOIN usuarios u ON f.idusuario = u.idusuario
        ORDER BY f.idfactura DESC
    `)
    res.json({ success: true, facturas: result.rows })
})

exports.registerFactura = asyncHandler(async (req, res) => {
    const { idVenta, direccionFactura, metodoPago, adicionales } = req.body
    const idusuario = req.idusuario

    if (!idVenta || !metodoPago) {
        return res.status(400).json({
            success: false,
            message: 'La venta y el método de pago son requeridos'
        })
    }

    // Verificar que la venta existe y obtener el total
    const ventaResult = await pool.query(
        'SELECT totalventas FROM ventas WHERE idventa = $1',
        [idVenta]
    )

    if (ventaResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Venta no encontrada' })
    }

    // Verificar que no tiene factura ya generada
    const facturaExistente = await pool.query(
        'SELECT idfactura FROM facturas WHERE idventa = $1',
        [idVenta]
    )

    if (facturaExistente.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Esta venta ya tiene una factura generada' })
    }

    const subtotal = parseFloat(ventaResult.rows[0].totalventas)
    const total = subtotal

    const result = await pool.query(
        `INSERT INTO facturas (fechafactura, direccionfactura, idventa, subtotal, total, metodopago, adicionales, idusuario)
         VALUES (CURRENT_DATE, $1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [direccionFactura || null, idVenta, subtotal, total, metodoPago, adicionales || null, idusuario]
    )

    res.status(201).json({
        success: true,
        message: 'Factura generada exitosamente',
        factura: result.rows[0]
    })
})
