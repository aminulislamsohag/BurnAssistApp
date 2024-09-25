import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css'; 

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/users/login', {
        username,
        password
      });
      console.log('Login INFO:', response.data);
      if(response.data===1){
      setMessage('Login successful');
      localStorage.setItem('auth', 'true'); // Set auth flag in localStorage
      localStorage.setItem('username', username); // Store username
      navigate('/home'); // Redirect to home page
    }
     else if(response.data===2)
      setMessage('User Not Found');
      else
      setMessage('Login Failed Wrong password');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error('Login failed:', error.response.data);
        setMessage('Invalid username or password');
      } else {
        console.error('Login failed:', error.message);
        setMessage('Login failed: ' + error.message);
      }
    }
  };

  return (

    <div className="login-container">
      <div className="login-card">
        <div className="text-center">
          <i className="fa fa-user-circle fa-5x"></i>
        </div>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="form-group">
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text"><i className="fa fa-user"></i></span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group mt-3">
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text"><i className="fa fa-lock"></i></span>
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block mt-2">Login</button>

        </form>
        {message && <p className="mt-3 text-center">{message}</p>}
      </div>
    </div>




    
  );
}
