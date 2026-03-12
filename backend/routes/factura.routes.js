// Rutas para la gestión de facturas generadas a partir de ventas
const express = require('express')
const router = express.Router()
const facturaController = require('../controllers/factura.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware) // Todas las rutas requieren autenticación

// ── FACTURAS ─────────────────────────────────────────────────
// GET   /   — lista todas las facturas
// POST  /   — genera factura para una venta (una por venta)
router.get('/', facturaController.getFacturas)
router.post('/', facturaController.registerFactura)

module.exports = router
