"""
src/company_data.py
Hardcoded database of 14 representative Indian campus-recruiting companies
across 3 tiers: Top Product, Mid Product/Unicorn, Service.

Schema for each company:
{
  "name", "tier" (1|2|3), "tier_label", "domain",
  "min_cgpa", "max_backlogs", "min_dsa", "min_aptitude",
  "preferred_branches", "ctc_range", "hiring_difficulty",
  "hiring_format", "key_skills", "prep_weeks", "tips"
}
"""

COMPANY_DB = {
    # ── Tier 1: Top Product ───────────────────────────────────────────
    "Google": {
        "name": "Google",
        "tier": 1, "tier_label": "Top Product",
        "domain": "Software / Cloud / AI",
        "min_cgpa": 8.0, "max_backlogs": 0,
        "min_dsa": 80, "min_aptitude": 75,
        "preferred_branches": ["CSE", "IT", "ECE"],
        "ctc_range": "₹25-50 LPA",
        "hiring_difficulty": "Very Hard",
        "hiring_format": "Online assessment → 4-5 rounds (DSA + System Design + Behavioral)",
        "key_skills": ["Advanced DSA", "System Design", "Coding Speed", "Problem Solving"],
        "prep_weeks": 24,
        "tips": [
            "Solve 300+ LeetCode problems (focus on Mediums/Hards)",
            "Master graphs, DP, and trees — they appear in 60% of rounds",
            "Read 'Designing Data-Intensive Applications' for system design",
            "Practice mock interviews on Pramp/Interviewing.io",
        ],
    },
    "Microsoft": {
        "name": "Microsoft",
        "tier": 1, "tier_label": "Top Product",
        "domain": "Software / Cloud / Productivity",
        "min_cgpa": 7.5, "max_backlogs": 0,
        "min_dsa": 75, "min_aptitude": 70,
        "preferred_branches": ["CSE", "IT", "ECE"],
        "ctc_range": "₹20-45 LPA",
        "hiring_difficulty": "Very Hard",
        "hiring_format": "OA → 3-4 technical + 1 HR round",
        "key_skills": ["DSA", "OOP", "System Design", "C#/Java/Python"],
        "prep_weeks": 20,
        "tips": [
            "Strong fundamentals in OOP and OS concepts",
            "Solve Microsoft-tagged questions on LeetCode",
            "Practice low-level design (parking lot, splitwise, etc.)",
            "Be ready to explain past projects deeply",
        ],
    },
    "Amazon": {
        "name": "Amazon",
        "tier": 1, "tier_label": "Top Product",
        "domain": "E-commerce / AWS / Devices",
        "min_cgpa": 7.0, "max_backlogs": 1,
        "min_dsa": 70, "min_aptitude": 65,
        "preferred_branches": ["CSE", "IT", "ECE"],
        "ctc_range": "₹18-42 LPA",
        "hiring_difficulty": "Hard",
        "hiring_format": "OA → 2-3 DSA rounds → Bar Raiser (Leadership Principles)",
        "key_skills": ["DSA", "Leadership Principles", "System Design", "Behavioral"],
        "prep_weeks": 16,
        "tips": [
            "Memorize 16 Leadership Principles + STAR stories for each",
            "Focus on Trees, Graphs, DP for DSA rounds",
            "Bar Raiser is the toughest — prepare 8-10 STAR stories",
            "Practice Amazon-tagged LeetCode questions",
        ],
    },
    "Adobe": {
        "name": "Adobe",
        "tier": 1, "tier_label": "Top Product",
        "domain": "Creative Software / Cloud",
        "min_cgpa": 7.5, "max_backlogs": 0,
        "min_dsa": 70, "min_aptitude": 70,
        "preferred_branches": ["CSE", "IT"],
        "ctc_range": "₹18-32 LPA",
        "hiring_difficulty": "Hard",
        "hiring_format": "OA → 2 technical + 1 HR",
        "key_skills": ["DSA", "OOP", "JavaScript/Python", "Project Depth"],
        "prep_weeks": 14,
        "tips": [
            "Strong project portfolio with creative/UI flair helps",
            "Brush up on DBMS and OOP fundamentals",
            "Practice array and string heavy problems",
        ],
    },

    # ── Tier 2: Mid Product / Unicorn ─────────────────────────────────
    "Flipkart": {
        "name": "Flipkart",
        "tier": 2, "tier_label": "Mid Product / Unicorn",
        "domain": "E-commerce",
        "min_cgpa": 7.0, "max_backlogs": 1,
        "min_dsa": 65, "min_aptitude": 60,
        "preferred_branches": ["CSE", "IT", "ECE"],
        "ctc_range": "₹15-32 LPA",
        "hiring_difficulty": "Hard",
        "hiring_format": "OA → 2-3 DSA + 1 HR",
        "key_skills": ["DSA", "System Design", "Java/Python"],
        "prep_weeks": 14,
        "tips": [
            "Practice scalability questions",
            "Focus on Hashing, Trees, DP",
            "Be confident about your top 2 projects",
        ],
    },
    "Swiggy": {
        "name": "Swiggy",
        "tier": 2, "tier_label": "Mid Product / Unicorn",
        "domain": "Food-tech / Logistics",
        "min_cgpa": 7.0, "max_backlogs": 1,
        "min_dsa": 60, "min_aptitude": 60,
        "preferred_branches": ["CSE", "IT", "ECE", "MECH"],
        "ctc_range": "₹12-28 LPA",
        "hiring_difficulty": "Medium",
        "hiring_format": "OA → 2 technical + HR",
        "key_skills": ["DSA", "DBMS", "REST APIs"],
        "prep_weeks": 12,
        "tips": [
            "Focus on real-world system design (delivery, matching)",
            "Practice SQL queries — appear often",
            "Communicate trade-offs clearly",
        ],
    },
    "Zomato": {
        "name": "Zomato",
        "tier": 2, "tier_label": "Mid Product / Unicorn",
        "domain": "Food-tech",
        "min_cgpa": 6.5, "max_backlogs": 2,
        "min_dsa": 55, "min_aptitude": 55,
        "preferred_branches": ["CSE", "IT", "ECE"],
        "ctc_range": "₹10-22 LPA",
        "hiring_difficulty": "Medium",
        "hiring_format": "OA → 1-2 technical + HR",
        "key_skills": ["DSA", "DBMS", "Web Dev"],
        "prep_weeks": 10,
        "tips": [
            "Focus on basic-medium DSA",
            "Have one polished web/mobile project",
            "Be ready to discuss SQL and APIs",
        ],
    },
    "Paytm": {
        "name": "Paytm",
        "tier": 2, "tier_label": "Mid Product / Unicorn",
        "domain": "Fintech",
        "min_cgpa": 6.5, "max_backlogs": 2,
        "min_dsa": 55, "min_aptitude": 55,
        "preferred_branches": ["CSE", "IT", "ECE"],
        "ctc_range": "₹8-20 LPA",
        "hiring_difficulty": "Medium",
        "hiring_format": "OA → 2 technical + HR",
        "key_skills": ["Java", "DSA", "DBMS", "REST APIs"],
        "prep_weeks": 10,
        "tips": [
            "Strong Java fundamentals expected",
            "Database transactions and ACID often asked",
            "Project-based discussions are common",
        ],
    },
    "Razorpay": {
        "name": "Razorpay",
        "tier": 2, "tier_label": "Mid Product / Unicorn",
        "domain": "Fintech / Payments",
        "min_cgpa": 7.0, "max_backlogs": 1,
        "min_dsa": 65, "min_aptitude": 60,
        "preferred_branches": ["CSE", "IT"],
        "ctc_range": "₹14-28 LPA",
        "hiring_difficulty": "Medium-Hard",
        "hiring_format": "OA → 2-3 technical + HR",
        "key_skills": ["DSA", "System Design", "Go/Java", "APIs"],
        "prep_weeks": 12,
        "tips": [
            "Payments domain knowledge helps a lot",
            "Practice low-level design",
            "Strong CS fundamentals required",
        ],
    },

    # ── Tier 3: Service / Mass Recruiters ─────────────────────────────
    "TCS": {
        "name": "TCS",
        "tier": 3, "tier_label": "Service / Mass Recruiter",
        "domain": "IT Services / Consulting",
        "min_cgpa": 6.0, "max_backlogs": 1,
        "min_dsa": 30, "min_aptitude": 50,
        "preferred_branches": ["CSE", "IT", "ECE", "MECH", "CIVIL", "EEE"],
        "ctc_range": "₹3.5-9 LPA (Digital/Ninja/Prime)",
        "hiring_difficulty": "Easy-Medium",
        "hiring_format": "TCS NQT (Aptitude + Coding) → Technical + HR",
        "key_skills": ["Aptitude", "Basic Coding", "Communication"],
        "prep_weeks": 6,
        "tips": [
            "Aptitude is the biggest filter — practice IndiaBix",
            "Basic programming in C/C++/Python is enough",
            "TCS Prime offers ₹9 LPA — aim for it",
        ],
    },
    "Infosys": {
        "name": "Infosys",
        "tier": 3, "tier_label": "Service / Mass Recruiter",
        "domain": "IT Services / Consulting",
        "min_cgpa": 6.0, "max_backlogs": 1,
        "min_dsa": 30, "min_aptitude": 50,
        "preferred_branches": ["CSE", "IT", "ECE", "MECH", "CIVIL", "EEE"],
        "ctc_range": "₹3.6-8 LPA (SE/DSE/Power Programmer)",
        "hiring_difficulty": "Easy-Medium",
        "hiring_format": "InfyTQ → Technical + HR",
        "key_skills": ["Aptitude", "Basic Coding", "Communication"],
        "prep_weeks": 6,
        "tips": [
            "InfyTQ certification gives direct interview shot",
            "Be honest in HR — they value cultural fit",
            "Power Programmer role pays ₹8 LPA",
        ],
    },
    "Wipro": {
        "name": "Wipro",
        "tier": 3, "tier_label": "Service / Mass Recruiter",
        "domain": "IT Services / Consulting",
        "min_cgpa": 6.0, "max_backlogs": 1,
        "min_dsa": 25, "min_aptitude": 45,
        "preferred_branches": ["CSE", "IT", "ECE", "MECH", "CIVIL", "EEE"],
        "ctc_range": "₹3.5-6.5 LPA",
        "hiring_difficulty": "Easy",
        "hiring_format": "Wipro NLTH → Technical + HR",
        "key_skills": ["Aptitude", "Basic Coding", "Communication"],
        "prep_weeks": 5,
        "tips": [
            "NLTH covers aptitude, English, and basic coding",
            "Communication round is taken seriously",
            "Elite NTH role offers higher CTC",
        ],
    },
    "Cognizant": {
        "name": "Cognizant",
        "tier": 3, "tier_label": "Service / Mass Recruiter",
        "domain": "IT Services / Consulting",
        "min_cgpa": 6.0, "max_backlogs": 1,
        "min_dsa": 30, "min_aptitude": 50,
        "preferred_branches": ["CSE", "IT", "ECE", "MECH", "CIVIL", "EEE"],
        "ctc_range": "₹4-7.5 LPA (GenC / GenC Next / GenC Elevate)",
        "hiring_difficulty": "Easy-Medium",
        "hiring_format": "Aptitude + Coding → Technical + HR",
        "key_skills": ["Aptitude", "Basic Coding", "Communication"],
        "prep_weeks": 5,
        "tips": [
            "GenC Elevate role pays ₹7.5 LPA — aim for it",
            "Coding round has 2 problems (Easy-Medium)",
            "HR loves candidates with clarity on career goals",
        ],
    },
    "Accenture": {
        "name": "Accenture",
        "tier": 3, "tier_label": "Service / Mass Recruiter",
        "domain": "IT Consulting",
        "min_cgpa": 6.0, "max_backlogs": 1,
        "min_dsa": 30, "min_aptitude": 50,
        "preferred_branches": ["CSE", "IT", "ECE", "MECH", "CIVIL", "EEE"],
        "ctc_range": "₹4.5-11.5 LPA (ASE / Advanced ASE)",
        "hiring_difficulty": "Easy-Medium",
        "hiring_format": "Cognitive + Technical + Coding → Communication + HR",
        "key_skills": ["Aptitude", "Coding", "Communication"],
        "prep_weeks": 6,
        "tips": [
            "Advanced ASE role pays ₹11.5 LPA",
            "Communication round (writing + speaking) is unique",
            "Practice cognitive ability tests",
        ],
    },
}


def get_all_companies() -> list[dict]:
    """Return a lightweight list of all companies for the /list endpoint."""
    return [
        {
            "name": c["name"],
            "tier": c["tier"],
            "tier_label": c["tier_label"],
            "domain": c["domain"],
            "ctc_range": c["ctc_range"],
            "hiring_difficulty": c["hiring_difficulty"],
        }
        for c in COMPANY_DB.values()
    ]


def get_company(name: str) -> dict | None:
    return COMPANY_DB.get(name)