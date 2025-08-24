// Application constants and configuration

export const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFudXMtZGVtbyIsImEiOiJjbHNkZmFzZGZhc2RmYXNkZmFzZGYifQ.demo-token';

export const MAP_CONFIG = {
  INITIAL_VIEW_STATE: {
    longitude: 35.0,
    latitude: 30.0,
    zoom: 4,
    bearing: 0,
    pitch: 0,
  },
  STYLE: 'mapbox://styles/mapbox/dark-v11',
  MAX_ZOOM: 12,
  MIN_ZOOM: 2,
};

export const MIDDLE_EAST_COUNTRIES = [
  'TR', 'IR', 'IL', 'SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'YE',
  'IQ', 'SY', 'LB', 'JO', 'PS', 'EG', 'LY', 'TN', 'DZ', 'MA',
  'SD', 'AF', 'PK', 'AM', 'AZ', 'GE'
];

export const ACTOR_TYPES = {
  STATE: 'state',
  NON_STATE: 'non-state',
  EXTERNAL_POWER: 'external-power',
} as const;

export const ACTOR_CATEGORIES = {
  GOVERNMENT: 'government',
  MILITANT_GROUP: 'militant-group',
  POLITICAL_PARTY: 'political-party',
  INTERNATIONAL_ORG: 'international-organization',
  TERRORIST_GROUP: 'terrorist-group',
  PROXY_GROUP: 'proxy-group',
} as const;

export const CONFLICT_TYPES = {
  BATTLE: 'battle',
  EXPLOSION: 'explosion',
  VIOLENCE_CIVILIANS: 'violence-against-civilians',
  PROTEST: 'protest',
  RIOT: 'riot',
  STRATEGIC_DEVELOPMENT: 'strategic-development',
} as const;

export const ALLIANCE_TYPES = {
  FORMAL: 'formal',
  INFORMAL: 'informal',
  ECONOMIC: 'economic',
  MILITARY: 'military',
  DIPLOMATIC: 'diplomatic',
} as const;

export const DATA_SOURCES = {
  ACLED: {
    name: 'ACLED',
    fullName: 'Armed Conflict Location & Event Data Project',
    url: 'https://acleddata.com/',
    apiUrl: 'https://api.acleddata.com/acled/read',
    updateFrequency: 'Weekly',
  },
  UCDP: {
    name: 'UCDP',
    fullName: 'Uppsala Conflict Data Program',
    url: 'https://ucdp.uu.se/',
    apiUrl: 'https://ucdpapi.pcr.uu.se/api',
    updateFrequency: 'Monthly',
  },
  GDELT: {
    name: 'GDELT',
    fullName: 'Global Database of Events, Language, and Tone',
    url: 'https://www.gdeltproject.org/',
    apiUrl: 'https://api.gdeltproject.org/api/v2',
    updateFrequency: 'Real-time',
  },
  SIPRI: {
    name: 'SIPRI',
    fullName: 'Stockholm International Peace Research Institute',
    url: 'https://www.sipri.org/',
    updateFrequency: 'Annually',
  },
  WORLD_BANK: {
    name: 'World Bank',
    fullName: 'World Bank Open Data',
    url: 'https://data.worldbank.org/',
    apiUrl: 'https://api.worldbank.org/v2',
    updateFrequency: 'Annually',
  },
  IMF: {
    name: 'IMF',
    fullName: 'International Monetary Fund',
    url: 'https://data.imf.org/',
    apiUrl: 'http://dataservices.imf.org/REST/SDMX_JSON.svc',
    updateFrequency: 'Quarterly',
  },
  EIA: {
    name: 'EIA',
    fullName: 'U.S. Energy Information Administration',
    url: 'https://www.eia.gov/',
    apiUrl: 'https://api.eia.gov/v2',
    updateFrequency: 'Monthly',
  },
  OPENSKY: {
    name: 'OpenSky Network',
    fullName: 'OpenSky Network',
    url: 'https://opensky-network.org/',
    apiUrl: 'https://opensky-network.org/api',
    updateFrequency: 'Real-time',
  },
  MARINETRAFFIC: {
    name: 'MarineTraffic',
    fullName: 'MarineTraffic',
    url: 'https://www.marinetraffic.com/',
    apiUrl: 'https://services.marinetraffic.com/api',
    updateFrequency: 'Real-time',
  },
} as const;

