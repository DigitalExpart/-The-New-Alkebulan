import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CompaniesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-full max-w-3xl mx-auto mb-8" />

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <Skeleton className="w-6 h-6 mx-auto mb-2" />
                  <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Support Message Skeleton */}
        <div className="bg-gray-100 rounded-lg p-6 mb-8">
          <Skeleton className="h-6 w-64 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Main Content */}
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar Skeleton */}
          <div className="lg:col-span-1 mb-8 lg:mb-0">
            <div className="hidden lg:block">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-20 mb-4" />
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i}>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile filter button skeleton */}
            <div className="lg:hidden flex justify-between items-center mb-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>

          {/* Companies Grid Skeleton */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  {/* Cover Image Skeleton */}
                  <Skeleton className="h-48 w-full" />

                  <CardContent className="p-6">
                    {/* Company Header Skeleton */}
                    <div className="flex items-start gap-4 mb-4">
                      <Skeleton className="w-16 h-16 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>

                    {/* Description Skeleton */}
                    <div className="space-y-2 mb-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>

                    {/* Badges Skeleton */}
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-14" />
                    </div>

                    {/* Tags Skeleton */}
                    <div className="flex gap-1 mb-4">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-10" />
                    </div>

                    {/* Actions Skeleton */}
                    <div className="flex gap-2">
                      <Skeleton className="h-9 flex-1" />
                      <Skeleton className="h-9 w-9" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
