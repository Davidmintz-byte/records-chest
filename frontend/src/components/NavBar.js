// Import React
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_URL } from '../config';  // adjust the path based on your file location

// Define the NavBar component
function NavBar({ onLogout }) {
  const location = useLocation();
  
  return (
    <nav className="nav-bar">
      <div className="nav-brand">My Record Chest</div>
      <div className="nav-links">
        <Link 
          to="/collection" 
          className={`nav-button ${location.pathname === '/collection' ? 'active' : ''}`}
        >
          My Collection
        </Link>
        <Link 
          to="/add" 
          className={`nav-button ${location.pathname === '/add' ? 'active' : ''}`}
        >
          Add Album
        </Link>
        <button 
          className="nav-button logout" 
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

// Export the NavBar component
export default NavBar;