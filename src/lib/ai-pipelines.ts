import { createOpenAI } from "@ai-sdk/openai"
import { generateObject, generateText } from "ai"
import { z } from "zod"

import type { CompanyResearchSweepResult } from "./research-tools"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getModel() {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error("OPENAI_API_KEY is not set")
  return createOpenAI({ apiKey: key })("gpt-4o")
}

/**
 * Strip request metadata from a sweep result and return a compact object
 * keyed by source name. Only successful results are included.
 * The stringified output is capped at ~60 k chars to stay well inside
 * GPT-4o's context window.
 */
export function prepareForLLM(sweepResult: CompanyResearchSweepResult): string {
  const cleaned: Record<string, unknown> = {}

  for (const result of sweepResult.results) {
    if (!result.ok) continue
    const raw = result.data as Record<string, unknown>
    // Strip internal bookkeeping fields that add noise without signal
    const { source, requestUrl, query, configuredSources, ...rest } = raw
    void source
    void requestUrl
    void query
    void configuredSources
    cleaned[result.name] = rest
  }

  const full = JSON.stringify(cleaned, null, 2)
  // Hard-cap to avoid accidental token blowout
  return full.length > 60_000 ? full.slice(0, 60_000) + "\n…[truncated]" : full
}

// ---------------------------------------------------------------------------
// Summary pipeline types
// ---------------------------------------------------------------------------

const structuredSummarySchema = z.object({
  company: z.string(),
  oneLineDescription: z.string(),
  businessModel: z.string(),
  products: z.array(z.string()),
  founders: z.array(z.string()),
  leadership: z.array(z.string()),
  investors: z.array(z.string()),
  customers: z.array(z.string()),
  industries: z.array(z.string()),
  partnerships: z.array(z.string()),
  recentNews: z.array(z.string()),
  keyInsights: z.array(z.string()),
  risksOrUnknowns: z.array(z.string()),
  evidence: z.array(
    z.object({
      fact: z.string(),
      sourceSnippet: z.string(),
    }),
  ),
})

export type StructuredSummary = z.infer<typeof structuredSummarySchema>

export type SummaryPipelineResult = {
  structuredSummary: StructuredSummary
  report: string
}

// ---------------------------------------------------------------------------
// Summary pipeline
// ---------------------------------------------------------------------------

const SUMMARY_STEP1_SYSTEM = `You are an expert company research analyst.
You receive raw JSON data collected from multiple APIs.
The schemas are inconsistent and may contain duplicate, conflicting, incomplete, or irrelevant information.

Your task:
1. Identify the company being researched.
2. Extract the most important facts.
3. Remove duplicates.
4. Ignore metadata, API response information, request logs, and configuration data.
5. If information conflicts, mention the conflict.
6. Only use information present in the supplied data.

Return the structured JSON requested — nothing else.`

const SUMMARY_STEP2_SYSTEM = `You are a senior analyst writing a company intelligence brief.
Convert the structured summary into a clear, professional report with these sections:
1. Executive Summary
2. Company Overview
3. Products & Services
4. Founders & Leadership
5. Investors
6. Partnerships
7. Recent Activity
8. Key Insights & Risks

Use only facts present in the summary. Write in plain prose — no bullet lists for the executive summary, bullets are fine for the other sections.`

export async function runSummaryPipeline(
  sweepResult: CompanyResearchSweepResult,
): Promise<SummaryPipelineResult> {
  const model = getModel()
  const dataStr = prepareForLLM(sweepResult)

  // Step 1 — Structured extraction
  const { object: structuredSummary } = await generateObject({
    model,
    schema: structuredSummarySchema,
    system: SUMMARY_STEP1_SYSTEM,
    prompt: `DATA:\n\n${dataStr}`,
  })

  // Step 2 — Human-readable report
  const { text: report } = await generateText({
    model,
    system: SUMMARY_STEP2_SYSTEM,
    prompt: `STRUCTURED SUMMARY:\n\n${JSON.stringify(structuredSummary, null, 2)}`,
  })

  return { structuredSummary, report }
}

// ---------------------------------------------------------------------------
// Knowledge graph pipeline types
// ---------------------------------------------------------------------------

const factSchema = z.object({
  facts: z.array(
    z.object({
      subject: z.string(),
      predicate: z.string(),
      object: z.string(),
      confidence: z.number().min(0).max(1),
      evidence: z.string(),
    }),
  ),
})

