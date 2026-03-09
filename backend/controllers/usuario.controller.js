const bcrypt = require('bcryptjs')
const pool = require('../config/database.config')
const asyncHandler = require('../utils/asyncHandler')

// Registrar nuevo usuario
exports.register = asyncHandler(async (req, res) => {
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

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const result = await client.query(
            'INSERT INTO usuarios (nombreusuario, correousuario, contrasenausuario, estado) VALUES ($1, $2, $3, $4) RETURNING idusuario',
            [nombreUsuario, correoUsuario, hashedContrasena, 'activo']
        )

        const newUserId = result.rows[0].idusuario

        await client.query(
            'INSERT INTO usuario_rol (idusuario, idrol) VALUES ($1, $2)',
            [newUserId, idRol]
        )

        await client.query('COMMIT')

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            userId: newUserId
        })
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
})

// Obtener todos los usuarios
exports.getUsuarios = asyncHandler(async (req, res) => {
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

    res.json({ success: true, usuarios: result.rows })
})

// Eliminar usuario
exports.deleteUsuario = asyncHandler(async (req, res) => {
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

    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        await client.query('DELETE FROM usuario_rol WHERE idusuario = $1', [id])
        await client.query('DELETE FROM usuarios WHERE idusuario = $1', [id])
        await client.query('COMMIT')

        res.json({ success: true, message: 'Usuario eliminado exitosamente' })
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
})

// Actualizar rol de usuario
exports.updateRol = asyncHandler(async (req, res) => {
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

    res.json({ success: true, message: 'Rol actualizado exitosamente' })
})

// Actualizar estado de usuario ('activo' / 'inactivo')
exports.updateEstado = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { estado } = req.body

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

    res.json({ success: true, message: 'Estado actualizado exitosamente' })
})
