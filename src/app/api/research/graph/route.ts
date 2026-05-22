import { runGraphPipeline } from "@/lib/ai-pipelines"
import type { CompanyResearchSweepResult } from "@/lib/research-tools"

export async function POST(request: Request) {
  try {
    const { rawData } = (await request.json()) as {
      rawData?: CompanyResearchSweepResult
    }

    if (!rawData || !rawData.companyName) {
      return Response.json(
        { error: "rawData with companyName is required" },
        { status: 400 },
      )
    }

    const result = await runGraphPipeline(rawData)
    return Response.json(result)
  } catch (err) {
    return Response.json(
      {
        error: "Graph pipeline failed",
        detail: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
