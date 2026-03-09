const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        console.error(`[ERROR] ${req.method} ${req.path}:`, error.message)
        res.status(500).json({ success: false, message: 'Error en el servidor' })
    })
}

module.exports = asyncHandler
