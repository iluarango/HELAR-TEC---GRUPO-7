const express = require('express')
const router = express.Router()
const pedidoController = require('../controllers/pedido.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware)

router.get('/', pedidoController.getPedidos)
router.post('/', pedidoController.register)
router.put('/:id/entregar', pedidoController.marcarEntregado)

module.exports = router