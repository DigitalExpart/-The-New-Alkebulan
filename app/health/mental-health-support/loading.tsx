import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MentalHealthSupportLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Skeleton className="w-14 h-14 rounded-full" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gradient-to-br from-blue-100 to-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Skeleton className="w-6 h-6 mx-auto mb-2" />
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />

          {/* Filters Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>

          {/* Professional Cards Skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-gradient-to-br from-blue-50 via-white to-green-50 border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </div>
                    <Skeleton className="w-8 h-8" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <div className="flex flex-wrap gap-1">
                      <Skeleton className="h-5 w-14" />
                      <Skeleton className="h-5 w-18" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
