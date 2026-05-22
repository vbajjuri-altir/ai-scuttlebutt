# 🏢 Startup & Business Research via Passive Reconnaissance

> A structured guide for investors, analysts, and curious engineers to research any company ethically using OSINT techniques.

---

## 📌 Table of Contents

1. [Research Framework Overview](#1-research-framework-overview)
2. [Financial & Valuation Research](#2-financial--valuation-research)
3. [Product Intelligence](#3-product-intelligence)
4. [Customer Reviews & Sentiment](#4-customer-reviews--sentiment)
5. [MOAT Analysis](#5-moat-analysis)
6. [Founder & Team Research](#6-founder--team-research)
7. [APIs for Automated Research](#7-apis-for-automated-research)
8. [Google Dorking Cheatsheet](#8-google-dorking-cheatsheet)
9. [Full Research Workflow](#9-full-research-workflow)
10. [India-Specific Sources](#10-india-specific-sources)
11. [Red Flags to Watch For](#11-red-flags-to-watch-for)
12. [Research Report Template](#12-research-report-template)

---

## 1. Research Framework Overview

Business OSINT for investing is called **Competitive Intelligence** — completely legal, widely used by VCs, analysts, and PE firms.

### Five Pillars of Startup Research

```
┌─────────────────────────────────────────────────────┐
│                  COMPANY RESEARCH                   │
├──────────┬──────────┬──────────┬──────────┬─────────┤
│ Finance  │ Product  │Customer  │  MOAT    │ Founder │
│Valuation │ Intel    │Sentiment │ Analysis │Research │
└──────────┴──────────┴──────────┴──────────┴─────────┘
```

### Research Mindset

- **Follow the money** — funding tells you who believes in them
- **Follow the talent** — hiring tells you what they're building next
- **Follow the customers** — reviews tell you the ground truth
- **Follow the founder** — track record predicts future behavior

---

## 2. Financial & Valuation Research

### 🌐 Global Sources

| Source      | URL            | What You Get                                   | Cost     |
| ----------- | -------------- | ---------------------------------------------- | -------- |
| Crunchbase  | crunchbase.com | Funding rounds, investors, valuation estimates | Freemium |
| PitchBook   | pitchbook.com  | Detailed valuations, cap table, deal terms     | Paid     |
| AngelList   | angel.co       | Early stage deals, team, equity                | Free     |
| Owler       | owler.com      | Revenue estimates, employee count, competitors | Freemium |
| CB Insights | cbinsights.com | Market maps, funding analytics                 | Paid     |

### 🇮🇳 India-Specific Financial Sources

| Source      | URL           | What You Get                                    | Cost     |
| ----------- | ------------- | ----------------------------------------------- | -------- |
| Zauba Corp  | zaubacorp.com | Actual P&L, balance sheet, MCA filings          | Free     |
| Tofler      | tofler.in     | MCA data in readable format, charges, directors | Freemium |
| MCA21       | mca.gov.in    | Official ROC filings, annual returns            | Free     |
| Tracxn      | tracxn.com    | Indian startup funding, valuation, investors    | Freemium |
| Entrackr    | entrackr.com  | Startup financials, funding news                | Free     |
| VCCEdge     | vccedge.com   | PE/VC deals, M&A activity in India              | Paid     |
| Screener.in | screener.in   | Full financials if publicly listed              | Free     |

### 📊 What to Look For in Financials

```
Revenue Growth Rate     → Is it growing YoY? Consistent?
Burn Rate               → How fast are they spending?
Gross Margin            → Is the business model viable?
Revenue per Employee    → Operational efficiency
Debt / Charges          → Any loans or charges on MCA?
Cash Runway             → How long until they need next round?
```

### 🔍 Key Questions to Answer

- What stage are they at? (Pre-seed / Seed / Series A-D / Growth)
- Who are the investors? (Tier 1 VC = validation signal)
- What was the last valuation and when?
- Are they profitable or burning cash?
- How many funding rounds and at what intervals?

---

## 3. Product Intelligence

### 🛠️ Product Research Sources

| Source                     | What to Look For                                 |
| -------------------------- | ------------------------------------------------ |
| **Product Hunt**           | Launch history, upvotes, early adopter comments  |
| **G2**                     | Detailed feature reviews, competitor comparisons |
| **Capterra**               | SMB user reviews, use case fit                   |
| **Trustpilot**             | Consumer sentiment, complaint patterns           |
| **App Store / Play Store** | Ratings trend over time, update frequency        |
| **Wayback Machine**        | How product/pricing evolved (web.archive.org)    |
| **BuiltWith**              | Tech stack — what they're built on               |
| **Wappalyzer**             | Browser extension — instant tech stack reveal    |
| **SimilarWeb**             | Traffic volume, sources, geography, engagement   |
| **SEMrush / Ahrefs**       | SEO strength, keyword strategy, organic growth   |

### 💡 Hidden Product Signals

**Job Postings = Product Roadmap**

```
Hiring ML Engineers      → Building AI features
Hiring Data Engineers    → Scaling data infrastructure
Hiring Enterprise Sales  → Moving upmarket
Hiring Compliance roles  → Entering regulated markets
```

**Changelog / Release Notes**

```
Check: ProductName changelog / release notes / what's new
Fast release cadence = active development
Long gaps = technical debt or team issues
```

**GitHub (if open source or has public repos)**

```
Commit frequency        → Engineering team activity
Contributors            → Team size signal
Stars / Forks           → Developer community interest
Issues / Bug reports    → Product quality signal
```

---

## 4. Customer Reviews & Sentiment

### ⭐ Review Platforms

| Platform               | Best For                                          |
| ---------------------- | ------------------------------------------------- |
| G2                     | B2B SaaS products                                 |
| Capterra               | SMB software                                      |
| Trustpilot             | Consumer products                                 |
| Glassdoor              | Internal culture (employees = internal customers) |
| Reddit                 | Unfiltered honest opinions                        |
| Twitter/X              | Real-time sentiment                               |
| LinkedIn               | Professional user opinions on posts               |
| App Store / Play Store | Mobile product sentiment                          |

### 🔍 Google Dorks for Sentiment

```bash
# Unfiltered Reddit opinions
site:reddit.com "CompanyName" review

# Twitter opinions excluding brand's own tweets
"CompanyName" -from:@CompanyHandle

# Complaints and issues
"CompanyName" "problem" OR "issue" OR "disappointed"

# Positive signals
"CompanyName" "love" OR "amazing" OR "switched to"

# Comparisons
"CompanyName" vs OR versus OR compared OR alternative
```

### 📊 Sentiment Analysis Framework

```
Positive Signals ✅          Negative Signals ❌
─────────────────────        ──────────────────────
High NPS mentions            Refund complaints
"Switched from X to Y"       "Cancelled subscription"
Feature request engagement   Data breach mentions
Community building           Founder controversy
Word-of-mouth mentions       Employee layoff news
Case studies published        Lawsuit filings
```

---

## 5. MOAT Analysis

A **MOAT** is a sustainable competitive advantage that protects a company from competition.

### 🏰 Types of MOATs & How to Detect Them

#### 1. Network Effects

Company becomes more valuable as more users join.

```
Where to look:
- User growth rate (SimilarWeb, App Annie)
- Marketplace dynamics (buyers + sellers?)
- Community size (Discord, Slack, Reddit)
- API ecosystem (do others build on them?)

Signal: "The more people use it, the better it gets"
```

#### 2. Switching Costs

Customers find it painful/expensive to leave.

```
Where to look:
- Reviews mentioning "migration" difficulty
- Data portability policies (or lack of)
- Deep integrations with other tools
- Long-term contracts mentioned in filings

Signal: "We're too embedded to switch"
```

#### 3. Brand / Reputation

Strong, defensible brand identity.

```
Where to look:
- Social following and engagement rate
- Press coverage quality (TechCrunch vs local blog)
- Glassdoor rating (brand as employer)
- NPS signals in reviews
- Awards and recognition

Signal: Users recommend without incentive
```

#### 4. Patents & IP

Legal protection on core technology.

```
Where to look:
- Google Patents → search company name
- Indian Patent Office (ipindia.gov.in)
- Job postings mentioning "proprietary technology"
- Academic papers by founders/team

Google Dork:
"CompanyName" site:patents.google.com
```

#### 5. Data Advantage

Proprietary data that competitors can't replicate.

```
Where to look:
- "Proprietary data" in job postings or press
- Years of operation (older = more historical data)
- Exclusive data partnerships mentioned in news
- AI/ML heavy hiring = data moat building

Signal: "Our model improves with every transaction"
```

#### 6. Regulatory / Compliance Moat

Licenses, certifications, or regulatory approvals hard to get.

```
Where to look:
- MCA filings for regulated sectors
- RBI / SEBI / IRDAI licenses (India)
- News about regulatory approvals
- Compliance team size on LinkedIn

Signal: New entrants face 12-18 month approval cycles
```

### 📋 MOAT Scorecard Template

| MOAT Type       | Evidence Found | Strength (1-5) | Notes |
| --------------- | -------------- | -------------- | ----- |
| Network Effects |                |                |       |
| Switching Costs |                |                |       |
| Brand           |                |                |       |
| Patents / IP    |                |                |       |
| Data Advantage  |                |                |       |
| Regulatory      |                |                |       |
| **Total Score** |                | **/30**        |       |

---

## 6. Founder & Team Research

### 👤 Founder Research Sources

| Source              | What You Learn                               |
| ------------------- | -------------------------------------------- |
| LinkedIn            | Full career history, education, connections  |
| Crunchbase          | Previous companies founded, investments made |
| AngelList           | Portfolio companies, investor profile        |
| Twitter/X           | Thinking style, network, controversies       |
| MCA / Zauba Corp    | All companies they are director of           |
| Google News         | Press coverage, interviews, controversies    |
| Podcast appearances | Long-form thinking, vision, communication    |
| YouTube talks       | Conference talks, product demos              |
| GitHub              | Technical depth (if technical founder)       |

### 🔍 Founder Google Dorks

```bash
# All companies associated
"Founder Name" director site:zaubacorp.com

# Controversies and red flags
"Founder Name" controversy OR lawsuit OR fraud OR scam

# Investor signals
"Founder Name" invested OR "angel investor" OR portfolio

# Media coverage
"Founder Name" interview OR podcast OR talk OR keynote

# Academic / research background
"Founder Name" site:scholar.google.com
```

### ✅ What Makes a Strong Founder

```
Domain Expertise        → Have they worked in this industry before?
Previous Exits          → Have they built and sold before?
Repeat Investors        → Do the same investors keep backing them?
Team Retention          → Is the founding team still intact?
Transparency            → Do they talk openly about failures too?
Network Quality         → Who endorses them on LinkedIn?
Technical Depth         → Do they understand the product deeply?
Execution Track Record  → Do they ship what they promise?
```

### ⚠️ Founder Red Flags

```
❌ Multiple failed ventures with same pattern
❌ Legal disputes / lawsuits in past companies
❌ Co-founder breakups and departures
❌ Exaggerated claims in press not matching filings
❌ No verifiable track record before this company
❌ High executive turnover on LinkedIn
❌ Founder not listed in MCA filings (ownership hidden)
```

### 👥 Team Research

```
LinkedIn headcount growth   → Hiring = growing = funded
Key hires from competitors  → Signal of legitimacy
Advisor quality             → Who's lending their name?
Glassdoor rating            → Internal culture truth
Employee tenure             → High churn = culture issues
```

---

## 7. APIs for Automated Research

### 📡 Key APIs

#### Crunchbase API

```python
import requests

headers = {"X-cb-user-key": "YOUR_API_KEY"}
url = "https://api.crunchbase.com/api/v4/entities/organizations/company-slug"

response = requests.get(url, headers=headers)
data = response.json()

# Returns: funding rounds, investors, valuation, team, news
```

#### SimilarWeb API

```python
params = {
    "api_key": "YOUR_KEY",
    "domain": "company.com",
    "country": "IN",
    "granularity": "monthly"
}

response = requests.get(
    "https://api.similarweb.com/v1/website/company.com/total-traffic-and-engagement/visits",
    params=params
)
# Returns: monthly visits, bounce rate, pages/visit, avg session duration
```

#### NewsAPI (Press Coverage)

```python
params = {
    "q": "Company Name",
    "language": "en",
    "sortBy": "publishedAt",
    "apiKey": "YOUR_KEY"
}

response = requests.get("https://newsapi.org/v2/everything", params=params)
articles = response.json()["articles"]
# Returns: all press mentions sorted by recency
```

#### Hunter.io (Team Emails)

```python
params = {
    "domain": "company.com",
    "api_key": "YOUR_KEY"
}

response = requests.get("https://api.hunter.io/v2/domain-search", params=params)
# Returns: all publicly found emails at the domain + confidence score
```

#### Reddit API (Sentiment)

```python
import praw

reddit = praw.Reddit(client_id="ID", client_secret="SECRET", user_agent="research")
results = reddit.subreddit("all").search("CompanyName", limit=100)

for post in results:
    print(post.title, post.score, post.num_comments)
# Returns: community discussions, upvotes, engagement
```

### 📊 API Summary Table

| API            | Data                         | Free Tier | Docs                |
| -------------- | ---------------------------- | --------- | ------------------- |
| Crunchbase     | Funding, founders, investors | Limited   | crunchbase.com/api  |
| SimilarWeb     | Traffic, engagement          | Trial     | similarweb.com/api  |
| Hunter.io      | Team emails                  | 25/mo     | hunter.io/api       |
| NewsAPI        | Press coverage               | 100/day   | newsapi.org         |
| Reddit (PRAW)  | Community sentiment          | Free      | praw.readthedocs.io |
| Google Patents | IP filings                   | Free      | patents.google.com  |
| BuiltWith API  | Tech stack                   | Paid      | builtwith.com/api   |

---

## 8. Google Dorking Cheatsheet

```bash
# ── FINANCIAL ──────────────────────────────────────────
"CompanyName" funding OR "raised" OR "valuation" OR "Series"
"CompanyName" revenue OR ARR OR MRR
"CompanyName" filetype:pdf annual report

# ── PRODUCT ────────────────────────────────────────────
"CompanyName" changelog OR "release notes" OR "what's new"
"CompanyName" site:producthunt.com
"CompanyName" roadmap OR "coming soon" OR "beta"

# ── CUSTOMER SENTIMENT ─────────────────────────────────
"CompanyName" site:reddit.com
"CompanyName" review site:g2.com OR site:trustpilot.com
"CompanyName" "switched from" OR "moved to" OR "cancelled"
"CompanyName" -site:CompanyName.com (excludes own site)

# ── MOAT / IP ──────────────────────────────────────────
"CompanyName" site:patents.google.com
"CompanyName" "proprietary" OR "exclusive" OR "patent"
"CompanyName" "data partnership" OR "exclusive data"

# ── FOUNDER ────────────────────────────────────────────
"Founder Name" site:linkedin.com
"Founder Name" controversy OR lawsuit OR "stepped down"
"Founder Name" interview OR podcast OR talk
"Founder Name" invested OR "angel" OR portfolio

# ── RED FLAGS ──────────────────────────────────────────
"CompanyName" layoff OR "let go" OR "restructuring"
"CompanyName" lawsuit OR legal OR "court case"
"CompanyName" fraud OR scam OR "data breach"
"CompanyName" site:glassdoor.com (employee reviews)
```

---

## 9. Full Research Workflow

```
STEP 1: BASELINE
════════════════
Company Name + Website
        │
        ├── Crunchbase → Stage, investors, funding history
        ├── LinkedIn → Headcount, team quality, hiring trends
        └── SimilarWeb → Traffic trends (growing or declining?)

STEP 2: FINANCIALS
══════════════════
        │
        ├── [India] Zauba Corp / Tofler → Actual P&L, filings
        ├── [Global] PitchBook / CB Insights → Valuation details
        └── Screener.in → If publicly listed

STEP 3: PRODUCT
═══════════════
        │
        ├── Product Hunt → Launch history and reception
        ├── G2 / Capterra → Detailed feature reviews
        ├── Wayback Machine → Product evolution over time
        └── BuiltWith → Tech stack analysis

STEP 4: CUSTOMER SENTIMENT
══════════════════════════
        │
        ├── Reddit → Unfiltered community opinions
        ├── Twitter/X → Real-time sentiment
        ├── Trustpilot / G2 → Structured reviews
        └── Glassdoor → Internal culture signals

STEP 5: MOAT
════════════
        │
        ├── Google Patents → IP and tech protection
        ├── Job postings → What they're building (roadmap signal)
        ├── LinkedIn integrations → Ecosystem depth
        └── News → Regulatory moats, exclusive partnerships

STEP 6: FOUNDER
═══════════════
        │
        ├── LinkedIn → Full career history
        ├── Crunchbase → Previous companies, investments
        ├── MCA / Zauba → All directorships
        ├── Google News → Media coverage and controversies
        └── Podcasts / Talks → Vision and communication style

STEP 7: SYNTHESIZE
══════════════════
        │
        └── Fill Research Report Template (Section 12)
              → Investment thesis or pass decision
```

---

## 10. India-Specific Sources

| Source             | URL                         | Best For                                   |
| ------------------ | --------------------------- | ------------------------------------------ |
| Zauba Corp         | zaubacorp.com               | MCA filings, actual financials, directors  |
| Tofler             | tofler.in                   | Readable MCA data, charges, annual returns |
| MCA21              | mca.gov.in                  | Official government filings                |
| Tracxn             | tracxn.com                  | Indian startup ecosystem, funding data     |
| Inc42              | inc42.com                   | Indian startup news, funding tracker       |
| Entrackr           | entrackr.com                | Startup financials, revenue data           |
| VCCEdge            | vccedge.com                 | PE/VC deals, M&A in India                  |
| DIPP Startup India | startupindia.gov.in         | DPIIT recognized startups list             |
| BSE / NSE          | bseindia.com / nseindia.com | If publicly listed                         |
| IP India           | ipindia.gov.in              | Indian patent filings                      |
| RBI                | rbi.org.in                  | NBFC / Fintech licenses                    |

---

## 11. Red Flags to Watch For

### 🚨 Financial Red Flags

```
❌ Revenue declining while headcount growing
❌ Multiple funding rounds with no revenue growth
❌ Unexplained charges or liens on MCA filings
❌ Auditor resignation in annual filings
❌ Related party transactions (founder paying themselves excessively)
❌ Revenue claims in press ≠ actual MCA filings
```

### 🚨 Product Red Flags

```
❌ No product updates in 6+ months
❌ G2 rating declining over time
❌ High volume of refund complaints
❌ "Pivoted" multiple times without traction
❌ Tech stack using outdated/unsupported tools
❌ Traffic declining on SimilarWeb
```

### 🚨 Founder Red Flags

```
❌ Previous company shut down with customer money unreturned
❌ LinkedIn history doesn't match Crunchbase claims
❌ No verifiable references or endorsements
❌ Co-founders left within first 2 years
❌ Active litigation from employees or customers
❌ Excessive self-promotion with no substance
```

### 🚨 Team Red Flags

```
❌ Glassdoor rating below 3.0
❌ CXO-level departures within 12 months
❌ LinkedIn shows mass layoffs not reported in press
❌ No technical leadership for a tech company
❌ Hiring freezes after recent funding round
```

---

## 12. Research Report Template

```markdown
# Company Research Report: [Company Name]

Date:
Researched by:

## 1. Overview

- Founded:
- HQ:
- Sector:
- Stage:
- Website:

## 2. Financial Summary

- Total Raised:
- Last Round:
- Lead Investors:
- Valuation (last known):
- Revenue (from filings):
- Profitable: Yes / No / Unknown
- Burn Rate estimate:

## 3. Product Assessment

- Core Product:
- Target Customer:
- Tech Stack:
- Product Maturity (1-5):
- Notable Features:
- Key Weaknesses:

## 4. Customer Sentiment

- G2 Rating: /5 (N reviews)
- Trustpilot Rating: /5
- Reddit Sentiment: Positive / Mixed / Negative
- Key Praise:
- Key Complaints:
- NPS Signal:

## 5. MOAT Analysis

| MOAT Type       | Evidence | Strength (1-5) |
| --------------- | -------- | -------------- |
| Network Effects |          |                |
| Switching Costs |          |                |
| Brand           |          |                |
| Patents / IP    |          |                |
| Data Advantage  |          |                |
| Regulatory      |          |                |
| **Total**       |          | **/30**        |

## 6. Founder Assessment

- Name:
- Background:
- Previous Companies:
- Track Record:
- Reputation:
- Red Flags:

## 7. Competitive Landscape

- Direct Competitors:
- Indirect Competitors:
- Differentiation:

## 8. Key Risks

1.
2.
3.

## 9. Investment Thesis / Conclusion

[ ] Strong Buy — compelling product, strong team, clear MOAT
[ ] Watch — promising but needs more validation
[ ] Pass — red flags outweigh opportunity

**Reasoning:**
```

---

_Last updated: May 2026 | For ethical investment research purposes only_
_All research should use publicly available information only_

```

```
