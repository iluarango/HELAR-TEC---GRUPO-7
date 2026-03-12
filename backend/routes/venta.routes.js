// Rutas para la consulta de ventas registradas automáticamente al entregar un pedido
const express = require('express')
const router = express.Router()
const ventaController = require('../controllers/venta.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware) // Todas las rutas requieren autenticación

// ── VENTAS ───────────────────────────────────────────────────
// GET  /      — lista todas las ventas con flag tiene_factura
// GET  /:id   — obtiene una venta con sus líneas de detalle
router.get('/', ventaController.getVentas)
router.get('/:id', ventaController.getVentaById)

module.exports = router
