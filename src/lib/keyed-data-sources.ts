type Fetcher = typeof fetch

type FetchJsonOptions = {
  fetcher?: Fetcher
  apiKey?: string
}

type JsonObject = Record<string, unknown>

const DEFAULT_USER_AGENT =
  "ai-scuttlebutt/0.1 keyed-source-research (+https://example.invalid)"

class MissingApiKeyError extends Error {
  constructor(source: string, envNames: string[]) {
    super(`Missing ${source} API key. Set one of: ${envNames.join(", ")}`)
    this.name = "MissingApiKeyError"
  }
}

function getEnvValue(envNames: string[], source: string): string {
  for (const envName of envNames) {
    const value = process.env[envName]?.trim()

    if (value) {
      return value
    }
  }

  throw new MissingApiKeyError(source, envNames)
}

function getOptionalEnvValue(envNames: string[]): string | undefined {
  for (const envName of envNames) {
    const value = process.env[envName]?.trim()

    if (value) {
      return value
    }
  }

  return undefined
}

function redactedUrl(url: URL, paramsToRedact: string[] = []): string {
  const safeUrl = new URL(url)

  for (const paramName of paramsToRedact) {
    if (safeUrl.searchParams.has(paramName)) {
      safeUrl.searchParams.set(paramName, "REDACTED")
    }
  }

  return safeUrl.toString()
}

async function fetchJson<T>(
  url: URL,
  {
    fetcher,
    headers,
    method,
    body,
  }: FetchJsonOptions & {
    headers?: HeadersInit
    method?: "GET" | "POST"
    body?: BodyInit
  } = {},
): Promise<T> {
  const response = await (fetcher ?? fetch)(url, {
    method,
    body,
    headers: {
      Accept: "application/json",
      "User-Agent": DEFAULT_USER_AGENT,
      ...headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "")
    throw new Error(
      `Request failed with ${response.status} for ${redactedUrl(url, [
        "apiKey",
        "apikey",
        "api_key",
        "token",
      ])}${errorText ? `: ${errorText.slice(0, 240)}` : ""}`,
    )
  }

  return (await response.json()) as T
}

function asArray(value: unknown): JsonObject[] {
  return Array.isArray(value) ? value.filter((item): item is JsonObject => Boolean(item)) : []
}

function compactObject<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null),
  ) as T
}

export type ConfiguredApiSource = {
  source: string
  configured: boolean
  envNames: string[]
}

export function getConfiguredApiSources(): ConfiguredApiSource[] {
  const sources: Array<{ source: string; envNames: string[] }> = [
    { source: "newsapi", envNames: ["NEWS_API_KEY"] },
    { source: "hunter", envNames: ["HUNTER_API_KEY"] },
    { source: "serpapi", envNames: ["SERP_API_KEY"] },
    { source: "product_hunt_key", envNames: ["PRODUCT_HUNT_API_KEY"] },
    { source: "product_hunt_secret", envNames: ["PRODUCT_HUNT_API_SECRET"] },
    { source: "github", envNames: ["GITHUB_KEY", "GITHUB_TOKEN"] },
    { source: "world_news", envNames: ["WORLD_NEWS_API_KEY"] },
    { source: "newsdata", envNames: ["NEWS_DATA_IO_API_KEY", "NEWSDATA_API_KEY"] },
  ]

  return sources.map((source) => ({
    ...source,
    configured: Boolean(getOptionalEnvValue(source.envNames)),
  }))
}

export type NewsApiSearchOptions = {
  query: string
  language?: string
  from?: string
  to?: string
  sortBy?: "relevancy" | "popularity" | "publishedAt"
  pageSize?: number
  page?: number
}

export type NewsArticle = {
  title?: string
  description?: string
  url?: string
  source?: string
  author?: string
  publishedAt?: string
  content?: string
  imageUrl?: string
  sentiment?: number | string
  keywords?: string[]
  categories?: string[]
}

export type NewsApiSearchResult = {
  source: "newsapi"
  query: NewsApiSearchOptions
  requestUrl: string
  totalResults?: number
  articles: NewsArticle[]
}

