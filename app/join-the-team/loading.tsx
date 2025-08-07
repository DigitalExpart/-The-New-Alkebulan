import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function JoinTheTeamLoading() {
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section Skeleton */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Skeleton className="h-16 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
          <Skeleton className="h-6 w-2/3 max-w-xl mx-auto" />
        </div>
      </section>

      {/* Why Join Us Section Skeleton */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-card border-border p-6">
                <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section Skeleton */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-48 mx-auto mb-4" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar Skeleton */}
            <div className="lg:w-80 flex-shrink-0">
              <Card className="bg-card border-border">
                <CardHeader>
                  <Skeleton className="h-6 w-20" />
                </CardHeader>
                <CardContent className="space-y-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-5 w-24" />
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <div key={j} className="flex items-center space-x-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Roles Grid Skeleton */}
            <div className="flex-1">
              <div className="mb-8">
                <div className="flex flex-wrap gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-20" />
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Card key={i} className="bg-card border-border h-full">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Skeleton className="h-5 w-32 mb-2" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                      <div>
                        <Skeleton className="h-5 w-28 mb-2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <div>
                        <Skeleton className="h-5 w-20 mb-2" />
                        <div className="flex flex-wrap gap-1">
                          {Array.from({ length: 4 }).map((_, j) => (
                            <Skeleton key={j} className="h-6 w-16" />
                          ))}
                        </div>
                      </div>
                      <Skeleton className="h-9 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
