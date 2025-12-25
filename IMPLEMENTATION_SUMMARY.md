# Brand Ownership Chain Search - Implementation Summary

## Project Overview
This is a React-based web application that enables users to search for brands and retrieve their complete ownership chain from Wikidata, with fallback to a hardcoded JSON database when the API is unavailable.

## Acceptance Criteria Implementation

### ✅ 1. Search Bar accepts brand name input and triggers Wikidata SPARQL query

**Implementation Location:** `src/components/SearchBar.jsx`

- Search bar component with input field accepts brand names
- Uses P127 (owned by) and P749 (parent organization) properties in SPARQL queries
- Configured in `src/services/wikidataService.js`:
  - `queryWikidataByLabel()`: Searches for brand entity by label in Wikidata
  - `getOwnershipInfo()`: Queries P127 and P749 properties using SPARQL
  - SPARQL query uses: `(wdt:P127|wdt:P749)` to get both properties

### ✅ 2. Recursive traversal identifies ultimate parent company within 10 levels with cycle detection

**Implementation Location:** `src/services/ownershipChainService.js`

- Constant `MAX_DEPTH = 10` enforces maximum chain depth limit
- `buildOwnershipChain()` function implements recursive traversal:
  - Uses `visited` Set to prevent infinite loops (cycle detection)
  - Checks `if (depth >= MAX_DEPTH || visited.has(entityId))` to stop recursion
  - Recursively calls itself for parent organizations
  - Continues until ultimate parent (no owner) or max depth reached

### ✅ 3. Partial ownership chains display with confidence scores when data is incomplete

**Implementation Location:** `src/App.jsx`, `src/components/OwnershipTree.jsx`

- Each chain item includes confidence value (0.0 to 1.0)
- Confidence decreases at each level (multiplied by 0.95)
- Display format: `Brand (confidence%)`
- Visual indicator in tree: confidence shown in yellow badge
- Example: "80% confident"

**Files involved:**
- `src/services/ownershipChainService.js`: Calculates confidence (line 51, 141)
- `src/App.jsx`: Displays confidence in metadata (line 70-72)
- `src/components/OwnershipTree.jsx`: Shows confidence badges (line 87-91)

### ✅ 4. Fallback to hardcoded JSON database when Wikidata API unavailable or times out after 5 seconds

**Implementation Location:** `src/services/ownershipChainService.js`, `src/services/wikidataService.js`

- Timeout: `TIMEOUT = 5000` ms in wikidataService.js (line 2)
- Uses AbortController with timeout signal (lines 45-46)
- Fallback logic (line 13-18):
  ```javascript
  try {
    return await getOwnershipChainFromWikidata(brandName);
  } catch (error) {
    return getOwnershipChainFromDatabase(brandName);
  }
  ```
- Hardcoded database: `src/data/brandDatabase.json`
  - Contains 20 brands with ownership relationships
  - Examples: WhatsApp → Meta, YouTube → Google, Slack → Salesforce

### ✅ 5. Results display ownership chain as Brand → Subsidiary → Ultimate Parent with visual tree representation

**Implementation Location:** `src/components/OwnershipTree.jsx`, `src/App.jsx`

- Text representation (line 62-69 in App.jsx):
  ```
  Brand ← Subsidiary ← Parent ← Ultimate Parent
  ```
- Canvas-based visual tree (OwnershipTree component):
  - Draws nodes for each company in the chain
  - Connects nodes with arrows showing ownership flow
  - Color-coded: Blue for root brand, teal for parents
  - Includes confidence badges and source indicator

**Display Format:** Brand → (confidence) ← Parent → (confidence) ← Ultimate Parent

### ✅ 6. Trending search suggestions appear below search bar based on most-searched brands

**Implementation Location:** `src/services/searchHistoryService.js`, `src/components/SearchBar.jsx`

