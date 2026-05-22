"use client"

import { useMemo } from "react"
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import type { KnowledgeGraphNode, KnowledgeGraphEdge } from "@/lib/ai-pipelines"

// ---------------------------------------------------------------------------
// Type → visual style map
// ---------------------------------------------------------------------------

type TypeStyle = {
  bg: string
  border: string
  text: string
  minimap: string
}

const TYPE_STYLES: Record<string, TypeStyle> = {
  COMPANY: {
    bg: "rgba(59,130,246,0.18)",
    border: "rgb(59,130,246)",
    text: "rgb(147,197,253)",
    minimap: "rgb(59,130,246)",
  },
  PERSON: {
    bg: "rgba(34,197,94,0.18)",
    border: "rgb(34,197,94)",
    text: "rgb(134,239,172)",
    minimap: "rgb(34,197,94)",
  },
  PRODUCT: {
    bg: "rgba(168,85,247,0.18)",
    border: "rgb(168,85,247)",
    text: "rgb(216,180,254)",
    minimap: "rgb(168,85,247)",
  },
  INVESTOR: {
    bg: "rgba(234,179,8,0.18)",
    border: "rgb(234,179,8)",
    text: "rgb(253,224,71)",
    minimap: "rgb(234,179,8)",
  },
  CUSTOMER: {
    bg: "rgba(249,115,22,0.18)",
    border: "rgb(249,115,22)",
    text: "rgb(253,186,116)",
    minimap: "rgb(249,115,22)",
  },
  TECHNOLOGY: {
    bg: "rgba(6,182,212,0.18)",
    border: "rgb(6,182,212)",
    text: "rgb(103,232,249)",
    minimap: "rgb(6,182,212)",
  },
  INDUSTRY: {
    bg: "rgba(236,72,153,0.18)",
    border: "rgb(236,72,153)",
    text: "rgb(249,168,212)",
    minimap: "rgb(236,72,153)",
  },
  LOCATION: {
    bg: "rgba(20,184,166,0.18)",
    border: "rgb(20,184,166)",
    text: "rgb(94,234,212)",
    minimap: "rgb(20,184,166)",
  },
  EVENT: {
    bg: "rgba(239,68,68,0.18)",
    border: "rgb(239,68,68)",
    text: "rgb(252,165,165)",
    minimap: "rgb(239,68,68)",
  },
  UNKNOWN: {
    bg: "rgba(113,113,122,0.18)",
    border: "rgb(113,113,122)",
    text: "rgb(161,161,170)",
    minimap: "rgb(113,113,122)",
  },
}

function styleForType(type: string): TypeStyle {
  return TYPE_STYLES[type] ?? TYPE_STYLES.UNKNOWN
}

// ---------------------------------------------------------------------------
// Radial layout
// ---------------------------------------------------------------------------

// Ring assignment per type: 0 = center, 1 = inner ring, etc.
const TYPE_RING: Record<string, number> = {
  COMPANY: 0,
  PERSON: 1,
  PRODUCT: 2,
  INVESTOR: 2,
  CUSTOMER: 3,
  TECHNOLOGY: 3,
  INDUSTRY: 3,
  LOCATION: 3,
  EVENT: 3,
  UNKNOWN: 2,
}

const RING_RADII = [0, 220, 400, 560]
const NODE_WIDTH = 180
const NODE_HEIGHT = 56

function radialLayout(nodes: KnowledgeGraphNode[]): Map<string, { x: number; y: number }> {
  const rings: string[][] = [[], [], [], []]

  for (const node of nodes) {
    const ring = TYPE_RING[node.type] ?? 2
    rings[Math.min(ring, rings.length - 1)].push(node.id)
  }

  const positions = new Map<string, { x: number; y: number }>()
  const CX = 0
  const CY = 0

  for (let ringIdx = 0; ringIdx < rings.length; ringIdx++) {
    const ring = rings[ringIdx]
    if (!ring.length) continue
    const radius = RING_RADII[ringIdx]

    for (let i = 0; i < ring.length; i++) {
      if (radius === 0) {
        // Spread multiple central nodes slightly so they don't overlap
        const spread = (ring.length - 1) * (NODE_WIDTH + 24) * 0.5
        positions.set(ring[i], {
          x: CX - spread + i * (NODE_WIDTH + 24),
          y: CY,
        })
      } else {
        const angle = (2 * Math.PI * i) / ring.length - Math.PI / 2
        positions.set(ring[i], {
          x: CX + radius * Math.cos(angle) - NODE_WIDTH / 2,
          y: CY + radius * Math.sin(angle) - NODE_HEIGHT / 2,
        })
      }
    }
  }

  return positions
}

// ---------------------------------------------------------------------------
// Convert graph data → React Flow nodes/edges
// ---------------------------------------------------------------------------

function toFlowNodes(nodes: KnowledgeGraphNode[]): Node[] {
  const positions = radialLayout(nodes)

  return nodes.map((node) => {
    const pos = positions.get(node.id) ?? { x: 0, y: 0 }
    const s = styleForType(node.type)
    return {
      id: node.id,
      position: pos,
      data: { label: node.label, type: node.type },
      style: {
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        color: s.text,
        borderRadius: "10px",
        fontSize: "12px",
        fontWeight: 600,
        padding: "8px 14px",
        width: NODE_WIDTH,
        textAlign: "center" as const,
        boxShadow: `0 0 0 1px ${s.border}22`,
      },
    }
  })
}

function toFlowEdges(edges: KnowledgeGraphEdge[]): Edge[] {
  return edges.map((edge, i) => ({
    id: `e-${i}`,
    source: edge.source,
    target: edge.target,
    label: edge.relation,
    animated: edge.confidence >= 0.9,
    type: "smoothstep",
    style: {
      stroke: edge.confidence >= 0.9 ? "rgb(99,102,241)" : "rgb(82,82,91)",
      strokeWidth: 1.5,
    },
    labelStyle: {
      fontSize: 10,
      fontFamily: "monospace",
      fill: "rgb(161,161,170)",
    },
    labelBgStyle: {
      fill: "rgb(9,9,11)",
      fillOpacity: 0.85,
    },
    labelBgPadding: [4, 4] as [number, number],
    labelBgBorderRadius: 4,
  }))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  nodes: KnowledgeGraphNode[]
  edges: KnowledgeGraphEdge[]
}

export function GraphVisualization({ nodes, edges }: Props) {
  const flowNodes = useMemo(() => toFlowNodes(nodes), [nodes])
  const flowEdges = useMemo(() => toFlowEdges(edges), [edges])

  return (
    <div style={{ height: 520 }} className="rounded-xl border border-border overflow-hidden">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        colorMode="dark"
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgb(39,39,42)"
        />
        <Controls
          style={{
            background: "rgb(24,24,27)",
            border: "1px solid rgb(39,39,42)",
            borderRadius: "8px",
          }}
        />
        <MiniMap
          style={{
            background: "rgb(18,18,20)",
            border: "1px solid rgb(39,39,42)",
            borderRadius: "8px",
          }}
          nodeColor={(node) => {
            const s = styleForType((node.data as { type?: string }).type ?? "UNKNOWN")
            return s.minimap
          }}
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
    </div>
  )
}
