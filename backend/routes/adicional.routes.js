// Rutas para la gestión de adicionales (toppings/extras de los pedidos)
const express = require('express')
const router = express.Router()
const adicionalController = require('../controllers/adicional.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware) // Todas las rutas requieren autenticación

router.get('/', adicionalController.getAdicionales)          // Listar todos los adicionales
router.post('/', adicionalController.register)               // Crear nuevo adicional
router.put('/:id', adicionalController.update)               // Actualizar datos por ID
router.put('/:id/estado', adicionalController.updateEstado)  // Cambiar estado (activo/inactivo)

module.exports = router