export async function searchNewsApi(
  options: NewsApiSearchOptions,
  fetchOptions: FetchJsonOptions = {},
): Promise<NewsApiSearchResult> {
  const apiKey = fetchOptions.apiKey ?? getEnvValue(["NEWS_API_KEY"], "NewsAPI")
  const url = new URL("https://newsapi.org/v2/everything")
  url.searchParams.set("q", options.query)
  url.searchParams.set("language", options.language ?? "en")
  url.searchParams.set("sortBy", options.sortBy ?? "publishedAt")
  url.searchParams.set("pageSize", String(options.pageSize ?? 10))
  url.searchParams.set("page", String(options.page ?? 1))

  if (options.from) {
    url.searchParams.set("from", options.from)
  }

  if (options.to) {
    url.searchParams.set("to", options.to)
  }

  const payload = await fetchJson<JsonObject>(url, {
    ...fetchOptions,
    headers: { "X-Api-Key": apiKey },
  })

  return {
    source: "newsapi",
    query: options,
    requestUrl: url.toString(),
    totalResults: typeof payload.totalResults === "number" ? payload.totalResults : undefined,
    articles: asArray(payload.articles).map((article) => ({
      title: typeof article.title === "string" ? article.title : undefined,
      description: typeof article.description === "string" ? article.description : undefined,
      url: typeof article.url === "string" ? article.url : undefined,
      source:
        typeof (article.source as JsonObject | undefined)?.name === "string"
          ? ((article.source as JsonObject).name as string)
          : undefined,
      author: typeof article.author === "string" ? article.author : undefined,
      publishedAt: typeof article.publishedAt === "string" ? article.publishedAt : undefined,
      content: typeof article.content === "string" ? article.content : undefined,
    })),
  }
}

export type WorldNewsSearchOptions = {
  text: string
  language?: string
  number?: number
  sourceCountry?: string
  earliestPublishDate?: string
  latestPublishDate?: string
}

export type WorldNewsSearchResult = {
  source: "world_news"
  query: WorldNewsSearchOptions
  requestUrl: string
  articles: NewsArticle[]
  rawCount?: number
}

export async function searchWorldNews(
  options: WorldNewsSearchOptions,
  fetchOptions: FetchJsonOptions = {},
): Promise<WorldNewsSearchResult> {
  const apiKey =
    fetchOptions.apiKey ?? getEnvValue(["WORLD_NEWS_API_KEY"], "World News API")
  const url = new URL("https://api.worldnewsapi.com/search-news")
  url.searchParams.set("text", options.text)
  url.searchParams.set("language", options.language ?? "en")
  url.searchParams.set("number", String(options.number ?? 10))

  if (options.sourceCountry) {
    url.searchParams.set("source-country", options.sourceCountry)
  }

  if (options.earliestPublishDate) {
    url.searchParams.set("earliest-publish-date", options.earliestPublishDate)
  }

  if (options.latestPublishDate) {
    url.searchParams.set("latest-publish-date", options.latestPublishDate)
  }

  const payload = await fetchJson<JsonObject>(url, {
    ...fetchOptions,
    headers: { "x-api-key": apiKey },
  })
  const articles = asArray(payload.news)

  return {
    source: "world_news",
    query: options,
    requestUrl: url.toString(),
    rawCount: articles.length,
    articles: articles.map((article) => ({
      title: typeof article.title === "string" ? article.title : undefined,
      description: typeof article.summary === "string" ? article.summary : undefined,
      url: typeof article.url === "string" ? article.url : undefined,
      source: typeof article.source === "string" ? article.source : undefined,
      author: typeof article.author === "string" ? article.author : undefined,
      publishedAt:
        typeof article.publish_date === "string" ? article.publish_date : undefined,
      imageUrl: typeof article.image === "string" ? article.image : undefined,
      sentiment:
        typeof article.sentiment === "number"
          ? article.sentiment
          : typeof article.sentiment === "string"
            ? article.sentiment
            : undefined,
      categories:
        typeof article.category === "string"
          ? [article.category]
          : Array.isArray(article.category)
            ? (article.category as unknown[]).filter((c): c is string => typeof c === "string")
            : undefined,
    })),
  }
}

