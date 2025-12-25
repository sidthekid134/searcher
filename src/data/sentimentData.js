// Sentiment analysis data from multiple sources
export const sentimentDataByBrand = {
  1: { // Pepsi
    brandName: "Pepsi",
    historicalBaseline: 72,
    currentSentiment: 68,
    lastUpdated: "2025-12-25T10:30:00Z",
    sources: [
      {
        id: "twitter",
        name: "Twitter/Social Media",
        color: "#1DA1F2"
      },
      {
        id: "reviews",
        name: "Review Platforms",
        color: "#FFB81C"
      }
    ],
    monthlyData: [
      {
        month: "Jan 2025",
        date: new Date(2025, 0, 1),
        twitter: { sentiment: 75, volume: 2400, negativePercent: 15 },
        reviews: { sentiment: 70, volume: 1200, negativePercent: 22 }
      },
      {
        month: "Feb 2025",
        date: new Date(2025, 1, 1),
        twitter: { sentiment: 74, volume: 2210, negativePercent: 16 },
        reviews: { sentiment: 71, volume: 1290, negativePercent: 21 }
      },
      {
        month: "Mar 2025",
        date: new Date(2025, 2, 1),
        twitter: { sentiment: 73, volume: 2290, negativePercent: 17 },
        reviews: { sentiment: 69, volume: 1000, negativePercent: 24 }
      },
      {
        month: "Apr 2025",
        date: new Date(2025, 3, 1),
        twitter: { sentiment: 72, volume: 2000, negativePercent: 18 },
        reviews: { sentiment: 68, volume: 1181, negativePercent: 26 }
      },
      {
        month: "May 2025",
        date: new Date(2025, 4, 1),
        twitter: { sentiment: 71, volume: 2500, negativePercent: 19 },
        reviews: { sentiment: 67, volume: 1500, negativePercent: 28 }
      },
      {
        month: "Jun 2025",
        date: new Date(2025, 5, 1),
        twitter: { sentiment: 70, volume: 2100, negativePercent: 20 },
        reviews: { sentiment: 66, volume: 1100, negativePercent: 30 }
      },
      {
        month: "Jul 2025",
        date: new Date(2025, 6, 1),
        twitter: { sentiment: 69, volume: 2900, negativePercent: 21 },
        reviews: { sentiment: 65, volume: 1350, negativePercent: 32 }
      },
      {
        month: "Aug 2025",
        date: new Date(2025, 7, 1),
        twitter: { sentiment: 69, volume: 2500, negativePercent: 21 },
        reviews: { sentiment: 65, volume: 1200, negativePercent: 33 }
      },
      {
        month: "Sep 2025",
        date: new Date(2025, 8, 1),
        twitter: { sentiment: 68, volume: 2400, negativePercent: 22 },
        reviews: { sentiment: 64, volume: 1400, negativePercent: 35 }
      },
      {
        month: "Oct 2025",
        date: new Date(2025, 9, 1),
        twitter: { sentiment: 68, volume: 2300, negativePercent: 22 },
        reviews: { sentiment: 64, volume: 1100, negativePercent: 36 }
      },
      {
        month: "Nov 2025",
        date: new Date(2025, 10, 1),
        twitter: { sentiment: 68, volume: 2900, negativePercent: 22 },
        reviews: { sentiment: 64, volume: 1250, negativePercent: 36 }
      },
      {
        month: "Dec 2025",
        date: new Date(2025, 11, 1),
        twitter: { sentiment: 68, volume: 2300, negativePercent: 22 },
        reviews: { sentiment: 67, volume: 1200, negativePercent: 35 }
      }
    ]
  },
  2: { // Tropicana
    brandName: "Tropicana",
    historicalBaseline: 78,
    currentSentiment: 75,
    lastUpdated: "2025-12-25T10:30:00Z",
    sources: [
      {
        id: "twitter",
        name: "Twitter/Social Media",
        color: "#1DA1F2"
      },
      {
        id: "reviews",
        name: "Review Platforms",
        color: "#FFB81C"
      }
    ],
    monthlyData: [
      {
        month: "Jan 2025",
        date: new Date(2025, 0, 1),
        twitter: { sentiment: 80, volume: 1800, negativePercent: 10 },
        reviews: { sentiment: 76, volume: 900, negativePercent: 15 }
      },
      {
        month: "Feb 2025",
        date: new Date(2025, 1, 1),
        twitter: { sentiment: 79, volume: 1650, negativePercent: 11 },
        reviews: { sentiment: 76, volume: 950, negativePercent: 16 }
      },
      {
        month: "Mar 2025",
        date: new Date(2025, 2, 1),
        twitter: { sentiment: 78, volume: 1720, negativePercent: 12 },
        reviews: { sentiment: 75, volume: 800, negativePercent: 17 }
      },
      {
        month: "Apr 2025",
        date: new Date(2025, 3, 1),
        twitter: { sentiment: 77, volume: 1500, negativePercent: 13 },
        reviews: { sentiment: 75, volume: 900, negativePercent: 18 }
      },
      {
        month: "May 2025",
        date: new Date(2025, 4, 1),
        twitter: { sentiment: 76, volume: 1900, negativePercent: 14 },
        reviews: { sentiment: 74, volume: 1100, negativePercent: 19 }
      },
      {
        month: "Jun 2025",
        date: new Date(2025, 5, 1),
        twitter: { sentiment: 76, volume: 1700, negativePercent: 14 },
        reviews: { sentiment: 74, volume: 850, negativePercent: 20 }
      },
      {
        month: "Jul 2025",
        date: new Date(2025, 6, 1),
        twitter: { sentiment: 75, volume: 2100, negativePercent: 15 },
        reviews: { sentiment: 73, volume: 1000, negativePercent: 21 }
      },
      {
        month: "Aug 2025",
        date: new Date(2025, 7, 1),
        twitter: { sentiment: 75, volume: 1900, negativePercent: 15 },
        reviews: { sentiment: 73, volume: 950, negativePercent: 21 }
      },
      {
        month: "Sep 2025",
        date: new Date(2025, 8, 1),
        twitter: { sentiment: 75, volume: 1800, negativePercent: 15 },
        reviews: { sentiment: 72, volume: 1050, negativePercent: 23 }
      },
      {
        month: "Oct 2025",
        date: new Date(2025, 9, 1),
        twitter: { sentiment: 75, volume: 1700, negativePercent: 15 },
        reviews: { sentiment: 72, volume: 850, negativePercent: 24 }
      },
      {
        month: "Nov 2025",
        date: new Date(2025, 10, 1),
        twitter: { sentiment: 75, volume: 2000, negativePercent: 15 },
        reviews: { sentiment: 72, volume: 950, negativePercent: 24 }
      },
      {
        month: "Dec 2025",
        date: new Date(2025, 11, 1),
        twitter: { sentiment: 75, volume: 1800, negativePercent: 15 },
        reviews: { sentiment: 75, volume: 900, negativePercent: 22 }
      }
    ]
  },
  3: { // Skittles
    brandName: "Skittles",
    historicalBaseline: 82,
    currentSentiment: 79,
    lastUpdated: "2025-12-25T10:30:00Z",
    sources: [
      {
        id: "twitter",
        name: "Twitter/Social Media",
        color: "#1DA1F2"
      },
      {
        id: "reviews",
        name: "Review Platforms",
        color: "#FFB81C"
      }
    ],
    monthlyData: [
      {
        month: "Jan 2025",
        date: new Date(2025, 0, 1),
        twitter: { sentiment: 85, volume: 3000, negativePercent: 8 },
        reviews: { sentiment: 79, volume: 1500, negativePercent: 12 }
      },
      {
        month: "Feb 2025",
        date: new Date(2025, 1, 1),
        twitter: { sentiment: 84, volume: 2800, negativePercent: 9 },
        reviews: { sentiment: 79, volume: 1600, negativePercent: 13 }
      },
      {
        month: "Mar 2025",
        date: new Date(2025, 2, 1),
        twitter: { sentiment: 83, volume: 2900, negativePercent: 10 },
        reviews: { sentiment: 78, volume: 1400, negativePercent: 14 }
      },
      {
        month: "Apr 2025",
        date: new Date(2025, 3, 1),
        twitter: { sentiment: 82, volume: 2700, negativePercent: 11 },
        reviews: { sentiment: 78, volume: 1500, negativePercent: 15 }
      },
      {
        month: "May 2025",
        date: new Date(2025, 4, 1),
        twitter: { sentiment: 81, volume: 3200, negativePercent: 12 },
        reviews: { sentiment: 77, volume: 1700, negativePercent: 16 }
      },
      {
        month: "Jun 2025",
        date: new Date(2025, 5, 1),
        twitter: { sentiment: 81, volume: 2900, negativePercent: 12 },
        reviews: { sentiment: 77, volume: 1400, negativePercent: 16 }
      },
      {
        month: "Jul 2025",
        date: new Date(2025, 6, 1),
        twitter: { sentiment: 80, volume: 3300, negativePercent: 13 },
        reviews: { sentiment: 76, volume: 1600, negativePercent: 18 }
      },
      {
        month: "Aug 2025",
        date: new Date(2025, 7, 1),
        twitter: { sentiment: 80, volume: 3100, negativePercent: 13 },
        reviews: { sentiment: 76, volume: 1500, negativePercent: 18 }
      },
      {
        month: "Sep 2025",
        date: new Date(2025, 8, 1),
        twitter: { sentiment: 79, volume: 3000, negativePercent: 14 },
        reviews: { sentiment: 75, volume: 1700, negativePercent: 20 }
      },
      {
        month: "Oct 2025",
        date: new Date(2025, 9, 1),
        twitter: { sentiment: 79, volume: 2800, negativePercent: 14 },
        reviews: { sentiment: 75, volume: 1400, negativePercent: 21 }
      },
      {
        month: "Nov 2025",
        date: new Date(2025, 10, 1),
        twitter: { sentiment: 79, volume: 3200, negativePercent: 14 },
        reviews: { sentiment: 75, volume: 1600, negativePercent: 21 }
      },
      {
        month: "Dec 2025",
        date: new Date(2025, 11, 1),
        twitter: { sentiment: 79, volume: 3000, negativePercent: 14 },
        reviews: { sentiment: 79, volume: 1500, negativePercent: 19 }
      }
    ]
  }
};

