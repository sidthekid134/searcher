# Brand Ownership Search - Searcher

A React-based application for searching brands and exploring their ownership structures with configurable detail levels.

## Quick Start

### Prerequisites
- Node.js 14+
- npm or yarn

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The application will open at `http://localhost:3000`

## Features

✅ **Fast Search** - Brand search returns results within 500ms for <1,000 brands
✅ **Ownership Hierarchy** - Visual tree/chain format showing parent companies and PE firms
✅ **Detail Levels** - Toggle between Summary (1-2 levels) and Full (all levels) views
✅ **Incomplete Data** - Incomplete chains marked and deprioritized in results
✅ **Disputed Ownership** - Shows "Ownership Disputed" flag with last-updated timestamp
✅ **Rich Results** - Search results display brand name, owner, PE firm, and depth indicator
✅ **localStorage** - Persistent search history and user preferences

## Usage

1. **Search** - Enter a brand name in the search box (e.g., "Pepsi", "Burger King", "TikTok")
2. **View Results** - See matching brands with metadata and status flags
3. **Expand Details** - Click on a result to expand and view full ownership hierarchy
4. **Toggle Detail Level** - Use the "Show Full Details" / "Show Summary" button in the hierarchy viewer
5. **Explore Ownership** - See the complete chain of ownership from brand to parent companies and PE firms

## Sample Brands

- **Pepsi** - Simple hierarchy with parent company
- **Burger King** - Complex 4-level hierarchy with PE firm
- **Whole Foods Market** - Acquired by Amazon, 3-level hierarchy
- **TikTok** - Disputed ownership with timestamp
- **Snapchat** - Incomplete data example
- **Dunkin'** - PE-backed company

## Project Structure

```
src/
├── components/          # React components
│   ├── BrandSearch.js  # Main search interface
│   ├── SearchResult.js # Result card component
│   └── HierarchyViewer.js # Hierarchy visualization
├── data/
│   └── brands.js       # Sample brand dataset
├── styles/             # CSS styles
├── utils/
│   ├── searchEngine.js # Search logic & ranking
│   ├── storageManager.js # localStorage management
│   └── testAcceptanceCriteria.js # Test suite
├── App.js              # Root component
└── index.js            # React entry point
```

## Technical Details

- **Framework**: React 18.2
- **Storage**: localStorage for persistence
- **Search**: Client-side with relevance ranking
- **Styling**: CSS Grid & Flexbox (responsive)
- **Performance**: <50ms search execution time

## Testing

Run acceptance criteria tests from browser console:
```javascript
import { runAcceptanceTests } from './utils/testAcceptanceCriteria';
runAcceptanceTests();
```

## Documentation

See [IMPLEMENTATION.md](IMPLEMENTATION.md) for detailed implementation documentation.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers