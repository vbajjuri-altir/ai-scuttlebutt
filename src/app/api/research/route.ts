import { runCompanyResearchSweep } from "@/lib/research-tools"

export async function POST(request: Request) {
  try {
    const { query, domain, githubOrg, screenerSymbol } = await request.json()

    if (!query || typeof query !== "string") {
      return Response.json({ error: "Query is required" }, { status: 400 })
    }

    const data = await runCompanyResearchSweep({
      companyName: query.trim(),
      domain: typeof domain === "string" && domain.trim() ? domain.trim() : undefined,
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
