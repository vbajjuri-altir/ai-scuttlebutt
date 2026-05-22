export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== "string") {
      return Response.json({ error: "Query is required" }, { status: 400 })
    }

    const response = await fetch(
      "https://api.altir.ai/v1/research",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ALTIR_API_KEY}`,
        },
        body: JSON.stringify({ query: query.trim() }),
      }
    )

    if (!response.ok) {
      const text = await response.text()
      return Response.json(
        { error: `API error: ${response.status}`, detail: text },
        { status: response.status }
      )
    }

    const data = await response.json()
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
