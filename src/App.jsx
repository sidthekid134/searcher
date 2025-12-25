import React, { useState } from 'react';
import SearchBar from './components/SearchBar.jsx';
import OwnershipTree from './components/OwnershipTree.jsx';
import VerdictCard from './components/VerdictCard.jsx';
import { getOwnershipChain } from './services/ownershipChainService.js';
import { addSearchToHistory } from './services/searchHistoryService.js';
import './App.css';

export default function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSearchBrand, setLastSearchBrand] = useState('');

  const handleSearch = async (brandName) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setLastSearchBrand(brandName);

    try {
      // Add to search history for trending suggestions
      addSearchToHistory(brandName);

      // Fetch ownership chain (tries Wikidata, falls back to database)
      const chainResult = await getOwnershipChain(brandName);

      if (chainResult.error && chainResult.chain.length === 0) {
        setError(chainResult.error);
        setResult(null);
      } else {
        setResult(chainResult);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve ownership information');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Brand Ownership Chain Search</h1>
        <p>Discover the complete ownership structure of any brand</p>
      </header>

      <main className="app-main">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {result && result.chain.length > 0 && (
          <div className="results-container">
            <div className="result-info">
              <h2>{lastSearchBrand}</h2>
              <div className="metadata">
                <span className="source-badge">
                  Source: <strong>{result.source}</strong>
                </span>
                <span className="confidence-badge">
                  Confidence: <strong>{Math.round(result.confidence * 100)}%</strong>
                </span>
              </div>
              <div className="chain-text">
                <p className="chain-path">
                  {result.chain.map((item, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="chain-arrow"> ← </span>}
                      <span className="chain-link">
                        {item.label}
                        {item.confidence && item.confidence < 1 && (
                          <span className="confidence-text">
                            {' '}({Math.round(item.confidence * 100)}%)
                          </span>
                        )}
                      </span>
                    </React.Fragment>
                  ))}
                </p>
              </div>
            </div>

            {/* Ownership Status Verdict Card */}
            {result.chain.length > 0 && (
              <div className="verdict-section">
                <VerdictCard
                  ultimateParent={result.chain[result.chain.length - 1]}
                  acquisitionYear={result.chain[result.chain.length - 1].acquisitionYear}
                />
              </div>
            )}

            <OwnershipTree chain={result.chain} source={result.source} />
          </div>
        )}

        {!result && !error && !isLoading && (
          <div className="placeholder">
            <p>Search for a brand to see its ownership structure</p>
            <p className="hint">Try: WhatsApp, YouTube, Instagram, Slack, GitHub, or any other brand</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Data sources: Wikidata (with fallback to local database)</p>
        <p>API timeout: 5 seconds | Max chain depth: 10 levels</p>
      </footer>
    </div>
  );
}
