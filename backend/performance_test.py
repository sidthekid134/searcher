"""
Performance testing for the data collection pipeline.
Tests processing of 100 brands within 5 minutes requirement.
"""
import asyncio
import time
from datetime import datetime
from sqlmodel import Session, select
from database import engine
from models import Brand, OwnershipEntry
from pipeline import DataCollectionPipeline


async def generate_test_brands(session: Session, count: int = 100):
    """Generate test brands for performance testing."""
    from models import SourceType, DataQualityStatus

    # Clear existing test data
    session.query(Brand).delete()
    session.commit()

    test_brands_list = [
        f"TestBrand{i} Inc." for i in range(1, count + 1)
    ]

    for i, brand_name in enumerate(test_brands_list, 1):
        brand = Brand(
            name=brand_name,
            primary_owner=f"Parent Company {i}",
            quality_status=DataQualityStatus.COMPLETE,
            created_at=datetime.utcnow(),
            last_updated=datetime.utcnow(),
        )
        session.add(brand)

    session.commit()
    print(f"✓ Generated {count} test brands")


async def run_performance_test(brand_count: int = 100):
    """
    Run performance test for the pipeline.

    Tests the requirement: Pipeline completes for 100 brands within 5 minutes.
    """
    print(f"\n{'='*60}")
    print(f"Performance Test: {brand_count} Brands in < 5 minutes")
    print(f"{'='*60}\n")

    with Session(engine) as session:
        # Generate test data
        print("Generating test brands...")
        await generate_test_brands(session, brand_count)

        # Run pipeline
        print(f"Starting pipeline for {brand_count} brands...\n")
        start_time = time.time()

        pipeline = DataCollectionPipeline(session)
        job = await pipeline.run_full_pipeline(triggered_by="performance_test")

        elapsed_time = time.time() - start_time

        # Print results
        print(f"\n{'='*60}")
        print(f"Test Results:")
        print(f"{'='*60}")
        print(f"Total Time: {elapsed_time:.2f} seconds ({elapsed_time/60:.2f} minutes)")
        print(f"Brands Processed: {job.brands_processed}")
        print(f"Errors: {job.errors_count}")
        print(f"Processing Speed: {job.brands_processed / elapsed_time:.2f} brands/sec")
        print(f"Avg Time per Brand: {elapsed_time / job.brands_processed:.3f} seconds")

        # Performance assessment
        if elapsed_time < 300:  # 5 minutes = 300 seconds
            print(f"\n✓ PASS: Completed {brand_count} brands in {elapsed_time:.2f}s (< 5 minutes)")
        else:
            print(f"\n✗ FAIL: Took {elapsed_time:.2f}s (> 5 minutes)")

        return elapsed_time < 300


if __name__ == "__main__":
    # Run performance test
    success = asyncio.run(run_performance_test(100))
    exit(0 if success else 1)
