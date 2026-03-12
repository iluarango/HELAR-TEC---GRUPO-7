// Rutas para la gestión de proveedores de insumos
const express = require('express')
const router = express.Router()
const proveedorController = require('../controllers/proveedor.controller')
const authMiddleware = require('../middlewares/auth.middleware')

// Todas las rutas requieren estar autenticado
router.get('/',           authMiddleware, proveedorController.getProveedores)   // Listar todos los proveedores
router.post('/',          authMiddleware, proveedorController.register)         // Registrar nuevo proveedor
router.put('/:id',        authMiddleware, proveedorController.updateProveedor)  // Actualizar datos por ID
router.put('/:id/estado', authMiddleware, proveedorController.updateEstado)     // Cambiar estado por ID

module.exports = router