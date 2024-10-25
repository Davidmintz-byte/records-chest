// Import necessary modules
import React, { useState } from 'react';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import AddAlbum from './components/AddAlbum';
import Collection from './components/Collection';
import NavBar from './components/NavBar';

// Define the main App component
function App() {
  // State to track if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // State to track if user wants to register or login
  const [showRegister, setShowRegister] = useState(false);
  // State to track which view to show when logged in
  const [currentView, setCurrentView] = useState('collection');
  // State to trigger collection refresh
  const [refreshCollection, setRefreshCollection] = useState(false);

  // Function to handle successful login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentView('collection');
  };

  // Function to handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('collection');
  };

  // Function to handle navigation
  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  // Function to handle successful album addition
  const handleAlbumAdded = () => {
    setRefreshCollection(!refreshCollection); // Toggle to trigger refresh
    setCurrentView('collection'); // Automatically switch to collection view
  };

  // Function to render the correct view when logged in
  const renderLoggedInView = () => {
    switch(currentView) {
      case 'collection':
        return <Collection refresh={refreshCollection} />;
      case 'add':
        return <AddAlbum onAlbumAdded={handleAlbumAdded} />;
      default:
        return <Collection refresh={refreshCollection} />;
    }
  };

  return (
    <div className="app-container">
      {isLoggedIn ? (
        <>
          <NavBar 
            onLogout={handleLogout} 
            onNavigate={handleNavigation}
            currentView={currentView}
          />
          <main>
            {renderLoggedInView()}
          </main>
        </>
      ) : (
        <>
          <header className="header">
            <h1>Record Chest</h1>
          </header>
          <main>
            {showRegister ? (
              <div>
                <Register />
                <button className="auth-button" onClick={() => setShowRegister(false)}>
                  Already have an account? Login
                </button>
              </div>
            ) : (
              <div>
                <Login onLoginSuccess={handleLoginSuccess} />
                <button className="auth-button" onClick={() => setShowRegister(true)}>
                  Need an account? Register
                </button>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;