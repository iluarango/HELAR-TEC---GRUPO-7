// Configuración de la conexión a la base de datos PostgreSQL mediante un pool de conexiones
const { Pool } = require('pg')
require('dotenv').config() // Carga las variables de entorno desde el archivo .env

const pool = new Pool({
    user:     process.env.DB_USER,     // Usuario de la base de datos
    host:     process.env.DB_HOST,     // Dirección del servidor de la base de datos
    database: process.env.DB_NAME,     // Nombre de la base de datos
    password: process.env.DB_PASSWORD, // Contraseña del usuario
    port:     process.env.DB_PORT,     // Puerto de conexión (por defecto 5432 en PostgreSQL)
})

module.exports = pool // Exporta el pool para ser usado en los controladores