import React, { useState, useRef } from 'react';
import { API_URL } from '../config';  // adjust the path based on your file location

function EditAlbum({ album, onSave, onCancel }) {
  const [name, setName] = useState(album.name);
  const [artist, setArtist] = useState(album.artist);
  const [year, setYear] = useState(album.year || '');
  const [genre, setGenre] = useState(album.genre || '');
  const [appleMusicLink, setAppleMusicLink] = useState(album.apple_music_link || '');
  const [artwork, setArtwork] = useState(album.artwork || '');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setArtwork(`${API_URL}${data.imageUrl}`);
      } else {
        setError(data.error || 'Failed to upload image');
      }
    } catch (err) {
      setError('Error uploading image');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveArtwork = () => {
    if (window.confirm('Are you sure you want to remove the album artwork?')) {
      setArtwork(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/albums/${album.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name,
          artist,
          year: year ? parseInt(year) : null,
          genre: genre || null,
          apple_music_link: appleMusicLink || null,
          artwork: artwork || null
        })
      });

      if (response.ok) {
        onSave();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update album');
      }
    } catch (error) {
      console.error('Error updating album:', error);
      setError('Error updating album');
    }
  };

  return (
    <div className="edit-album-form">
      <h3>Edit album</h3>
      {error && <div className="error-message">{error}</div>}
      
      <div className="artwork-section">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
        
        {artwork ? (
          <div className="current-artwork">
            <img src={artwork} alt="Album artwork" className="artwork-preview" />
            <div className="artwork-buttons">
              <button 
                type="button" 
                onClick={() => fileInputRef.current.click()} 
                className="change-image-button"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Change Image'}
              </button>
              <button 
                type="button" 
                onClick={handleRemoveArtwork} 
                className="remove-image-button"
                disabled={isUploading}
              >
                Remove Image
              </button>
            </div>
          </div>
        ) : (
          <button 
            type="button" 
            onClick={() => fileInputRef.current.click()} 
            className="add-image-button"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Add Album Artwork'}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Album Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="artist">Artist:</label>
          <input
            type="text"
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
        </div>
        
        <div className="form-group">
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
        
        <div className="form-group">
          <label htmlFor="genre">Genre:</label>
          <input
            type="text"
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="appleMusicLink">Apple Music Link:</label>
          <input
            type="url"
            id="appleMusicLink"
            value={appleMusicLink}
            onChange={(e) => setAppleMusicLink(e.target.value)}
            placeholder="https://music.apple.com/..."
          />
        </div>

        <div className="button-group">
          <button type="submit" className="save-button">Save Changes</button>
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditAlbum;