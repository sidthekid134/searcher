# Backend Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Database
```bash
cp .env.example .env
# Edit .env - At minimum set DATABASE_URL
```

### 3. Initialize & Seed
```bash
python -c "from database import init_db; init_db()"
python seed_data.py
```

### 4. Start Server
```bash
uvicorn main:app --reload
```

Visit `http://localhost:8000/docs` for interactive API documentation.

## Core API Endpoints

### Admin Operations (requires X-Admin-Key header if configured)

**Trigger Pipeline**
```bash
curl -X POST http://localhost:8000/api/admin/pipeline/run
```

**Check Status**
```bash
curl http://localhost:8000/api/admin/pipeline/status/1
```

**Process Specific Brands**
```bash
curl -X POST http://localhost:8000/api/admin/pipeline/run-brands \
  -H "Content-Type: application/json" \
  -d '{"brand_names": ["Pepsi", "TikTok"]}'
```

### Data Queries

**Search Brands**
```bash
curl "http://localhost:8000/api/brands/search?q=Pepsi"
```

**Get Brand Details**
```bash
curl http://localhost:8000/api/brands/1
```

**View History**
```bash
curl http://localhost:8000/api/brands/1/history
```

**List Disputed Brands**
```bash
curl http://localhost:8000/api/brands/quality/disputed
```

## Project Structure

```
backend/
├── main.py                 # FastAPI application
├── models.py              # Database models (Brand, OwnershipEntry, etc.)
├── database.py            # Database connection & session
├── config.py              # Configuration settings
├── scraper.py             # Data collection scraper
├── pipeline.py            # Pipeline orchestration
├── seed_data.py           # Sample data for testing
├── performance_test.py    # Performance benchmarking
├── requirements.txt       # Dependencies
├── .env.example           # Environment template
├── routers/
│   ├── admin.py          # Admin API endpoints
│   └── brands.py         # Brand query endpoints
└── README.md             # Full documentation
```

## Key Features Implemented

✅ **Acceptance Criteria**
1. Data extraction from SEC filings & websites
2. Conflict detection with "Ownership Disputed" flag
3. Source attribution (URL, type, date)
4. Performance: 100 brands in <5 minutes
5. Incomplete data handling with partial chains
6. Historical tracking with timestamped snapshots

✅ **Admin API**
- Manual pipeline triggers
- Job status tracking
- Batch processing support

✅ **Data Quality**
- COMPLETE, INCOMPLETE_DATA, OWNERSHIP_DISPUTED status
- Confidence scores for entries
- Conflict storage and resolution

✅ **Database**
- PostgreSQL with proper indexing
- Relationships and foreign keys
- Historical versioning

## Testing

**Run Performance Test**
```bash
python performance_test.py
```

Expected: 100 brands processed in <5 minutes ✓

**Check Health**
```bash
curl http://localhost:8000/health
```

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/searcher_db

# Optional
DEBUG=False
ADMIN_API_KEY=your_secure_key
REQUEST_TIMEOUT=30
BATCH_SIZE=10
MAX_RETRIES=3
```

## Troubleshooting

**Port 8000 already in use?**
```bash
uvicorn main:app --port 8001
```

**Database connection failing?**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Test: `psql <connection_string>`

**Permission denied on seed_data.py?**
```bash
python seed_data.py
```

## Next Steps

1. Frontend integration: Connect React frontend to these endpoints
2. Authentication: Add JWT tokens to admin endpoints
3. Monitoring: Set up logs and performance metrics
4. Scaling: Configure multiple workers for production

For full documentation, see `README.md`
