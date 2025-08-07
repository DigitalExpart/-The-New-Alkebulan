"use client"

import { useState } from "react"
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

export default function EditProfilePage() {
  const router = useRouter()

  // Mock current user data
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john@example.com",
    bio: "Passionate entrepreneur and community builder focused on connecting diaspora communities worldwide. I believe in the power of technology to bridge cultures and create opportunities.",
    location: "New York, USA",
    website: "https://johndoe.com",
    phone: "+1 (555) 123-4567",
    occupation: "Product Manager",
    education: "MBA, Harvard Business School",
  })

  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption | null>(null)
  const [customization, setCustomization] = useState<AvatarCustomization | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarSelect = (avatar: AvatarOption, customizationData?: AvatarCustomization) => {
    setSelectedAvatar(avatar)
    if (customizationData) {
      setCustomization(customizationData)
    }
  }

  const handleSave = () => {
    // Save profile data and avatar
    console.log("Saving profile:", formData, selectedAvatar, customization)

    // Show success message and redirect
    router.push("/profile")
  }

  const handleCancel = () => {
    router.push("/profile")
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
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
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
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
