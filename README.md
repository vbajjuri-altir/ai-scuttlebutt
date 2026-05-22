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

| Source | Status | Functions | Notes |
| --- | --- | --- | --- |
| Wayback CDX / Internet Archive | Implemented | `buildWaybackCdxUrl`, `searchWaybackCaptures`, `buildWaybackAvailableUrl`, `getLatestWaybackSnapshot` | Public/no-token. Supports structured CDX capture search and latest snapshot lookup. |
| Apple iTunes Search API | Implemented | `buildITunesSearchUrl`, `searchAppStoreApps`, `buildITunesLookupUrl`, `lookupAppStoreApp` | Public/no-token. Supports App Store app search and lookup by app id or bundle id. |
| Google Patents public web | Implemented with limitations | `buildGooglePatentsSearchUrl`, `createGooglePatentsSearch`, `fetchGooglePatentPageMetadata` | No official API. Helpers generate search URLs and conservatively fetch single patent page metadata. |
| Screener.in public pages | Implemented with limitations | `buildScreenerCompanyUrl`, `createScreenerCompanyUrl`, `fetchScreenerCompanySummary` | No official API. Public URL generation plus simple public summary extraction where accessible. |
| MCA portal | Implemented as manual-access helper | `createMcaPortalAccess` | No public official API. Does not bypass login, OTP, captcha, session, or access controls. |

Validation performed after implementation:

- `npx tsc --noEmit` passed.
- `npm run lint` passed with one pre-existing unrelated warning in `src/app/layout.tsx`.
- No linter issues were found in `src/lib/public-data-sources.ts`.

## API And Source Research

### Cost Buckets

| Cost Bucket | Sources |
| --- | --- |
| Free public / no token | Wayback CDX, Apple iTunes Search API, Google Patents web, public web pages like Screener/MCA portal when manually accessed. |
| Free but token required | GitHub authenticated API, Product Hunt developer token, limited Reddit eligible use, Trustpilot public API key, limited BuiltWith Free API. |
| Freemium / limited trial | NewsAPI developer plan, Hunter.io credits, BuiltWith free API plus paid credits, G2 starter/sandbox access, SerpApi for structured Google Patents. |
| Paid / sales-led | Crunchbase, Similarweb, X API, SEMrush/Ahrefs, PitchBook, CB Insights, Tracxn, VCCEdge, deeper Trustpilot/G2/Capterra business APIs. |

### Primary APIs From `prd.md`

| Tool/API | Use | Auth | Cost | Implementation Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Crunchbase | Funding, founders, investors, acquisitions | API key required | Paid / sales-led | Not implemented | Full API requires Enterprise or Applications license. Basic API is no longer offered to new users. |
| Similarweb | Traffic, engagement, geography, referrals | API key required | Paid / trial | Not implemented | API is part of Business/Enterprise or standalone package, priced with data credits. |
| NewsAPI | Press mentions and news search | API key required | Free dev, paid production | Not implemented | Free developer plan is limited to development/testing. Production requires paid plan. |
| Hunter.io | Domain emails, email verification, enrichment | API key required | Freemium credits | Not implemented | Free plan includes limited monthly credits; paid plans or data-platform credits needed at scale. |
| Reddit API / PRAW | Community sentiment and discussion search | OAuth app credentials required | Free limited; paid commercial | Not implemented | Free eligible use is rate-limited. Commercial/high-volume use requires Reddit agreement. |
| BuiltWith | Technology stack and website changes | API key required | Free limited; paid for detail | Not implemented | Free API exists but is limited; fuller APIs use paid plans or credits. |
| Wayback CDX / Internet Archive | Historical website captures and product evolution | No token for public index | Free public | Implemented | Public CDX queries generally work without a token. |
| Google Patents | Patent/IP search | No official API | Free web; paid structured API via third parties | Implemented with limitations | Public web helper only. No SerpApi/SearchAPI dependency added. |

### Additional Practical Sources

| Source | Use | Auth | Cost | Implementation Status | Notes |
| --- | --- | --- | --- | --- | --- |
| GitHub | Open-source repos, commits, issues, stars | Optional token | Free | Not implemented | Unauthenticated public data is limited to 60 requests/hour/IP; token raises core quota to 5,000/hour. |
| Product Hunt | Launch history, upvotes, comments | OAuth/developer token | Free token | Not implemented | GraphQL API requires bearer token; developer token is available from API dashboard. |
| Trustpilot | Business/review data | API key or OAuth | Free public key; paid business API | Not implemented | Public API uses `apikey`; Business/API module access is paid or plan-based. |
| G2 | B2B reviews, categories, products | Access token or OAuth | Limited free/sandbox; paid for scale | Not implemented | Developer portal mentions starter calls; serious workflows are commercial. |
| Capterra Ads API | Paid click/campaign data | API key | Account/paid ads dependent | Not implemented | Useful for ad click data, not broad free review data. |
| Apple iTunes Search API | Public App Store metadata and ratings counts | No token | Free public | Implemented | Does not provide full competitor review text. |
| Google Play Developer API | Own-app Play data, reviews, publishing | OAuth/service account | Free API, account-scoped | Not implemented | No separate API fee, but only for apps/accounts you can access in Play Console. |
| X API | Real-time sentiment and posts | Bearer token / OAuth | Paid / pay-per-use | Not implemented | Free access is case-by-case public utility only. |

