import alternativesDatabase from '../data/alternativesDatabase.json';

/**
 * Get better alternatives for a PE-owned brand
 * Matches by category and returns 2-5 verified independent alternatives
 */
export function getBetterAlternatives(brandName, brandData) {
  if (!brandName || !brandData) {
    return [];
  }

  // Determine the category of the brand
  const category = determineBrandCategory(brandName, brandData);

  if (!category) {
    return [];
  }

  // Get alternatives for this category from the database
  const alternativesList = alternativesDatabase.alternatives[category.brandKey];

  if (!alternativesList || !alternativesList.alternatives) {
    return [];
  }

  // Filter for independent/founder-owned alternatives
  const independent = alternativesList.alternatives.filter(alt =>
    alt.ownershipStatus === 'independent' || alt.ownershipStatus === 'founder-owned'
  );

  // Return 2-5 alternatives, prioritizing independent ones
  return independent.slice(0, 5);
}

/**
 * Determine the category of a brand based on its name and database key
 */
function determineBrandCategory(brandName, brandData) {
  const lowerBrandName = brandName.toLowerCase();

  // Map brand keys to category keys
  const brandToCategoryMap = {
    'whatsapp': 'whatsapp',
    'instagram': 'instagram',
    'facebook': 'facebook',
    'youtube': 'youtube',
    'oculus': 'oculus',
    'slack': 'slack',
    'github': 'github',
    'zendesk': 'zendesk',
    'qualtrics': 'qualtrics',
    'tableau': 'tableau',
    'turbotax': 'turbotax',
    'xilinx': 'xilinx'
  };

  // Check if we have direct mapping for this brand
  const key = Object.keys(brandToCategoryMap).find(
    k => lowerBrandName.includes(k) || k.includes(lowerBrandName)
  );

  if (key) {
    const brandKey = brandToCategoryMap[key];
    const categoryInfo = alternativesDatabase.alternatives[brandKey];

    if (categoryInfo) {
      return {
        brandKey: brandKey,
        category: categoryInfo.category,
        categoryName: alternativesDatabase.categories[categoryInfo.category]?.name || 'Similar Products'
      };
    }
  }

  // Fallback: try to match by keywords in brand name or description
  for (const [brandKey, altData] of Object.entries(alternativesDatabase.alternatives)) {
    const categoryKey = altData.category;
    const categoryData = alternativesDatabase.categories[categoryKey];

    if (categoryData) {
      const keywords = categoryData.keywords || [];
      const matches = keywords.some(keyword =>
        lowerBrandName.includes(keyword) || keyword.includes(lowerBrandName)
      );

      if (matches) {
        return {
          brandKey: brandKey,
          category: categoryKey,
          categoryName: categoryData.name
        };
      }
    }
  }

  return null;
}

/**
 * Get the disclaimer text with current date
 */
export function getAlternativesDisclaimer() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `These alternatives are independently verified as non-PE owned as of ${formattedDate}`;
}

/**
 * Verify ownership status for an alternative
 * In production, this would query Wikidata for verification
 */
export function verifyOwnershipStatus(alternative) {
  // Status indicators
  const statusColors = {
    'independent': '#4caf50',      // Green
    'founder-owned': '#81c784',    // Light Green
    'publicly-traded': '#ffc107'   // Yellow
  };

  const statusLabels = {
    'independent': 'Independent',
    'founder-owned': 'Founder-Owned',
    'publicly-traded': 'Publicly Traded'
  };

  return {
    status: alternative.ownershipStatus,
    label: statusLabels[alternative.ownershipStatus] || 'Verified',
    color: statusColors[alternative.ownershipStatus] || '#4caf50',
    verified: true,
    source: alternative.wikidataEntity ? 'Wikidata' : 'Curated Database'
  };
}

/**
 * Format alternatives for display
 */
export function formatAlternativesForDisplay(alternatives) {
  return alternatives.map(alt => ({
    ...alt,
    ownership: verifyOwnershipStatus(alt)
  }));
}
