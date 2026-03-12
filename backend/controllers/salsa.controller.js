const pool = require('../config/database.config')
const asyncHandler = require('../utils/asyncHandler')

// Obtener todas las salsas
exports.getSalsas = asyncHandler(async (req, res) => {
    const result = await pool.query(`
        SELECT idsalsa, nombresalsa, estado
        FROM salsas
        ORDER BY nombresalsa ASC
    `)

    res.json({ success: true, salsas: result.rows })
})

// Registrar nueva salsa
exports.register = asyncHandler(async (req, res) => {
    const { nombreSalsa } = req.body

    if (!nombreSalsa) {
        return res.status(400).json({ success: false, message: 'El nombre es obligatorio' })
    }

    const result = await pool.query(
        `INSERT INTO salsas (nombresalsa, estado)
         VALUES ($1, 'activo')
         RETURNING *`,
        [nombreSalsa]
    )

    res.status(201).json({
        success: true,
        message: 'Salsa registrada exitosamente',
        salsa: result.rows[0]
    })
})

// Actualizar salsa
exports.updateSalsa = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { nombreSalsa } = req.body

    if (!nombreSalsa) {
        return res.status(400).json({ success: false, message: 'El nombre es obligatorio' })
    }

    const result = await pool.query(
        'UPDATE salsas SET nombresalsa = $1 WHERE idsalsa = $2 RETURNING *',
        [nombreSalsa, id]
    )

    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Salsa no encontrada' })
    }

    res.json({ success: true, message: 'Salsa actualizada', salsa: result.rows[0] })
})

// Actualizar estado
exports.updateEstado = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { estado } = req.body

    if (!estado || !['activo', 'inactivo'].includes(estado)) {
        return res.status(400).json({ success: false, message: 'Estado inválido' })
    }

    const result = await pool.query(
        'UPDATE salsas SET estado = $1 WHERE idsalsa = $2 RETURNING *',
        [estado, id]
    )

    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Salsa no encontrada' })
    }

    res.json({ success: true, message: 'Estado actualizado', salsa: result.rows[0] })
})
