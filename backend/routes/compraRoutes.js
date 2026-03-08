const express = require('express')
const router = express.Router()
const compraController = require('../controllers/compraController')
const authMiddleware = require('../middlewares/authMiddleware')

// Todas las rutas requieren estar autenticado
router.get('/',            authMiddleware, compraController.getCompras)
router.post('/',           authMiddleware, compraController.register)

module.exports = router