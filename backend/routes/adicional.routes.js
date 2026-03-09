const express = require('express')
const router = express.Router()
const adicionalController = require('../controllers/adicional.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware)

router.get('/', adicionalController.getAdicionales)
router.post('/', adicionalController.register)
router.put('/:id', adicionalController.update)
router.put('/:id/estado', adicionalController.updateEstado)

module.exports = router
