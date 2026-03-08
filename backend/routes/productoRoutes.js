const express = require('express')
const router = express.Router()
const productoController = require('../controllers/productoController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.get('/', productoController.getProductos)
router.post('/', productoController.register)
router.put('/:id', productoController.updateProducto)
router.put('/:id/estado', productoController.updateEstado)

module.exports = router