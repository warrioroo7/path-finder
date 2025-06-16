// // server/auth.js (Corrected Version)
// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const pool = require('./db');
// const authMiddleware = require('./middleware/authMiddleware');

// const router = express.Router();

// // --- SIGNUP ROUTE ---
// router.post('/signup', async (req, res) => {
//     try {
//         const { name, email, password } = req.body;
//         const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
//         if (existingUsers.length > 0) {
//             return res.status(400).json({ error: 'User with this email already exists.' });
//         }
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);
//         await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
//         res.status(201).json({ message: 'User created successfully! You can now log in.' });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });

// // --- LOGIN ROUTE ---
// router.post('/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
//         if (rows.length === 0) {
//             return res.status(400).json({ error: 'Invalid credentials.' });
//         }
//         const user = rows[0];
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ error: 'Invalid credentials.' });
//         }
//         const payload = { user: { id: user.id } };
//         jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' }, (err, token) => {
//             if (err) throw err;
//             res.json({ token });
//         });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });

// // --- GET CURRENT USER'S INFO ROUTE ---
// router.get('/me', authMiddleware, async (req, res) => {
//     try {
//         const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [req.user.id]);
//         if (rows.length === 0) {
//             return res.status(404).json({ msg: 'User not found' });
//         }
//         res.json(rows[0]);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// });

// module.exports = router;