import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Target, Sparkles, TrendingUp } from "lucide-react"

export default function DailyPlannerLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-8 h-8 text-blue-600" />
                <Skeleton className="h-8 w-48" />
              </div>
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="text-right">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>

          {/* Daily Quote Skeleton */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="w-5 h-5 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <div className="flex items-center gap-2 mt-2">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Target, label: "Habits" },
            { icon: Sparkles, label: "Goals" },
            { icon: Calendar, label: "Schedule" },
            { icon: TrendingUp, label: "Overall" },
          ].map((item, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-3 w-12 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <item.icon className="w-8 h-8 text-gray-300" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="w-full">
          <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
            {["Overview", "Agenda", "Habits", "Goals", "Mood", "Reflection"].map((tab) => (
              <Skeleton key={tab} className="h-10 flex-1" />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Goals Card Skeleton */}
              <Card className="h-96">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Skeleton className="w-4 h-4 mt-1" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-20 mb-1" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-16 ml-4" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Habits Card Skeleton */}
              <Card className="h-96">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Skeleton className="w-8 h-8" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <Skeleton className="h-3 w-20" />
                              <Skeleton className="h-3 w-16" />
                              <Skeleton className="h-3 w-12" />
                            </div>
                          </div>
                        </div>
                        <Skeleton className="h-8 w-20 ml-4" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Agenda Card Skeleton */}
              <Card className="h-96">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                    <div className="flex space-x-1">
                      <Skeleton className="h-8 w-12" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 rounded-lg border-l-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <Skeleton className="h-4 w-full mb-1" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                        <Skeleton className="h-8 w-8 ml-4" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Routine Selector Skeleton */}
              <Card className="h-96">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-1 mb-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                  </div>
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-4 rounded-lg border">
                        <div className="flex items-start gap-3">
                          <Skeleton className="w-8 h-8" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                            <Skeleton className="h-3 w-full mb-3" />
                            <div className="space-y-2">
                              <Skeleton className="h-3 w-3/4" />
                              <div className="flex flex-wrap gap-1">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-12" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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