export type NewsDataSearchOptions = {
  query: string
  language?: string
  country?: string
  category?: string
  size?: number
}

export type NewsDataSearchResult = {
  source: "newsdata"
  query: NewsDataSearchOptions
  requestUrl: string
  articles: NewsArticle[]
  nextPage?: string
}

export async function searchNewsData(
  options: NewsDataSearchOptions,
  fetchOptions: FetchJsonOptions = {},
): Promise<NewsDataSearchResult> {
  const apiKey =
    fetchOptions.apiKey ?? getEnvValue(["NEWS_DATA_IO_API_KEY", "NEWSDATA_API_KEY"], "NewsData.io")
  const url = new URL("https://newsdata.io/api/1/news")
  url.searchParams.set("q", options.query)
  url.searchParams.set("language", options.language ?? "en")
  url.searchParams.set("size", String(options.size ?? 10))

  if (options.country) {
    url.searchParams.set("country", options.country)
  }

  if (options.category) {
    url.searchParams.set("category", options.category)
  }

  const payload = await fetchJson<JsonObject>(url, {
    ...fetchOptions,
    headers: { "X-ACCESS-KEY": apiKey },
  })

  return {
    source: "newsdata",
    query: options,
    requestUrl: url.toString(),
    nextPage: typeof payload.nextPage === "string" ? payload.nextPage : undefined,
    articles: asArray(payload.results).map((article) => ({
      title: typeof article.title === "string" ? article.title : undefined,
      description:
        typeof article.description === "string" ? article.description : undefined,
      url: typeof article.link === "string" ? article.link : undefined,
      source:
        typeof article.source_id === "string" ? article.source_id : undefined,
      author: Array.isArray(article.creator)
        ? article.creator.filter((item): item is string => typeof item === "string").join(", ")
        : undefined,
      publishedAt: typeof article.pubDate === "string" ? article.pubDate : undefined,
      content: typeof article.content === "string" ? article.content : undefined,
      imageUrl: typeof article.image_url === "string" ? article.image_url : undefined,
      sentiment:
        typeof article.sentiment === "string" ? article.sentiment : undefined,
      keywords: Array.isArray(article.keywords)
        ? (article.keywords as unknown[]).filter((k): k is string => typeof k === "string")
        : undefined,
      categories: Array.isArray(article.category)
        ? (article.category as unknown[]).filter((c): c is string => typeof c === "string")
        : undefined,
    })),
  }
}

// ---------------------------------------------------------------------------
// Hunter.io – Domain Search (people index)
// ---------------------------------------------------------------------------

export type HunterDomainSearchOptions = {
  domain: string
  /** Max people to return (default 10, free plan max 10). */
  limit?: number
  department?: string
  seniority?: string
}

export type HunterPerson = {
  firstName?: string
  lastName?: string
  position?: string
  department?: string
  seniority?: string
  linkedin?: string
  twitter?: string
  phoneNumber?: string
}

export type HunterDomainSearchResult = {
  source: "hunter_domain_search"
  query: HunterDomainSearchOptions
  requestUrl: string
  domain?: string
  organization?: string
  totalResults?: number
  people: HunterPerson[]
}

/**
 * Fetch people associated with a domain from Hunter's domain-search endpoint.
 * We filter for `required_field=full_name,position` to only return actual team
 * members (not generic email addresses without identity), and we omit email
 * values entirely since the caller doesn't need them.
 */
