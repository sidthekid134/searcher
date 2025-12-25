import React, { useState, useEffect } from 'react';
import {
  classifyOwnershipStatus,
  calculateTimeSinceAcquisition,
  getPEOwnershipTooltip,
  getStatusColor,
  getStatusLabel
} from '../services/ownershipClassificationService.js';
import HollowOutIndex from './HollowOutIndex.jsx';
import BetterAlternatives from './BetterAlternatives.jsx';
import '../styles/VerdictCard.css';

export default function VerdictCard({ ultimateParent, acquisitionYear, brandData }) {
  const [classification, setClassification] = useState(null);
  const [timeSinceAcquisition, setTimeSinceAcquisition] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (!ultimateParent) return;

    // Classify ownership
    const result = classifyOwnershipStatus(ultimateParent);
    setClassification(result);

    // Calculate time since acquisition for PE-owned brands
    if (result.isPEOwned && acquisitionYear) {
      const timeInfo = calculateTimeSinceAcquisition(acquisitionYear);
      setTimeSinceAcquisition(timeInfo);
    }

    // Set animation based on status
    if (result.status === 'red') {
      setAnimationClass('pe-flash');
    } else if (result.status === 'green') {
      setAnimationClass('independent-fade');
    }
  }, [ultimateParent, acquisitionYear]);

  if (!classification) {
    return null;
  }

  const statusColor = getStatusColor(classification.status);
  const statusLabel = getStatusLabel(classification.status);
  const confidencePercent = Math.round(classification.confidence * 100);

  return (
    <div
      className={`verdict-card verdict-${classification.status} ${animationClass}`}
      style={{ '--status-color': statusColor }}
    >
      <div className="verdict-header">
        <div className="status-indicator" style={{ backgroundColor: statusColor }} />
        <div className="verdict-title">
          <h3>{statusLabel}</h3>
          <p className="confidence-text">
            {confidencePercent}% confidence
          </p>
        </div>
      </div>

      <div className="verdict-body">
        <div className="parent-info">
          <label>Parent Company:</label>
          <p className="parent-name">{classification.parentName}</p>
        </div>

        {classification.isPEOwned && acquisitionYear && timeSinceAcquisition && (
          <div className="acquisition-info">
            <label>Acquisition Timeline:</label>
            <div className="timeline-display">
              <p className="acquisition-year">Acquired in {acquisitionYear}</p>
              <p className="time-since">
                <span className="time-value">{timeSinceAcquisition.display}</span>
                <span className="time-ago"> ago</span>
              </p>
              <div className="timeline-progress">
                <div className="progress-bar" />
              </div>
            </div>
          </div>
        )}

        <div className="reason-section">
          <label>Classification Reason:</label>
          <p className="reason-text">{classification.reason}</p>
        </div>
      </div>

      {classification.isPEOwned && (
        <div
          className="pe-warning-section"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="warning-icon">⚠️</div>
          <div className="warning-text">
            <p>PE/VC Owned - Quality Degradation Risk</p>
            <button className="info-button" aria-label="More information">?</button>
          </div>

          {showTooltip && (
            <div className="pe-tooltip">
              {getPEOwnershipTooltip().split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {classification.isPubliclyTraded && (
        <div className="public-company-section">
          <div className="badge">📈 Publicly Traded</div>
          <p className="company-info">
            This company is publicly traded and accountable to shareholders.
          </p>
        </div>
      )}

      {classification.isIndependent && (
        <div className="independent-company-section">
          <div className="badge">🌿 Independent</div>
          <p className="company-info">
            This company maintains independent ownership and control.
          </p>
        </div>
      )}

      {/* Hollow-Out Index for PE-owned brands */}
      <HollowOutIndex
        brand={brandData}
        isPEOwned={classification.isPEOwned}
      />

      {/* Better Alternatives for PE-owned brands */}
      {classification.isPEOwned && (
        <BetterAlternatives
          brandName={ultimateParent?.label || ''}
          brandData={brandData}
        />
      )}
    </div>
  );
}
