# AI Scuttlebutt

AI-assisted company/startup research using public OSINT sources, APIs, and selective paid data sources where needed.

The initial product direction is described in `prd.md`. This README tracks the API/source research and which integrations are already implemented.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Implemented Public Data Helpers

The free/public/no-token source helpers are implemented in `src/lib/public-data-sources.ts`.

| Source                         | Status                              | Functions                                                                                             | Notes                                                                                               |
| ------------------------------ | ----------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Wayback CDX / Internet Archive | Implemented                         | `buildWaybackCdxUrl`, `searchWaybackCaptures`, `buildWaybackAvailableUrl`, `getLatestWaybackSnapshot` | Public/no-token. Supports structured CDX capture search and latest snapshot lookup.                 |
| Apple iTunes Search API        | Implemented                         | `buildITunesSearchUrl`, `searchAppStoreApps`, `buildITunesLookupUrl`, `lookupAppStoreApp`             | Public/no-token. Supports App Store app search and lookup by app id or bundle id.                   |
| Google Patents public web      | Implemented with limitations        | `buildGooglePatentsSearchUrl`, `createGooglePatentsSearch`, `fetchGooglePatentPageMetadata`           | No official API. Helpers generate search URLs and conservatively fetch single patent page metadata. |
| Screener.in public pages       | Implemented with limitations        | `buildScreenerCompanyUrl`, `createScreenerCompanyUrl`, `fetchScreenerCompanySummary`                  | No official API. Public URL generation plus simple public summary extraction where accessible.      |
| MCA portal                     | Implemented as manual-access helper | `createMcaPortalAccess`                                                                               | No public official API. Does not bypass login, OTP, captcha, session, or access controls.           |

Validation performed after implementation:

- `npx tsc --noEmit` passed.
- `npm run lint` passed with one pre-existing unrelated warning in `src/app/layout.tsx`.
- No linter issues were found in `src/lib/public-data-sources.ts`.

## Current API Key Plan

| Source       | Key Status                                  | Build Decision                                                                                                                                 |
| ------------ | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| NewsAPI      | Key available                               | Implement next. Use the key server-side only.                                                                                                  |
| Hunter.io    | Key available                               | Implement next. Use the key server-side only and respect credit limits.                                                                        |
| SerpAPI      | Key available with free tier                | Implement as a shared Google/search helper. Use server-side only and respect free-tier search limits.                                          |
| Product Hunt | API key, secret, and redirect URI available | Implement after SerpAPI/GitHub. Dummy redirect URI is okay for client-credentials/public reads; user OAuth needs a real matching redirect URI. |
| GitHub       | Need free personal access token             | Add next as a free high-signal engineering/activity source.                                                                                    |
| Reddit       | Need free OAuth app credentials             | Add for non-commercial/rate-limited community sentiment. Use official API before scraping.                                                     |
| BuiltWith    | Paid for useful access                      | Skip for now. Revisit only if tech-stack intelligence becomes essential.                                                                       |

### Suggested Free Credentials To Add

| Source         | What To Create                                                                     | Why                                                                                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GitHub         | Fine-grained personal access token with public-read permissions                    | Raises REST API quota from 60 unauthenticated requests/hour to 5,000 authenticated requests/hour for public org/repo research.                                                       |
| Reddit         | Reddit app credentials: `client_id`, `client_secret`, and a descriptive user agent | Free eligible OAuth usage allows roughly 100 queries/minute per OAuth client id for public posts/comments/subreddits. Commercial/high-volume use requires Reddit approval/agreement. |
| OpenCorporates | Optional API key                                                                   | Useful for legal-entity verification, but free limits are low by default and open-data licence terms apply.                                                                          |

## API And Source Research

### Cost Buckets

| Cost Bucket              | Sources                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Free public / no token   | Wayback CDX, Apple iTunes Search API, Google Patents web, public web pages like Screener/MCA portal when manually accessed.          |
| Free but token required  | GitHub authenticated API, Product Hunt developer token, limited Reddit eligible use, Trustpilot public API key.                      |
| Freemium / limited trial | NewsAPI developer plan, Hunter.io credits, SerpAPI free tier, G2 starter/sandbox access.                                             |
| Paid / sales-led         | Crunchbase, Similarweb, X API, SEMrush/Ahrefs, PitchBook, CB Insights, Tracxn, VCCEdge, deeper Trustpilot/G2/Capterra business APIs. |

### Primary APIs From `prd.md`

