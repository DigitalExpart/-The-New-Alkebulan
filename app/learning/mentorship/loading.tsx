import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MentorshipLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <Skeleton className="h-10 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[600px] mx-auto mb-8" />

            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              ))}
            </div>

            {/* Search Bar Skeleton */}
            <Skeleton className="h-12 max-w-2xl mx-auto" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar Skeleton */}
          <div className="hidden lg:block">
            <Card className="w-80">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area Skeleton */}
          <div className="flex-1">
            {/* Results Header Skeleton */}
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-24 lg:hidden" />
            </div>

            {/* Mentors Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />

                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <Skeleton key={j} className="h-6 w-20" />
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>

                    <Skeleton className="h-16 w-full" />

                    <div className="flex gap-2">
                      <Skeleton className="h-10 flex-1" />
                      <Skeleton className="h-10 flex-1" />
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
