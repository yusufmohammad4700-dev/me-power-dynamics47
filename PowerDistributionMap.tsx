'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import { DeckGL } from '@deck.gl/react'
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers'
import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import { MAP_CONFIG, MAPBOX_ACCESS_TOKEN, COLOR_SCALES } from '@/utils/constants'
import { Country, PowerIndicators } from '@/types'

// Set Mapbox access token
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

interface PowerDistributionMapProps {
  countries: Country[]
  powerData: Record<string, PowerIndicators>
  selectedIndicator: string
  layerOpacity: number
  showCountryLabels: boolean
  onCountrySelect: (country: Country) => void
  onCountryHover: (country: Country | null) => void
  getIndicatorValue: (countryId: string, indicator: string) => number
  formatValue: (value: number, indicator: string) => string
}

interface TooltipInfo {
  object: any
  x: number
  y: number
}

export default function PowerDistributionMap({
  countries,
  powerData,
  selectedIndicator,
  layerOpacity,
  showCountryLabels,
  onCountrySelect,
  onCountryHover,
  getIndicatorValue,
  formatValue
}: PowerDistributionMapProps) {
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

  // Create country data points for visualization
  const countryPoints = countries.map(country => {
    const value = getIndicatorValue(country.id, selectedIndicator)
    const normalizedValue = Math.min(100, Math.max(0, value))
    
    return {
      id: country.id,
      name: country.nameTr,
      nameEn: country.nameEn,
      coordinates: country.coordinates,
      value: value,
      normalizedValue: normalizedValue,
      powerIndex: country.powerIndex,
      country: country
    }
  })

  // Color scale function
  const getColor = useCallback((value: number, maxValue: number) => {
    const normalizedValue = maxValue > 0 ? value / maxValue : 0
    const colorIndex = Math.floor(normalizedValue * (COLOR_SCALES.POWER_INDEX.length - 1))
    const color = COLOR_SCALES.POWER_INDEX[Math.min(colorIndex, COLOR_SCALES.POWER_INDEX.length - 1)]
    
    // Convert hex to RGB
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    return [r, g, b, Math.round(layerOpacity * 255)]
  }, [layerOpacity])

  // Calculate max value for normalization
  const maxValue = Math.max(...countryPoints.map(point => point.value))

  // Create layers
  const layers = [
    // Heatmap layer for power distribution
    new HeatmapLayer({
      id: 'power-heatmap',
      data: countryPoints,
      getPosition: (d: any) => d.coordinates,
      getWeight: (d: any) => d.normalizedValue,
      radiusPixels: 100,
      intensity: 2,
      threshold: 0.05,
      visible: selectedIndicator === 'powerIndex',
      opacity: layerOpacity,
    }),

    // Scatterplot layer for country points
    new ScatterplotLayer({
      id: 'country-points',
      data: countryPoints,
      getPosition: (d: any) => d.coordinates,
      getRadius: (d: any) => Math.max(20000, (d.normalizedValue / 100) * 100000),
      getFillColor: (d: any) => getColor(d.value, maxValue),
      getLineColor: [255, 255, 255, 100],
      getLineWidth: 2,
      opacity: layerOpacity,
      pickable: true,
      onHover: (info: any) => {
        if (info.object) {
          setTooltip({
            object: info.object,
            x: info.x,
            y: info.y
          })
          onCountryHover(info.object.country)
        } else {
          setTooltip(null)
          onCountryHover(null)
        }
      },
      onClick: (info: any) => {
        if (info.object) {
          onCountrySelect(info.object.country)
        }
      },
    }),
  ]

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
            className="absolute z-10 bg-slate-800 border border-slate-600 rounded-lg p-3 pointer-events-none shadow-lg"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10,
              transform: 'translate(0, -100%)'
            }}
          >
            <div className="text-white font-semibold mb-1">
              {tooltip.object.name}
            </div>
            <div className="text-slate-300 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Güç Endeksi:</span>
                <span className="font-mono">{tooltip.object.powerIndex.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Değer:</span>
                <span className="font-mono">
                  {formatValue(tooltip.object.value, selectedIndicator)}
                </span>
              </div>
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
            <div>• Bilgi: Ülke üzerine hover</div>
            <div>• Seçim: Ülke üzerine tık</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4">
        <div className="bg-slate-800/90 rounded-lg p-3 text-white">
          <div className="font-semibold mb-2 text-sm">
            {selectedIndicator === 'powerIndex' ? 'Güç Endeksi' :
             selectedIndicator === 'militaryExpenditure' ? 'Askeri Harcama' :
             selectedIndicator === 'gdp' ? 'GSYİH' :
             selectedIndicator === 'population' ? 'Nüfus' :
             selectedIndicator === 'energyProduction' ? 'Enerji Üretimi' : 'Değer'}
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Düşük</span>
            <div className="flex space-x-1">
              {COLOR_SCALES.POWER_INDEX.map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-3 rounded-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="text-slate-400">Yüksek</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Maksimum: {formatValue(maxValue, selectedIndicator)}
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {countries.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
          <div className="text-white text-lg">Veri yükleniyor...</div>
        </div>
      )}
    </div>
  )
}

