// Rutas para la gestión de categorías de productos
const express = require('express')
const router = express.Router()
const categoriaController = require('../controllers/categoria.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware) // Todas las rutas requieren autenticación

router.get('/', categoriaController.getCategorias)           // Listar todas las categorías
router.post('/', categoriaController.register)               // Crear nueva categoría
router.put('/:id', categoriaController.updateCategoria)      // Actualizar datos por ID
router.put('/:id/estado', categoriaController.updateEstado)  // Cambiar estado (activo/inactivo)

module.exports = router