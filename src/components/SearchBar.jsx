import React, { useState, useEffect } from 'react';
import { getTrendingSearches } from '../services/searchHistoryService.js';

export default function SearchBar({ onSearch, isLoading }) {
  const [input, setInput] = useState('');
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    setTrending(getTrendingSearches(5));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
      setInput('');
    }
  };

  const handleTrendingClick = (brand) => {
    onSearch(brand);
    setInput('');
  };

  return (
    <div className="search-container">
      <div className="search-box">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter brand name (e.g., WhatsApp, YouTube, Slack)..."
            disabled={isLoading}
            className="search-input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="search-button"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {trending.length > 0 && (
        <div className="trending-suggestions">
          <p className="trending-label">Trending searches:</p>
          <div className="trending-list">
            {trending.map((brand) => (
              <button
                key={brand}
                className="trending-item"
                onClick={() => handleTrendingClick(brand)}
                disabled={isLoading}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
