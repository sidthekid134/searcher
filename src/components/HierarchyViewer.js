import React, { useState } from 'react';
import '../styles/HierarchyViewer.css';

const HierarchyViewer = ({ brand, onToggleDetail }) => {
  const [detailLevel, setDetailLevel] = useState('summary');

  const handleToggleDetail = () => {
    const newLevel = detailLevel === 'summary' ? 'full' : 'summary';
    setDetailLevel(newLevel);
    if (onToggleDetail) {
      onToggleDetail(newLevel);
    }
  };

  const getHierarchyToDisplay = () => {
    if (detailLevel === 'summary') {
      return brand.hierarchy.slice(0, 2);
    }
    return brand.hierarchy;
  };

  const hierarchy = getHierarchyToDisplay();

  return (
    <div className="hierarchy-viewer">
      <div className="hierarchy-header">
        <h3>{brand.name} - Ownership Structure</h3>
        <button
          className="detail-toggle-btn"
          onClick={handleToggleDetail}
        >
          {detailLevel === 'summary' ? 'Show Full Details' : 'Show Summary'}
        </button>
      </div>

      <div className="hierarchy-chain">
        {hierarchy.map((node, index) => (
          <div key={index} className="hierarchy-node">
            <div className={`node-box node-type-${node.type}`}>
              <div className="node-label">
                {node.type === 'brand' && '🏢'}
                {node.type === 'parent_company' && '🏭'}
                {node.type === 'pe_firm' && '💼'}
              </div>
              <div className="node-name">{node.name}</div>
              <div className="node-type">{node.type.replace('_', ' ')}</div>
            </div>
            {index < hierarchy.length - 1 && (
              <div className="hierarchy-connector">
                <div className="connector-line">↓</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {detailLevel === 'summary' && brand.hierarchy.length > 2 && (
        <div className="hierarchy-truncated">
          <p>+{brand.hierarchy.length - 2} more levels. Click "Show Full Details" to expand.</p>
        </div>
      )}

      <div className="hierarchy-metadata">
        <div className="metadata-row">
          <span className="label">Hierarchy Depth:</span>
          <span className="value">{brand.hierarchy.length} levels</span>
        </div>
      </div>
    </div>
  );
};

export default HierarchyViewer;
