import React, { useState } from 'react';
import BrandSearch from './components/BrandSearch';
import SentimentDashboard from './components/SentimentDashboard';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('search');
  const [selectedBrandId, setSelectedBrandId] = useState(1);

  const handleBrandSelect = (brandId) => {
    setSelectedBrandId(brandId);
    setActiveView('sentiment');
  };

  return (
    <div className="app">
      <nav className="app-nav">
        <div className="nav-container">
          <h1 className="app-title">Searcher</h1>
          <ul className="nav-menu">
            <li>
              <button
                className={`nav-btn ${activeView === 'search' ? 'active' : ''}`}
                onClick={() => setActiveView('search')}
              >
                🔍 Brand Search
              </button>
            </li>
            <li>
              <button
                className={`nav-btn ${activeView === 'sentiment' ? 'active' : ''}`}
                onClick={() => setActiveView('sentiment')}
              >
                📊 Sentiment Trends
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div className="app-content">
        {activeView === 'search' ? (
          <BrandSearch onBrandSelect={handleBrandSelect} />
        ) : (
          <SentimentDashboard brandId={selectedBrandId} isAdmin={true} />
        )}
      </div>
    </div>
  );
}

export default App;
