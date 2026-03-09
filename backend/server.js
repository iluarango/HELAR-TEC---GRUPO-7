const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth.routes')
const usuarioRoutes = require('./routes/usuario.routes')
const insumoRoutes = require('./routes/insumo.routes')
const proveedorRoutes = require('./routes/proveedor.routes')
const compraRoutes = require('./routes/compra.routes')
const productoRoutes = require('./routes/producto.routes')
const pedidoRoutes = require('./routes/pedido.routes')
const categoriaRoutes = require('./routes/categoria.routes')
const saborRoutes = require('./routes/sabor.routes')
const ventaRoutes = require('./routes/venta.routes')
const facturaRoutes = require('./routes/factura.routes')
const adicionalRoutes = require('./routes/adicional.routes')
const dashboardRoutes = require('./routes/dashboard.routes')

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
app.use('/api/productos', productoRoutes)
app.use('/api/pedidos', pedidoRoutes)
app.use('/api/categorias', categoriaRoutes)
app.use('/api/sabores', saborRoutes)
app.use('/api/ventas', ventaRoutes)
app.use('/api/facturas', facturaRoutes)
app.use('/api/adicionales', adicionalRoutes)
app.use('/api/dashboard', dashboardRoutes)

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