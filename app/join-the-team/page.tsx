"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { TeamRole, TeamFilters } from "@/types/team"
import { teamRoles } from "@/data/team-roles"
import { TeamRoleCard } from "@/components/team/team-role-card"
import { TeamFiltersComponent } from "@/components/team/team-filters"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Globe, Zap, Heart, Target, Rocket, Code, Palette, TrendingUp, Settings } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function JoinTheTeamPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [filteredRoles, setFilteredRoles] = useState<TeamRole[]>(teamRoles)
  const [filters, setFilters] = useState<TeamFilters>({
    skillset: [],
    availability: [],
    location: [],
    areaOfInterest: [],
  })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    let filtered = teamRoles

    if (filters.skillset.length > 0) {
      filtered = filtered.filter((role) => filters.skillset.some((skill) => role.skillset.includes(skill)))
    }

    if (filters.availability.length > 0) {
      filtered = filtered.filter((role) => filters.availability.includes(role.availability))
    }

    if (filters.location.length > 0) {
      filtered = filtered.filter((role) => filters.location.includes(role.location))
    }

    if (filters.areaOfInterest.length > 0) {
      filtered = filtered.filter((role) => filters.areaOfInterest.includes(role.areaOfInterest))
    }

    setFilteredRoles(filtered)
  }, [filters])

  const handleFiltersChange = (newFilters: TeamFilters) => {
    setFilters(newFilters)
  }

  const handleAuthRedirect = (action: 'signup' | 'signin') => {
    if (!user) {
      router.push(`/auth/${action}`)
    } else {
      // User is authenticated, they can proceed with team joining
      // You can add logic here to show a form or redirect to application process
      console.log('User is authenticated, proceeding with team joining...')
    }
  }

  const getAreaIcon = (area: string) => {
    switch (area) {
      case "Tech":
        return <Code className="w-5 h-5" />
      case "Creative":
        return <Palette className="w-5 h-5" />
      case "Strategy":
        return <TrendingUp className="w-5 h-5" />
      case "Operations":
        return <Settings className="w-5 h-5" />
      default:
        return <Target className="w-5 h-5" />
    }
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">Join the Team!</h1>
            {user && (
              <div className="mb-6">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  Welcome back, {user.full_name || user.email}! Ready to join our team?
                </Badge>
              </div>
            )}
            <div className="space-y-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              <p className="font-medium text-foreground">
                We're building the future of the African diaspora. Help us shape it.
              </p>
              <p>Bring your skills, your passion, your vision. Let's co-create the digital home of tomorrow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Join Us?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Be part of a movement that's reshaping the digital landscape for the African diaspora
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-border text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-foreground font-semibold mb-2">Global Impact</h3>
              <p className="text-muted-foreground text-sm">
                Your work will directly impact millions of people across the African diaspora worldwide
              </p>
            </Card>

            <Card className="bg-card border-border text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-foreground font-semibold mb-2">Cutting-Edge Tech</h3>
              <p className="text-muted-foreground text-sm">
                Work with the latest technologies including Web3, AI, and blockchain innovations
              </p>
            </Card>

            <Card className="bg-card border-border text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-foreground font-semibold mb-2">Purpose-Driven</h3>
              <p className="text-muted-foreground text-sm">
                Every line of code, every design, every strategy serves a greater cultural mission
              </p>
            </Card>

            <Card className="bg-card border-border text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-foreground font-semibold mb-2">Flexible Work</h3>
              <p className="text-muted-foreground text-sm">
                Remote-first culture with flexible hours and multiple engagement options
              </p>
            </Card>

            <Card className="bg-card border-border text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-foreground font-semibold mb-2">Growth Opportunity</h3>
              <p className="text-muted-foreground text-sm">
                Join a fast-growing platform with unlimited potential for personal and professional growth
              </p>
            </Card>

            <Card className="bg-card border-border text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-foreground font-semibold mb-2">Ownership & Equity</h3>
              <p className="text-muted-foreground text-sm">
                Opportunity for equity participation and token rewards as we grow together
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Open Positions</h2>
            <p className="text-lg text-muted-foreground">
              {filteredRoles.length} role{filteredRoles.length !== 1 ? "s" : ""} available across multiple disciplines
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <TeamFiltersComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
                isOpen={filtersOpen}
                onToggle={() => setFiltersOpen(!filtersOpen)}
              />
            </div>

            {/* Roles Grid */}
            <div className="flex-1">
              {/* Area Summary */}
              <div className="mb-8">
                <div className="flex flex-wrap gap-3">
                  {["Tech", "Creative", "Strategy", "Operations"].map((area) => {
                    const count = filteredRoles.filter((role) => role.areaOfInterest === area).length
                    return count > 0 ? (
                      <Badge key={area} variant="outline" className="bg-card border-border text-foreground px-3 py-1">
                        <span className="flex items-center gap-2">
                          {getAreaIcon(area)}
                          {area}: {count}
                        </span>
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>

              {/* Roles Grid */}
              {filteredRoles.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredRoles.map((role) => (
                    <TeamRoleCard key={role.id} role={role} />
                  ))}
                </div>
              ) : (
                <Card className="bg-card border-border p-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No roles match your filters</h3>
                    <p className="text-sm">Try adjusting your filter criteria to see more opportunities</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleFiltersChange({
                        skillset: [],
                        availability: [],
                        location: [],
                        areaOfInterest: [],
                      })
                    }
                    className="mt-4"
                  >
                    Clear All Filters
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-card border-border p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {!user ? "Ready to Join Our Team?" : "Don't See Your Perfect Role?"}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {!user 
                ? "Create an account or sign in to start your journey with The New Alkebulan. We're looking for passionate individuals ready to make a difference."
                : "We're always looking for exceptional talent. If you're passionate about our mission and have skills that could contribute to The New Alkebulan, we'd love to hear from you."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => handleAuthRedirect('signup')}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Sign Up to Join'}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-border text-foreground hover:bg-muted bg-transparent"
                    onClick={() => handleAuthRedirect('signin')}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Sign In to Apply'}
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Send Us Your Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-border text-foreground hover:bg-muted bg-transparent"
                  >
                    Join Our Talent Network
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