export async function searchHunterDomain(
  options: HunterDomainSearchOptions,
  fetchOptions: FetchJsonOptions = {},
): Promise<HunterDomainSearchResult> {
  const apiKey = fetchOptions.apiKey ?? getEnvValue(["HUNTER_API_KEY"], "Hunter.io")
  const url = new URL("https://api.hunter.io/v2/domain-search")
  url.searchParams.set("domain", options.domain)
  url.searchParams.set("limit", String(options.limit ?? 10))
  // Only return people who have both a full name and a job position
  url.searchParams.set("required_field", "full_name,position")
  // Personal emails only (not role-based like info@, support@)
  url.searchParams.set("type", "personal")

  if (options.department) {
    url.searchParams.set("department", options.department)
  }
  if (options.seniority) {
    url.searchParams.set("seniority", options.seniority)
  }

  const payload = await fetchJson<JsonObject>(url, {
    ...fetchOptions,
    headers: { "X-API-KEY": apiKey },
  })
  const data = (payload.data as JsonObject | undefined) ?? {}
  const meta = (payload.meta as JsonObject | undefined) ?? {}

  return {
    source: "hunter_domain_search",
    query: options,
    requestUrl: url.toString(),
    domain: typeof data.domain === "string" ? data.domain : undefined,
    organization: typeof data.organization === "string" ? data.organization : undefined,
    totalResults: typeof meta.results === "number" ? meta.results : undefined,
    people: asArray(data.emails).map((email) => compactObject({
      firstName: typeof email.first_name === "string" ? email.first_name : undefined,
      lastName: typeof email.last_name === "string" ? email.last_name : undefined,
      position: typeof email.position === "string" ? email.position : undefined,
      department: typeof email.department === "string" ? email.department : undefined,
      seniority: typeof email.seniority === "string" ? email.seniority : undefined,
      linkedin: typeof email.linkedin === "string" ? email.linkedin : undefined,
      twitter: typeof email.twitter === "string" ? email.twitter : undefined,
      phoneNumber: typeof email.phone_number === "string" ? email.phone_number : undefined,
    })) as HunterPerson[],
  }
}

// ---------------------------------------------------------------------------
// Hunter.io – Company Enrichment (/v2/companies/find)
// ---------------------------------------------------------------------------

export type HunterFundingRound = {
  date?: string
  series?: string
  amount?: number
  currency?: string
  investors?: string[]
}

export type HunterCompanyEnrichmentResult = {
  source: "hunter_company_enrichment"
  domain: string
  requestUrl: string
  name?: string
  legalName?: string
  description?: string
  foundedYear?: number
  location?: string
  logo?: string
  tags?: string[]
  category?: {
    sector?: string
    industryGroup?: string
    industry?: string
    subIndustry?: string
  }
  metrics?: {
    employees?: string
    trafficRank?: string
    estimatedAnnualRevenue?: string
    raised?: number
    marketCap?: number
  }
  tech?: string[]
  techCategories?: string[]
  social?: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
    crunchbase?: string
  }
  phone?: string
  emailProvider?: string
  companyType?: string
  fundingRounds?: HunterFundingRound[]
}

/**
 * Fetch rich company intelligence from Hunter's Company Enrichment endpoint.
 * Returns technologies, tech categories, funding rounds, metrics, social links,
 * industry classification, and more — completely separate from the emails index.
 */
