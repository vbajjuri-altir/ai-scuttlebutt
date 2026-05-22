type Fetcher = typeof fetch

const DEFAULT_USER_AGENT =
  "ai-scuttlebutt/0.1 public-source-research (+https://example.invalid)"

type FetchJsonOptions = {
  fetcher?: Fetcher
}

async function fetchJson<T>(url: URL, options: FetchJsonOptions = {}): Promise<T> {
  const response = await (options.fetcher ?? fetch)(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": DEFAULT_USER_AGENT,
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status} for ${url.toString()}`)
  }

  return (await response.json()) as T
}

async function fetchHtml(url: URL, options: FetchJsonOptions = {}): Promise<string> {
  const response = await (options.fetcher ?? fetch)(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": DEFAULT_USER_AGENT,
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status} for ${url.toString()}`)
  }

  return response.text()
}

function textFromHtml(value: string | null | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/\s+/g, " ")
    .trim()
}

function extractTagContent(html: string, tagPattern: RegExp): string | undefined {
  const match = html.match(tagPattern)
  return textFromHtml(match?.[1])
}

function compactObject<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null),
  ) as T
}

export type WaybackCdxSearchOptions = {
  url: string
  from?: string
  to?: string
  limit?: number
  collapse?: "urlkey" | "digest" | "timestamp" | string
  filter?: string[]
}

export type WaybackCapture = {
  timestamp: string
  original: string
  statusCode: string
  mimeType: string
  digest: string
  archiveUrl: string
}

export type WaybackCdxSearchResult = {
  source: "wayback_cdx"
  query: WaybackCdxSearchOptions
  requestUrl: string
  captures: WaybackCapture[]
}

export function buildWaybackCdxUrl(options: WaybackCdxSearchOptions): URL {
  const url = new URL("https://web.archive.org/cdx")
  url.searchParams.set("url", options.url)
  url.searchParams.set("output", "json")
  url.searchParams.set("fl", "timestamp,original,statuscode,mimetype,digest")
  url.searchParams.append("filter", "statuscode:200")

  for (const filter of options.filter ?? []) {
    url.searchParams.append("filter", filter)
  }

  if (options.from) {
    url.searchParams.set("from", options.from)
  }

  if (options.to) {
    url.searchParams.set("to", options.to)
  }

  if (options.limit !== undefined) {
    url.searchParams.set("limit", String(options.limit))
  }

  if (options.collapse) {
    url.searchParams.set("collapse", options.collapse)
  }

  return url
}

export async function searchWaybackCaptures(
  options: WaybackCdxSearchOptions,
  fetchOptions?: FetchJsonOptions,
): Promise<WaybackCdxSearchResult> {
  const requestUrl = buildWaybackCdxUrl(options)
  const rows = await fetchJson<string[][]>(requestUrl, fetchOptions)
  const [, ...captures] = Array.isArray(rows) ? rows : []

  return {
    source: "wayback_cdx",
    query: options,
    requestUrl: requestUrl.toString(),
    captures: captures.map(([timestamp, original, statusCode, mimeType, digest]) => ({
      timestamp,
      original,
      statusCode,
      mimeType,
      digest,
      archiveUrl: `https://web.archive.org/web/${timestamp}/${original}`,
    })),
  }
}

export type WaybackAvailableOptions = {
  url: string
  timestamp?: string
}

type WaybackAvailableResponse = {
  archived_snapshots?: {
    closest?: {
      available?: boolean
      url?: string
      timestamp?: string
      status?: string
    }
  }
}

export type WaybackLatestSnapshotResult = {
  source: "wayback_available"
  query: WaybackAvailableOptions
  requestUrl: string
  snapshot?: {
    available: boolean
    url?: string
    timestamp?: string
    status?: string
  }
}

export function buildWaybackAvailableUrl(options: WaybackAvailableOptions): URL {
  const url = new URL("https://archive.org/wayback/available")
  url.searchParams.set("url", options.url)

  if (options.timestamp) {
    url.searchParams.set("timestamp", options.timestamp)
  }

  return url
}

