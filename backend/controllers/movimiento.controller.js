const pool = require('../config/database.config')
const asyncHandler = require('../utils/asyncHandler')

/** Devuelve todos los movimientos de inventario con insumo y usuario */
exports.getMovimientos = asyncHandler(async (req, res) => {
    const result = await pool.query(`
        SELECT
            m.idmovimiento,
            m.cantidadmovimiento,
            m.fechamovimiento,
            m.motivomovimiento,
            i.nombreinsumo,
            i.unidadmedida,
            u.nombreusuario
        FROM movimientos_inventario m
        INNER JOIN insumos i ON m.idinsumo = i.idinsumo
        INNER JOIN usuarios u ON m.idusuario = u.idusuario
        ORDER BY m.idmovimiento DESC
    `)
    res.json({ success: true, movimientos: result.rows })
})

/** Registra una salida de inventario, descuenta stock y señaliza si queda bajo el mínimo */
exports.registerMovimiento = asyncHandler(async (req, res) => {
    const { idInsumo, cantidad, motivo } = req.body
    const idusuario = req.idusuario

    if (!idInsumo || !cantidad || cantidad <= 0 || !motivo || !motivo.trim()) {
        return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' })
    }

    const insumoResult = await pool.query(
        'SELECT stock, nombreinsumo FROM insumos WHERE idinsumo = $1 AND estado = $2',
        [idInsumo, 'activo']
    )

    if (insumoResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Insumo no encontrado' })
    }

    const stockActual = parseFloat(insumoResult.rows[0].stock)

    if (cantidad > stockActual) {
        return res.status(400).json({
            success: false,
            message: `Stock insuficiente. Stock actual: ${stockActual}`
        })
    }

    await pool.query(
        `INSERT INTO movimientos_inventario (idinsumo, cantidadmovimiento, fechamovimiento, motivomovimiento, idusuario)
         VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4)`,
        [idInsumo, cantidad, motivo.trim(), idusuario]
    )

    await pool.query(
        'UPDATE insumos SET stock = stock - $1 WHERE idinsumo = $2',
        [cantidad, idInsumo]
    )

    const stockActualizado = await pool.query(
        'SELECT stock, stockminimo FROM insumos WHERE idinsumo = $1',
        [idInsumo]
    )
    const { stock, stockminimo } = stockActualizado.rows[0]
    const alertaStock = parseFloat(stock) <= parseFloat(stockminimo)

    res.status(201).json({
        success: true,
        message: 'Movimiento registrado',
        alertaStock,
        stockRestante: stock
    })
})
