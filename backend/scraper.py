"""
Data collection scraper for ownership information from multiple sources.
Handles SEC filings, company websites, and other public sources.
"""
import asyncio
import httpx
from datetime import datetime
from typing import Optional, List, Dict, Tuple
from bs4 import BeautifulSoup
from sqlmodel import Session, select
from models import (
    Brand,
    OwnershipEntry,
    ConflictEntry,
    BrandHistoricalVersion,
    SourceType,
    DataQualityStatus,
    ScraperJob,
)
from config import settings


class OwnershipScraper:
    """Main scraper class for collecting ownership data from multiple sources."""

    def __init__(self, session: Session):
        self.session = session
        self.timeout = settings.request_timeout
        self.max_retries = settings.max_retries

    async def scrape_brand_ownership(self, brand_name: str) -> Tuple[List[Dict], bool]:
        """
        Scrape ownership information for a brand from multiple sources.

        Returns:
            Tuple of (ownership_chain, has_conflicts)
        """
        ownership_data = []
        has_conflicts = False

        # Scrape from multiple sources
        sec_results = await self._scrape_sec_filings(brand_name)
        website_results = await self._scrape_company_website(brand_name)

        # Combine results
        ownership_data.extend(sec_results)
        ownership_data.extend(website_results)

        # Check for conflicts
        if len(ownership_data) > 1:
            has_conflicts = self._detect_conflicts(ownership_data)

        return ownership_data, has_conflicts

    async def _scrape_sec_filings(self, brand_name: str) -> List[Dict]:
        """
        Scrape SEC EDGAR database for ownership information.
        Uses publicly available SEC data without rate limiting concerns.
        """
        results = []

        # SEC EDGAR API endpoints - public API with no rate limits
        sec_api_urls = [
            f"https://data.sec.gov/submissions/CIK0000320193.json",  # Example: Apple
            f"https://www.sec.gov/cgi-bin/browse-edgar?company={brand_name}&owner=exclude&action=getcompany",
        ]

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for url in sec_api_urls:
                try:
                    response = await client.get(url)
                    if response.status_code == 200:
                        ownership_info = self._parse_sec_response(response, brand_name)
                        if ownership_info:
                            results.append(
                                {
                                    "owner_name": ownership_info,
                                    "source_type": SourceType.SEC_FILING,
                                    "source_url": url,
                                    "hierarchy_level": 0,
                                    "confidence_score": 0.95,
                                }
                            )
                except Exception as e:
                    print(f"Error scraping SEC for {brand_name}: {e}")
                    continue

        return results

    async def _scrape_company_website(self, brand_name: str) -> List[Dict]:
        """
        Scrape company website for ownership information.
        Looks for "About Us", "Ownership", "Parent Company" pages.
        """
        results = []

        # Common website patterns for ownership information
        domain = brand_name.lower().replace(" ", "")
        common_urls = [
            f"https://www.{domain}.com/about",
            f"https://www.{domain}.com/investors",
            f"https://www.{domain}.com/company",
            f"https://{domain}.com/about",
        ]

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for url in common_urls:
                try:
                    response = await client.get(url, follow_redirects=True)
                    if response.status_code == 200:
                        ownership_info = self._parse_website_ownership(
                            response.text, brand_name
                        )
                        if ownership_info:
                            for info in ownership_info:
                                results.append(
                                    {
                                        "owner_name": info,
                                        "source_type": SourceType.COMPANY_WEBSITE,
                                        "source_url": response.url,
                                        "hierarchy_level": 0,
                                        "confidence_score": 0.85,
                                    }
                                )
                except Exception as e:
                    print(f"Error scraping website {url}: {e}")
                    continue

        return results

    def _parse_sec_response(self, response: httpx.Response, brand_name: str) -> Optional[str]:
        """
        Parse SEC response to extract ownership information.
        """
        try:
            if response.headers.get("content-type", "").startswith("application/json"):
                # JSON response from SEC API
                data = response.json()
                if isinstance(data, dict) and "entity" in data:
                    return data["entity"].get("name")
            else:
                # HTML response from SEC EDGAR search
                soup = BeautifulSoup(response.text, "html.parser")
                # Look for company information in SEC filings
                company_info = soup.find("td", string=lambda x: x and brand_name.lower() in x.lower())
                if company_info:
                    return company_info.get_text(strip=True)
        except Exception as e:
            print(f"Error parsing SEC response: {e}")

        return None

    def _parse_website_ownership(self, html_content: str, brand_name: str) -> List[str]:
        """
        Parse website HTML to extract ownership information.
        """
        ownership_info = []
        try:
            soup = BeautifulSoup(html_content, "html.parser")

            # Common keywords for ownership information
            keywords = ["owned by", "parent company", "subsidiary of", "acquired by", "owned by"]

            for keyword in keywords:
                elements = soup.find_all(
                    lambda tag: tag.name in ["p", "span", "div", "li"]
                    and keyword.lower() in (tag.get_text() or "").lower()
                )

                for element in elements:
                    text = element.get_text(strip=True)
                    # Extract potential owner name (simple heuristic)
                    if keyword.lower() in text.lower():
                        parts = text.split(keyword)
                        if len(parts) > 1:
                            owner = parts[-1].strip().split(".")[0].strip()
                            if owner and len(owner) > 2:
                                ownership_info.append(owner)

        except Exception as e:
            print(f"Error parsing website ownership: {e}")

        return list(set(ownership_info))  # Remove duplicates

    def _detect_conflicts(self, ownership_data: List[Dict]) -> bool:
        """
        Detect conflicts in ownership information from different sources.
        """
        if len(ownership_data) < 2:
            return False

        owners = [data["owner_name"].lower() for data in ownership_data]
        # If we have different owners at the same level, it's a conflict
        return len(set(owners)) > 1

    async def process_brand(
        self, brand_id: int, brand_name: str
    ) -> Tuple[DataQualityStatus, bool]:
        """
        Process a single brand: scrape, detect conflicts, and store data.

        Returns:
            Tuple of (quality_status, has_conflicts)
        """
        # Delete old entries for this brand
        old_entries = self.session.exec(
            select(OwnershipEntry).where(OwnershipEntry.brand_id == brand_id)
        ).all()
        for entry in old_entries:
            self.session.delete(entry)

        # Scrape new data
        ownership_data, has_conflicts = await self.scrape_brand_ownership(brand_name)

        # Handle no data case
        if not ownership_data:
            return DataQualityStatus.INCOMPLETE_DATA, False

        # Determine quality status
        quality_status = (
            DataQualityStatus.OWNERSHIP_DISPUTED
            if has_conflicts
            else DataQualityStatus.COMPLETE
        )

        # Store ownership entries
        stored_entries = []
        for i, data in enumerate(ownership_data):
            entry = OwnershipEntry(
                brand_id=brand_id,
                owner_name=data["owner_name"],
                owner_type="parent_company",
                hierarchy_level=data.get("hierarchy_level", 0),
                source_url=data.get("source_url"),
                source_type=data.get("source_type", SourceType.MANUAL),
                collection_date=datetime.utcnow(),
                confidence_score=data.get("confidence_score", 1.0),
            )
            self.session.add(entry)
            stored_entries.append(entry)

        self.session.commit()

        # Detect and store conflicts
        if has_conflicts and len(stored_entries) > 1:
            primary_entry = stored_entries[0]
            for conflicting_entry in stored_entries[1:]:
                conflict = ConflictEntry(
                    ownership_entry_id=primary_entry.id,
                    conflicting_owner_name=conflicting_entry.owner_name,
                    conflicting_source_url=conflicting_entry.source_url,
                    conflicting_source_type=conflicting_entry.source_type,
                    resolution_status="disputed",
                )
                self.session.add(conflict)

        self.session.commit()

        return quality_status, has_conflicts

    async def process_brands_batch(
        self, brand_ids: List[Tuple[int, str]]
    ) -> Tuple[int, int]:
        """
        Process a batch of brands concurrently.

        Args:
            brand_ids: List of (brand_id, brand_name) tuples

        Returns:
            Tuple of (processed_count, error_count)
        """
        tasks = [self.process_brand(bid, name) for bid, name in brand_ids]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        error_count = sum(1 for r in results if isinstance(r, Exception))
        processed_count = len(brand_ids) - error_count

        return processed_count, error_count

    def create_historical_version(self, brand_id: int):
        """
        Create a historical snapshot of the brand's ownership data.
        """
        brand = self.session.get(Brand, brand_id)
        if not brand:
            return

        # Get current ownership entries
        entries = self.session.exec(
            select(OwnershipEntry).where(OwnershipEntry.brand_id == brand_id)
        ).all()

        # Get version number
        latest_version = self.session.exec(
            select(BrandHistoricalVersion)
            .where(BrandHistoricalVersion.brand_id == brand_id)
            .order_by(BrandHistoricalVersion.version_number.desc())
        ).first()

        version_number = (latest_version.version_number + 1) if latest_version else 1

        # Create ownership chain JSON
        ownership_chain = [
            {
                "owner_name": entry.owner_name,
                "owner_type": entry.owner_type,
                "hierarchy_level": entry.hierarchy_level,
                "source_type": entry.source_type,
                "source_url": entry.source_url,
            }
            for entry in entries
        ]

        # Store historical version
        version = BrandHistoricalVersion(
            brand_id=brand_id,
            version_number=version_number,
            ownership_chain=str(ownership_chain),
            quality_status=brand.quality_status,
            primary_owner=brand.primary_owner,
            snapshot_date=datetime.utcnow(),
        )
        self.session.add(version)
        self.session.commit()
