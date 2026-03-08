const bcrypt = require('bcryptjs')
const pool = require('../config/database')

// Registrar nuevo usuario
exports.register = async (req, res) => {
    try {
        const { nombreUsuario, correoUsuario, contrasenaUsuario, idRol } = req.body

        if (!nombreUsuario || !correoUsuario || !contrasenaUsuario || !idRol) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            })
        }

        const existingUser = await pool.query(
            'SELECT idusuario FROM usuarios WHERE correousuario = $1',
            [correoUsuario]
        )

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El correo ya está registrado'
            })
        }

        const existingRol = await pool.query(
            'SELECT idrol FROM roles WHERE idrol = $1',
            [idRol]
        )

        if (existingRol.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El rol seleccionado no existe'
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedContrasena = await bcrypt.hash(contrasenaUsuario, salt)

        // El estado por defecto es 'activo'
        const result = await pool.query(
            'INSERT INTO usuarios (nombreusuario, correousuario, contrasenausuario, estado) VALUES ($1, $2, $3, $4) RETURNING idusuario',
            [nombreUsuario, correoUsuario, hashedContrasena, 'activo']
        )

        const newUserId = result.rows[0].idusuario

        await pool.query(
            'INSERT INTO usuario_rol (idusuario, idrol) VALUES ($1, $2)',
            [newUserId, idRol]
        )

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            userId: newUserId
        })
    } catch (error) {
        console.error('Error en el registro:', error)
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        })
    }
}

// Obtener todos los usuarios
exports.getUsuarios = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.idusuario,
                u.nombreusuario,
                u.correousuario,
                u.estado,
                r.nombrerol,
                ur.idrol
            FROM usuarios u
            LEFT JOIN usuario_rol ur ON u.idusuario = ur.idusuario
            LEFT JOIN roles r ON ur.idrol = r.idrol
            ORDER BY u.idusuario ASC
        `)

        res.json({
            success: true,
            usuarios: result.rows
        })
    } catch (error) {
        console.error('Error al obtener usuarios:', error)
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        })
    }
}

// Eliminar usuario
exports.deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params

        const existingUser = await pool.query(
            'SELECT idusuario FROM usuarios WHERE idusuario = $1',
            [id]
        )

        if (existingUser.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            })
        }

        await pool.query('DELETE FROM usuario_rol WHERE idusuario = $1', [id])
        await pool.query('DELETE FROM usuarios WHERE idusuario = $1', [id])

        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        })
    } catch (error) {
        console.error('Error al eliminar usuario:', error)
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        })
    }
}

// Actualizar rol de usuario
exports.updateRol = async (req, res) => {
    try {
        const { id } = req.params
        const { idRol } = req.body

        if (!idRol) {
            return res.status(400).json({
                success: false,
                message: 'El rol es obligatorio'
            })
        }

        const existingUser = await pool.query(
            'SELECT idusuario FROM usuarios WHERE idusuario = $1',
            [id]
        )

        if (existingUser.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            })
        }

        const existingRol = await pool.query(
            'SELECT idrol FROM roles WHERE idrol = $1',
            [idRol]
        )

        if (existingRol.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El rol seleccionado no existe'
            })
        }

        await pool.query(
            'UPDATE usuario_rol SET idrol = $1 WHERE idusuario = $2',
            [idRol, id]
        )

        res.json({
            success: true,
            message: 'Rol actualizado exitosamente'
        })
    } catch (error) {
        console.error('Error al actualizar rol:', error)
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        })
    }
}

// Actualizar estado de usuario ('activo' / 'inactivo')
exports.updateEstado = async (req, res) => {
    try {
        const { id } = req.params
        const { estado } = req.body

        // Validar que el estado sea exactamente 'activo' o 'inactivo'
        if (!estado || !['activo', 'inactivo'].includes(estado)) {
            return res.status(400).json({
                success: false,
                message: "El estado debe ser 'activo' o 'inactivo'"
            })
        }

        const existingUser = await pool.query(
            'SELECT idusuario FROM usuarios WHERE idusuario = $1',
            [id]
        )

        if (existingUser.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            })
        }

        await pool.query(
            'UPDATE usuarios SET estado = $1 WHERE idusuario = $2',
            [estado, id]
        )

        res.json({
            success: true,
            message: 'Estado actualizado exitosamente'
        })
    } catch (error) {
        console.error('Error al actualizar estado:', error)
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        })
    }
}