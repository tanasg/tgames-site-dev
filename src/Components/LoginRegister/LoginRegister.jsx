import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginRegister.css';

const LoginRegister = () => {
  const [isLoginActive, setIsLoginActive] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        // Store the JWT token in local storage
        localStorage.setItem('token', data.token);
        alert(data.message);
        // Navigate to the home page
        navigate('/home');
      } else {
        setErrors([data.message]);
      }
    } catch (error) {
      setErrors(['Error logging in: ' + error.message]);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    if (password !== confirmPassword) {
      setErrors(['Passwords do not match!']);
      return;
    }
    if (!termsAccepted) {
      setErrors(['You must accept the terms and conditions.']);
      return;
    }
    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, phoneNumber }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
      } else {
        setErrors(data.errors || [data.message]);
      }
    } catch (error) {
      setErrors(['Error registering: ' + error.message]);
    }
  };

  return (
    <div className={`wrapper ${!isLoginActive ? 'active' : ''}`}>
      <div className="form-box login">
        <h1>Login</h1>
        <form onSubmit={handleLoginSubmit}>
          <div className="input-box">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="icon">&#128100;</span>
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="icon">&#128274;</span>
          </div>
          <div className="remember-forgot">
            <label>
              <input type="checkbox" />
              Remember me
            </label>
            <a href="#">Forgot password?</a>
          </div>
          <button type="submit">Login</button>
          <div className="register-link">
            <p>
              Don't have an account?{' '}
              <a href="#" onClick={() => setIsLoginActive(false)}>
                Register
              </a>
            </p>
          </div>
        </form>
        {errors.length > 0 && (
          <div className="error-messages">
            {errors.map((error, index) => (
              <p key={index} className="error">{error}</p>
            ))}
          </div>
        )}
      </div>
      <div className="form-box register">
        <h1>Register</h1>
        <form onSubmit={handleRegisterSubmit}>
          <div className="input-box">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <span className="icon">&#128100;</span>
          </div>
          <div className="input-box">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="icon">&#128231;</span>
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="icon">&#128274;</span>
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span className="icon">&#128274;</span>
          </div>
          <div className="input-box">
            <input
              type="tel"
              placeholder="Phone Number (optional)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <span className="icon">&#128222;</span>
          </div>
          <div className="terms">
            <label>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              I accept the <a href="#">terms and conditions</a>
            </label>
          </div>
          <button type="submit">Register</button>
          <div className="register-link">
            <p>
              Already have an account?{' '}
              <a href="#" onClick={() => setIsLoginActive(true)}>
                Login
              </a>
            </p>
          </div>
        </form>
        {errors.length > 0 && (
          <div className="error-messages">
            {errors.map((error, index) => (
              <p key={index} className="error">{error}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginRegister;