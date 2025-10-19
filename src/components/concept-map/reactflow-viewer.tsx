'use client'

import { useEffect, useMemo } from 'react'
import {
    ReactFlow,
    Node,
    Edge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType,
    Position,
} from '@xyflow/react'
import dagre from 'dagre'
import '@xyflow/react/dist/style.css'

interface ConceptNode {
    id: string
    label: string
    description: string
    type: string
    category: string
    level: number
}

interface ConceptEdge {
    id: string
    source: string
    target: string
    label: string
    type: string
}

interface ReactFlowViewerProps {
    nodes: ConceptNode[]
    edges: ConceptEdge[]
}

// Layout automatico con Dagre per grafo gerarchico compatto
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    dagreGraph.setGraph({
        rankdir: 'TB', // Top to Bottom
        align: 'UL', // Allineamento Upper Left per compattare
        nodesep: 60, // Ridotto per maggiore compattezza orizzontale
        ranksep: 100, // Ridotto per maggiore compattezza verticale
        marginx: 40,
        marginy: 40,
    })

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: node.width || 250, height: node.height || 100 })
    })

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target)
    })

    dagre.layout(dagreGraph)

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id)
        node.position = {
            x: nodeWithPosition.x - (node.width || 250) / 2,
            y: nodeWithPosition.y - (node.height || 100) / 2,
        }
        return node
    })

    return { nodes, edges }
}

// Funzione per ottenere il colore basato sul tipo di nodo
const getNodeColor = (type: string, category: string): string => {
    // Colori basati sul tipo
    if (type === 'root') return 'bg-gradient-to-br from-purple-500 to-purple-700 text-white'
    if (type === 'concept') return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
    if (type === 'definition') return 'bg-gradient-to-br from-green-500 to-green-600 text-white'
    if (type === 'example') return 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white'
    if (type === 'detail') return 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'

    return 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900'
}

// Dimensione del nodo basata sulla categoria
const getNodeSize = (category: string): { width: number; height: number } => {
    if (category === 'main') return { width: 240, height: 100 }
    if (category === 'secondary') return { width: 200, height: 85 }
    return { width: 180, height: 75 }
}

export function ReactFlowViewer({ nodes: conceptNodes, edges: conceptEdges }: ReactFlowViewerProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

    // Converti i nodi del concetto in nodi React Flow
    const reactFlowNodes: Node[] = useMemo(() => {
        return conceptNodes.map((node) => {
            const size = getNodeSize(node.category)
            const colorClass = getNodeColor(node.type, node.category)

            return {
                id: node.id,
                type: 'default',
                data: {
                    label: (
                        <div className="p-3 text-center">
                            <div className="font-bold text-xs mb-1 leading-tight">{node.label}</div>
                            <div className="text-[10px] opacity-90 line-clamp-2 leading-tight">{node.description}</div>
                        </div>
                    ),
                },
                position: { x: 0, y: 0 }, // Verrà calcolato da Dagre
                style: {
                    width: size.width,
                    height: size.height,
                    borderRadius: '12px',
                    border: '2px solid',
                    borderColor: node.type === 'root' ? '#8b5cf6' : node.type === 'concept' ? '#3b82f6' : '#6b7280',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
                className: colorClass,
                sourcePosition: Position.Bottom,
                targetPosition: Position.Top,
            }
        })
    }, [conceptNodes])

    // Converti gli edges del concetto in edges React Flow
    const reactFlowEdges: Edge[] = useMemo(() => {
        return conceptEdges.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label,
            type: 'smoothstep',
            animated: edge.type === 'hierarchy',
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
            },
            style: {
                stroke: edge.type === 'hierarchy' ? '#8b5cf6' :
                    edge.type === 'example' ? '#eab308' :
                        edge.type === 'cause' ? '#ef4444' : '#6b7280',
                strokeWidth: 2,
            },
            labelStyle: {
                fontSize: 9,
                fontWeight: 600,
                fill: '#374151',
            },
            labelBgStyle: {
                fill: '#ffffff',
                fillOpacity: 0.85,
            },
            labelBgPadding: [6, 3],
            labelBgBorderRadius: 3,
        }))
    }, [conceptEdges])

    // Applica il layout quando cambiano nodi o edges
    useEffect(() => {
        if (reactFlowNodes.length > 0) {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                reactFlowNodes,
                reactFlowEdges
            )
            setNodes(layoutedNodes)
            setEdges(layoutedEdges)
        }
    }, [reactFlowNodes, reactFlowEdges, setNodes, setEdges])

    return (
        <div className="w-full h-full bg-gray-50 rounded-lg" style={{ minHeight: '600px' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                minZoom={0.1}
                maxZoom={1.5}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                }}
            >
                <Background color="#e5e7eb" gap={16} />
                <Controls />
                <MiniMap
                    nodeColor={(node) => {
                        const conceptNode = conceptNodes.find((n) => n.id === node.id)
                        if (!conceptNode) return '#6b7280'
                        if (conceptNode.type === 'root') return '#8b5cf6'
                        if (conceptNode.type === 'concept') return '#3b82f6'
                        if (conceptNode.type === 'definition') return '#10b981'
                        if (conceptNode.type === 'example') return '#eab308'
                        return '#6b7280'
                    }}
                    maskColor="rgba(0, 0, 0, 0.1)"
                />
            </ReactFlow>
        </div>
    )
}

