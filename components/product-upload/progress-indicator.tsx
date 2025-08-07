"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle } from "lucide-react"
import type { UploadProgress } from "@/types/product-upload"

interface ProgressIndicatorProps {
  progress: UploadProgress
  onClose?: () => void
}

export function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  const progressPercentage = (progress.step / progress.totalSteps) * 100

  const steps = [
    "Validating product information",
    "Processing images",
    "Uploading files",
    "Creating product listing",
    "Finalizing submission",
  ]

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          {progress.isComplete ? (
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          ) : (
            <Circle className="h-12 w-12 text-blue-500 mx-auto mb-3 animate-spin" />
          )}
          <h3 className="text-lg font-semibold mb-2">
            {progress.isComplete ? "Upload Complete!" : "Uploading Product..."}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{progress.message}</p>
        </div>

        <div className="space-y-4">
          <Progress value={progressPercentage} className="w-full" />

          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                {index < progress.step ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : index === progress.step ? (
                  <Circle className="h-4 w-4 text-blue-500 animate-spin" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-300" />
                )}
                <span className={index <= progress.step ? "text-foreground" : "text-gray-500"}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {progress.isComplete && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              <p className="font-medium">Product uploaded successfully!</p>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Your product is now live on the marketplace.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
