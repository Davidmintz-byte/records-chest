// Import necessary hooks from React
import React, { useState } from 'react';

// Define the Register component
function Register() {
  // State variables for email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Registration successful:', data);
        // TODO: Add success message or redirect user
      } else {
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