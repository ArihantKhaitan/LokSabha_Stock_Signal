"""
Lok Sabha debate events — structured mock data based on real sessions and real bills.
Each entry maps a debate to a sector and carries an intensity score (1-10)
and sentiment toward the sector (Positive / Negative / Neutral).

Auto-update: The SESSIONS registry at the bottom drives the scheduler;
add future sessions there and new debate entries will be auto-ingested.
"""
from __future__ import annotations
from datetime import date

# ---------------------------------------------------------------------------
# Core debate events
# ---------------------------------------------------------------------------
DEBATE_EVENTS: list[dict] = [

    # ── Budget Session 2023 (Feb 1 – May 5 2023) ────────────────────────────
    {
        "id": "BS2023-001",
        "session": "Budget Session 2023",
        "date": date(2023, 2, 1),
        "topic": "Union Budget 2023-24 — Pharma PLI Scheme Extension",
        "bill": "Finance Bill 2023",
        "sector": "Pharma",
        "intensity": 8,
        "sentiment": "Positive",
        "hours_debated": 6.5,
        "mps_participated": 42,
        "summary": "FM announced ₹15,000 Cr PLI boost for pharmaceutical manufacturing. "
                   "Heavy debate on CDMO potential and API self-reliance.",
    },
    {
        "id": "BS2023-002",
        "session": "Budget Session 2023",
        "date": date(2023, 2, 1),
        "topic": "Union Budget 2023-24 — Capital Expenditure ₹10 Lakh Crore",
        "bill": "Finance Bill 2023",
        "sector": "Infrastructure",
        "intensity": 10,
        "sentiment": "Positive",
        "hours_debated": 9.0,
        "mps_participated": 68,
        "summary": "Record capex of ₹10 lakh crore allocated. Debate on roads, railways, "
                   "ports. L&T, NCC, PNC Infratech mentioned repeatedly.",
    },
    {
        "id": "BS2023-003",
        "session": "Budget Session 2023",
        "date": date(2023, 2, 2),
        "topic": "Union Budget 2023-24 — Defence Capital Outlay ₹1.62 Lakh Crore",
        "bill": "Finance Bill 2023",
        "sector": "Defence",
        "intensity": 9,
        "sentiment": "Positive",
        "hours_debated": 7.0,
        "mps_participated": 55,
        "summary": "Defence capex at all-time high. Focus on Atmanirbhar Bharat defence, "
                   "HAL fighter jet orders, BEL radar systems, indigenisation targets.",
    },
    {
        "id": "BS2023-004",
        "session": "Budget Session 2023",
        "date": date(2023, 2, 2),
        "topic": "Union Budget 2023-24 — Green Hydrogen Mission ₹19,744 Cr",
        "bill": "Finance Bill 2023",
        "sector": "Energy",
        "intensity": 7,
        "sentiment": "Positive",
        "hours_debated": 5.0,
        "mps_participated": 33,
        "summary": "National Green Hydrogen Mission funded. Debate on NTPC, ONGC pivot to "
                   "renewables, solar cell manufacturing incentives.",
    },
    {
        "id": "BS2023-005",
        "session": "Budget Session 2023",
        "date": date(2023, 2, 7),
        "topic": "Banking Regulation (Amendment) Bill — Urban Cooperative Banks",
        "bill": "Banking Regulation Amendment Bill 2023",
        "sector": "Banking",
        "intensity": 6,
        "sentiment": "Neutral",
        "hours_debated": 4.5,
        "mps_participated": 29,
        "summary": "Debate on RBI oversight of urban co-op banks. Mixed views on impact to "
                   "HDFC Bank, ICICI private sector lending landscape.",
    },
    {
        "id": "BS2023-006",
        "session": "Budget Session 2023",
        "date": date(2023, 2, 9),
        "topic": "PM-KISAN Enhancement and Fertiliser Subsidy Debate",
        "bill": "Agriculture Budget Discussion",
        "sector": "Agriculture",
        "intensity": 7,
        "sentiment": "Positive",
        "hours_debated": 5.5,
        "mps_participated": 48,
        "summary": "PM-KISAN enhanced to ₹8,000/yr floated (not passed). Fertiliser subsidy "
                   "rationalisation debated. UPL, Coromandel highlighted.",
    },
    {
        "id": "BS2023-007",
        "session": "Budget Session 2023",
        "date": date(2023, 2, 15),
        "topic": "Jan Vishwas Act 2023 — Decriminalisation of Business Laws",
        "bill": "Jan Vishwas (Amendment of Provisions) Act 2023",
        "sector": "Pharma",
        "intensity": 6,
        "sentiment": "Positive",
        "hours_debated": 4.0,
        "mps_participated": 31,
        "summary": "Decriminalising 183 provisions across 42 Acts. Pharma industry flagged "
                   "removal of criminal penalties under Drugs & Cosmetics Act.",
    },
    {
        "id": "BS2023-008",
        "session": "Budget Session 2023",
        "date": date(2023, 3, 15),
        "topic": "SBI and PSU Bank Privatisation Debate — Opposition Motion",
        "bill": "Motion — Banking Sector Disinvestment",
        "sector": "Banking",
        "intensity": 8,
        "sentiment": "Negative",
        "hours_debated": 6.0,
        "mps_participated": 52,
        "summary": "Opposition tabled motion against PSU bank privatisation. SBIN, PNB stocks "
                   "volatile. Debate centred on job losses and financial inclusion.",
    },
    {
        "id": "BS2023-009",
        "session": "Budget Session 2023",
        "date": date(2023, 3, 22),
        "topic": "National Data Governance Policy — IT Sector Implications",
        "bill": "National Data Governance Framework Policy",
        "sector": "IT",
        "intensity": 5,
        "sentiment": "Neutral",
        "hours_debated": 3.0,
        "mps_participated": 22,
        "summary": "Policy discussion on government data sharing with tech firms. Mixed reaction "
                   "from TCS, Infosys on compliance cost vs. data access opportunity.",
    },
    {
        "id": "BS2023-010",
        "session": "Budget Session 2023",
        "date": date(2023, 4, 3),
        "topic": "Automobile Industry — EV Transition Policy Debate",
        "bill": "Budget Discussion — EV Policy",
        "sector": "Auto",
        "intensity": 6,
        "sentiment": "Positive",
        "hours_debated": 4.5,
        "mps_participated": 35,
        "summary": "Debate on FAME-III scheme extension, PLI for EV batteries. Maruti EV delay "
                   "questioned. Tata Motors EV market share cited positively.",
    },

    # ── Monsoon Session 2023 (Jul 20 – Aug 11 2023) ─────────────────────────
    {
        "id": "MS2023-001",
        "session": "Monsoon Session 2023",
        "date": date(2023, 7, 20),
        "topic": "Digital Personal Data Protection Bill 2023 — First Reading",
        "bill": "Digital Personal Data Protection Bill 2023",
        "sector": "IT",
        "intensity": 9,
        "sentiment": "Negative",
        "hours_debated": 8.0,
        "mps_participated": 61,
        "summary": "DPDP Bill introduced. Tech industry concerned about compliance burden. "
                   "TCS, Infosys, Wipro flagged potential cost impact in analyst calls.",
    },
    {
        "id": "MS2023-002",
        "session": "Monsoon Session 2023",
        "date": date(2023, 7, 24),
        "topic": "Digital Personal Data Protection Bill 2023 — Passed in Lok Sabha",
        "bill": "Digital Personal Data Protection Bill 2023",
        "sector": "IT",
        "intensity": 8,
        "sentiment": "Neutral",
        "hours_debated": 6.0,
        "mps_participated": 55,
        "summary": "DPDP Bill passed. IT companies relieved at softened penalties. Cloud "
                   "companies noted opportunity in compliance-as-a-service.",
    },
    {
        "id": "MS2023-003",
        "session": "Monsoon Session 2023",
        "date": date(2023, 7, 25),
        "topic": "Appropriation Bill — Defence Supplementary Demand",
        "bill": "Supplementary Demands for Grants — Defence",
        "sector": "Defence",
        "intensity": 7,
        "sentiment": "Positive",
        "hours_debated": 5.0,
        "mps_participated": 38,
        "summary": "₹8,500 Cr supplementary allocation for HAL Tejas Mark 1A programme. "
                   "BEL radar contract mentioned. HAL delivery timeline debated.",
    },
    {
        "id": "MS2023-004",
        "session": "Monsoon Session 2023",
        "date": date(2023, 7, 26),
        "topic": "No-Confidence Motion Debate — Agriculture Distress",
        "bill": "No-Confidence Motion 2023",
        "sector": "Agriculture",
        "intensity": 9,
        "sentiment": "Negative",
        "hours_debated": 20.0,
        "mps_participated": 180,
        "summary": "No-confidence motion. Opposition raised farm distress, MSP legislation. "
                   "Agrochemical stocks volatile as farm policy uncertainty increased.",
    },
    {
        "id": "MS2023-005",
        "session": "Monsoon Session 2023",
        "date": date(2023, 8, 2),
        "topic": "Telecom Bill 2023 — Spectrum Allocation and OTT Regulation",
        "bill": "Telecommunications Bill 2023",
        "sector": "Telecom",
        "intensity": 8,
        "sentiment": "Positive",
        "hours_debated": 7.0,
        "mps_participated": 44,
        "summary": "Telecom Bill replaces Indian Telegraph Act 1885. Bharti Airtel spectrum "
                   "advantage discussed. OTT regulation concern for Idea/Vodafone.",
    },
    {
        "id": "MS2023-006",
        "session": "Monsoon Session 2023",
        "date": date(2023, 8, 7),
        "topic": "Insurance Amendment Bill — FDI in Insurance Sector",
        "bill": "Insurance Amendment Bill 2023",
        "sector": "Banking",
        "intensity": 6,
        "sentiment": "Positive",
        "hours_debated": 4.0,
        "mps_participated": 27,
        "summary": "FDI limit in insurance raised to 74%. HDFC Life, SBI Life saw positive "
                   "analyst revisions. LIC IPO follow-on discussed.",
    },
    {
        "id": "MS2023-007",
        "session": "Monsoon Session 2023",
        "date": date(2023, 8, 9),
        "topic": "Drugs, Medical Devices and Cosmetics Bill — Quality Control",
        "bill": "Drugs, Medical Devices and Cosmetics Bill 2023",
        "sector": "Pharma",
        "intensity": 7,
        "sentiment": "Negative",
        "hours_debated": 5.5,
        "mps_participated": 36,
        "summary": "New drug regulation framework replacing 1940 Act. Stricter penalties for "
                   "substandard drugs. Concerns raised about Sun Pharma, Cipla compliance.",
    },
    {
        "id": "MS2023-008",
        "session": "Monsoon Session 2023",
        "date": date(2023, 8, 10),
        "topic": "Electricity Amendment Bill — Renewable Energy Mandates",
        "bill": "Electricity (Amendment) Bill 2023",
        "sector": "Energy",
        "intensity": 7,
        "sentiment": "Positive",
        "hours_debated": 5.0,
        "mps_participated": 41,
        "summary": "Renewable energy purchase obligation for states. NTPC renewable target "
                   "debated. ONGC offshore wind opportunity highlighted.",
    },

    # ── Winter Session 2023 (Dec 4 – Dec 22 2023) ───────────────────────────
    {
        "id": "WS2023-001",
        "session": "Winter Session 2023",
        "date": date(2023, 12, 5),
        "topic": "Telecom Bill 2023 — Rajya Sabha Return and Final Passage",
        "bill": "Telecommunications Bill 2023",
        "sector": "Telecom",
        "intensity": 8,
        "sentiment": "Positive",
        "hours_debated": 6.5,
        "mps_participated": 49,
        "summary": "Telecom Bill finally passed both Houses. Bharti Airtel hailed as biggest "
                   "beneficiary. Idea Vodafone debt restructuring also debated.",
    },
    {
        "id": "WS2023-002",
        "session": "Winter Session 2023",
        "date": date(2023, 12, 7),
        "topic": "Three Criminal Law Reform Bills — Passage",
        "bill": "Bharatiya Nyaya Sanhita / Nagarik Suraksha Sanhita / Sakshya Adhiniyam",
        "sector": "Banking",
        "intensity": 5,
        "sentiment": "Neutral",
        "hours_debated": 8.0,
        "mps_participated": 62,
        "summary": "New criminal codes replacing IPC/CrPC/Evidence Act. Indirect impact on "
                   "banking through changed debt recovery and financial fraud provisions.",
    },
    {
        "id": "WS2023-003",
        "session": "Winter Session 2023",
        "date": date(2023, 12, 12),
        "topic": "Defence Acquisition — iDEX and DRDO Reform Debate",
        "bill": "Discussion — Defence Innovation Ecosystem",
        "sector": "Defence",
        "intensity": 6,
        "sentiment": "Positive",
        "hours_debated": 4.0,
        "mps_participated": 28,
        "summary": "iDEX startups and DRDO technology transfer discussed. Minda Industries, "
                   "Data Patterns, DCX Systems flagged as beneficiaries.",
    },
    {
        "id": "WS2023-004",
        "session": "Winter Session 2023",
        "date": date(2023, 12, 14),
        "topic": "Pharmaceutical Export Regulation — Quality Standards Debate",
        "bill": "Discussion — Pharma Export Quality",
        "sector": "Pharma",
        "intensity": 7,
        "sentiment": "Negative",
        "hours_debated": 5.0,
        "mps_participated": 33,
        "summary": "US FDA import alerts on Indian pharma discussed. Dr Reddy's, Sun Pharma, "
                   "Aurobindo compliance issues raised. Export revenue risk flagged.",
    },
    {
        "id": "WS2023-005",
        "session": "Winter Session 2023",
        "date": date(2023, 12, 18),
        "topic": "Agriculture — Crop Insurance PMFBY Reform Discussion",
        "bill": "Discussion — PM Fasal Bima Yojana",
        "sector": "Agriculture",
        "intensity": 6,
        "sentiment": "Positive",
        "hours_debated": 4.5,
        "mps_participated": 39,
        "summary": "PMFBY tech-based crop assessment using satellite/drone. PI Industries, "
                   "UPL crop protection demand expected to rise with farmer confidence.",
    },
    {
        "id": "WS2023-006",
        "session": "Winter Session 2023",
        "date": date(2023, 12, 19),
        "topic": "National Capital Territory of Delhi Amendment — Governance",
        "bill": "GNCT of Delhi Amendment Bill 2023",
        "sector": "Infrastructure",
        "intensity": 7,
        "sentiment": "Neutral",
        "hours_debated": 5.5,
        "mps_participated": 55,
        "summary": "Delhi governance bill passed. Infrastructure allocation for Delhi Metro "
                   "Phase 4 debated. L&T, RITES flagged as contractors.",
    },
    {
        "id": "WS2023-007",
        "session": "Winter Session 2023",
        "date": date(2023, 12, 20),
        "topic": "EV and Automobile Policy — Zero-Emission Vehicle Mandate",
        "bill": "Discussion — EV Transition Roadmap",
        "sector": "Auto",
        "intensity": 6,
        "sentiment": "Positive",
        "hours_debated": 4.0,
        "mps_participated": 30,
        "summary": "Govt reiterated 30% EV penetration by 2030. Maruti's late EV entry "
                   "questioned. Tata Motors and M&M EV leadership acknowledged.",
    },

    # ── Budget Session 2024 (Feb 2 – Jun 4 2024) ────────────────────────────
    {
        "id": "BS2024-001",
        "session": "Budget Session 2024",
        "date": date(2024, 2, 1),
        "topic": "Interim Budget 2024-25 — Defence Capex ₹1.72 Lakh Crore",
        "bill": "Vote on Account 2024",
        "sector": "Defence",
        "intensity": 9,
        "sentiment": "Positive",
        "hours_debated": 7.5,
        "mps_participated": 58,
        "summary": "Pre-election budget. Defence capex surged 11%. HAL, BEL, Bharat Forge "
                   "order pipelines discussed. Tejas Mk2 funding confirmed.",
    },
    {
        "id": "BS2024-002",
        "session": "Budget Session 2024",
        "date": date(2024, 2, 1),
        "topic": "Interim Budget 2024-25 — Infrastructure ₹11.1 Lakh Crore Capex",
        "bill": "Vote on Account 2024",
        "sector": "Infrastructure",
        "intensity": 10,
        "sentiment": "Positive",
        "hours_debated": 9.5,
        "mps_participated": 74,
        "summary": "Highest-ever infra capex. PM Gati Shakti, 3 major economic rail corridors, "
                   "40 new airports. L&T, KNR, PNC, Ashoka Buildcon discussed.",
    },
    {
        "id": "BS2024-003",
        "session": "Budget Session 2024",
        "date": date(2024, 2, 2),
        "topic": "Interim Budget 2024-25 — Solar Energy and Green Transition",
        "bill": "Vote on Account 2024",
        "sector": "Energy",
        "intensity": 8,
        "sentiment": "Positive",
        "hours_debated": 6.0,
        "mps_participated": 44,
        "summary": "Rooftop solar PM Surya Ghar scheme ₹75,021 Cr. NTPC, ONGC renewable pivot. "
                   "Coal India diversification into solar debated.",
    },
    {
        "id": "BS2024-004",
        "session": "Budget Session 2024",
        "date": date(2024, 2, 5),
        "topic": "Banking — RBI Regulatory Powers Debate",
        "bill": "RBI Amendment Discussion",
        "sector": "Banking",
        "intensity": 5,
        "sentiment": "Neutral",
        "hours_debated": 3.5,
        "mps_participated": 24,
        "summary": "RBI macro-prudential measures on unsecured lending discussed. HDFC Bank, "
                   "ICICI credit card portfolio risk flagged. NPA cycle concern.",
    },
    {
        "id": "BS2024-005",
        "session": "Budget Session 2024",
        "date": date(2024, 2, 8),
        "topic": "AI and IT Sector — National AI Mission ₹10,372 Cr",
        "bill": "Budget Discussion — Digital India 3.0",
        "sector": "IT",
        "intensity": 7,
        "sentiment": "Positive",
        "hours_debated": 5.5,
        "mps_participated": 38,
        "summary": "National AI Mission announced. IndiaAI compute infrastructure. TCS, "
                   "Infosys positioned as AI implementation partners for government.",
    },
    {
        "id": "BS2024-006",
        "session": "Budget Session 2024",
        "date": date(2024, 2, 9),
        "topic": "Agriculture — Oilseeds Mission and MSP Announcement",
        "bill": "Budget Discussion — Agriculture",
        "sector": "Agriculture",
        "intensity": 7,
        "sentiment": "Positive",
        "hours_debated": 5.0,
        "mps_participated": 46,
        "summary": "Atmanirbhar oilseed mission to cut edible oil imports. Coromandel, UPL, "
                   "PI Industries flagged. MSP increase above inflation discussed.",
    },
    {
        "id": "BS2024-007",
        "session": "Budget Session 2024",
        "date": date(2024, 3, 15),
        "topic": "Defence Acquisition Procedure — Fast Track Procurement",
        "bill": "DAP Amendment 2024",
        "sector": "Defence",
        "intensity": 7,
        "sentiment": "Positive",
        "hours_debated": 5.0,
        "mps_participated": 35,
        "summary": "DAP 2020 amendment fast-tracking strategic partner model. Mahindra "
                   "Defence, L&T Defence discussed. MIDHANI alloy supply chain flagged.",
    },
    {
        "id": "BS2024-008",
        "session": "Budget Session 2024",
        "date": date(2024, 3, 20),
        "topic": "Spectrum Auction and 5G Rollout — Telecom Discussion",
        "bill": "Discussion — 5G Deployment Progress",
        "sector": "Telecom",
        "intensity": 6,
        "sentiment": "Positive",
        "hours_debated": 4.0,
        "mps_participated": 29,
        "summary": "5G coverage milestone: 700 cities. Bharti Airtel 5G monetisation praised. "
                   "Idea Vodafone government equity stake discussed.",
    },
    {
        "id": "BS2024-009",
        "session": "Budget Session 2024",
        "date": date(2024, 4, 2),
        "topic": "EV Policy — PLI Scheme for Battery Manufacturing",
        "bill": "Budget Discussion — Advanced Chemistry Cell",
        "sector": "Auto",
        "intensity": 7,
        "sentiment": "Positive",
        "hours_debated": 5.5,
        "mps_participated": 37,
        "summary": "ACC battery PLI winners: Ola Electric, Reliance, Rajesh Exports. M&M, "
                   "Tata Motors battery supply chain. Import duty rationalisation.",
    },
    {
        "id": "BS2024-010",
        "session": "Budget Session 2024",
        "date": date(2024, 4, 8),
        "topic": "Pharma — Drug Price Control and NPPA Powers",
        "bill": "DPCO Amendment Discussion",
        "sector": "Pharma",
        "intensity": 6,
        "sentiment": "Negative",
        "hours_debated": 4.5,
        "mps_participated": 32,
        "summary": "NPPA expanding price control to 300 more medicines. Cipla, Dr Reddy's "
                   "revenue impact estimated. Opposition called for wider control.",
    },

    # ── Monsoon Session 2024 (Jul 22 – Aug 9 2024) ──────────────────────────
    {
        "id": "MS2024-001",
        "session": "Monsoon Session 2024",
        "date": date(2024, 7, 22),
        "topic": "Union Budget 2024-25 — Defence ₹6.21 Lakh Crore Total",
        "bill": "Finance Bill 2024",
        "sector": "Defence",
        "intensity": 10,
        "sentiment": "Positive",
        "hours_debated": 8.5,
        "mps_participated": 72,
        "summary": "Full budget post-election. Defence allocation at record. HAL order book "
                   "₹94,000 Cr highlighted. BEL radar, sonar programmes funded.",
    },
    {
        "id": "MS2024-002",
        "session": "Monsoon Session 2024",
        "date": date(2024, 7, 22),
        "topic": "Union Budget 2024-25 — Custom Duty Cuts on Electronics",
        "bill": "Finance Bill 2024",
        "sector": "IT",
        "intensity": 7,
        "sentiment": "Positive",
        "hours_debated": 5.5,
        "mps_participated": 40,
        "summary": "Mobile phone component duty reduced. India semiconductor mission. "
                   "Infosys BPM, Wipro hardware margin implications debated.",
    },
    {
        "id": "MS2024-003",
        "session": "Monsoon Session 2024",
        "date": date(2024, 7, 23),
        "topic": "Union Budget 2024-25 — LTCG and STCG Tax Increase",
        "bill": "Finance Bill 2024",
        "sector": "Banking",
        "intensity": 9,
        "sentiment": "Negative",
        "hours_debated": 7.0,
        "mps_participated": 66,
        "summary": "LTCG raised to 12.5%, STCG to 20%. Broad market sell-off. Banking "
                   "stocks hit on FII outflow concerns. HDFC Bank, ICICI Bank fell sharply.",
    },
    {
        "id": "MS2024-004",
        "session": "Monsoon Session 2024",
        "date": date(2024, 7, 24),
        "topic": "Union Budget 2024-25 — Agriculture ₹1.52 Lakh Crore",
        "bill": "Finance Bill 2024",
        "sector": "Agriculture",
        "intensity": 8,
        "sentiment": "Positive",
        "hours_debated": 6.5,
        "mps_participated": 51,
        "summary": "Natural farming, digital agriculture mission. UPL debt concern flagged. "
                   "PI Industries specialty chemistry opportunity debated.",
    },
    {
        "id": "MS2024-005",
        "session": "Monsoon Session 2024",
        "date": date(2024, 7, 25),
        "topic": "Union Budget 2024-25 — Energy Transition ₹35,000 Cr",
        "bill": "Finance Bill 2024",
        "sector": "Energy",
        "intensity": 8,
        "sentiment": "Positive",
        "hours_debated": 6.0,
        "mps_participated": 45,
        "summary": "Solar rooftop, pumped storage, nuclear energy SMR discussed. Reliance "
                   "Industries green energy mega-project. NTPC 100 GW target.",
    },
    {
        "id": "MS2024-006",
        "session": "Monsoon Session 2024",
        "date": date(2024, 7, 26),
        "topic": "Finance Bill 2024 — Removal of Indexation Benefit on Property",
        "bill": "Finance Bill 2024",
        "sector": "Banking",
        "intensity": 8,
        "sentiment": "Negative",
        "hours_debated": 6.5,
        "mps_participated": 58,
        "summary": "Indexation on real estate removed. Real estate sector outcry. HDFC Bank "
                   "mortgage book growth concern. ICICI, SBI home loan outlook clouded.",
    },
    {
        "id": "MS2024-007",
        "session": "Monsoon Session 2024",
        "date": date(2024, 7, 30),
        "topic": "Waqf Amendment Bill 2024 — Infrastructure Sector Land",
        "bill": "Waqf (Amendment) Bill 2024",
        "sector": "Infrastructure",
        "intensity": 9,
        "sentiment": "Neutral",
        "hours_debated": 12.0,
        "mps_participated": 91,
        "summary": "Controversial bill on Waqf Board land. Real estate and infra projects "
                   "on disputed lands flagged. NCC, L&T exposure to such projects.",
    },
    {
        "id": "MS2024-008",
        "session": "Monsoon Session 2024",
        "date": date(2024, 8, 1),
        "topic": "Pradhan Mantri Awas Yojana — Urban Housing 1 Cr Homes",
        "bill": "Budget Discussion — PMAY Urban",
        "sector": "Infrastructure",
        "intensity": 8,
        "sentiment": "Positive",
        "hours_debated": 6.0,
        "mps_participated": 53,
        "summary": "PMAY Urban 2.0 — 1 crore homes for middle class. L&T, Capacit'e, "
                   "Oberoi Realty, DLF flagged. Cement and steel demand implications.",
    },
    {
        "id": "MS2024-009",
        "session": "Monsoon Session 2024",
        "date": date(2024, 8, 2),
        "topic": "Auto Sector — EV Market Share and Hybrid Policy Debate",
        "bill": "Discussion — EV vs Hybrid Tax Policy",
        "sector": "Auto",
        "intensity": 7,
        "sentiment": "Neutral",
        "hours_debated": 5.0,
        "mps_participated": 34,
        "summary": "Debate over GST on hybrids vs pure EVs. Maruti lobbying for hybrids "
                   "acknowledged. Tata Motors EV dominance questioned long-term.",
    },
    {
        "id": "MS2024-010",
        "session": "Monsoon Session 2024",
        "date": date(2024, 8, 6),
        "topic": "Pharma — GLP-1 Manufacturing and Weight-Loss Drug Debate",
        "bill": "Discussion — Pharma Innovation Policy",
        "sector": "Pharma",
        "intensity": 6,
        "sentiment": "Positive",
        "hours_debated": 4.0,
        "mps_participated": 28,
        "summary": "GLP-1 weight-loss drugs manufacturing opportunity for India. Sun Pharma, "
                   "Divi's Labs, Neuland Labs flagged as API suppliers.",
    },
    {
        "id": "MS2024-011",
        "session": "Monsoon Session 2024",
        "date": date(2024, 8, 7),
        "topic": "Telecom — Satellite Internet and SATCOM Policy",
        "bill": "Discussion — SATCOM Policy 2024",
        "sector": "Telecom",
        "intensity": 7,
        "sentiment": "Positive",
        "hours_debated": 5.0,
        "mps_participated": 36,
        "summary": "Starlink India entry, Jio satellite vs Airtel OneWeb. ISRO commercial "
                   "role debated. Trai spectrum allocation for satellite flagged.",
    },
    {
        "id": "MS2024-012",
        "session": "Monsoon Session 2024",
        "date": date(2024, 8, 8),
        "topic": "Banking — Insolvency and Bankruptcy Code Amendment",
        "bill": "IBC Amendment Bill 2024",
        "sector": "Banking",
        "intensity": 6,
        "sentiment": "Positive",
        "hours_debated": 4.5,
        "mps_participated": 31,
        "summary": "IBC amendments to speed up resolution. PSU banks NPA recovery "
                   "timeline improved. SBI, BoB stressed asset resolution discussed.",
    },
]


