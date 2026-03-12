// Punto de entrada principal del servidor — configura middlewares, rutas y pone en marcha la API
const express = require('express')
const cors = require('cors')
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

// Middleware CORS: permite peticiones desde el frontend en desarrollo
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '20mb' }))                      // Parseo de cuerpos JSON (hasta 20 MB para imágenes en base64)
app.use(express.urlencoded({ extended: true, limit: '20mb' })) // Parseo de formularios URL-encoded

// Log de peticiones entrantes en la consola
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)
    next()
})

// Rutas de la API
app.use('/api/auth',        authRoutes)        // Autenticación (login)
app.use('/api/usuarios',    usuarioRoutes)     // Gestión de usuarios
app.use('/api/insumos',     insumoRoutes)      // Gestión de insumos
app.use('/api/proveedores', proveedorRoutes)   // Gestión de proveedores
app.use('/api/compras',     compraRoutes)      // Gestión de compras a proveedores
app.use('/api/productos',   productoRoutes)    // Catálogo de productos
app.use('/api/pedidos',     pedidoRoutes)      // Gestión de pedidos
app.use('/api/categorias',  categoriaRoutes)   // Categorías de productos
app.use('/api/sabores',     saborRoutes)       // Sabores disponibles
app.use('/api/ventas',      ventaRoutes)       // Registro de ventas
app.use('/api/facturas',    facturaRoutes)     // Generación de facturas
app.use('/api/adicionales', adicionalRoutes)   // Adicionales/toppings
app.use('/api/dashboard',   dashboardRoutes)   // Datos del dashboard
app.use('/api/movimientos', movimientoRoutes)  // Movimientos de inventario
app.use('/api/gastos',      gastoRoutes)       // Gastos operativos
app.use('/api/reportes',    reporteRoutes)     // Reportes del negocio
app.use('/api/archivos',    archivoRoutes)     // Archivos subidos
app.use('/api/salsas',      salsaRoutes)       // Salsas disponibles

// Manejo global de errores — responde con 500 ante cualquier error no controlado
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        success: false,
        message: 'Error del servidor'
    })
})

// Inicia el servidor en el puerto configurado
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
    console.log(`Base de datos: ${process.env.DB_NAME}\n`)
})