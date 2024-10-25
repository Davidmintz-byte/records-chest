// Import React
import React from 'react';
import { API_URL } from '../config';  // adjust the path based on your file location

// Define the NavBar component
function NavBar({ onLogout, onNavigate, currentView }) {
  return (
    <nav className="nav-bar">
      <div className="nav-brand">My Record Chest</div>
      <div className="nav-links">
        <button 
          className={`nav-button ${currentView === 'collection' ? 'active' : ''}`}
          onClick={() => onNavigate('collection')}
        >
          My Collection
        </button>
        <button 
          className={`nav-button ${currentView === 'add' ? 'active' : ''}`}
          onClick={() => onNavigate('add')}
        >
          Add Album
        </button>
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