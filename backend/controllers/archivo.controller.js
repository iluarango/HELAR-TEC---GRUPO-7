const pool = require('../config/database.config')
const asyncHandler = require('../utils/asyncHandler')
const fs = require('fs')
const path = require('path')

const REPORTES_DIR = path.join(__dirname, '../public/reportes')

// Asegurar que el directorio exista
if (!fs.existsSync(REPORTES_DIR)) {
    fs.mkdirSync(REPORTES_DIR, { recursive: true })
}

// ── GUARDAR ARCHIVO ─────────────────────────────────────────────
/** Decodifica contenido base64, lo escribe en disco y registra el archivo en BD */
exports.guardarArchivo = asyncHandler(async (req, res) => {
    const { nombrearchivo, tipoarchivo, contenido } = req.body
    const idusuario = req.idusuario

    if (!nombrearchivo || !tipoarchivo || !contenido) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos' })
    }

    // Sanitizar nombre de archivo para evitar path traversal
    const safeName = path.basename(nombrearchivo)
    const filePath = path.join(REPORTES_DIR, safeName)

    // Decodificar base64 y escribir en disco
    const base64Data = contenido.replace(/^data:[^;]+;base64,/, '')
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'))

    // Registrar en base de datos
    const result = await pool.query(
        `INSERT INTO archivos_generados (nombrearchivo, tipoarchivo, fechageneracion, idusuario)
         VALUES ($1, $2, NOW(), $3) RETURNING *`,
        [safeName, tipoarchivo, idusuario]
    )

    res.json({ success: true, archivo: result.rows[0] })
})

// ── LISTAR ARCHIVOS ─────────────────────────────────────────────
/** Devuelve todos los archivos generados con nombre de usuario */
exports.listarArchivos = asyncHandler(async (req, res) => {
    const result = await pool.query(`
        SELECT ag.idarchivo, ag.nombrearchivo, ag.tipoarchivo, ag.fechageneracion, ag.idusuario,
               u.nombreusuario
        FROM archivos_generados ag
        LEFT JOIN usuarios u ON ag.idusuario = u.idusuario
        ORDER BY ag.fechageneracion DESC
    `)
    res.json({ success: true, archivos: result.rows })
})

// ── DESCARGAR ARCHIVO ───────────────────────────────────────────
/** Envía el archivo del disco al cliente por nombre; 404 si no existe */
exports.descargarArchivo = asyncHandler(async (req, res) => {
    const safeName = path.basename(req.params.nombre)
    const filePath = path.join(REPORTES_DIR, safeName)

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'Archivo no encontrado' })
    }

    res.download(filePath, safeName)
})
