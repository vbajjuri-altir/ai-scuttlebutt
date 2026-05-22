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
// Type → visual style map  (green-forward monochrome palette)
// ---------------------------------------------------------------------------

type TypeStyle = {
  bg: string
  border: string
  text: string
  minimap: string
}

const TYPE_STYLES: Record<string, TypeStyle> = {
  COMPANY: {
    bg: "rgba(75, 166, 105, 0.15)",
    border: "rgb(75, 166, 105)",
    text: "rgb(134, 239, 172)",
    minimap: "rgb(75, 166, 105)",
  },
  PERSON: {
    bg: "rgba(52, 211, 153, 0.12)",
    border: "rgb(52, 211, 153)",
    text: "rgb(110, 231, 183)",
    minimap: "rgb(52, 211, 153)",
  },
  PRODUCT: {
    bg: "rgba(20, 184, 166, 0.12)",
    border: "rgb(20, 184, 166)",
    text: "rgb(94, 234, 212)",
    minimap: "rgb(20, 184, 166)",
  },
  INVESTOR: {
    bg: "rgba(250, 204, 21, 0.12)",
    border: "rgb(250, 204, 21)",
    text: "rgb(253, 224, 71)",
    minimap: "rgb(250, 204, 21)",
  },
  CUSTOMER: {
    bg: "rgba(251, 146, 60, 0.12)",
    border: "rgb(251, 146, 60)",
    text: "rgb(253, 186, 116)",
    minimap: "rgb(251, 146, 60)",
  },
  TECHNOLOGY: {
    bg: "rgba(56, 189, 248, 0.12)",
    border: "rgb(56, 189, 248)",
    text: "rgb(125, 211, 252)",
    minimap: "rgb(56, 189, 248)",
  },
  INDUSTRY: {
    bg: "rgba(167, 139, 250, 0.12)",
    border: "rgb(167, 139, 250)",
    text: "rgb(196, 181, 253)",
    minimap: "rgb(167, 139, 250)",
  },
  LOCATION: {
    bg: "rgba(132, 204, 22, 0.12)",
    border: "rgb(132, 204, 22)",
    text: "rgb(163, 230, 53)",
    minimap: "rgb(132, 204, 22)",
  },
  EVENT: {
    bg: "rgba(248, 113, 113, 0.12)",
    border: "rgb(248, 113, 113)",
    text: "rgb(252, 165, 165)",
    minimap: "rgb(248, 113, 113)",
  },
  UNKNOWN: {
    bg: "rgba(113, 113, 122, 0.12)",
    border: "rgb(113, 113, 122)",
    text: "rgb(212, 212, 216)",
    minimap: "rgb(113, 113, 122)",
  },
}

function styleForType(type: string): TypeStyle {
  return TYPE_STYLES[type] ?? TYPE_STYLES.UNKNOWN
}

// ---------------------------------------------------------------------------
// Radial layout
// ---------------------------------------------------------------------------

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
      stroke: edge.confidence >= 0.9 ? "rgb(75, 166, 105)" : "rgb(82, 82, 91)",
      strokeWidth: 1.5,
    },
    labelStyle: {
      fontSize: 10,
      fontFamily: "monospace",
      fill: "rgb(161, 161, 170)",
    },
    labelBgStyle: {
      fill: "rgb(9, 9, 11)",
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
    <div style={{ height: 520 }} className="rounded-xl border border-border/60 overflow-hidden bg-card/30">
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
          color="rgb(39, 39, 42)"
        />
        <Controls
          style={{
            background: "rgb(24, 24, 27)",
            border: "1px solid rgb(39, 39, 42)",
            borderRadius: "8px",
          }}
        />
        <MiniMap
          style={{
            background: "rgb(18, 18, 20)",
            border: "1px solid rgb(39, 39, 42)",
            borderRadius: "8px",
          }}
          nodeColor={(node) => {
            const s = styleForType((node.data as { type?: string }).type ?? "UNKNOWN")
            return s.minimap
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
        />
      </ReactFlow>
    </div>
  )
}
