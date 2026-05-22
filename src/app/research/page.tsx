"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ResearchPage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setData(null)

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      })

      if (!res.ok) throw new Error(`Request failed: ${res.status}`)

      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <a href="/" className="font-semibold text-lg">AI Scuttlebutt</a>
          <nav className="flex items-center gap-3">
            <a href="/">
              <Button variant="outline" size="sm">Home</Button>
            </a>
          </nav>
        </div>
      </header>

      {/* Search */}
      <section className="px-6 pt-16 pb-8">
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-normal text-center mb-2">
            Startup Research
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Enter a company name to pull financials, product intel, founder
            data, and more.
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
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-16 text-muted-foreground">
              <div className="size-6 mx-auto mb-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              Researching &ldquo;{query}&rdquo;...
            </div>
          )}

          {data && !loading && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Results</h2>
              <pre className="overflow-auto rounded-xl bg-card border border-border p-6 text-sm text-muted-foreground whitespace-pre-wrap break-words max-h-[70vh]">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
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
