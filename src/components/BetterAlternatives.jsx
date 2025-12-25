import React, { useState, useEffect } from 'react';
import {
  getBetterAlternatives,
  getAlternativesDisclaimer,
  formatAlternativesForDisplay
} from '../services/alternativesService.js';
import '../styles/BetterAlternatives.css';

export default function BetterAlternatives({ brandName, brandData }) {
  const [alternatives, setAlternatives] = useState([]);
  const [disclaimer, setDisclaimer] = useState('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!brandName || !brandData) return;

    // Get alternatives
    const alts = getBetterAlternatives(brandName, brandData);
    if (alts.length > 0) {
      setAlternatives(formatAlternativesForDisplay(alts));
      setDisclaimer(getAlternativesDisclaimer());
    }
  }, [brandName, brandData]);

  if (alternatives.length === 0) {
    return null;
  }

  return (
    <div className="better-alternatives-section">
      <button
        className="alternatives-header"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="alternatives-title-group">
          <h4 className="alternatives-title">
            ✨ Better Alternatives
          </h4>
          <span className="alternatives-count">
            {alternatives.length} option{alternatives.length !== 1 ? 's' : ''}
          </span>
        </div>
        <span className={`toggle-icon ${expanded ? 'expanded' : ''}`}>▼</span>
      </button>

      {expanded && (
        <div className="alternatives-content">
          <div className="alternatives-grid">
            {alternatives.map((alt, idx) => (
              <div key={alt.id || idx} className="alternative-card">
                <div className="alternative-header">
                  <h5 className="alternative-name">{alt.name}</h5>
                  <div
                    className="ownership-badge"
                    style={{ backgroundColor: alt.ownership.color }}
                  >
                    {alt.ownership.label}
                  </div>
                </div>

                <p className="alternative-description">
                  {alt.description}
                </p>

                <div className="alternative-footer">
                  <a
                    href={alt.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="visit-link"
                  >
                    Visit Website →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="alternatives-disclaimer">
            <p>ℹ️ {disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
}
