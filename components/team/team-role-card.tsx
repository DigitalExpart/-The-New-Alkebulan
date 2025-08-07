"use client"

import { useRouter } from "next/navigation"
import type { TeamRole } from "@/types/team"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Target, Briefcase } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface TeamRoleCardProps {
  role: TeamRole
}

export function TeamRoleCard({ role }: TeamRoleCardProps) {
  const router = useRouter()
  const { user, loading } = useAuth()

  const handleApply = () => {
    if (!user) {
      router.push('/auth/signup')
    } else {
      // User is authenticated, they can apply
      console.log(`User applying for role: ${role.title}`)
      // You can add logic here to show application form or redirect to application process
    }
  }

  return (
    <Card className="bg-card border-border hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-foreground text-lg font-bold leading-tight">{role.title}</CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 shrink-0">
            {role.areaOfInterest}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {role.availability}
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {role.location}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Responsibilities */}
        <div>
          <h4 className="text-foreground font-semibold mb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Responsibilities
          </h4>
          <ul className="text-muted-foreground text-sm space-y-1">
            {role.responsibilities.slice(0, 3).map((responsibility, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{responsibility}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Expected Impact */}
        <div>
          <h4 className="text-foreground font-semibold mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Expected Impact
          </h4>
          <p className="text-muted-foreground text-sm leading-relaxed">{role.expectedImpact}</p>
        </div>

        {/* Skills */}
        <div>
          <h4 className="text-foreground font-semibold mb-2">Key Skills</h4>
          <div className="flex flex-wrap gap-1">
            {role.skillset.slice(0, 4).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-muted/50 text-muted-foreground border-border">
                {skill}
              </Badge>
            ))}
            {role.skillset.length > 4 && (
              <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground border-border">
                +{role.skillset.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-auto pt-4">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium" 
            size="sm"
            onClick={handleApply}
            disabled={loading}
          >
            {loading ? 'Loading...' : (!user ? 'Sign Up to Apply' : 'Apply / Connect')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
