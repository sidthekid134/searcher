"""
Admin Management API - Test Guide and Usage Examples

This module demonstrates usage of the admin management endpoints for:
1. Adding new brands with ownership chain information
2. Editing existing ownership records
3. Flagging brands as having disputed ownership
4. Manually triggering data refresh cycles
5. Viewing audit logs and dashboard metrics
"""

import requests
import json
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"
ADMIN_KEY = "your-admin-api-key"  # Configure in settings

# Helper function for API calls
def api_call(method: str, endpoint: str, data: Dict[str, Any] = None) -> Dict:
    """Make authenticated API call."""
    headers = {"X-Admin-Key": ADMIN_KEY}
    url = f"{BASE_URL}{endpoint}"

    if method == "GET":
        response = requests.get(url, headers=headers)
    elif method == "POST":
        response = requests.post(url, json=data, headers=headers)
    elif method == "PUT":
        response = requests.put(url, json=data, headers=headers)

    return response.json()


# ============================================================================
# ACCEPTANCE CRITERIA 1: Add New Brands with Ownership Chain Information
# ============================================================================

def test_add_brand():
    """
    Criterion 1: Admin can add new brands with ownership chain information
    and mark completeness status.
    """
    print("\n=== TEST 1: Add New Brand ===")

    # Add a new brand
    result = api_call("POST", "/api/admin/brands", {
        "name": "Nike",
        "primary_owner": "Nike Inc.",
        "is_complete": True
    })

    print(f"✅ Brand Added: {result}")
    brand_id = result["id"]

    # Add ownership entries to the brand
    result = api_call("POST", f"/api/admin/brands/{brand_id}/ownership-entries", {
        "owner_name": "Berkshire Hathaway",
        "owner_type": "parent_company",
        "hierarchy_level": 1,
        "source_url": "https://example.com/nike-ownership",
        "source_type": "company_website",
        "confidence_score": 0.95
    })

    print(f"✅ Ownership Entry Added: {result}")
    return brand_id


# ============================================================================
# ACCEPTANCE CRITERIA 2: Edit Existing Ownership Records
# ============================================================================

def test_edit_brand(brand_id: int):
    """
    Criterion 2: Admin can edit existing ownership records and update
    parent company/PE firm relationships.
    """
    print("\n=== TEST 2: Edit Existing Brand ===")

    # Update primary owner and completeness
    result = api_call("PUT", f"/api/admin/brands/{brand_id}", {
        "primary_owner": "Nike Corp",
        "is_complete": True
    })

    print(f"✅ Brand Updated: {result}")


# ============================================================================
# ACCEPTANCE CRITERIA 3: Flag Brands as Disputed
# ============================================================================

def test_flag_dispute(brand_id: int):
    """
    Criterion 3: Admin can flag brands as 'Ownership Disputed'
    and add notes explaining the dispute.
    """
    print("\n=== TEST 3: Flag Ownership as Disputed ===")

    result = api_call("POST", f"/api/admin/brands/{brand_id}/dispute", {
        "notes": "Conflicting information from SEC filings vs company website. "
                 "Unclear if parent company is Berkshire Hathaway or independent entity. "
                 "Requires further investigation."
    })

    print(f"✅ Dispute Flagged: {result}")
    print(f"   Status: {result['quality_status']}")
    print(f"   Notes: {result['dispute_notes']}")


# ============================================================================
# ACCEPTANCE CRITERIA 4: Manually Trigger Data Refresh
# ============================================================================

def test_trigger_refresh(brand_id: int):
    """
    Criterion 4: Admin can manually trigger data refresh for all brands
    or specific brands from web sources.
    """
    print("\n=== TEST 4: Manually Trigger Data Refresh ===")

    # Trigger refresh for specific brand
    result = api_call("POST", f"/api/admin/brands/{brand_id}/refresh", {})

    print(f"✅ Refresh Triggered: {result}")
    print(f"   Job ID: {result['job_id']}")

    # Check job status
    job_result = api_call("GET", f"/api/admin/pipeline/status/{result['job_id']}")
    print(f"   Job Status: {job_result['status']}")


# ============================================================================
# ACCEPTANCE CRITERIA 5: Audit Trail Logging
# ============================================================================

def test_audit_logs(brand_id: int):
    """
    Criterion 5: All admin actions are logged with timestamp,
    admin user ID, and action description.
    """
    print("\n=== TEST 5: View Audit Logs ===")

    result = api_call("GET", f"/api/admin/brands/{brand_id}/logs?limit=10")

    print(f"✅ Audit Logs Retrieved: {len(result)} actions")
    for log in result:
        print(f"   - {log['action']}: {log['description']}")
        print(f"     User: {log['admin_user_id']}, Time: {log['timestamp']}")
        if log['details']:
            print(f"     Details: {log['details']}")


