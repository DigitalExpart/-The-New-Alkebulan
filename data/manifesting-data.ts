import type { GoalCategory, AffirmationCategory, VisionCategory } from "@/types/manifesting"

export const goalCategories: { value: GoalCategory; label: string; icon: string; color: string }[] = [
  { value: "career", label: "Career", icon: "💼", color: "bg-blue-100 text-blue-800" },
  { value: "health", label: "Health", icon: "🌱", color: "bg-green-100 text-green-800" },
  { value: "relationships", label: "Relationships", icon: "💕", color: "bg-pink-100 text-pink-800" },
  { value: "financial", label: "Financial", icon: "💰", color: "bg-yellow-100 text-yellow-800" },
  { value: "spiritual", label: "Spiritual", icon: "🙏", color: "bg-purple-100 text-purple-800" },
  { value: "personal", label: "Personal", icon: "✨", color: "bg-indigo-100 text-indigo-800" },
  { value: "creative", label: "Creative", icon: "🎨", color: "bg-orange-100 text-orange-800" },
  { value: "travel", label: "Travel", icon: "✈️", color: "bg-cyan-100 text-cyan-800" },
]

export const affirmationCategories: { value: AffirmationCategory; label: string; icon: string }[] = [
  { value: "abundance", label: "Abundance", icon: "💎" },
  { value: "health", label: "Health", icon: "🌿" },
  { value: "love", label: "Love", icon: "💖" },
  { value: "success", label: "Success", icon: "🏆" },
  { value: "confidence", label: "Confidence", icon: "💪" },
  { value: "peace", label: "Peace", icon: "🕊️" },
  { value: "gratitude", label: "Gratitude", icon: "🙏" },
  { value: "growth", label: "Growth", icon: "🌱" },
]

export const visionCategories: { value: VisionCategory; label: string; icon: string; color: string }[] = [
  { value: "abundance", label: "Abundance", icon: "💎", color: "bg-yellow-100 text-yellow-800" },
  { value: "freedom", label: "Freedom", icon: "🦋", color: "bg-blue-100 text-blue-800" },
  { value: "health", label: "Health", icon: "🌱", color: "bg-green-100 text-green-800" },
  { value: "relationships", label: "Relationships", icon: "💕", color: "bg-pink-100 text-pink-800" },
  { value: "career", label: "Career", icon: "🚀", color: "bg-purple-100 text-purple-800" },
  { value: "travel", label: "Travel", icon: "🌍", color: "bg-cyan-100 text-cyan-800" },
  { value: "home", label: "Home", icon: "🏡", color: "bg-orange-100 text-orange-800" },
  { value: "lifestyle", label: "Lifestyle", icon: "✨", color: "bg-indigo-100 text-indigo-800" },
]

export const affirmationTemplates: { [key in AffirmationCategory]: string[] } = {
  abundance: [
    "I am worthy of abundance in all areas of my life",
    "Money flows to me easily and effortlessly",
    "I attract opportunities that align with my highest good",
    "I am grateful for the abundance that surrounds me",
    "I deserve to live a life of prosperity and joy",
  ],
  health: [
    "My body is strong, healthy, and full of energy",
    "I make choices that nourish my mind, body, and soul",
    "I am grateful for my body and treat it with love",
    "Every cell in my body vibrates with perfect health",
    "I choose foods and activities that support my wellbeing",
  ],
  love: [
    "I am worthy of deep, unconditional love",
    "I attract loving relationships into my life",
    "I love and accept myself completely",
    "My heart is open to giving and receiving love",
    "I am surrounded by people who love and support me",
  ],
  success: [
    "I am capable of achieving anything I set my mind to",
    "Success flows to me naturally and easily",
    "I am confident in my abilities and talents",
    "Every challenge is an opportunity for growth",
    "I celebrate my achievements and learn from my experiences",
  ],
  confidence: [
    "I believe in myself and my abilities",
    "I am confident, capable, and strong",
    "I trust my intuition and make decisions with ease",
    "I speak my truth with courage and conviction",
    "I am worthy of respect and recognition",
  ],
  peace: [
    "I am at peace with myself and the world around me",
    "I choose peace over worry in every situation",
    "My mind is calm and my heart is at ease",
    "I release what I cannot control and focus on what I can",
    "I find serenity in the present moment",
  ],
  gratitude: [
    "I am grateful for all the blessings in my life",
    "I appreciate the beauty and wonder around me",
    "Gratitude fills my heart and guides my actions",
    "I find joy in simple moments and everyday miracles",
    "I am thankful for my journey and all it has taught me",
  ],
  growth: [
    "I am constantly evolving and becoming my best self",
    "I embrace change as an opportunity for growth",
    "I learn something valuable from every experience",
    "I am open to new possibilities and adventures",
    "My potential is limitless and I am always expanding",
  ],
}

export const meditationTypes = [
  { value: "guided", label: "Guided Meditation", icon: "🧘‍♀️" },
  { value: "music", label: "Meditation Music", icon: "🎵" },
  { value: "nature", label: "Nature Sounds", icon: "🌊" },
  { value: "binaural", label: "Binaural Beats", icon: "🎧" },
  { value: "mantra", label: "Mantra Meditation", icon: "🕉️" },
  { value: "visualization", label: "Visualization", icon: "✨" },
]

export const hypnotherapyTypes = [
  { value: "self-hypnosis", label: "Self-Hypnosis", icon: "🧠" },
  { value: "guided", label: "Guided Hypnosis", icon: "🎯" },
  { value: "binaural", label: "Binaural Beats", icon: "🎧" },
  { value: "subliminal", label: "Subliminal Messages", icon: "💭" },
]

export const visionPrompts = [
  "Describe your ideal day from morning to night",
  "What does your dream home look like and feel like?",
  "How do you want to feel in your relationships?",
  "What impact do you want to make in the world?",
  "What does financial freedom mean to you?",
  "How do you want to spend your time when you're not working?",
  "What adventures do you want to experience?",
  "What legacy do you want to leave behind?",
]

export const aiVisionPrompts = [
  {
    title: "Career & Purpose",
    prompt: "Generate a vision for my ideal career and life purpose based on my passions and values",
  },
  {
    title: "Relationships & Love",
    prompt: "Create a vision for my ideal relationships and the love I want to experience",
  },
  {
    title: "Health & Vitality",
    prompt: "Describe my vision for optimal health, energy, and physical wellbeing",
  },
  {
    title: "Abundance & Prosperity",
    prompt: "Generate a vision for financial abundance and material prosperity in my life",
  },
  {
    title: "Adventure & Freedom",
    prompt: "Create a vision for the adventures, travel, and freedom I want to experience",
  },
]
