// client/src/SignupPage.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (name.trim() === '' || email.trim() === '' || password.trim() === '') {
            setError('Please fill out all fields.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (response.ok) {
                alert('Signup successful! Please log in.');
                navigate('/login');
            } else {
                const data = await response.json();
                setError(data.error || 'Signup failed.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <h2>Signup</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
                <button type="submit">Signup</button>
                {error && <p className="error-message">{error}</p>}
            </form>
            <p>Already have an account? <Link to="/login">Log in here</Link></p>
        </div>
    );
}
export default SignupPage;