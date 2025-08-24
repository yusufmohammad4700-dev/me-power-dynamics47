'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import { DeckGL } from '@deck.gl/react'
import { ScatterplotLayer } from '@deck.gl/layers'
import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import { MAP_CONFIG, MAPBOX_ACCESS_TOKEN } from '@/utils/constants'
import { ConflictEvent } from '@/types'
import { format, parseISO } from 'date-fns'
import { tr } from 'date-fns/locale'

// Set Mapbox access token
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

interface ConflictMapProps {
  conflicts: ConflictEvent[]
  currentTime: number
  showHeatmap: boolean
  onConflictSelect: (conflict: ConflictEvent) => void
  getIntensityColor: (intensity: number) => string
  getIntensityLabel: (intensity: number) => string
}

interface TooltipInfo {
  object: any
  x: number
  y: number
}

export default function ConflictMap({
  conflicts,
  currentTime,
  showHeatmap,
  onConflictSelect,
  getIntensityColor,
  getIntensityLabel
}: ConflictMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [viewState, setViewState] = useState(MAP_CONFIG.INITIAL_VIEW_STATE)
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null)

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_CONFIG.STYLE,
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      bearing: viewState.bearing,
      pitch: viewState.pitch,
      interactive: false, // DeckGL will handle interactions
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Update map view when viewState changes
  useEffect(() => {
    if (map.current) {
      map.current.jumpTo({
        center: [viewState.longitude, viewState.latitude],
        zoom: viewState.zoom,
        bearing: viewState.bearing,
        pitch: viewState.pitch,
      })
    }
  }, [viewState])

  // Create conflict data points for visualization
  const conflictPoints = conflicts.map(conflict => {
    const conflictYear = new Date(conflict.date).getFullYear()
    const conflictMonth = new Date(conflict.date).getMonth()
    const conflictTime = conflictYear + (conflictMonth / 12)
    
    return {
      id: conflict.id,
      title: conflict.description || 'Conflict Event',
      coordinates: conflict.location.coordinates,
      intensity: conflict.intensity,
      type: conflict.eventType,
      date: conflict.date,
      casualties: conflict.fatalities || 0,
      description: conflict.descriptionTr || conflict.description || '',
      source: conflict.dataSource,
      location: conflict.location,
      time: conflictTime,
      isVisible: conflictTime <= currentTime,
      conflict: conflict
    }
  }).filter(point => point.isVisible)

  // Color scale function for conflicts
  const getConflictColor = useCallback((intensity: number, type: string) => {
    const baseColor = getIntensityColor(intensity)
    // Convert hex to RGB
    const hex = baseColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    // Add type-based variation
    let alpha = 200
    switch (type) {
      case 'armed-conflict':
        alpha = 220
        break
      case 'terrorism':
        alpha = 200
        break
      case 'cyber-attack':
        alpha = 180
        break
      case 'diplomatic-crisis':
        alpha = 160
        break
    }
    
    return [r, g, b, alpha]
  }, [getIntensityColor])

  // Get conflict size based on intensity and casualties
  const getConflictSize = useCallback((intensity: number, casualties: number) => {
    const baseSize = Math.max(5000, intensity * 2000)
    const casualtyMultiplier = Math.log10(Math.max(1, casualties)) / 4
    return baseSize * (1 + casualtyMultiplier)
  }, [])

  // Create layers
  const layers = [
    // Heatmap layer for conflict density
    showHeatmap && new HeatmapLayer({
      id: 'conflict-heatmap',
      data: conflictPoints,
      getPosition: (d: any) => d.coordinates,
      getWeight: (d: any) => d.intensity,
      radiusPixels: 60,
      intensity: 1,
      threshold: 0.03,
      opacity: 0.6,
    }),

    // Scatterplot layer for individual conflicts
    new ScatterplotLayer({
      id: 'conflict-points',
      data: conflictPoints,
      getPosition: (d: any) => d.coordinates,
      getRadius: (d: any) => getConflictSize(d.intensity, d.casualties),
      getFillColor: (d: any) => getConflictColor(d.intensity, d.type),
      getLineColor: [255, 255, 255, 150],
      getLineWidth: 2,
      opacity: showHeatmap ? 0.7 : 0.9,
      pickable: true,
      onHover: (info: any) => {
        if (info.object) {
          setTooltip({
            object: info.object,
            x: info.x,
            y: info.y
          })
        } else {
          setTooltip(null)
        }
      },
      onClick: (info: any) => {
        if (info.object) {
          onConflictSelect(info.object.conflict)
        }
      },
      updateTriggers: {
        getFillColor: [currentTime, showHeatmap],
        getRadius: [currentTime],
        opacity: [showHeatmap]
      }
    }),
  ].filter(Boolean)

  return (
    <div className="relative w-full h-full">
      {/* Mapbox container */}
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* DeckGL overlay */}
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        controller={true}
        layers={layers}
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-10 bg-slate-800 border border-slate-600 rounded-lg p-3 pointer-events-none shadow-lg max-w-xs"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10,
              transform: 'translate(0, -100%)'
            }}
          >
            <div className="text-white font-semibold mb-1 text-sm">
              {tooltip.object.title}
            </div>
            <div className="text-slate-300 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Yoğunluk:</span>
                <span className="font-mono" style={{ color: getIntensityColor(tooltip.object.intensity) }}>
                  {tooltip.object.intensity}/10 ({getIntensityLabel(tooltip.object.intensity)})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tarih:</span>
                <span className="font-mono">
                  {format(parseISO(tooltip.object.date), 'dd MMM yyyy', { locale: tr })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Konum:</span>
                <span>{tooltip.object.location.city}, {tooltip.object.location.country}</span>
              </div>
              <div className="flex justify-between">
                <span>Kayıplar:</span>
                <span className="font-mono">{tooltip.object.casualties}</span>
              </div>
            </div>
            <div className="text-slate-400 text-xs mt-2 line-clamp-2">
              {tooltip.object.description}
            </div>
          </div>
        )}
      </DeckGL>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <div className="bg-slate-800/90 rounded-lg p-2 text-white text-sm">
          <div className="font-semibold mb-1">Harita Kontrolleri</div>
          <div className="text-xs text-slate-300 space-y-1">
            <div>• Yakınlaştırma: Fare tekerleği</div>
            <div>• Kaydırma: Sol tık + sürükle</div>
            <div>• Döndürme: Sağ tık + sürükle</div>
            <div>• Bilgi: Olay üzerine hover</div>
            <div>• Seçim: Olay üzerine tık</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4">
        <div className="bg-slate-800/90 rounded-lg p-3 text-white">
          <div className="font-semibold mb-2 text-sm">Çatışma Yoğunluğu</div>
          <div className="space-y-1">
            {[
              { intensity: 2, label: 'Düşük (1-3)' },
              { intensity: 5, label: 'Orta (4-6)' },
              { intensity: 7, label: 'Yüksek (7-8)' },
              { intensity: 9, label: 'Kritik (9-10)' }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getIntensityColor(item.intensity) }}
                />
                <span className="text-xs text-slate-300">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Toplam: {conflictPoints.length} olay
          </div>
          <div className="text-xs text-slate-400">
            Zaman: {format(new Date(Math.floor(currentTime), Math.floor((currentTime % 1) * 12), 1), 'MMM yyyy', { locale: tr })}
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {conflicts.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
          <div className="text-white text-lg">Çatışma verileri yükleniyor...</div>
        </div>
      )}
    </div>
  )
}

