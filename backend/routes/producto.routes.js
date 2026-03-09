const express = require('express')
const router = express.Router()
const productoController = require('../controllers/producto.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware)

router.get('/', productoController.getProductos)
router.post('/', productoController.register)
router.put('/:id', productoController.updateProducto)
router.put('/:id/estado', productoController.updateEstado)

module.exports = router