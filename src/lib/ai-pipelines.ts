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
  // Hard-cap to avoid accidental token blowout (GPT-4o supports ~128k tokens)
  return full.length > 100_000
    ? full.slice(0, 100_000) + "\n…[truncated]"
    : full
}

// ---------------------------------------------------------------------------
// Summary pipeline types
// ---------------------------------------------------------------------------

// OpenAI structured outputs require ALL properties to be in `required`.
// Use .nullable() (not .optional()) for fields that may be absent in the data —
// the field will always be present in the response but its value will be null.
const structuredSummarySchema = z.object({
  company: z.string(),
  oneLineDescription: z.string(),
  businessModel: z.string(),
  website: z.string().nullable(),
  founded: z.string().nullable(),
  companySize: z.string().nullable(),
  headquarters: z.string().nullable(),
  fullAddress: z.string().nullable(),
  officeBuilding: z.string().nullable(),
  operatingHours: z.string().nullable(),
  products: z.array(z.string()),
  founders: z.array(z.string()),
  leadership: z.array(
    z.object({
      name: z.string(),
      title: z.string().nullable(),
    }),
  ),
  teamMembers: z.array(
    z.object({
      name: z.string(),
      title: z.string().nullable(),
      department: z.string().nullable(),
    }),
  ),
  investors: z.array(z.string()),
  customers: z.array(z.string()),
  industries: z.array(z.string()),
  technologies: z.array(z.string()),
  partnerships: z.array(z.string()),
  socialProfiles: z.array(
    z.object({
      platform: z.string(),
      url: z.string(),
    }),
  ),
  recentNews: z.array(z.string()),
  fundingInfo: z.string().nullable(),
  ratings: z.string().nullable(),
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

const SUMMARY_STEP1_SYSTEM = `You are an expert company research analyst with a mandate of ZERO DATA LOSS.
You receive raw JSON data collected from multiple APIs about a specific company.
The schemas are inconsistent and may contain duplicate, conflicting, or noisy information.

CRITICAL RULES — follow every one:
1. Extract EVERY piece of factual information present in the data, no matter how small.
2. NEVER skip or summarise away specific details — capture them verbatim or precisely.
3. Locations: extract the full street address, city, state, postal code, country, AND any named building (e.g. "Kapil Towers", "Financial District") into the correct fields.
4. Team members: extract ALL named people with their titles and departments — check serpapi knowledge_graph, hunter domain_search, company_website.team, and any people mentioned in snippets or descriptions.
5. Technologies: extract ALL technologies mentioned anywhere in the data.
6. Social profiles: extract ALL social media / LinkedIn / Instagram / Twitter profile URLs.
7. Founders: extract any names mentioned as founder, co-founder, CEO, or similar.
8. Operating hours: if hours are present in the data, capture them exactly.
9. Funding / investors: capture all investor names and any funding amounts or rounds mentioned.
10. If information conflicts across sources, include both versions with a note.
11. Only use information present in the supplied data — do not hallucinate.

Return the structured JSON requested — nothing else.`

const SUMMARY_STEP2_SYSTEM = `You are a senior analyst writing a comprehensive company intelligence brief.
Convert the structured summary into a clear, professional report with these sections:
1. Executive Summary
2. Company Overview (description, business model, industry, website, founded, size)
3. Location & Contact (full address, building, city, operating hours)
4. Products & Services
5. Founders & Leadership (all named executives with titles)
6. Team Members (all named individuals)
7. Technologies & Stack
8. Investors & Funding
9. Partnerships & Customers
10. Social Profiles
11. Recent News & Activity
12. Key Insights & Risks

IMPORTANT: Include ALL details from the structured summary. Do not omit or summarise away specifics — a fact mentioned once in the data must appear in the report.
Use only facts present in the summary. Write in plain prose for the executive summary; use bullets for all other sections.`

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

const GRAPH_STEP1_SYSTEM = `You are a knowledge graph extraction engine with a mandate of ZERO DATA LOSS.
Extract ALL factual relationships from the provided company research data.

Rules:
- Extract EVERY named relationship: company↔person, company↔location, company↔technology, person↔role, company↔investor, company↔customer, company↔product, company↔socialProfile, etc.
- Use canonical entity names (full name where available).
- Do not infer facts — only extract explicit relationships present in the data.
- Include a short evidence quote for each fact.
- Locations (buildings, addresses, cities) MUST be extracted as LOCATION entities.
- All named people (founders, leadership, team members) MUST be extracted as PERSON entities with their roles.
- All technologies mentioned MUST be extracted as TECHNOLOGY entities.
- Confidence 1.0 = explicitly stated; 0.7 = strongly implied; 0.5 = uncertain.
- Err on the side of extracting more rather than fewer facts.`

const GRAPH_STEP2_SYSTEM = `You are an entity resolution engine.
Given a list of facts, identify all unique entities and merge aliases into a single canonical name.
Assign each entity one of the types: COMPANY, PERSON, PRODUCT, INVESTOR, CUSTOMER, TECHNOLOGY, INDUSTRY, LOCATION, EVENT.`

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
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

  const resolve = (name: string) => aliasMap.get(name.toLowerCase()) ?? name

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
