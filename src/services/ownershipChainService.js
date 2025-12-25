import brandDatabase from '../data/brandDatabase.json' assert { type: 'json' };
import { getOwnershipInfo, extractEntityId, extractLabel, queryWikidataByLabel } from './wikidataService.js';

const MAX_DEPTH = 10;

/**
 * Get complete ownership chain for a brand
 * Returns { chain, confidence, source, error }
 */
export async function getOwnershipChain(brandName) {
  try {
    // Try Wikidata first
    return await getOwnershipChainFromWikidata(brandName);
  } catch (error) {
    console.warn('Wikidata lookup failed:', error.message);
    // Fallback to local database
    return getOwnershipChainFromDatabase(brandName);
  }
}

/**
 * Get ownership chain from Wikidata with recursive traversal
 */
async function getOwnershipChainFromWikidata(brandName) {
  const normalized = brandName.toLowerCase().trim();

  // Find the brand entity
  const searchResults = await queryWikidataByLabel(brandName);

  if (!searchResults.results || !searchResults.results.bindings.length) {
    throw new Error(`Brand "${brandName}" not found in Wikidata`);
  }

  const entity = searchResults.results.bindings[0];
  const brandId = extractEntityId(entity.item.value);
  const brandLabel = entity.itemLabel.value;

  if (!brandId) {
    throw new Error('Could not extract entity ID from Wikidata result');
  }

  // Build chain recursively
  const chain = [];
  const visited = new Set();
  let confidence = 1.0;

  await buildOwnershipChain(brandId, brandLabel, chain, visited, 0, confidence);

  return {
    chain,
    confidence: Math.min(1.0, confidence / chain.length),
    source: 'wikidata',
    error: null
  };
}

/**
 * Recursively build ownership chain with cycle detection
 */
async function buildOwnershipChain(entityId, label, chain, visited, depth, confidence) {
  // Prevent infinite loops and excessive depth
  if (depth >= MAX_DEPTH || visited.has(entityId)) {
    return confidence;
  }

  visited.add(entityId);
  chain.push({
    label,
    wikidataId: entityId,
    depth,
    confidence: confidence
  });

  // Check for owner
  try {
    const ownershipResults = await getOwnershipInfo(entityId);

    if (ownershipResults.results && ownershipResults.results.bindings.length) {
      const owner = ownershipResults.results.bindings[0];
      const ownerId = extractEntityId(owner.owner.value);
      const ownerLabel = owner.ownerLabel?.value || 'Unknown';

      if (ownerId && !visited.has(ownerId)) {
        // Slightly reduce confidence for indirect ownership
        const newConfidence = confidence * 0.95;
        await buildOwnershipChain(ownerId, ownerLabel, chain, visited, depth + 1, newConfidence);
      }
    }
  } catch (error) {
    console.warn(`Could not fetch ownership info for ${label}:`, error.message);
  }

  return confidence;
}

/**
 * Get ownership chain from fallback database
 */
export function getOwnershipChainFromDatabase(brandName) {
  const normalized = brandName.toLowerCase().trim();
  const { brands } = brandDatabase;

  if (!brands[normalized]) {
    return {
      chain: [],
      confidence: 0,
      source: 'database',
      error: `Brand "${brandName}" not found in database`
    };
  }

  const chain = [];
  const visited = new Set();
  let currentKey = normalized;
  let confidence = 1.0;

  while (currentKey && !visited.has(currentKey)) {
    const brand = brands[currentKey];
    visited.add(currentKey);

    chain.push({
      label: brand.label,
      ownedBy: brand.ownedBy,
      confidence: brand.confidence,
      acquisitionYear: brand.acquisitionYear,
      foundedYear: brand.foundedYear,
      depth: chain.length
    });

    if (!brand.ownedBy) {
      // Reached ultimate parent
      break;
    }

    currentKey = brand.ownedBy;
    confidence *= 0.95; // Reduce confidence at each level
  }

  return {
    chain,
    confidence: Math.min(1.0, confidence),
    source: 'database',
    error: null
  };
}

/**
 * Format chain for display
 */
export function formatOwnershipChain(chain) {
  return chain
    .map((item, index) => {
      const arrow = index === 0 ? '' : ' ← ';
      const confidence = item.confidence ? ` (${Math.round(item.confidence * 100)}% confident)` : '';
      return `${arrow}${item.label}${confidence}`;
    })
    .join('');
}
