import React, { useState, useCallback, useEffect } from 'react';
import SearchEngine from '../utils/searchEngine';
import SearchResult from './SearchResult';
import brandsData from '../data/brands';
import storageManager from '../utils/storageManager';
import '../styles/BrandSearch.css';

const BrandSearch = ({ onBrandSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchEngine] = useState(() => new SearchEngine(brandsData));
  const [searchTime, setSearchTime] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const performSearch = useCallback((searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearchTime(0);
      return;
    }

    setIsSearching(true);
    const startTime = performance.now();

    // Simulate async search with setTimeout to measure performance
    setTimeout(() => {
      const searchResults = searchEngine.search(searchQuery);
      const endTime = performance.now();

      setResults(searchResults);
      setSearchTime(Math.round(endTime - startTime));
      setIsSearching(false);

      // Save search to history
      storageManager.addToSearchHistory(searchQuery);
    }, 0);
  }, [searchEngine]);

  // Debounce search with 300ms delay
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, performSearch]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearchTime(0);
  };

  return (
    <div className="brand-search-container">
      <div className="search-header">
        <h1>Brand Ownership Search</h1>
        <p>Search for brands and explore their ownership structures</p>
      </div>

      <div className="search-input-section">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Enter brand name (e.g., Pepsi, Whole Foods, TikTok)"
            value={query}
            onChange={handleInputChange}
            autoFocus
          />
          {query && (
            <button
              className="clear-btn"
              onClick={handleClear}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {isSearching && (
          <div className="searching-indicator">
            Searching...
          </div>
        )}

        {!isSearching && query && (
          <div className="search-stats">
            <span>{results.length} result{results.length !== 1 ? 's' : ''} found</span>
            <span className="search-time">({searchTime}ms)</span>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="results-section">
          <div className="results-list">
            {results.map((brand) => (
              <SearchResult
                key={brand.id}
                brand={brand}
                onBrandSelect={onBrandSelect}
              />
            ))}
          </div>
        </div>
      )}

      {query && results.length === 0 && !isSearching && (
        <div className="no-results">
          <p>No brands found matching "{query}"</p>
          <p className="hint">Try searching for: Pepsi, Dunkin', Burger King, or TikTok</p>
        </div>
      )}

      {!query && (
        <div className="welcome-section">
          <p>Enter a brand name to search for ownership information</p>
          <div className="sample-brands">
            <p>Sample brands: Pepsi, Tropicana, Whole Foods Market, TikTok, Burger King</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandSearch;
