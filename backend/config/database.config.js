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
} 
// Si no existe (entorno local)
else {
    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    })
}

module.exports = pool