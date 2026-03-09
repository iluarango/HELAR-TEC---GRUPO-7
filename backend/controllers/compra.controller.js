const pool = require('../config/database.config')
const asyncHandler = require('../utils/asyncHandler')

// Obtener todas las compras con su proveedor y detalles
exports.getCompras = asyncHandler(async (req, res) => {
    const comprasResult = await pool.query(`
        SELECT
            c.idcompra,
            c.fechacompra,
            c.totalcompra,
            p.nombreproveedor,
            p.idproveedor
        FROM compras c
        INNER JOIN proveedores p ON c.idproveedor = p.idproveedor
        ORDER BY c.idcompra DESC
    `)

    const compras = await Promise.all(comprasResult.rows.map(async (compra) => {
        const detallesResult = await pool.query(`
            SELECT
                dc.iddetallecompra,
                dc.cantidadcompra,
                dc.preciounitario,
                dc.fechacaducidad,
                dc.cantidadcompra * dc.preciounitario AS subtotal,
                i.idinsumo,
                i.nombreinsumo,
                i.unidadmedida
            FROM detalle_compra dc
            INNER JOIN insumos i ON dc.idinsumo = i.idinsumo
            WHERE dc.idcompra = $1
        `, [compra.idcompra])

        return { ...compra, detalles: detallesResult.rows }
    }))

    res.json({ success: true, compras })
})

// Registrar nueva compra con detalles y actualizar stock
exports.register = asyncHandler(async (req, res) => {
    const { idProveedor, fechaCompra, detalles } = req.body

    if (!idProveedor || !detalles || detalles.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El proveedor y al menos un detalle son obligatorios'
        })
    }

    // Validar todos los detalles antes de abrir la transacción
    for (const detalle of detalles) {
        if (!detalle.idInsumo || !detalle.cantidadCompra || !detalle.precioUnitario) {
            return res.status(400).json({
                success: false,
                message: 'Cada detalle debe tener insumo, cantidad y precio'
            })
        }
    }

    const proveedorResult = await pool.query(
        'SELECT idproveedor FROM proveedores WHERE idproveedor = $1',
        [idProveedor]
    )

    if (proveedorResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Proveedor no encontrado'
        })
    }

    const totalCompra = detalles.reduce((acc, d) => acc + (d.cantidadCompra * d.precioUnitario), 0)

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const compraResult = await client.query(
            `INSERT INTO compras (fechacompra, idproveedor, totalcompra)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [fechaCompra || new Date(), idProveedor, totalCompra]
        )

        const idCompra = compraResult.rows[0].idcompra

        for (const detalle of detalles) {
            const { idInsumo, cantidadCompra, precioUnitario, fechaCaducidad } = detalle

            await client.query(
                `INSERT INTO detalle_compra (idcompra, idinsumo, cantidadcompra, preciounitario, fechacaducidad)
                 VALUES ($1, $2, $3, $4, $5)`,
                [idCompra, idInsumo, cantidadCompra, precioUnitario, fechaCaducidad || null]
            )

            await client.query(
                'UPDATE insumos SET stock = stock + $1, fechacaducidad = $2 WHERE idinsumo = $3',
                [cantidadCompra, fechaCaducidad || null, idInsumo]
            )
        }

        await client.query('COMMIT')

        res.status(201).json({
            success: true,
            message: 'Compra registrada exitosamente',
            idCompra
        })
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
})