export async function getHunterCompanyEnrichment(
  domain: string,
  fetchOptions: FetchJsonOptions = {},
): Promise<HunterCompanyEnrichmentResult> {
  const apiKey = fetchOptions.apiKey ?? getEnvValue(["HUNTER_API_KEY"], "Hunter.io")
  const url = new URL("https://api.hunter.io/v2/companies/find")
  url.searchParams.set("domain", domain)

  const payload = await fetchJson<JsonObject>(url, {
    ...fetchOptions,
    headers: { "X-API-KEY": apiKey },
  })
  const d = (payload.data as JsonObject | undefined) ?? {}
  const category = (d.category as JsonObject | undefined) ?? {}
  const metrics = (d.metrics as JsonObject | undefined) ?? {}
  const linkedin = (d.linkedin as JsonObject | undefined) ?? {}
  const twitter = (d.twitter as JsonObject | undefined) ?? {}
  const facebook = (d.facebook as JsonObject | undefined) ?? {}
  const instagram = (d.instagram as JsonObject | undefined) ?? {}
  const crunchbase = (d.crunchbase as JsonObject | undefined) ?? {}

  const fundingRounds: HunterFundingRound[] = asArray(d.fundingRounds).map((r) => compactObject({
    date: typeof r.date === "string" ? r.date : undefined,
    series: typeof r.series === "string" ? r.series : undefined,
    amount: typeof r.amount === "number" ? r.amount : undefined,
    currency: typeof r.currency === "string" ? r.currency : undefined,
    investors: Array.isArray(r.investors)
      ? (r.investors as unknown[]).filter((i): i is string => typeof i === "string")
      : undefined,
  })) as HunterFundingRound[]

  return compactObject({
    source: "hunter_company_enrichment" as const,
    domain,
    requestUrl: url.toString(),
    name: typeof d.name === "string" ? d.name : undefined,
    legalName: typeof d.legalName === "string" ? d.legalName : undefined,
    description: typeof d.description === "string" ? d.description : undefined,
    foundedYear: typeof d.foundedYear === "number" ? d.foundedYear : undefined,
    location: typeof d.location === "string" ? d.location : undefined,
    logo: typeof d.logo === "string" ? d.logo : undefined,
    tags: Array.isArray(d.tags)
      ? (d.tags as unknown[]).filter((t): t is string => typeof t === "string")
      : undefined,
    category: compactObject({
      sector: typeof category.sector === "string" ? category.sector : undefined,
      industryGroup: typeof category.industryGroup === "string" ? category.industryGroup : undefined,
      industry: typeof category.industry === "string" ? category.industry : undefined,
      subIndustry: typeof category.subIndustry === "string" ? category.subIndustry : undefined,
    }),
    metrics: compactObject({
      employees: typeof metrics.employees === "string" ? metrics.employees : undefined,
      trafficRank: typeof metrics.trafficRank === "string" ? metrics.trafficRank : undefined,
      estimatedAnnualRevenue:
        typeof metrics.estimatedAnnualRevenue === "string"
          ? metrics.estimatedAnnualRevenue
          : undefined,
      raised: typeof metrics.raised === "number" ? metrics.raised : undefined,
      marketCap: typeof metrics.marketCap === "number" ? metrics.marketCap : undefined,
    }),
    tech: Array.isArray(d.tech)
      ? (d.tech as unknown[]).filter((t): t is string => typeof t === "string")
      : undefined,
    techCategories: Array.isArray(d.techCategories)
      ? (d.techCategories as unknown[]).filter((t): t is string => typeof t === "string")
      : undefined,
    social: compactObject({
      linkedin:
        typeof linkedin.handle === "string" ? `https://linkedin.com/${linkedin.handle}` : undefined,
      twitter:
        typeof twitter.handle === "string" ? `https://twitter.com/${twitter.handle}` : undefined,
      facebook:
        typeof facebook.handle === "string"
          ? `https://facebook.com/${facebook.handle}`
          : undefined,
      instagram:
        typeof instagram.handle === "string"
          ? `https://instagram.com/${instagram.handle}`
          : undefined,
      crunchbase:
        typeof crunchbase.handle === "string"
          ? `https://crunchbase.com/${crunchbase.handle}`
          : undefined,
    }),
    phone: typeof d.phone === "string" ? d.phone : undefined,
    emailProvider: typeof d.emailProvider === "string" ? d.emailProvider : undefined,
    companyType: typeof d.company_type === "string" ? d.company_type : undefined,
    fundingRounds: fundingRounds.length > 0 ? fundingRounds : undefined,
  }) as HunterCompanyEnrichmentResult
}

export type SerpApiSearchOptions = {
  query: string
  engine?: "google" | "google_news" | "google_patents" | string
  location?: string
  googleDomain?: string
  language?: string
  country?: string
  num?: number
  page?: number
}

export type SerpApiOrganicResult = {
  title?: string
  link?: string
  snippet?: string
  position?: number
  source?: string
  date?: string
}

export type SerpApiRelatedQuestion = {
  question?: string
  snippet?: string
  title?: string
  link?: string
}

