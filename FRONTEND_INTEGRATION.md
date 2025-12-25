# Frontend Integration Guide

This document provides guidance for integrating the React frontend with the FastAPI backend data collection pipeline.

## Backend API Overview

The backend provides REST endpoints for:
1. **Admin Pipeline Control** - Trigger and monitor data collection
2. **Brand Search & Query** - Access collected ownership data
3. **Historical Tracking** - View ownership changes over time

## Environment Setup

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/searcher_db
DEBUG=False
APP_NAME=Searcher - Data Collection Pipeline
ADMIN_API_KEY=your_secure_key_here
REQUEST_TIMEOUT=30
BATCH_SIZE=10
MAX_RETRIES=3
```

### Frontend (optional .env)
```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ADMIN_KEY=your_secure_key_here
```

## Core Endpoints

### Search Brands
```javascript
// Get search results
fetch('http://localhost:8000/api/brands/search?q=Pepsi')
  .then(r => r.json())
  .then(data => console.log(data))

// Response:
[
  {
    "id": 1,
    "name": "Pepsi",
    "primary_owner": "PepsiCo Inc.",
    "quality_status": "complete",
    "last_updated": "2024-01-01T12:30:00"
  }
]
```

### Get Full Brand Details
```javascript
// Get complete ownership hierarchy
fetch('http://localhost:8000/api/brands/1')
  .then(r => r.json())
  .then(data => console.log(data))

// Response:
{
  "id": 1,
  "name": "Pepsi",
  "primary_owner": "PepsiCo Inc.",
  "quality_status": "complete",
  "is_disputed": false,
  "is_incomplete": false,
  "last_updated": "2024-01-01T12:30:00",
  "ownership_chain": [
    {
      "owner_name": "PepsiCo Inc.",
      "owner_type": "parent_company",
      "hierarchy_level": 0,
      "source_type": "sec_filing",
      "source_url": "https://www.sec.gov/...",
      "collection_date": "2024-01-01T12:00:00",
      "confidence_score": 0.95,
      "conflicts": []
    }
  ]
}
```

### Trigger Pipeline (Admin)
```javascript
// Trigger full pipeline collection
fetch('http://localhost:8000/api/admin/pipeline/run', {
  method: 'POST',
  headers: {
    'X-Admin-Key': 'your_api_key'
  }
})
.then(r => r.json())
.then(data => console.log(data))

// Response:
{
  "status": "pipeline_started",
  "job_id": 1,
  "message": "Data collection pipeline started..."
}
```

### Check Pipeline Status
```javascript
// Poll for job progress
fetch('http://localhost:8000/api/admin/pipeline/status/1', {
  headers: {
    'X-Admin-Key': 'your_api_key'
  }
})
.then(r => r.json())
.then(data => console.log(data))

// Response:
{
  "job_id": 1,
  "status": "running",
  "brands_total": 100,
  "brands_processed": 45,
  "progress_percent": 45.0,
  "errors_count": 0,
  "started_at": "2024-01-01T12:00:00",
  "completed_at": null
}
```

## React Component Examples

### Search Integration
```javascript
// SearchBar.js
const SearchBar = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/brands/search?q=${query}`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search brands..."
        onChange={(e) => handleSearch(e.target.value)}
      />
      {loading && <p>Loading...</p>}
      <ul>
        {results.map(brand => (
          <li key={brand.id}>{brand.name}</li>
        ))}
      </ul>
    </div>
  );
};
```

### Brand Details Display
```javascript
// BrandDetail.js
const BrandDetail = ({ brandId }) => {
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/brands/${brandId}`)
      .then(r => r.json())
      .then(data => {
        setBrand(data);
        setLoading(false);
      });
  }, [brandId]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>{brand.name}</h1>
      <p>Owner: {brand.primary_owner}</p>
      <p>Status: {brand.quality_status}</p>
      {brand.is_disputed && <span className="warning">⚠️ Disputed</span>}
      {brand.is_incomplete && <span className="warning">❌ Incomplete</span>}

      <h3>Ownership Chain:</h3>
      <ul>
        {brand.ownership_chain.map((entry, i) => (
          <li key={i}>
            {entry.owner_name}
            <em> ({entry.source_type})</em>
            <small>Score: {entry.confidence_score}</small>
            {entry.conflicts.length > 0 && (
              <span className="warning">⚠️ Conflicts</span>
            )}
          </li>
        ))}
      </ul>

      <p>Last Updated: {new Date(brand.last_updated).toLocaleDateString()}</p>
    </div>
  );
};
```

### Admin Pipeline Control
```javascript
// AdminPipeline.js
const AdminPipeline = () => {
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);

  const startPipeline = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/pipeline/run`,
        {
          method: 'POST',
          headers: {
            'X-Admin-Key': process.env.REACT_APP_ADMIN_KEY
          }
        }
      );
      const data = await response.json();
      setJobId(data.job_id);
    } catch (error) {
      console.error('Failed to start pipeline:', error);
    }
  };

  const checkStatus = async () => {
    if (!jobId) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/pipeline/status/${jobId}`,
        {
          headers: {
            'X-Admin-Key': process.env.REACT_APP_ADMIN_KEY
          }
        }
      );
      const data = await response.json();
      setJobStatus(data);
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  return (
    <div>
      <button onClick={startPipeline}>Start Pipeline</button>
      {jobStatus && (
        <div>
          <p>Status: {jobStatus.status}</p>
          <progress
            value={jobStatus.progress_percent}
            max="100"
          />
          <p>{jobStatus.brands_processed}/{jobStatus.brands_total}</p>
          <button onClick={checkStatus}>Refresh</button>
        </div>
      )}
    </div>
  );
};
```

## Data Flow Architecture

```
Frontend (React)
    ↓
