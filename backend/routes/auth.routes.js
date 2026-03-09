const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')

// Ruta pública - solo login
router.post('/login', authController.login)

module.exports = router