export type SerpApiSearchResult = {
  source: "serpapi"
  query: SerpApiSearchOptions
  requestUrl: string
  engine: string
  results: SerpApiOrganicResult[]
  knowledgeGraph?: JsonObject
  answerBox?: JsonObject
  relatedQuestions?: SerpApiRelatedQuestion[]
  raw: JsonObject
}

export async function searchSerpApi(
  options: SerpApiSearchOptions,
  fetchOptions: FetchJsonOptions = {},
): Promise<SerpApiSearchResult> {
  const apiKey = fetchOptions.apiKey ?? getEnvValue(["SERP_API_KEY"], "SerpAPI")
  const engine = options.engine ?? "google"
  const url = new URL("https://serpapi.com/search.json")
  url.searchParams.set("engine", engine)
  url.searchParams.set("q", options.query)
  url.searchParams.set("api_key", apiKey)

  if (options.location) {
    url.searchParams.set("location", options.location)
  }

  if (options.googleDomain) {
    url.searchParams.set("google_domain", options.googleDomain)
  }

  if (options.language) {
    url.searchParams.set("hl", options.language)
  }

  if (options.country) {
    url.searchParams.set("gl", options.country)
  }

  if (options.num !== undefined) {
    url.searchParams.set("num", String(options.num))
  }

  if (options.page !== undefined) {
    url.searchParams.set("page", String(options.page))
  }

  const payload = await fetchJson<JsonObject>(url, fetchOptions)
  const resultBuckets =
    asArray(payload.organic_results).length > 0
      ? asArray(payload.organic_results)
      : asArray(payload.news_results).length > 0
        ? asArray(payload.news_results)
        : asArray(payload.organic_results)

  const knowledgeGraph =
    payload.knowledge_graph && typeof payload.knowledge_graph === "object"
      ? (payload.knowledge_graph as JsonObject)
      : undefined

  const answerBox =
    payload.answer_box && typeof payload.answer_box === "object"
      ? (payload.answer_box as JsonObject)
      : undefined

  const relatedQuestions = Array.isArray(payload.related_questions)
    ? (payload.related_questions as JsonObject[]).map((q) => ({
        question: typeof q.question === "string" ? q.question : undefined,
        snippet: typeof q.snippet === "string" ? q.snippet : undefined,
        title: typeof q.title === "string" ? q.title : undefined,
        link: typeof q.link === "string" ? q.link : undefined,
      }))
    : undefined

  return {
    source: "serpapi",
    query: options,
    requestUrl: redactedUrl(url, ["api_key"]),
    engine,
    results: resultBuckets.map((result) => ({
      title: typeof result.title === "string" ? result.title : undefined,
      link: typeof result.link === "string" ? result.link : undefined,
      snippet: typeof result.snippet === "string" ? result.snippet : undefined,
      position: typeof result.position === "number" ? result.position : undefined,
      source: typeof result.source === "string" ? result.source : undefined,
      date: typeof result.date === "string" ? result.date : undefined,
    })),
    knowledgeGraph,
    answerBox,
    relatedQuestions,
    raw: payload,
  }
}

export type GitHubSearchOptions = {
  query: string
  type?: "repositories" | "users"
  perPage?: number
  page?: number
}

export type GitHubSearchResultItem = {
  id?: number
  name?: string
  fullName?: string
  login?: string
  description?: string
  url?: string
  htmlUrl?: string
  stars?: number
  forks?: number
  watchers?: number
  language?: string
  type?: string
  topics?: string[]
  openIssues?: number
  updatedAt?: string
  pushedAt?: string
  license?: string
}

export type GitHubSearchResult = {
  source: "github_search"
  query: GitHubSearchOptions
  requestUrl: string
  totalCount?: number
  items: GitHubSearchResultItem[]
}

