import React, { useState } from 'react';
import { API_URL } from '../config';  // adjust the path based on your file location

function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value); // Pass the search term to parent component
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search albums by name, artist, tags..."
        className="search-input"
      />
    </div>
  );
}

export default SearchBar;