| Tool/API                       | Use                                               | Auth                                          | Cost                                  | Implementation Status                                     | Notes                                                                                              |
| ------------------------------ | ------------------------------------------------- | --------------------------------------------- | ------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Crunchbase                     | Funding, founders, investors, acquisitions        | API key required                              | Paid / sales-led                      | Not implemented                                           | Full API requires Enterprise or Applications license. Basic API is no longer offered to new users. |
| Similarweb                     | Traffic, engagement, geography, referrals         | API key required                              | Paid / trial                          | Not implemented                                           | API is part of Business/Enterprise or standalone package, priced with data credits.                |
| NewsAPI                        | Press mentions and news search                    | API key required                              | Free dev, paid production             | Key available; implementation pending                     | Free developer plan is limited to development/testing. Production requires paid plan.              |
| Hunter.io                      | Domain emails, email verification, enrichment     | API key required                              | Freemium credits                      | Key available; implementation pending                     | Free plan includes limited monthly credits; paid plans or data-platform credits needed at scale.   |
| Reddit API / PRAW              | Community sentiment and discussion search         | OAuth app credentials required                | Free limited; paid commercial         | Not implemented                                           | Free eligible use is rate-limited. Commercial/high-volume use requires Reddit agreement.           |
| BuiltWith                      | Technology stack and website changes              | API key required                              | Paid for useful access                | Skipped for now                                           | Paid access is needed for the useful API coverage, so this is intentionally deferred.              |
| Wayback CDX / Internet Archive | Historical website captures and product evolution | No token for public index                     | Free public                           | Implemented                                               | Public CDX queries generally work without a token.                                                 |
| Google Patents                 | Patent/IP search                                  | No official Google API; SerpAPI key available | Free web; SerpAPI free tier available | Public helper implemented; SerpAPI implementation pending | Public web helper exists. SerpAPI can be added for structured Google Patents/Search results.       |

### Additional Practical Sources

| Source                    | Use                                                                                  | Auth                  | Cost                                 | Implementation Status                         | Notes                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------ | --------------------- | ------------------------------------ | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub                    | Open-source repos, commits, issues, stars                                            | Optional token        | Free                                 | Not implemented                               | Unauthenticated public data is limited to 60 requests/hour/IP; token raises core quota to 5,000/hour.                                                          |
| SerpAPI                   | Google search, Google News/Search-style discovery, Google Patents structured results | API key required      | Free tier, then paid                 | Key available; implementation pending         | Useful as a general search layer for company research, patents, news discovery, and targeted Google queries.                                                   |
| Product Hunt              | Launch history, upvotes, comments                                                    | OAuth/developer token | Free token                           | Credentials available; implementation pending | GraphQL API requires bearer token. Current `.env` credentials are enough for public/client-credentials reads; real redirect URI is only needed for user OAuth. |
| Trustpilot                | Business/review data                                                                 | API key or OAuth      | Free public key; paid business API   | Not implemented                               | Public API uses `apikey`; Business/API module access is paid or plan-based.                                                                                    |
| G2                        | B2B reviews, categories, products                                                    | Access token or OAuth | Limited free/sandbox; paid for scale | Not implemented                               | Developer portal mentions starter calls; serious workflows are commercial.                                                                                     |
| Capterra Ads API          | Paid click/campaign data                                                             | API key               | Account/paid ads dependent           | Not implemented                               | Useful for ad click data, not broad free review data.                                                                                                          |
| Apple iTunes Search API   | Public App Store metadata and ratings counts                                         | No token              | Free public                          | Implemented                                   | Does not provide full competitor review text.                                                                                                                  |
| Google Play Developer API | Own-app Play data, reviews, publishing                                               | OAuth/service account | Free API, account-scoped             | Not implemented                               | No separate API fee, but only for apps/accounts you can access in Play Console.                                                                                |
| X API                     | Real-time sentiment and posts                                                        | Bearer token / OAuth  | Paid / pay-per-use                   | Not implemented                               | Free access is case-by-case public utility only.                                                                                                               |

### Lower Practicality / Avoid First

| Source                                                      | Auth Reality                             | Cost                                      | Priority | Recommendation                                                                                                  |
| ----------------------------------------------------------- | ---------------------------------------- | ----------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| LinkedIn                                                    | OAuth with restricted access             | Paid/restricted                           | Low      | Official APIs require approved use cases and user/org permissions. Web/search-based research is more realistic. |
| Glassdoor                                                   | Legacy partner key only                  | Partner-gated                             | Low      | Public partner API access is effectively closed/restricted to partners. Avoid relying on it.                    |
| MCA21                                                       | Portal login/OTP; no public official API | Mostly free portal; paid third-party APIs | Medium   | Implemented only as manual portal guidance. Do not bypass access controls.                                      |
| Zauba / Tofler / Tracxn / VCCEdge / PitchBook / CB Insights | Account/paywall                          | Freemium to paid enterprise               | Varies   | Treat as paid data providers or browser/search workflows unless subscriptions are available.                    |
| Screener.in                                                 | No official API                          | Free pages; paid unofficial APIs          | Medium   | Public helper implemented, but scraping should remain conservative.                                             |
| SEMrush / Ahrefs                                            | API key / paid subscription              | Paid                                      | Medium   | Add only if SEO intelligence becomes core.                                                                      |

