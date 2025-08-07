import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function LongTermPlanningLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Skeleton className="h-10 w-80 mb-2" />
              <Skeleton className="h-6 w-96" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-8 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Filters Skeleton */}
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 flex-1 max-w-md" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-12" />
                          </div>
                          <Skeleton className="h-6 w-48 mb-1" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-8" />
                          </div>
                          <Skeleton className="h-2 w-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4" />
                            <div>
                              <Skeleton className="h-3 w-16 mb-1" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4" />
                            <div>
                              <Skeleton className="h-3 w-16 mb-1" />
                              <Skeleton className="h-4 w-12" />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-12" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="border-l-4">
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <Skeleton className="h-4 w-4" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-4 w-12" />
                              </div>
                              <Skeleton className="h-4 w-full mb-1" />
                              <Skeleton className="h-3 w-3/4" />
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
