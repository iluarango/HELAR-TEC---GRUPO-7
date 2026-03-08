const express = require('express')
const router = express.Router()
const saborController = require('../controllers/saborController')
const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.get('/', saborController.getSabores)
router.post('/', saborController.register)
router.put('/:id', saborController.updateSabor)
router.put('/:id/estado', saborController.updateEstado)

module.exports = router