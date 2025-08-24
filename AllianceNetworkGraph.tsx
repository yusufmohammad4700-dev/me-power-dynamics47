'use client'

import { useEffect, useRef, useState } from 'react'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import coseBilkent from 'cytoscape-cose-bilkent'
import { Actor, Alliance } from '@/types'

// Register Cytoscape extensions
if (typeof window !== 'undefined') {
  cytoscape.use(dagre)
  cytoscape.use(coseBilkent)
}

interface AllianceNetworkGraphProps {
  actors: Actor[]
  alliances: Alliance[]
  layout: string
  nodeSize: number
  edgeThickness: number
  showLabels: boolean
  onActorSelect: (actor: Actor) => void
  onAllianceSelect: (alliance: Alliance) => void
  getActorTypeColor: (actorType: string) => string
  getAllianceTypeColor: (allianceType: string) => string
}

export default function AllianceNetworkGraph({
  actors,
  alliances,
  layout,
  nodeSize,
  edgeThickness,
  showLabels,
  onActorSelect,
  onAllianceSelect,
  getActorTypeColor,
  getAllianceTypeColor
}: AllianceNetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return

    // Create actor nodes
    const nodes = actors.map(actor => ({
      data: {
        id: actor.id,
        label: actor.nameTr,
        type: 'actor',
        actorType: actor.type,
        powerScore: actor.powerScore,
        influenceLevel: actor.influenceLevel,
        actor: actor
      }
    }))

    // Create alliance nodes and edges
    const allianceNodes: any[] = []
    const edges: any[] = []

    alliances.forEach(alliance => {
      // Create alliance node
      allianceNodes.push({
        data: {
          id: `alliance-${alliance.id}`,
          label: alliance.nameTr,
          type: 'alliance',
          allianceType: alliance.type,
          strength: alliance.strength,
          alliance: alliance
        }
      })

      // Create edges from alliance to members
      alliance.members.forEach(memberId => {
        if (actors.find(actor => actor.id === memberId)) {
          edges.push({
            data: {
              id: `${alliance.id}-${memberId}`,
              source: `alliance-${alliance.id}`,
              target: memberId,
              allianceType: alliance.type,
              strength: alliance.strength
            }
          })
        }
      })
    })

    const elements = [...nodes, ...allianceNodes, ...edges]

    // Initialize Cytoscape
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        // Actor nodes
        {
          selector: 'node[type = "actor"]',
          style: {
            'background-color': (ele: any) => getActorTypeColor(ele.data('actorType')),
            'width': nodeSize,
            'height': nodeSize,
            'label': showLabels ? 'data(label)' : '',
            'text-valign': 'center',
            'text-halign': 'center',
            'color': '#ffffff',
            'font-size': '12px',
            'font-weight': 'bold',
            'text-outline-width': 2,
            'text-outline-color': '#000000',
            'border-width': 2,
            'border-color': '#ffffff',
            'border-opacity': 0.5
          }
        },
        // Alliance nodes
        {
          selector: 'node[type = "alliance"]',
          style: {
            'background-color': (ele: any) => getAllianceTypeColor(ele.data('allianceType')),
            'width': nodeSize * 0.7,
            'height': nodeSize * 0.7,
            'shape': 'diamond',
            'label': showLabels ? 'data(label)' : '',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'color': '#ffffff',
            'font-size': '10px',
            'font-weight': 'bold',
            'text-outline-width': 2,
            'text-outline-color': '#000000',
            'border-width': 2,
            'border-color': '#ffffff',
            'border-opacity': 0.7
          }
        },
        // Edges
        {
          selector: 'edge',
          style: {
            'width': edgeThickness,
            'line-color': (ele: any) => getAllianceTypeColor(ele.data('allianceType')),
            'target-arrow-color': (ele: any) => getAllianceTypeColor(ele.data('allianceType')),
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'opacity': 0.8
          }
        },
        // Selected elements
        {
          selector: ':selected',
          style: {
            'border-width': 4,
            'border-color': '#fbbf24',
            'border-opacity': 1
          }
        },
        // Hover effects
        {
          selector: 'node:active',
          style: {
            'overlay-color': '#fbbf24',
            'overlay-padding': 10,
            'overlay-opacity': 0.3
          }
        }
      ],
      layout: {
        name: layout === 'cose' ? 'cose-bilkent' : layout,
        animate: true,
        animationDuration: 1000,
        fit: true,
        padding: 50,
        // Layout-specific options
        ...(layout === 'cose-bilkent' && {
          idealEdgeLength: 100,
          nodeOverlap: 20,
          refresh: 30,
          randomize: false
        }),
        ...(layout === 'circle' && {
          radius: 200,
          startAngle: -Math.PI / 2
        }),
        ...(layout === 'grid' && {
          rows: Math.ceil(Math.sqrt(elements.length)),
          cols: Math.ceil(Math.sqrt(elements.length))
        }),
        ...(layout === 'breadthfirst' && {
          directed: true,
          roots: allianceNodes.map(node => node.data.id),
          spacingFactor: 1.5
        }),
        ...(layout === 'concentric' && {
          concentric: (node: any) => {
            if (node.data('type') === 'alliance') return 10
            if (node.data('actorType') === 'external-power') return 8
            if (node.data('actorType') === 'state') return 6
            return 4
          },
          levelWidth: () => 2
        })
      },
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.2
    })

    // Event handlers
    cyRef.current.on('tap', 'node[type = "actor"]', (event) => {
      const node = event.target
      const actor = node.data('actor')
      setSelectedElement(actor.id)
      onActorSelect(actor)
    })

    cyRef.current.on('tap', 'node[type = "alliance"]', (event) => {
      const node = event.target
      const alliance = node.data('alliance')
      setSelectedElement(`alliance-${alliance.id}`)
      onAllianceSelect(alliance)
    })

    cyRef.current.on('tap', (event) => {
      if (event.target === cyRef.current) {
        setSelectedElement(null)
      }
    })

    // Cleanup
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy()
        cyRef.current = null
      }
    }
  }, [actors, alliances, layout, nodeSize, edgeThickness, showLabels, getActorTypeColor, getAllianceTypeColor])

  // Update layout when layout changes
  useEffect(() => {
    if (cyRef.current) {
      const layoutOptions = {
        name: layout === 'cose' ? 'cose-bilkent' : layout,
        animate: true,
        animationDuration: 1000,
        fit: true,
        padding: 50,
        ...(layout === 'cose-bilkent' && {
          idealEdgeLength: 100,
          nodeOverlap: 20,
          refresh: 30,
          randomize: false
        }),
        ...(layout === 'circle' && {
          radius: 200,
          startAngle: -Math.PI / 2
        }),
        ...(layout === 'grid' && {
          rows: Math.ceil(Math.sqrt(cyRef.current.elements().length)),
          cols: Math.ceil(Math.sqrt(cyRef.current.elements().length))
        }),
        ...(layout === 'breadthfirst' && {
          directed: true,
          roots: cyRef.current.nodes('[type = "alliance"]').map((node: any) => node.id()),
          spacingFactor: 1.5
        }),
        ...(layout === 'concentric' && {
          concentric: (node: any) => {
            if (node.data('type') === 'alliance') return 10
            if (node.data('actorType') === 'external-power') return 8
            if (node.data('actorType') === 'state') return 6
            return 4
          },
          levelWidth: () => 2
        })
      }
      
      cyRef.current.layout(layoutOptions).run()
    }
  }, [layout])

  // Update node sizes
  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.style()
        .selector('node[type = "actor"]')
        .style({
          'width': nodeSize,
          'height': nodeSize
        })
        .selector('node[type = "alliance"]')
        .style({
          'width': nodeSize * 0.7,
          'height': nodeSize * 0.7
        })
        .update()
    }
  }, [nodeSize])

  // Update edge thickness
  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.style()
        .selector('edge')
        .style({
          'width': edgeThickness
        })
        .update()
    }
  }, [edgeThickness])

  // Update labels
  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.style()
        .selector('node[type = "actor"]')
        .style({
          'label': showLabels ? 'data(label)' : ''
        })
        .selector('node[type = "alliance"]')
        .style({
          'label': showLabels ? 'data(label)' : ''
        })
        .update()
    }
  }, [showLabels])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full bg-slate-900" />
      
      {/* Network Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <div className="bg-slate-800/90 rounded-lg p-3 text-white text-sm">
          <div className="font-semibold mb-2">Ağ Kontrolleri</div>
          <div className="text-xs text-slate-300 space-y-1">
            <div>• Yakınlaştırma: Fare tekerleği</div>
            <div>• Kaydırma: Sürükle</div>
            <div>• Seçim: Düğüm üzerine tık</div>
            <div>• Sıfırla: Boş alana tık</div>
          </div>
        </div>
      </div>

      {/* Network Statistics */}
      <div className="absolute bottom-4 left-4">
        <div className="bg-slate-800/90 rounded-lg p-3 text-white">
          <div className="font-semibold mb-2 text-sm">Ağ İstatistikleri</div>
          <div className="text-xs text-slate-300 space-y-1">
            <div>Aktörler: {actors.length}</div>
            <div>İttifaklar: {alliances.length}</div>
            <div>Bağlantılar: {alliances.reduce((sum, alliance) => sum + alliance.members.length, 0)}</div>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {actors.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
          <div className="text-white text-lg">Ağ grafiği yükleniyor...</div>
        </div>
      )}
    </div>
  )
}

