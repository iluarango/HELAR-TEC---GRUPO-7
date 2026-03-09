const express = require('express')
const router = express.Router()
const facturaController = require('../controllers/factura.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware)

router.get('/', facturaController.getFacturas)
router.post('/', facturaController.registerFactura)

module.exports = router
