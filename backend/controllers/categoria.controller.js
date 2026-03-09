const pool = require('../config/database.config')
const asyncHandler = require('../utils/asyncHandler')

// Obtener todas las categorías
exports.getCategorias = asyncHandler(async (req, res) => {
    const result = await pool.query(`
        SELECT idcategoria, nombrecategoria, estado
        FROM categorias_producto
        ORDER BY nombrecategoria ASC
    `)

    res.json({ success: true, categorias: result.rows })
})

// Registrar nueva categoría
exports.register = asyncHandler(async (req, res) => {
    const { nombreCategoria } = req.body

    if (!nombreCategoria) {
        return res.status(400).json({ success: false, message: 'El nombre es obligatorio' })
    }

    const result = await pool.query(
        `INSERT INTO categorias_producto (nombrecategoria, estado)
         VALUES ($1, 'activo')
         RETURNING *`,
        [nombreCategoria]
    )

    res.status(201).json({
        success: true,
        message: 'Categoría registrada exitosamente',
        categoria: result.rows[0]
    })
})

// Actualizar categoría
exports.updateCategoria = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { nombreCategoria } = req.body

    if (!nombreCategoria) {
        return res.status(400).json({ success: false, message: 'El nombre es obligatorio' })
    }

    const result = await pool.query(
        'UPDATE categorias_producto SET nombrecategoria = $1 WHERE idcategoria = $2 RETURNING *',
        [nombreCategoria, id]
    )

    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Categoría no encontrada' })
    }

    res.json({ success: true, message: 'Categoría actualizada', categoria: result.rows[0] })
})

// Actualizar estado
exports.updateEstado = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { estado } = req.body

    if (!estado || !['activo', 'inactivo'].includes(estado)) {
        return res.status(400).json({ success: false, message: 'Estado inválido' })
    }

    const result = await pool.query(
        'UPDATE categorias_producto SET estado = $1 WHERE idcategoria = $2 RETURNING *',
        [estado, id]
    )

    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Categoría no encontrada' })
    }

    res.json({ success: true, message: 'Estado actualizado', categoria: result.rows[0] })
})
