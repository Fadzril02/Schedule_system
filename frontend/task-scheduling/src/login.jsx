import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './StudentPortal.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email });
      const { role, id, name } = response.data;

      if (role === 'Admin') {
        alert(`Welcome, Admin ${name}`);
        navigate('/admin-dashboard');
      } else {
        navigate(`/student-view/${id}`);
      }
    } catch (err) {
        setError(err.response ? err.response.data.message : "Server error");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🔐 UTM Library System</h2>
        <p>Enter email to access dashboard</p>
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Enter your email..." 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default Login;