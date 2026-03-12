// Rutas para la gestión del catálogo de productos (helados y otros artículos del menú)
const express = require('express')
const router = express.Router()
const productoController = require('../controllers/producto.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware) // Todas las rutas requieren autenticación

router.get('/', productoController.getProductos)            // Listar todos los productos
router.post('/', productoController.register)               // Registrar nuevo producto
router.put('/:id', productoController.updateProducto)       // Actualizar datos por ID
router.put('/:id/estado', productoController.updateEstado)  // Cambiar estado (activo/inactivo)

module.exports = router