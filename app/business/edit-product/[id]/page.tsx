"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, X, Loader2, Upload, Image, Video, FileText } from "lucide-react"
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
  documents: File[]
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
    documents: [],
  })

  const productId = params?.id as string

  // Media upload handlers
  const handleFileUpload = (field: 'images' | 'videos' | 'documents', files: FileList | null) => {
    if (!files) return
    
    const fileArray = Array.from(files)
    const maxSizes = {
      images: 10 * 1024 * 1024, // 10MB
      videos: 100 * 1024 * 1024, // 100MB
      documents: 25 * 1024 * 1024 // 25MB
    }
    
    // Validate file sizes
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSizes[field]) {
        toast.error(`${file.name} is too large. Maximum size for ${field} is ${maxSizes[field] / (1024 * 1024)}MB`)
        return false
      }
      return true
    })
    
    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], ...validFiles]
      }))
      toast.success(`Added ${validFiles.length} ${field}`)
    }
  }

  const removeFile = (field: 'images' | 'videos' | 'documents', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

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
        .eq('user_id', user?.id)
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
        documents: [],
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
    if (field === 'category') {
      // Reset subcategory when category changes
      setFormData(prev => ({
        ...prev,
        category: value as string,
        subcategory: ""
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
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
      
      // Upload new media files if any
      if (formData.images && formData.images.length > 0) {
        console.log('📸 Uploading product images...')
        for (const image of formData.images) {
          try {
            const fileName = `products/${productId}/images/${Date.now()}_${image.name}`
            
            const { error: uploadError } = await supabase.storage
              .from('post-media') // Use existing post-media bucket temporarily
              .upload(fileName, image)
            
            if (uploadError) {
              console.error('Error uploading image:', uploadError)
              toast.error(`Failed to upload image: ${uploadError.message}`)
            } else {
              // Insert image record
              await supabase
                .from('product_images')
                .insert({
                  product_id: productId,
                  image_url: fileName,
                  image_name: image.name,
                  image_size: image.size,
                  image_type: image.type,
                  is_primary: formData.images.indexOf(image) === 0, // First image is primary
                  sort_order: formData.images.indexOf(image),
                  alt_text: `${formData.name} - Image ${formData.images.indexOf(image) + 1}`
                })
            }
          } catch (error) {
            console.error('Error processing image:', error)
          }
        }
      }
      
      // Upload videos if any
      if (formData.videos && formData.videos.length > 0) {
        console.log('🎥 Uploading product videos...')
        for (const video of formData.videos) {
          try {
            const fileName = `products/${productId}/videos/${Date.now()}_${video.name}`
            
            const { error: uploadError } = await supabase.storage
              .from('post-media') // Use existing post-media bucket temporarily
              .upload(fileName, video)
            
            if (uploadError) {
              console.error('Error uploading video:', uploadError)
              toast.error(`Failed to upload video: ${uploadError.message}`)
            } else {
              // Insert video record
              await supabase
                .from('product_videos')
                .insert({
                  product_id: productId,
                  video_url: fileName,
                  video_name: video.name,
                  video_size: video.size,
                  video_type: video.type,
                  sort_order: formData.videos.indexOf(video),
                  description: `${formData.name} - Video ${formData.videos.indexOf(video) + 1}`
                })
              console.log('✅ Video uploaded and recorded successfully:', fileName)
            }
          } catch (error) {
            console.error('Error processing video:', error)
          }
        }
      }
      
      // Upload documents if any
      if (formData.documents && formData.documents.length > 0) {
        console.log('📄 Uploading product documents...')
        for (const doc of formData.documents) {
          try {
            const fileName = `products/${productId}/documents/${Date.now()}_${doc.name}`
            
            const { error: uploadError } = await supabase.storage
              .from('post-media') // Use existing post-media bucket temporarily
              .upload(fileName, doc)
            
            if (uploadError) {
              console.error('Error uploading document:', uploadError)
              toast.error(`Failed to upload document: ${uploadError.message}`)
            } else {
              // Insert document record
              await supabase
                .from('product_documents')
                .insert({
                  product_id: productId,
                  document_url: fileName,
                  document_name: doc.name,
                  document_size: doc.size,
                  document_type: doc.type,
                  document_category: 'general', // Can be enhanced with specific categories
                  sort_order: formData.documents.indexOf(doc),
                  description: `${formData.name} - Document ${formData.documents.indexOf(doc) + 1}`,
                  is_public: true
                })
              console.log('✅ Document uploaded and recorded successfully:', fileName)
            }
          } catch (error) {
            console.error('Error processing document:', error)
          }
        }
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

              {/* Media Upload Section */}
              <div className="space-y-6 pt-6 border-t">
                <h3 className="text-lg font-semibold">Product Media</h3>
                
                {/* Image Upload */}
                <div className="space-y-3">
                  <Label>Product Images</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload('images', e.target.files)}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="text-center">
                        <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                          📸
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-primary">Click to upload images</span> or drag and drop
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, GIF up to 10MB each
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  {/* Display selected images */}
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile('images', index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg">
                            {image.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video Upload */}
                <div className="space-y-3">
                  <Label>Product Videos</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={(e) => handleFileUpload('videos', e.target.files)}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <div className="text-center">
                        <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                          🎥
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-primary">Click to upload videos</span> or drag and drop
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          MP4, WebM, MOV up to 100MB each
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  {/* Display selected videos */}
                  {formData.videos && formData.videos.length > 0 && (
                    <div className="space-y-2">
                      {formData.videos.map((video, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                              🎥
                            </div>
                            <div>
                              <div className="text-sm font-medium">{video.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {(video.size / (1024 * 1024)).toFixed(1)} MB
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('videos', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Document Upload */}
                <div className="space-y-3">
                  <Label>Product Documents</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
                      onChange={(e) => handleFileUpload('documents', e.target.files)}
                      className="hidden"
                      id="document-upload"
                    />
                    <label htmlFor="document-upload" className="cursor-pointer">
                      <div className="text-center">
                        <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                          📄
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-primary">Click to upload documents</span> or drag and drop
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          PDF, DOC, XLS, PPT up to 25MB each
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  {/* Display selected documents */}
                  {formData.documents && formData.documents.length > 0 && (
                    <div className="space-y-2">
                      {formData.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                              📄
                            </div>
                            <div>
                              <div className="text-sm font-medium">{doc.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {(doc.size / (1024 * 1024)).toFixed(1)} MB • {doc.type}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('documents', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
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