function githubHeaders(apiKey?: string): HeadersInit {
  const token = apiKey ?? getOptionalEnvValue(["GITHUB_KEY", "GITHUB_TOKEN"])
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export async function searchGitHub(
  options: GitHubSearchOptions,
  fetchOptions: FetchJsonOptions = {},
): Promise<GitHubSearchResult> {
  const type = options.type ?? "repositories"
  const url = new URL(`https://api.github.com/search/${type}`)
  url.searchParams.set("q", options.query)
  url.searchParams.set("per_page", String(options.perPage ?? 10))
  url.searchParams.set("page", String(options.page ?? 1))
  const payload = await fetchJson<JsonObject>(url, {
    ...fetchOptions,
    headers: githubHeaders(fetchOptions.apiKey),
  })

  return {
    source: "github_search",
    query: options,
    requestUrl: url.toString(),
    totalCount: typeof payload.total_count === "number" ? payload.total_count : undefined,
    items: asArray(payload.items).map((item) => ({
      id: typeof item.id === "number" ? item.id : undefined,
      name: typeof item.name === "string" ? item.name : undefined,
      fullName: typeof item.full_name === "string" ? item.full_name : undefined,
      login: typeof item.login === "string" ? item.login : undefined,
      description: typeof item.description === "string" ? item.description : undefined,
      url: typeof item.url === "string" ? item.url : undefined,
      htmlUrl: typeof item.html_url === "string" ? item.html_url : undefined,
      stars: typeof item.stargazers_count === "number" ? item.stargazers_count : undefined,
      forks: typeof item.forks_count === "number" ? item.forks_count : undefined,
      watchers: typeof item.watchers_count === "number" ? item.watchers_count : undefined,
      language: typeof item.language === "string" ? item.language : undefined,
      type: typeof item.type === "string" ? item.type : undefined,
      topics: Array.isArray(item.topics)
        ? (item.topics as unknown[]).filter((t): t is string => typeof t === "string")
        : undefined,
      openIssues: typeof item.open_issues_count === "number" ? item.open_issues_count : undefined,
      updatedAt: typeof item.updated_at === "string" ? item.updated_at : undefined,
      pushedAt: typeof item.pushed_at === "string" ? item.pushed_at : undefined,
      license:
        item.license && typeof (item.license as JsonObject)?.spdx_id === "string"
          ? ((item.license as JsonObject).spdx_id as string)
          : undefined,
    })),
  }
}

export type GitHubOrgProfileResult = {
  source: "github_org"
  login: string
  requestUrl: string
  profile: JsonObject
  repositories?: GitHubSearchResultItem[]
}

export async function getGitHubOrgProfile(
  login: string,
  options: { includeRepositories?: boolean; repositoryLimit?: number } & FetchJsonOptions = {},
): Promise<GitHubOrgProfileResult> {
  const profileUrl = new URL(`https://api.github.com/orgs/${encodeURIComponent(login)}`)
  const profile = await fetchJson<JsonObject>(profileUrl, {
    ...options,
    headers: githubHeaders(options.apiKey),
  })
  let repositories: GitHubSearchResultItem[] | undefined

  if (options.includeRepositories) {
    const reposUrl = new URL(
      `https://api.github.com/orgs/${encodeURIComponent(login)}/repos`,
    )
    reposUrl.searchParams.set("per_page", String(options.repositoryLimit ?? 10))
    reposUrl.searchParams.set("sort", "updated")
    const repoPayload = await fetchJson<JsonObject[]>(reposUrl, {
      ...options,
      headers: githubHeaders(options.apiKey),
    })

    repositories = repoPayload.map((repo) => ({
      id: typeof repo.id === "number" ? repo.id : undefined,
      name: typeof repo.name === "string" ? repo.name : undefined,
      fullName: typeof repo.full_name === "string" ? repo.full_name : undefined,
      description: typeof repo.description === "string" ? repo.description : undefined,
      url: typeof repo.url === "string" ? repo.url : undefined,
      htmlUrl: typeof repo.html_url === "string" ? repo.html_url : undefined,
      stars: typeof repo.stargazers_count === "number" ? repo.stargazers_count : undefined,
      forks: typeof repo.forks_count === "number" ? repo.forks_count : undefined,
      watchers: typeof repo.watchers_count === "number" ? repo.watchers_count : undefined,
      language: typeof repo.language === "string" ? repo.language : undefined,
      topics: Array.isArray(repo.topics)
        ? (repo.topics as unknown[]).filter((t): t is string => typeof t === "string")
        : undefined,
      openIssues: typeof repo.open_issues_count === "number" ? repo.open_issues_count : undefined,
      updatedAt: typeof repo.updated_at === "string" ? repo.updated_at : undefined,
      pushedAt: typeof repo.pushed_at === "string" ? repo.pushed_at : undefined,
      license:
        repo.license && typeof (repo.license as JsonObject)?.spdx_id === "string"
          ? ((repo.license as JsonObject).spdx_id as string)
          : undefined,
    }))
  }

  return {
    source: "github_org",
    login,
    requestUrl: profileUrl.toString(),
    profile,
    repositories,
  }
}

type ProductHuntTokenResponse = {
  access_token?: string
}

export type ProductHuntGraphqlResult<TData = unknown> = {
  source: "product_hunt"
  data?: TData
  errors?: unknown
}

export async function getProductHuntAccessToken(
  fetchOptions: FetchJsonOptions = {},
): Promise<string> {
  const clientId =
    fetchOptions.apiKey ?? getEnvValue(["PRODUCT_HUNT_API_KEY"], "Product Hunt API key")
  const clientSecret = getEnvValue(
    ["PRODUCT_HUNT_API_SECRET"],
    "Product Hunt API secret",
  )
  const url = new URL("https://api.producthunt.com/v2/oauth/token")
  const payload = await fetchJson<ProductHuntTokenResponse>(url, {
    fetcher: fetchOptions.fetcher,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  })

  if (!payload.access_token) {
    throw new Error("Product Hunt did not return an access token")
  }

  return payload.access_token
}

export async function productHuntGraphql<TData = unknown>(
  query: string,
  variables?: JsonObject,
  fetchOptions: FetchJsonOptions & { accessToken?: string } = {},
): Promise<ProductHuntGraphqlResult<TData>> {
  const accessToken = fetchOptions.accessToken ?? (await getProductHuntAccessToken(fetchOptions))
  const url = new URL("https://api.producthunt.com/v2/api/graphql")
  const payload = await fetchJson<{ data?: TData; errors?: unknown }>(url, {
    fetcher: fetchOptions.fetcher,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query, variables }),
  })

  return {
    source: "product_hunt",
    data: payload.data,
    errors: payload.errors,
  }
}

