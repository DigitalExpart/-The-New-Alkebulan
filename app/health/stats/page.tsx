"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HealthOverview } from "@/components/health/health-overview"
import { GoalsHabitsTracker } from "@/components/health/goals-habits-tracker"
import { HealthContentFeed } from "@/components/health/health-content-feed"
import { WellnessJournal } from "@/components/health/wellness-journal"
import { HealthCoaches } from "@/components/health/health-coaches"
import { healthData } from "@/data/health-data"

export default function WellnessOverviewPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Wellness Overview</h1>
        <p className="text-muted-foreground">Track your wellness journey with detailed insights and analytics.</p>
      </div>

      {/* Health Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals & Habits</TabsTrigger>
          <TabsTrigger value="content">Resources</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="coaches">Coaches</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <HealthOverview data={healthData.overview} />
        </TabsContent>

        <TabsContent value="goals">
          <GoalsHabitsTracker goals={healthData.goals} habits={healthData.habits} />
        </TabsContent>

        <TabsContent value="content">
          <HealthContentFeed content={healthData.content} />
        </TabsContent>

        <TabsContent value="journal">
          <WellnessJournal entries={healthData.journal} />
        </TabsContent>

        <TabsContent value="coaches">
          <HealthCoaches coaches={healthData.coaches} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
