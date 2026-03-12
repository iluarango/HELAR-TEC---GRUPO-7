const { Pool } = require('pg')
require('dotenv').config()

let pool

// Si existe DATABASE_URL (producción en Render)
if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    })
    console.log('Conectado a PostgreSQL en Render (DATABASE_URL)')
} 
// Si no existe (entorno local con variables individuales)
else {
    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
        ssl: process.env.DB_SSL === 'require' ? { rejectUnauthorized: false } : false
    })
    console.log('Conectado a PostgreSQL local')
}

// Probar la conexión
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.stack)
    } else {
        console.log('Conexion a base de datos exitosa')
        release()
    }
})

module.exports = pool