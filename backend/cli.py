"""
CLI utility for managing the data collection pipeline.
Provides command-line interface for admin operations and database management.
"""
import asyncio
import sys
from datetime import datetime
from typing import Optional
from sqlmodel import Session, select
from database import engine, init_db
from models import Brand, ScraperJob
from pipeline import DataCollectionPipeline
from seed_data import seed_brands


def print_banner():
    """Print application banner."""
    print("\n" + "="*60)
    print("  Searcher - Data Collection Pipeline")
    print("="*60 + "\n")


def init_database():
    """Initialize the database."""
    print("📊 Initializing database...")
    try:
        init_db()
        print("✓ Database initialized successfully\n")
    except Exception as e:
        print(f"✗ Failed to initialize database: {e}\n")
        return False
    return True


def seed_sample_data():
    """Seed database with sample brands."""
    print("🌱 Seeding sample data...")
    try:
        seed_brands()
        print("✓ Sample data seeded successfully\n")
    except Exception as e:
        print(f"✗ Failed to seed data: {e}\n")
        return False
    return True


async def trigger_full_pipeline():
    """Trigger the full data collection pipeline."""
    print("🚀 Triggering full pipeline...\n")

    with Session(engine) as session:
        try:
            pipeline = DataCollectionPipeline(session)
            job = await pipeline.run_full_pipeline(triggered_by="cli")

            print(f"✓ Pipeline completed!")
            print(f"  - Job ID: {job.id}")
            print(f"  - Status: {job.status}")
            print(f"  - Brands Processed: {job.brands_processed}/{job.brands_total}")
            print(f"  - Errors: {job.errors_count}")
            print(f"  - Started: {job.started_at}")
            print(f"  - Completed: {job.completed_at}\n")

            return True
        except Exception as e:
            print(f"✗ Pipeline failed: {e}\n")
            return False


async def trigger_pipeline_for_brands(brand_names: list):
    """Trigger pipeline for specific brands."""
    print(f"🚀 Triggering pipeline for {len(brand_names)} brands...\n")

    with Session(engine) as session:
        try:
            pipeline = DataCollectionPipeline(session)
            job = await pipeline.run_pipeline_for_brands(brand_names, triggered_by="cli")

            print(f"✓ Pipeline completed!")
            print(f"  - Job ID: {job.id}")
            print(f"  - Status: {job.status}")
            print(f"  - Brands Processed: {job.brands_processed}/{job.brands_total}")
            print(f"  - Errors: {job.errors_count}\n")

            return True
        except Exception as e:
            print(f"✗ Pipeline failed: {e}\n")
            return False


def show_brand_count():
    """Show total number of brands in database."""
    with Session(engine) as session:
        count = len(session.exec(select(Brand)).all())
        print(f"📈 Total Brands: {count}\n")


def show_job_history(limit: int = 10):
    """Show recent pipeline jobs."""
    with Session(engine) as session:
        jobs = session.exec(
            select(ScraperJob).order_by(ScraperJob.created_at.desc()).limit(limit)
        ).all()

        if not jobs:
            print("No pipeline jobs found.\n")
            return

        print("📋 Recent Pipeline Jobs:\n")
        print(f"{'ID':<4} {'Status':<10} {'Processed':<12} {'Errors':<8} {'Created':<20}")
        print("-" * 54)

        for job in jobs:
            created = job.created_at.strftime("%Y-%m-%d %H:%M:%S") if job.created_at else "N/A"
            print(f"{job.id:<4} {job.status:<10} {job.brands_processed}/{job.brands_total:<10} {job.errors_count:<8} {created:<20}")

        print()


def list_brands():
    """List all brands in database."""
    with Session(engine) as session:
        brands = session.exec(select(Brand).order_by(Brand.name)).all()

        if not brands:
            print("No brands found.\n")
            return

        print(f"📚 Brands ({len(brands)}):\n")
        print(f"{'ID':<4} {'Name':<30} {'Owner':<30} {'Status':<15}")
        print("-" * 79)

        for brand in brands:
            owner = brand.primary_owner or "Unknown"
            status = brand.quality_status
            print(f"{brand.id:<4} {brand.name:<30} {owner:<30} {status:<15}")

        print()


def show_help():
    """Show help message."""
    help_text = """
Usage: python cli.py <command> [options]

Commands:
  init              Initialize database tables
  seed              Seed database with sample brands
  run               Trigger full pipeline
  run-brands        Trigger pipeline for specific brands
                    Usage: python cli.py run-brands "Brand1" "Brand2" ...
  status            Show database status
  jobs              Show recent pipeline jobs
  list              List all brands
  help              Show this help message

Examples:
  python cli.py init
  python cli.py seed
  python cli.py run
  python cli.py run-brands "Pepsi" "TikTok" "Burger King"
  python cli.py status
  python cli.py jobs
  python cli.py list
"""
    print(help_text)


def main():
    """Main CLI entry point."""
    print_banner()

    if len(sys.argv) < 2:
        show_help()
        return

    command = sys.argv[1]

    if command == "init":
        init_database()

    elif command == "seed":
        if init_database():
            seed_sample_data()

    elif command == "run":
        asyncio.run(trigger_full_pipeline())

    elif command == "run-brands":
        if len(sys.argv) < 3:
            print("✗ Please specify brand names\n")
            print("Usage: python cli.py run-brands 'Brand1' 'Brand2' ...\n")
            return
        brand_names = sys.argv[2:]
        asyncio.run(trigger_pipeline_for_brands(brand_names))

    elif command == "status":
        show_brand_count()

    elif command == "jobs":
        show_job_history()

    elif command == "list":
        list_brands()

    elif command == "help" or command == "--help" or command == "-h":
        show_help()

    else:
        print(f"✗ Unknown command: {command}\n")
        show_help()


if __name__ == "__main__":
    main()
