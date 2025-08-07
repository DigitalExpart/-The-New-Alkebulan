import type {
  DNATestKit,
  DNATestStatus,
  EthnicityResult,
  TribalConnection,
  HeritageInsight,
  FamilyMember,
} from "@/types/heritage"

export const dnaTestKit: DNATestKit = {
  id: "alkebulan-origins-kit",
  name: "Alkebulan Origins DNA Kit",
  description:
    "Discover your African ancestry with the most comprehensive DNA test designed specifically for the African diaspora.",
  price: 199,
  currency: "USD",
  images: [
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
  ],
  features: [
    "50+ African regions analyzed",
    "Tribal connections and matches",
    "Migration pattern insights",
    "Cultural heritage reports",
    "Health predisposition screening",
    "Family tree building tools",
    "Connect with DNA relatives",
    "Historical timeline creation",
  ],
  processingTime: "6-8 weeks",
  reviews: [
    {
      id: "review-1",
      userId: "user-1",
      userName: "Amara Johnson",
      userAvatar: "/placeholder.svg?height=32&width=32",
      rating: 5,
      comment:
        "Incredible insights into my Yoruba heritage! The tribal connections were spot-on and helped me connect with distant relatives.",
      isVerified: true,
      createdAt: "2024-01-10",
    },
    {
      id: "review-2",
      userId: "user-2",
      userName: "Kwame Asante",
      userAvatar: "/placeholder.svg?height=32&width=32",
      rating: 5,
      comment:
        "Finally found my roots! The detailed breakdown of West African regions was exactly what I was looking for.",
      isVerified: true,
      createdAt: "2024-01-08",
    },
    {
      id: "review-3",
      userId: "user-3",
      userName: "Zara Okafor",
      userAvatar: "/placeholder.svg?height=32&width=32",
      rating: 4,
      comment: "Great service and detailed results. The cultural insights section was particularly enlightening.",
      isVerified: true,
      createdAt: "2024-01-05",
    },
  ],
  averageRating: 4.7,
  totalReviews: 1247,
}

export const mockDNATestStatus: DNATestStatus = {
  currentStep: 2,
  steps: [
    {
      id: "step-1",
      name: "Order Placed",
      description: "Your DNA kit has been ordered and payment confirmed",
      isCompleted: true,
      completedAt: "2024-01-10T10:00:00Z",
    },
    {
      id: "step-2",
      name: "Kit Shipped",
      description: "Your DNA collection kit is on its way to you",
      isCompleted: true,
      completedAt: "2024-01-12T14:30:00Z",
    },
    {
      id: "step-3",
      name: "Kit Received",
      description: "Confirm you've received your DNA collection kit",
      isCompleted: false,
    },
    {
      id: "step-4",
      name: "Sample Submitted",
      description: "Return your DNA sample using the prepaid shipping label",
      isCompleted: false,
    },
    {
      id: "step-5",
      name: "Results Ready",
      description: "Your comprehensive heritage report is complete",
      isCompleted: false,
    },
  ],
  orderedAt: "2024-01-10T10:00:00Z",
  estimatedCompletion: "2024-03-05T00:00:00Z",
}

export const mockEthnicityResults: EthnicityResult[] = [
  {
    region: "West Africa",
    percentage: 45,
    confidence: 92,
    description: "Primarily from modern-day Nigeria, Ghana, and Benin",
    color: "#FF6B6B",
  },
  {
    region: "Central Africa",
    percentage: 28,
    confidence: 88,
    description: "Including regions of Cameroon, Congo, and Angola",
    color: "#4ECDC4",
  },
  {
    region: "East Africa",
    percentage: 18,
    confidence: 85,
    description: "Ethiopian and Kenyan highlands with Somali connections",
    color: "#45B7D1",
  },
  {
    region: "Southern Africa",
    percentage: 9,
    confidence: 78,
    description: "Bantu migrations through Zimbabwe and South Africa",
    color: "#96CEB4",
  },
]

export const mockTribalConnections: TribalConnection[] = [
  {
    tribe: "Yoruba",
    region: "Southwest Nigeria",
    matchPercentage: 34,
    description: "Strong genetic markers indicating Yoruba ancestry from the Oyo and Ife kingdoms",
    culturalNotes: [
      "Rich tradition of oral history and storytelling",
      "Renowned for bronze and brass artwork",
      "Complex pantheon of Orishas (deities)",
      "Traditional music with talking drums",
    ],
  },
  {
    tribe: "Akan",
    region: "Ghana and Ivory Coast",
    matchPercentage: 28,
    description: "Genetic connections to the Akan people, including Ashanti and Fante subgroups",
    culturalNotes: [
      "Matrilineal society with strong female leadership",
      "Famous for Kente cloth weaving",
      "Gold trading and craftsmanship traditions",
      "Adinkra symbols with deep meanings",
    ],
  },
  {
    tribe: "Bantu",
    region: "Central and Southern Africa",
    matchPercentage: 22,
    description: "Part of the great Bantu migration that spread across sub-Saharan Africa",
    culturalNotes: [
      "Agricultural societies with iron working skills",
      "Complex kinship and clan systems",
      "Rich musical traditions with polyrhythms",
      "Ancestral worship and spiritual practices",
    ],
  },
  {
    tribe: "Fulani",
    region: "West and Central Africa",
    matchPercentage: 16,
    description: "Nomadic pastoralist heritage spanning multiple countries",
    culturalNotes: [
      "Traditional cattle herding lifestyle",
      "Islamic influence and scholarship",
      "Distinctive art and jewelry traditions",
      "Oral poetry and storytelling culture",
    ],
  },
]

