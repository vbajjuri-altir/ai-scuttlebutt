import { runCompanyResearchSweep } from "@/lib/research-tools"

/**
 * If the user pastes a URL (e.g. "https://www.wealthup.me/"), extract:
 *  - companyName: the meaningful hostname part without TLD ("wealthup")
 *  - domain: the bare hostname without www ("wealthup.me")
 *
 * Otherwise treat the raw string as the company name.
 */
function parseQueryInput(input: string): { companyName: string; domain?: string } {
  const trimmed = input.trim()
  // Detect URLs: either starts with a protocol or contains a dot with no spaces
  const looksLikeUrl =
    /^https?:\/\//i.test(trimmed) || (/\./.test(trimmed) && !/\s/.test(trimmed))

  if (looksLikeUrl) {
    try {
      const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
      const url = new URL(withProtocol)
      const hostname = url.hostname.replace(/^www\./, "")
      // "wealthup.me" → "wealthup", "stripe.com" → "stripe"
      const parts = hostname.split(".")
      const companyName = parts.length > 1 ? parts.slice(0, -1).join(".") : hostname
      return { companyName, domain: hostname }
    } catch {
      // Not a valid URL — fall through and treat as plain name
    }
  }

  return { companyName: trimmed }
}

export async function POST(request: Request) {
  try {
    const { query, domain, githubOrg, screenerSymbol } = await request.json()

    if (!query || typeof query !== "string") {
      return Response.json({ error: "Query is required" }, { status: 400 })
    }

    const parsed = parseQueryInput(query)
    const resolvedDomain =
      (typeof domain === "string" && domain.trim() ? domain.trim() : undefined) ??
      parsed.domain

    const data = await runCompanyResearchSweep({
      companyName: parsed.companyName,
      domain: resolvedDomain,
      githubOrg:
        typeof githubOrg === "string" && githubOrg.trim()
          ? githubOrg.trim()
          : undefined,
      screenerSymbol:
        typeof screenerSymbol === "string" && screenerSymbol.trim()
          ? screenerSymbol.trim()
          : undefined,
      includeProductHunt: true,
    })

    return Response.json(data)
  } catch (err) {
    return Response.json(
      {
        error: "Internal server error",
        detail: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
