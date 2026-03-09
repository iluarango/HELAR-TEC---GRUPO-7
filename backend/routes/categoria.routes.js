const express = require('express')
const router = express.Router()
const categoriaController = require('../controllers/categoria.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware)

router.get('/', categoriaController.getCategorias)
router.post('/', categoriaController.register)
router.put('/:id', categoriaController.updateCategoria)
router.put('/:id/estado', categoriaController.updateEstado)

module.exports = router