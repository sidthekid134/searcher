import React from 'react';
import '../styles/ComparisonView.css';

function ComparisonView({ sentimentTrend }) {
  const getTrendIndicator = (change) => {
    if (change > 0) return <span className="trend-up">↑ Improvement</span>;
    if (change < 0) return <span className="trend-down">↓ Degradation</span>;
    return <span className="trend-stable">→ Stable</span>;
  };

  const getDiffColor = (change) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  return (
    <div className="comparison-view">
      <h3>Sentiment Trend Comparison</h3>

      <div className="comparison-grid">
        <div className="comparison-card">
          <div className="comparison-label">Historical Baseline</div>
          <div className="comparison-value baseline-value">
            {sentimentTrend.historicalBaseline}
          </div>
          <div className="comparison-period">Start of tracking period</div>
        </div>

        <div className="comparison-indicator">
          <div className={`indicator-arrow ${getDiffColor(sentimentTrend.change)}`}>
            {sentimentTrend.trendDirection}
          </div>
          <div className={`change-value ${getDiffColor(sentimentTrend.change)}`}>
            {Math.abs(sentimentTrend.change)} points
          </div>
        </div>

        <div className="comparison-card">
          <div className="comparison-label">Current Sentiment</div>
          <div className="comparison-value current-value">
            {sentimentTrend.currentSentiment}
          </div>
          <div className="comparison-period">Latest measurement</div>
        </div>
      </div>

      <div className="trend-summary">
        {getTrendIndicator(sentimentTrend.change)}
      </div>
    </div>
  );
}

export default ComparisonView;
