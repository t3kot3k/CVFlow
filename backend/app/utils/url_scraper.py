"""URL scraping utilities for job postings."""

import httpx
from bs4 import BeautifulSoup
from typing import Optional


async def scrape_job_posting(url: str) -> dict:
    """Scrape job posting data from a URL."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Extract title
    title = _extract_title(soup)

    # Extract company
    company = _extract_company(soup)

    # Extract location
    location = _extract_location(soup)

    # Extract description
    description = _extract_description(soup)

    return {
        "title": title,
        "company": company,
        "location": location,
        "description": description,
        "requirements": [],
    }


def _extract_title(soup: BeautifulSoup) -> Optional[str]:
    """Try to extract job title from various selectors."""
    selectors = [
        "h1.job-title",
        "h1.topcard__title",
        "h1[data-testid='jobTitle']",
        ".job-title",
        "h1",
    ]
    for sel in selectors:
        el = soup.select_one(sel)
        if el and el.get_text(strip=True):
            return el.get_text(strip=True)
    return None


def _extract_company(soup: BeautifulSoup) -> Optional[str]:
    """Try to extract company name."""
    selectors = [
        ".company-name",
        ".topcard__org-name-link",
        "[data-testid='companyName']",
        ".employer-name",
    ]
    for sel in selectors:
        el = soup.select_one(sel)
        if el and el.get_text(strip=True):
            return el.get_text(strip=True)
    return None


def _extract_location(soup: BeautifulSoup) -> Optional[str]:
    """Try to extract job location."""
    selectors = [
        ".job-location",
        ".topcard__flavor--bullet",
        "[data-testid='location']",
        ".location",
    ]
    for sel in selectors:
        el = soup.select_one(sel)
        if el and el.get_text(strip=True):
            return el.get_text(strip=True)
    return None


def _extract_description(soup: BeautifulSoup) -> str:
    """Try to extract job description."""
    selectors = [
        ".job-description",
        ".description__text",
        "[data-testid='jobDescription']",
        ".jobsearch-jobDescriptionText",
        "#job-details",
        "article",
    ]
    for sel in selectors:
        el = soup.select_one(sel)
        if el and el.get_text(strip=True):
            return el.get_text(strip=True)

    # Fallback: get body text
    body = soup.find("body")
    if body:
        return body.get_text(strip=True)[:5000]
    return ""
