"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  TrendingUp,
  Users,
  Shield,
  MessageSquare,
  Cpu,
  Bell,
  ArrowRight,
  Sparkles,
  BarChart3,
  Network,
  Zap,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Animated background dots
// ---------------------------------------------------------------------------

function DotGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(circle, rgb(75, 166, 105) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
    </div>
  )
}

function GlowOrb({ className }: { className?: string }) {
  return (
    <div
      className={`absolute rounded-full blur-[120px] opacity-20 pointer-events-none ${className}`}
      style={{ background: "rgb(75, 166, 105)" }}
    />
  )
}

// ---------------------------------------------------------------------------
// Feature data
// ---------------------------------------------------------------------------

const features = [
  {
    icon: BarChart3,
    title: "Financial Intelligence",
    description:
      "Revenue estimates, funding rounds, burn rate analysis, and valuation projections powered by public data and AI modeling.",
  },
  {
    icon: Users,
    title: "Founder Deep-Dive",
    description:
      "Track founder backgrounds, past exits, network strength, and social signals. Spot serial entrepreneurs and rising stars.",
  },
  {
    icon: Shield,
    title: "Market & MOAT Analysis",
    description:
      "Competitive landscape mapping, TAM estimates, moat scoring, and market trend analysis with actionable intelligence.",
  },
  {
    icon: MessageSquare,
    title: "Customer Sentiment",
    description:
      "Aggregate reviews, social sentiment, churn signals, and NPS estimates from thousands of public sources.",
  },
  {
    icon: Cpu,
    title: "Product Intelligence",
    description:
      "Feature teardowns, tech stack detection, product roadmap signals, and pricing analysis from public artifacts.",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    description:
      "Get notified on funding announcements, leadership changes, product launches, and market shifts as they happen.",
  },
]

// ---------------------------------------------------------------------------
// Demo preview component
// ---------------------------------------------------------------------------

function DemoPreview() {
  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-primary/20 to-primary/5 opacity-50 blur-sm" />
      <Card className="relative overflow-hidden border-border/60 bg-card/80 backdrop-blur">
        <CardContent className="p-0">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
            <div className="flex gap-1.5">
              <div className="size-3 rounded-full bg-red-400/80" />
              <div className="size-3 rounded-full bg-yellow-400/80" />
              <div className="size-3 rounded-full bg-green-400/80" />
            </div>
            <div className="ml-4 flex flex-1 items-center gap-2 rounded-md bg-background/80 px-3 py-1.5 text-xs text-muted-foreground">
              <Search className="size-3.5" />
              <span>Enter a startup name...</span>
            </div>
          </div>
          {/* Mock content */}
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="size-6 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-48 rounded bg-muted" />
                <div className="h-3 w-32 rounded bg-muted/60" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/40 p-3 space-y-2">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-6 w-20 rounded bg-primary/20" />
              </div>
              <div className="rounded-lg bg-muted/40 p-3 space-y-2">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-6 w-20 rounded bg-primary/20" />
              </div>
              <div className="rounded-lg bg-muted/40 p-3 space-y-2">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-6 w-20 rounded bg-primary/20" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-muted/60" />
              <div className="h-3 w-5/6 rounded bg-muted/60" />
              <div className="h-3 w-4/6 rounded bg-muted/60" />
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">AI Summary</Badge>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Knowledge Graph</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Home() {
  return (
    <div className="flex flex-col min-h-full relative">
      <DotGrid />

      {/* Header */}
      <header className="relative border-b border-border/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Network className="size-4.5 text-primary" />
            </div>
            <span className="font-semibold text-lg tracking-tight">AI Scuttlebutt</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {["Product", "Pricing", "Docs", "Blog"].map((item) => (
              <a
                key={item}
                href="#"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Sign In
            </Button>
            <Link href="/research">
              <Button size="sm" className="gap-2">
                Get Started
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
        <GlowOrb className="top-20 left-1/2 -translate-x-1/2 size-[500px]" />

        <div className="relative max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary shadow-sm">
            <Zap className="size-3.5" />
            Now in public beta
          </div>

          <h1 className="text-5xl md:text-7xl font-medium leading-[1.1] tracking-tight">
            Know everything about{" "}
            <span className="text-primary">any startup</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
            AI-powered startup intelligence. Drop in a company name, get a full
            research report — financials, product intel, customer sentiment,
            MOAT analysis, and founder deep-dive.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/research">
              <Button size="lg" className="h-12 px-8 rounded-full gap-2 text-base">
                <Sparkles className="size-4" />
                Start Researching
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-12 px-8 rounded-full gap-2 text-base">
              View Demo
              <ArrowRight className="size-4" />
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 md:gap-10 pt-8">
            {[
              { value: "2.4K+", label: "Companies tracked" },
              { value: "850+", label: "Research reports" },
              { value: "12K+", label: "Data points analyzed" },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-6 md:gap-10">
                {i > 0 && <Separator orientation="vertical" className="h-10 hidden sm:block" />}
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-semibold tracking-tight">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo preview */}
        <div className="relative w-full mt-20">
          <DemoPreview />
        </div>
      </section>

      {/* How it works */}
      <section className="relative px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium mb-4 tracking-tight">
              Research in{" "}
              <span className="text-primary">three steps</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg">
              From search to insights in under a minute. Our AI does the heavy lifting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Search",
                description: "Enter any company name. We scan hundreds of public data sources instantly.",
                icon: Search,
              },
              {
                step: "02",
                title: "Analyze",
                description: "Our AI pipelines extract structured data, relationships, and key insights.",
                icon: TrendingUp,
              },
              {
                step: "03",
                title: "Discover",
                description: "Explore interactive summaries, knowledge graphs, and evidence-backed reports.",
                icon: Network,
              },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="absolute -inset-4 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                      <item.icon className="size-5 text-primary" />
                    </div>
                    <span className="text-sm font-mono text-primary/60">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium mb-4 tracking-tight">
              Everything you need to{" "}
              <span className="text-primary">research smarter</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg">
              From financials to founder backgrounds — get the full picture on any
              startup before you invest, partner, or compete.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/80"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <feature.icon className="size-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-24">
        <GlowOrb className="bottom-0 left-1/2 -translate-x-1/2 size-[400px] opacity-10" />
        <div className="relative max-w-3xl mx-auto">
          <Card className="overflow-hidden border-border/60 bg-card/80 backdrop-blur text-center p-12">
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Sparkles className="size-6 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight">
                Ready to stop guessing?
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto text-lg">
                Join thousands of investors, founders, and analysts who use AI
                Scuttlebutt to make smarter decisions.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Input
                  placeholder="Enter your email..."
                  className="h-12 text-base max-w-xs w-full rounded-full px-5"
                />
                <Button size="lg" className="h-12 px-8 rounded-full gap-2">
                  Start Free Trial
                  <ArrowRight className="size-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                No credit card required. 7-day free trial.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/60">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <Network className="size-4.5 text-primary" />
                </div>
                <span className="font-semibold text-lg tracking-tight">AI Scuttlebutt</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs">
                AI-powered startup intelligence for investors, founders, and analysts.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Resources</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-border/60">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} AI Scuttlebutt. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
