// Sentiment analysis utilities for processing and filtering data

/**
 * Filter sentiment data by time range
 * @param {Array} monthlyData - Full 12-month data array
 * @param {string} rangeType - '3months', '6months', '12months', or 'custom'
 * @param {Date} customStart - Custom start date (required if rangeType is 'custom')
 * @param {Date} customEnd - Custom end date (required if rangeType is 'custom')
 * @returns {Array} Filtered monthly data
 */
export const filterByTimeRange = (monthlyData, rangeType = '12months', customStart = null, customEnd = null) => {
  if (!monthlyData || monthlyData.length === 0) return [];

  let startIndex = 0;

  switch (rangeType) {
    case '3months':
      startIndex = Math.max(0, monthlyData.length - 3);
      break;
    case '6months':
      startIndex = Math.max(0, monthlyData.length - 6);
      break;
    case '12months':
      startIndex = 0;
      break;
    case 'custom':
      if (customStart && customEnd) {
        return monthlyData.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= customStart && itemDate <= customEnd;
        });
      }
      return monthlyData;
    default:
      return monthlyData;
  }

  return monthlyData.slice(startIndex);
};

/**
 * Prepare data for Chart.js line chart
 * @param {Array} filteredData - Filtered monthly data
 * @param {Array} sources - Source definitions with colors
 * @returns {Object} Chart.js formatted data
 */
export const prepareChartData = (filteredData, sources) => {
  const labels = filteredData.map(item => item.month);

  const datasets = sources.map(source => {
    const sentimentValues = filteredData.map(item => {
      const sourceData = item[source.id];
      return sourceData?.sentiment || 0;
    });

    return {
      label: source.name,
      data: sentimentValues,
      borderColor: source.color,
      backgroundColor: source.color + '15', // Semi-transparent
      tension: 0.4,
      fill: false,
      pointRadius: 4,
      pointBackgroundColor: source.color,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverRadius: 6
    };
  });

  return {
    labels,
    datasets
  };
};

/**
 * Calculate metrics for a filtered data set
 * @param {Array} filteredData - Filtered monthly data
 * @returns {Object} Aggregated metrics
 */
export const calculateMetrics = (filteredData) => {
  if (!filteredData || filteredData.length === 0) {
    return {
      averageSentiment: 0,
      totalVolume: 0,
      negativePercentage: 0
    };
  }

  let totalSentiment = 0;
  let totalVolume = 0;
  let totalNegativePercent = 0;
  let dataPoints = 0;

  filteredData.forEach(month => {
    const twitter = month.twitter || {};
    const reviews = month.reviews || {};

    totalSentiment += (twitter.sentiment || 0) + (reviews.sentiment || 0);
    totalVolume += (twitter.volume || 0) + (reviews.volume || 0);
    totalNegativePercent += (twitter.negativePercent || 0) + (reviews.negativePercent || 0);
    dataPoints += 2;
  });

  return {
    averageSentiment: dataPoints > 0 ? Math.round(totalSentiment / dataPoints) : 0,
    totalVolume: totalVolume,
    negativePercentage: dataPoints > 0 ? Math.round(totalNegativePercent / dataPoints) : 0
  };
};

/**
 * Get current sentiment and trend for comparison view
 * @param {Object} brandData - Brand sentiment data
 * @returns {Object} Current sentiment with trend
 */
export const getCurrentSentimentTrend = (brandData) => {
  if (!brandData || !brandData.monthlyData || brandData.monthlyData.length === 0) {
    return {
      currentSentiment: 0,
      historicalBaseline: 0,
      trendDirection: '→',
      change: 0
    };
  }

  const latestMonth = brandData.monthlyData[brandData.monthlyData.length - 1];
  const firstMonth = brandData.monthlyData[0];

  const latestSentiment = (latestMonth.twitter?.sentiment || 0 + latestMonth.reviews?.sentiment || 0) / 2;
  const baselineSentiment = (firstMonth.twitter?.sentiment || 0 + firstMonth.reviews?.sentiment || 0) / 2;

  let trendDirection = '→';
  if (latestSentiment > baselineSentiment) trendDirection = '↑';
  else if (latestSentiment < baselineSentiment) trendDirection = '↓';

  return {
    currentSentiment: Math.round(latestSentiment),
    historicalBaseline: Math.round(baselineSentiment),
    trendDirection: trendDirection,
    change: Math.round(latestSentiment - baselineSentiment)
  };
};

/**
 * Format last updated timestamp
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted date string
 */
export const formatLastUpdated = (timestamp) => {
  if (!timestamp) return 'Never';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
