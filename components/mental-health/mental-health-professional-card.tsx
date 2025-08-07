"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  MessageCircle,
  Video,
  Shield,
  Globe,
  Calendar,
  Phone,
  Mail,
} from "lucide-react"
import type { MentalHealthProfessional } from "@/types/mental-health"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface MentalHealthProfessionalCardProps {
  professional: MentalHealthProfessional
  onRequestSession: (professionalId: string) => void
  onSaveFavorite: (professionalId: string) => void
  isFavorite: boolean
}

export function MentalHealthProfessionalCard({
  professional,
  onRequestSession,
  onSaveFavorite,
  isFavorite,
}: MentalHealthProfessionalCardProps) {
  const [showFullProfile, setShowFullProfile] = useState(false)

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case "online":
        return <Video className="w-4 h-4" />
      case "in-person":
        return <MapPin className="w-4 h-4" />
      case "both":
        return <Globe className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case "online":
        return "Online Sessions"
      case "in-person":
        return "In-Person Only"
      case "both":
        return "Online & In-Person"
      default:
        return "Available"
    }
  }

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 via-white to-green-50 border-blue-200 hover:border-blue-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-16 h-16 border-2 border-blue-200">
                <AvatarImage src={professional.profileImage || "/placeholder.svg"} alt={professional.name} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
                  {professional.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-blue-900">{professional.name}</h3>
                  {professional.verified && <Shield className="w-4 h-4 text-green-600" title="Verified Professional" />}
                </div>
                <p className="text-blue-700 font-medium">{professional.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {professional.rating} ({professional.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSaveFavorite(professional.id)}
              className={`${isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"}`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Credentials */}
          <div className="flex flex-wrap gap-1">
            {professional.credentials.slice(0, 2).map((credential, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                {credential}
              </Badge>
            ))}
            {professional.credentials.length > 2 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                +{professional.credentials.length - 2} more
              </Badge>
            )}
          </div>

          {/* Specializations */}
          <div>
            <p className="text-sm font-medium text-blue-900 mb-2">Specializations:</p>
            <div className="flex flex-wrap gap-1">
              {professional.specializations.slice(0, 3).map((spec, index) => (
                <Badge key={index} variant="outline" className="text-xs border-green-200 text-green-700">
                  {spec}
                </Badge>
              ))}
              {professional.specializations.length > 3 && (
                <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                  +{professional.specializations.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Languages */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Globe className="w-4 h-4" />
            <span>{professional.languages.slice(0, 3).join(", ")}</span>
            {professional.languages.length > 3 && (
              <span className="text-gray-500">+{professional.languages.length - 3} more</span>
            )}
          </div>

          {/* Location & Availability */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{professional.location}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              {getAvailabilityIcon(professional.availability)}
              <span>{getAvailabilityText(professional.availability)}</span>
            </div>
          </div>

          {/* Price & Response Time */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <DollarSign className="w-4 h-4" />
              <span>
                ${professional.hourlyRate}/{professional.currency === "USD" ? "hour" : "session"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{professional.responseTime}</span>
            </div>
          </div>

          {/* Cultural Specialties */}
          {professional.culturalSpecialties && professional.culturalSpecialties.length > 0 && (
            <div>
              <p className="text-sm font-medium text-purple-900 mb-1">Cultural Focus:</p>
              <div className="flex flex-wrap gap-1">
                {professional.culturalSpecialties.slice(0, 2).map((specialty, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-purple-200 text-purple-700">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => onRequestSession(professional.id)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Request Session
            </Button>
            <Dialog open={showFullProfile} onOpenChange={setShowFullProfile}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent">
                  View Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-green-50">
                <DialogHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20 border-2 border-blue-200">
                      <AvatarImage src={professional.profileImage || "/placeholder.svg"} alt={professional.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xl font-semibold">
                        {professional.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-xl text-blue-900 flex items-center gap-2">
                        {professional.name}
                        {professional.verified && <Shield className="w-5 h-5 text-green-600" />}
                      </DialogTitle>
                      <p className="text-blue-700 font-medium">{professional.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {professional.rating} ({professional.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  {/* About Section */}
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">About</h4>
                    <p className="text-gray-700 leading-relaxed">{professional.about}</p>
                  </div>

                  <Separator />

                  {/* Therapeutic Approach */}
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Therapeutic Approach</h4>
                    <p className="text-gray-700 leading-relaxed">{professional.therapeuticApproach}</p>
                  </div>

                  <Separator />

                  {/* Credentials & Experience */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Credentials</h4>
                      <ul className="space-y-1">
                        {professional.credentials.map((credential, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                            {credential}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Experience</h4>
                      <p className="text-gray-700">{professional.experience} years of practice</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Specializations */}
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {professional.specializations.map((spec, index) => (
                        <Badge key={index} variant="outline" className="border-green-200 text-green-700">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Cultural Specialties */}
                  {professional.culturalSpecialties && professional.culturalSpecialties.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Cultural Specialties</h4>
                        <div className="flex flex-wrap gap-2">
                          {professional.culturalSpecialties.map((specialty, index) => (
                            <Badge key={index} variant="outline" className="border-purple-200 text-purple-700">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Languages & Session Types */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {professional.languages.map((lang, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Session Types</h4>
                      <div className="flex flex-wrap gap-2">
                        {professional.sessionTypes.map((type, index) => (
                          <Badge key={index} variant="secondary" className="bg-teal-100 text-teal-800">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Contact & Pricing */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Contact Information</h4>
                      <div className="space-y-2">
                        {professional.contactInfo.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="w-4 h-4" />
                            <span>{professional.contactInfo.email}</span>
                          </div>
                        )}
                        {professional.contactInfo.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="w-4 h-4" />
                            <span>{professional.contactInfo.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="w-4 h-4" />
                          <span>{professional.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          {getAvailabilityIcon(professional.availability)}
                          <span>{getAvailabilityText(professional.availability)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Pricing & Payments</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600 font-medium">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            ${professional.hourlyRate}/{professional.currency === "USD" ? "hour" : "session"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock className="w-4 h-4" />
                          <span>Responds {professional.responseTime}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p className="font-medium mb-1">Accepted Payments:</p>
                          <p>{professional.acceptedPayments.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => {
                        onRequestSession(professional.id)
                        setShowFullProfile(false)
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Request Session
                    </Button>
                    <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