export async function getLatestWaybackSnapshot(
  options: WaybackAvailableOptions,
  fetchOptions?: FetchJsonOptions,
): Promise<WaybackLatestSnapshotResult> {
  const requestUrl = buildWaybackAvailableUrl(options)
  const payload = await fetchJson<WaybackAvailableResponse>(requestUrl, fetchOptions)
  const snapshot = payload.archived_snapshots?.closest

  return {
    source: "wayback_available",
    query: options,
    requestUrl: requestUrl.toString(),
    snapshot: snapshot
      ? {
          available: Boolean(snapshot.available),
          url: snapshot.url,
          timestamp: snapshot.timestamp,
          status: snapshot.status,
        }
      : undefined,
  }
}

export type ITunesSearchOptions = {
  term: string
  country?: string
  limit?: number
}

export type ITunesLookupOptions = {
  id?: number | string
  bundleId?: string
  country?: string
}

export type AppStoreAppMetadata = {
  appName?: string
  bundleId?: string
  appId?: number
  sellerName?: string
  developerName?: string
  averageUserRating?: number
  userRatingCount?: number
  genres?: string[]
  primaryGenreName?: string
  currentVersion?: string
  releaseNotes?: string
  trackViewUrl?: string
  sellerUrl?: string
  artworkUrl100?: string
  artworkUrl512?: string
  screenshotUrls?: string[]
  ipadScreenshotUrls?: string[]
}

type ITunesApiResponse = {
  resultCount: number
  results: Record<string, unknown>[]
}

export type ITunesAppSearchResult = {
  source: "itunes_search"
  query: ITunesSearchOptions
  requestUrl: string
  resultCount: number
  apps: AppStoreAppMetadata[]
}

export type ITunesAppLookupResult = {
  source: "itunes_lookup"
  query: ITunesLookupOptions
  requestUrl: string
  resultCount: number
  apps: AppStoreAppMetadata[]
}

function arrayOfStrings(value: unknown): string[] | undefined {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : undefined
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined
}

function normalizeItunesApp(result: Record<string, unknown>): AppStoreAppMetadata {
  return compactObject({
    appName: optionalString(result.trackName),
    bundleId: optionalString(result.bundleId),
    appId: optionalNumber(result.trackId),
    sellerName: optionalString(result.sellerName),
    developerName: optionalString(result.artistName),
    averageUserRating: optionalNumber(result.averageUserRating),
    userRatingCount: optionalNumber(result.userRatingCount),
    genres: arrayOfStrings(result.genres),
    primaryGenreName: optionalString(result.primaryGenreName),
    currentVersion: optionalString(result.version),
    releaseNotes: optionalString(result.releaseNotes),
    trackViewUrl: optionalString(result.trackViewUrl),
    sellerUrl: optionalString(result.sellerUrl),
    artworkUrl100: optionalString(result.artworkUrl100),
    artworkUrl512: optionalString(result.artworkUrl512),
    screenshotUrls: arrayOfStrings(result.screenshotUrls),
    ipadScreenshotUrls: arrayOfStrings(result.ipadScreenshotUrls),
  })
}

export function buildITunesSearchUrl(options: ITunesSearchOptions): URL {
  const url = new URL("https://itunes.apple.com/search")
  url.searchParams.set("term", options.term)
  url.searchParams.set("media", "software")
  url.searchParams.set("entity", "software")
  url.searchParams.set("country", options.country ?? "us")
  url.searchParams.set("limit", String(options.limit ?? 10))
  return url
}

export async function searchAppStoreApps(
  options: ITunesSearchOptions,
  fetchOptions?: FetchJsonOptions,
): Promise<ITunesAppSearchResult> {
  const requestUrl = buildITunesSearchUrl(options)
  const payload = await fetchJson<ITunesApiResponse>(requestUrl, fetchOptions)

  return {
    source: "itunes_search",
    query: options,
    requestUrl: requestUrl.toString(),
    resultCount: payload.resultCount,
    apps: payload.results.map(normalizeItunesApp),
  }
}

