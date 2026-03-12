const pool = require('../config/database.config')
const asyncHandler = require('../utils/asyncHandler')

/** Devuelve todos los gastos operativos con nombre de usuario */
exports.getGastos = asyncHandler(async (req, res) => {
    const result = await pool.query(`
        SELECT
            g.idgastooperativo,
            g.fechagasto,
            g.categoriagasto,
            g.montogasto,
            g.metodopago,
            g.fechavencimiento,
            g.estadogasto,
            u.nombreusuario
        FROM gastos_operativos g
        INNER JOIN usuarios u ON g.idusuario = u.idusuario
        ORDER BY g.idgastooperativo DESC
    `)
    res.json({ success: true, gastos: result.rows })
})

/** Registra un nuevo gasto operativo con estado inicial 'pendiente' */
exports.registerGasto = asyncHandler(async (req, res) => {
    const { fechaGasto, categoriaGasto, montoGasto, metodoPago, fechaVencimiento } = req.body
    const idusuario = req.idusuario

    if (!fechaGasto || !categoriaGasto || !montoGasto) {
        return res.status(400).json({ success: false, message: 'Todos los campos obligatorios deben completarse' })
    }

    const result = await pool.query(
        `INSERT INTO gastos_operativos (fechagasto, categoriagasto, montogasto, metodopago, fechavencimiento, estadogasto, idusuario)
         VALUES ($1, $2, $3, $4, $5, 'pendiente', $6)
         RETURNING *`,
        [fechaGasto, categoriaGasto, montoGasto, metodoPago || null, fechaVencimiento || null, idusuario]
    )

    res.status(201).json({ success: true, message: 'Gasto registrado exitosamente', gasto: result.rows[0] })
})

/** Cambia el estado del gasto a 'pagado' (requiere metodoPago) o 'pendiente' */
exports.updateEstadoGasto = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { estado, metodoPago } = req.body

    if (!['pendiente', 'pagado'].includes(estado)) {
        return res.status(400).json({ success: false, message: 'Estado inválido' })
    }

    if (estado === 'pagado' && !metodoPago) {
        return res.status(400).json({ success: false, message: 'El método de pago es requerido al pagar' })
    }

    await pool.query(
        `UPDATE gastos_operativos
         SET estadogasto = $1 ${estado === 'pagado' ? ', metodopago = $3' : ''}
         WHERE idgastooperativo = $2`,
        estado === 'pagado' ? [estado, id, metodoPago] : [estado, id]
    )

    res.json({ success: true, message: 'Estado actualizado' })
})
