"""
Admin API routes for data collection pipeline management.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Header
from sqlmodel import Session, select
from datetime import datetime
import json

from database import get_session
from models import (
    ScraperJob,
    Brand,
    AdminLog,
    OwnershipEntry,
    DataQualityStatus,
    SourceType,
)
from pipeline import DataCollectionPipeline
from config import settings

router = APIRouter(prefix="/api/admin", tags=["admin"])


def verify_admin_key(x_admin_key: Optional[str] = Header(None)) -> str:
    """Verify admin API key and return admin ID."""
    if not settings.admin_api_key:
        # If no API key configured, allow access (for development)
        return "admin_dev"

    if not x_admin_key or x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return "admin_api"


def log_admin_action(
    session: Session,
    brand_id: int,
    admin_user_id: str,
    action: str,
    description: str,
    details: Optional[dict] = None,
) -> AdminLog:
    """Log an admin action for audit trail."""
    log_entry = AdminLog(
        brand_id=brand_id,
        admin_user_id=admin_user_id,
        action=action,
        description=description,
        details=json.dumps(details) if details else None,
        timestamp=datetime.utcnow(),
    )
    session.add(log_entry)
    session.commit()
    return log_entry


@router.post("/pipeline/run")
async def trigger_pipeline(
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    admin_user_id: str = Depends(verify_admin_key),
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
    admin_user_id: str = Depends(verify_admin_key),
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
    admin: str = Depends(verify_admin_key),
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


# ============================================================================
# Brand Management Endpoints
# ============================================================================


@router.post("/brands")
def add_brand(
    name: str,
    primary_owner: Optional[str] = None,
    is_complete: bool = False,
    session: Session = Depends(get_session),
    admin_user_id: str = Depends(verify_admin_key),
) -> dict:
    """
    Add a new brand with ownership chain information.

    Args:
        name: Brand name
        primary_owner: Primary owner/parent company
        is_complete: Whether the ownership chain is complete

    Returns:
        Created brand information
    """
    # Check if brand already exists
    existing = session.exec(select(Brand).where(Brand.name == name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Brand already exists")

    brand = Brand(
        name=name,
        primary_owner=primary_owner,
        is_complete=is_complete,
        quality_status=DataQualityStatus.COMPLETE,
        created_at=datetime.utcnow(),
        last_updated=datetime.utcnow(),
    )
    session.add(brand)
    session.commit()
    session.refresh(brand)

    # Log the action
    log_admin_action(
        session,
        brand.id,
        admin_user_id,
        "add_brand",
        f"Added new brand: {name}",
        {"primary_owner": primary_owner, "is_complete": is_complete},
    )

    return {
        "id": brand.id,
        "name": brand.name,
        "primary_owner": brand.primary_owner,
        "is_complete": brand.is_complete,
        "quality_status": brand.quality_status,
        "created_at": brand.created_at,
    }


@router.put("/brands/{brand_id}")
def edit_brand(
    brand_id: int,
    primary_owner: Optional[str] = None,
    is_complete: Optional[bool] = None,
    session: Session = Depends(get_session),
    admin_user_id: str = Depends(verify_admin_key),
) -> dict:
    """
    Edit existing brand and ownership information.

    Args:
        brand_id: Brand ID
        primary_owner: Updated primary owner
        is_complete: Updated completeness status

    Returns:
        Updated brand information
    """
    brand = session.get(Brand, brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    # Track changes for logging
    changes = {}
    if primary_owner is not None and brand.primary_owner != primary_owner:
        changes["primary_owner"] = {"old": brand.primary_owner, "new": primary_owner}
        brand.primary_owner = primary_owner

    if is_complete is not None and brand.is_complete != is_complete:
        changes["is_complete"] = {"old": brand.is_complete, "new": is_complete}
        brand.is_complete = is_complete

    if changes:
        brand.last_updated = datetime.utcnow()
        session.add(brand)
        session.commit()
        session.refresh(brand)

        # Log the action
        log_admin_action(
            session,
            brand.id,
            admin_user_id,
            "edit_brand",
            f"Updated brand: {brand.name}",
            changes,
        )

    return {
        "id": brand.id,
        "name": brand.name,
        "primary_owner": brand.primary_owner,
        "is_complete": brand.is_complete,
        "quality_status": brand.quality_status,
        "last_updated": brand.last_updated,
    }


@router.post("/brands/{brand_id}/ownership-entries")
def add_ownership_entry(
    brand_id: int,
    owner_name: str,
    owner_type: str,
    hierarchy_level: int,
    source_url: Optional[str] = None,
    source_type: str = "manual",
    confidence_score: float = 1.0,
    session: Session = Depends(get_session),
    admin_user_id: str = Depends(verify_admin_key),
) -> dict:
    """
    Add ownership entry to brand ownership chain.

    Args:
        brand_id: Brand ID
        owner_name: Name of owner
        owner_type: Type of owner (parent_company, pe_firm, individual)
        hierarchy_level: Level in ownership chain
        source_url: URL where information was found
        source_type: Source type (manual, sec_filing, etc.)
        confidence_score: Confidence in the information (0-1)

    Returns:
        Created ownership entry
    """
    brand = session.get(Brand, brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    entry = OwnershipEntry(
        brand_id=brand_id,
        owner_name=owner_name,
        owner_type=owner_type,
        hierarchy_level=hierarchy_level,
        source_url=source_url,
        source_type=source_type if source_type in [s.value for s in SourceType] else SourceType.MANUAL,
        confidence_score=min(max(confidence_score, 0.0), 1.0),
        collection_date=datetime.utcnow(),
    )
    session.add(entry)
    session.commit()
    session.refresh(entry)

    # Log the action
    log_admin_action(
        session,
        brand_id,
        admin_user_id,
        "add_ownership",
        f"Added ownership entry: {owner_name} ({owner_type})",
        {
            "owner_name": owner_name,
            "owner_type": owner_type,
            "hierarchy_level": hierarchy_level,
        },
    )

    return {
        "id": entry.id,
        "brand_id": entry.brand_id,
        "owner_name": entry.owner_name,
        "owner_type": entry.owner_type,
        "hierarchy_level": entry.hierarchy_level,
        "source_url": entry.source_url,
        "source_type": entry.source_type,
        "confidence_score": entry.confidence_score,
        "collection_date": entry.collection_date,
    }


@router.post("/brands/{brand_id}/dispute")
def flag_dispute(
    brand_id: int,
    notes: str,
    session: Session = Depends(get_session),
    admin_user_id: str = Depends(verify_admin_key),
) -> dict:
    """
    Flag a brand as having disputed ownership and add notes.

    Args:
        brand_id: Brand ID
        notes: Explanation of the dispute

    Returns:
        Updated brand information
    """
    brand = session.get(Brand, brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    brand.quality_status = DataQualityStatus.OWNERSHIP_DISPUTED
    brand.dispute_notes = notes
    brand.last_updated = datetime.utcnow()
    session.add(brand)
    session.commit()
    session.refresh(brand)

    # Log the action
    log_admin_action(
        session,
        brand_id,
        admin_user_id,
        "flag_dispute",
        f"Flagged ownership as disputed: {brand.name}",
        {"dispute_notes": notes},
    )

    return {
        "id": brand.id,
        "name": brand.name,
        "quality_status": brand.quality_status,
        "dispute_notes": brand.dispute_notes,
        "last_updated": brand.last_updated,
    }


@router.post("/brands/{brand_id}/refresh")
async def trigger_brand_refresh(
    brand_id: int,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    admin_user_id: str = Depends(verify_admin_key),
) -> dict:
    """
    Manually trigger data refresh for a specific brand.

    Args:
        brand_id: Brand ID to refresh

    Returns:
        Job information
    """
    brand = session.get(Brand, brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    async def run_refresh():
        pipeline = DataCollectionPipeline(session)
        await pipeline.run_pipeline_for_brands([brand.name], triggered_by="admin_api")

    background_tasks.add_task(run_refresh)

    job = ScraperJob(
        status="pending",
        triggered_by="admin_api",
        brands_total=1,
        created_at=datetime.utcnow(),
    )
    session.add(job)
    session.commit()

    # Log the action
    log_admin_action(
        session,
        brand_id,
        admin_user_id,
        "trigger_refresh",
        f"Triggered data refresh for: {brand.name}",
        {"job_id": job.id},
    )

    return {
        "status": "refresh_started",
        "brand_id": brand_id,
        "brand_name": brand.name,
        "job_id": job.id,
    }


@router.get("/brands/{brand_id}/logs")
def get_brand_audit_logs(
    brand_id: int,
    limit: int = 20,
    session: Session = Depends(get_session),
    admin_user_id: str = Depends(verify_admin_key),
) -> List[dict]:
    """
    Get audit logs for a brand showing all admin actions.

    Args:
        brand_id: Brand ID
        limit: Maximum number of logs to return

    Returns:
        List of admin actions
    """
    brand = session.get(Brand, brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    logs = session.exec(
        select(AdminLog)
        .where(AdminLog.brand_id == brand_id)
        .order_by(AdminLog.timestamp.desc())
        .limit(limit)
    ).all()

    return [
        {
            "id": log.id,
            "action": log.action,
            "description": log.description,
            "admin_user_id": log.admin_user_id,
            "timestamp": log.timestamp,
            "details": json.loads(log.details) if log.details else None,
        }
        for log in logs
    ]


@router.get("/dashboard/metrics")
def get_dashboard_metrics(
    session: Session = Depends(get_session),
    admin_user_id: str = Depends(verify_admin_key),
) -> dict:
    """
    Get admin dashboard metrics for data quality and refresh status.

    Returns:
        Dashboard metrics including completeness %, disputes %, and last refresh date
    """
    # Get all brands
    all_brands = session.exec(select(Brand)).all()
    total_brands = len(all_brands)

    if total_brands == 0:
        return {
            "total_brands": 0,
            "complete_chains_percent": 0.0,
            "disputed_entries_percent": 0.0,
            "incomplete_entries_percent": 0.0,
            "last_refresh_date": None,
            "status_breakdown": {
                "complete": 0,
                "disputed": 0,
                "incomplete": 0,
            },
        }

    # Count by status
    complete_count = len(
        [b for b in all_brands if b.quality_status == DataQualityStatus.COMPLETE]
    )
    disputed_count = len(
        [
            b
            for b in all_brands
            if b.quality_status == DataQualityStatus.OWNERSHIP_DISPUTED
        ]
    )
    incomplete_count = len(
        [
            b
            for b in all_brands
            if b.quality_status == DataQualityStatus.INCOMPLETE_DATA
        ]
    )

    # Count complete chains (is_complete flag)
    complete_chains = len([b for b in all_brands if b.is_complete])

    # Get last refresh date from most recent job
    last_job = session.exec(
        select(ScraperJob)
        .where(ScraperJob.status == "completed")
        .order_by(ScraperJob.completed_at.desc())
    ).first()

    return {
        "total_brands": total_brands,
        "complete_chains_percent": round((complete_chains / total_brands * 100), 2),
        "disputed_entries_percent": round((disputed_count / total_brands * 100), 2),
        "incomplete_entries_percent": round((incomplete_count / total_brands * 100), 2),
        "last_refresh_date": last_job.completed_at if last_job else None,
        "status_breakdown": {
            "complete": complete_count,
            "disputed": disputed_count,
            "incomplete": incomplete_count,
        },
    }
