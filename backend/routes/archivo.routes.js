// Rutas para la gestión de archivos subidos al sistema
const express = require('express')
const router = express.Router()
const archivoController = require('../controllers/archivo.controller')
const verificarToken = require('../middlewares/auth.middleware')

router.use(verificarToken) // Todas las rutas requieren autenticación

router.post('/', archivoController.guardarArchivo)                  // Subir y guardar un archivo
router.get('/', archivoController.listarArchivos)                    // Listar todos los archivos
router.get('/descargar/:nombre', archivoController.descargarArchivo) // Descargar archivo por nombre

module.exports = router
