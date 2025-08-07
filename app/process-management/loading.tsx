import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProcessManagementLoading() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Insights Skeleton */}
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4 mb-3" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-10 w-full" />
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-20" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Skeleton className="h-10 w-96" />
                </div>
                <div className="border rounded-lg">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50">
                    <Skeleton className="col-span-3 h-4" />
                    <Skeleton className="col-span-1 h-4" />
                    <Skeleton className="col-span-1 h-4" />
                    <Skeleton className="col-span-2 h-4" />
                    <Skeleton className="col-span-1 h-4" />
                    <Skeleton className="col-span-1 h-4" />
                    <Skeleton className="col-span-2 h-4" />
                    <Skeleton className="col-span-1 h-4" />
                  </div>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 p-4 border-b">
                      <div className="col-span-3">
                        <Skeleton className="h-4 w-full mb-2" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </div>
                      <Skeleton className="col-span-1 h-4" />
                      <Skeleton className="col-span-1 h-5 w-16" />
                      <div className="col-span-2 flex items-center gap-2">
                        <Skeleton className="w-6 h-6 rounded-full" />
                        <Skeleton className="w-6 h-6 rounded-full" />
                      </div>
                      <Skeleton className="col-span-1 h-4" />
                      <Skeleton className="col-span-1 h-4" />
                      <div className="col-span-2">
                        <Skeleton className="h-2 w-full mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="col-span-1 h-8 w-8" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
