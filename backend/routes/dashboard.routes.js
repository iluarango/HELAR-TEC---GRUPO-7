// Rutas para obtener los datos del resumen/dashboard del panel administrativo
const express = require('express')
const router = express.Router()
const dashboardController = require('../controllers/dashboard.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware) // Todas las rutas requieren autenticación
router.get('/', dashboardController.getDashboard) // Obtener estadísticas generales del dashboard

module.exports = router
