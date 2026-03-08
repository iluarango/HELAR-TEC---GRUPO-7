const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    // Obtener token del header
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Acceso denegado. No hay token'
        })
    }

    try {
        // Verificar token (decoded.id porque así se firmó en authController)
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
req.idusuario = decoded.id
next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        })
    }
}

module.exports = authMiddleware