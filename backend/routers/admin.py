"""
Admin API routes for data collection pipeline management.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Header
from sqlmodel import Session
from datetime import datetime

from database import get_session
from models import ScraperJob
from pipeline import DataCollectionPipeline
from config import settings

router = APIRouter(prefix="/api/admin", tags=["admin"])


def verify_admin_key(x_admin_key: Optional[str] = Header(None)) -> bool:
    """Verify admin API key."""
    if not settings.admin_api_key:
        # If no API key configured, allow access (for development)
        return True

    if not x_admin_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return True


@router.post("/pipeline/run")
async def trigger_pipeline(
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    admin: bool = Depends(verify_admin_key),
) -> dict:
    """
    Trigger the full data collection pipeline for all brands.

    This endpoint:
    1. Creates a ScraperJob record
    2. Starts pipeline processing in background
    3. Returns immediately with job ID for polling

    Returns:
        Job information with ID for status polling
    """

    async def run_pipeline():
        pipeline = DataCollectionPipeline(session)
        await pipeline.run_full_pipeline(triggered_by="admin_api")

    background_tasks.add_task(run_pipeline)

    # Create initial job record
    job = ScraperJob(
        status="pending",
        triggered_by="admin_api",
        created_at=datetime.utcnow(),
    )
    session.add(job)
    session.commit()

    return {
        "status": "pipeline_started",
        "job_id": job.id,
        "message": "Data collection pipeline started. Check job status with /pipeline/status/{job_id}",
    }


@router.post("/pipeline/run-brands")
async def trigger_pipeline_for_brands(
    brand_names: List[str],
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    admin: bool = Depends(verify_admin_key),
) -> dict:
    """
    Trigger pipeline for specific brands.

    Args:
        brand_names: List of brand names to process

    Returns:
        Job information with ID for status polling
    """

    async def run_pipeline():
        pipeline = DataCollectionPipeline(session)
        await pipeline.run_pipeline_for_brands(brand_names, triggered_by="admin_api")

    background_tasks.add_task(run_pipeline)

    # Create initial job record
    job = ScraperJob(
        status="pending",
        triggered_by="admin_api",
        created_at=datetime.utcnow(),
    )
    session.add(job)
    session.commit()

    return {
        "status": "pipeline_started",
        "job_id": job.id,
        "brands_target": len(brand_names),
        "message": f"Pipeline started for {len(brand_names)} brands",
    }


@router.get("/pipeline/status/{job_id}")
def get_pipeline_status(
    job_id: int,
    session: Session = Depends(get_session),
    admin: bool = Depends(verify_admin_key),
) -> dict:
    """
    Get the status of a pipeline execution job.

    Returns:
        Job status with progress information
    """
    job = session.get(ScraperJob, job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    progress_percent = (
        (job.brands_processed / job.brands_total * 100)
        if job.brands_total > 0
        else 0
    )

    return {
        "job_id": job.id,
        "status": job.status,
        "brands_total": job.brands_total,
        "brands_processed": job.brands_processed,
        "progress_percent": progress_percent,
        "errors_count": job.errors_count,
        "started_at": job.started_at,
        "completed_at": job.completed_at,
        "triggered_by": job.triggered_by,
        "created_at": job.created_at,
    }


@router.get("/pipeline/jobs")
def get_recent_jobs(
    limit: int = 10,
    session: Session = Depends(get_session),
    admin: bool = Depends(verify_admin_key),
) -> List[dict]:
    """
    Get recent pipeline execution jobs.

    Args:
        limit: Maximum number of jobs to return

    Returns:
        List of recent jobs
    """
    pipeline = DataCollectionPipeline(session)
    jobs = pipeline.get_recent_jobs(limit=limit)

    return [
        {
            "job_id": job.id,
            "status": job.status,
            "brands_processed": job.brands_processed,
            "brands_total": job.brands_total,
            "errors_count": job.errors_count,
            "started_at": job.started_at,
            "completed_at": job.completed_at,
            "created_at": job.created_at,
        }
        for job in jobs
    ]
