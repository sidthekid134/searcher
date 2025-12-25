"""
Seed database with sample brands for testing and development.
"""
from datetime import datetime
from sqlmodel import Session
from database import engine, get_session
from models import Brand, OwnershipEntry, SourceType, DataQualityStatus
import sqlmodel


def seed_brands():
    """Seed database with sample brands."""

    # Sample brands data
    brands_data = [
        {
            "name": "Pepsi",
            "primary_owner": "PepsiCo Inc.",
            "quality_status": DataQualityStatus.COMPLETE,
            "ownership": [
                {
                    "owner_name": "PepsiCo Inc.",
                    "owner_type": "parent_company",
                    "hierarchy_level": 0,
                    "source_type": SourceType.SEC_FILING,
                    "source_url": "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000078003",
                    "confidence_score": 0.95,
                }
            ],
        },
        {
            "name": "Tropicana",
            "primary_owner": "PepsiCo Inc.",
            "quality_status": DataQualityStatus.COMPLETE,
            "ownership": [
                {
                    "owner_name": "PepsiCo Inc.",
                    "owner_type": "parent_company",
                    "hierarchy_level": 0,
                    "source_type": SourceType.COMPANY_WEBSITE,
                    "source_url": "https://www.tropicana.com/about",
                    "confidence_score": 0.90,
                }
            ],
        },
        {
            "name": "TikTok",
            "primary_owner": "ByteDance Ltd.",
            "quality_status": DataQualityStatus.OWNERSHIP_DISPUTED,
            "ownership": [
                {
                    "owner_name": "ByteDance Ltd.",
                    "owner_type": "parent_company",
                    "hierarchy_level": 0,
                    "source_type": SourceType.NEWS,
                    "source_url": "https://www.bytedance.com",
                    "confidence_score": 0.80,
                },
                {
                    "owner_name": "Sequoia Capital (disputed ownership)",
                    "owner_type": "parent_company",
                    "hierarchy_level": 0,
                    "source_type": SourceType.BUSINESS_DATABASE,
                    "source_url": "https://www.crunchbase.com/organization/tiktok",
                    "confidence_score": 0.60,
                },
            ],
        },
        {
            "name": "Snapchat",
            "primary_owner": "Snap Inc.",
            "quality_status": DataQualityStatus.INCOMPLETE_DATA,
            "ownership": [
                {
                    "owner_name": "Snap Inc.",
                    "owner_type": "parent_company",
                    "hierarchy_level": 0,
                    "source_type": SourceType.COMPANY_WEBSITE,
                    "source_url": "https://snap.com/en-US/about",
                    "confidence_score": 1.0,
                }
            ],
        },
        {
            "name": "Burger King",
            "primary_owner": "Restaurant Brands International",
            "quality_status": DataQualityStatus.COMPLETE,
            "ownership": [
                {
                    "owner_name": "Restaurant Brands International",
                    "owner_type": "parent_company",
                    "hierarchy_level": 0,
                    "source_type": SourceType.SEC_FILING,
                    "source_url": "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001492753",
                    "confidence_score": 0.95,
                },
                {
                    "owner_name": "3G Capital",
                    "owner_type": "pe_firm",
                    "hierarchy_level": 1,
                    "source_type": SourceType.BUSINESS_DATABASE,
                    "source_url": "https://www.3gcapital.com",
                    "confidence_score": 0.90,
                },
            ],
        },
        {
            "name": "Dunkin'",
            "primary_owner": "Dunkin Donuts",
            "quality_status": DataQualityStatus.COMPLETE,
            "ownership": [
                {
                    "owner_name": "Dunkin Donuts",
                    "owner_type": "parent_company",
                    "hierarchy_level": 0,
                    "source_type": SourceType.COMPANY_WEBSITE,
                    "source_url": "https://www.dunkindonuts.com",
                    "confidence_score": 0.95,
                },
                {
                    "owner_name": "Inspire Brands",
                    "owner_type": "parent_company",
                    "hierarchy_level": 1,
                    "source_type": SourceType.SEC_FILING,
                    "source_url": "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001864720",
                    "confidence_score": 0.90,
                },
            ],
        },
        {
            "name": "Whole Foods Market",
            "primary_owner": "Amazon.com Inc.",
            "quality_status": DataQualityStatus.COMPLETE,
            "ownership": [
                {
                    "owner_name": "Amazon.com Inc.",
                    "owner_type": "parent_company",
                    "hierarchy_level": 0,
                    "source_type": SourceType.SEC_FILING,
                    "source_url": "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001018724",
                    "confidence_score": 1.0,
                }
            ],
        },
        {
            "name": "Domino's Pizza",
            "primary_owner": "Domino's Pizza Inc.",
            "quality_status": DataQualityStatus.COMPLETE,
            "ownership": [
                {
                    "owner_name": "Domino's Pizza Inc.",
                    "owner_type": "parent_company",
                    "hierarchy_level": 0,
                    "source_type": SourceType.SEC_FILING,
                    "source_url": "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001313449",
                    "confidence_score": 0.95,
                }
            ],
        },
        {
            "name": "Airbnb",
            "primary_owner": "Airbnb Inc.",
            "quality_status": DataQualityStatus.COMPLETE,
            "ownership": [
                {
                    "owner_name": "Airbnb Inc.",
                    "owner_type": "parent_company",
                    "hierarchy_level": 0,
                    "source_type": SourceType.SEC_FILING,
                    "source_url": "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001616707",
                    "confidence_score": 1.0,
                }
            ],
        },
        {
            "name": "Skittles",
            "primary_owner": "Mars Incorporated",
            "quality_status": DataQualityStatus.COMPLETE,
            "ownership": [
                {
                    "owner_name": "Mars Incorporated",
                    "owner_type": "parent_company",
                    "hierarchy_level": 0,
                    "source_type": SourceType.BUSINESS_DATABASE,
                    "source_url": "https://www.mars.com",
                    "confidence_score": 0.90,
                }
            ],
        },
    ]

    with Session(engine) as session:
        # Clear existing data
        session.query(Brand).delete()
        session.commit()

        # Create brands
        for brand_data in brands_data:
            brand = Brand(
                name=brand_data["name"],
                primary_owner=brand_data["primary_owner"],
                quality_status=brand_data["quality_status"],
                last_updated=datetime.utcnow(),
                created_at=datetime.utcnow(),
            )
            session.add(brand)
            session.flush()  # Get the brand ID

            # Add ownership entries
            for ownership in brand_data["ownership"]:
                entry = OwnershipEntry(
                    brand_id=brand.id,
                    owner_name=ownership["owner_name"],
                    owner_type=ownership["owner_type"],
                    hierarchy_level=ownership["hierarchy_level"],
                    source_url=ownership["source_url"],
                    source_type=ownership["source_type"],
                    confidence_score=ownership["confidence_score"],
                    collection_date=datetime.utcnow(),
                )
                session.add(entry)

        session.commit()
        print(f"✓ Seeded {len(brands_data)} brands successfully")


if __name__ == "__main__":
    from database import init_db

    init_db()
    seed_brands()
