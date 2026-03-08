const pool = require('../config/database')

// Obtener todas las categorías
exports.getCategorias = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT idcategoria, nombrecategoria, estado
            FROM categorias_producto
            ORDER BY nombrecategoria ASC
        `)

        res.json({ success: true, categorias: result.rows })
    } catch (error) {
        console.error('Error al obtener categorías:', error)
        res.status(500).json({ success: false, message: 'Error en el servidor' })
    }
}

// Registrar nueva categoría
exports.register = async (req, res) => {
    try {
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
    } catch (error) {
        console.error('Error al registrar categoría:', error)
        res.status(500).json({ success: false, message: 'Error en el servidor' })
    }
}

// Actualizar categoría
exports.updateCategoria = async (req, res) => {
    try {
        const { id } = req.params
        const { nombreCategoria } = req.body

        if (!nombreCategoria) {
            return res.status(400).json({ success: false, message: 'El nombre es obligatorio' })
        }

        const result = await pool.query(
            `UPDATE categorias_producto SET nombrecategoria = $1 WHERE idcategoria = $2 RETURNING *`,
            [nombreCategoria, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' })
        }

        res.json({ success: true, message: 'Categoría actualizada', categoria: result.rows[0] })
    } catch (error) {
        console.error('Error al actualizar categoría:', error)
        res.status(500).json({ success: false, message: 'Error en el servidor' })
    }
}

// Actualizar estado
exports.updateEstado = async (req, res) => {
    try {
        const { id } = req.params
        const { estado } = req.body

        if (!['activo', 'inactivo'].includes(estado)) {
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
    } catch (error) {
        console.error('Error al actualizar estado:', error)
        res.status(500).json({ success: false, message: 'Error en el servidor' })
    }
}