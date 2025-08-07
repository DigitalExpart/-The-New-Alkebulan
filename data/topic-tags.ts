import type { TopicTag, TagCategory } from "@/types/tags"

export const topicTags: TopicTag[] = [
  // Personal Development
  { id: "access-learning", name: "Access (Learning)", category: "personal-development", color: "blue" },
  { id: "achievement", name: "Achievement", category: "personal-development", color: "green" },
  { id: "boost-creativity", name: "Boost Creativity", category: "personal-development", color: "purple" },
  { id: "career-growth", name: "Career Growth", category: "personal-development", color: "indigo" },
  { id: "coaching", name: "Coaching", category: "personal-development", color: "teal" },
  { id: "communication", name: "Communication", category: "personal-development", color: "blue" },
  { id: "confidence", name: "Confidence", category: "personal-development", color: "orange" },
  { id: "emotional-mastery", name: "Emotional Mastery", category: "personal-development", color: "red" },
  { id: "flow", name: "Flow", category: "personal-development", color: "cyan" },
  { id: "focus", name: "Focus", category: "personal-development", color: "yellow" },
  { id: "freedom", name: "Freedom", category: "personal-development", color: "green" },
  { id: "habits-discipline", name: "Habits & Discipline", category: "personal-development", color: "gray" },
  { id: "happiness", name: "Happiness", category: "personal-development", color: "yellow" },
  { id: "influence-impact", name: "Influence & Impact", category: "personal-development", color: "purple" },
  { id: "leadership", name: "Leadership", category: "personal-development", color: "indigo" },
  { id: "mind-management", name: "Mind Management", category: "personal-development", color: "blue" },
  { id: "mind-power", name: "Mind Power", category: "personal-development", color: "purple" },
  { id: "passion", name: "Passion", category: "personal-development", color: "red" },
  { id: "positivity", name: "Positivity", category: "personal-development", color: "yellow" },
  { id: "problem-solving", name: "Problem Solving", category: "personal-development", color: "green" },
  { id: "productivity", name: "Productivity", category: "personal-development", color: "blue" },
  { id: "purpose", name: "Purpose", category: "personal-development", color: "purple" },
  { id: "self-love", name: "Self Love", category: "personal-development", color: "pink" },
  { id: "speed-learning", name: "Speed Learning", category: "personal-development", color: "cyan" },
  { id: "character", name: "Character", category: "personal-development", color: "gray" },
  { id: "teaching-training", name: "Teaching & Training", category: "personal-development", color: "blue" },
  { id: "transcendence", name: "Transcendence", category: "personal-development", color: "purple" },
  { id: "vision", name: "Vision", category: "personal-development", color: "indigo" },

  // Health & Wellness
  { id: "aging-better", name: "Aging Better", category: "health-wellness", color: "green" },
  { id: "better-sleep", name: "Better Sleep", category: "health-wellness", color: "blue" },
  { id: "fitness", name: "Fitness", category: "health-wellness", color: "red" },
  { id: "healing-recovery", name: "Healing & Recovery", category: "health-wellness", color: "green" },
  { id: "healing-heartbreak", name: "Healing Heartbreak", category: "health-wellness", color: "pink" },
  { id: "health", name: "Health", category: "health-wellness", color: "green" },
  { id: "look-good", name: "Look Good", category: "health-wellness", color: "orange" },
  { id: "meditations", name: "Meditations", category: "health-wellness", color: "purple" },
  { id: "wellness", name: "Wellness", category: "health-wellness", color: "green" },

  // Business & Career
  { id: "boat-creativity", name: "Boat Creativity", category: "business-career", color: "blue" },
  { id: "business-management", name: "Business Management", category: "business-career", color: "gray" },
  { id: "money-finance", name: "Money & Finance", category: "business-career", color: "green" },

  // Relationships
  { id: "relationship", name: "Relationship", category: "relationships", color: "pink" },
  { id: "parenting", name: "Parenting", category: "relationships", color: "orange" },
  { id: "socials-relationships", name: "Socials & Relationships", category: "relationships", color: "blue" },

  // Spirituality
  { id: "oneness", name: "Oneness", category: "spirituality", color: "purple" },
  { id: "spirituality", name: "Spirituality", category: "spirituality", color: "purple" },

  // Lifestyle
  { id: "lifestyle", name: "Lifestyle", category: "lifestyle", color: "orange" },

  // Culture
  { id: "alkebulan", name: "Alkebulan", category: "culture", color: "yellow" },
]

export const tagCategories: Record<TagCategory, { name: string; color: string }> = {
  "personal-development": { name: "Personal Development", color: "blue" },
  "health-wellness": { name: "Health & Wellness", color: "green" },
  "business-career": { name: "Business & Career", color: "purple" },
  relationships: { name: "Relationships", color: "pink" },
  spirituality: { name: "Spirituality", color: "indigo" },
  learning: { name: "Learning", color: "cyan" },
  lifestyle: { name: "Lifestyle", color: "orange" },
  culture: { name: "Culture", color: "yellow" },
}

export const getTagsByCategory = (category: TagCategory): TopicTag[] => {
  return topicTags.filter((tag) => tag.category === category)
}

export const getTagById = (id: string): TopicTag | undefined => {
  return topicTags.find((tag) => tag.id === id)
}

export const getTagsByIds = (ids: string[]): TopicTag[] => {
  return ids.map((id) => getTagById(id)).filter(Boolean) as TopicTag[]
}
