const express = require('express')
const router = express.Router()
const categoriaController = require('../controllers/categoriaController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.get('/', categoriaController.getCategorias)
router.post('/', categoriaController.register)
router.put('/:id', categoriaController.updateCategoria)
router.put('/:id/estado', categoriaController.updateEstado)

module.exports = router