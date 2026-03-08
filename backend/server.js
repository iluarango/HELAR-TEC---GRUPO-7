const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/authRoutes')
const usuarioRoutes = require('./routes/usuarioRoutes')
const insumoRoutes = require('./routes/insumoRoutes')
const proveedorRoutes = require('./routes/proveedorRoutes')
const compraRoutes = require('./routes/compraRoutes')

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Log de peticiones
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)
    next()
})

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/insumos', insumoRoutes)
app.use('/api/proveedores', proveedorRoutes)
app.use('/api/compras', compraRoutes)

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        success: false,
        message: 'Error del servidor'
    })
})

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
    console.log(`Base de datos: ${process.env.DB_NAME}\n`)
})