"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building2, MapPin, Globe, Mail, Phone, Edit3, Save, X, ExternalLink, Users, Calendar } from "lucide-react"
import type { BusinessProfile } from "@/types/business"

interface CompanyProfileSectionProps {
  profile: BusinessProfile
}

export function CompanyProfileSection({ profile }: CompanyProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(profile)

  // Safely access socialLinks with fallback
  const socialLinks = profile?.socialLinks || {}

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log("Saving profile:", editedProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Edit Company Profile
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Company Name</label>
                <Input
                  value={editedProfile?.name || ""}
                  onChange={(e) => setEditedProfile((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Industry</label>
                <Input
                  value={editedProfile?.industry || ""}
                  onChange={(e) => setEditedProfile((prev) => ({ ...prev, industry: e.target.value }))}
                  placeholder="e.g. Technology, Healthcare, Education"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  value={editedProfile?.location || ""}
                  onChange={(e) => setEditedProfile((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Website</label>
                <Input
                  value={editedProfile?.website || ""}
                  onChange={(e) => setEditedProfile((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  value={editedProfile?.email || ""}
                  onChange={(e) => setEditedProfile((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@company.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Phone</label>
                <Input
                  value={editedProfile?.phone || ""}
                  onChange={(e) => setEditedProfile((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Team Size</label>
                <Input
                  value={editedProfile?.teamSize || ""}
                  onChange={(e) => setEditedProfile((prev) => ({ ...prev, teamSize: e.target.value }))}
                  placeholder="e.g. 1-10, 11-50, 51-200"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Founded</label>
                <Input
                  value={editedProfile?.founded || ""}
                  onChange={(e) => setEditedProfile((prev) => ({ ...prev, founded: e.target.value }))}
                  placeholder="2024"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              value={editedProfile?.description || ""}
              onChange={(e) => setEditedProfile((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Tell us about your company..."
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">LinkedIn</label>
              <Input
                value={socialLinks?.linkedin || ""}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, linkedin: e.target.value },
                  }))
                }
                placeholder="LinkedIn URL"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Twitter</label>
              <Input
                value={socialLinks?.twitter || ""}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, twitter: e.target.value },
                  }))
                }
                placeholder="Twitter URL"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Instagram</label>
              <Input
                value={socialLinks?.instagram || ""}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, instagram: e.target.value },
                  }))
                }
                placeholder="Instagram URL"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Profile
          </CardTitle>
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Company Logo/Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.logo || "/placeholder.svg"} alt={profile?.name} />
              <AvatarFallback className="text-lg">{profile?.name?.charAt(0) || "C"}</AvatarFallback>
            </Avatar>
          </div>

          {/* Company Details */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-2xl font-bold">{profile?.name || "Company Name"}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile?.industry && <Badge variant="secondary">{profile.industry}</Badge>}
                {profile?.teamSize && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {profile.teamSize}
                  </Badge>
                )}
                {profile?.founded && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Founded {profile.founded}
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-muted-foreground">{profile?.description || "No description available."}</p>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {profile?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile?.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {profile?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${profile.email}`} className="text-primary hover:underline">
                    {profile.email}
                  </a>
                </div>
              )}

              {profile?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${profile.phone}`} className="text-primary hover:underline">
                    {profile.phone}
                  </a>
                </div>
              )}
            </div>

            {/* Social Links */}
            {(socialLinks?.linkedin || socialLinks?.twitter || socialLinks?.instagram) && (
              <div className="flex gap-3 pt-2">
                {socialLinks?.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    LinkedIn
                  </a>
                )}
                {socialLinks?.twitter && (
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    Twitter
                  </a>
                )}
                {socialLinks?.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    Instagram
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
