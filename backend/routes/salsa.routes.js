// Rutas para la gestión de salsas disponibles como complemento de los productos
const express = require('express')
const router = express.Router()
const salsaController = require('../controllers/salsa.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware) // Todas las rutas requieren autenticación

router.get('/', salsaController.getSalsas)             // Listar todas las salsas
router.post('/', salsaController.register)             // Crear nueva salsa
router.put('/:id', salsaController.updateSalsa)        // Actualizar datos por ID
router.put('/:id/estado', salsaController.updateEstado) // Cambiar estado (activo/inactivo)

module.exports = router