### Lower Practicality / Avoid First

| Source | Auth Reality | Cost | Priority | Recommendation |
| --- | --- | --- | --- | --- |
| LinkedIn | OAuth with restricted access | Paid/restricted | Low | Official APIs require approved use cases and user/org permissions. Web/search-based research is more realistic. |
| Glassdoor | Legacy partner key only | Partner-gated | Low | Public partner API access is effectively closed/restricted to partners. Avoid relying on it. |
| MCA21 | Portal login/OTP; no public official API | Mostly free portal; paid third-party APIs | Medium | Implemented only as manual portal guidance. Do not bypass access controls. |
| Zauba / Tofler / Tracxn / VCCEdge / PitchBook / CB Insights | Account/paywall | Freemium to paid enterprise | Varies | Treat as paid data providers or browser/search workflows unless subscriptions are available. |
| Screener.in | No official API | Free pages; paid unofficial APIs | Medium | Public helper implemented, but scraping should remain conservative. |
| SEMrush / Ahrefs | API key / paid subscription | Paid | Medium | Add only if SEO intelligence becomes core. |

## Scraper And Shortcut Options

| Option | Type | Covers | Priority | Notes |
| --- | --- | --- | --- | --- |
| Exa Company Researcher | Open-source company research app using Exa Search API | Company overview, funding/profile links, news, competitors, Reddit/GitHub/social signals | Best all-in-one starting point | Good fit if we are okay using Exa as the search layer instead of maintaining many source scrapers. |
| Firecrawl / Crawl4AI | Open-source or hosted web crawling and extraction layer | Clean Markdown/JSON from company sites, blogs, changelogs, docs, pricing pages, search results | Best generic scraper foundation | Use for website/product intelligence and source extraction after search finds URLs. |
| Apify Product Hunt Scrapers | Hosted actors | Launches, makers, comments, votes, topics, daily/trending/search data | High leverage | Can avoid custom Product Hunt scraping; requires Apify usage/token and actor costs. |
| Apify Reddit Scraper | Hosted actor | Posts, comments, communities, users, keyword and subreddit scraping | Useful but ToS-sensitive | Fastest path for Reddit data, but official Reddit API/MCP is safer for production. |
| Dialog Reddit Research MCP | Hosted Reddit intelligence/MCP | Semantic search across indexed subreddits with citations | Very relevant | Good for market/customer-discovery workflows where evidence and citations matter. |
| Company Detective | Open-source company research project | Company summaries from web, Crunchbase via Scrapfly, Reddit, app store reviews, news | Relevant reference implementation | Useful to borrow architecture; still needs API keys like OpenAI, Reddit, Google CSE, Scrapfly, Airtable. |
| StartupWho / YC OSS API / Community Data | Free/open startup datasets | Startup profiles, YC company data, open people/company graph | Best free startup seed data | Great for baseline startup discovery; not a replacement for fresh funding intelligence. |
| Apify Crunchbase / PitchBook actors | Hosted scrapers/actors | Funding/company/investor data from gated sources | Use cautiously | Can save time, but legal/account risk is higher and some still require source credentials/API keys. |
| SEC-focused APIs: Finqual / StockFit | Free-tier SEC data APIs | Public-company fundamentals, insider trades, 13F, filings | Good for listed companies only | Useful for investing workflows, not private startup research. |
| OpenCorporates / AgentWeb | Free or open corporate/business directories | Legal entities, addresses, business directory info | Good enrichment layer | Useful for entity verification and business basics; not startup funding/moat intelligence. |

## Community Signals

| Channel | Finding |
| --- | --- |
| Reddit | Search did not surface a dominant free Crunchbase-style scraper recommendation. Practical Reddit data access is via official Reddit API/Devvit, Apify scrapers, or Reddit research MCPs. |
| Hacker News | Repeated theme: Crunchbase alternatives are incomplete; stitch public sources, SEC/Form D, OpenCorporates, GitHub, news scraping, and paid data only for shortlisted companies. |
| Indie Hackers | Common pain point is expensive PitchBook/Crunchbase data. Suggested shortcuts include Parsers VC, enrichment APIs, and Apify-style investor/data scrapers. |
| Investing communities | For public markets, people lean on SEC/EDGAR-derived APIs and scrapers rather than startup databases. Finqual and StockFit-like APIs reduce EDGAR parsing work. |

## Recommended Next Build Order

1. Wire the implemented public helpers in `src/lib/public-data-sources.ts` into AI-callable tools.
2. Add GitHub public org/repo lookup because it is free and high-signal.
3. Add NewsAPI only if development/test news search is enough, or after choosing a paid production news provider.
4. Add Product Hunt using the official GraphQL API and developer token.
5. Add Reddit via official API or a Reddit research MCP before considering scraping.
6. Use paid sources like Crunchbase, Similarweb, G2, Trustpilot, or X only after the free/public pipeline proves useful.

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
