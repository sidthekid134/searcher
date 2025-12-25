import React, { useState, useEffect } from 'react';
import {
  calculateHollowOutIndex,
  getRiskAssessment,
  getConfidenceIndicator,
  getHollowOutIndexTooltip,
  getSentimentTrendData
} from '../services/hollowOutIndexService.js';
import '../styles/HollowOutIndex.css';

export default function HollowOutIndex({ brand, isPEOwned }) {
  const [indexData, setIndexData] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!brand || !isPEOwned) {
      setIndexData(null);
      return;
    }

    const data = calculateHollowOutIndex(brand);
    setIndexData(data);
  }, [brand, isPEOwned]);

  if (!isPEOwned) {
    return null;
  }

  if (!indexData) {
    return null;
  }

  const handleInfoClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left,
      y: rect.bottom + 10
    });
    setShowTooltip(!showTooltip);
  };

  // Insufficient data case
  if (indexData.status === 'insufficient_data') {
    return (
      <div className="hollow-out-container">
        <div className="hollow-out-header">
          <h3 className="hollow-out-title">Hollow-Out Index</h3>
          <button
            className="hollow-out-info-button"
            onClick={handleInfoClick}
            aria-label="More information"
            title="What is the Hollow-Out Index?"
          >
            ?
          </button>
        </div>

        <div className="insufficient-data-message">
          <strong>⚠️ Insufficient Data</strong>
          <p style={{ marginTop: '8px', marginBottom: '0' }}>
            {indexData.message}
          </p>
          <div className="insufficient-data-action">
            <button className="submit-corrections-button">
              Submit Corrections
            </button>
          </div>
        </div>

        {showTooltip && (
          <div
            className="tooltip-popup"
            style={{
              position: 'fixed',
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`
            }}
          >
            {getHollowOutIndexTooltip().split('\n').map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  const riskAssessment = getRiskAssessment(indexData.index);
  const confidencePercent = indexData.confidence;
  const confidenceText = getConfidenceIndicator(indexData.reviewCount);
  const trendData = getSentimentTrendData(brand);

  return (
    <div className="hollow-out-container">
      <div className="hollow-out-header">
        <h3 className="hollow-out-title">Hollow-Out Index</h3>
        <button
          className="hollow-out-info-button"
          onClick={handleInfoClick}
          aria-label="More information"
          title="What is the Hollow-Out Index?"
        >
          ?
        </button>
      </div>

      <div className="index-metrics">
        {/* Gauge Visualization */}
        <div className="index-gauge-section">
          <div className="gauge-circle">
            <div className="gauge-background" />
            <div className="gauge-inner">
              <div>
                <div className="gauge-value">{indexData.index}</div>
                <div className="gauge-unit">/ 100</div>
              </div>
            </div>
          </div>
          <div className="risk-assessment">
            <div
              className={`risk-level ${riskAssessment.level}`}
              style={{ borderColor: riskAssessment.color }}
            >
              {riskAssessment.label}
            </div>
            <p className="risk-description">
              {riskAssessment.description}
            </p>
          </div>
        </div>

        {/* Ratings Comparison */}
        <div className="ratings-comparison">
          <div className="rating-item">
            <div className="rating-label">Before Acquisition</div>
            <div className="rating-value">{indexData.beforeRating}</div>
            <div className="rating-stars">★★★★☆</div>
            <div className="rating-change">
              {indexData.reviewCount ? `${Math.floor(indexData.reviewCount / 2)} reviews` : 'N/A'}
            </div>
          </div>
          <div className="rating-item">
            <div className="rating-label">After Acquisition</div>
            <div className="rating-value">{indexData.afterRating}</div>
            <div className="rating-stars">★★★☆☆</div>
            <div className="rating-change">
              {indexData.ratingDrop && (
                <>
                  ↓ {indexData.ratingDrop} point{indexData.ratingDrop !== 1 ? 's' : ''}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Indicator */}
      <div className="confidence-section">
        <span className="confidence-icon">📊</span>
        <span>{confidenceText}</span>
        <div className="confidence-bar">
          <div
            className="confidence-fill"
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
        <span style={{ fontSize: '12px', color: '#999' }}>
          {confidencePercent}%
        </span>
      </div>

      {/* Sentiment Trend Chart */}
      {trendData && trendData.length > 0 && (
        <div className="trend-section">
          <div className="trend-title">Rating Trajectory</div>
          <div className="trend-chart">
            {trendData.map((point, idx) => (
              <div key={idx} className="trend-bar-container">
                {point.phase === 'acquisition-marker' ? (
                  <>
                    <div className="trend-bar acquisition-marker" />
                    <div className="acquisition-marker-label">
                      Acquisition Year
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={`trend-bar ${point.phase}`}
                      style={{
                        height: `${(point.rating / 5) * 100}%`
                      }}
                    >
                      <span className="trend-bar-value">
                        {point.rating}
                      </span>
                    </div>
                    <div className="trend-bar-year">{point.year}</div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="trend-legend">
            <div className="legend-item">
              <div className="legend-color pre" />
              <span>Pre-acquisition</span>
            </div>
            <div className="legend-item">
              <div className="legend-color post" />
              <span>Post-acquisition</span>
            </div>
            <div className="legend-item">
              <div className="legend-color acquisition" />
              <span>Acquisition event</span>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="tooltip-popup"
          style={{
            position: 'fixed',
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`
          }}
        >
          {getHollowOutIndexTooltip().split('\n').map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}
