import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductUploadLoading() {
  return (
    <div className="min-h-screen bg-green-50 dark:bg-green-950">
      <div className="bg-white dark:bg-green-900 border-b border-green-200 dark:border-green-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-6 w-96" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-32 w-full" />
              </div>

              {/* Images */}
              <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-48 w-full" />
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
