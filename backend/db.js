const Pool = require('pg').Pool;

const pool = new Pool({
    user: "postgres",
    password: "postgres",
    host: "localhost",
    post: "5432",
    database: "hire_radar"
})

module.exports = pool;