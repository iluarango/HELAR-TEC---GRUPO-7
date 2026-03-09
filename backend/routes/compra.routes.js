const express = require('express')
const router = express.Router()
const compraController = require('../controllers/compra.controller')
const authMiddleware = require('../middlewares/auth.middleware')

// Todas las rutas requieren estar autenticado
router.get('/',            authMiddleware, compraController.getCompras)
router.post('/',           authMiddleware, compraController.register)

module.exports = router