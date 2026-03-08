const express = require('express')
const router = express.Router()
const usuarioController = require('../controllers/usuarioController')
const authMiddleware = require('../middlewares/authMiddleware')
const rolMiddleware = require('../middlewares/rolMiddleware')

// Todas las rutas requieren estar autenticado y ser administrador
router.post('/',           authMiddleware, rolMiddleware('administrador'), usuarioController.register)
router.get('/',            authMiddleware, rolMiddleware('administrador'), usuarioController.getUsuarios)
router.delete('/:id',      authMiddleware, rolMiddleware('administrador'), usuarioController.deleteUsuario)
router.put('/:id/rol',     authMiddleware, rolMiddleware('administrador'), usuarioController.updateRol)
router.put('/:id/estado',  authMiddleware, rolMiddleware('administrador'), usuarioController.updateEstado)

module.exports = router