# Brand Ownership Chain Search

A React-based web application that enables users to search for brands and retrieve their complete ownership chain from Wikidata, with intelligent fallback to a hardcoded JSON database.

## Quick Start

### Prerequisites
- Node.js 16+ installed

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server (opens at http://localhost:3000)
npm run dev

# Build for production
npm run build
```

## Features

✅ **Search Bar with Input** - Accept brand names and trigger searches
✅ **Wikidata Integration** - Query P127 (owned by) and P749 (parent organization) properties
✅ **Recursive Chain Building** - Find ultimate parent company within 10 levels with cycle detection
✅ **Confidence Scores** - Display partial ownership chains with confidence percentages (e.g., 80% confident)
✅ **Fallback Database** - Auto-fallback when Wikidata unavailable or times out (5 seconds)
✅ **Visual Tree** - Display ownership as Brand → Subsidiary → Ultimate Parent with canvas visualization
✅ **Trending Suggestions** - Show most-searched brands below search bar using localStorage

## Try It Out

Search for these brands to test the functionality:
- **WhatsApp** - Owned by Meta
- **YouTube** - Owned by Google (Alphabet)
- **Instagram** - Owned by Meta
- **Slack** - Owned by Salesforce
- **GitHub** - Owned by Microsoft
- **LinkedIn** - Owned by Microsoft
- **Android** - Owned by Google (Alphabet)

## Project Structure

```
src/
├── components/          # React components
│   ├── SearchBar.jsx       # Search input + trending suggestions
│   └── OwnershipTree.jsx    # Canvas visualization of ownership chain
├── services/            # Business logic
│   ├── wikidataService.js           # Wikidata SPARQL API
│   ├── ownershipChainService.js     # Chain building & recursion
│   └── searchHistoryService.js      # Search tracking & trending
├── data/                # Fallback data
│   └── brandDatabase.json           # 20 pre-loaded brands
├── App.jsx              # Main app component
├── App.css              # Styling
└── main.jsx             # React entry point
```

## How It Works

1. **Search Input** - User enters a brand name in the search bar
2. **Wikidata Query** - App queries Wikidata SPARQL endpoint for brand entity
3. **Ownership Chain** - Recursively traverses P127 and P749 properties to find parent companies
4. **Confidence Tracking** - Each level reduces confidence by 5% to indicate data uncertainty
5. **Fallback** - If Wikidata times out (5 seconds) or unavailable, uses local database
6. **Visual Display** - Shows chain as text and canvas-based tree diagram
7. **Trending** - Adds search to localStorage and shows top 5 most-searched brands

## Technical Details

- **Framework:** React 18.2
- **Build Tool:** Vite
- **API:** Wikidata SPARQL Endpoint
- **Timeout:** 5 seconds with AbortController
- **Max Depth:** 10 levels with cycle detection
- **Visualization:** HTML5 Canvas
- **Storage:** localStorage for search history

## Key Files

| File | Purpose |
|------|---------|
| `src/services/wikidataService.js` | Wikidata API queries with 5-second timeout |
| `src/services/ownershipChainService.js` | Recursive chain building with cycle detection (MAX_DEPTH=10) |
| `src/components/SearchBar.jsx` | Search input + trending suggestions display |
| `src/components/OwnershipTree.jsx` | Canvas-based tree visualization |
| `src/data/brandDatabase.json` | Fallback database with 20 brands |

## For More Details

See `IMPLEMENTATION_SUMMARY.md` for complete acceptance criteria mapping and detailed implementation notes.