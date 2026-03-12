const pool = require('../config/database.config')
const asyncHandler = require('../utils/asyncHandler')

// Obtener todos los pedidos con sus detalles
exports.getPedidos = asyncHandler(async (req, res) => {
    const pedidosResult = await pool.query(`
        SELECT
            p.idpedido,
            p.fechapedido,
            p.estadopedido,
            p.idusuario,
            u.nombreusuario,
            COALESCE(
                (SELECT SUM(subtotal) FROM detalle_pedido WHERE idpedido = p.idpedido), 0
            ) AS totalventa
        FROM pedidos p
        INNER JOIN usuarios u ON p.idusuario = u.idusuario
        ORDER BY p.idpedido DESC
    `)

    const pedidos = await Promise.all(pedidosResult.rows.map(async (pedido) => {
        const detallesResult = await pool.query(`
            SELECT
                dp.iddetallepedido,
                dp.cantidad,
                dp.precio,
                dp.subtotal,
                dp.sabores, dp.salsas,
                pr.idproducto,
                pr.nombreproducto,
                COALESCE(
                    json_agg(
                        json_build_object('nombre', a.nombre, 'precio', a.precio, 'cantidad', dpa.cantidad)
                    ) FILTER (WHERE dpa.idadicional IS NOT NULL),
                    '[]'
                ) AS adicionales
            FROM detalle_pedido dp
            INNER JOIN productos pr ON dp.idproducto = pr.idproducto
            LEFT JOIN detalle_pedido_adicionales dpa ON dp.iddetallepedido = dpa.iddetallepedido
            LEFT JOIN adicionales a ON dpa.idadicional = a.idadicional
            WHERE dp.idpedido = $1
            GROUP BY dp.iddetallepedido, pr.idproducto, pr.nombreproducto
        `, [pedido.idpedido])

        return { ...pedido, detalles: detallesResult.rows }
    }))

    res.json({ success: true, pedidos })
})

// Registrar nuevo pedido con detalles
exports.register = asyncHandler(async (req, res) => {
    const { detalles } = req.body
    const idusuario = req.idusuario

    if (!detalles || detalles.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El pedido debe tener al menos un producto'
        })
    }

    // Validar todos los detalles antes de abrir la transacción
    for (const detalle of detalles) {
        if (!detalle.idProducto || !detalle.cantidad || !detalle.precio) {
            return res.status(400).json({
                success: false,
                message: 'Cada detalle debe tener producto, cantidad y precio'
            })
        }
    }

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const pedidoResult = await client.query(
            `INSERT INTO pedidos (fechapedido, estadopedido, idusuario)
             VALUES (NOW(), 'pendiente', $1)
             RETURNING *`,
            [idusuario]
        )

        const idPedido = pedidoResult.rows[0].idpedido

        for (const detalle of detalles) {
            const { idProducto, cantidad, precio, adicionales, sabores, salsas } = detalle
            // adicionales = [{ idAdicional, cantidad }]

            // Calcular costo de adicionales consultando precios reales
            let costoAdicionales = 0
            if (adicionales && adicionales.length > 0) {
                const ids = adicionales.map(a => a.idAdicional)
                const adRes = await client.query(
                    'SELECT idadicional, precio FROM adicionales WHERE idadicional = ANY($1::int[])',
                    [ids]
                )
                for (const a of adicionales) {
                    const info = adRes.rows.find(r => r.idadicional === a.idAdicional)
                    if (info) costoAdicionales += parseFloat(info.precio) * (a.cantidad || 1)
                }
            }

            const subtotal = (precio * cantidad) + costoAdicionales
            const saboresTexto = (sabores && sabores.length) ? sabores.join(', ') : null
            const salsasTexto = (salsas && salsas.length) ? salsas.join(', ') : null

            const detalleResult = await client.query(
                `INSERT INTO detalle_pedido (idpedido, idproducto, cantidad, precio, subtotal, sabores, salsas)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING iddetallepedido`,
                [idPedido, idProducto, cantidad, precio, subtotal, saboresTexto, salsasTexto]
            )

            const idDetalle = detalleResult.rows[0].iddetallepedido

            for (const a of (adicionales || [])) {
                await client.query(
                    `INSERT INTO detalle_pedido_adicionales (iddetallepedido, idadicional, cantidad)
                     VALUES ($1, $2, $3)`,
                    [idDetalle, a.idAdicional, a.cantidad || 1]
                )
            }
        }

        await client.query('COMMIT')

        res.status(201).json({
            success: true,
            message: 'Pedido registrado exitosamente',
            idPedido
        })
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
})

// Marcar pedido como entregado y registrar venta automáticamente
exports.marcarEntregado = asyncHandler(async (req, res) => {
    const { id } = req.params
    const idusuario = req.idusuario

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const pedidoResult = await client.query(
            'SELECT estadopedido FROM pedidos WHERE idpedido = $1',
            [id]
        )

        if (pedidoResult.rows.length === 0) {
            await client.query('ROLLBACK')
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' })
        }

        if (pedidoResult.rows[0].estadopedido === 'entregado') {
            await client.query('ROLLBACK')
            return res.status(400).json({ success: false, message: 'El pedido ya fue entregado' })
        }

        const totalResult = await client.query(
            'SELECT SUM(subtotal) AS total FROM detalle_pedido WHERE idpedido = $1',
            [id]
        )

        const totalventa = totalResult.rows[0].total || 0

        await client.query(
            `UPDATE pedidos SET estadopedido = 'entregado' WHERE idpedido = $1`,
            [id]
        )

        await client.query(
            `INSERT INTO ventas (fechaventa, idpedido, idusuario, totalventa)
             VALUES (NOW(), $1, $2, $3)`,
            [id, idusuario, totalventa]
        )

        await client.query('COMMIT')

        res.json({ success: true, message: 'Pedido entregado y venta registrada exitosamente' })
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
})

// Cancelar pedido
exports.cancelarPedido = asyncHandler(async (req, res) => {
    const { id } = req.params

    const result = await pool.query(
        'SELECT estadopedido FROM pedidos WHERE idpedido = $1', [id]
    )

    if (result.rows.length === 0)
        return res.status(404).json({ success: false, message: 'Pedido no encontrado' })

    if (result.rows[0].estadopedido === 'entregado')
        return res.status(400).json({ success: false, message: 'No se puede cancelar un pedido ya entregado' })

    await pool.query(
        `UPDATE pedidos SET estadopedido = 'cancelado' WHERE idpedido = $1`, [id]
    )

    res.json({ success: true, message: 'Pedido cancelado' })
})