export const POWER_INDEX_WEIGHTS = {
  MILITARY: 0.25,
  ECONOMIC: 0.30,
  DEMOGRAPHIC: 0.15,
  ENERGY: 0.20,
  ALLIANCE_CENTRALITY: 0.15,
  CONFLICT_STABILITY: -0.05, // negative weight for conflict intensity
} as const;

export const SCENARIO_TIMEFRAMES = {
  SHORT_TERM: { start: '2025', end: '2027' },
  MEDIUM_TERM: { start: '2025', end: '2030' },
  LONG_TERM: { start: '2025', end: '2035' },
} as const;

export const PREDEFINED_SCENARIOS = [
  {
    id: 'regional-detente',
    nameTr: 'Bölgesel Yumuşama',
    nameEn: 'Regional Détente',
  },
  {
    id: 'energy-shock',
    nameTr: 'Enerji Şoku',
    nameEn: 'Energy Shock',
  },
  {
    id: 'alliance-expansion',
    nameTr: 'İttifak Genişlemesi',
    nameEn: 'Alliance Expansion',
  },
  {
    id: 'proxy-escalation',
    nameTr: 'Vekalet Tırmanması',
    nameEn: 'Proxy Escalation',
  },
  {
    id: 'economic-integration',
    nameTr: 'Ekonomik Entegrasyon',
    nameEn: 'Economic Integration',
  },
] as const;

export const COLOR_SCALES = {
  POWER_INDEX: ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
  CONFLICT_INTENSITY: ['#fef3c7', '#fcd34d', '#f59e0b', '#d97706', '#92400e'],
  ALLIANCE_STRENGTH: ['#ecfdf5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981'],
  ECONOMIC_POWER: ['#f3e8ff', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed'],
} as const;

export const TURKISH_TRANSLATIONS = {
  // Navigation
  'Power Distribution': 'Güç Dağılımı',
  'Alliances & Networks': 'İttifaklar ve Ağlar',
  'Conflict Zones': 'Çatışma Bölgeleri',
  'Future Scenarios': 'Gelecek Senaryoları',
  'Actors': 'Aktörler',
  'Methodology': 'Metodoloji',
  
  // Common terms
  'Loading...': 'Yükleniyor...',
  'Error': 'Hata',
  'Last Updated': 'Son Güncelleme',
  'Data Source': 'Veri Kaynağı',
  'Show Details': 'Detayları Göster',
  'Hide Details': 'Detayları Gizle',
  'Apply Filters': 'Filtreleri Uygula',
  'Clear Filters': 'Filtreleri Temizle',
  'Export Data': 'Veriyi Dışa Aktar',
  
  // Power indicators
  'Military Expenditure': 'Askeri Harcama',
  'GDP': 'GSYİH',
  'Population': 'Nüfus',
  'Energy Production': 'Enerji Üretimi',
  'Alliance Centrality': 'İttifak Merkeziliği',
  'Conflict Intensity': 'Çatışma Yoğunluğu',
  
  // Actor types
  'State': 'Devlet',
  'Non-State Actor': 'Devlet Dışı Aktör',
  'External Power': 'Dış Güç',
  'Government': 'Hükümet',
  'Militant Group': 'Silahlı Grup',
  'Political Party': 'Siyasi Parti',
  'International Organization': 'Uluslararası Organizasyon',
  
  // Time periods
  'Daily': 'Günlük',
  'Weekly': 'Haftalık',
  'Monthly': 'Aylık',
  'Quarterly': 'Üç Aylık',
  'Annually': 'Yıllık',
  'Real-time': 'Gerçek Zamanlı',
} as const;

export const API_ENDPOINTS = {
  COUNTRIES: '/api/countries',
  ACTORS: '/api/actors',
  ALLIANCES: '/api/alliances',
  CONFLICTS: '/api/conflicts',
  POWER_INDICATORS: '/api/power-indicators',
  SCENARIOS: '/api/scenarios',
  DATA_SOURCES: '/api/data-sources',
} as const;

