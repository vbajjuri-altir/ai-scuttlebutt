"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SummaryPipelineResult, KnowledgeGraphPipelineResult } from "@/lib/ai-pipelines"
import type { CompanyResearchSweepResult } from "@/lib/research-tools"
import { GraphVisualization } from "@/components/graph-visualization"

// ---------------------------------------------------------------------------
// Small display helpers
// ---------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </div>
  )
}

function Chips({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-sm text-muted-foreground italic">—</p>
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-border bg-muted px-3 py-0.5 text-xs"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function PipelineError({ error }: { error: string }) {
  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
      {error}
    </div>
  )
}

function PipelineLoading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
      <div className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      {label}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Summary panel
// ---------------------------------------------------------------------------

function SummaryPanel({ result }: { result: SummaryPipelineResult }) {
  const s = result.structuredSummary
  return (
    <div className="space-y-6">
      {/* Report */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-base font-semibold">Intelligence Brief</h3>
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {result.report}
        </div>
      </div>

      {/* Structured facts grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Section title="Products">
          <Chips items={s.products} />
        </Section>
        <Section title="Founders">
          <Chips items={s.founders} />
        </Section>
        <Section title="Leadership">
          <Chips items={s.leadership} />
        </Section>
        <Section title="Investors">
          <Chips items={s.investors} />
        </Section>
        <Section title="Customers">
          <Chips items={s.customers} />
        </Section>
        <Section title="Industries">
          <Chips items={s.industries} />
        </Section>
        <Section title="Partnerships">
          <Chips items={s.partnerships} />
        </Section>
        <Section title="Risks / Unknowns">
          <Chips items={s.risksOrUnknowns} />
        </Section>
      </div>

      {/* Key insights */}
      {s.keyInsights.length > 0 && (
        <Section title="Key Insights">
          <ul className="space-y-1">
            {s.keyInsights.map((insight) => (
              <li key={insight} className="flex gap-2 text-sm">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                {insight}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Recent news */}
      {s.recentNews.length > 0 && (
        <Section title="Recent News">
          <ul className="space-y-1">
            {s.recentNews.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                <span className="shrink-0">·</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Evidence */}
      {s.evidence.length > 0 && (
        <Section title="Evidence">
          <div className="space-y-2">
            {s.evidence.map((e, i) => (
              <div key={i} className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                <p className="font-medium">{e.fact}</p>
                <p className="mt-1 text-xs text-muted-foreground italic">&ldquo;{e.sourceSnippet}&rdquo;</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Knowledge graph panel
// ---------------------------------------------------------------------------

const NODE_TYPE_COLORS: Record<string, string> = {
  COMPANY: "bg-blue-500/10 text-blue-700 border-blue-200",
  PERSON: "bg-green-500/10 text-green-700 border-green-200",
  PRODUCT: "bg-purple-500/10 text-purple-700 border-purple-200",
  INVESTOR: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  CUSTOMER: "bg-orange-500/10 text-orange-700 border-orange-200",
  TECHNOLOGY: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
  INDUSTRY: "bg-pink-500/10 text-pink-700 border-pink-200",
  LOCATION: "bg-teal-500/10 text-teal-700 border-teal-200",
  EVENT: "bg-red-500/10 text-red-700 border-red-200",
}

function NodeTypePill({ type }: { type: string }) {
  const cls = NODE_TYPE_COLORS[type] ?? "bg-muted text-muted-foreground border-border"
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>{type}</span>
  )
}

function GraphPanel({ result }: { result: KnowledgeGraphPipelineResult }) {
  const { graph } = result
  const nodesByType: Record<string, typeof graph.nodes> = {}
  for (const node of graph.nodes) {
    nodesByType[node.type] = nodesByType[node.type] ?? []
    nodesByType[node.type].push(node)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex gap-6 rounded-xl border border-border bg-card p-4 text-sm">
        <div>
          <span className="text-2xl font-semibold tabular-nums">{graph.nodes.length}</span>
          <p className="text-xs text-muted-foreground">Nodes</p>
        </div>
        <div>
          <span className="text-2xl font-semibold tabular-nums">{graph.edges.length}</span>
          <p className="text-xs text-muted-foreground">Edges</p>
        </div>
        <div>
          <span className="text-2xl font-semibold tabular-nums">{result.facts.length}</span>
          <p className="text-xs text-muted-foreground">Facts extracted</p>
        </div>
      </div>

      {/* Nodes grouped by type */}
      <Section title="Nodes">
        <div className="space-y-3">
          {Object.entries(nodesByType).map(([type, nodes]) => (
            <div key={type}>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">{type}</p>
              <div className="flex flex-wrap gap-2">
                {nodes.map((n) => (
                  <span
                    key={n.id}
                    className={`rounded-full border px-3 py-0.5 text-xs font-medium ${NODE_TYPE_COLORS[type] ?? "bg-muted text-muted-foreground border-border"}`}
                  >
                    {n.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Edges table */}
      <Section title="Edges">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Subject</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Relation</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Object</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Conf.</th>
              </tr>
            </thead>
            <tbody>
              {graph.edges.map((edge, i) => {
                const srcNode = graph.nodes.find((n) => n.id === edge.source)
                const tgtNode = graph.nodes.find((n) => n.id === edge.target)
                return (
                  <tr
                    key={i}
                    className="group border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5">
                        {srcNode && <NodeTypePill type={srcNode.type} />}
                        <span className="font-medium">{srcNode?.label ?? edge.source}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-primary">{edge.relation}</td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5">
                        {tgtNode && <NodeTypePill type={tgtNode.type} />}
                        <span className="font-medium">{tgtNode?.label ?? edge.target}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      {(edge.confidence * 100).toFixed(0)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Evidence from facts */}
      <Section title="Extracted Facts">
        <div className="space-y-2">
          {result.facts.map((fact, i) => (
            <div key={i} className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
              <p className="font-medium">
                {fact.subject}{" "}
                <span className="font-mono text-xs text-primary">{fact.predicate}</span>{" "}
                {fact.object}
              </p>
              {fact.evidence && (
                <p className="mt-0.5 text-xs italic text-muted-foreground">
                  &ldquo;{fact.evidence}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Interactive graph */}
      <Section title="Graph">
        <GraphVisualization nodes={graph.nodes} edges={graph.edges} />
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type Tab = "raw" | "summary" | "graph"

export default function ResearchPage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<CompanyResearchSweepResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<Tab>("raw")

  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryData, setSummaryData] = useState<SummaryPipelineResult | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const [graphLoading, setGraphLoading] = useState(false)
  const [graphData, setGraphData] = useState<KnowledgeGraphPipelineResult | null>(null)
  const [graphError, setGraphError] = useState<string | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setData(null)
    setSummaryData(null)
    setGraphData(null)
    setActiveTab("raw")

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      setData(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleSummary() {
    if (!data) return
    setSummaryLoading(true)
    setSummaryError(null)
    setActiveTab("summary")

    try {
      const res = await fetch("/api/research/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawData: data }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail ?? json.error ?? `Error ${res.status}`)
      setSummaryData(json)
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : "Summary failed")
    } finally {
      setSummaryLoading(false)
    }
  }

  async function handleGraph() {
    if (!data) return
    setGraphLoading(true)
    setGraphError(null)
    setActiveTab("graph")

    try {
      const res = await fetch("/api/research/graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawData: data }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail ?? json.error ?? `Error ${res.status}`)
      setGraphData(json)
    } catch (err) {
      setGraphError(err instanceof Error ? err.message : "Graph pipeline failed")
    } finally {
      setGraphLoading(false)
    }
  }

  const tabs: { id: Tab; label: string; badge?: string }[] = [
    { id: "raw", label: "Raw Data" },
    {
      id: "summary",
      label: "AI Summary",
      badge: summaryData ? "ready" : summaryLoading ? "loading" : undefined,
    },
    {
      id: "graph",
      label: "Knowledge Graph",
      badge: graphData
        ? `${graphData.graph.nodes.length}n / ${graphData.graph.edges.length}e`
        : graphLoading
          ? "loading"
          : undefined,
    },
  ]

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <Link href="/" className="font-semibold text-lg">AI Scuttlebutt</Link>
          <nav className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm">Home</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Search */}
      <section className="px-6 pt-16 pb-8">
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-normal text-center mb-2">Startup Research</h1>
          <p className="text-muted-foreground text-center mb-8">
            Enter a company name to pull financials, product intel, founder data, and more.
          </p>
          <div className="flex gap-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a startup name..."
              className="h-12 text-base flex-1"
            />
            <Button
              type="submit"
              size="lg"
              className="h-12 px-8 rounded-full"
              disabled={loading || !query.trim()}
            >
              {loading ? "Searching..." : "Research"}
            </Button>
          </div>
        </form>
      </section>

      {/* Results */}
      <section className="flex-1 px-6 pb-16">
        <div className="max-w-4xl mx-auto space-y-6">
          {error && <PipelineError error={error} />}

          {loading && (
            <div className="text-center py-16 text-muted-foreground">
              <div className="size-6 mx-auto mb-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              Researching &ldquo;{query}&rdquo;…
            </div>
          )}

          {data && !loading && (
            <>
              {/* AI workflow trigger buttons */}
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
                <p className="mr-auto text-sm font-medium">AI Workflows</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSummary}
                  disabled={summaryLoading}
                >
                  {summaryLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="size-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      Summarising…
                    </span>
                  ) : (
                    "Generate AI Summary"
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGraph}
                  disabled={graphLoading}
                >
                  {graphLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="size-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      Building graph…
                    </span>
                  ) : (
                    "Build Knowledge Graph"
                  )}
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 border-b border-border">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-primary font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    {tab.badge && tab.badge !== "loading" && (
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        {tab.badge}
                      </span>
                    )}
                    {tab.badge === "loading" && (
                      <span className="size-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab panels */}
              {activeTab === "raw" && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    {data.results.filter((r) => r.ok).length} of {data.results.length} sources succeeded
                  </p>
                  <pre className="overflow-auto rounded-xl bg-card border border-border p-6 text-sm text-muted-foreground whitespace-pre-wrap break-words max-h-[70vh]">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              )}

              {activeTab === "summary" && (
                <div>
                  {summaryLoading && <PipelineLoading label={`Generating AI summary for "${query}"… this takes ~15 s`} />}
                  {summaryError && <PipelineError error={summaryError} />}
                  {summaryData && !summaryLoading && <SummaryPanel result={summaryData} />}
                  {!summaryData && !summaryLoading && !summaryError && (
                    <p className="py-12 text-center text-sm text-muted-foreground">
                      Click &ldquo;Generate AI Summary&rdquo; above to run the pipeline.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "graph" && (
                <div>
                  {graphLoading && <PipelineLoading label={`Extracting knowledge graph for "${query}"… this takes ~20 s`} />}
                  {graphError && <PipelineError error={graphError} />}
                  {graphData && !graphLoading && <GraphPanel result={graphData} />}
                  {!graphData && !graphLoading && !graphError && (
                    <p className="py-12 text-center text-sm text-muted-foreground">
                      Click &ldquo;Build Knowledge Graph&rdquo; above to run the pipeline.
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {!data && !loading && !error && (
            <p className="text-center text-muted-foreground py-16">
              Search for a startup to see research results here.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
