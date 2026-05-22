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

function compactObject<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null),
  ) as T
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
    })),
  }
}

export type HunterDomainSearchOptions = {
  domain: string
  limit?: number
  department?: string
  seniority?: string
}

export type HunterEmail = {
  value?: string
  type?: string
  confidence?: number
  firstName?: string
  lastName?: string
  position?: string
  department?: string
  seniority?: string
  linkedin?: string
}

export type HunterDomainSearchResult = {
  source: "hunter_domain_search"
  query: HunterDomainSearchOptions
  requestUrl: string
  domain?: string
  organization?: string
  pattern?: string
  emails: HunterEmail[]
}

export async function searchHunterDomain(
  options: HunterDomainSearchOptions,
  fetchOptions: FetchJsonOptions = {},
): Promise<HunterDomainSearchResult> {
  const apiKey = fetchOptions.apiKey ?? getEnvValue(["HUNTER_API_KEY"], "Hunter.io")
  const url = new URL("https://api.hunter.io/v2/domain-search")
  url.searchParams.set("domain", options.domain)
  url.searchParams.set("limit", String(options.limit ?? 10))

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

  return {
    source: "hunter_domain_search",
    query: options,
    requestUrl: url.toString(),
    domain: typeof data.domain === "string" ? data.domain : undefined,
    organization:
      typeof data.organization === "string" ? data.organization : undefined,
    pattern: typeof data.pattern === "string" ? data.pattern : undefined,
    emails: asArray(data.emails).map((email) => ({
      value: typeof email.value === "string" ? email.value : undefined,
      type: typeof email.type === "string" ? email.type : undefined,
      confidence: typeof email.confidence === "number" ? email.confidence : undefined,
      firstName: typeof email.first_name === "string" ? email.first_name : undefined,
      lastName: typeof email.last_name === "string" ? email.last_name : undefined,
      position: typeof email.position === "string" ? email.position : undefined,
      department: typeof email.department === "string" ? email.department : undefined,
      seniority: typeof email.seniority === "string" ? email.seniority : undefined,
      linkedin: typeof email.linkedin === "string" ? email.linkedin : undefined,
    })),
  }
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

export type SerpApiSearchResult = {
  source: "serpapi"
  query: SerpApiSearchOptions
  requestUrl: string
  engine: string
  results: SerpApiOrganicResult[]
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
  language?: string
  type?: string
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
      language: typeof item.language === "string" ? item.language : undefined,
      type: typeof item.type === "string" ? item.type : undefined,
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
      language: typeof repo.language === "string" ? repo.language : undefined,
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
