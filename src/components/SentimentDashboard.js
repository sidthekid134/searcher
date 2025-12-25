import React, { useState, useEffect } from 'react';
import TrendFilter from './TrendFilter';
import TrendChart from './TrendChart';
import QualityMetrics from './QualityMetrics';
import ComparisonView from './ComparisonView';
import {
  filterByTimeRange,
  prepareChartData,
  calculateMetrics,
  getCurrentSentimentTrend,
  formatLastUpdated
} from '../utils/sentimentAnalysis';
import { sentimentDataByBrand } from '../data/sentimentData';
import '../styles/SentimentDashboard.css';

function SentimentDashboard({ brandId = 1, isAdmin = false }) {
  const [selectedRange, setSelectedRange] = useState('12months');
  const [customStart, setCustomStart] = useState(null);
  const [customEnd, setCustomEnd] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [metrics, setMetrics] = useState({
    averageSentiment: 0,
    totalVolume: 0,
    negativePercentage: 0
  });
  const [sentimentTrend, setSentimentTrend] = useState({
    currentSentiment: 0,
    historicalBaseline: 0,
    trendDirection: '→',
    change: 0
  });
  const [chartData, setChartData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');

  const brandData = sentimentDataByBrand[brandId];

  // Initialize and update on brand change
  useEffect(() => {
    if (!brandData) return;

    const filtered = filterByTimeRange(
      brandData.monthlyData,
      selectedRange,
      customStart,
      customEnd
    );

    setFilteredData(filtered);

    // Calculate metrics
    const calculatedMetrics = calculateMetrics(filtered);
    setMetrics(calculatedMetrics);

    // Calculate trend
    const trend = getCurrentSentimentTrend(brandData);
    setSentimentTrend(trend);

    // Prepare chart data
    const chartDataPrepared = prepareChartData(filtered, brandData.sources);
    setChartData(chartDataPrepared);

    // Format last updated
    setLastUpdated(formatLastUpdated(brandData.lastUpdated));
  }, [brandData, selectedRange, customStart, customEnd]);

  const handleFilterChange = (rangeType, start, end) => {
    setSelectedRange(rangeType);
    setCustomStart(start);
    setCustomEnd(end);
  };

  const handleManualRefresh = () => {
    // Simulate data refresh
    setLastUpdated(formatLastUpdated(new Date().toISOString()));
    // In a real app, this would trigger an API call to refresh sentiment data
    alert('Data refreshed successfully!');
  };

  if (!brandData) {
    return (
      <div className="sentiment-dashboard">
        <div className="error-message">
          Brand data not found. Please select a valid brand.
        </div>
      </div>
    );
  }

  return (
    <div className="sentiment-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Quality Degradation Trends - {brandData.brandName}</h1>
          <p className="subtitle">Sentiment analysis from social media and review platforms</p>
        </div>

        <div className="header-actions">
          <div className="update-status">
            <span className="update-label">Last Updated: </span>
            <span className="update-time">{lastUpdated}</span>
          </div>
          {isAdmin && (
            <button className="refresh-btn" onClick={handleManualRefresh}>
              🔄 Refresh Data
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        {/* Trend Filter Section */}
        <aside className="filter-sidebar">
          <TrendFilter
            onFilterChange={handleFilterChange}
            defaultRange={selectedRange}
          />
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {/* Comparison View */}
          <section className="comparison-section">
            <ComparisonView sentimentTrend={sentimentTrend} />
          </section>

          {/* Quality Metrics */}
          <section className="metrics-section">
            <h2>Quality Metrics</h2>
            <QualityMetrics metrics={metrics} />
          </section>

          {/* Sentiment Trend Chart */}
          <section className="chart-section">
            <h2>Sentiment Trend Analysis</h2>
            <TrendChart chartData={chartData} />
            <div className="chart-legend">
              <div className="legend-item">
                {brandData.sources.map(source => (
                  <div key={source.id} className="legend-entry">
                    <span
                      className="legend-color"
                      style={{ backgroundColor: source.color }}
                    ></span>
                    <span className="legend-label">{source.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Data Sources Attribution */}
          <section className="sources-section">
            <h3>Data Sources</h3>
            <div className="sources-list">
              {brandData.sources.map(source => (
                <div key={source.id} className="source-item">
                  <span className="source-name">{source.name}</span>
                  <span className="source-color" style={{ backgroundColor: source.color }}></span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default SentimentDashboard;
