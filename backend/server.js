// Punto de entrada principal del servidor — configura middlewares, rutas y pone en marcha la API

const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config() // Carga las variables de entorno desde .env

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
const movimientoRoutes = require('./routes/movimiento.routes')
const gastoRoutes = require('./routes/gasto.routes')
const reporteRoutes = require('./routes/reporte.routes')
const archivoRoutes = require('./routes/archivo.routes')
const salsaRoutes = require('./routes/salsa.routes')

const app = express()
const PORT = process.env.PORT || 3000 // Puerto configurable por variable de entorno, por defecto 3000

// Middleware CORS
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '20mb' }))                      
app.use(express.urlencoded({ extended: true, limit: '20mb' }))

// Log de peticiones entrantes
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)
    next()
})

/*
-----------------------------------
 SERVIR FRONTEND
-----------------------------------
Como server.js está dentro de /backend
y el frontend está en /frontend
subimos un nivel con ../
*/
app.use(express.static(path.join(__dirname, '../frontend')))

// Ruta principal que devuelve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

/*
-----------------------------------
 RUTAS DE LA API
-----------------------------------
*/
app.use('/api/auth',        authRoutes)
app.use('/api/usuarios',    usuarioRoutes)
app.use('/api/insumos',     insumoRoutes)
app.use('/api/proveedores', proveedorRoutes)
app.use('/api/compras',     compraRoutes)
app.use('/api/productos',   productoRoutes)
app.use('/api/pedidos',     pedidoRoutes)
app.use('/api/categorias',  categoriaRoutes)
app.use('/api/sabores',     saborRoutes)
app.use('/api/ventas',      ventaRoutes)
app.use('/api/facturas',    facturaRoutes)
app.use('/api/adicionales', adicionalRoutes)
app.use('/api/dashboard',   dashboardRoutes)
app.use('/api/movimientos', movimientoRoutes)
app.use('/api/gastos',      gastoRoutes)
app.use('/api/reportes',    reporteRoutes)
app.use('/api/archivos',    archivoRoutes)
app.use('/api/salsas',      salsaRoutes)

/*
-----------------------------------
 MANEJO GLOBAL DE ERRORES
-----------------------------------
*/
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        success: false,
        message: 'Error del servidor'
    })
})

/*
-----------------------------------
 INICIAR SERVIDOR
-----------------------------------
*/
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
    console.log(`Base de datos: ${process.env.DB_NAME}\n`)
})