// Rutas de autenticación (login del sistema)
const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')

// Ruta pública - solo login
router.post('/login', authController.login) // Iniciar sesión y obtener token JWT

module.exports = router