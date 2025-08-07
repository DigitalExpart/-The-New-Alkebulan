export interface ProductUploadData {
  title: string
  description: string
  category: string
  subcategory: string
  images: File[]
  price: number
  discountPrice?: number
  inventoryCount: number
  shippingOption: "local" | "international" | "free" | "custom"
  customShippingCost?: number
  deliveryTimeEstimate: string
  tags: string[]
  condition: "new" | "used" | "refurbished"
  attachments: File[]
  isDraft: boolean
}

export interface ProductCategory {
  id: string
  name: string
  subcategories: string[]
}

export interface UploadProgress {
  step: number
  totalSteps: number
  message: string
  isComplete: boolean
}
