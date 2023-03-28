const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost', 
    user: 'radouane',
    password: 'duckit69',
    port: 5432,
    database: 'E_health'
})

module.exports = {
    query: (text, params) => pool.query(text, params)
}