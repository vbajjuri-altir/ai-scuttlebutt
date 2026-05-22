import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">AI Scuttlebutt</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Product</a>
            <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#" className="hover:text-foreground transition-colors">Docs</a>
            <a href="#" className="hover:text-foreground transition-colors">Blog</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">Sign In</Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            Now in public beta
          </div>

          <h1 className="text-5xl md:text-7xl font-normal leading-tight tracking-tight">
            Know everything about{" "}
            <span className="text-primary">any startup</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
            AI-powered startup intelligence. Drop in a company name, get a full
            research report — financials, product intel, customer sentiment,
            MOAT analysis, and founder deep-dive. In minutes, not days.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Input
              placeholder="Enter a startup name..."
              className="h-12 text-base max-w-sm w-full"
            />
            <Button size="lg" className="h-12 px-8 rounded-full">
              Research
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 pt-4">
            <div className="text-center">
              <div className="text-2xl font-semibold">2.4K+</div>
              <div className="text-sm text-muted-foreground">Companies tracked</div>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="text-center">
              <div className="text-2xl font-semibold">850+</div>
              <div className="text-sm text-muted-foreground">Research reports</div>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="text-center">
              <div className="text-2xl font-semibold">12K+</div>
              <div className="text-sm text-muted-foreground">Data points analyzed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-normal mb-4">
              Everything you need to{" "}
              <span className="text-primary">research smarter</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From financials to founder backgrounds — get the full picture on any
              startup before you invest, partner, or compete.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <CardHeader className="p-0">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <svg className="size-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                </div>
                <CardTitle>Financial Intelligence</CardTitle>
                <CardDescription className="mt-2">
                  Revenue estimates, funding rounds, burn rate analysis, and
                  valuation projections powered by public data and AI modeling.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <svg className="size-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <CardTitle>Founder Deep-Dive</CardTitle>
                <CardDescription className="mt-2">
                  Track founder backgrounds, past exits, network strength,
                  and social signals. Spot serial entrepreneurs and rising stars.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <svg className="size-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                  </svg>
                </div>
                <CardTitle>Market &amp; MOAT Analysis</CardTitle>
                <CardDescription className="mt-2">
                  Competitive landscape mapping, TAM estimates, moat scoring,
                  and market trend analysis with actionable intelligence.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <svg className="size-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                </div>
                <CardTitle>Customer Sentiment</CardTitle>
                <CardDescription className="mt-2">
                  Aggregate reviews, social sentiment, churn signals, and NPS
                  estimates from thousands of public sources.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <svg className="size-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                </div>
                <CardTitle>Product Intelligence</CardTitle>
                <CardDescription className="mt-2">
                  Feature teardowns, tech stack detection, product roadmap
                  signals, and pricing analysis from public artifacts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <svg className="size-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <CardTitle>Real-Time Alerts</CardTitle>
                <CardDescription className="mt-2">
                  Get notified on funding announcements, leadership changes,
                  product launches, and market shifts as they happen.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center bg-card border-border">
            <h2 className="text-3xl md:text-4xl font-normal mb-4">
              Ready to stop guessing?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Join thousands of investors, founders, and analysts who use AI
              Scuttlebutt to make smarter decisions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Input
                placeholder="Enter your email..."
                className="h-12 text-base max-w-xs w-full"
              />
              <Button size="lg" className="h-12 px-8 rounded-full">
                Start Free
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              No credit card required. 7-day free trial.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">AI Scuttlebutt</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} AI Scuttlebutt. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
