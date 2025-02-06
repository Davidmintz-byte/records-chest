// Import necessary modules
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
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
    <BrowserRouter>
      <div className="app-container">
        {isLoggedIn ? (
          <>
            <NavBar 
              onLogout={handleLogout} 
              onNavigate={handleNavigation}
              currentView={currentView}
            />
            <main>
              <Routes>
                <Route path="/collection" element={<Collection refresh={refreshCollection} />} />
                <Route path="/add" element={<AddAlbum onAlbumAdded={handleAlbumAdded} />} />
                <Route path="/" element={<Navigate to="/collection" />} />
              </Routes>
            </main>
          </>
        ) : (
          <>
            <header className="header">
              <h1>Record Chest</h1>
            </header>
            <main>
              <Routes>
                <Route path="/register" element={
                  <div>
                    <Register onLoginSuccess={handleLoginSuccess} />
                    <Link to="/" className="auth-button">
                      Already have an account? Login
                    </Link>
                  </div>
                } />
                <Route path="*" element={
                  <div>
                    <Login onLoginSuccess={handleLoginSuccess} />
                    <Link to="/register" className="auth-button">
                      Need an account? Register
                    </Link>
                  </div>
                } />
              </Routes>
            </main>
          </>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;