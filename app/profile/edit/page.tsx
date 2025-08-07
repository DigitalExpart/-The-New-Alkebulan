"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AvatarSelection } from "@/components/avatar/avatar-selection"
import { AvatarDisplay } from "@/components/avatar/avatar-display"
import type { AvatarOption, AvatarCustomization } from "@/types/avatar"
import { ArrowLeft, Save, User, Camera } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import Link from "next/link"

export default function EditProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form data state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    phone: "",
    occupation: "",
    education: "",
  })

  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption | null>(null)
  const [customization, setCustomization] = useState<AvatarCustomization | null>(null)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user || !supabase) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        // Create default profile if none exists
        await createDefaultProfile()
      } else {
        setFormData({
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          phone: data.phone || '',
          occupation: data.occupation || '',
          education: data.education || '',
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDefaultProfile = async () => {
    if (!user || !supabase) return

    const defaultProfile = {
      user_id: user.id,
      email: user.email,
      full_name: (user as any)?.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      bio: '',
      location: '',
      website: '',
      phone: '',
      occupation: '',
      education: '',
      avatar_url: null,
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([defaultProfile])
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
      } else {
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          phone: data.phone || '',
          occupation: data.occupation || '',
          education: data.education || '',
        })
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarSelect = (avatar: AvatarOption, customizationData?: AvatarCustomization) => {
    setSelectedAvatar(avatar)
    if (customizationData) {
      setCustomization(customizationData)
    }
  }

  const handleSave = async () => {
    if (!user || !supabase) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          email: formData.email,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          phone: formData.phone,
          occupation: formData.occupation,
          education: formData.education,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        toast.error('Failed to save profile changes')
      } else {
        toast.success('Profile updated successfully!')
        router.push("/profile")
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to save profile changes')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push("/profile")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to edit your profile</h1>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground">Update your personal information and avatar</p>
          </div>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Basic Information
            </TabsTrigger>
            <TabsTrigger value="avatar" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Avatar & Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange("occupation", e.target.value)}
                      placeholder="Your job title"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    value={formData.education}
                    onChange={(e) => handleInputChange("education", e.target.value)}
                    placeholder="Your educational background"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="avatar">
            <div className="space-y-6">
              {/* Current Avatar Preview */}
              {selectedAvatar && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <AvatarDisplay avatar={selectedAvatar} size="lg" />
                      <div>
                        <h3 className="font-semibold text-green-800">Current Avatar: {selectedAvatar.name}</h3>
                        <p className="text-sm text-gray-600">
                          From {selectedAvatar.region} • {selectedAvatar.gender}
                        </p>
                        {customization && <p className="text-xs text-green-600 mt-1">✨ Customized</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Avatar Selection */}
              <AvatarSelection onAvatarSelect={handleAvatarSelect} selectedAvatarId={selectedAvatar?.id} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
