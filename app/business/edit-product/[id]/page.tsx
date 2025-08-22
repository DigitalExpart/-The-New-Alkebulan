"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, X, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

interface ProductFormData {
  name: string
  sku: string
  category: string
  subcategory: string
  actualPrice: number
  salesPrice: number
  description: string
  additionalDescription: string
  status: string
  hasVariants: boolean
  variants: {
    colors: string[]
    sizes: string[]
    numbers: string[]
    weights: number[]
  }
  inventory: number
  images: File[]
  videos: File[]
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

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    category: "",
    subcategory: "",
    actualPrice: 0,
    salesPrice: 0,
    description: "",
    additionalDescription: "",
    status: "draft",
    hasVariants: false,
    variants: {
      colors: [],
      sizes: [],
      numbers: [],
      weights: [],
    },
    inventory: 1,
    images: [],
    videos: [],
  })

  const productId = params.id as string

  useEffect(() => {
    if (productId && user) {
      fetchProduct()
    }
  }, [productId, user])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      
      const { data: productData, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('user_id', user.id)
        .single()
      
      if (error) {
        console.error('Error fetching product:', error)
        toast.error('Failed to fetch product')
        router.push('/business/dashboard')
        return
      }
      
      if (!productData) {
        toast.error('Product not found')
        router.push('/business/dashboard')
        return
      }
      
      setProduct(productData)
      
      // Map database fields to form fields
      setFormData({
        name: productData.name || "",
        sku: productData.sku || "",
        category: productData.category === 'Physical Products' ? 'physical' : 'digital',
        subcategory: productData.subcategory || "",
        actualPrice: productData.actual_price || 0,
        salesPrice: productData.sales_price || 0,
        description: productData.description || "",
        additionalDescription: productData.additional_description || "",
        status: productData.status || "draft",
        hasVariants: productData.has_variants || false,
        variants: {
          colors: [],
          sizes: [],
          numbers: [],
          weights: [],
        },
        inventory: productData.inventory || 1,
        images: [],
        videos: [],
      })
      
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to fetch product')
      router.push('/business/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProductFormData, value: string | number | boolean) => {
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
      toast.error("You must be signed in to edit a product")
      return
    }

    if (!formData.name || !formData.category || !formData.subcategory || !formData.description) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setSaving(true)
      
      const supabase = getSupabaseClient()
      
      // Update the product
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          additional_description: formData.additionalDescription,
          category: formData.category === 'physical' ? 'Physical Products' : 'Digital Products',
          subcategory: formData.subcategory,
          actual_price: formData.actualPrice,
          sales_price: formData.salesPrice || formData.actualPrice,
          status: formData.status,
          inventory: formData.inventory,
          has_variants: formData.hasVariants,
          sku: formData.sku || null,
        })
        .eq('id', productId)
        .eq('user_id', user.id)
      
      if (updateError) {
        console.error('Error updating product:', updateError)
        toast.error(`Failed to update product: ${updateError.message}`)
        return
      }
      
      toast.success('Product updated successfully!')
      router.push('/business/dashboard')
      
    } catch (err) {
      console.error('Error updating product:', err)
      toast.error('Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/business/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/business/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
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
            <h1 className="text-3xl font-bold">Edit Product</h1>
            <p className="text-muted-foreground mt-2">
              Update your product information
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-primary" />
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
                  <Label htmlFor="sku">SKU (Optional)</Label>
                  <Input
                    id="sku"
                    placeholder="Enter product SKU (optional)"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Stock Keeping Unit for inventory management
                  </p>
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
                  <Label htmlFor="actualPrice">Actual Price *</Label>
                  <Input
                    id="actualPrice"
                    type="number"
                    placeholder="0.00"
                    value={formData.actualPrice || ''}
                    onChange={(e) => handleInputChange('actualPrice', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salesPrice">Sales Price</Label>
                  <Input
                    id="salesPrice"
                    type="number"
                    placeholder="0.00"
                    value={formData.salesPrice || ''}
                    onChange={(e) => handleInputChange('salesPrice', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                  {formData.salesPrice > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formData.actualPrice > 0 ? 
                        `Save ${((formData.actualPrice - formData.salesPrice) / formData.actualPrice * 100).toFixed(0)}%` : 
                        'Enter actual price first'
                      }
                    </p>
                  )}
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

                <div className="space-y-2">
                  <Label htmlFor="inventory">Available Quantity (Optional)</Label>
                  <Input
                    id="inventory"
                    type="number"
                    placeholder="1"
                    value={formData.inventory || ''}
                    onChange={(e) => handleInputChange('inventory', parseInt(e.target.value) || 1)}
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of products available for purchase (leave empty if unlimited)
                  </p>
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

              {/* Additional Description */}
              <div className="space-y-2">
                <Label htmlFor="additionalDescription">Additional Description</Label>
                <Textarea
                  id="additionalDescription"
                  placeholder="Add any additional details, specifications, or features..."
                  value={formData.additionalDescription}
                  onChange={(e) => handleInputChange('additionalDescription', e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Include technical specs, care instructions, or other relevant details.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Updating Product...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Product
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
