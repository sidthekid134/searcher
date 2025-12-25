/**
 * Search history service with localStorage support
 */

const STORAGE_KEY = 'brand_search_history';
const MAX_HISTORY = 100;

/**
 * Add search to history
 */
export function addSearchToHistory(brandName) {
  const history = getSearchHistory();
  const normalized = brandName.toLowerCase().trim();

  // Remove if exists and add to front
  const filtered = history.filter(entry =>
    entry.brand.toLowerCase().trim() !== normalized
  );

  filtered.unshift({
    brand: brandName,
    timestamp: Date.now(),
    count: 1
  });

  // Keep only recent searches
  const limited = filtered.slice(0, MAX_HISTORY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
}

/**
 * Get full search history
 */
export function getSearchHistory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Get trending searches (most searched brands)
 */
export function getTrendingSearches(limit = 5) {
  const history = getSearchHistory();

  // Count occurrences
  const countMap = {};
  history.forEach(entry => {
    const key = entry.brand.toLowerCase().trim();
    countMap[key] = (countMap[key] || 0) + 1;
  });

  // Sort by count and return top entries
  return Object.entries(countMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([brand]) => brand);
}

/**
 * Clear search history
 */
export function clearSearchHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