export const mockHeritageInsights: HeritageInsight[] = [
  {
    category: "cultural",
    title: "Traditional Ceremonies and Rituals",
    description: "Your ancestry connects you to rich ceremonial traditions across West and Central Africa",
    details: [
      "Coming-of-age ceremonies marking transition to adulthood",
      "Harvest festivals celebrating agricultural abundance",
      "Ancestral veneration rituals connecting past and present",
      "Community gathering traditions for decision-making",
    ],
    relatedRegions: ["West Africa", "Central Africa"],
  },
  {
    category: "linguistic",
    title: "Language Families and Communication",
    description: "Your genetic markers suggest connections to multiple African language families",
    details: [
      "Niger-Congo language family (largest in Africa)",
      "Tonal languages with meaning conveyed through pitch",
      "Click consonants in some Southern African languages",
      "Oral tradition as primary form of knowledge transfer",
    ],
    relatedRegions: ["West Africa", "Central Africa", "Southern Africa"],
  },
  {
    category: "historical",
    title: "Migration Patterns and Trade Routes",
    description: "Your ancestors were part of significant historical movements across Africa",
    details: [
      "Bantu expansion spreading agriculture and iron-working",
      "Trans-Saharan trade routes connecting North and West Africa",
      "Coastal trading posts and interaction with global commerce",
      "Resistance movements against colonial occupation",
    ],
    relatedRegions: ["West Africa", "Central Africa", "East Africa"],
  },
  {
    category: "health",
    title: "Genetic Health Considerations",
    description: "Understanding your genetic background can inform health decisions",
    details: [
      "Sickle cell trait prevalence in malaria-endemic regions",
      "Lactose intolerance common in many African populations",
      "Vitamin D considerations for darker skin in northern climates",
      "Genetic variants affecting medication metabolism",
    ],
    relatedRegions: ["West Africa", "Central Africa", "East Africa"],
  },
]

export const mockFamilyMembers: FamilyMember[] = [
  {
    id: "member-1",
    name: "Samuel Johnson",
    relationship: "Paternal Grandfather",
    birthDate: "1925-03-15",
    deathDate: "1998-11-22",
    birthPlace: "Birmingham, Alabama",
    photo: "/placeholder.svg?height=100&width=100",
    biography:
      "Born in the rural South, Samuel worked as a sharecropper before moving north during the Great Migration. He was known for his storytelling and deep knowledge of family history.",
    legacyNotes:
      "Always said our family came from 'the old country' - now we know he meant West Africa. His stories about resilience and community have been passed down through generations.",
    generation: 3,
    children: ["member-3"],
  },
  {
    id: "member-2",
    name: "Mary Washington Johnson",
    relationship: "Paternal Grandmother",
    birthDate: "1928-07-08",
    deathDate: "2005-01-14",
    birthPlace: "Mobile, Alabama",
    photo: "/placeholder.svg?height=100&width=100",
    biography:
      "A talented seamstress and community organizer, Mary was instrumental in the local civil rights movement. She raised six children while working multiple jobs.",
    legacyNotes:
      "Her quilting patterns and recipes have been treasured family heirlooms. She always emphasized the importance of education and community service.",
    generation: 3,
    children: ["member-3"],
  },
  {
    id: "member-3",
    name: "Robert Johnson Sr.",
    relationship: "Father",
    birthDate: "1952-09-12",
    birthPlace: "Detroit, Michigan",
    photo: "/placeholder.svg?height=100&width=100",
    biography:
      "First in the family to attend college, Robert became an engineer and moved the family to the suburbs. He maintained strong connections to his Southern roots.",
    legacyNotes:
      "Instilled the values of hard work and education. His engineering mindset helped preserve family documents and photographs that trace our heritage.",
    generation: 2,
    parentIds: ["member-1", "member-2"],
    children: ["member-5"],
  },
  {
    id: "member-4",
    name: "Patricia Williams Johnson",
    relationship: "Mother",
    birthDate: "1955-12-03",
    birthPlace: "Chicago, Illinois",
    photo: "/placeholder.svg?height=100&width=100",
    biography:
      "A teacher and community volunteer, Patricia dedicated her life to education and youth development. She has been researching family genealogy for over 20 years.",
    legacyNotes:
      "Her meticulous record-keeping and genealogy research laid the foundation for understanding our family history. She connected us with distant relatives across the country.",
    generation: 2,
    children: ["member-5"],
  },
  {
    id: "member-5",
    name: "You",
    relationship: "Self",
    birthDate: "1985-06-20",
    birthPlace: "Atlanta, Georgia",
    photo: "/placeholder.svg?height=100&width=100",
    biography:
      "Continuing the family tradition of education and community service while exploring our African heritage and building connections across the diaspora.",
    legacyNotes:
      "Using DNA testing and digital tools to uncover our ancestral connections and preserve family stories for future generations.",
    generation: 1,
    parentIds: ["member-3", "member-4"],
  },
]

// Helper functions
export const getHeritageProgress = (): number => {
  const dnaCompleted = mockDNATestStatus.currentStep >= 5 ? 1 : mockDNATestStatus.currentStep / 5
  const familyTreeProgress = mockFamilyMembers.length > 3 ? 1 : mockFamilyMembers.length / 3
  const insightsViewed = 0.8 // Assume 80% of insights have been viewed

  return Math.round(((dnaCompleted + familyTreeProgress + insightsViewed) / 3) * 100)
}

export const getCompletedSteps = (): number => {
  return mockDNATestStatus.steps.filter((step) => step.isCompleted).length
}

export const getTotalSteps = (): number => {
  return mockDNATestStatus.steps.length
}
