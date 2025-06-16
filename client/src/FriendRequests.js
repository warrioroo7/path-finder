import React, { useState, useEffect } from 'react';

function FriendRequests() {
    const [requests, setRequests] = useState([]);
    const token = localStorage.getItem('token');

    const fetchRequests = async () => {
        if (!token) return;
        const res = await fetch('http://localhost:3001/api/friends/requests', {
            headers: { 'x-auth-token': token }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
            setRequests(data);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [token]);

    const handleResponse = async (requestId, action) => {
        await fetch(`http://localhost:3001/api/friends/requests/${requestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ action })
        });
        // Refresh the list after responding
        fetchRequests();
    };

    return (
        <div className="friend-requests">
            <h3>Friend Requests</h3>
            {requests.length === 0 ? (
                <p>No new requests.</p>
            ) : (
                <ul>
                    {requests.map(req => (
                        <li key={req.id}>
                            <span>{req.sender_name}</span>
                            <div className="request-buttons">
                                <button onClick={() => handleResponse(req.id, 'accepted')}>Accept</button>
                                <button className="decline" onClick={() => handleResponse(req.id, 'declined')}>Decline</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default FriendRequests;