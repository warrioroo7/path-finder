// client/src/PathFinder.js (Final Corrected Version)

import React, { useState, useEffect } from 'react';
import ReactFlow, { ReactFlowProvider, MiniMap, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';
import FriendRequests from './FriendRequests';
import { Link } from 'react-router-dom';

function PathFinder() {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [users, setUsers] = useState([]);
    const [startUser, setStartUser] = useState('');
    const [endUser, setEndUser] = useState('');
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            // Do nothing if the user is not logged in
            if (!token) return;

            try {
                // Fetch the logged-in user's own data
                const meResponse = await fetch('http://localhost:3001/api/auth/me', {
                    headers: {
                        'x-auth-token': token // Send token to get my own info
                    }
                });
                const meData = await meResponse.json();
                setCurrentUser(meData);
                setStartUser(meData.id);

                // Fetch the list of all OTHER users for the dropdown
                const usersResponse = await fetch('http://localhost:3001/api/users', {
                    headers: {
                        'x-auth-token': token // Send token to get list of other users
                    }
                });
                const usersData = await usersResponse.json();
                if (Array.isArray(usersData)) {
                    setUsers(usersData);
                    if (usersData.length > 0) {
                        setEndUser(usersData[0].id);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch initial data", err);
                setError("Could not load user data. Please try logging in again.");
            }
        };
        fetchInitialData();
    }, [token]);

    const generateFlowElements = (path) => {
        const newNodes = path.map((userName, index) => ({
            id: `${index}`, data: { label: userName }, position: { x: index * 180, y: 100 },
        }));
        const newEdges = [];
        for (let i = 0; i < path.length - 1; i++) {
            newEdges.push({ id: `e${i}-${i + 1}`, source: `${i}`, target: `${i + 1}`, animated: true, style: { stroke: '#50fa7b' } });
        }
        setNodes(newNodes);
        setEdges(newEdges);
    };

    const handleFindPath = async () => {
        setError(''); setNodes([]); setEdges([]);
        try {
            const response = await fetch(`http://localhost:3001/api/path/${startUser}/${endUser}`, {
                headers: { 'x-auth-token': token } // Send token to find a path
            });
            if (!response.ok) throw new Error('Path not found');
            const data = await response.json();
            generateFlowElements(data.path);
        } catch (err) {
            setError('No path could be found between these two users.');
        }
    };

    const handleAddFriend = async (receiverId) => {
        if (!receiverId || receiverId.toString() === currentUser.id.toString()) {
            alert("You cannot add yourself as a friend!");
            return;
        }
        try {
            await fetch('http://localhost:3001/api/friends/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ receiverId })
            });
            alert('Friend request sent!');
        } catch (err) {
            alert('Could not send friend request.');
        }
    };

    return (
        <div className="App-header">
            <h1>Degree of Separation Calculator</h1>
            <div className="controls">
                <div className="select-container">
                    <label>Person A</label>
                    <select value={startUser} onChange={(e) => setStartUser(e.target.value)} disabled>
                        {currentUser ? (
                            <option value={currentUser.id}>You ({currentUser.name})</option>
                        ) : (
                            <option>Loading...</option>
                        )}
                    </select>
                </div>
                <div className="select-container">
                    <label>Person B</label>
                    <select value={endUser} onChange={(e) => setEndUser(e.target.value)}>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
                <button onClick={handleFindPath}>Find Visual Path</button>
            </div>
            <button className="add-friend-button" onClick={() => handleAddFriend(endUser)}>Add Person B as Friend</button>
            <div className="main-content">
                <div className="result-graph">
                    <ReactFlowProvider>
                        <ReactFlow nodes={nodes} edges={edges} fitView>
                            <MiniMap nodeColor="#6272a4" maskColor="#282c34" />
                            <Controls />
                            <Background />
                        </ReactFlow>
                    </ReactFlowProvider>
                </div>
                <FriendRequests />
            </div>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

export default PathFinder;