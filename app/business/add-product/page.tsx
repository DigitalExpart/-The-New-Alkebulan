"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Save, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

interface ProductFormData {
  name: string
  category: string
  subcategory: string
  price: number
  description: string
  status: string
}

const productCategories = [
  { value: "physical", label: "Physical Products" },
  { value: "digital", label: "Digital Products" },
]

const physicalSubcategories = [
  { value: "accessories", label: "Accessories" },
  { value: "clothing", label: "Clothing & Fashion" },
  { value: "food", label: "Food & Beverages" },
  { value: "health", label: "Health & Wellness" },
  { value: "home", label: "Home & Garden" },
  { value: "jewelry", label: "Jewelry & Watches" },
  { value: "sports", label: "Sports & Recreation" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "electronics", label: "Electronics & Gadgets" },
  { value: "books", label: "Books & Stationery" },
  { value: "toys", label: "Toys & Games" },
  { value: "automotive", label: "Automotive & Parts" },
]

const digitalSubcategories = [
  { value: "software", label: "Software & Apps" },
  { value: "courses", label: "Online Courses" },
  { value: "ebooks", label: "E-books & Guides" },
  { value: "templates", label: "Templates & Designs" },
  { value: "music", label: "Music & Audio" },
  { value: "video", label: "Video & Film" },
  { value: "photography", label: "Photography & Art" },
  { value: "consulting", label: "Consulting Services" },
  { value: "webinars", label: "Webinars & Events" },
  { value: "memberships", label: "Memberships & Subscriptions" },
  { value: "licenses", label: "Licenses & Certifications" },
  { value: "data", label: "Data & Analytics" },
]

const productStatuses = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

export default function AddProductPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    category: "",
    subcategory: "",
    price: 0,
    description: "",
    status: "draft",
  })

  const handleInputChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Reset subcategory when category changes
    if (field === 'category') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        subcategory: ""
      }))
    }
  }

  const getSubcategories = () => {
    if (formData.category === 'physical') {
      return physicalSubcategories
    } else if (formData.category === 'digital') {
      return digitalSubcategories
    }
    return []
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      toast.error("You must be signed in to add a product")
      return
    }

    if (!formData.name || !formData.category || !formData.subcategory || !formData.description) {
      toast.error("Please fill in all required fields")
      return
    }

    if (formData.price < 0) {
      toast.error("Price cannot be negative")
      return
    }

    try {
      setLoading(true)
      
      const supabase = getSupabaseClient()
      
      // For now, we'll just show a success message
      // In a real app, you'd insert into your products table
      console.log('Adding product:', { 
        userId: user.id, 
        category: formData.category,
        subcategory: formData.subcategory,
        ...formData 
      })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Product added successfully!')
      router.push('/business/dashboard')
      
    } catch (err) {
      console.error('Error adding product:', err)
      toast.error('Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/business/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Add New Product</h1>
            <p className="text-muted-foreground mt-2">
              Create a new product or service to offer in your marketplace
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Product Type *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory *</Label>
                  <Select 
                    value={formData.subcategory} 
                    onValueChange={(value) => handleInputChange('subcategory', value)}
                    disabled={!formData.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.category ? "Select subcategory" : "Select product type first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getSubcategories().map((subcategory) => (
                        <SelectItem key={subcategory.value} value={subcategory.value}>
                          {subcategory.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {productStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product or service..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Provide a clear and detailed description to help customers understand your offering.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding Product...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Add Product
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
