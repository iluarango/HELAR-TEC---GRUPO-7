// Rutas para la gestión de compras a proveedores
const express = require('express')
const router = express.Router()
const compraController = require('../controllers/compra.controller')
const authMiddleware = require('../middlewares/auth.middleware')

// Todas las rutas requieren estar autenticado
router.get('/',  authMiddleware, compraController.getCompras) // Listar todas las compras
router.post('/', authMiddleware, compraController.register)   // Registrar nueva compra

module.exports = router