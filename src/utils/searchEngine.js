// Fast search engine optimized for <500ms on <1000 brands
// Uses debouncing and efficient string matching

class SearchEngine {
  constructor(brands) {
    this.brands = brands;
    this.indexedBrands = this.createIndex();
  }

  createIndex() {
    // Create a normalized index for faster searching
    return this.brands.map(brand => ({
      ...brand,
      normalizedName: brand.name.toLowerCase(),
      normalizedOwner: brand.primaryOwner.toLowerCase()
    }));
  }

  search(query, options = {}) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const results = [];

    // Search through indexed brands
    for (const brand of this.indexedBrands) {
      let score = 0;

      // Exact match gets highest score
      if (brand.normalizedName === normalizedQuery) {
        score = 1000;
      }
      // Brand name starts with query
      else if (brand.normalizedName.startsWith(normalizedQuery)) {
        score = 500 + (brand.name.length - normalizedQuery.length);
      }
      // Brand name contains query
      else if (brand.normalizedName.includes(normalizedQuery)) {
        score = 300;
      }
      // Owner name starts with query
      else if (brand.normalizedOwner.startsWith(normalizedQuery)) {
        score = 200;
      }
      // Owner name contains query
      else if (brand.normalizedOwner.includes(normalizedQuery)) {
        score = 100;
      }

      if (score > 0) {
        results.push({ ...brand, searchScore: score });
      }
    }

    // Sort by score, then deprioritize incomplete data
    results.sort((a, b) => {
      if (a.isIncomplete && !b.isIncomplete) return 1;
      if (!a.isIncomplete && b.isIncomplete) return -1;
      return b.searchScore - a.searchScore;
    });

    return results;
  }

  getHierarchyDepth(brand) {
    return brand.hierarchy ? brand.hierarchy.length : 0;
  }

  getHierarchySummary(brand) {
    const hierarchy = brand.hierarchy || [];
    return hierarchy.slice(0, 2); // Returns 1-2 levels
  }

  getHierarchyFull(brand) {
    return brand.hierarchy || [];
  }
}

export default SearchEngine;
