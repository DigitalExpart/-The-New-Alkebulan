"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building2, MapPin, Globe, Mail, Phone, Edit3, Save, X, ExternalLink, Users, Calendar } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"
import type { BusinessProfile } from "@/types/business"

interface CompanyProfileSectionProps {
  profile: BusinessProfile
  onSaved?: (updated: any) => void
}

export function CompanyProfileSection({ profile, onSaved }: CompanyProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(profile)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  // Use local state as the source of truth for display and edit
  const socialLinks = (editedProfile as any)?.socialLinks || {}

  const handleSave = async () => {
    try {
      setSaving(true)
      const supabase = getSupabaseClient()

      let logo_url = editedProfile.logo
      if (logoFile) {
        const filePath = `companies/${editedProfile.id || 'unknown'}/logo_${Date.now()}_${logoFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('company-media')
          .upload(filePath, logoFile, { upsert: true })
        if (!uploadError) {
          logo_url = supabase.storage.from('company-media').getPublicUrl(filePath).data.publicUrl
          // Save metadata in company_logos table (backend audit/history)
          await supabase.from('company_logos').insert({
            company_id: editedProfile.id,
            file_path: filePath,
            file_name: logoFile.name,
            file_size: logoFile.size,
            file_type: logoFile.type,
            is_primary: true,
          })
        } else {
          toast.error(`Logo upload failed: ${uploadError.message}`)
          return
        }
      }

      // Map UI shape -> DB column names
      const payload: Record<string, any> = {
        name: editedProfile?.name ?? null,
        description: editedProfile?.description ?? null,
        industry: editedProfile?.industry ?? null,
        location: editedProfile?.location ?? null,
        website: editedProfile?.website ?? null,
        email: editedProfile?.email ?? null,
        phone: editedProfile?.phone ?? null,
        team_size: editedProfile?.teamSize ?? null,
        founded: editedProfile?.founded ?? null,
        logo: logo_url ?? null,
        social_links: editedProfile?.socialLinks ?? {},
      }

      const { error: updateError } = await supabase
        .from('companies')
        .update(payload)
        .eq('id', editedProfile.id)
      if (updateError) {
        toast.error(`Save failed: ${updateError.message}`)
        return
      }
      const updatedUiShape = { ...editedProfile, logo: logo_url }
      setEditedProfile(updatedUiShape as any)
      onSaved?.(updatedUiShape)
      toast.success('Company profile updated')
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
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
              {/* Logo uploader */}
              <div>
                <label className="text-sm font-medium mb-2 block">Company Logo</label>
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={logoFile ? URL.createObjectURL(logoFile) : (editedProfile.logo || "/placeholder.svg") } alt={editedProfile?.name} />
                    <AvatarFallback>{editedProfile?.name?.charAt(0) || 'C'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                    <p className="text-xs text-muted-foreground mt-1">PNG/JPG, up to 5MB.</p>
                  </div>
                </div>
              </div>
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
              <AvatarImage src={editedProfile?.logo || "/placeholder.svg"} alt={editedProfile?.name} />
              <AvatarFallback className="text-lg">{editedProfile?.name?.charAt(0) || "C"}</AvatarFallback>
            </Avatar>
          </div>

          {/* Company Details */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-2xl font-bold">{editedProfile?.name || "Company Name"}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {editedProfile?.industry && <Badge variant="secondary">{editedProfile.industry}</Badge>}
                {editedProfile?.teamSize && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {editedProfile.teamSize}
                  </Badge>
                )}
                {editedProfile?.founded && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Founded {editedProfile.founded}
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-muted-foreground">{editedProfile?.description || "No description available."}</p>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {editedProfile?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{editedProfile.location}</span>
                </div>
              )}

              {editedProfile?.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={editedProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {editedProfile?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${editedProfile.email}`} className="text-primary hover:underline">
                    {editedProfile.email}
                  </a>
                </div>
              )}

              {editedProfile?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${editedProfile.phone}`} className="text-primary hover:underline">
                    {editedProfile.phone}
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