### Free/Freemium Alternatives To Crunchbase And Similarweb

| Need                         | Free/Freemium Option                       | Status                     | Notes                                                                                                                                                  |
| ---------------------------- | ------------------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Startup/company discovery    | StartupGraph public API                    | Candidate                  | Public no-auth API with company search, profiles, funding history, people, headcount, and OSS project endpoints. Good Crunchbase-lite candidate.       |
| Startup seed database        | StartupWho / YC OSS API / Community Data   | Candidate                  | Useful for baseline startup lists and YC/open startup data. Not complete funding intelligence.                                                         |
| U.S. private funding signals | SEC EDGAR Form D                           | Candidate                  | Free government source for U.S. private placements. Can use direct SEC data or an Apify Form D actor. Does not cover all international/private rounds. |
| Legal entity verification    | OpenCorporates                             | Optional candidate         | API key required. Free open-data access has low limits and licence constraints; good for company identity checks.                                      |
| Website traffic estimates    | Apify Website Traffic Analysis actor       | Candidate with cost caveat | Similarweb-like estimates via Apify. May use free trial/platform credits but is not a truly unlimited free API.                                        |
| Website rank approximation   | Tranco-based tools such as TrafficPeek     | Candidate                  | Good for rough rank/traffic proxy. Similarweb-style detail may require RapidAPI/free monthly limits.                                                   |
| Full funding/investor data   | Crunchbase / PitchBook / Tracxn / Dealroom | Paid later                 | No solid free full replacement. Use paid sources only after shortlisting companies.                                                                    |

### PublicAPIs.io Candidates

`publicapis.io` is a directory, not a data provider itself. The most relevant APIs it surfaced for this product are:

| API                | Use                                                   | Auth Required?                                                                 | Free Access Reality                                                           | Recommendation                                                                       |
| ------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| OpenCorporates     | Global legal entity and director data                 | API token required (`api_token` or `X-API-TOKEN`)                              | Free only for qualifying open-data/public-benefit use; default limits are low | Useful optional company-verification tool.                                           |
| UK Companies House | Official UK company registration, officers, filings   | API key required via HTTP Basic auth (`api_key:`)                              | Free after registering for a developer key                                    | Add if UK company research matters.                                                  |
| SEC EDGAR Data     | Public U.S. company filings and financial disclosures | No API key for public data; descriptive `User-Agent` required                  | Free public data, rate-limited by SEC guidance                                | Useful for public-company research; separate from private startup funding.           |
| Finnhub Stock API  | Public-company profiles, fundamentals, market news    | API key required (`token` query param or `X-Finnhub-Token`)                    | Free tier available                                                           | Useful if we want listed-company financials/news without building SEC parsing first. |
| USPTO              | Patent/IP research beyond Google Patents              | API key required (`X-API-KEY`)                                                 | Free key available through USPTO Open Data Portal                             | Good future upgrade for U.S. patent research.                                        |
| PatentsView        | U.S. patent trend/search API                          | API key required (`X-Api-Key`)                                                 | Free key, rate-limited                                                        | Good future upgrade, but it is migrating toward USPTO ODP.                           |
| EPO OPS            | European/worldwide patent data                        | OAuth client credentials; bearer token required                                | Free registration, token expires roughly every 20 minutes                     | Useful later if international patent coverage matters.                               |
| World News API     | Alternate news coverage                               | API key required (`api-key` query param or `x-api-key`)                        | Free tier available with daily points                                         | Backup if NewsAPI limits are too restrictive.                                        |
| NewsData.io        | Alternate news coverage                               | API key required (`apikey` or `X-ACCESS-KEY`)                                  | Free tier available with daily credits                                        | Backup news provider.                                                                |
| Currents           | Alternate news coverage                               | API key/bearer token required                                                  | Free tier available                                                           | Backup news provider.                                                                |
| Reddit API         | Public posts/comments/subreddits                      | OAuth/API credentials required                                                 | Free eligible usage, rate-limited                                             | Useful social-sentiment source; get credentials before implementation.               |
| IP2WHOIS           | Domain age, WHOIS, registration metadata              | API key required (`key`/`apiKey`)                                              | Free tier around 500 WHOIS lookups/month                                      | Useful enrichment for company/domain age.                                            |
| Host.io            | Domain/DNS/web metadata                               | API token required (`Authorization: Bearer`, Basic auth, or token query param) | Free plan exists with limits                                                  | Useful for domain/web footprint enrichment.                                          |
| FullHunt           | Domain/company attack-surface metadata                | API key required (`X-API-KEY`)                                                 | Free tier varies by account                                                   | Interesting for tech/security footprint, but not core MVP.                           |

## Scraper And Shortcut Options

