"""
Database models for ownership data collection pipeline.
"""
from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from enum import Enum


class SourceType(str, Enum):
    """Enum for data source types."""
    SEC_FILING = "sec_filing"
    COMPANY_WEBSITE = "company_website"
    BUSINESS_DATABASE = "business_database"
    NEWS = "news"
    MANUAL = "manual"


class DataQualityStatus(str, Enum):
    """Enum for data quality status."""
    COMPLETE = "complete"
    INCOMPLETE_DATA = "incomplete_data"
    OWNERSHIP_DISPUTED = "ownership_disputed"


class Brand(SQLModel, table=True):
    """Brand entity representing a product/service brand."""

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    primary_owner: Optional[str] = None
    quality_status: DataQualityStatus = Field(default=DataQualityStatus.COMPLETE)
    is_complete: bool = Field(default=False)  # Marks if ownership chain is complete
    dispute_notes: Optional[str] = None  # Notes about ownership disputes
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    ownership_entries: List["OwnershipEntry"] = Relationship(back_populates="brand")
    historical_versions: List["BrandHistoricalVersion"] = Relationship(
        back_populates="brand"
    )
    admin_logs: List["AdminLog"] = Relationship(back_populates="brand")


class OwnershipEntry(SQLModel, table=True):
    """Individual ownership entry with source attribution."""

    id: Optional[int] = Field(default=None, primary_key=True)
    brand_id: int = Field(foreign_key="brand.id", index=True)
    owner_name: str = Field(index=True)
    owner_type: str  # e.g., "parent_company", "pe_firm", "individual"
    hierarchy_level: int  # Level in ownership chain (0 = direct owner)
    source_url: Optional[str] = None
    source_type: SourceType = Field(default=SourceType.MANUAL)
    collection_date: datetime = Field(default_factory=datetime.utcnow)
    confidence_score: float = Field(default=1.0, ge=0.0, le=1.0)

    # Relationships
    brand: Brand = Relationship(back_populates="ownership_entries")
    conflict_entries: List["ConflictEntry"] = Relationship(back_populates="entry")


class ConflictEntry(SQLModel, table=True):
    """Tracks conflicting ownership information from different sources."""

    id: Optional[int] = Field(default=None, primary_key=True)
    ownership_entry_id: int = Field(foreign_key="ownershipentry.id", index=True)
    conflicting_owner_name: str
    conflicting_source_url: Optional[str] = None
    conflicting_source_type: SourceType
    conflict_detection_date: datetime = Field(default_factory=datetime.utcnow)
    resolution_status: str = Field(default="unresolved")  # unresolved, resolved, disputed

    # Relationships
    entry: OwnershipEntry = Relationship(back_populates="conflict_entries")


class BrandHistoricalVersion(SQLModel, table=True):
    """Historical snapshots of brand ownership data for tracking changes."""

    id: Optional[int] = Field(default=None, primary_key=True)
    brand_id: int = Field(foreign_key="brand.id", index=True)
    version_number: int
    ownership_chain: str  # JSON serialized ownership chain
    quality_status: DataQualityStatus
    primary_owner: Optional[str]
    snapshot_date: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    brand: Brand = Relationship(back_populates="historical_versions")


class ScraperJob(SQLModel, table=True):
    """Tracks scraper execution jobs."""

    id: Optional[int] = Field(default=None, primary_key=True)
    status: str = Field(default="pending")  # pending, running, completed, failed
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    brands_processed: int = Field(default=0)
    brands_total: int = Field(default=0)
    errors_count: int = Field(default=0)
    triggered_by: str = Field(default="admin")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class DataSource(SQLModel, table=True):
    """Configuration and metadata for data sources."""

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True)
    source_type: SourceType
    base_url: Optional[str] = None
    is_enabled: bool = Field(default=True)
    last_accessed: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AdminLog(SQLModel, table=True):
    """Audit log for all admin actions."""

    id: Optional[int] = Field(default=None, primary_key=True)
    brand_id: int = Field(foreign_key="brand.id", index=True)
    admin_user_id: str  # Admin user identifier
    action: str  # e.g., "add_brand", "edit_ownership", "flag_dispute", "trigger_refresh"
    description: str  # Detailed description of the action
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    details: Optional[str] = None  # JSON serialized details of changes

    # Relationships
    brand: Brand = Relationship(back_populates="admin_logs")