export type ProductHuntPostsOptions = {
  first?: number
}

export type ProductHuntSearchOptions = {
  query: string
  first?: number
}

export function buildProductHuntPostsQuery(): string {
  return `
    query ProductHuntPosts($first: Int!) {
      posts(first: $first) {
        edges {
          node {
            id
            name
            tagline
            url
            votesCount
            commentsCount
            createdAt
          }
        }
      }
    }
  `
}

export function buildProductHuntSearchQuery(): string {
  // PH API v2 removed the `search` argument from `posts`.
  // We fetch top-voted posts and rely on the caller to filter/label by company name.
  return `
    query SearchProductHuntPosts($first: Int!) {
      posts(first: $first, order: VOTES) {
        edges {
          node {
            id
            name
            tagline
            description
            url
            website
            votesCount
            commentsCount
            reviewsRating
            reviewsCount
            createdAt
            thumbnail {
              url
            }
            makers {
              name
              username
              twitterUsername
              websiteUrl
              profileImage
            }
            topics {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
  `
}

export async function getProductHuntPosts(
  options: ProductHuntPostsOptions = {},
  fetchOptions: FetchJsonOptions & { accessToken?: string } = {},
): Promise<ProductHuntGraphqlResult> {
  return productHuntGraphql(
    buildProductHuntPostsQuery(),
    { first: options.first ?? 10 },
    fetchOptions,
  )
}

export async function searchProductHuntPosts(
  options: ProductHuntSearchOptions,
  fetchOptions: FetchJsonOptions & { accessToken?: string } = {},
): Promise<ProductHuntGraphqlResult> {
  // PH API v2 no longer supports search via `posts`; pass only `first`.
  return productHuntGraphql(
    buildProductHuntSearchQuery(),
    { first: options.first ?? 5 },
    fetchOptions,
  )
}
