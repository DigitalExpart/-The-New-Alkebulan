"use client"

import { ProductUploadForm } from "@/components/product-upload/product-upload-form"
import type { ProductUploadData } from "@/types/product-upload"
import { Upload } from "lucide-react"

export default function ProductUploadPage() {
  const handleProductSubmit = (data: ProductUploadData) => {
    console.log("Product submitted:", data)
    // Here you would typically send the data to your backend API
    // For now, we'll just log it to the console

    if (data.isDraft) {
      console.log("Product saved as draft")
    } else {
      console.log("Product published to marketplace")
    }
  }

  return (
    <div className="min-h-screen bg-green-50 dark:bg-green-950">
      <div className="bg-white dark:bg-green-900 border-b border-green-200 dark:border-green-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="h-8 w-8 text-green-600" />
            <h1 className="font-agrandir-bold text-3xl text-green-900 dark:text-white">Upload Product</h1>
          </div>
          <p className="text-green-700 dark:text-green-300 text-lg max-w-3xl">
            Share your products with the diaspora community. Upload digital goods, physical products, services, and more
            to reach customers worldwide.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <ProductUploadForm onSubmit={handleProductSubmit} />
      </div>
    </div>
  )
}
