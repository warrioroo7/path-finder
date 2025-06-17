// server/db.js
const mysql = require('mysql2/promise');

// This pool manages our connection to the MySQL database.
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'pathfinder',
    password: 'saxena172900@NIT', // Your password is correct here
});

// We export the pool so other files can use it.
module.exports = pool;
