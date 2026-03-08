const pool = require('../config/database')

// Obtener todos los productos con su categoría
exports.getProductos = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.idproducto,
                p.nombreproducto,
                p.descripcionproducto,
                p.preciobase,
                p.estado,
                p.idcategoria,
                c.nombrecategoria
            FROM productos p
            INNER JOIN categorias_producto c ON p.idcategoria = c.idcategoria
            ORDER BY c.nombrecategoria, p.nombreproducto ASC
        `)

        res.json({ success: true, productos: result.rows })
    } catch (error) {
        console.error('Error al obtener productos:', error)
        res.status(500).json({ success: false, message: 'Error en el servidor' })
    }
}

// Registrar nuevo producto
exports.register = async (req, res) => {
    try {
        const { nombreProducto, descripcionProducto, precioBase, idCategoria } = req.body

        if (!nombreProducto || !precioBase || !idCategoria) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, precio y categoría son obligatorios'
            })
        }

        // Verificar que la categoría existe
        const catResult = await pool.query(
            'SELECT idcategoria FROM categorias_producto WHERE idcategoria = $1',
            [idCategoria]
        )

        if (catResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' })
        }

        const result = await pool.query(
            `INSERT INTO productos (nombreproducto, descripcionproducto, preciobase, idcategoria, estado)
             VALUES ($1, $2, $3, $4, 'activo')
             RETURNING *`,
            [nombreProducto, descripcionProducto || null, precioBase, idCategoria]
        )

        res.status(201).json({
            success: true,
            message: 'Producto registrado exitosamente',
            producto: result.rows[0]
        })
    } catch (error) {
        console.error('Error al registrar producto:', error)
        res.status(500).json({ success: false, message: 'Error en el servidor' })
    }
}

// Actualizar producto
exports.updateProducto = async (req, res) => {
    try {
        const { id } = req.params
        const { nombreProducto, descripcionProducto, precioBase, idCategoria } = req.body

        if (!nombreProducto || !precioBase || !idCategoria) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, precio y categoría son obligatorios'
            })
        }

        const result = await pool.query(
            `UPDATE productos 
             SET nombreproducto = $1, descripcionproducto = $2, preciobase = $3, idcategoria = $4
             WHERE idproducto = $5
             RETURNING *`,
            [nombreProducto, descripcionProducto || null, precioBase, idCategoria, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' })
        }

        res.json({ success: true, message: 'Producto actualizado exitosamente', producto: result.rows[0] })
    } catch (error) {
        console.error('Error al actualizar producto:', error)
        res.status(500).json({ success: false, message: 'Error en el servidor' })
    }
}

// Actualizar estado del producto
exports.updateEstado = async (req, res) => {
    try {
        const { id } = req.params
        const { estado } = req.body

        if (!['activo', 'inactivo'].includes(estado)) {
            return res.status(400).json({ success: false, message: 'Estado inválido' })
        }

        const result = await pool.query(
            'UPDATE productos SET estado = $1 WHERE idproducto = $2 RETURNING *',
            [estado, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' })
        }

        res.json({ success: true, message: 'Estado actualizado', producto: result.rows[0] })
    } catch (error) {
        console.error('Error al actualizar estado:', error)
        res.status(500).json({ success: false, message: 'Error en el servidor' })
    }
}