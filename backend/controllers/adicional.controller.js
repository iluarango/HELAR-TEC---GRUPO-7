const pool = require('../config/database.config')
const asyncHandler = require('../utils/asyncHandler')

/* Devuelve todos los adicionales ordenados por id */
exports.getAdicionales = asyncHandler(async (req, res) => {
    const result = await pool.query(
        'SELECT * FROM adicionales ORDER BY idadicional ASC'
    )
    res.json({ success: true, adicionales: result.rows })
})

/* Registra un nuevo adicional con nombre y precio */
exports.register = asyncHandler(async (req, res) => {
    const { nombre, precio } = req.body

    if (!nombre || !precio) {
        return res.status(400).json({ success: false, message: 'Nombre y precio son requeridos' })
    }

    const result = await pool.query(
        `INSERT INTO adicionales (nombre, precio) VALUES ($1, $2) RETURNING *`,
        [nombre.trim(), precio]
    )
    res.status(201).json({ success: true, message: 'Adicional registrado', adicional: result.rows[0] })
})

/* Actualiza nombre y precio de un adicional por id */
exports.update = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { nombre, precio } = req.body

    const result = await pool.query(
        `UPDATE adicionales SET nombre = $1, precio = $2 WHERE idadicional = $3 RETURNING *`,
        [nombre.trim(), precio, id]
    )

    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Adicional no encontrado' })
    }
    res.json({ success: true, message: 'Adicional actualizado', adicional: result.rows[0] })
})

/** Activa o desactiva un adicional */
exports.updateEstado = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { estado } = req.body

    await pool.query(
        'UPDATE adicionales SET estado = $1 WHERE idadicional = $2',
        [estado, id]
    )
    res.json({ success: true, message: 'Estado actualizado' })
})
