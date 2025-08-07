import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AddFundsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Skeleton className="h-9 w-32" />
        </div>

        <div className="text-center mb-8">
          <Skeleton className="h-9 w-48 mx-auto mb-2" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form Skeleton */}
        <div className="lg:col-span-2">
          <Card className="w-full max-w-md mx-auto shadow-lg">
            <CardHeader className="text-center space-y-2">
              <Skeleton className="w-12 h-12 rounded-full mx-auto" />
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-5 w-80 mx-auto" />
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Current Balance Skeleton */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Skeleton className="h-4 w-24 mx-auto mb-2" />
                <Skeleton className="h-8 w-32 mx-auto" />
              </div>

              {/* Form Fields Skeletons */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-20" />
                  </div>
                </div>

                <div className="w-full h-px bg-gray-200" />

                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-48" />
                </div>

                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Skeletons */}
        <div className="space-y-6">
          {/* Security Features Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment Methods Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-3 w-40" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Important Information Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start space-x-2">
                  <Skeleton className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
