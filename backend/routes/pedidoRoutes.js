const express = require('express')
const router = express.Router()
const pedidoController = require('../controllers/pedidoController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.get('/', pedidoController.getPedidos)
router.post('/', pedidoController.register)
router.put('/:id/entregar', pedidoController.marcarEntregado)

module.exports = router