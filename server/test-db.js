// server/test-db.js
const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('Attempting to connect to MySQL...');
    try {
        const pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            database: 'pathfinder',
            password: 'saxena172900@NIT', // <-- Put your real password here!
        });

        console.log('Connection pool created. Fetching users...');
        const [rows] = await pool.query('SELECT * FROM users');

        console.log('✅ Success! Database connection is working.');
        console.log('Users found:', rows);

    } catch (error) {
        console.error('❌ Error! Failed to connect to the database.');
        console.error(error);
    }
}

testConnection();