const express = require('express')
const router = express.Router()
const proveedorController = require('../controllers/proveedorController')
const authMiddleware = require('../middlewares/authMiddleware')

// Todas las rutas requieren estar autenticado
router.get('/',           authMiddleware, proveedorController.getProveedores)
router.post('/',          authMiddleware, proveedorController.register)
router.put('/:id',        authMiddleware, proveedorController.updateProveedor)
router.put('/:id/estado', authMiddleware, proveedorController.updateEstado)

module.exports = router