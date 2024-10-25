// Import necessary hooks from React
import React, { useState } from 'react';
import { API_URL } from '../config';  // adjust the path based on your file location

// Define the AddAlbum component
function AddAlbum({ onAlbumAdded }) {
  // State variables for album details
  const [albumName, setAlbumName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [year, setYear] = useState('');
  const [genre, setGenre] = useState('');
  const [appleMusicLink, setAppleMusicLink] = useState('');
  // State for status message
  const [message, setMessage] = useState('');
  // State for loading during fetch
  const [isLoading, setIsLoading] = useState(false);
  // State to track if manual entry is shown
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Function to fetch album data from Apple Music link
  const handleAppleMusicLinkChange = async (e) => {
    const link = e.target.value;
    setAppleMusicLink(link);

    if (link.includes('music.apple.com')) {
      setIsLoading(true);
      try {
        const response = await fetch('${API_URL}/fetch-album-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ url: link })
        });

        const data = await response.json();
        
        if (response.ok) {
          setAlbumName(data.name || '');
          setArtistName(data.artist || '');
          setYear(data.year || '');
          setGenre(data.genre || '');
          localStorage.setItem('tempArtwork', data.artwork); // Add this line
          console.log('Fetched album data:', data); // Add this line
        } else {
          setMessage('Failed to fetch album data');
        }
      } catch (error) {
        console.error('Error fetching album data:', error);
        setMessage('Error fetching album data');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!albumName.trim()) {
      setMessage('Album name is required');
      return;
    }

    const albumData = {
      name: albumName,
      artist: artistName,
      year: year ? parseInt(year) : null,
      genre: genre || null,
      appleMusicLink: appleMusicLink || null,
      artwork: appleMusicLink ? localStorage.getItem('tempArtwork') : null // Add this line
    };
    
    console.log('Submitting album data:', albumData); // Add this line

    setMessage('');
    
    try {
      const response = await fetch('${API_URL}/add_album', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(albumData), // Use the albumData object
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Album added successfully!');
        // Clear the form
        setAlbumName('');
        setArtistName('');
        setYear('');
        setGenre('');
        setAppleMusicLink('');
        localStorage.removeItem('tempArtwork'); // Add this line
        // Call the callback to refresh the collection
        if (onAlbumAdded) {
          onAlbumAdded();
        }
      } else {
        setMessage(data.error || 'Failed to add album');
      }
    } catch (error) {
      setMessage('Error adding album');
      console.error('Error:', error);
    }
  };

  const renderAppleMusicForm = () => (
    <div className="apple-music-form">
      <h3>Add album using Apple Music Link</h3>
      <p className="form-description">
        Simply paste an Apple Music album link below, and we'll automatically fetch the album details.
      </p>
      <div className="input-group">
        <label htmlFor="appleMusicLink">Apple Music Link:</label>
        <input
          type="url"
          id="appleMusicLink"
          value={appleMusicLink}
          onChange={handleAppleMusicLinkChange}
          placeholder="https://music.apple.com/..."
        />
      </div>
    </div>
  );

  const renderManualForm = () => (
    <div className="manual-entry-form">
      <h3>Add Album Manually</h3>
      <div>
        <label htmlFor="albumName">Album Name: *</label>
        <input
          type="text"
          id="albumName"
          value={albumName}
          onChange={(e) => setAlbumName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="artistName">Artist Name:</label>
        <input
          type="text"
          id="artistName"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="year">Year:</label>
        <input
          type="number"
          id="year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          min="1900"
          max={new Date().getFullYear()}
        />
      </div>
      <div>
        <label htmlFor="genre">Genre:</label>
        <input
          type="text"
          id="genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        />
      </div>
      <button 
        type="button" 
        className="secondary-button"
        onClick={() => setShowManualEntry(false)}
      >
        Back to Apple Music link
      </button>
    </div>
  );

  return (
    <div className="add-album-container">
      <h2>Add New Album</h2>
      {message && <div className={message.includes('success') ? 'success-message' : 'error-message'}>
        {message}
      </div>}
      {isLoading && <div className="loading-message">Fetching album details...</div>}
      
      <form onSubmit={handleSubmit}>
        {showManualEntry ? (
          <>
            {renderManualForm()}
            <button type="submit" className="primary-button">Add Album</button>
            <button 
              type="button" 
              className="secondary-button"
              onClick={() => setShowManualEntry(false)}
            >
              Back to Apple Music link
            </button>
          </>
        ) : (
          <>
            {renderAppleMusicForm()}
            <button type="submit" className="primary-button">Add Album</button>
            <button 
              type="button" 
              className="secondary-button"
              onClick={() => setShowManualEntry(true)}
            >
              Add album manually instead
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default AddAlbum;