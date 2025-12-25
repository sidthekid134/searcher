import React, { useState } from 'react';
import '../styles/TrendFilter.css';

function TrendFilter({ onFilterChange, defaultRange = '12months' }) {
  const [rangeType, setRangeType] = useState(defaultRange);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleRangeChange = (newRange) => {
    setRangeType(newRange);
    setShowCustom(newRange === 'custom');

    if (newRange !== 'custom') {
      onFilterChange(newRange, null, null);
    }
  };

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      const startDate = new Date(customStart);
      const endDate = new Date(customEnd);

      if (startDate <= endDate) {
        onFilterChange('custom', startDate, endDate);
      } else {
        alert('Start date must be before end date');
      }
    } else {
      alert('Please select both start and end dates');
    }
  };

  return (
    <div className="trend-filter">
      <div className="filter-header">
        <h3>Time Range</h3>
      </div>

      <div className="filter-buttons">
        <button
          className={`filter-btn ${rangeType === '3months' ? 'active' : ''}`}
          onClick={() => handleRangeChange('3months')}
        >
          3 Months
        </button>
        <button
          className={`filter-btn ${rangeType === '6months' ? 'active' : ''}`}
          onClick={() => handleRangeChange('6months')}
        >
          6 Months
        </button>
        <button
          className={`filter-btn ${rangeType === '12months' ? 'active' : ''}`}
          onClick={() => handleRangeChange('12months')}
        >
          12 Months
        </button>
        <button
          className={`filter-btn ${rangeType === 'custom' ? 'active' : ''}`}
          onClick={() => handleRangeChange('custom')}
        >
          Custom
        </button>
      </div>

      {showCustom && (
        <div className="custom-range">
          <div className="date-input-group">
            <label htmlFor="start-date">Start Date:</label>
            <input
              id="start-date"
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
          </div>
          <div className="date-input-group">
            <label htmlFor="end-date">End Date:</label>
            <input
              id="end-date"
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
          <button className="apply-btn" onClick={handleApplyCustom}>
            Apply Custom Range
          </button>
        </div>
      )}
    </div>
  );
}

export default TrendFilter;
