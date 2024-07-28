import React, { useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode'; // Correct import statement
import './Home.css';

const Home = () => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUsername(decoded.username);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="home-container">
      <div className="welcome-box">
        <h1>Welcome, {username}!</h1>
        <p>You have successfully logged in!</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Home;