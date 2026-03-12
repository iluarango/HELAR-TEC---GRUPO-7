// Rutas para la generación y consulta de reportes del negocio
const express = require('express')
const router = express.Router()
const reporteController = require('../controllers/reporte.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware) // Todas las rutas requieren autenticación

router.get('/', reporteController.getReportes) // Obtener datos consolidados para reportes

module.exports = router
