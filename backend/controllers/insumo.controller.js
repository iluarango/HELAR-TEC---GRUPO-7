const pool = require('../config/database.config')
const asyncHandler = require('../utils/asyncHandler')

// Obtener todos los insumos
exports.getInsumos = asyncHandler(async (req, res) => {
    const result = await pool.query('SELECT * FROM insumos ORDER BY idinsumo ASC')
    res.json({ success: true, insumos: result.rows })
})

// Registrar nuevo insumo
exports.register = asyncHandler(async (req, res) => {
    const { nombreInsumo, tipoInsumo, stock, stockMinimo, unidadMedida, fechaCaducidad } = req.body

    if (!nombreInsumo || !tipoInsumo || stock === undefined || !stockMinimo || !unidadMedida) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos obligatorios deben ser completados'
        })
    }

    const result = await pool.query(
        `INSERT INTO insumos (nombreinsumo, tipoinsumo, stock, stockminimo, unidadmedida, fechacaducidad)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [nombreInsumo, tipoInsumo, stock, stockMinimo, unidadMedida, fechaCaducidad || null]
    )

    res.status(201).json({
        success: true,
        message: 'Insumo registrado exitosamente',
        insumo: result.rows[0]
    })
})

// Actualizar estado del insumo (activo/inactivo)
exports.updateEstado = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { estado } = req.body

    if (!estado || !['activo', 'inactivo'].includes(estado)) {
        return res.status(400).json({
            success: false,
            message: "El estado debe ser 'activo' o 'inactivo'"
        })
    }

    const existingInsumo = await pool.query(
        'SELECT idinsumo FROM insumos WHERE idinsumo = $1',
        [id]
    )

    if (existingInsumo.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Insumo no encontrado'
        })
    }

    await pool.query(
        'UPDATE insumos SET estado = $1 WHERE idinsumo = $2',
        [estado, id]
    )

    res.json({ success: true, message: 'Estado del insumo actualizado exitosamente' })
})

// Actualizar insumo
exports.updateInsumo = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { nombreInsumo, tipoInsumo, stock, stockMinimo, unidadMedida, fechaCaducidad } = req.body

    if (!nombreInsumo || !tipoInsumo || stock === undefined || !stockMinimo || !unidadMedida) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos obligatorios deben ser completados'
        })
    }

    const existingInsumo = await pool.query(
        'SELECT idinsumo FROM insumos WHERE idinsumo = $1',
        [id]
    )

    if (existingInsumo.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Insumo no encontrado'
        })
    }

    const result = await pool.query(
        `UPDATE insumos
         SET nombreinsumo = $1, tipoinsumo = $2, stock = $3, stockminimo = $4, unidadmedida = $5, fechacaducidad = $6
         WHERE idinsumo = $7
         RETURNING *`,
        [nombreInsumo, tipoInsumo, stock, stockMinimo, unidadMedida, fechaCaducidad || null, id]
    )

    res.json({
        success: true,
        message: 'Insumo actualizado exitosamente',
        insumo: result.rows[0]
    })
})
