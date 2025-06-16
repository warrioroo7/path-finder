// client/src/App.js (Updated for new layout)

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

import PathFinder from './PathFinder';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import ProfilePage from './ProfilePage';
import './App.css';

function App() {
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="App">
        {/* We create a main header for the entire application */}
        <header className="App-header-main">
          <h1>Path Finder App</h1>
          <nav className="main-nav">
            {token ? (
              <button onClick={handleLogout} className="nav-button">Logout</button>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/signup" className="nav-link">Signup</Link>
              </div>
            )}
          </nav>
        </header>

        {/* The main content area where pages will be rendered */}
        <main className="App-content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile/:id" element={token ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="/" element={token ? <PathFinder /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;