export function buildITunesLookupUrl(options: ITunesLookupOptions): URL {
  if (!options.id && !options.bundleId) {
    throw new Error("iTunes lookup requires either id or bundleId")
  }

  const url = new URL("https://itunes.apple.com/lookup")

  if (options.id) {
    url.searchParams.set("id", String(options.id))
  }

  if (options.bundleId) {
    url.searchParams.set("bundleId", options.bundleId)
  }

  if (options.country) {
    url.searchParams.set("country", options.country)
  }

  return url
}

export async function lookupAppStoreApp(
  options: ITunesLookupOptions,
  fetchOptions?: FetchJsonOptions,
): Promise<ITunesAppLookupResult> {
  const requestUrl = buildITunesLookupUrl(options)
  const payload = await fetchJson<ITunesApiResponse>(requestUrl, fetchOptions)

  return {
    source: "itunes_lookup",
    query: options,
    requestUrl: requestUrl.toString(),
    resultCount: payload.resultCount,
    apps: payload.results.map(normalizeItunesApp),
  }
}

export type GooglePatentsSearchOptions = {
  query: string
  inventor?: string
  assignee?: string
  before?: string
  after?: string
  language?: string
}

export type GooglePatentsSearchResult = {
  source: "google_patents"
  query: GooglePatentsSearchOptions
  searchUrl: string
  note: string
}

export function buildGooglePatentsSearchUrl(options: GooglePatentsSearchOptions): URL {
  const url = new URL("https://patents.google.com/")
  const queryParts = [options.query]

  if (options.inventor) {
    queryParts.push(`inventor=(${options.inventor})`)
  }

  if (options.assignee) {
    queryParts.push(`assignee=(${options.assignee})`)
  }

  if (options.before) {
    queryParts.push(`before=${options.before}`)
  }

  if (options.after) {
    queryParts.push(`after=${options.after}`)
  }

  url.searchParams.set("q", queryParts.join(" "))

  if (options.language) {
    url.searchParams.set("dups", "language")
    url.searchParams.set("hl", options.language)
  }

  return url
}

export function createGooglePatentsSearch(options: GooglePatentsSearchOptions): GooglePatentsSearchResult {
  return {
    source: "google_patents",
    query: options,
    searchUrl: buildGooglePatentsSearchUrl(options).toString(),
    note:
      "Google Patents does not provide an official public API. Use this URL for manual review or fetch a specific public patent page by URL.",
  }
}

export type GooglePatentPageMetadata = {
  source: "google_patent_page"
  url: string
  title?: string
  abstract?: string
  description?: string
  inventors?: string[]
  assignee?: string
  publicationNumber?: string
  publicationDate?: string
}

