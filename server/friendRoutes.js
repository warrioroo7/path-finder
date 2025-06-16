// server/friendRoutes.js (Complete and Correct Version)

const express = require('express');
const pool = require('./db');
const authMiddleware = require('./middleware/authMiddleware');

const router = express.Router();

// --- SEND A FRIEND REQUEST ---
router.post('/request', authMiddleware, async (req, res) => {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    try {
        if (!senderId || !receiverId) {
            return res.status(400).json({ msg: "Missing user IDs" });
        }
        await pool.query(
            'INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (?, ?, ?)',
            [senderId, receiverId, 'pending']
        );
        res.json({ msg: 'Friend request sent' });
    } catch (err) {
        console.error("DATABASE ERROR while sending friend request:", err);
        res.status(500).send('Server Error');
    }
});

// --- VIEW MY INCOMING FRIEND REQUESTS ---
router.get('/requests', authMiddleware, async (req, res) => {
    const myId = req.user.id;
    try {
        const [requests] = await pool.query(
            `SELECT fr.id, u.name AS sender_name 
             FROM friend_requests fr
             JOIN users u ON fr.sender_id = u.id
             WHERE fr.receiver_id = ? AND fr.status = 'pending'`,
            [myId]
        );
        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// --- RESPOND TO A FRIEND REQUEST (ACCEPT/DECLINE) ---
router.put('/requests/:requestId', authMiddleware, async (req, res) => {
    const myId = req.user.id;
    const { requestId } = req.params;
    const { action } = req.body; // 'accepted' or 'declined'

    if (action !== 'accepted' && action !== 'declined') {
        return res.status(400).json({ msg: 'Invalid action' });
    }

    try {
        // First, update the status of the request
        await pool.query(
            'UPDATE friend_requests SET status = ? WHERE id = ? AND receiver_id = ?',
            [action, requestId, myId]
        );

        // If accepted, add the friendship to the main 'friendships' table
        if (action === 'accepted') {
            const [request] = await pool.query('SELECT sender_id FROM friend_requests WHERE id = ?', [requestId]);
            if (request.length > 0) {
                const senderId = request[0].sender_id;
                // Add friendship in both directions to make pathfinding easier
                await pool.query(
                    'INSERT IGNORE INTO friendships (user_id_1, user_id_2) VALUES (?, ?), (?, ?)',
                    [senderId, myId, myId, senderId]
                );
            }
        }
        res.json({ msg: `Friend request ${action}` });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;