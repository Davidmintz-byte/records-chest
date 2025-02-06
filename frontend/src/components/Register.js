// Import necessary hooks from React
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';  // adjust the path based on your file location

// Define the Register component
function Register({ onLoginSuccess }) {
  // State variables for email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize the navigate hook

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      // First, register the user
      const registerResponse = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (registerResponse.ok) {
        // If registration is successful, immediately log them in
        const loginResponse = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          // Store the token in localStorage
          localStorage.setItem('token', loginData.token);
          // Call the onLoginSuccess callback to update app state
          onLoginSuccess();
          // Navigate to collection page
          navigate('/collection');
        } else {
          console.error('Auto-login failed after registration');
          navigate('/');
        }
      } else {
        const data = await registerResponse.json();
        console.error('Registration failed:', data.message);
        // TODO: Show error message to user
      }
    } catch (error) {
      console.error('Error during registration:', error);
      // TODO: Show error message to user
    }
  };

  // Render the registration form
  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state on input change
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state on input change
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

// Export the Register component for use in other parts of the app
export default Register;