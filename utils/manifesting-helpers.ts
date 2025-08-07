import type { Goal, Affirmation, ManifestingData } from "@/types/manifesting"
import { affirmationTemplates } from "@/data/manifesting-data"

export function calculateGoalProgress(goals: Goal[]): number {
  if (goals.length === 0) return 0
  const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0)
  return Math.round(totalProgress / goals.length)
}

export function getCompletedGoals(goals: Goal[]): Goal[] {
  return goals.filter((goal) => goal.completed)
}

export function getActiveGoals(goals: Goal[]): Goal[] {
  return goals.filter((goal) => !goal.completed)
}

export function generateAIAffirmations(category: string, personalGoals: string[]): Affirmation[] {
  // This would integrate with an AI service in a real implementation
  // For now, we'll return template affirmations with some personalization
  const templates = affirmationTemplates[category as keyof typeof affirmationTemplates] || []

  return templates.slice(0, 3).map((text, index) => ({
    id: `ai-${category}-${index}`,
    text,
    category: category as any,
    isActive: false,
    createdAt: new Date(),
    source: "ai" as const,
  }))
}

export function generateVisionFromPrompt(desires: string[], timeframe: string): string {
  // This would integrate with an AI service in a real implementation
  // For now, we'll return a template vision
  return `In ${timeframe}, I envision a life where ${desires.join(", ")} are fully realized. I see myself living with purpose, surrounded by love, and making a meaningful impact in the world. Every day brings new opportunities for growth and joy.`
}

export function exportToPDF(data: Partial<ManifestingData>): void {
  // This would integrate with a PDF generation library
  // For now, we'll create a simple text export
  const content = `
My Manifesting Journey

Best Life Vision:
${data.bestLifeVision?.description || "Not yet defined"}

Goals:
${data.longTermGoals?.oneYear?.map((g) => `- ${g.title}`).join("\n") || "No goals set"}

Affirmations:
${data.affirmations?.personal?.map((a) => `- ${a.text}`).join("\n") || "No affirmations created"}

Generated on: ${new Date().toLocaleDateString()}
  `

  const blob = new Blob([content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "my-manifesting-journey.txt"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function getManifestingProgress(data: ManifestingData): {
  overall: number
  sections: { [key: string]: number }
} {
  const sections = {
    vision: data.bestLifeVision.description ? 100 : 0,
    goals: data.longTermGoals.oneYear.length > 0 ? 100 : 0,
    autobiography: data.autobiography.content ? 100 : 0,
    meditations: data.meditations.saved.length > 0 ? 100 : 0,
    affirmations: data.affirmations.personal.length > 0 ? 100 : 0,
    gallery: data.visualGallery.images.length > 0 ? 100 : 0,
    videos: data.visionVideos.videos.length > 0 ? 100 : 0,
    visuals: data.customizedVisuals.artwork.length > 0 ? 100 : 0,
    hypnotherapy: data.hypnotherapy.sessions.length > 0 ? 100 : 0,
  }

  const overall = Math.round(
    Object.values(sections).reduce((sum, value) => sum + value, 0) / Object.keys(sections).length,
  )

  return { overall, sections }
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function validateGoal(goal: Partial<Goal>): string[] {
  const errors: string[] = []

  if (!goal.title?.trim()) {
    errors.push("Goal title is required")
  }

  if (!goal.description?.trim()) {
    errors.push("Goal description is required")
  }

  if (!goal.category) {
    errors.push("Goal category is required")
  }

  if (goal.targetDate && new Date(goal.targetDate) < new Date()) {
    errors.push("Target date must be in the future")
  }

  return errors
}
