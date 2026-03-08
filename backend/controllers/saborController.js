const pool = require('../config/database')

// Obtener todos los sabores
exports.getSabores = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT idsabor, nombresabor, estado
            FROM sabores
            ORDER BY nombresabor ASC
        `)

        res.json({ success: true, sabores: result.rows })
    } catch (error) {
        console.error('Error al obtener sabores:', error)
        res.status(500).json({ success: false, message: 'Error en el servidor' })
    }
}

// Registrar nuevo sabor
exports.register = async (req, res) => {
    try {
        const { nombreSabor } = req.body

        if (!nombreSabor) {
            return res.status(400).json({ success: false, message: 'El nombre es obligatorio' })
        }

        const result = await pool.query(
            `INSERT INTO sabores (nombresabor, estado)
             VALUES ($1, 'activo')
             RETURNING *`,
            [nombreSabor]
        )

        res.status(201).json({
            success: true,
            message: 'Sabor registrado exitosamente',
            sabor: result.rows[0]
        })
    } catch (error) {
        console.error('Error al registrar sabor:', error)
        res.status(500).json({ success: false, message: 'Error en el servidor' })
    }
}

// Actualizar sabor
exports.updateSabor = async (req, res) => {
    try {
        const { id } = req.params
        const { nombreSabor } = req.body

        if (!nombreSabor) {
            return res.status(400).json({ success: false, message: 'El nombre es obligatorio' })
        }

        const result = await pool.query(
            `UPDATE sabores SET nombresabor = $1 WHERE idsabor = $2 RETURNING *`,
            [nombreSabor, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Sabor no encontrado' })
        }

        res.json({ success: true, message: 'Sabor actualizado', sabor: result.rows[0] })
    } catch (error) {
        console.error('Error al actualizar sabor:', error)
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
            'UPDATE sabores SET estado = $1 WHERE idsabor = $2 RETURNING *',
            [estado, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Sabor no encontrado' })
        }

        res.json({ success: true, message: 'Estado actualizado', sabor: result.rows[0] })
    } catch (error) {
        console.error('Error al actualizar estado:', error)
        res.status(500).json({ success: false, message: 'Error en el servidor' })
    }
}