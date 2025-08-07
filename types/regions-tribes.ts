export interface Tribe {
  id: string
  name: string
  region: string
  country: string[]
  population: number
  diaspora: number
  languages: string[]
  languageFamily: string
  coordinates: {
    lat: number
    lng: number
  }
  boundaries: {
    lat: number
    lng: number
  }[]
  description: string
  history: string
  traditions: string[]
  customs: string[]
  symbols: string[]
  images: string[]
  videos: string[]
  diasporaLocations: DiasporaLocation[]
  forums: ForumInfo[]
  localChapters: LocalChapter[]
  culturalZone: string
  colorCode: string
}

export interface DiasporaLocation {
  country: string
  city: string
  population: number
  coordinates: {
    lat: number
    lng: number
  }
  communityCenter?: string
  contactInfo?: string
}

export interface ForumInfo {
  id: string
  name: string
  description: string
  memberCount: number
  lastActivity: string
  url: string
}

export interface LocalChapter {
  id: string
  name: string
  location: string
  memberCount: number
  contactPerson: string
  email: string
  phone?: string
  meetingSchedule: string
  activities: string[]
}

export interface MapTooltipData {
  tribeName: string
  languages: string[]
  population: number
  diaspora: number
  colorCode: string
}

export interface FilterOptions {
  countries: string[]
  languageFamilies: string[]
  populationRanges: {
    label: string
    min: number
    max: number
  }[]
  diasporaRanges: {
    label: string
    min: number
    max: number
  }[]
  culturalZones: string[]
}

export interface SearchFilters {
  searchTerm: string
  selectedCountries: string[]
  selectedLanguageFamilies: string[]
  selectedPopulationRange: string
  selectedDiasporaRange: string
  selectedCulturalZones: string[]
}