export async function fetchGooglePatentPageMetadata(
  patentUrl: string,
  fetchOptions?: FetchJsonOptions,
): Promise<GooglePatentPageMetadata> {
  const url = new URL(patentUrl)

  if (url.hostname !== "patents.google.com") {
    throw new Error("Google patent metadata fetch only supports patents.google.com URLs")
  }

  const html = await fetchHtml(url, fetchOptions)

  return compactObject({
    source: "google_patent_page" as const,
    url: url.toString(),
    title: extractTagContent(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    abstract: extractTagContent(html, /<section[^>]+itemprop=["']abstract["'][^>]*>([\s\S]*?)<\/section>/i),
    description: extractTagContent(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    ),
    inventors: Array.from(html.matchAll(/itemprop=["']inventor["'][^>]*>\s*<span[^>]*>([\s\S]*?)<\/span>/gi))
      .map((match) => textFromHtml(match[1]))
      .filter((value): value is string => Boolean(value)),
    assignee: extractTagContent(html, /itemprop=["']assigneeOriginal["'][^>]*>\s*<span[^>]*>([\s\S]*?)<\/span>/i),
    publicationNumber: extractTagContent(html, /itemprop=["']publicationNumber["'][^>]*>([\s\S]*?)</i),
    publicationDate: extractTagContent(html, /itemprop=["']publicationDate["'][^>]*>([\s\S]*?)</i),
  })
}

export type ScreenerCompanyOptions = {
  symbol: string
  consolidated?: boolean
}

export type ScreenerCompanyUrlResult = {
  source: "screener"
  symbol: string
  companyUrl: string
  consolidated: boolean
}

export function buildScreenerCompanyUrl(options: ScreenerCompanyOptions): URL {
  const symbol = options.symbol.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "")
  const url = new URL(`https://www.screener.in/company/${symbol}/`)

  if (options.consolidated) {
    url.pathname = `/company/${symbol}/consolidated/`
  }

  return url
}

export function createScreenerCompanyUrl(options: ScreenerCompanyOptions): ScreenerCompanyUrlResult {
  return {
    source: "screener",
    symbol: options.symbol.trim().toUpperCase(),
    companyUrl: buildScreenerCompanyUrl(options).toString(),
    consolidated: Boolean(options.consolidated),
  }
}

export type ScreenerCompanySummary = {
  source: "screener_public_page"
  symbol: string
  url: string
  title?: string
  companyName?: string
  description?: string
  note?: string
}

export async function fetchScreenerCompanySummary(
  options: ScreenerCompanyOptions,
  fetchOptions?: FetchJsonOptions,
): Promise<ScreenerCompanySummary> {
  const url = buildScreenerCompanyUrl(options)
  const html = await fetchHtml(url, fetchOptions)
  const title = extractTagContent(html, /<title[^>]*>([\s\S]*?)<\/title>/i)
  const companyName = extractTagContent(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const description = extractTagContent(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  )

  return compactObject({
    source: "screener_public_page" as const,
    symbol: options.symbol.trim().toUpperCase(),
    url: url.toString(),
    title,
    companyName,
    description,
    note:
      "Only static public summary metadata is parsed. Dynamic, gated, or session-protected sections require manual/browser access.",
  })
}

export type McaCompanySearchOptions = {
  companyName?: string
  cin?: string
}

export type McaPublicAccessResult = {
  source: "mca"
  query: McaCompanySearchOptions
  portalUrl: string
  note: string
}

export function createMcaPortalAccess(options: McaCompanySearchOptions = {}): McaPublicAccessResult {
  return {
    source: "mca",
    query: options,
    portalUrl: "https://www.mca.gov.in/content/mca/global/en/mca/master-data/MDS.html",
    note:
      "MCA does not provide a simple public no-token API for this workflow. Use the portal manually; do not bypass login, OTP, captcha, session checks, or other access controls.",
  }
}

// ---------------------------------------------------------------------------
// Company team page scraper
// ---------------------------------------------------------------------------

export type TeamMember = {
  name: string
  role?: string
  bio?: string
  linkedIn?: string
  twitter?: string
  imageUrl?: string
}

export type CompanyTeamPageResult = {
  source: "company_team_page"
  domain: string
  pageUrl: string
  members: TeamMember[]
  totalFound: number
  note?: string
}

/** Candidate paths to try when looking for a team/about page */
const TEAM_PAGE_PATHS = ["/team", "/about", "/about-us", "/company", "/our-team", "/people"]

/**
 * Extract Person records from JSON-LD <script> blocks embedded in the page.
 * Many modern sites use schema.org/Person or schema.org/Organization with members.
 */
function extractJsonLdPersons(html: string): TeamMember[] {
  const members: TeamMember[] = []
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match: RegExpExecArray | null

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const parsed: unknown = JSON.parse(match[1])
      const entries = Array.isArray(parsed) ? parsed : [parsed]
      for (const entry of entries) {
        if (typeof entry !== "object" || entry === null) continue
        const obj = entry as Record<string, unknown>

        // Direct Person
        if (obj["@type"] === "Person" && typeof obj.name === "string") {
          members.push(compactObject({
            name: obj.name,
            role: typeof obj.jobTitle === "string" ? obj.jobTitle : undefined,
            bio: typeof obj.description === "string" ? obj.description : undefined,
            linkedIn:
              typeof obj.sameAs === "string" && obj.sameAs.includes("linkedin")
                ? obj.sameAs
                : undefined,
            imageUrl:
              typeof obj.image === "string"
                ? obj.image
                : typeof (obj.image as Record<string, unknown>)?.url === "string"
                  ? (obj.image as Record<string, unknown>).url as string
                  : undefined,
          }) as TeamMember)
        }

        // Organization.member / Organization.employee arrays
        for (const key of ["member", "employee", "founder"]) {
          const list = obj[key]
          if (!Array.isArray(list)) continue
          for (const item of list) {
            if (typeof item !== "object" || item === null) continue
            const person = item as Record<string, unknown>
            if (typeof person.name === "string") {
              members.push(compactObject({
                name: person.name,
                role: typeof person.jobTitle === "string" ? person.jobTitle : undefined,
                bio: typeof person.description === "string" ? person.description : undefined,
              }) as TeamMember)
            }
          }
        }
      }
    } catch {
      // Malformed JSON-LD — skip
    }
  }

  return members
}

/**
 * Heuristic HTML extraction: find elements that look like person cards.
 * Looks for common patterns: itemprop="name" inside itemtype="Person",
 * or role-like text immediately after a name-like heading.
 */
function extractHtmlPersons(html: string): TeamMember[] {
  const members: TeamMember[] = []

  // itemprop="name" + optional itemprop="jobTitle" in microdata Person blocks
  const personBlockRe =
    /itemtype=["'][^"']*Person["'][^>]*>([\s\S]*?)(?=itemtype=["']|<\/[a-z]+>\s*<\/[a-z]+>\s*<\/[a-z]+>|$)/gi
  let blockMatch: RegExpExecArray | null
  while ((blockMatch = personBlockRe.exec(html)) !== null) {
    const block = blockMatch[1]
    const nameMatch = block.match(/itemprop=["']name["'][^>]*>([^<]+)</)
    const titleMatch = block.match(/itemprop=["']jobTitle["'][^>]*>([^<]+)</)
    if (nameMatch) {
      members.push(compactObject({
        name: nameMatch[1].trim(),
        role: titleMatch ? titleMatch[1].trim() : undefined,
      }) as TeamMember)
    }
  }

  return members
}

/**
 * Fetch the company's website to find team members. Tries several common
 * team/about page paths and extracts people from JSON-LD and microdata.
 */
export async function fetchCompanyTeamPage(
  domain: string,
  fetchOptions?: FetchJsonOptions,
): Promise<CompanyTeamPageResult> {
  const base = `https://${domain.replace(/^www\./, "www.")}`
  let lastError: string | undefined

  for (const path of TEAM_PAGE_PATHS) {
    const pageUrl = `${base}${path}`
    try {
      const html = await fetchHtml(new URL(pageUrl), fetchOptions)
      const fromJsonLd = extractJsonLdPersons(html)
      const fromMicrodata = extractHtmlPersons(html)

      // Deduplicate by name
      const seen = new Set<string>()
      const merged: TeamMember[] = []
      for (const m of [...fromJsonLd, ...fromMicrodata]) {
        const key = m.name.toLowerCase().trim()
        if (!seen.has(key)) {
          seen.add(key)
          merged.push(m)
        }
      }

      if (merged.length > 0) {
        return {
          source: "company_team_page",
          domain,
          pageUrl,
          members: merged,
          totalFound: merged.length,
        }
      }

      // Page loaded but no structured data — return what meta we can with a note
      return {
        source: "company_team_page",
        domain,
        pageUrl,
        members: [],
        totalFound: 0,
        note:
          "Page loaded but no structured person data (JSON-LD/microdata) was found. " +
          "The team section may be rendered client-side (JavaScript) or use non-standard markup.",
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
    }
  }

  return {
    source: "company_team_page",
    domain,
    pageUrl: `${base}/team`,
    members: [],
    totalFound: 0,
    note: `Could not load any team page. Last error: ${lastError ?? "unknown"}`,
  }
}