API Requests (fetch/axios)
    ↓
FastAPI Backend
    ↓
Database (PostgreSQL)
    ↓
Scraper (SEC, websites)
    ↓
Updated Database
    ↓
API Response
    ↓
Frontend Update
```

## CORS Configuration

The backend is configured with CORS enabled for all origins. For production, update `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Error Handling

Frontend should handle these error cases:

```javascript
const handleAPICall = async (url) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized (missing API key)
        throw new Error('Authentication required');
      }
      if (response.status === 404) {
        throw new Error('Resource not found');
      }
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    // Show user-friendly error message
    return null;
  }
};
```

## Polling for Job Completion

Example implementation for monitoring pipeline progress:

```javascript
const pollJobStatus = async (jobId, maxAttempts = 300) => {
  let attempts = 0;

  const poll = async () => {
    if (attempts >= maxAttempts) {
      console.error('Polling timeout');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/pipeline/status/${jobId}`,
        {
          headers: {
            'X-Admin-Key': process.env.REACT_APP_ADMIN_KEY
          }
        }
      );
      const status = await response.json();

      // Update UI with status
      onStatusUpdate(status);

      // Continue polling if still running
      if (status.status === 'running') {
        attempts++;
        setTimeout(poll, 1000); // Poll every second
      } else if (status.status === 'completed') {
        onComplete(status);
      } else if (status.status === 'failed') {
        onError(status);
      }
    } catch (error) {
      console.error('Polling error:', error);
      setTimeout(poll, 5000); // Retry after 5 seconds
    }
  };

  poll();
};
```

## Data Mapping for Frontend

Map backend data to frontend models:

```javascript
// Backend response
{
  "quality_status": "ownership_disputed",
  "is_disputed": true,
  "ownership_chain": [...]
}

// Frontend display
- Show ⚠️ icon if is_disputed = true
- Show ❌ icon if is_incomplete = true
- Show green checkmark if status = "complete"
```

## Performance Considerations

1. **Pagination**: Use skip/limit parameters for large datasets
   ```javascript
   fetch(`http://localhost:8000/api/brands/?skip=0&limit=10`)
   ```

2. **Search Debouncing**: Debounce search input in frontend
   ```javascript
   const debounce = (func, delay) => {
     let timeout;
     return (...args) => {
       clearTimeout(timeout);
       timeout = setTimeout(() => func(...args), delay);
     };
   };
   ```

3. **Caching**: Cache brand details locally
   ```javascript
   const [cache, setCache] = useState({});
   // Check cache before fetching
   ```

## Testing API Endpoints

Use curl or Postman to test endpoints before frontend integration:

```bash
# List brands
curl http://localhost:8000/api/brands/

# Search
curl "http://localhost:8000/api/brands/search?q=Pepsi"

# Get brand details
curl http://localhost:8000/api/brands/1

# Get history
curl http://localhost:8000/api/brands/1/history

# Trigger pipeline (requires admin key)
curl -X POST http://localhost:8000/api/admin/pipeline/run \
  -H "X-Admin-Key: your_key"

# Check status
curl http://localhost:8000/api/admin/pipeline/status/1 \
  -H "X-Admin-Key: your_key"
```

## Deployment Considerations

1. **Environment Variables**: Update REACT_APP_API_URL for production
2. **CORS**: Configure specific origins instead of wildcard
3. **API Keys**: Store admin keys securely (not in frontend code)
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Consider adding rate limiting to API
6. **Caching**: Implement caching headers for static data
7. **Monitoring**: Set up logging and error tracking

## Support

For integration issues, refer to:
- Backend README: `backend/README.md`
- API Docs: `http://localhost:8000/docs` (Swagger UI)
- Implementation Summary: `IMPLEMENTATION_SUMMARY.md`
