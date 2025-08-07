"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"

interface ProductImageGalleryProps {
  images: string[]
  productTitle: string
}

export function ProductImageGallery({ images, productTitle }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
        <img
          src={images[selectedImage] || "/placeholder.svg"}
          alt={`${productTitle} - Image ${selectedImage + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Zoom Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" size="icon" className="absolute top-2 right-2">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <div className="relative aspect-square">
              <img
                src={images[selectedImage] || "/placeholder.svg"}
                alt={`${productTitle} - Full size`}
                className="w-full h-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                selectedImage === index ? "border-primary" : "border-muted hover:border-muted-foreground"
              }`}
            >
              <img
                src={image || "/placeholder.svg"}
                alt={`${productTitle} - Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
