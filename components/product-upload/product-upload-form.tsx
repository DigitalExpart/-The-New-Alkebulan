"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ImageUpload } from "./image-upload"
import { FileUpload } from "./file-upload"
import { TagInput } from "./tag-input"
import { ProgressIndicator } from "./progress-indicator"
import { productCategories } from "@/data/product-categories"
import type { ProductUploadData, UploadProgress } from "@/types/product-upload"
import { Upload, DollarSign, Package, Truck, Tag, FileText, Eye, Save } from "lucide-react"

interface ProductUploadFormProps {
  onSubmit?: (data: ProductUploadData) => void
}

export function ProductUploadForm({ onSubmit }: ProductUploadFormProps) {
  const [formData, setFormData] = useState<ProductUploadData>({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    images: [],
    price: 0,
    discountPrice: undefined,
    inventoryCount: 1,
    shippingOption: "local",
    customShippingCost: undefined,
    deliveryTimeEstimate: "",
    tags: [],
    condition: "new",
    attachments: [],
    isDraft: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectedCategory = productCategories.find((cat) => cat.id === formData.category)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Product title is required"
    if (!formData.description.trim()) newErrors.description = "Product description is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.subcategory) newErrors.subcategory = "Subcategory is required"
    if (formData.images.length === 0) newErrors.images = "At least one product image is required"
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0"
    if (formData.discountPrice && formData.discountPrice >= formData.price) {
      newErrors.discountPrice = "Discount price must be less than regular price"
    }
    if (formData.inventoryCount < 0) newErrors.inventoryCount = "Inventory count cannot be negative"
    if (!formData.deliveryTimeEstimate.trim()) newErrors.deliveryTimeEstimate = "Delivery estimate is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const simulateUpload = async (): Promise<void> => {
    const steps = [
      "Validating product information...",
      "Processing and optimizing images...",
      "Uploading files to server...",
      "Creating product listing...",
      "Finalizing submission...",
    ]

    for (let i = 0; i < steps.length; i++) {
      setUploadProgress({
        step: i,
        totalSteps: steps.length,
        message: steps[i],
        isComplete: false,
      })
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    setUploadProgress({
      step: steps.length,
      totalSteps: steps.length,
      message: "Upload completed successfully!",
      isComplete: true,
    })
  }

  const handleSubmit = async (isDraft = false) => {
    if (!validateForm() && !isDraft) return

    setIsSubmitting(true)
    const submitData = { ...formData, isDraft }

    try {
      await simulateUpload()
      onSubmit?.(submitData)

      // Reset form after successful submission
      if (!isDraft) {
        setTimeout(() => {
          setUploadProgress(null)
          setFormData({
            title: "",
            description: "",
            category: "",
            subcategory: "",
            images: [],
            price: 0,
            discountPrice: undefined,
            inventoryCount: 1,
            shippingOption: "local",
            customShippingCost: undefined,
            deliveryTimeEstimate: "",
            tags: [],
            condition: "new",
            attachments: [],
            isDraft: false,
          })
        }, 3000)
      }
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (uploadProgress) {
    return <ProgressIndicator progress={uploadProgress} />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6 text-green-600" />
            Add New Product
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a clear, descriptive product title..."
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: value,
                      subcategory: "",
                    }))
                  }
                >
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory *</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, subcategory: value }))}
                  disabled={!selectedCategory}
                >
                  <SelectTrigger className={errors.subcategory ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategory?.subcategories.map((subcategory) => (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subcategory && <p className="text-sm text-red-500">{errors.subcategory}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Product Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Provide a detailed description of your product..."
                rows={6}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>
          </div>

          <Separator />

          {/* Product Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Product Images *
            </h3>
            <ImageUpload
              images={formData.images}
              onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))}
              maxImages={10}
            />
            {errors.images && <p className="text-sm text-red-500">{errors.images}</p>}
          </div>

          <Separator />

          {/* Pricing & Inventory */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing & Inventory
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPrice">Discount Price ($)</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discountPrice || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discountPrice: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                    }))
                  }
                  placeholder="Optional sale price"
                  className={errors.discountPrice ? "border-red-500" : ""}
                />
                {errors.discountPrice && <p className="text-sm text-red-500">{errors.discountPrice}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="inventoryCount">Stock Quantity</Label>
                <Input
                  id="inventoryCount"
                  type="number"
                  min="0"
                  value={formData.inventoryCount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, inventoryCount: Number.parseInt(e.target.value) || 0 }))
                  }
                  placeholder="Available quantity"
                  className={errors.inventoryCount ? "border-red-500" : ""}
                />
                {errors.inventoryCount && <p className="text-sm text-red-500">{errors.inventoryCount}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={(value: "new" | "used" | "refurbished") =>
                  setFormData((prev) => ({ ...prev, condition: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="refurbished">Refurbished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Shipping & Delivery */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping & Delivery
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="shippingOption">Shipping Option</Label>
                <Select
                  value={formData.shippingOption}
                  onValueChange={(value: "local" | "international" | "free" | "custom") =>
                    setFormData((prev) => ({ ...prev, shippingOption: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local Shipping</SelectItem>
                    <SelectItem value="international">International Shipping</SelectItem>
                    <SelectItem value="free">Free Shipping</SelectItem>
                    <SelectItem value="custom">Custom Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.shippingOption === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="customShippingCost">Custom Shipping Cost ($)</Label>
                  <Input
                    id="customShippingCost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.customShippingCost || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customShippingCost: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="deliveryTimeEstimate">Delivery Time Estimate *</Label>
                <Input
                  id="deliveryTimeEstimate"
                  value={formData.deliveryTimeEstimate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deliveryTimeEstimate: e.target.value }))}
                  placeholder="e.g., 2-4 business days, Instant download"
                  className={errors.deliveryTimeEstimate ? "border-red-500" : ""}
                />
                {errors.deliveryTimeEstimate && <p className="text-sm text-red-500">{errors.deliveryTimeEstimate}</p>}
              </div>
            </div>
          </div>

          <Separator />

          {/* Tags & Keywords */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags & Keywords
            </h3>
            <TagInput
              tags={formData.tags}
              onTagsChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
              placeholder="Add relevant tags to help customers find your product..."
              maxTags={15}
            />
          </div>

          <Separator />

          {/* File Attachments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Additional Files
            </h3>
            <FileUpload
              files={formData.attachments}
              onFilesChange={(files) => setFormData((prev) => ({ ...prev, attachments: files }))}
              maxFiles={5}
              title="Upload Supporting Documents"
              description="Add manuals, certificates, warranties, or other relevant files"
            />
          </div>

          <Separator />

          {/* Publish Options */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="isDraft">Save as Draft</Label>
                <p className="text-sm text-gray-500">Save your progress without publishing to the marketplace</p>
              </div>
              <Switch
                id="isDraft"
                checked={formData.isDraft}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isDraft: checked }))}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                {formData.isDraft ? "Submit for Review" : "Publish Now"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
