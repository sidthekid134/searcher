"""
Data collection pipeline orchestration.
Handles batch processing of brands with performance optimization.
"""
import asyncio
import time
from datetime import datetime
from typing import List, Optional
from sqlmodel import Session, select
from models import Brand, ScraperJob, DataQualityStatus
from scraper import OwnershipScraper
from config import settings


class DataCollectionPipeline:
    """Orchestrates the data collection process for multiple brands."""

    def __init__(self, session: Session):
        self.session = session
        self.scraper = OwnershipScraper(session)
        self.batch_size = settings.batch_size

    async def run_full_pipeline(
        self, triggered_by: str = "admin"
    ) -> Optional[ScraperJob]:
        """
        Run the complete scraping pipeline for all brands.

        Returns:
            ScraperJob with execution results
        """
        # Create job record
        job = ScraperJob(
            status="running",
            started_at=datetime.utcnow(),
            triggered_by=triggered_by,
        )
        self.session.add(job)
        self.session.commit()

        try:
            # Get all brands to process
            brands = self.session.exec(select(Brand)).all()
            job.brands_total = len(brands)

            start_time = time.time()

            # Process in batches for efficiency
            processed = 0
            errors = 0

            for i in range(0, len(brands), self.batch_size):
                batch = brands[i : i + self.batch_size]
                batch_data = [(b.id, b.name) for b in batch]

                batch_processed, batch_errors = await self.scraper.process_brands_batch(
                    batch_data
                )
                processed += batch_processed
                errors += batch_errors

                # Update brand quality status
                for brand in batch:
                    # Get entry count to determine quality
                    entries = self.session.exec(
                        select(Brand).where(Brand.id == brand.id)
                    ).first()
                    if entries:
                        entries.last_updated = datetime.utcnow()
                        self.session.add(entries)

                # Create historical versions
                for brand in batch:
                    self.scraper.create_historical_version(brand.id)

                self.session.commit()

            elapsed_time = time.time() - start_time

            # Update job status
            job.status = "completed"
            job.completed_at = datetime.utcnow()
            job.brands_processed = processed
            job.errors_count = errors

            self.session.add(job)
            self.session.commit()

            print(
                f"Pipeline completed: {processed} brands processed in {elapsed_time:.2f}s"
            )

            return job

        except Exception as e:
            print(f"Pipeline error: {e}")
            job.status = "failed"
            job.completed_at = datetime.utcnow()
            self.session.add(job)
            self.session.commit()
            raise

    async def run_pipeline_for_brands(
        self, brand_names: List[str], triggered_by: str = "admin"
    ) -> Optional[ScraperJob]:
        """
        Run pipeline for specific brands.

        Args:
            brand_names: List of brand names to process
            triggered_by: User/system that triggered the pipeline

        Returns:
            ScraperJob with execution results
        """
        # Create job record
        job = ScraperJob(
            status="running",
            started_at=datetime.utcnow(),
            triggered_by=triggered_by,
        )
        self.session.add(job)
        self.session.commit()

        try:
            # Get brands by name
            brands = self.session.exec(
                select(Brand).where(Brand.name.in_(brand_names))
            ).all()

            job.brands_total = len(brands)

            start_time = time.time()

            # Process in batches
            processed = 0
            errors = 0

            for i in range(0, len(brands), self.batch_size):
                batch = brands[i : i + self.batch_size]
                batch_data = [(b.id, b.name) for b in batch]

                batch_processed, batch_errors = await self.scraper.process_brands_batch(
                    batch_data
                )
                processed += batch_processed
                errors += batch_errors

                # Update timestamps
                for brand in batch:
                    brand.last_updated = datetime.utcnow()
                    self.session.add(brand)

                # Create historical versions
                for brand in batch:
                    self.scraper.create_historical_version(brand.id)

                self.session.commit()

            elapsed_time = time.time() - start_time

            # Update job status
            job.status = "completed"
            job.completed_at = datetime.utcnow()
            job.brands_processed = processed
            job.errors_count = errors

            self.session.add(job)
            self.session.commit()

            print(
                f"Pipeline completed for {processed} brands in {elapsed_time:.2f}s"
            )

            return job

        except Exception as e:
            print(f"Pipeline error: {e}")
            job.status = "failed"
            job.completed_at = datetime.utcnow()
            self.session.add(job)
            self.session.commit()
            raise

    def get_job_status(self, job_id: int) -> Optional[ScraperJob]:
        """Get status of a scraper job."""
        return self.session.get(ScraperJob, job_id)

    def get_recent_jobs(self, limit: int = 10) -> List[ScraperJob]:
        """Get recent scraper jobs."""
        return self.session.exec(
            select(ScraperJob).order_by(ScraperJob.created_at.desc()).limit(limit)
        ).all()
