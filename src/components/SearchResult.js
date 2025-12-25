import React, { useState } from 'react';
import HierarchyViewer from './HierarchyViewer';
import '../styles/SearchResult.css';

const SearchResult = ({ brand }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPEFirmName = () => {
    const peFirm = brand.hierarchy.find(node => node.type === 'pe_firm');
    return peFirm ? peFirm.name : null;
  };

  return (
    <div className="search-result">
      <div className="result-header" onClick={() => setExpanded(!expanded)}>
        <div className="result-title-section">
          <h2 className="result-title">{brand.name}</h2>
          <span className="hierarchy-depth-indicator" title="Hierarchy Levels">
            L{brand.hierarchy.length}
          </span>
        </div>

        <div className="result-flags">
          {brand.isDisputed && (
            <span className="flag flag-disputed" title={`Last updated: ${formatDate(brand.lastUpdated)}`}>
              ⚠️ Ownership Disputed
            </span>
          )}
          {brand.isIncomplete && (
            <span className="flag flag-incomplete">
              ❌ Incomplete Data
            </span>
          )}
        </div>

        <button className="expand-btn">
          {expanded ? '▼' : '▶'}
        </button>
      </div>

      <div className="result-metadata">
        <div className="metadata-item">
          <span className="label">Primary Owner:</span>
          <span className="value">{brand.primaryOwner}</span>
        </div>
        {getPEFirmName() && (
          <div className="metadata-item">
            <span className="label">PE Firm:</span>
            <span className="value">{getPEFirmName()}</span>
          </div>
        )}
        <div className="metadata-item">
          <span className="label">Last Updated:</span>
          <span className="value">{formatDate(brand.lastUpdated)}</span>
        </div>
      </div>

      {expanded && (
        <div className="result-details">
          <HierarchyViewer brand={brand} />
        </div>
      )}
    </div>
  );
};

export default SearchResult;
