"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Calendar, MessageCircle, CheckCircle, Globe } from "lucide-react"
import type { HealthCoach } from "@/types/health"

interface HealthCoachesProps {
  coaches: HealthCoach[]
}

export function HealthCoaches({ coaches }: HealthCoachesProps) {
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null)

  const getAvailabilityColor = (availability: string) => {
    if (availability.includes("Available today")) return "text-green-600"
    if (availability.includes("Available")) return "text-blue-600"
    return "text-yellow-600"
  }

  const getAvailabilityIcon = (availability: string) => {
    if (availability.includes("Available today")) return "🟢"
    if (availability.includes("Available")) return "🔵"
    return "🟡"
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Health Coaches</h2>
        <p className="text-muted-foreground">Connect with certified health professionals for personalized guidance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((coach) => (
          <Card key={coach.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {/* Coach Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={coach.avatar || "/placeholder.svg"} alt={coach.name} />
                    <AvatarFallback>
                      {coach.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {coach.verified && (
                    <CheckCircle className="absolute -top-1 -right-1 h-5 w-5 text-blue-600 bg-white rounded-full" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{coach.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{coach.specialty}</p>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{coach.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({coach.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Coach Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Experience:</span>
                  <span className="font-medium">{coach.experience}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium text-green-600">{coach.price}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {coach.languages.map((lang, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span>{getAvailabilityIcon(coach.availability)}</span>
                  <span className={getAvailabilityColor(coach.availability)}>{coach.availability}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button className="w-full" onClick={() => setSelectedCoach(coach.id)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Session
                </Button>

                <Button variant="outline" className="w-full bg-transparent" size="sm">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>

              {/* Verification Badge */}
              {coach.verified && (
                <div className="mt-3 pt-3 border-t">
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verified Professional
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-4">🌟</div>
          <h3 className="text-xl font-bold mb-2">Ready to Start Your Health Journey?</h3>
          <p className="text-muted-foreground mb-4">
            Our certified health coaches are here to support you every step of the way.
          </p>
          <Button size="lg">Find Your Perfect Coach</Button>
        </CardContent>
      </Card>
    </div>
  )
}
