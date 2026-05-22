import {
  createGooglePatentsSearch,
  createScreenerCompanyUrl,
  fetchCompanyTeamPage,
  getLatestWaybackSnapshot,
  searchAppStoreApps,
  searchWaybackCaptures,
} from "./public-data-sources"
import {
  getConfiguredApiSources,
  getGitHubOrgProfile,
  searchGitHub,
  searchHunterDomain,
  searchNewsApi,
  searchNewsData,
  searchProductHuntPosts,
  searchSerpApi,
  searchWorldNews,
} from "./keyed-data-sources"

export type CompanyResearchSweepOptions = {
  companyName: string
  domain?: string
  appSearchTerm?: string
  githubOrg?: string
  screenerSymbol?: string
  includeProductHunt?: boolean
}

export type ResearchToolResult =
  | {
      ok: true
      name: string
      data: unknown
    }
  | {
      ok: false
      name: string
      error: string
    }

async function captureToolResult<T>(
  name: string,
  run: () => Promise<T> | T,
): Promise<ResearchToolResult> {
  try {
    return {
      ok: true,
      name,
      data: await run(),
    }
  } catch (error) {
    return {
      ok: false,
      name,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export type CompanyResearchSweepResult = {
  companyName: string
  domain?: string
  configuredSources: ReturnType<typeof getConfiguredApiSources>
  results: ResearchToolResult[]
}

export async function runCompanyResearchSweep(
  options: CompanyResearchSweepOptions,
): Promise<CompanyResearchSweepResult> {
  const query = options.domain
    ? `${options.companyName} ${options.domain}`
    : options.companyName
  const results: Array<Promise<ResearchToolResult>> = [
    captureToolResult("newsapi.search", () =>
      searchNewsApi({ query, pageSize: 5, sortBy: "publishedAt" }),
    ),
    captureToolResult("world_news.search", () =>
      searchWorldNews({ text: query, number: 5 }),
    ),
    captureToolResult("newsdata.search", () =>
      searchNewsData({ query, size: 5 }),
    ),
    // Brand search: just the company name to trigger knowledge_graph, answer_box, related_questions
    captureToolResult("serpapi.brand_search", () =>
      searchSerpApi({ query: options.companyName, num: 5 }),
    ),
    // Funding/founders search
    captureToolResult("serpapi.company_search", () =>
      searchSerpApi({ query: `${query} startup funding founders`, num: 5 }),
    ),
    captureToolResult("serpapi.news_search", () =>
      searchSerpApi({ query, engine: "google_news", num: 5 }),
    ),
    // LinkedIn company & people search via Google
    captureToolResult("serpapi.linkedin_search", () =>
      searchSerpApi({
        query: `site:linkedin.com/company ${options.companyName} OR site:linkedin.com/in ${options.companyName} founder`,
        num: 5,
      }),
    ),
    captureToolResult("github.search", () =>
      searchGitHub({ query: `${options.companyName} in:name`, perPage: 5 }),
    ),
    captureToolResult("app_store.search", () =>
      searchAppStoreApps({
        term: options.appSearchTerm ?? options.companyName,
        limit: 5,
      }),
    ),
    captureToolResult("google_patents.search_url", () =>
      createGooglePatentsSearch({ query: options.companyName }),
    ),
  ]

  if (options.domain) {
    const domain = options.domain

    results.push(
      captureToolResult("wayback.latest", () =>
        getLatestWaybackSnapshot({ url: domain }),
      ),
      captureToolResult("wayback.cdx", () =>
        searchWaybackCaptures({
          url: domain,
          limit: 10,
          collapse: "digest",
        }),
      ),
      // Company profile & social links via Hunter (limit emails to preserve credits)
      captureToolResult("hunter.domain_search", () =>
        searchHunterDomain({ domain, limit: 3 }),
      ),
      // Scrape the company website's team/about page for actual team members
      captureToolResult("company_website.team", () =>
        fetchCompanyTeamPage(domain),
      ),
    )
  }

  if (options.githubOrg) {
    results.push(
      captureToolResult("github.org_profile", () =>
        getGitHubOrgProfile(options.githubOrg as string, {
          includeRepositories: true,
          repositoryLimit: 5,
        }),
      ),
    )
  }

  if (options.screenerSymbol) {
    results.push(
      captureToolResult("screener.company_url", () =>
        createScreenerCompanyUrl({ symbol: options.screenerSymbol as string }),
      ),
    )
  }

  if (options.includeProductHunt) {
    // Search by company name instead of fetching unrelated latest posts
    results.push(
      captureToolResult("product_hunt.company_search", () =>
        searchProductHuntPosts({ query: options.companyName, first: 5 }),
      ),
    )
  }

  return {
    companyName: options.companyName,
    domain: options.domain,
    configuredSources: getConfiguredApiSources(),
    results: await Promise.all(results),
  }
}
