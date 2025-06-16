// client/src/ProfilePage.js (Corrected Version)
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const token = localStorage.getItem('token'); // Get the token from storage

    useEffect(() => {
        const fetchUserData = async () => {
            if (!token) return; // Don't fetch if there's no token
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:3001/api/users/${id}`, {
                    // --- THIS IS THE FIX ---
                    // We must include the token in the headers of the request
                    headers: {
                        'x-auth-token': token
                    }
                    // --- END OF FIX ---
                });
                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error("Failed to fetch user data", error);
            }
            setLoading(false);
        };

        fetchUserData();
    }, [id, token]);

    if (loading) {
        return <div>Loading profile...</div>;
    }

    if (!user) {
        return <div>User not found.</div>;
    }

    // (The rest of the component is the same)
    return (
        <div className="profile-container">
            <h1>{user.name}'s Profile</h1>
            <p>Email: {user.email}</p>
            <hr />
            <h3>Friends ({user.friends.length})</h3>
            {user.friends.length > 0 ? (
                <ul>
                    {user.friends.map(friend => (
                        <li key={friend.id}>
                            <Link to={`/profile/${friend.id}`}>{friend.name}</Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>{user.name} has no friends yet.</p>
            )}
            {/* We will add an "Add Friend" button here later */}
        </div>
    );
}

export default ProfilePage;