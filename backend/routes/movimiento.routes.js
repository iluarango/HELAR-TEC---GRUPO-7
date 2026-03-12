// Rutas para la gestión de movimientos de inventario (entradas y salidas de insumos)
const express = require('express')
const router = express.Router()
const movimientoController = require('../controllers/movimiento.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware) // Todas las rutas requieren autenticación

router.get('/', movimientoController.getMovimientos)           // Listar todos los movimientos
router.post('/', movimientoController.registerMovimiento)      // Registrar nuevo movimiento

module.exports = router
