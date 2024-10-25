// Import React and necessary hooks
import React, { useState, useEffect } from 'react';
import AlbumTags from './AlbumTags';
import SearchBar from './SearchBar';
import EditAlbum from './EditAlbum';  


function Collection({ refresh }) {
  const [albums, setAlbums] = useState([]);
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAlbum, setEditingAlbum] = useState(null); 


  // Effect hook to fetch albums when component mounts
  useEffect(() => {
    fetchAlbums();
  }, [refresh]);

  // Function to fetch albums from the backend
  const fetchAlbums = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/albums', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        throw new Error('Authentication expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch albums');
      }

      const data = await response.json();
      setAlbums(data);
      setFilteredAlbums(data); // Initialize filtered albums with all albums
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      console.error('Fetch error:', err);
    }
  };

  // Function to handle search
  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredAlbums(albums);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = albums.filter(album => {
      // Search in album name and artist
      if (album.name.toLowerCase().includes(term) || 
          album.artist.toLowerCase().includes(term)) {
        return true;
      }
      
      // Search in genre
      if (album.genre && album.genre.toLowerCase().includes(term)) {
        return true;
      }
      
      // Search in year
      if (album.year && album.year.toString().includes(term)) {
        return true;
      }
      
      // Search in tags
      if (album.tags && album.tags.some(tag => 
        tag.name.toLowerCase().includes(term)
      )) {
        return true;
      }
      
      return false;
    });

    setFilteredAlbums(filtered);
  };

  // Show loading state
  if (isLoading) {
    return <div className="loading">Loading your record collection...</div>;
  }

  // Show error state
  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  const handleEditComplete = async () => {
    await fetchAlbums(); // Refresh the albums list
    setEditingAlbum(null); // Close the edit form
  };

  return (
    <div className="collection-container">
      <SearchBar onSearch={handleSearch} />
      
      {/* Add the edit form modal */}
      {editingAlbum && (
        <>
          <div className="modal-overlay" />
          <EditAlbum
            album={editingAlbum}
            onSave={handleEditComplete}
            onCancel={() => setEditingAlbum(null)}
          />
        </>
      )}
      
      {filteredAlbums.length === 0 ? (
        <div className="empty-collection">
          {albums.length === 0 
            ? "Your record collection is empty. Add some albums!"
            : "No albums match your search."}
        </div>
      ) : (
        <div className="albums-grid">
          {filteredAlbums.map((album) => (
            <div key={album.id} className="album-card">
              {album.artwork && (
                <div className="album-artwork">
                  <img src={album.artwork} alt={`${album.name} cover`} />
                </div>
              )}
              <div className="album-info">
                <div className="album-header">
                  <h3>{album.name}</h3>
                  <button 
                    className="edit-button"
                    onClick={() => setEditingAlbum(album)}
                  >
                    Edit
                  </button>
                </div>
                <p className="artist">{album.artist}</p>
                {album.year && <p className="year">{album.year}</p>}
                {album.genre && <p className="genre">{album.genre}</p>}
                <AlbumTags 
                  albumId={album.id}
                  tags={album.tags || []}
                  onTagsUpdate={fetchAlbums}
                />
                {album.apple_music_link && (
                  <a 
                    href={album.apple_music_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="apple-music-link"
                  >
                    Listen on Apple Music
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Collection;