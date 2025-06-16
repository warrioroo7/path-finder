// server/server.js (Final Clean Version)

const express = require('express');
const cors = require('cors');
const pool = require('./db');
const authMiddleware = require('./middleware/authMiddleware');

// --- Import our separate route files ---
const authRoutes = require('./auth');
const friendRoutes = require('./friendRoutes'); // This line registers your friend routes

const app = express();
const PORT = 3001;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- REGISTER THE ROUTES ---
// This tells Express: "Any request starting with /api/auth should be handled by authRoutes"
app.use('/api/auth', authRoutes);
// This tells Express: "Any request starting with /api/friends should be handled by friendRoutes"
app.use('/api/friends', friendRoutes);

// --- DSA LOGIC ---
const findShortestPath = (graph, startId, endId) => {
    if (!graph.has(startId) || !graph.has(endId)) return null;
    const queue = [[startId]];
    const visited = new Set([startId]);
    while (queue.length > 0) {
        const currentPath = queue.shift();
        const currentUser = currentPath[currentPath.length - 1];
        if (currentUser === endId) return currentPath;
        const neighbors = graph.get(currentUser) || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                const newPath = [...currentPath, neighbor];
                queue.push(newPath);
            }
        }
    }
    return null;
};

// --- CORE API ENDPOINTS ---

// Gets all users EXCEPT the currently logged-in user
app.get('/api/users', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name FROM users WHERE id != ? ORDER BY id', [req.user.id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Gets info for a specific user's profile page
app.get('/api/users/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const [userRows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [id]);
        if (userRows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const user = userRows[0];
        const [friends] = await pool.query(
            `SELECT u.id, u.name FROM users u JOIN friendships f ON u.id = f.user_id_2 WHERE f.user_id_1 = ?`,
            [id]
        );
        user.friends = friends;
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// The main pathfinder route
app.get('/api/path/:startId/:endId', authMiddleware, async (req, res) => {
    try {
        const { startId, endId } = req.params;
        const [users] = await pool.query('SELECT * FROM users');
        const [friendships] = await pool.query('SELECT * FROM friendships');
        const graph = new Map();
        users.forEach(user => graph.set(user.id, []));
        friendships.forEach(friendship => {
            graph.get(friendship.user_id_1).push(friendship.user_id_2);
            graph.get(friendship.user_id_2).push(friendship.user_id_1);
        });
        const path = findShortestPath(graph, parseInt(startId), parseInt(endId));
        if (path) {
            const pathWithNames = path.map(id => users.find(u => u.id === id).name);
            res.json({ path: pathWithNames });
        } else {
            res.status(404).json({ message: 'No path found.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});