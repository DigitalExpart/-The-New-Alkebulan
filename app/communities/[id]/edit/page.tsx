"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, MapPin, Users, Globe, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

const categories = [
  "Business", "Technology", "Arts & Culture", "Finance", 
  "Education", "Health", "Sports", "Entertainment", "Environment"
]

interface Community {
  id: string
  name: string
  description: string
  category: string
  location: string | null
  is_public: boolean
  max_members: number
  rules: string | null
  contact_email: string | null
  website: string | null
  tags: string[]
  created_by: string
  status: string
}

export default function EditCommunityPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [community, setCommunity] = useState<Community | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    is_public: true,
    max_members: 1000,
    rules: "",
    contact_email: "",
    website: ""
  })

  useEffect(() => {
    if (params.id && user) {
      fetchCommunity()
    }
  }, [params.id, user])

  const fetchCommunity = async () => {
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', params.id)
        .eq('created_by', user?.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error("Community not found or you don't have permission to edit it")
          router.push("/dashboard")
          return
        }
        throw error
      }

      setCommunity(data)
      setFormData({
        name: data.name,
        description: data.description,
        category: data.category,
        location: data.location || "",
        is_public: data.is_public,
        max_members: data.max_members,
        rules: data.rules || "",
        contact_email: data.contact_email || "",
        website: data.website || ""
      })
      setTags(data.tags || [])
    } catch (error) {
      console.error('Error fetching community:', error)
      toast.error("Failed to load community")
      router.push("/dashboard")
    }
  }

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !community) {
      toast.error("You must be logged in to edit a community")
      return
    }

    if (!formData.name || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('communities')
        .update({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          location: formData.location || null,
          is_public: formData.is_public,
          max_members: formData.max_members,
          rules: formData.rules || null,
          contact_email: formData.contact_email || null,
          website: formData.website || null,
          tags: tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', community.id)
        .eq('created_by', user.id)

      if (error) throw error

      toast.success("Community updated successfully!")
      router.push(`/communities/${community.id}`)
      
    } catch (error) {
      console.error('Error updating community:', error)
      toast.error("Failed to update community. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-center text-muted-foreground">Loading community...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Edit Community</h1>
          <p className="text-muted-foreground mt-2">
            Update your community details and settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Community Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Community Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter community name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what your community is about..."
                  rows={4}
                  required
                />
              </div>

              {/* Location and Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, Country or Global"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_members">Maximum Members</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="max_members"
                      type="number"
                      value={formData.max_members}
                      onChange={(e) => handleInputChange('max_members', parseInt(e.target.value))}
                      min="10"
                      max="10000"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags (up to 5)</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addTag} disabled={tags.length >= 5 || !newTag.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="space-y-2">
                <Label htmlFor="rules">Community Rules (Optional)</Label>
                <Textarea
                  id="rules"
                  value={formData.rules}
                  onChange={(e) => handleInputChange('rules', e.target.value)}
                  placeholder="Set guidelines for your community..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="community@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Setting */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => handleInputChange('is_public', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="is_public">Make this community public (visible to everyone)</Label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Updating..." : "Update Community"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