# ---------------------------------------------------------------------------
# Known Lok Sabha sessions — used by the auto-scheduler
# Add future sessions here; the fetcher will auto-ingest when dates pass.
# ---------------------------------------------------------------------------
SESSIONS_REGISTRY: list[dict] = [
    {
        "name": "Budget Session 2023",
        "start": date(2023, 2, 1),
        "end": date(2023, 5, 5),
        "status": "completed",
    },
    {
        "name": "Monsoon Session 2023",
        "start": date(2023, 7, 20),
        "end": date(2023, 8, 11),
        "status": "completed",
    },
    {
        "name": "Winter Session 2023",
        "start": date(2023, 12, 4),
        "end": date(2023, 12, 22),
        "status": "completed",
    },
    {
        "name": "Budget Session 2024",
        "start": date(2024, 2, 2),
        "end": date(2024, 6, 4),
        "status": "completed",
    },
    {
        "name": "Monsoon Session 2024",
        "start": date(2024, 7, 22),
        "end": date(2024, 8, 9),
        "status": "completed",
    },
    # ── Future sessions — add topics when announced ──────────────────────────
    {
        "name": "Winter Session 2024",
        "start": date(2024, 11, 25),
        "end": date(2024, 12, 20),
        "status": "scheduled",
    },
    {
        "name": "Budget Session 2025",
        "start": date(2025, 1, 31),
        "end": date(2025, 5, 9),
        "status": "scheduled",
    },
    {
        "name": "Monsoon Session 2025",
        "start": date(2025, 7, 21),
        "end": date(2025, 8, 22),
        "status": "scheduled",
    },
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def get_events_by_sector(sector: str) -> list[dict]:
    return [e for e in DEBATE_EVENTS if e["sector"] == sector]


def get_event_by_id(event_id: str) -> dict | None:
    for e in DEBATE_EVENTS:
        if e["id"] == event_id:
            return e
    return None


def get_all_sectors() -> list[str]:
    return sorted({e["sector"] for e in DEBATE_EVENTS})


def get_all_sessions() -> list[str]:
    return sorted({e["session"] for e in DEBATE_EVENTS})


def get_events_by_session(session: str) -> list[dict]:
    return [e for e in DEBATE_EVENTS if e["session"] == session]


def get_upcoming_sessions() -> list[dict]:
    from datetime import date as _date
    today = _date.today()
    return [s for s in SESSIONS_REGISTRY if s["start"] > today]


def get_active_session() -> dict | None:
    from datetime import date as _date
    today = _date.today()
    for s in SESSIONS_REGISTRY:
        if s["start"] <= today <= s["end"]:
            return s
    return None
