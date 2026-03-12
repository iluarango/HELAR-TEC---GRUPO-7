// Rutas para la gestión de gastos operativos del negocio
const express = require('express')
const router = express.Router()
const gastoController = require('../controllers/gasto.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware) // Todas las rutas requieren autenticación

router.get('/', gastoController.getGastos)                        // Listar todos los gastos
router.post('/', gastoController.registerGasto)                   // Registrar nuevo gasto
router.put('/:id/estado', gastoController.updateEstadoGasto)      // Cambiar estado del gasto por ID

module.exports = router
