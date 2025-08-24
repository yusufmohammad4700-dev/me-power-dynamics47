'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  UsersIcon, 
  SearchIcon, 
  FilterIcon,
  HomeIcon,
  FlagIcon,
  ShieldIcon,
  BuildingIcon,
  GlobeIcon,
  TrendingUpIcon,
  MapPinIcon,
  CalendarIcon,
  InfoIcon
} from 'lucide-react'
import { sampleCountries, sampleActors, samplePowerIndicators } from '@/data/sample-data'

interface ActorPageState {
  searchQuery: string
  selectedType: string
  selectedCategory: string
  selectedCountry: string
  selectedActor: string | null
}

export default function ActorPage() {
  const [state, setState] = useState<ActorPageState>({
    searchQuery: '',
    selectedType: 'all',
    selectedCategory: 'all',
    selectedCountry: 'all',
    selectedActor: null
  })

  const actorTypes = [
    { id: 'all', name: 'Tüm Aktörler', icon: UsersIcon },
    { id: 'state', name: 'Devlet Aktörleri', icon: FlagIcon },
    { id: 'non-state', name: 'Devlet Dışı Aktörler', icon: ShieldIcon },
    { id: 'external', name: 'Dış Güçler', icon: GlobeIcon }
  ]

  const actorCategories = [
    { id: 'all', name: 'Tüm Kategoriler' },
    { id: 'nation-state', name: 'Ulus Devlet' },
    { id: 'militant-group', name: 'Silahlı Grup' },
    { id: 'political-party', name: 'Siyasi Parti' },
    { id: 'proxy-group', name: 'Vekil Grup' },
    { id: 'external-power', name: 'Dış Güç' }
  ]

  const influenceLevels = [
    { id: 'global', name: 'Küresel', color: 'bg-red-500' },
    { id: 'regional', name: 'Bölgesel', color: 'bg-orange-500' },
    { id: 'national', name: 'Ulusal', color: 'bg-yellow-500' },
    { id: 'local', name: 'Yerel', color: 'bg-green-500' }
  ]

  const statusColors = {
    'active': 'bg-green-500',
    'inactive': 'bg-gray-500',
    'dissolved': 'bg-red-500',
    'emerging': 'bg-blue-500'
  }

  // Combine countries and non-state actors
  const allActors = useMemo(() => {
    const countryActors = sampleCountries.map(country => {
      // Find corresponding power indicators
      const indicators = samplePowerIndicators?.find(p => p.countryId === country.id)
      
      return {
        id: country.id,
        name: country.nameTr,
        nameTr: country.nameTr,
        type: 'state' as const,
        category: 'nation-state' as const,
        description: `${country.nameTr} devleti`,
        descriptionTr: `${country.nameTr} devleti`,
        countryId: country.id,
        founded: 'Antik',
        status: 'active' as const,
        powerScore: country.powerIndex,
        influenceLevel: country.powerIndex > 80 ? 'regional' : country.powerIndex > 60 ? 'national' : 'local',
        lastUpdated: country.lastUpdated,
        flag: `https://flagcdn.com/w320/${country.id.toLowerCase()}.png`,
        capital: undefined,
        population: indicators?.demographic?.population,
        gdp: indicators?.economic?.gdp ? indicators.economic.gdp * 1000000 : undefined,
        militaryBudget: indicators?.military?.expenditure ? indicators.military.expenditure * 1000000 : undefined,
        alliances: [] // Would be populated from alliance data
      }
    })

    const nonStateActors = sampleActors.map(actor => ({
      ...actor,
      flag: undefined,
      capital: undefined,
      population: undefined,
      gdp: undefined,
      militaryBudget: undefined,
      alliances: []
    }))

    return [...countryActors, ...nonStateActors]
  }, [])

  // Filter actors based on current filters
  const filteredActors = useMemo(() => {
    return allActors.filter(actor => {
      const matchesSearch = actor.nameTr.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                          actor.descriptionTr.toLowerCase().includes(state.searchQuery.toLowerCase())
      
      const matchesType = state.selectedType === 'all' || actor.type === state.selectedType
      const matchesCategory = state.selectedCategory === 'all' || actor.category === state.selectedCategory
      const matchesCountry = state.selectedCountry === 'all' || actor.countryId === state.selectedCountry

      return matchesSearch && matchesType && matchesCategory && matchesCountry
    })
  }, [allActors, state.searchQuery, state.selectedType, state.selectedCategory, state.selectedCountry])

  const selectedActorData = state.selectedActor ? allActors.find(a => a.id === state.selectedActor) : null

  const getInfluenceColor = (level: string) => {
    const influence = influenceLevels.find(i => i.id === level)
    return influence?.color || 'bg-gray-500'
  }

  const getInfluenceName = (level: string) => {
    const influence = influenceLevels.find(i => i.id === level)
    return influence?.name || level
  }

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-500'
  }

  const getStatusName = (status: string) => {
    const statusNames = {
      'active': 'Aktif',
      'inactive': 'Pasif',
      'dissolved': 'Dağılmış',
      'emerging': 'Yükselen'
    }
    return statusNames[status as keyof typeof statusNames] || status
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Ana Sayfa
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <UsersIcon className="h-6 w-6 text-blue-400" />
                <h1 className="text-xl font-bold text-white">Aktör Profilleri</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                {filteredActors.length} Aktör
              </Badge>
              <Badge variant="outline" className="text-green-400 border-green-400">
                {allActors.filter(a => a.type === 'state').length} Devlet
              </Badge>
              <Badge variant="outline" className="text-orange-400 border-orange-400">
                {allActors.filter(a => a.type === 'non-state').length} Devlet Dışı
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        {/* Sidebar Filters */}
        <div className="w-80 bg-slate-800/50 border-r border-slate-700 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Search */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center">
                  <SearchIcon className="h-5 w-5 mr-2" />
                  Arama
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="text"
                  placeholder="Aktör adı veya açıklama ara..."
                  value={state.searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center">
                  <FilterIcon className="h-5 w-5 mr-2" />
                  Filtreler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Aktör Türü</label>
                  <Select 
                    value={state.selectedType} 
                    onValueChange={(value: string) => setState(prev => ({ ...prev, selectedType: value }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {actorTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id} className="text-white hover:bg-slate-700">
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Kategori</label>
                  <Select 
                    value={state.selectedCategory} 
                    onValueChange={(value: string) => setState(prev => ({ ...prev, selectedCategory: value }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {actorCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="text-white hover:bg-slate-700">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Ülke</label>
                  <Select 
                    value={state.selectedCountry} 
                    onValueChange={(value: string) => setState(prev => ({ ...prev, selectedCountry: value }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all" className="text-white hover:bg-slate-700">
                        Tüm Ülkeler
                      </SelectItem>
                      {sampleCountries.map((country) => (
                        <SelectItem key={country.id} value={country.id} className="text-white hover:bg-slate-700">
                          {country.nameTr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white">Etki Seviyeleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {influenceLevels.map((level) => (
                  <div key={level.id} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${level.color}`} />
                    <span className="text-sm text-slate-300">{level.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Actor List */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Aktör Listesi ({filteredActors.length})
                </h2>
              </div>

              <div className="space-y-3">
                {filteredActors.map((actor) => (
                  <Card 
                    key={actor.id}
                    className={`bg-slate-800/50 border-slate-700 cursor-pointer transition-all hover:bg-slate-700/50 ${
                      state.selectedActor === actor.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setState(prev => ({ ...prev, selectedActor: actor.id }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {actor.flag && (
                            <img 
                              src={actor.flag} 
                              alt={`${actor.nameTr} bayrağı`}
                              className="w-8 h-6 object-cover rounded border border-slate-600"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-white">{actor.nameTr}</h3>
                              {actor.type === 'state' && <FlagIcon className="h-4 w-4 text-blue-400" />}
                              {actor.type === 'non-state' && <ShieldIcon className="h-4 w-4 text-orange-400" />}
                              {actor.type === 'external-power' && <GlobeIcon className="h-4 w-4 text-green-400" />}
                            </div>
                            <p className="text-sm text-slate-400 mt-1">{actor.descriptionTr}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getInfluenceColor(actor.influenceLevel)} text-white`}
                              >
                                {getInfluenceName(actor.influenceLevel)}
                              </Badge>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getStatusColor(actor.status)} text-white`}
                              >
                                {getStatusName(actor.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">{actor.powerScore}</div>
                          <div className="text-xs text-slate-400">Güç Skoru</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Actor Detail Panel */}
          <div className="w-1/2 p-6 border-l border-slate-700 overflow-y-auto">
            {selectedActorData ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start space-x-4">
                  {selectedActorData.flag && (
                    <img 
                      src={selectedActorData.flag} 
                      alt={`${selectedActorData.nameTr} bayrağı`}
                      className="w-16 h-12 object-cover rounded border border-slate-600"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">{selectedActorData.nameTr}</h2>
                    <p className="text-slate-400 mt-1">{selectedActorData.descriptionTr}</p>
                    <div className="flex items-center space-x-3 mt-3">
                      <Badge 
                        variant="secondary" 
                        className={`${getInfluenceColor(selectedActorData.influenceLevel)} text-white`}
                      >
                        {getInfluenceName(selectedActorData.influenceLevel)} Etki
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(selectedActorData.status)} text-white`}
                      >
                        {getStatusName(selectedActorData.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Power Score */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center">
                      <TrendingUpIcon className="h-5 w-5 mr-2" />
                      Güç Analizi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Genel Güç Skoru</span>
                        <span className="text-2xl font-bold text-white">{selectedActorData.powerScore}/100</span>
                      </div>
                      <Progress value={selectedActorData.powerScore} className="w-full" />
                      <div className="text-xs text-slate-400">
                        Son güncelleme: {selectedActorData.lastUpdated}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Basic Info */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center">
                      <InfoIcon className="h-5 w-5 mr-2" />
                      Temel Bilgiler
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-400">Tür</label>
                        <div className="text-white">
                          {selectedActorData.type === 'state' ? 'Devlet Aktörü' : 
                           selectedActorData.type === 'non-state' ? 'Devlet Dışı Aktör' : 'Dış Güç'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-400">Kategori</label>
                        <div className="text-white">
                          {selectedActorData.category === 'nation-state' ? 'Ulus Devlet' :
                           selectedActorData.category === 'militant-group' ? 'Silahlı Grup' :
                           selectedActorData.category === 'political-party' ? 'Siyasi Parti' :
                           selectedActorData.category === 'proxy-group' ? 'Vekil Grup' : 'Dış Güç'}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-400">Kuruluş</label>
                        <div className="text-white flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {selectedActorData.founded}
                        </div>
                      </div>
                      {selectedActorData.capital && (
                        <div>
                          <label className="text-sm font-medium text-slate-400">Başkent</label>
                          <div className="text-white flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {selectedActorData.capital}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Statistics for State Actors */}
                {selectedActorData.type === 'state' && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center">
                        <BuildingIcon className="h-5 w-5 mr-2" />
                        İstatistikler
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        {selectedActorData.population && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Nüfus</span>
                            <span className="text-white font-mono">
                              {(selectedActorData.population / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        )}
                        {selectedActorData.gdp && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">GSYİH</span>
                            <span className="text-white font-mono">
                              ${(selectedActorData.gdp / 1000000000).toFixed(0)}B
                            </span>
                          </div>
                        )}
                        {selectedActorData.militaryBudget && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Askeri Bütçe</span>
                            <span className="text-white font-mono">
                              ${(selectedActorData.militaryBudget / 1000000000).toFixed(1)}B
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-slate-400">
                  <UsersIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Aktör Seçin</h3>
                  <p>Detayları görüntülemek için sol taraftan bir aktör seçin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

