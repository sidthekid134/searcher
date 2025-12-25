import React from 'react';
import '../styles/QualityMetrics.css';

function QualityMetrics({ metrics }) {
  const getMetricClass = (value, type = 'sentiment') => {
    if (type === 'sentiment') {
      if (value >= 70) return 'metric-good';
      if (value >= 50) return 'metric-fair';
      return 'metric-poor';
    }
    if (type === 'negative') {
      if (value <= 20) return 'metric-good';
      if (value <= 35) return 'metric-fair';
      return 'metric-poor';
    }
    return '';
  };

  return (
    <div className="quality-metrics">
      <div className="metrics-grid">
        <div className={`metric-card ${getMetricClass(metrics.averageSentiment, 'sentiment')}`}>
          <div className="metric-label">Average Sentiment Score</div>
          <div className="metric-value">{metrics.averageSentiment}</div>
          <div className="metric-unit">out of 100</div>
        </div>

        <div className="metric-card metric-neutral">
          <div className="metric-label">Total Review Volume</div>
          <div className="metric-value">{metrics.totalVolume.toLocaleString()}</div>
          <div className="metric-unit">reviews analyzed</div>
        </div>

        <div className={`metric-card ${getMetricClass(metrics.negativePercentage, 'negative')}`}>
          <div className="metric-label">Negative Review Percentage</div>
          <div className="metric-value">{metrics.negativePercentage}%</div>
          <div className="metric-unit">negative sentiment</div>
        </div>
      </div>
    </div>
  );
}

export default QualityMetrics;
