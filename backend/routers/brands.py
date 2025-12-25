"""
Brand data query and search endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from datetime import datetime

from database import get_session
from models import Brand, OwnershipEntry, ConflictEntry, BrandHistoricalVersion, DataQualityStatus

router = APIRouter(prefix="/api/brands", tags=["brands"])


@router.get("/")
def list_brands(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    session: Session = Depends(get_session),
) -> List[dict]:
    """
    List all brands with pagination.

    Returns:
        List of brands with basic information
    """
    brands = session.exec(
        select(Brand).offset(skip).limit(limit)
    ).all()

    return [
        {
            "id": brand.id,
            "name": brand.name,
            "primary_owner": brand.primary_owner,
            "quality_status": brand.quality_status,
            "last_updated": brand.last_updated,
        }
        for brand in brands
    ]


@router.get("/search")
def search_brands(
    q: str = Query(..., min_length=1),
    session: Session = Depends(get_session),
) -> List[dict]:
    """
    Search brands by name.

    Args:
        q: Search query

    Returns:
        List of matching brands
    """
    query_lower = q.lower()
    brands = session.exec(
        select(Brand).where(Brand.name.ilike(f"%{query_lower}%"))
    ).all()

    return [
        {
            "id": brand.id,
            "name": brand.name,
            "primary_owner": brand.primary_owner,
            "quality_status": brand.quality_status,
            "last_updated": brand.last_updated,
        }
        for brand in brands
    ]


@router.get("/{brand_id}")
def get_brand(
    brand_id: int,
    session: Session = Depends(get_session),
) -> dict:
    """
    Get detailed brand information including ownership chain.

    Returns:
        Brand with full ownership information
    """
    brand = session.get(Brand, brand_id)

    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    # Get ownership entries
    entries = session.exec(
        select(OwnershipEntry).where(OwnershipEntry.brand_id == brand_id).order_by(
            OwnershipEntry.hierarchy_level
        )
    ).all()

    # Build ownership chain
    ownership_chain = []
    for entry in entries:
        # Check for conflicts
        conflicts = session.exec(
            select(ConflictEntry).where(ConflictEntry.ownership_entry_id == entry.id)
        ).all()

        ownership_chain.append(
            {
                "owner_name": entry.owner_name,
                "owner_type": entry.owner_type,
                "hierarchy_level": entry.hierarchy_level,
                "source_type": entry.source_type,
                "source_url": entry.source_url,
                "collection_date": entry.collection_date,
                "confidence_score": entry.confidence_score,
                "conflicts": [
                    {
                        "conflicting_owner_name": c.conflicting_owner_name,
                        "conflicting_source_url": c.conflicting_source_url,
                        "conflicting_source_type": c.conflicting_source_type,
                    }
                    for c in conflicts
                ],
            }
        )

    return {
        "id": brand.id,
        "name": brand.name,
        "primary_owner": brand.primary_owner,
        "quality_status": brand.quality_status,
        "is_disputed": brand.quality_status == DataQualityStatus.OWNERSHIP_DISPUTED,
        "is_incomplete": brand.quality_status == DataQualityStatus.INCOMPLETE_DATA,
        "last_updated": brand.last_updated,
        "created_at": brand.created_at,
        "ownership_chain": ownership_chain,
    }


@router.get("/{brand_id}/history")
def get_brand_history(
    brand_id: int,
    limit: int = Query(10, ge=1, le=100),
    session: Session = Depends(get_session),
) -> List[dict]:
    """
    Get historical versions of brand ownership data.

    Returns:
        List of historical snapshots
    """
    brand = session.get(Brand, brand_id)

    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    versions = session.exec(
        select(BrandHistoricalVersion)
        .where(BrandHistoricalVersion.brand_id == brand_id)
        .order_by(BrandHistoricalVersion.version_number.desc())
        .limit(limit)
    ).all()

    return [
        {
            "version_number": v.version_number,
            "ownership_chain": v.ownership_chain,
            "quality_status": v.quality_status,
            "primary_owner": v.primary_owner,
            "snapshot_date": v.snapshot_date,
        }
        for v in versions
    ]


@router.get("/quality/disputed")
def get_disputed_brands(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    session: Session = Depends(get_session),
) -> List[dict]:
    """
    Get all brands with disputed ownership information.

    Returns:
        List of brands with ownership disputes
    """
    brands = session.exec(
        select(Brand)
        .where(Brand.quality_status == DataQualityStatus.OWNERSHIP_DISPUTED)
        .offset(skip)
        .limit(limit)
    ).all()

    return [
        {
            "id": brand.id,
            "name": brand.name,
            "primary_owner": brand.primary_owner,
            "last_updated": brand.last_updated,
        }
        for brand in brands
    ]


@router.get("/quality/incomplete")
def get_incomplete_brands(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    session: Session = Depends(get_session),
) -> List[dict]:
    """
    Get all brands with incomplete ownership data.

    Returns:
        List of brands with incomplete data
    """
    brands = session.exec(
        select(Brand)
        .where(Brand.quality_status == DataQualityStatus.INCOMPLETE_DATA)
        .offset(skip)
        .limit(limit)
    ).all()

    return [
        {
            "id": brand.id,
            "name": brand.name,
            "primary_owner": brand.primary_owner,
            "last_updated": brand.last_updated,
        }
        for brand in brands
    ]


@router.post("/{brand_id}/sources")
def get_brand_sources(
    brand_id: int,
    session: Session = Depends(get_session),
) -> List[dict]:
    """
    Get all source attributions for a brand's ownership data.

    Returns:
        List of sources with URLs and collection dates
    """
    brand = session.get(Brand, brand_id)

    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    entries = session.exec(
        select(OwnershipEntry).where(OwnershipEntry.brand_id == brand_id)
    ).all()

    sources = []
    for entry in entries:
        sources.append(
            {
                "owner_name": entry.owner_name,
                "source_type": entry.source_type,
                "source_url": entry.source_url,
                "collection_date": entry.collection_date,
                "confidence_score": entry.confidence_score,
            }
        )

    return sources