- localStorage key: `'brand_search_history'`
- `getTrendingSearches(limit = 5)`: Returns top 5 most-searched brands
- Tracking via `addSearchToHistory()`: Called in App.jsx (line 22)
- Component displays in `SearchBar.jsx` (lines 47-63):
  - Shows "Trending searches:" label
  - Lists clickable brand buttons
  - Updates on mount

## File Structure

```
├── index.html                          # HTML entry point
├── vite.config.js                      # Build configuration
├── package.json                        # Dependencies and scripts
├── .gitignore                          # Git ignore rules
│
├── src/
│   ├── main.jsx                        # React app entry
│   ├── App.jsx                         # Main component
│   ├── App.css                         # Styling
│   │
│   ├── components/
│   │   ├── SearchBar.jsx               # Search input + trending
│   │   └── OwnershipTree.jsx           # Canvas visualization
│   │
│   ├── services/
│   │   ├── wikidataService.js          # Wikidata API integration
│   │   ├── ownershipChainService.js    # Chain building logic
│   │   └── searchHistoryService.js     # History & trending tracking
│   │
│   └── data/
│       └── brandDatabase.json          # Fallback brand database
│
└── IMPLEMENTATION_SUMMARY.md           # This file
```

## Key Features

### 1. Wikidata Integration
- Uses official Wikidata SPARQL endpoint
- Queries P127 (owned by) and P749 (parent organization)
- Automatic fallback on timeout or API errors
- 5-second timeout to prevent hanging

### 2. Intelligent Chain Building
- Recursive depth-first traversal
- Cycle detection with Set-based visited tracking
- Maximum depth of 10 levels
- Confidence degradation: 1.0 → 0.95 → 0.90 → etc.

### 3. Visual Representation
- Canvas-based tree diagram
- Color-coded nodes (blue for brand, teal for parents)
- Connected arrows showing ownership flow
- Data source indicator (Wikidata or Database)
- Responsive design

### 4. Search History
- localStorage-based persistence
- Tracks up to 100 searches
- Trending calculation by frequency
- Shows top 5 trending searches

### 5. Fallback Database
- 20 pre-loaded brands with relationships
- Coverage of major tech companies
- Confidence scores per relationship
- Acquisition years for context

## Technology Stack

- **Framework:** React 18.2
- **Build Tool:** Vite
- **Styling:** CSS (no external libraries)
- **Data Source:** Wikidata SPARQL API
- **Persistence:** localStorage
- **Canvas:** Native HTML5 Canvas for visualization

## Running the Application

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Browser Support

- Modern browsers with ES modules support
- Canvas API support (for visualizations)
- localStorage support (for trending suggestions)
- Fetch API with AbortController support

## API Reference

### Services

#### wikidataService.js
- `queryWikidataByLabel(label)`: Find brand entity
- `getOwnershipInfo(wikidataId)`: Get owner relationships
- `extractEntityId(uri)`: Parse Wikidata entity ID

#### ownershipChainService.js
- `getOwnershipChain(brandName)`: Main function (tries Wikidata, falls back to DB)
- `getOwnershipChainFromWikidata(brandName)`: Wikidata lookup
- `getOwnershipChainFromDatabase(brandName)`: Database lookup
- `formatOwnershipChain(chain)`: Format for display

#### searchHistoryService.js
- `addSearchToHistory(brandName)`: Track search
- `getSearchHistory()`: Get all searches
- `getTrendingSearches(limit)`: Get top brands
- `clearSearchHistory()`: Clear data

## Testing

Try these brands in the search bar:
- WhatsApp (Wikidata) → Meta → No parent
- YouTube (Wikidata) → Google/Alphabet → No parent
- Slack (Database) → Salesforce → No parent
- Instagram (Database) → Meta → No parent
- GitHub (Database) → Microsoft → No parent

All queries will:
1. First try Wikidata (with 5-second timeout)
2. Fall back to local database if needed
3. Display results with confidence scores
4. Render visual tree representation
5. Add search to trending history
