const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../config/database.config')
const asyncHandler = require('../utils/asyncHandler')

// Login de usuario
exports.login = asyncHandler(async (req, res) => {
    const { nombreUsuario, contrasenaUsuario } = req.body

    if (!nombreUsuario || !contrasenaUsuario) {
        return res.status(400).json({
            success: false,
            message: 'El nombre de usuario y la contraseña son obligatorios'
        })
    }

    const usuariosResult = await pool.query(
        'SELECT idusuario, nombreusuario, contrasenausuario, estado FROM usuarios WHERE nombreusuario = $1',
        [nombreUsuario]
    )

    if (usuariosResult.rows.length === 0) {
        return res.status(401).json({
            success: false,
            message: 'El nombre de usuario o la contraseña son incorrectos'
        })
    }

    const usuario = usuariosResult.rows[0]

    if (usuario.estado === 'inactivo') {
        return res.status(403).json({
            success: false,
            message: 'Tu cuenta está inactiva, contacta al administrador'
        })
    }

    const isPasswordValid = await bcrypt.compare(contrasenaUsuario, usuario.contrasenausuario)

    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: 'El nombre de usuario o la contraseña son incorrectos'
        })
    }

    const token = jwt.sign(
        { id: usuario.idusuario, nombreUsuario: usuario.nombreusuario },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    )

    const rolResult = await pool.query(
        'SELECT r.nombrerol FROM roles r INNER JOIN usuario_rol ur ON r.idrol = ur.idrol WHERE ur.idusuario = $1',
        [usuario.idusuario]
    )

    const rol = rolResult.rows[0]?.nombrerol || 'empleado'

    res.json({
        success: true,
        message: 'Login exitoso',
        token,
        usuario: {
            id: usuario.idusuario,
            nombreUsuario: usuario.nombreusuario,
            rol
        }
    })
})
