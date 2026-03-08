const pool = require('../config/database')

const rolMiddleware = (...rolesPermitidos) => {
    return async (req, res, next) => {
        try {
            // Buscar el rol del usuario en la tabla intermedia
            const rolesResult = await pool.query(
                'SELECT r.nombrerol FROM roles r INNER JOIN usuario_rol ur ON r.idrol = ur.idrol WHERE ur.idusuario = $1',
                [req.idusuario]
            )

            if (rolesResult.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'El usuario no tiene roles asignados'
                })
            }

            const rolUsuario = rolesResult.rows[0].nombrerol

            // Verificar si el rol está permitido
            if (!rolesPermitidos.includes(rolUsuario)) {
                return res.status(403).json({
                    success: false,
                    message: 'Error al intentar ingresar, no tienes los permisos necesarios'
                })
            }

            next()
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al verificar el rol del usuario'
            })
        }
    }
}

module.exports = rolMiddleware