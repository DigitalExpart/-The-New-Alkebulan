export interface LandParcel {
  id: string
  userId: string
  name: string
  description?: string
  country: string
  region?: string
  city?: string
  coordinates: {
    lat: number
    lng: number
  }
  boundaries?: {
    lat: number
    lng: number
  }[]
  area?: number // in hectares
  registrationStatus: "registered" | "pending" | "unregistered"
  documentationLevel: "full" | "partial" | "none"
  createdAt: string
  updatedAt: string
  isPublic: boolean
  tags?: string[]
}

export interface CountryInfo {
  code: string
  name: string
  capital: string
  population: number
  area: number
  landRights: {
    constitution: boolean
    customaryLaw: boolean
    formalRegistration: boolean
    riskLevel: "low" | "medium" | "high"
  }
  resources: {
    registrationOffice?: string
    helplineNumber?: string
    website?: string
  }
}

export interface SearchLocation {
  name: string
  country: string
  region?: string
  coordinates: {
    lat: number
    lng: number
  }
  type: "country" | "city" | "region" | "village"
}

export interface MapMarker {
  id: string
  coordinates: {
    lat: number
    lng: number
  }
  type: "parcel" | "search" | "authority"
  data: any
}
