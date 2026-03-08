const pool = require('../config/database')

// Obtener todos los pedidos con sus detalles
exports.getPedidos = async (req, res) => {
    try {
        const pedidosResult = await pool.query(`
            SELECT 
                p.idpedido,
                p.fechapedido,
                p.estadopedido,
                p.idusuario,
                u.nombreusuario
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
                    dp.toppings,
                    dp.adicionales,
                    dp.precioadicionales,
                    pr.idproducto,
                    pr.nombreproducto,
                    pr.categoria
                FROM detalle_pedido dp
                INNER JOIN productos pr ON dp.idproducto = pr.idproducto
                WHERE dp.idpedido = $1
            `, [pedido.idpedido])

            return { ...pedido, detalles: detallesResult.rows }
        }))

        res.json({ success: true, pedidos })
    } catch (error) {
        console.error('Error al obtener pedidos:', error)
        res.status(500).json({ success: false, message: 'Error en el servidor' })
    }
}

// Registrar nuevo pedido con detalles
exports.register = async (req, res) => {
    const client = await pool.connect()

    try {
        const { detalles } = req.body
        const idusuario = req.idusuario

        if (!detalles || detalles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El pedido debe tener al menos un producto'
            })
        }

        await client.query('BEGIN')

        // Insertar pedido
        const pedidoResult = await client.query(
            `INSERT INTO pedidos (fechapedido, estadopedido, idusuario)
             VALUES (NOW(), 'pendiente', $1)
             RETURNING *`,
            [idusuario]
        )

        const idPedido = pedidoResult.rows[0].idpedido

        // Insertar cada detalle
        for (const detalle of detalles) {
            const { idProducto, cantidad, precio, toppings, adicionales, precioAdicionales } = detalle

            if (!idProducto || !cantidad || !precio) {
                await client.query('ROLLBACK')
                return res.status(400).json({
                    success: false,
                    message: 'Cada detalle debe tener producto, cantidad y precio'
                })
            }

            const subtotal = (precio * cantidad) + (precioAdicionales || 0)

            await client.query(
                `INSERT INTO detalle_pedido (idpedido, idproducto, cantidad, precio, subtotal, toppings, adicionales, precioadicionales)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [idPedido, idProducto, cantidad, precio, subtotal, toppings || null, adicionales || null, precioAdicionales || 0]
            )
        }

        await client.query('COMMIT')

        res.status(201).json({
            success: true,
            message: 'Pedido registrado exitosamente',
            idPedido
        })
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Error al registrar pedido:', error)
        res.status(500).json({ success: false, message: 'Error en el servidor' })
    } finally {
        client.release()
    }
}

// Marcar pedido como entregado y registrar venta automáticamente
exports.marcarEntregado = async (req, res) => {
    const client = await pool.connect()

    try {
        const { id } = req.params
        const idusuario = req.idusuario

        // Verificar que el pedido existe y está pendiente
        const pedidoResult = await client.query(
            'SELECT * FROM pedidos WHERE idpedido = $1',
            [id]
        )

        if (pedidoResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' })
        }

        if (pedidoResult.rows[0].estadopedido === 'entregado') {
            return res.status(400).json({ success: false, message: 'El pedido ya fue entregado' })
        }

        // Calcular total del pedido sumando subtotales
        const totalResult = await client.query(
            'SELECT SUM(subtotal) AS total FROM detalle_pedido WHERE idpedido = $1',
            [id]
        )

        const totalventa = totalResult.rows[0].total || 0

        await client.query('BEGIN')

        // Actualizar estado del pedido
        await client.query(
            `UPDATE pedidos SET estadopedido = 'entregado' WHERE idpedido = $1`,
            [id]
        )

        // Registrar venta automáticamente
        await client.query(
            `INSERT INTO ventas (fechaventa, idpedido, idusuario, totalventa)
             VALUES (NOW(), $1, $2, $3)`,
            [id, idusuario, totalventa]
        )

        await client.query('COMMIT')

        res.json({
            success: true,
            message: 'Pedido entregado y venta registrada exitosamente'
        })
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Error al marcar pedido como entregado:', error)
        res.status(500).json({ success: false, message: 'Error en el servidor' })
    } finally {
        client.release()
    }
}