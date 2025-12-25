const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';
const TIMEOUT = 5000;

/**
 * Query Wikidata for entity by label
 */
export async function queryWikidataByLabel(label) {
  const query = `
    SELECT ?item ?itemLabel WHERE {
      ?item rdfs:label "${label}"@en .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
    LIMIT 1
  `;

  return fetchWithTimeout(query);
}

/**
 * Get ownership information (P127: owned by, P749: parent organization)
 */
export async function getOwnershipInfo(wikidataId) {
  const query = `
    SELECT ?owner ?ownerLabel ?property WHERE {
      wd:${wikidataId} (wdt:P127|wdt:P749) ?owner .
      OPTIONAL { ?owner rdfs:label ?ownerLabel . FILTER (LANG(?ownerLabel) = "en") }
      OPTIONAL {
        wd:${wikidataId} wdt:P127 ?owner .
        BIND("owned_by" AS ?property)
      }
      OPTIONAL {
        wd:${wikidataId} wdt:P749 ?owner .
        BIND("parent_org" AS ?property)
      }
    }
  `;

  return fetchWithTimeout(query);
}

/**
 * Fetch from Wikidata with timeout
 */
async function fetchWithTimeout(query) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(WIKIDATA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-query',
        'Accept': 'application/sparql-results+json',
      },
      body: query,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Wikidata API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Wikidata API timeout (5 seconds)');
    }
    throw error;
  }
}

/**
 * Extract entity ID from Wikidata URI
 */
export function extractEntityId(uri) {
  const match = uri.match(/Q\d+$/);
  return match ? match[0] : null;
}

/**
 * Extract label from result
 */
export function extractLabel(result) {
  return result.itemLabel?.value || result.ownerLabel?.value || 'Unknown';
}
