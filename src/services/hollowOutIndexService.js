/**
 * Hollow-Out Index Service
 * Calculates sentiment degradation metrics for PE-owned brands
 */

import brandDatabase from '../data/brandDatabase.json' assert { type: 'json' };

/**
 * Calculate Hollow-Out Index for a brand
 * Returns { index, confidence, beforeRating, afterRating, reviewCount, status, message }
 * Index is 0-100 scale where higher values indicate more quality degradation
 */
export function calculateHollowOutIndex(brand) {
  if (!brand) {
    return {
      index: null,
      confidence: 0,
      status: 'insufficient_data',
      message: 'Brand not found',
      beforeRating: null,
      afterRating: null,
      reviewCount: 0
    };
  }

  // Only calculate for brands with sentiment data
  if (!brand.sentimentData || !brand.sentimentData.beforeAcquisition || !brand.sentimentData.afterAcquisition) {
    return {
      index: null,
      confidence: 0,
      status: 'insufficient_data',
      message: 'Insufficient sentiment data available',
      beforeRating: null,
      afterRating: null,
      reviewCount: 0
    };
  }

  const before = brand.sentimentData.beforeAcquisition;
  const after = brand.sentimentData.afterAcquisition;

  // Check minimum data quality threshold (50+ reviews in both periods)
  const minReviews = 50;
  if (before.reviewCount < minReviews || after.reviewCount < minReviews) {
    return {
      index: null,
      confidence: 0,
      status: 'insufficient_data',
      message: `Insufficient reviews (${Math.max(before.reviewCount, after.reviewCount)} found, ${minReviews} required)`,
      beforeRating: before.avgRating,
      afterRating: after.avgRating,
      reviewCount: Math.min(before.reviewCount, after.reviewCount)
    };
  }

  // Calculate rating degradation
  const ratingDiff = before.avgRating - after.avgRating;
  const maxDegradation = 4; // Max possible degradation from 5 to 1 rating

  // Index calculation: (rating drop / max possible drop) * 100
  // Normalized to 0-100 scale
  let index = (ratingDiff / maxDegradation) * 100;
  index = Math.max(0, Math.min(100, index)); // Clamp to 0-100

  // Calculate confidence based on review count and consistency
  // More reviews = higher confidence, up to 95%
  const avgReviews = (before.reviewCount + after.reviewCount) / 2;
  const baseConfidence = Math.min(0.95, avgReviews / 3000);

  // Additional confidence penalty if rating difference is very small (might be noise)
  let confidenceAdjustment = 1.0;
  if (ratingDiff < 0.3) {
    confidenceAdjustment = 0.6; // Low confidence if minimal difference
  } else if (ratingDiff < 0.6) {
    confidenceAdjustment = 0.8;
  }

  const confidence = Math.round(baseConfidence * confidenceAdjustment * 100) / 100;

  return {
    index: Math.round(index),
    confidence: Math.round(confidence * 100),
    status: 'calculated',
    message: null,
    beforeRating: Math.round(before.avgRating * 10) / 10,
    afterRating: Math.round(after.avgRating * 10) / 10,
    reviewCount: before.reviewCount + after.reviewCount,
    ratingDrop: Math.round(ratingDiff * 10) / 10
  };
}

/**
 * Get risk assessment based on index
 */
export function getRiskAssessment(index) {
  if (index === null) return null;

  if (index >= 60) {
    return {
      level: 'high',
      label: 'HIGH RISK',
      description: 'Significant quality degradation detected',
      color: '#f44336'
    };
  } else if (index >= 40) {
    return {
      level: 'medium',
      label: 'MEDIUM RISK',
      description: 'Moderate quality concerns',
      color: '#ff9800'
    };
  } else if (index >= 20) {
    return {
      level: 'low',
      label: 'LOW RISK',
      description: 'Minor quality changes',
      color: '#ffc107'
    };
  } else {
    return {
      level: 'minimal',
      label: 'MINIMAL CHANGE',
      description: 'Quality remains stable',
      color: '#4caf50'
    };
  }
}

/**
 * Get confidence indicator text
 */
export function getConfidenceIndicator(reviewCount) {
  if (reviewCount === 0) return 'No data available';
  if (reviewCount < 100) return `Based on ${reviewCount} reviews`;
  if (reviewCount < 500) return `Based on ${reviewCount} reviews`;
  if (reviewCount < 1000) return `Based on ${reviewCount}+ reviews`;
  return `Based on ${Math.floor(reviewCount / 100) * 100}+ reviews`;
}

/**
 * Get tooltip explanation for Hollow-Out Index
 */
export function getHollowOutIndexTooltip() {
  return `
Hollow-Out Index measures quality degradation after PE/VC acquisition:
• Compares average product ratings BEFORE and AFTER acquisition
• Scale: 0-100 (higher = more degradation)
• Score ≥60: Significant quality risk detected
• Based on customer reviews and sentiment analysis

Common patterns in PE-owned brands:
• Focus shifts to profitability over product quality
• Customer service may be reduced
• Pricing structures often change
• Product features may be modified or removed
  `.trim();
}

/**
 * Get historical sentiment data for trend chart
 * Returns array of yearly data points for charting
 */
export function getSentimentTrendData(brand) {
  if (!brand || !brand.sentimentData) {
    return null;
  }

  const before = brand.sentimentData.beforeAcquisition;
  const after = brand.sentimentData.afterAcquisition;

  if (!before || !after) {
    return null;
  }

  const data = [];

  // Add before-acquisition years
  const beforeYears = after.periodStart - before.periodStart;
  for (let i = 0; i < beforeYears; i++) {
    const year = before.periodStart + i;
    // Simulate slight variation in historical data
    const variation = (Math.random() - 0.5) * 0.3;
    data.push({
      year,
      rating: Math.round((before.avgRating + variation) * 10) / 10,
      phase: 'pre-acquisition'
    });
  }

  // Add acquisition year marker
  const acquisitionYear = brand.acquisitionYear;
  data.push({
    year: acquisitionYear,
    rating: null,
    phase: 'acquisition-marker'
  });

  // Add after-acquisition years
  const afterYears = after.periodEnd - acquisitionYear;
  for (let i = 1; i <= afterYears; i++) {
    const year = acquisitionYear + i;
    // Simulate variation in post-acquisition data
    const variation = (Math.random() - 0.5) * 0.2;
    data.push({
      year,
      rating: Math.round((after.avgRating + variation) * 10) / 10,
      phase: 'post-acquisition'
    });
  }

  return data;
}

/**
 * Format hollow-out index data for display
 */
export function formatHollowOutData(brand) {
  const indexData = calculateHollowOutIndex(brand);
  const riskAssessment = getRiskAssessment(indexData.index);
  const trendData = getSentimentTrendData(brand);
  const confidenceText = getConfidenceIndicator(indexData.reviewCount);

  return {
    ...indexData,
    riskAssessment,
    trendData,
    confidenceText,
    tooltip: getHollowOutIndexTooltip()
  };
}
