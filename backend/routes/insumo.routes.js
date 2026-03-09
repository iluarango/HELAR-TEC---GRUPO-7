const express = require('express')
const router = express.Router()
const insumoController = require('../controllers/insumo.controller')
const authMiddleware = require('../middlewares/auth.middleware')

// Todas las rutas requieren estar autenticado
router.get('/',      authMiddleware, insumoController.getInsumos)
router.post('/',     authMiddleware, insumoController.register)
router.put('/:id/estado', authMiddleware, insumoController.updateEstado)
router.put('/:id',   authMiddleware, insumoController.updateInsumo)

module.exports = router