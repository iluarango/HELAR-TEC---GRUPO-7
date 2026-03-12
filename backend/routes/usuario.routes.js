// Rutas para la administración de usuarios del sistema (solo accesibles por el administrador)
const express = require('express')
const router = express.Router()
const usuarioController = require('../controllers/usuario.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const rolMiddleware = require('../middlewares/rol.middleware')

// Todas las rutas requieren estar autenticado y ser administrador
router.post('/',          authMiddleware, rolMiddleware('administrador'), usuarioController.register)    // Crear nuevo usuario
router.get('/',           authMiddleware, rolMiddleware('administrador'), usuarioController.getUsuarios) // Listar todos los usuarios
router.delete('/:id',     authMiddleware, rolMiddleware('administrador'), usuarioController.deleteUsuario) // Eliminar usuario por ID
router.put('/:id/rol',    authMiddleware, rolMiddleware('administrador'), usuarioController.updateRol)   // Cambiar rol del usuario
router.put('/:id/estado', authMiddleware, rolMiddleware('administrador'), usuarioController.updateEstado) // Cambiar estado del usuario

module.exports = router