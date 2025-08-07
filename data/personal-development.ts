import type { PersonalDevelopmentData } from "@/types/personal-development"

export const personalDevelopmentData: PersonalDevelopmentData = {
  areas: [
    {
      id: "mind",
      name: "Mind",
      level: 1,
      maxLevel: 5,
      color: "#8B5CF6", // Purple
      description: "Mental clarity, learning, and cognitive growth",
      motivationalQuote: "The mind is everything. What you think you become.",
      lastUpdated: "2024-01-15",
      relatedContent: ["meditation-basics", "critical-thinking-course"],
    },
    {
      id: "body",
      name: "Body",
      level: 2,
      maxLevel: 5,
      color: "#10B981", // Green
      description: "Physical health, fitness, and vitality",
      motivationalQuote: "Take care of your body. It's the only place you have to live.",
      lastUpdated: "2024-01-18",
      relatedContent: ["fitness-fundamentals", "nutrition-guide"],
    },
    {
      id: "relationships",
      name: "Relationships",
      level: 2,
      maxLevel: 5,
      color: "#F59E0B", // Amber
      description: "Connection, communication, and social bonds",
      motivationalQuote: "We rise by lifting others.",
      lastUpdated: "2024-01-12",
      relatedContent: ["communication-skills", "building-trust"],
    },
    {
      id: "career",
      name: "Career",
      level: 2,
      maxLevel: 5,
      color: "#3B82F6", // Blue
      description: "Professional growth and skill development",
      motivationalQuote: "Success is where preparation and opportunity meet.",
      lastUpdated: "2024-01-20",
      relatedContent: ["leadership-training", "networking-strategies"],
    },
    {
      id: "soul",
      name: "Soul",
      level: 1,
      maxLevel: 5,
      color: "#EC4899", // Pink
      description: "Spiritual growth, purpose, and inner peace",
      motivationalQuote: "The soul becomes dyed with the color of its thoughts.",
      lastUpdated: "2024-01-10",
      relatedContent: ["mindfulness-practice", "finding-purpose"],
    },
    {
      id: "entrepreneurship",
      name: "Entrepreneurship",
      level: 2,
      maxLevel: 5,
      color: "#EF4444", // Red
      description: "Innovation, business acumen, and value creation",
      motivationalQuote: "The way to get started is to quit talking and begin doing.",
      lastUpdated: "2024-01-16",
      relatedContent: ["startup-basics", "business-planning"],
    },
  ],
  focusArea: "body",
  lastOverallUpdate: "2024-01-20",
}