// Calculate aggregated metrics for a brand over a specific period
export const calculateAggregatedMetrics = (brandData, monthlyData) => {
  const aggregated = {
    averageSentiment: 0,
    totalReviews: 0,
    negativePercentage: 0
  };

  if (!monthlyData || monthlyData.length === 0) return aggregated;

  let totalSentiment = 0;
  let totalNegativePercent = 0;
  let count = 0;

  monthlyData.forEach(month => {
    const twitterSentiment = month.twitter?.sentiment || 0;
    const reviewsSentiment = month.reviews?.sentiment || 0;
    const twitterVolume = month.twitter?.volume || 0;
    const reviewsVolume = month.reviews?.volume || 0;

    totalSentiment += (twitterSentiment + reviewsSentiment) / 2;
    aggregated.totalReviews += twitterVolume + reviewsVolume;
    totalNegativePercent += (month.twitter?.negativePercent || 0) + (month.reviews?.negativePercent || 0);
    count++;
  });

  aggregated.averageSentiment = Math.round(totalSentiment / count);
  aggregated.negativePercentage = Math.round(totalNegativePercent / (count * 2));

  return aggregated;
};

// Get trend direction based on historical and current sentiment
export const getTrendDirection = (historicalBaseline, currentSentiment) => {
  if (currentSentiment > historicalBaseline) return '↑';
  if (currentSentiment < historicalBaseline) return '↓';
  return '→';
};
