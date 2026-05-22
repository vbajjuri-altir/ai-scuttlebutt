"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { SummaryPipelineResult, KnowledgeGraphPipelineResult } from "@/lib/ai-pipelines"
import type { CompanyResearchSweepResult } from "@/lib/research-tools"
import type { TeamMember, CompanyTeamPageResult } from "@/lib/public-data-sources"
import { GraphVisualization } from "@/components/graph-visualization"
import {
  Search,
  ArrowLeft,
  Sparkles,
  Network,
  FileText,
  Loader2,
  AlertCircle,
  ChevronRight,
  Building2,
  TrendingUp,
  Users,
  Shield,
  Lightbulb,
  Newspaper,
  CheckCircle2,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Small display helpers
// ---------------------------------------------------------------------------

function Section({ title, icon: Icon, children }: { title: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="size-4 text-primary" />}
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      </div>
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
          className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-foreground/80 hover:border-primary/30 hover:bg-primary/5 transition-colors"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function PipelineError({ error }: { error: string }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
      <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
      <p className="text-sm text-destructive">{error}</p>
    </div>
  )
}

function PipelineLoading({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
      <div className="relative">
        <div className="size-8 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-sm">{label}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Summary panel
// ---------------------------------------------------------------------------

function SummaryPanel({ result }: { result: SummaryPipelineResult }) {
  const s = result.structuredSummary
  return (
    <div className="space-y-8">
      {/* Report */}
      <Card className="overflow-hidden border-border/60">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <h3 className="text-base font-semibold">Intelligence Brief</h3>
          </div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {result.report}
          </div>
        </CardContent>
      </Card>

      {/* Structured facts grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Section title="Products" icon={Building2}>
          <Chips items={s.products} />
        </Section>
        <Section title="Founders" icon={Users}>
          <Chips items={s.founders} />
        </Section>
        <Section title="Leadership" icon={Users}>
          <Chips items={s.leadership} />
        </Section>
        <Section title="Investors" icon={TrendingUp}>
          <Chips items={s.investors} />
        </Section>
        <Section title="Customers" icon={Users}>
          <Chips items={s.customers} />
        </Section>
        <Section title="Industries" icon={Shield}>
          <Chips items={s.industries} />
        </Section>
        <Section title="Partnerships" icon={CheckCircle2}>
          <Chips items={s.partnerships} />
        </Section>
        <Section title="Risks / Unknowns" icon={AlertCircle}>
          <Chips items={s.risksOrUnknowns} />
        </Section>
      </div>

      {/* Key insights */}
      {s.keyInsights.length > 0 && (
        <Section title="Key Insights" icon={Lightbulb}>
          <Card className="border-border/60">
            <CardContent className="p-4 space-y-3">
              {s.keyInsights.map((insight) => (
                <div key={insight} className="flex gap-3 text-sm">
                  <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-foreground/90">{insight}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </Section>
      )}

      {/* Recent news */}
      {s.recentNews.length > 0 && (
        <Section title="Recent News" icon={Newspaper}>
          <Card className="border-border/60">
            <CardContent className="p-4 space-y-3">
              {s.recentNews.map((item) => (
                <div key={item} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="shrink-0 text-primary">·</span>
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </Section>
      )}

      {/* Evidence */}
      {s.evidence.length > 0 && (
        <Section title="Evidence" icon={FileText}>
          <div className="space-y-3">
            {s.evidence.map((e, i) => (
              <Card key={i} className="border-border/60 overflow-hidden">
                <CardContent className="p-4 space-y-2">
                  <p className="font-medium text-sm">{e.fact}</p>
                  <Separator />
                  <p className="text-xs text-muted-foreground italic">&ldquo;{e.sourceSnippet}&rdquo;</p>
                </CardContent>
              </Card>
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
  COMPANY: "bg-primary/10 text-primary border-primary/20",
  PERSON: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PRODUCT: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  INVESTOR: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  CUSTOMER: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  TECHNOLOGY: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  INDUSTRY: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  LOCATION: "bg-lime-500/10 text-lime-400 border-lime-500/20",
  EVENT: "bg-rose-500/10 text-rose-400 border-rose-500/20",
}

function NodeTypePill({ type }: { type: string }) {
  const cls = NODE_TYPE_COLORS[type] ?? "bg-muted text-muted-foreground border-border"
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}>{type}</span>
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
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold tabular-nums text-primary">{graph.nodes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Nodes</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold tabular-nums text-primary">{graph.edges.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Edges</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold tabular-nums text-primary">{result.facts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Facts</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive graph */}
      <Section title="Graph Visualization" icon={Network}>
        <GraphVisualization nodes={graph.nodes} edges={graph.edges} />
      </Section>

      {/* Nodes grouped by type */}
      <Section title="Nodes" icon={Building2}>
        <div className="space-y-4">
          {Object.entries(nodesByType).map(([type, nodes]) => (
            <div key={type}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{type}</p>
              <div className="flex flex-wrap gap-2">
                {nodes.map((n) => (
                  <span
                    key={n.id}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${NODE_TYPE_COLORS[type] ?? "bg-muted text-muted-foreground border-border"}`}
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
      <Section title="Edges" icon={ChevronRight}>
        <Card className="overflow-hidden border-border/60">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Relation</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Object</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs uppercase tracking-wider">Conf.</th>
                </tr>
              </thead>
              <tbody>
                {graph.edges.map((edge, i) => {
                  const srcNode = graph.nodes.find((n) => n.id === edge.source)
                  const tgtNode = graph.nodes.find((n) => n.id === edge.target)
                  return (
                    <tr
                      key={i}
                      className="group border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          {srcNode && <NodeTypePill type={srcNode.type} />}
                          <span className="font-medium">{srcNode?.label ?? edge.source}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-primary">{edge.relation}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          {tgtNode && <NodeTypePill type={tgtNode.type} />}
                          <span className="font-medium">{tgtNode?.label ?? edge.target}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground font-medium">
                        {(edge.confidence * 100).toFixed(0)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>

      {/* Evidence from facts */}
      <Section title="Extracted Facts" icon={FileText}>
        <div className="space-y-3">
          {result.facts.map((fact, i) => (
            <Card key={i} className="border-border/60 overflow-hidden">
              <CardContent className="p-4 space-y-2">
                <p className="font-medium text-sm">
                  {fact.subject}{" "}
                  <span className="font-mono text-xs text-primary bg-primary/5 px-1.5 py-0.5 rounded">{fact.predicate}</span>{" "}
                  {fact.object}
                </p>
                {fact.evidence && (
                  <p className="text-xs italic text-muted-foreground">
                    &ldquo;{fact.evidence}&rdquo;
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Team panel
// ---------------------------------------------------------------------------

function TeamMemberCard({ member }: { member: TeamMember }) {
  const initials = member.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {member.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.imageUrl} alt={member.name} className="size-10 rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{member.name}</p>
        {member.role && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{member.role}</p>
        )}
        {member.bio && (
          <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">{member.bio}</p>
        )}
        <div className="flex gap-3 mt-1.5">
          {member.linkedIn && (
            <a
              href={member.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              LinkedIn
            </a>
          )}
          {member.twitter && (
            <a
              href={`https://twitter.com/${member.twitter.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Twitter
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function TeamPanel({ data }: { data: CompanyResearchSweepResult }) {
  const teamResult = data.results.find((r) => r.name === "company_website.team")
  const hunterResult = data.results.find((r) => r.name === "hunter.domain_search")

  const teamData = teamResult?.ok ? (teamResult.data as CompanyTeamPageResult) : null
  const hunterData = hunterResult?.ok
    ? (hunterResult.data as { emails?: Array<{ firstName?: string; lastName?: string; position?: string; linkedin?: string }> })
    : null

  // Build people list from Hunter (name + role only, no emails)
  const hunterPeople: TeamMember[] = (hunterData?.emails ?? [])
    .filter((e) => e.firstName || e.lastName)
    .map((e) => ({
      name: [e.firstName, e.lastName].filter(Boolean).join(" "),
      role: e.position,
      linkedIn: e.linkedin,
    }))

  const websiteMembers = teamData?.members ?? []
  const hasWebsiteData = websiteMembers.length > 0
  const hasHunterPeople = hunterPeople.length > 0

  if (!teamResult && !hunterResult) {
    return (
      <Card className="border-border/60">
        <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-3">
          <Users className="size-10 text-muted-foreground/30" />
          <p className="text-sm">No domain was found to scrape team data from.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Website team members */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            From Company Website
          </h3>
          {teamData && (
            <span className="ml-auto text-xs text-muted-foreground">
              {teamData.pageUrl}
            </span>
          )}
        </div>

        {!teamResult && (
          <p className="text-sm text-muted-foreground italic">Domain not detected — try searching with a URL.</p>
        )}
        {teamResult && !teamResult.ok && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {teamResult.error}
          </div>
        )}
        {teamData && !hasWebsiteData && (
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
            <p>{teamData.note ?? "No structured person data was found on the team/about page."}</p>
            <p className="mt-1 text-xs">
              Most React/Next.js SPAs render team sections client-side, so static scraping cannot extract them.
              Try the AI Summary — it can infer team members from news and search snippets.
            </p>
          </div>
        )}
        {hasWebsiteData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {websiteMembers.map((m, i) => (
              <TeamMemberCard key={i} member={m} />
            ))}
          </div>
        )}
      </div>

      {/* Hunter people (names + roles, no emails) */}
      {hasHunterPeople && (
        <>
          <Separator className="opacity-50" />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                From Hunter.io (People Index)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hunterPeople.map((m, i) => (
                <TeamMemberCard key={i} member={m} />
              ))}
            </div>
          </div>
        </>
      )}

      {!hasWebsiteData && !hasHunterPeople && teamResult?.ok && (
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground space-y-3">
            <Users className="size-10 text-muted-foreground/30" />
            <div className="text-center">
              <p className="font-medium text-foreground">No team members found</p>
              <p className="text-sm mt-1 max-w-xs">
                The website may render team pages with JavaScript. Try &ldquo;Generate AI Summary&rdquo;
                which can infer people from search snippets and news.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type Tab = "raw" | "summary" | "graph" | "team"

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

  const teamResult = data?.results.find((r) => r.name === "company_website.team")
  const teamCount =
    teamResult?.ok && typeof (teamResult.data as { totalFound?: number }).totalFound === "number"
      ? (teamResult.data as { totalFound: number }).totalFound
      : undefined

  const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: "raw", label: "Raw Data", icon: FileText },
    { id: "team", label: "Team", icon: Users, badge: teamCount != null ? `${teamCount}` : undefined },
    {
      id: "summary",
      label: "AI Summary",
      icon: Sparkles,
      badge: summaryData ? "ready" : summaryLoading ? "loading" : undefined,
    },
    {
      id: "graph",
      label: "Knowledge Graph",
      icon: Network,
      badge: graphData
        ? `${graphData.graph.nodes.length} nodes`
        : graphLoading
          ? "loading"
          : undefined,
    },
  ]

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="border-b border-border/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Network className="size-4.5 text-primary" />
            </div>
            <span className="font-semibold text-lg tracking-tight">AI Scuttlebutt</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="size-4" />
                Home
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Search */}
      <section className="px-6 pt-16 pb-10">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight">Startup Research</h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Enter a company name or URL to pull product intel, team members, news, and more.
            </p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Company name or URL (e.g. Wealthup or wealthup.me)"
                className="h-14 pl-12 text-base rounded-xl border-border/60 bg-card/60 backdrop-blur-sm"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8 rounded-xl gap-2"
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Research
                </>
              )}
            </Button>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="flex-1 px-6 pb-16">
        <div className="max-w-4xl mx-auto space-y-6">
          {error && <PipelineError error={error} />}

          {loading && (
            <Card className="border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
                <div className="relative">
                  <div className="size-10 rounded-full border-2 border-primary/20" />
                  <div className="absolute inset-0 size-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-medium text-foreground">Researching &ldquo;{query}&rdquo;</p>
                  <p className="text-sm">Scanning public data sources...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {data && !loading && (
            <>
              {/* Source status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 text-primary" />
                  <span>
                    {data.results.filter((r) => r.ok).length} of {data.results.length} sources succeeded
                  </span>
                </div>
              </div>

              {/* AI workflow trigger buttons */}
              <Card className="border-border/60 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 mr-auto">
                      <Sparkles className="size-4 text-primary" />
                      <p className="text-sm font-semibold">AI Workflows</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSummary}
                      disabled={summaryLoading}
                      className="gap-2"
                    >
                      {summaryLoading ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Summarising...
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-3.5" />
                          Generate AI Summary
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGraph}
                      disabled={graphLoading}
                      className="gap-2"
                    >
                      {graphLoading ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Building graph...
                        </>
                      ) : (
                        <>
                          <Network className="size-3.5" />
                          Build Knowledge Graph
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <div className="flex gap-1 border-b border-border/60">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-primary font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="size-4" />
                    {tab.label}
                    {tab.badge && tab.badge !== "loading" && (
                      <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary border-primary/20 text-[10px]">
                        {tab.badge}
                      </Badge>
                    )}
                    {tab.badge === "loading" && (
                      <Loader2 className="size-3 animate-spin text-primary" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab panels */}
              {activeTab === "team" && <TeamPanel data={data} />}

              {activeTab === "raw" && (
                <Card className="border-border/60 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-auto max-h-[70vh]">
                      <pre className="p-6 text-sm text-muted-foreground whitespace-pre-wrap break-words">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "summary" && (
                <div>
                  {summaryLoading && <PipelineLoading label={`Generating AI summary for "${query}"... this takes ~15s`} />}
                  {summaryError && <PipelineError error={summaryError} />}
                  {summaryData && !summaryLoading && <SummaryPanel result={summaryData} />}
                  {!summaryData && !summaryLoading && !summaryError && (
                    <Card className="border-border/60">
                      <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
                        <Sparkles className="size-10 text-muted-foreground/30" />
                        <div className="text-center">
                          <p className="font-medium text-foreground">No summary yet</p>
                          <p className="text-sm mt-1">Click &ldquo;Generate AI Summary&rdquo; above to run the pipeline.</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === "graph" && (
                <div>
                  {graphLoading && <PipelineLoading label={`Extracting knowledge graph for "${query}"... this takes ~20s`} />}
                  {graphError && <PipelineError error={graphError} />}
                  {graphData && !graphLoading && <GraphPanel result={graphData} />}
                  {!graphData && !graphLoading && !graphError && (
                    <Card className="border-border/60">
                      <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
                        <Network className="size-10 text-muted-foreground/30" />
                        <div className="text-center">
                          <p className="font-medium text-foreground">No graph yet</p>
                          <p className="text-sm mt-1">Click &ldquo;Build Knowledge Graph&rdquo; above to run the pipeline.</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}

          {!data && !loading && !error && (
            <Card className="border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
                <Search className="size-10 text-muted-foreground/30" />
                <div className="text-center">
                  <p className="font-medium text-foreground">Start your research</p>
                  <p className="text-sm mt-1">Search for a startup to see research results here.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
