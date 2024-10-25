import React, { useState, useEffect } from 'react';

function AlbumTags({ albumId, tags, onTagsUpdate }) {
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch existing tags when component mounts
  useEffect(() => {
    fetchExistingTags();
  }, []);

  const fetchExistingTags = async () => {
    try {
      console.log('Fetching existing tags...');
      const response = await fetch('http://localhost:5000/user/tags', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched tags:', data);
        setExistingTags(data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    setNewTag(input);
    console.log('Input changed:', input);
    console.log('Existing tags:', existingTags);
    console.log('Current album tags:', tags);

    // Filter suggestions based on input
    if (input.trim()) {
        // Modified filtering logic
        const filtered = existingTags.filter(tag => {
            const matchesInput = tag.toLowerCase().includes(input.toLowerCase());
            const isNotAlreadyAdded = !tags.some(existingTag => existingTag.name === tag);
            console.log(`Tag: ${tag}, Matches Input: ${matchesInput}, Not Already Added: ${isNotAlreadyAdded}`);
            return matchesInput && isNotAlreadyAdded;
        });
        
        console.log('Filtered suggestions:', filtered);
        setSuggestions(filtered);
        setShowSuggestions(true);
    } else {
        setSuggestions([]);
        setShowSuggestions(false);
    }
};

  const handleSuggestionClick = (suggestion) => {
    setNewTag(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/albums/${albumId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newTag.trim() })
      });

      if (response.ok) {
        setNewTag('');
        setError('');
        setSuggestions([]);
        if (onTagsUpdate) {
          onTagsUpdate();
          fetchExistingTags(); // Refresh the suggestions list
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add tag');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error adding tag');
    }
  };

  const handleRemoveTag = async (tagId) => {
    try {
      const response = await fetch(`http://localhost:5000/albums/${albumId}/tags/${tagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        if (onTagsUpdate) {
          onTagsUpdate();
          fetchExistingTags(); // Refresh the suggestions list
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to remove tag');
      }
    } catch (error) {
      console.error('Error removing tag:', error);
      setError('Error removing tag');
    }
  };

  return (
    <div className="album-tags">
      <div className="tags-container">
        {tags && tags.map(tag => (
          <span key={tag.id} className="tag">
            {tag.name}
            <button 
              onClick={() => handleRemoveTag(tag.id)}
              className="remove-tag"
              title="Remove tag"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      
      <form onSubmit={handleAddTag} className="add-tag-form">
        <div className="tag-input-container">
          <input
            type="text"
            value={newTag}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Add a tag..."
            className="tag-input"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="tag-suggestions">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="tag-suggestion"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="submit" className="add-tag-button">Add</button>
      </form>
      
      {error && <div className="tag-error">{error}</div>}
    </div>
  );
}

export default AlbumTags;