| Option                                   | Type                                                    | Covers                                                                                         | Priority                          | Notes                                                                                                    |
| ---------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Exa Company Researcher                   | Open-source company research app using Exa Search API   | Company overview, funding/profile links, news, competitors, Reddit/GitHub/social signals       | Best all-in-one starting point    | Good fit if we are okay using Exa as the search layer instead of maintaining many source scrapers.       |
| Firecrawl / Crawl4AI                     | Open-source or hosted web crawling and extraction layer | Clean Markdown/JSON from company sites, blogs, changelogs, docs, pricing pages, search results | Best generic scraper foundation   | Use for website/product intelligence and source extraction after search finds URLs.                      |
| Apify Product Hunt Scrapers              | Hosted actors                                           | Launches, makers, comments, votes, topics, daily/trending/search data                          | High leverage                     | Can avoid custom Product Hunt scraping; requires Apify usage/token and actor costs.                      |
| Apify Reddit Scraper                     | Hosted actor                                            | Posts, comments, communities, users, keyword and subreddit scraping                            | Useful but ToS-sensitive          | Fastest path for Reddit data, but official Reddit API/MCP is safer for production.                       |
| Dialog Reddit Research MCP               | Hosted Reddit intelligence/MCP                          | Semantic search across indexed subreddits with citations                                       | Very relevant                     | Good for market/customer-discovery workflows where evidence and citations matter.                        |
| Company Detective                        | Open-source company research project                    | Company summaries from web, Crunchbase via Scrapfly, Reddit, app store reviews, news           | Relevant reference implementation | Useful to borrow architecture; still needs API keys like OpenAI, Reddit, Google CSE, Scrapfly, Airtable. |
| StartupWho / YC OSS API / Community Data | Free/open startup datasets                              | Startup profiles, YC company data, open people/company graph                                   | Best free startup seed data       | Great for baseline startup discovery; not a replacement for fresh funding intelligence.                  |
| Apify Crunchbase / PitchBook actors      | Hosted scrapers/actors                                  | Funding/company/investor data from gated sources                                               | Use cautiously                    | Can save time, but legal/account risk is higher and some still require source credentials/API keys.      |
| SEC-focused APIs: Finqual / StockFit     | Free-tier SEC data APIs                                 | Public-company fundamentals, insider trades, 13F, filings                                      | Good for listed companies only    | Useful for investing workflows, not private startup research.                                            |
| OpenCorporates / AgentWeb                | Free or open corporate/business directories             | Legal entities, addresses, business directory info                                             | Good enrichment layer             | Useful for entity verification and business basics; not startup funding/moat intelligence.               |

## Community Signals

| Channel               | Finding                                                                                                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reddit                | Search did not surface a dominant free Crunchbase-style scraper recommendation. Practical Reddit data access is via official Reddit API/Devvit, Apify scrapers, or Reddit research MCPs. |
| Hacker News           | Repeated theme: Crunchbase alternatives are incomplete; stitch public sources, SEC/Form D, OpenCorporates, GitHub, news scraping, and paid data only for shortlisted companies.          |
| Indie Hackers         | Common pain point is expensive PitchBook/Crunchbase data. Suggested shortcuts include Parsers VC, enrichment APIs, and Apify-style investor/data scrapers.                               |
| Investing communities | For public markets, people lean on SEC/EDGAR-derived APIs and scrapers rather than startup databases. Finqual and StockFit-like APIs reduce EDGAR parsing work.                          |

## Recommended Next Build Order

1. Wire the implemented public helpers in `src/lib/public-data-sources.ts` into AI-callable tools.
2. Add NewsAPI because the API key is now available.
3. Add Hunter.io because the API key is now available.
4. Add SerpAPI as a shared Google/search helper because the key is available and it has a free tier.
5. Add GitHub public org/repo lookup after adding a free GitHub token.
6. Add Product Hunt using the official GraphQL API and available client credentials.
7. Add Reddit via official API after adding free OAuth app credentials, or use a Reddit research MCP before considering scraping.
8. Evaluate StartupGraph and SEC Form D as free Crunchbase-lite funding/company alternatives.
9. Evaluate Apify Website Traffic Analysis or Tranco-style rank data as a Similarweb-lite alternative.
10. Skip BuiltWith for now because useful access is paid.
11. Use paid sources like Crunchbase, Similarweb, G2, Trustpilot, or X only after the free/public pipeline proves useful.

## Development Notes

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to optimize and load fonts.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

ADDED API keys :
NEWS_API_KEY
HUNTER_API_KEY
SERP_API_KEY
PRODUCT_HUNT_API_KEY
PRODUCT_HUNT_API_SECRET
PRODUCT_HUNT_REDIRECT_URI
GITHUB_KEY
WORLD_NEWS_API_KEY
NEWS_DATA_IO_API_KEY
