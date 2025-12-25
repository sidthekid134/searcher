// localStorage management for search history and user preferences

const STORAGE_KEYS = {
  SEARCH_HISTORY: 'brand_search_history',
  USER_PREFERENCES: 'brand_search_preferences',
  DETAIL_LEVEL: 'detail_level_preference'
};

export const storageManager = {
  // Search History Management
  getSearchHistory: () => {
    try {
      const history = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error reading search history:', error);
      return [];
    }
  },

  addToSearchHistory: (query) => {
    try {
      const history = storageManager.getSearchHistory();
      // Remove if already exists and add to beginning
      const filtered = history.filter(item => item.query !== query);
      const newHistory = [
        { query, timestamp: new Date().toISOString() },
        ...filtered
      ];
      // Keep only last 20 searches
      localStorage.setItem(
        STORAGE_KEYS.SEARCH_HISTORY,
        JSON.stringify(newHistory.slice(0, 20))
      );
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  },

  clearSearchHistory: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  },

  // User Preferences
  getDetailLevelPreference: () => {
    try {
      const preference = localStorage.getItem(STORAGE_KEYS.DETAIL_LEVEL);
      return preference || 'summary';
    } catch (error) {
      console.error('Error reading detail level preference:', error);
      return 'summary';
    }
  },

  setDetailLevelPreference: (level) => {
    try {
      if (['summary', 'full'].includes(level)) {
        localStorage.setItem(STORAGE_KEYS.DETAIL_LEVEL, level);
      }
    } catch (error) {
      console.error('Error saving detail level preference:', error);
    }
  },

  getUserPreferences: () => {
    try {
      const preferences = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return preferences ? JSON.parse(preferences) : {
        detailLevel: 'summary',
        highlightDisputed: true,
        showIncomplete: true,
        sortBy: 'relevance'
      };
    } catch (error) {
      console.error('Error reading user preferences:', error);
      return {
        detailLevel: 'summary',
        highlightDisputed: true,
        showIncomplete: true,
        sortBy: 'relevance'
      };
    }
  },

  setUserPreferences: (preferences) => {
    try {
      const current = storageManager.getUserPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  },

  // Saved Brands
  saveBrand: (brand) => {
    try {
      const key = `brand_${brand.id}`;
      localStorage.setItem(key, JSON.stringify({
        ...brand,
        savedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving brand:', error);
    }
  },

  getSavedBrand: (brandId) => {
    try {
      const key = `brand_${brandId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving saved brand:', error);
      return null;
    }
  },

  clearAll: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing all storage:', error);
    }
  }
};

export default storageManager;
