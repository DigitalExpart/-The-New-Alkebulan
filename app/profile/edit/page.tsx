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
import { ArrowLeft, Save, User, Camera, Globe, Heart, Users, Briefcase, BookOpen, Target, Plus, X, Calendar, MapPin, Languages } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import Link from "next/link"
import type { Profile, FamilyMember, WorkExperience, InterestSuggestion, CompetencySuggestion, LANGUAGE_OPTIONS, GENDER_OPTIONS, RELATIONSHIP_OPTIONS, INTEREST_SUGGESTIONS, COMPETENCY_SUGGESTIONS } from "@/types/profile"

export default function EditProfilePage() {
  const router = useRouter()
  const { user, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Enhanced form data state
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    phone: "",
    occupation: "",
    education: "",
    avatar_url: "",
    language_preference: "",
    region: "",
    gender: "",
    place_of_birth: "",
    date_of_birth: "",
    relationship_status: "",
    interests: [] as string[],
    core_competencies: [] as string[]
  })

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([])
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption | null>(null)
  const [customization, setCustomization] = useState<AvatarCustomization | null>(null)

  // New family member form
  const [newFamilyMember, setNewFamilyMember] = useState({
    name: "",
    relationship: "",
    age: "",
    occupation: ""
  })

  // New work experience form
  const [newWorkExperience, setNewWorkExperience] = useState({
    company: "",
    position: "",
    start_date: "",
    end_date: "",
    description: "",
    achievements: ""
  })

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
          username: data.username || '',
          email: data.email || user.email || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          phone: data.phone || '',
          occupation: data.occupation || '',
          education: data.education || '',
          avatar_url: data.avatar_url || '',
          language_preference: data.language_preference || '',
          region: data.region || '',
          gender: data.gender || '',
          place_of_birth: data.place_of_birth || '',
          date_of_birth: data.date_of_birth || '',
          relationship_status: data.relationship_status || '',
          interests: data.interests || [],
          core_competencies: data.core_competencies || []
        })

        // Set family members and work experience if they exist
        if (data.family_members) {
          setFamilyMembers(data.family_members)
        }
        if (data.work_experience) {
          setWorkExperience(data.work_experience)
        }
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
      username: user.email?.split('@')[0] || 'User',
      bio: '',
      location: '',
      website: '',
      phone: '',
      occupation: '',
      education: '',
      avatar_url: null,
      language_preference: 'en',
      region: '',
      gender: '',
      place_of_birth: '',
      date_of_birth: '',
      relationship_status: '',
      interests: [],
      core_competencies: [],
      is_public: true
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .insert(defaultProfile)

      if (error) {
        console.error('Error creating profile:', error)
        toast.error('Failed to create profile: ' + error.message)
      } else {
        // Set form data with default values
        setFormData({
          ...formData,
          ...defaultProfile
        })
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create profile')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAvatarSelect = (avatar: AvatarOption, customizationData?: AvatarCustomization) => {
    setSelectedAvatar(avatar)
    setCustomization(customizationData || null)
    setFormData(prev => ({ ...prev, avatar_url: avatar.imageUrl }))
  }

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, avatar_url: imageUrl }))
  }

  // Handle interests and competencies
  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleCompetencyToggle = (competency: string) => {
    setFormData(prev => ({
      ...prev,
      core_competencies: prev.core_competencies.includes(competency)
        ? prev.core_competencies.filter(c => c !== competency)
        : [...prev.core_competencies, competency]
    }))
  }

  // Handle family members
  const addFamilyMember = () => {
    if (newFamilyMember.name && newFamilyMember.relationship) {
      const member: FamilyMember = {
        id: Date.now().toString(),
        name: newFamilyMember.name,
        relationship: newFamilyMember.relationship,
        age: newFamilyMember.age ? parseInt(newFamilyMember.age) : undefined,
        occupation: newFamilyMember.occupation || undefined
      }
      setFamilyMembers(prev => [...prev, member])
      setNewFamilyMember({ name: "", relationship: "", age: "", occupation: "" })
    }
  }

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(prev => prev.filter(member => member.id !== id))
  }

  // Handle work experience
  const addWorkExperience = () => {
    if (newWorkExperience.company && newWorkExperience.position && newWorkExperience.start_date) {
      const experience: WorkExperience = {
        id: Date.now().toString(),
        company: newWorkExperience.company,
        position: newWorkExperience.position,
        start_date: newWorkExperience.start_date,
        end_date: newWorkExperience.end_date || undefined,
        description: newWorkExperience.description || undefined,
        achievements: newWorkExperience.achievements ? [newWorkExperience.achievements] : undefined
      }
      setWorkExperience(prev => [...prev, experience])
      setNewWorkExperience({ company: "", position: "", start_date: "", end_date: "", description: "", achievements: "" })
    }
  }

  const removeWorkExperience = (id: string) => {
    setWorkExperience(prev => prev.filter(exp => exp.id !== id))
  }

  const handleSave = async () => {
    if (!user || !supabase) return

    setSaving(true)

    try {
      // Prepare profile data for update
      const profileData = {
        full_name: formData.full_name,
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        phone: formData.phone,
        occupation: formData.occupation,
        education: formData.education,
        avatar_url: formData.avatar_url,
        language_preference: formData.language_preference,
        region: formData.region,
        gender: formData.gender,
        place_of_birth: formData.place_of_birth,
        date_of_birth: formData.date_of_birth,
        relationship_status: formData.relationship_status,
        interests: formData.interests,
        core_competencies: formData.core_competencies,
        family_members: familyMembers,
        work_experience: workExperience,
        updated_at: new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating profile:', updateError)
        toast.error('Failed to save profile changes: ' + updateError.message)
      } else {
        toast.success('Profile updated successfully!')
        
        // Refresh profile data to update navbar avatar
        await refreshProfile()
        
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="family" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Family
            </TabsTrigger>
            <TabsTrigger value="career" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Career
            </TabsTrigger>
            <TabsTrigger value="avatar" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Avatar
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
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
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      placeholder="Choose a username"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personal Information Tab */}
          <TabsContent value="personal">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language_preference">Language Preference</Label>
                      <Select value={formData.language_preference} onValueChange={(value) => handleInputChange("language_preference", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGE_OPTIONS.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Input
                        id="region"
                        value={formData.region}
                        onChange={(e) => handleInputChange("region", e.target.value)}
                        placeholder="Your region"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDER_OPTIONS.map((gender) => (
                            <SelectItem key={gender.value} value={gender.value}>
                              {gender.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="relationship_status">Relationship Status</Label>
                      <Select value={formData.relationship_status} onValueChange={(value) => handleInputChange("relationship_status", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {RELATIONSHIP_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="place_of_birth">Place of Birth</Label>
                      <Input
                        id="place_of_birth"
                        value={formData.place_of_birth}
                        onChange={(e) => handleInputChange("place_of_birth", e.target.value)}
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interests */}
              <Card>
                <CardHeader>
                  <CardTitle>Interests</CardTitle>
                  <p className="text-sm text-muted-foreground">Select your interests from the suggestions below</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(INTEREST_SUGGESTIONS.reduce((acc, interest) => {
                      if (!acc[interest.category]) acc[interest.category] = [];
                      acc[interest.category].push(interest);
                      return acc;
                    }, {} as Record<string, InterestSuggestion[]>)).map(([category, interests]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="font-medium text-sm">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                          {interests.map((interest) => (
                            <Badge
                              key={interest.id}
                              variant={formData.interests.includes(interest.name) ? "default" : "outline"}
                              className="cursor-pointer hover:bg-primary/80"
                              onClick={() => handleInterestToggle(interest.name)}
                            >
                              {interest.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Core Competencies */}
              <Card>
                <CardHeader>
                  <CardTitle>Core Competencies</CardTitle>
                  <p className="text-sm text-muted-foreground">Select your key skills and competencies</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(COMPETENCY_SUGGESTIONS.reduce((acc, competency) => {
                      if (!acc[competency.category]) acc[competency.category] = [];
                      acc[competency.category].push(competency);
                      return acc;
                    }, {} as Record<string, CompetencySuggestion[]>)).map(([category, competencies]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="font-medium text-sm">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                          {competencies.map((competency) => (
                            <Badge
                              key={competency.id}
                              variant={formData.core_competencies.includes(competency.name) ? "default" : "outline"}
                              className="cursor-pointer hover:bg-primary/80"
                              onClick={() => handleCompetencyToggle(competency.name)}
                            >
                              {competency.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Family Members Tab */}
          <TabsContent value="family">
            <Card>
              <CardHeader>
                <CardTitle>Family Members</CardTitle>
                <p className="text-sm text-muted-foreground">Add information about your family members</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Family Member Form */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium">Add New Family Member</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="family-name">Name</Label>
                      <Input
                        id="family-name"
                        value={newFamilyMember.name}
                        onChange={(e) => setNewFamilyMember(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Family member name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="family-relationship">Relationship</Label>
                      <Input
                        id="family-relationship"
                        value={newFamilyMember.relationship}
                        onChange={(e) => setNewFamilyMember(prev => ({ ...prev, relationship: e.target.value }))}
                        placeholder="e.g., Mother, Brother"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="family-age">Age</Label>
                      <Input
                        id="family-age"
                        type="number"
                        value={newFamilyMember.age}
                        onChange={(e) => setNewFamilyMember(prev => ({ ...prev, age: e.target.value }))}
                        placeholder="Age"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="family-occupation">Occupation</Label>
                      <Input
                        id="family-occupation"
                        value={newFamilyMember.occupation}
                        onChange={(e) => setNewFamilyMember(prev => ({ ...prev, occupation: e.target.value }))}
                        placeholder="Occupation"
                      />
                    </div>
                  </div>
                  <Button onClick={addFamilyMember} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Family Member
                  </Button>
                </div>

                {/* Existing Family Members */}
                {familyMembers.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Family Members</h4>
                    {familyMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.relationship}
                            {member.age && ` • ${member.age} years old`}
                            {member.occupation && ` • ${member.occupation}`}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFamilyMember(member.id!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Career Tab */}
          <TabsContent value="career">
            <div className="space-y-6">
              {/* Education */}
              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="education">Educational Background</Label>
                    <Textarea
                      id="education"
                      value={formData.education}
                      onChange={(e) => handleInputChange("education", e.target.value)}
                      placeholder="Describe your educational background, degrees, certifications, etc."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Work Experience */}
              <Card>
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                  <p className="text-sm text-muted-foreground">Add your professional work experience</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add New Work Experience Form */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-medium">Add New Work Experience</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="work-company">Company</Label>
                        <Input
                          id="work-company"
                          value={newWorkExperience.company}
                          onChange={(e) => setNewWorkExperience(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="work-position">Position</Label>
                        <Input
                          id="work-position"
                          value={newWorkExperience.position}
                          onChange={(e) => setNewWorkExperience(prev => ({ ...prev, position: e.target.value }))}
                          placeholder="Job title"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="work-start-date">Start Date</Label>
                        <Input
                          id="work-start-date"
                          type="date"
                          value={newWorkExperience.start_date}
                          onChange={(e) => setNewWorkExperience(prev => ({ ...prev, start_date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="work-end-date">End Date (Optional)</Label>
                        <Input
                          id="work-end-date"
                          type="date"
                          value={newWorkExperience.end_date}
                          onChange={(e) => setNewWorkExperience(prev => ({ ...prev, end_date: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="work-description">Description</Label>
                      <Textarea
                        id="work-description"
                        value={newWorkExperience.description}
                        onChange={(e) => setNewWorkExperience(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your role and responsibilities"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="work-achievements">Key Achievements</Label>
                      <Textarea
                        id="work-achievements"
                        value={newWorkExperience.achievements}
                        onChange={(e) => setNewWorkExperience(prev => ({ ...prev, achievements: e.target.value }))}
                        placeholder="List your key achievements in this role"
                        rows={2}
                      />
                    </div>
                    <Button onClick={addWorkExperience} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Work Experience
                    </Button>
                  </div>

                  {/* Existing Work Experience */}
                  {workExperience.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Work Experience</h4>
                      {workExperience.map((exp) => (
                        <div key={exp.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-medium">{exp.position}</h5>
                                <span className="text-sm text-muted-foreground">at</span>
                                <h6 className="font-medium text-blue-600">{exp.company}</h6>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {exp.start_date} - {exp.end_date || 'Present'}
                              </p>
                              {exp.description && (
                                <p className="text-sm mb-2">{exp.description}</p>
                              )}
                              {exp.achievements && exp.achievements.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Key Achievements:</p>
                                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                                    {exp.achievements.map((achievement, index) => (
                                      <li key={index}>{achievement}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeWorkExperience(exp.id!)}
                              className="text-red-600 hover:text-red-700 ml-4"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Avatar Tab */}
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
              <AvatarSelection 
                onAvatarSelect={handleAvatarSelect} 
                selectedAvatarId={selectedAvatar?.id}
                onImageUpload={handleImageUpload}
                currentImageUrl={formData.avatar_url}
              />
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