const entityNormalizationSchema = z.object({
  entities: z.array(
    z.object({
      canonical: z.string(),
      aliases: z.array(z.string()),
      type: z.enum([
        "COMPANY",
        "PERSON",
        "PRODUCT",
        "INVESTOR",
        "CUSTOMER",
        "TECHNOLOGY",
        "INDUSTRY",
        "LOCATION",
        "EVENT",
      ]),
    }),
  ),
})

export type KnowledgeGraphNode = {
  id: string
  label: string
  type: string
}

export type KnowledgeGraphEdge = {
  source: string
  target: string
  relation: string
  confidence: number
  evidence: string
}

export type KnowledgeGraphPipelineResult = {
  facts: z.infer<typeof factSchema>["facts"]
  entities: z.infer<typeof entityNormalizationSchema>["entities"]
  graph: {
    nodes: KnowledgeGraphNode[]
    edges: KnowledgeGraphEdge[]
  }
}

// ---------------------------------------------------------------------------
// Knowledge graph pipeline
// ---------------------------------------------------------------------------

const GRAPH_STEP1_SYSTEM = `You are a knowledge graph extraction engine.
Extract factual relationships from the provided company research data.

Rules:
- Use canonical entity names.
- Do not infer facts — only extract explicit relationships present in the data.
- Include a short evidence quote for each fact.
- Confidence 1.0 = explicitly stated; 0.7 = strongly implied; 0.5 = uncertain.`

const GRAPH_STEP2_SYSTEM = `You are an entity resolution engine.
Given a list of facts, identify all unique entities and merge aliases into a single canonical name.
Assign each entity one of the types: COMPANY, PERSON, PRODUCT, INVESTOR, CUSTOMER, TECHNOLOGY, INDUSTRY, LOCATION, EVENT.`

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
}

function buildGraph(
  facts: z.infer<typeof factSchema>["facts"],
  entities: z.infer<typeof entityNormalizationSchema>["entities"],
): KnowledgeGraphPipelineResult["graph"] {
  // Build alias → canonical map
  const aliasMap = new Map<string, string>()
  for (const entity of entities) {
    const key = entity.canonical.toLowerCase()
    aliasMap.set(key, entity.canonical)
    for (const alias of entity.aliases) {
      aliasMap.set(alias.toLowerCase(), entity.canonical)
    }
  }

  const resolve = (name: string) =>
    aliasMap.get(name.toLowerCase()) ?? name

  // Collect unique canonical names seen in facts
  const seenLabels = new Set<string>()
  for (const fact of facts) {
    seenLabels.add(resolve(fact.subject))
    seenLabels.add(resolve(fact.object))
  }

  // Build nodes
  const entityTypeMap = new Map(entities.map((e) => [e.canonical, e.type]))

  const nodes: KnowledgeGraphNode[] = Array.from(seenLabels).map((label) => ({
    id: slugify(label),
    label,
    type: entityTypeMap.get(label) ?? "UNKNOWN",
  }))

  // Build edges
  const edges: KnowledgeGraphEdge[] = facts.map((fact) => ({
    source: slugify(resolve(fact.subject)),
    target: slugify(resolve(fact.object)),
    relation: fact.predicate,
    confidence: fact.confidence,
    evidence: fact.evidence,
  }))

  return { nodes, edges }
}

export async function runGraphPipeline(
  sweepResult: CompanyResearchSweepResult,
): Promise<KnowledgeGraphPipelineResult> {
  const model = getModel()
  const dataStr = prepareForLLM(sweepResult)

  // Step 1 — Fact extraction
  const { object: factResult } = await generateObject({
    model,
    schema: factSchema,
    system: GRAPH_STEP1_SYSTEM,
    prompt: `DATA:\n\n${dataStr}`,
  })

  // Step 2 — Entity normalization
  const factsStr = JSON.stringify(factResult.facts, null, 2)
  const { object: entityResult } = await generateObject({
    model,
    schema: entityNormalizationSchema,
    system: GRAPH_STEP2_SYSTEM,
    prompt: `FACTS:\n\n${factsStr}`,
  })

  // Step 3 — Build graph (programmatic, no extra LLM call)
  const graph = buildGraph(factResult.facts, entityResult.entities)

  return {
    facts: factResult.facts,
    entities: entityResult.entities,
    graph,
  }
}
