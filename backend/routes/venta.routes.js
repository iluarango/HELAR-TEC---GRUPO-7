const express = require('express')
const router = express.Router()
const ventaController = require('../controllers/venta.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware)

router.get('/', ventaController.getVentas)
router.get('/:id', ventaController.getVentaById)

module.exports = router
