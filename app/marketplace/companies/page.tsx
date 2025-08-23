"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, MapPin, TrendingUp } from "lucide-react"
import { CompanyCard } from "@/components/companies/company-card"
import { CompanyFilters } from "@/components/companies/company-filters"
import type { CompanyFilters as CompanyFiltersType } from "@/types/company"
import { getSupabaseClient } from "@/lib/supabase"

export default function CompaniesPage() {
  const [filters, setFilters] = useState<CompanyFiltersType>({
    search: "",
    industry: "",
    location: "",
    size: "",
    featured: false,
  })
  const [companiesData, setCompaniesData] = useState<any[]>([])
  const [industries, setIndustries] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()
        const { data: companies, error } = await supabase
          .from('companies')
          .select('*')
          .order('name')
        if (error) {
          console.error('Error fetching companies:', error)
          setCompaniesData([])
        } else {
          // Map DB rows to UI shape expected by the grid/cards
          const mapped = (companies || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            description: c.description || '',
            industry: c.industry || '',
            location: c.location || '',
            website: c.website || '',
            logo: c.logo || null,
            founded: c.founded || '',
            featured: !!c.featured,
            size: c.size || c.team_size || '',
            // Optional fields used in UI; ensure safe defaults
            tags: Array.isArray(c.tags) ? c.tags : [],
            verified: !!c.verified,
            revenue: c.revenue || '',
          }))
          setCompaniesData(mapped)
          const inds = Array.from(new Set(mapped.map((c: any) => c.industry).filter(Boolean)))
          const locs = Array.from(new Set(mapped.map((c: any) => c.location).filter(Boolean)))
          setIndustries(inds)
          setLocations(locs)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchCompanies()
  }, [])

  const filteredCompanies = useMemo(() => {
    const search = (filters.search || '').toLowerCase().trim()
    return companiesData.filter((company) => {
      const name = (company?.name || '').toLowerCase()
      const description = (company?.description || '').toLowerCase()
      const tags: string[] = Array.isArray(company?.tags) ? company.tags : []

      const matchesSearch =
        !search ||
        name.includes(search) ||
        description.includes(search) ||
        tags.some((tag) => (tag || '').toLowerCase().includes(search))

      const matchesIndustry = !filters.industry || company.industry === filters.industry
      const matchesLocation = !filters.location || company.location === filters.location
      const sizeValue = company.size || company.team_size || ''
      const matchesSize = !filters.size || sizeValue === filters.size
      const matchesFeatured = !filters.featured || !!company.featured

      return matchesSearch && matchesIndustry && matchesLocation && matchesSize && matchesFeatured
    })
  }, [filters, companiesData])

  const stats = {
    total: companiesData.length,
    featured: companiesData.filter((c) => c.featured).length,
    industries: new Set(companiesData.map((c) => c.industry)).size,
    locations: new Set(companiesData.map((c) => c.location)).size,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">All Companies</h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Discover innovative companies within the Alkebulan community driving economic growth and social impact.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <p className="text-xs text-green-100">Active businesses</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Featured</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.featured}</div>
              <p className="text-xs text-green-100">Highlighted companies</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Industries</CardTitle>
              <Users className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.industries}</div>
              <p className="text-xs text-green-100">Different sectors</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Locations</CardTitle>
              <MapPin className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.locations}</div>
              <p className="text-xs text-green-100">Global presence</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <CompanyFilters filters={filters} onFiltersChange={setFilters} industries={industries} locations={locations} />

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-white">
            <span className="text-lg font-semibold">{filteredCompanies.length}</span>
            <span className="text-green-100 ml-2">
              {filteredCompanies.length === 1 ? "company" : "companies"} found
            </span>
          </div>
          {filters.featured && (
            <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
              Featured Only
            </Badge>
          )}
        </div>

        {/* Companies Grid */}
        {loading ? (
          <div className="text-green-100">Loading companies...</div>
        ) : filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-white/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No companies found</h3>
              <p className="text-green-100">Try adjusting your filters to see more results.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
