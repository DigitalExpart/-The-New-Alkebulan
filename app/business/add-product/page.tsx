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

export default function AddProductPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
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

  const handleFileUpload = (field: 'images' | 'videos', files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files)
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], ...fileArray]
      }))
    }
  }

  const removeFile = (field: 'images' | 'videos', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleVariantChange = (field: keyof typeof formData.variants, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      variants: {
        ...prev.variants,
        [field]: value
      }
    }))
  }

  const toggleVariants = () => {
    setFormData(prev => ({
      ...prev,
      hasVariants: !prev.hasVariants
    }))
  }

  const addVariantOption = (type: keyof typeof formData.variants, value: string | number) => {
    if (value && value.toString().trim()) {
      setFormData(prev => ({
        ...prev,
        variants: {
          ...prev.variants,
          [type]: [...prev.variants[type], value]
        }
      }))
    }
  }

  const removeVariantOption = (type: keyof typeof formData.variants, index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: {
        ...prev.variants,
        [type]: prev.variants[type].filter((_, i) => i !== index)
      }
    }))
  }

  const [newVariantInputs, setNewVariantInputs] = useState({
    color: "",
    size: "",
    number: "",
    weight: ""
  })

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

    if (formData.inventory < 0) {
      toast.error("Inventory cannot be negative")
      return
    }

    // Set default inventory to 1 if not specified
    if (!formData.inventory || formData.inventory === 0) {
      setFormData(prev => ({ ...prev, inventory: 1 }))
    }

    if (formData.actualPrice < 0 || formData.salesPrice < 0) {
      toast.error("Prices cannot be negative")
      return
    }

    if (formData.salesPrice > formData.actualPrice) {
      toast.error("Sales price cannot be higher than actual price")
      return
    }

    try {
      setLoading(true)
      
      const supabase = getSupabaseClient()
      
      console.log('Adding product:', { 
        userId: user.id, 
        category: formData.category,
        subcategory: formData.subcategory,
        ...formData 
      })
      
      // Insert the product into the database
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
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
          user_id: user.id
        })
        .select()
        .single()
      
      if (productError) {
        console.error('Error inserting product:', productError)
        toast.error(`Failed to add product: ${productError.message}`)
        return
      }
      
      console.log('Product inserted successfully:', productData)
      
      // Handle image uploads if any
      if (formData.images.length > 0) {
        for (const image of formData.images) {
          const fileName = `products/${productData.id}/images/${Date.now()}_${image.name}`
          
          const { error: uploadError } = await supabase.storage
            .from('product-media')
            .upload(fileName, image)
          
          if (uploadError) {
            console.error('Error uploading image:', uploadError)
            toast.error(`Failed to upload image: ${uploadError.message}`)
          } else {
            // Insert image record with correct column names
            await supabase
              .from('product_images')
              .insert({
                product_id: productData.id,
                image_url: fileName, // Changed from file_path to image_url
                image_name: image.name, // Changed from file_name to image_name
                image_size: image.size, // Changed from file_size to image_size
                image_type: image.type, // Changed from file_type to image_type
                is_primary: false, // Default to false
                sort_order: 0 // Default sort order
              })
          }
        }
      }
      
      // Handle video uploads if any
      if (formData.videos.length > 0) {
        for (const video of formData.videos) {
          const fileName = `products/${productData.id}/videos/${Date.now()}_${video.name}`
          
          const { error: uploadError } = await supabase.storage
            .from('product-media')
            .upload(fileName, video)
          
          if (uploadError) {
            console.error('Error uploading video:', uploadError)
            toast.error(`Failed to upload video: ${uploadError.message}`)
          } else {
            // Insert video record with correct column names
            await supabase
              .from('product_videos')
              .insert({
                product_id: productData.id,
                file_path: fileName,
                file_name: video.name,
                file_size: video.size,
                file_type: video.type
              })
          }
        }
      }
      
      // Handle variants if any
      if (formData.hasVariants && Object.values(formData.variants).some(arr => arr.length > 0)) {
        const variantData = {
          product_id: productData.id,
          colors: formData.variants.colors,
          sizes: formData.variants.sizes,
          numbers: formData.variants.numbers,
          weights: formData.variants.weights
        }
        
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantData)
        
        if (variantError) {
          console.error('Error inserting variants:', variantError)
          toast.error(`Failed to add variants: ${variantError.message}`)
        }
      }
      
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

              {/* Product Variants */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasVariants"
                    checked={formData.hasVariants}
                    onChange={toggleVariants}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="hasVariants" className="font-medium">
                    This product has variants (color, size, etc.)
                  </Label>
                </div>

                {formData.hasVariants && (
                  <div className="space-y-6 p-4 bg-muted rounded-lg">
                    {/* Colors */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Colors</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a color (e.g., Red)"
                          value={newVariantInputs.color}
                          onChange={(e) => setNewVariantInputs(prev => ({ ...prev, color: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addVariantOption('colors', newVariantInputs.color)
                              setNewVariantInputs(prev => ({ ...prev, color: '' }))
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            addVariantOption('colors', newVariantInputs.color)
                            setNewVariantInputs(prev => ({ ...prev, color: '' }))
                          }}
                          disabled={!newVariantInputs.color.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      
                      {formData.variants.colors.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.variants.colors.map((color, index) => (
                            <div key={index} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border">
                              <span className="text-sm">{color}</span>
                              <button
                                type="button"
                                onClick={() => removeVariantOption('colors', index)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sizes */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Sizes</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a size (e.g., S, M, L)"
                          value={newVariantInputs.size}
                          onChange={(e) => setNewVariantInputs(prev => ({ ...prev, size: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addVariantOption('sizes', newVariantInputs.size)
                              setNewVariantInputs(prev => ({ ...prev, size: '' }))
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            addVariantOption('sizes', newVariantInputs.size)
                            setNewVariantInputs(prev => ({ ...prev, size: '' }))
                          }}
                          disabled={!newVariantInputs.size.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      
                      {formData.variants.sizes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.variants.sizes.map((size, index) => (
                            <div key={index} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border">
                              <span className="text-sm">{size}</span>
                              <button
                                type="button"
                                onClick={() => removeVariantOption('sizes', index)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Numbers/Models */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Numbers/Models</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a model number (e.g., Model #123)"
                          value={newVariantInputs.number}
                          onChange={(e) => setNewVariantInputs(prev => ({ ...prev, number: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addVariantOption('numbers', newVariantInputs.number)
                              setNewVariantInputs(prev => ({ ...prev, number: '' }))
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            addVariantOption('numbers', newVariantInputs.number)
                            setNewVariantInputs(prev => ({ ...prev, number: '' }))
                          }}
                          disabled={!newVariantInputs.number.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      
                      {formData.variants.numbers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.variants.numbers.map((number, index) => (
                            <div key={index} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border">
                              <span className="text-sm">{number}</span>
                              <button
                                type="button"
                                onClick={() => removeVariantOption('numbers', index)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Weights */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Weights (kg)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Add a weight (e.g., 0.5)"
                          value={newVariantInputs.weight}
                          onChange={(e) => setNewVariantInputs(prev => ({ ...prev, weight: e.target.value }))}
                          min="0"
                          step="0.01"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              const weight = parseFloat(newVariantInputs.weight)
                              if (weight > 0) {
                                addVariantOption('weights', weight)
                                setNewVariantInputs(prev => ({ ...prev, weight: '' }))
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            const weight = parseFloat(newVariantInputs.weight)
                            if (weight > 0) {
                              addVariantOption('weights', weight)
                              setNewVariantInputs(prev => ({ ...prev, weight: '' }))
                            }
                          }}
                          disabled={!newVariantInputs.weight || parseFloat(newVariantInputs.weight) <= 0}
                        >
                          Add
                        </Button>
                      </div>
                      
                      {formData.variants.weights.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.variants.weights.map((weight, index) => (
                            <div key={index} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border">
                              <span className="text-sm">{weight} kg</span>
                              <button
                                type="button"
                                onClick={() => removeVariantOption('weights', index)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Variant Summary */}
                    {Object.values(formData.variants).some(arr => arr.length > 0) && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Total variant combinations: {
                            (formData.variants.colors.length || 1) *
                            (formData.variants.sizes.length || 1) *
                            (formData.variants.numbers.length || 1) *
                            (formData.variants.weights.length || 1)
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Media Uploads */}
              <div className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Product Images</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload('images', e.target.files)}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Upload Images</p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formData.images.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile('images', index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video Upload */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Product Videos</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={(e) => handleFileUpload('videos', e.target.files)}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Upload Videos</p>
                          <p className="text-xs text-gray-500">MP4, MOV up to 100MB each</p>
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  {formData.videos.length > 0 && (
                    <div className="space-y-2">
                      {formData.videos.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('videos', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
