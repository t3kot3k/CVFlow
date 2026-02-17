"""Market intelligence service with salary data.

This service provides salary data, skills demand, and market insights.
Initially uses curated static data, will integrate external APIs later.
"""

from typing import Optional

# Curated salary data by role and country (annual, in local currency equivalent)
SALARY_DATA = {
    "software_engineer": {
        "france": {"min": 35000, "max": 72000, "median": 48000, "p25": 40000, "p75": 60000, "currency": "EUR"},
        "usa": {"min": 70000, "max": 180000, "median": 120000, "p25": 90000, "p75": 150000, "currency": "USD"},
        "senegal": {"min": 3600000, "max": 12000000, "median": 6000000, "p25": 4800000, "p75": 9000000, "currency": "XOF"},
        "morocco": {"min": 84000, "max": 300000, "median": 168000, "p25": 120000, "p75": 240000, "currency": "MAD"},
        "canada": {"min": 60000, "max": 150000, "median": 95000, "p25": 75000, "p75": 120000, "currency": "CAD"},
        "germany": {"min": 45000, "max": 90000, "median": 62000, "p25": 52000, "p75": 75000, "currency": "EUR"},
        "uk": {"min": 35000, "max": 85000, "median": 55000, "p25": 42000, "p75": 70000, "currency": "GBP"},
        "india": {"min": 400000, "max": 3000000, "median": 1200000, "p25": 700000, "p75": 2000000, "currency": "INR"},
    },
    "marketing_manager": {
        "france": {"min": 32000, "max": 65000, "median": 45000, "p25": 38000, "p75": 55000, "currency": "EUR"},
        "usa": {"min": 55000, "max": 140000, "median": 90000, "p25": 70000, "p75": 115000, "currency": "USD"},
        "senegal": {"min": 3000000, "max": 9000000, "median": 5400000, "p25": 4200000, "p75": 7200000, "currency": "XOF"},
        "morocco": {"min": 72000, "max": 216000, "median": 144000, "p25": 108000, "p75": 180000, "currency": "MAD"},
    },
    "data_analyst": {
        "france": {"min": 30000, "max": 58000, "median": 42000, "p25": 35000, "p75": 50000, "currency": "EUR"},
        "usa": {"min": 55000, "max": 130000, "median": 85000, "p25": 65000, "p75": 105000, "currency": "USD"},
        "senegal": {"min": 2400000, "max": 8400000, "median": 4800000, "p25": 3600000, "p75": 6600000, "currency": "XOF"},
    },
}

# Skills demand by role
SKILLS_DEMAND = {
    "software_engineer": [
        {"name": "Python", "demand": 85},
        {"name": "JavaScript", "demand": 82},
        {"name": "React", "demand": 75},
        {"name": "TypeScript", "demand": 72},
        {"name": "AWS", "demand": 68},
        {"name": "Docker", "demand": 65},
        {"name": "SQL", "demand": 63},
        {"name": "Git", "demand": 60},
        {"name": "Node.js", "demand": 58},
        {"name": "Kubernetes", "demand": 50},
    ],
    "marketing_manager": [
        {"name": "Google Analytics", "demand": 82},
        {"name": "SEO", "demand": 78},
        {"name": "Content Strategy", "demand": 75},
        {"name": "Social Media", "demand": 72},
        {"name": "HubSpot", "demand": 65},
        {"name": "A/B Testing", "demand": 60},
        {"name": "Growth Marketing", "demand": 58},
        {"name": "Tableau", "demand": 52},
    ],
    "data_analyst": [
        {"name": "SQL", "demand": 90},
        {"name": "Python", "demand": 82},
        {"name": "Excel", "demand": 78},
        {"name": "Tableau", "demand": 72},
        {"name": "Power BI", "demand": 68},
        {"name": "Statistics", "demand": 65},
        {"name": "R", "demand": 55},
        {"name": "Machine Learning", "demand": 50},
    ],
}


def _normalize_role(role: str) -> str:
    """Normalize role name for lookup."""
    return role.lower().replace(" ", "_").replace("-", "_")


def _normalize_country(country: str) -> str:
    """Normalize country name for lookup."""
    return country.lower().replace(" ", "_")


async def get_salary_data(role: str, country: str, city: Optional[str] = None, experience: Optional[str] = None) -> dict:
    """Get salary data for a role in a country."""
    norm_role = _normalize_role(role)
    norm_country = _normalize_country(country)

    role_data = SALARY_DATA.get(norm_role, {})
    country_data = role_data.get(norm_country)

    if not country_data:
        return {
            "min_salary": 0, "max_salary": 0, "median": 0,
            "p25": 0, "p75": 0, "currency": "USD",
            "message": "No data available for this role/country combination",
        }

    # Adjust by experience level
    multiplier = 1.0
    if experience == "junior":
        multiplier = 0.75
    elif experience == "senior":
        multiplier = 1.35
    elif experience == "lead":
        multiplier = 1.6

    return {
        "min_salary": int(country_data["min"] * multiplier),
        "max_salary": int(country_data["max"] * multiplier),
        "median": int(country_data["median"] * multiplier),
        "p25": int(country_data["p25"] * multiplier),
        "p75": int(country_data["p75"] * multiplier),
        "currency": country_data["currency"],
    }


async def get_skills_demand(role: str, country: Optional[str] = None) -> list:
    """Get skills demand data for a role."""
    norm_role = _normalize_role(role)
    return SKILLS_DEMAND.get(norm_role, [])


async def get_competition_data(role: str, country: str) -> dict:
    """Get competition data for a role in a country."""
    # Placeholder data — will integrate real APIs later
    return {
        "competition_pct": 68,
        "avg_applications": 187,
        "top_pct_interviews": 15,
    }


async def get_country_comparison(role: str) -> list:
    """Get salary comparison across countries for a role."""
    norm_role = _normalize_role(role)
    role_data = SALARY_DATA.get(norm_role, {})

    results = []
    for country, data in role_data.items():
        results.append({
            "name": country.replace("_", " ").title(),
            "salary": f"{data['median']:,} {data['currency']}",
            "demand": "High",
            "cost_adjusted": f"{data['median']:,} {data['currency']}",
            "tip": f"Average salary for {role} in {country.replace('_', ' ').title()}",
        })

    return results


async def get_personalized_insights(role: str, country: str, skills: list) -> list:
    """Get personalized market insights."""
    return [
        {
            "title": "Salary Negotiation",
            "description": f"Adding 2-3 in-demand skills could increase your salary by 15-20% in {country}.",
            "category": "salary",
        },
        {
            "title": "Best Time to Apply",
            "description": "January and September see the highest hiring activity for this role.",
            "category": "timing",
        },
        {
            "title": "Market Growth",
            "description": f"Demand for {role} roles has grown 23% year-over-year.",
            "category": "opportunity",
        },
    ]