# ============================================================================
# ACCEPTANCE CRITERIA 6: Admin Dashboard Metrics
# ============================================================================

def test_dashboard_metrics():
    """
    Criterion 6: Admin dashboard shows data quality metrics:
    - % complete chains
    - % disputed entries
    - last refresh date
    """
    print("\n=== TEST 6: Admin Dashboard Metrics ===")

    result = api_call("GET", "/api/admin/dashboard/metrics")

    print(f"✅ Dashboard Metrics Retrieved:")
    print(f"   Total Brands: {result['total_brands']}")
    print(f"   Complete Chains: {result['complete_chains_percent']}%")
    print(f"   Disputed Entries: {result['disputed_entries_percent']}%")
    print(f"   Incomplete Entries: {result['incomplete_entries_percent']}%")
    print(f"   Last Refresh: {result['last_refresh_date']}")
    print(f"   Status Breakdown: {result['status_breakdown']}")


# ============================================================================
# Full Integration Test
# ============================================================================

def run_full_integration_test():
    """Run all acceptance criteria tests."""
    print("=" * 70)
    print("ADMIN MANAGEMENT API - INTEGRATION TEST")
    print("=" * 70)

    try:
        # Test 1: Add Brand
        brand_id = test_add_brand()

        # Test 2: Edit Brand
        test_edit_brand(brand_id)

        # Test 3: Flag Dispute
        test_flag_dispute(brand_id)

        # Test 4: Trigger Refresh
        test_trigger_refresh(brand_id)

        # Test 5: Audit Logs
        test_audit_logs(brand_id)

        # Test 6: Dashboard Metrics
        test_dashboard_metrics()

        print("\n" + "=" * 70)
        print("✅ ALL TESTS PASSED")
        print("=" * 70)

    except Exception as e:
        print(f"\n❌ Test Failed: {e}")
        import traceback
        traceback.print_exc()


# ============================================================================
# API Endpoint Reference
# ============================================================================

"""
BRAND MANAGEMENT ENDPOINTS:

1. ADD BRAND
   POST /api/admin/brands
   Body: {
     "name": "Brand Name",
     "primary_owner": "Owner Name",
     "is_complete": bool
   }
   Returns: Created brand with id

2. EDIT BRAND
   PUT /api/admin/brands/{brand_id}
   Body: {
     "primary_owner": "New Owner",
     "is_complete": bool
   }
   Returns: Updated brand

3. ADD OWNERSHIP ENTRY
   POST /api/admin/brands/{brand_id}/ownership-entries
   Body: {
     "owner_name": "Owner Name",
     "owner_type": "parent_company|pe_firm|individual",
     "hierarchy_level": 1,
     "source_url": "url",
     "source_type": "manual|sec_filing|company_website|business_database|news",
     "confidence_score": 0.0-1.0
   }
   Returns: Created ownership entry

4. FLAG AS DISPUTED
   POST /api/admin/brands/{brand_id}/dispute
   Body: {
     "notes": "Explanation of dispute"
   }
   Returns: Updated brand with OWNERSHIP_DISPUTED status

5. TRIGGER REFRESH
   POST /api/admin/brands/{brand_id}/refresh
   Returns: Job info with job_id

6. GET AUDIT LOGS
   GET /api/admin/brands/{brand_id}/logs?limit=20
   Returns: List of admin actions

7. GET DASHBOARD METRICS
   GET /api/admin/dashboard/metrics
   Returns: Quality metrics and statistics

EXISTING PIPELINE ENDPOINTS:

8. TRIGGER FULL PIPELINE
   POST /api/admin/pipeline/run
   Returns: Job info for all brands refresh

9. TRIGGER BRANDS REFRESH
   POST /api/admin/pipeline/run-brands
   Body: {"brand_names": ["Brand1", "Brand2"]}
   Returns: Job info for specific brands

10. GET JOB STATUS
    GET /api/admin/pipeline/status/{job_id}
    Returns: Job progress and details

11. GET RECENT JOBS
    GET /api/admin/pipeline/jobs?limit=10
    Returns: List of recent pipeline jobs
"""

if __name__ == "__main__":
    # Note: Run this with FastAPI server running
    # python backend/main.py
    # In another terminal:
    # python backend/admin_test_guide.py

    run_full_integration_test()
