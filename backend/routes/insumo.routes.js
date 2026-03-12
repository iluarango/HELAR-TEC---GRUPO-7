// Rutas para la gestión de insumos (materias primas e ingredientes)
const express = require('express')
const router = express.Router()
const insumoController = require('../controllers/insumo.controller')
const authMiddleware = require('../middlewares/auth.middleware')

// Todas las rutas requieren estar autenticado
router.get('/proximos-vencer', authMiddleware, insumoController.getProximosVencer) // Listar insumos próximos a vencer
router.get('/',           authMiddleware, insumoController.getInsumos)             // Listar todos los insumos
router.post('/',          authMiddleware, insumoController.register)               // Registrar nuevo insumo
router.put('/:id/estado', authMiddleware, insumoController.updateEstado)           // Cambiar estado por ID
router.put('/:id',        authMiddleware, insumoController.updateInsumo)           // Actualizar datos por ID

module.exports = router