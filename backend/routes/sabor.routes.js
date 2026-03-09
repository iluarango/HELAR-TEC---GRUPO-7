const express = require('express')
const router = express.Router()
const saborController = require('../controllers/sabor.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware)

router.get('/', saborController.getSabores)
router.post('/', saborController.register)
router.put('/:id', saborController.updateSabor)
router.put('/:id/estado', saborController.updateEstado)

module.exports = router