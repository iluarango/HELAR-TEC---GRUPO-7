const pool = require('../config/database')

// Obtener todos los proveedores
exports.getProveedores = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM proveedores ORDER BY idproveedor ASC'
        )

        res.json({
            success: true,
            proveedores: result.rows
        })
    } catch (error) {
        console.error('Error al obtener proveedores:', error)
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        })
    }
}

// Registrar nuevo proveedor
exports.register = async (req, res) => {
    try {
        const { nombreProveedor, contactoProveedor, telefonoProveedor, correoProveedor } = req.body

        if (!nombreProveedor) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del proveedor es obligatorio'
            })
        }

        const result = await pool.query(
            `INSERT INTO proveedores (nombreproveedor, contactoproveedor, telefonoproveedor, correoproveedor, estado)
             VALUES ($1, $2, $3, $4, 'activo')
             RETURNING *`,
            [nombreProveedor, contactoProveedor || null, telefonoProveedor || null, correoProveedor || null]
        )

        res.status(201).json({
            success: true,
            message: 'Proveedor registrado exitosamente',
            proveedor: result.rows[0]
        })
    } catch (error) {
        console.error('Error al registrar proveedor:', error)
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        })
    }
}

// Actualizar proveedor
exports.updateProveedor = async (req, res) => {
    try {
        const { id } = req.params
        const { nombreProveedor, contactoProveedor, telefonoProveedor, correoProveedor } = req.body

        if (!nombreProveedor) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del proveedor es obligatorio'
            })
        }

        const existingProveedor = await pool.query(
            'SELECT idproveedor FROM proveedores WHERE idproveedor = $1',
            [id]
        )

        if (existingProveedor.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Proveedor no encontrado'
            })
        }

        const result = await pool.query(
            `UPDATE proveedores 
             SET nombreproveedor = $1, contactoproveedor = $2, telefonoproveedor = $3, correoproveedor = $4
             WHERE idproveedor = $5
             RETURNING *`,
            [nombreProveedor, contactoProveedor || null, telefonoProveedor || null, correoProveedor || null, id]
        )

        res.json({
            success: true,
            message: 'Proveedor actualizado exitosamente',
            proveedor: result.rows[0]
        })
    } catch (error) {
        console.error('Error al actualizar proveedor:', error)
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        })
    }
}

// Actualizar estado del proveedor (activo/inactivo)
exports.updateEstado = async (req, res) => {
    try {
        const { id } = req.params
        const { estado } = req.body

        if (!estado || !['activo', 'inactivo'].includes(estado)) {
            return res.status(400).json({
                success: false,
                message: "El estado debe ser 'activo' o 'inactivo'"
            })
        }

        const existingProveedor = await pool.query(
            'SELECT idproveedor FROM proveedores WHERE idproveedor = $1',
            [id]
        )

        if (existingProveedor.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Proveedor no encontrado'
            })
        }

        await pool.query(
            'UPDATE proveedores SET estado = $1 WHERE idproveedor = $2',
            [estado, id]
        )

        res.json({
            success: true,
            message: 'Estado del proveedor actualizado exitosamente'
        })
    } catch (error) {
        console.error('Error al actualizar estado del proveedor:', error)
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        })
    }
}