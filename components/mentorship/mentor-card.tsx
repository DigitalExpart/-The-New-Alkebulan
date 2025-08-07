"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Star,
  MapPin,
  Clock,
  MessageCircle,
  Heart,
  Shield,
  Award,
  Calendar,
  DollarSign,
  Globe,
  CheckCircle,
} from "lucide-react"
import type { Mentor } from "@/types/mentorship"

interface MentorCardProps {
  mentor: Mentor
  onBookSession?: (mentorId: string) => void
  onToggleFavorite?: (mentorId: string) => void
  isFavorited?: boolean
}

export function MentorCard({ mentor, onBookSession, onToggleFavorite, isFavorited = false }: MentorCardProps) {
  const [showFullProfile, setShowFullProfile] = useState(false)

  const handleBookSession = () => {
    onBookSession?.(mentor.id)
  }

  const handleToggleFavorite = () => {
    onToggleFavorite?.(mentor.id)
  }

  const formatDistance = (distance: number) => {
    if (distance === 0) return "Local"
    if (distance < 1000) return `${distance} km away`
    return `${Math.round(distance / 100) / 10}k km away`
  }

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={mentor.profilePicture || "/placeholder.svg"} alt={mentor.name} />
                  <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                    {mentor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {mentor.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg truncate">{mentor.name}</h3>
                  {mentor.isActive && <div className="h-2 w-2 bg-green-500 rounded-full" title="Online now" />}
                </div>
                <p className="text-sm text-muted-foreground truncate">{mentor.title}</p>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{mentor.rating}</span>
                    <span className="text-xs text-muted-foreground">({mentor.reviewCount})</span>
                  </div>
                  {mentor.distance !== undefined && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{formatDistance(mentor.distance)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Bio */}
          <p className="text-sm text-muted-foreground line-clamp-2">{mentor.bio}</p>

          {/* Specializations */}
          <div className="flex flex-wrap gap-1">
            {mentor.specializations.slice(0, 3).map((spec) => (
              <Badge key={spec} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
            {mentor.specializations.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{mentor.specializations.length - 3} more
              </Badge>
            )}
          </div>

          {/* Languages */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {mentor.languages.slice(0, 2).join(", ")}
              {mentor.languages.length > 2 && ` +${mentor.languages.length - 2}`}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{mentor.totalSessions} sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{mentor.responseTime}</span>
            </div>
          </div>

          {/* Price */}
          {mentor.hourlyRate && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-600">${mentor.hourlyRate}/hour</span>
              </div>
            </div>
          )}

          {/* Recent Review */}
          {mentor.reviews.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={mentor.reviews[0].menteeAvatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">{mentor.reviews[0].menteeName[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{mentor.reviews[0].menteeName}</span>
                <div className="flex">
                  {Array.from({ length: mentor.reviews[0].rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">"{mentor.reviews[0].comment}"</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Dialog open={showFullProfile} onOpenChange={setShowFullProfile}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 bg-transparent">
                  View Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={mentor.profilePicture || "/placeholder.svg"} alt={mentor.name} />
                      <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                        {mentor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        {mentor.name}
                        {mentor.isVerified && <Shield className="h-4 w-4 text-green-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground font-normal">{mentor.title}</p>
                    </div>
                  </DialogTitle>
                  <DialogDescription>{mentor.bio}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{mentor.rating}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{mentor.reviewCount} reviews</p>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold mb-1">{mentor.totalSessions}</div>
                      <p className="text-xs text-muted-foreground">Sessions</p>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold mb-1">{mentor.responseTime}</div>
                      <p className="text-xs text-muted-foreground">Response time</p>
                    </div>
                    {mentor.hourlyRate && (
                      <div className="text-center">
                        <div className="font-semibold mb-1 text-green-600">${mentor.hourlyRate}</div>
                        <p className="text-xs text-muted-foreground">Per hour</p>
                      </div>
                    )}
                  </div>

                  {/* Experience */}
                  <div>
                    <h4 className="font-semibold mb-2">Experience</h4>
                    <p className="text-sm text-muted-foreground">{mentor.experience}</p>
                  </div>

                  {/* Credentials */}
                  <div>
                    <h4 className="font-semibold mb-3">Credentials</h4>
                    <div className="space-y-2">
                      {mentor.credentials.map((credential) => (
                        <div key={credential.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <Award className="h-5 w-5 text-blue-600" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{credential.title}</span>
                              {credential.verified && <CheckCircle className="h-4 w-4 text-green-500" />}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {credential.issuer} • {credential.year}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <h4 className="font-semibold mb-3">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {mentor.specializations.map((spec) => (
                        <Badge key={spec} variant="secondary">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <h4 className="font-semibold mb-3">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {mentor.languages.map((lang) => (
                        <Badge key={lang} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Reviews */}
                  <div>
                    <h4 className="font-semibold mb-3">Recent Reviews</h4>
                    <div className="space-y-4">
                      {mentor.reviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.menteeAvatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-sm">{review.menteeName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{review.menteeName}</span>
                                <div className="flex">
                                  {Array.from({ length: review.rating }).map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {review.sessionType} • {new Date(review.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={handleBookSession} className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Book Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
