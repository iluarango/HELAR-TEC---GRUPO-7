// Rutas para la gestión de pedidos (creación, entrega y cancelación)
const express = require('express')
const router = express.Router()
const pedidoController = require('../controllers/pedido.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware) // Todas las rutas requieren autenticación

// ── PEDIDOS ──────────────────────────────────────────────────
// GET    /         — lista todos los pedidos con detalles
// POST   /         — crea un pedido con detalles, sabores y adicionales
// PUT    /:id/entregar  — marca como entregado y genera la venta automáticamente
// PUT    /:id/cancelar  — cancela un pedido que no haya sido entregado
router.get('/', pedidoController.getPedidos)
router.post('/', pedidoController.register)
router.put('/:id/entregar', pedidoController.marcarEntregado)
router.put('/:id/cancelar', pedidoController.cancelarPedido)

module.exports = router