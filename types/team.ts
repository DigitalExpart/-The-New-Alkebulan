export interface TeamRole {
  id: string
  title: string
  responsibilities: string[]
  expectedImpact: string
  skillset: string[]
  availability: string
  location: string
  areaOfInterest: string
  shortDescription?: string
}

export interface TeamFilters {
  skillset: string[]
  availability: string[]
  location: string[]
  areaOfInterest: string[]
}
