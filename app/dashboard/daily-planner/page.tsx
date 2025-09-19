// Rogie's Edit

"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Target, TrendingUp, Sun, Quote, CheckCircle2 } from "lucide-react"

import { DailyAgenda } from "@/components/daily-planner/daily-agenda"
import { HabitTracker } from "@/components/daily-planner/habit-tracker"
import { RoutineSelector } from "@/components/daily-planner/routine-selector"
import { DailyGoals } from "@/components/daily-planner/daily-goals"
import { MoodEnergyTracker } from "@/components/daily-planner/mood-energy-tracker"
import { ReflectionJournal } from "@/components/daily-planner/reflection-journal"

import { dailyPlannerData, motivationalQuotes } from "@/data/daily-planner-data"
import type { TimeBlock, Habit, DailyGoal, MoodEntry, ReflectionEntry } from "@/types/daily-planner"

export default function DailyPlannerPage() {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(dailyPlannerData.timeBlocks)
  const [habits, setHabits] = useState<Habit[]>(dailyPlannerData.habits)
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>(dailyPlannerData.dailyGoals)
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>(dailyPlannerData.moodEntries)
  const [reflectionEntry, setReflectionEntry] = useState<ReflectionEntry | undefined>(dailyPlannerData.reflectionEntry)
  const [selectedRoutine, setSelectedRoutine] = useState<string>("")

  const todayQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]

  const handleToggleTimeBlock = (id: string) => {
    setTimeBlocks((blocks) =>
      blocks.map((block) => (block.id === id ? { ...block, completed: !block.completed } : block)),
    )
  }

  const handleAddTimeBlock = (newTimeBlock: Omit<TimeBlock, "id" | "completed">) => {
    const timeBlock: TimeBlock = {
      ...newTimeBlock,
      id: Date.now().toString(),
      completed: false,
    }
    setTimeBlocks((blocks) => [...blocks, timeBlock])
  }

  const handleDeleteTimeBlock = (id: string) => {
    setTimeBlocks((blocks) => blocks.filter((block) => block.id !== id))
  }

  const handleToggleHabit = (id: string) => {
    setHabits((habits) =>
      habits.map((habit) => {
        if (habit.id === id) {
          const newCompleted = !habit.completedToday
          return {
            ...habit,
            completedToday: newCompleted,
            streak: newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1),
            completedDates: newCompleted
              ? [...habit.completedDates, new Date().toISOString().split("T")[0]]
              : habit.completedDates.filter((date) => date !== new Date().toISOString().split("T")[0]),
          }
        }
        return habit
      }),
    )
  }

  const handleToggleGoal = (id: string) => {
    setDailyGoals((goals) => goals.map((goal) => (goal.id === id ? { ...goal, completed: !goal.completed } : goal)))
  }

  const handleAddGoal = (newGoal: Omit<DailyGoal, "id">) => {
    const goal: DailyGoal = {
      ...newGoal,
      id: Date.now().toString(),
    }
    setDailyGoals((goals) => [...goals, goal])
  }

  const handleAddMoodEntry = (entry: Omit<MoodEntry, "id">) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: Date.now().toString(),
    }
    setMoodEntries((entries) => [...entries, newEntry])
  }

  const handleSaveReflection = (entry: Omit<ReflectionEntry, "id">) => {
    const newEntry: ReflectionEntry = {
      ...entry,
      id: Date.now().toString(),
    }
    setReflectionEntry(newEntry)
  }

  const completedHabits = habits.filter((h) => h.completedToday).length
  const completedGoals = dailyGoals.filter((g) => g.completed).length
  const completedTimeBlocks = timeBlocks.filter((b) => b.completed).length

  const overallProgress = Math.round(
    ((completedHabits / habits.length) * 0.4 +
      (completedGoals / dailyGoals.length) * 0.4 +
      (completedTimeBlocks / timeBlocks.length) * 0.2) *
      100,
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Calendar className="w-8 h-8 text-primary" />
                Daily Planner
              </h1>
              <p className="text-muted-foreground text-base mt-2">
                Plan your day, build powerful habits, and create meaningful routines
              </p>
            </div>

            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-2">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
                {overallProgress}% Complete
              </Badge>
            </div>
          </div>

          {/* Progress Overview - Reordered */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Schedule</p>
                    <p className="text-2xl font-bold text-primary">
                      {completedTimeBlocks}/{timeBlocks.length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Habits</p>
                    <p className="text-2xl font-bold text-primary">
                      {completedHabits}/{habits.length}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Goals</p>
                    <p className="text-2xl font-bold text-primary">
                      {completedGoals}/{dailyGoals.length}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall</p>
                    <p className="text-2xl font-bold text-primary">{overallProgress}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Quote */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Quote className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-foreground font-medium italic text-base">"{todayQuote}"</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Sun className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Daily Inspiration</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="agenda" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6 bg-card border-border">
            <TabsTrigger
              value="agenda"
              className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Agenda
            </TabsTrigger>
            <TabsTrigger
              value="habits"
              className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Habits
            </TabsTrigger>
            <TabsTrigger
              value="routine"
              className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Routine
            </TabsTrigger>
            <TabsTrigger
              value="goals"
              className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Goals
            </TabsTrigger>
            <TabsTrigger
              value="mood"
              className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Mood
            </TabsTrigger>
            <TabsTrigger
              value="reflection"
              className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Reflection
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agenda" className="mt-0">
            <div className="max-w-4xl">
              <DailyAgenda
                timeBlocks={timeBlocks}
                onToggleComplete={handleToggleTimeBlock}
                onAddTimeBlock={handleAddTimeBlock}
                onDeleteTimeBlock={handleDeleteTimeBlock}
              />
            </div>
          </TabsContent>

          <TabsContent value="habits" className="mt-0">
            <div className="max-w-4xl">
              <HabitTracker
                habits={habits}
                onToggleHabit={handleToggleHabit}
                onAddHabit={() => console.log("Add habit")}
              />
            </div>
          </TabsContent>

          <TabsContent value="routine" className="mt-0">
            <div className="max-w-4xl">
              <RoutineSelector
                routines={dailyPlannerData.routines}
                selectedRoutine={selectedRoutine}
                onSelectRoutine={setSelectedRoutine}
                onCreateCustom={() => console.log("Create custom routine")}
              />
            </div>
          </TabsContent>

          <TabsContent value="goals" className="mt-0">
            <div className="max-w-4xl">
              <DailyGoals
                goals={dailyGoals}
                onToggleGoal={handleToggleGoal}
                onAddGoal={handleAddGoal}
                successMessage={dailyPlannerData.successMessage}
              />
            </div>
          </TabsContent>

          <TabsContent value="mood" className="mt-0">
            <div className="max-w-4xl">
              <MoodEnergyTracker moodEntries={moodEntries} onAddEntry={handleAddMoodEntry} />
            </div>
          </TabsContent>

          <TabsContent value="reflection" className="mt-0">
            <div className="max-w-4xl">
              <ReflectionJournal reflectionEntry={reflectionEntry} onSaveReflection={handleSaveReflection} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
