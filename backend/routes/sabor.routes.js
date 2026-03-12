// Rutas para la gestión de sabores disponibles en los productos
const express = require('express')
const router = express.Router()
const saborController = require('../controllers/sabor.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware) // Todas las rutas requieren autenticación

router.get('/', saborController.getSabores)            // Listar todos los sabores
router.post('/', saborController.register)             // Crear nuevo sabor
router.put('/:id', saborController.updateSabor)        // Actualizar datos por ID
router.put('/:id/estado', saborController.updateEstado) // Cambiar estado (activo/inactivo)

module.exports = router