import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export default function Home() {
  return (
    <main className="flex-1 p-8">
      <div className="max-w-2xl mx-auto mb-12 mt-16">
        <Input
          placeholder="Search for a startup, founder, or market..."
          className="h-12 text-base"
        />
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Research a Startup</CardTitle>
            <CardDescription>Deep-dive into any company</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="secondary">AI/ML</Badge>
            <Badge variant="secondary">Seed</Badge>
            <Badge variant="secondary">B2B</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analyze a Market</CardTitle>
            <CardDescription>Competitive landscape &amp; trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="secondary">Explore Markets</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Track a Founder</CardTitle>
            <CardDescription>Background, track record, signals</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Start Tracking</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
