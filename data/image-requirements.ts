export interface ImageRequirement {
  id: string
  location: string
  description: string
  dimensions: string
  purpose: string
  priority: "high" | "medium" | "low"
  currentPlaceholder: string
  suggestedQuery: string
}

export const imageRequirements: ImageRequirement[] = [
  // Homepage Images
  {
    id: "hero-background",
    location: "Homepage - Hero Section Background",
    description: "Inspiring background image showing diverse diaspora community members collaborating",
    dimensions: "1920x1080",
    purpose: "Hero background",
    priority: "high",
    currentPlaceholder: "/placeholder.svg",
    suggestedQuery:
      "diverse diaspora community members working together, modern office space, collaborative atmosphere",
  },
  {
    id: "featured-product-1",
    location: "Homepage - Featured Products",
    description: "Handcrafted jewelry collection with traditional patterns",
    dimensions: "400x300",
    purpose: "Product showcase",
    priority: "high",
    currentPlaceholder: "/placeholder.svg?height=300&width=400",
    suggestedQuery: "handcrafted jewelry with traditional African patterns, elegant display",
  },
  {
    id: "featured-product-2",
    location: "Homepage - Featured Products",
    description: "Digital art prints with cultural motifs",
    dimensions: "400x300",
    purpose: "Product showcase",
    priority: "high",
    currentPlaceholder: "/placeholder.svg?height=300&width=400",
    suggestedQuery: "digital art prints featuring cultural motifs, modern gallery display",
  },
  {
    id: "featured-product-3",
    location: "Homepage - Featured Products",
    description: "Organic skincare products with natural ingredients",
    dimensions: "400x300",
    purpose: "Product showcase",
    priority: "high",
    currentPlaceholder: "/placeholder.svg?height=300&width=400",
    suggestedQuery: "organic skincare products, natural ingredients, spa-like setting",
  },

  // Learning Hub Images
  {
    id: "course-entrepreneurship",
    location: "Learning Hub - Entrepreneurship Course",
    description: "Professional course thumbnail for diaspora entrepreneurship",
    dimensions: "300x200",
    purpose: "Course thumbnail",
    priority: "high",
    currentPlaceholder: "/placeholder.svg?height=200&width=300&text=Entrepreneurship+Course",
    suggestedQuery: "professional business meeting, diverse entrepreneurs, modern conference room",
  },
  {
    id: "article-manifestation",
    location: "Learning Hub - Manifestation Article",
    description: "Peaceful meditation and goal-setting imagery",
    dimensions: "300x200",
    purpose: "Article thumbnail",
    priority: "medium",
    currentPlaceholder: "/placeholder.svg?height=200&width=300&text=Manifestation+Article",
    suggestedQuery: "peaceful meditation scene, vision board, goal setting, serene atmosphere",
  },
  {
    id: "book-healing",
    location: "Learning Hub - Traditional Healing Book",
    description: "Traditional healing practices and natural remedies",
    dimensions: "300x200",
    purpose: "Book cover",
    priority: "medium",
    currentPlaceholder: "/placeholder.svg?height=200&width=300&text=Healing+Practices+Book",
    suggestedQuery: "traditional healing herbs, natural remedies, peaceful healing environment",
  },
  {
    id: "video-real-estate",
    location: "Learning Hub - Real Estate Video",
    description: "Real estate investment and property imagery",
    dimensions: "300x200",
    purpose: "Video thumbnail",
    priority: "medium",
    currentPlaceholder: "/placeholder.svg?height=200&width=300&text=Real+Estate+Video",
    suggestedQuery: "modern real estate properties, investment charts, professional property viewing",
  },
  {
    id: "podcast-success",
    location: "Learning Hub - Success Stories Podcast",
    description: "Podcast recording setup with professional microphones",
    dimensions: "300x200",
    purpose: "Podcast thumbnail",
    priority: "medium",
    currentPlaceholder: "/placeholder.svg?height=200&width=300&text=Success+Stories+Podcast",
    suggestedQuery: "professional podcast recording studio, microphones, interview setup",
  },
  {
    id: "program-nutrition",
    location: "Learning Hub - Nutrition Program",
    description: "Plant-based nutrition and healthy lifestyle imagery",
    dimensions: "300x200",
    purpose: "Program thumbnail",
    priority: "medium",
    currentPlaceholder: "/placeholder.svg?height=200&width=300&text=Nutrition+Program",
    suggestedQuery: "fresh plant-based foods, healthy meal preparation, nutrition education",
  },

  // Marketplace Images
  {
    id: "marketplace-african-art",
    location: "Marketplace - African Art Collection",
    description: "Traditional African art pieces in digital format",
    dimensions: "400x300",
    purpose: "Product image",
    priority: "high",
    currentPlaceholder: "/placeholder.svg?height=300&width=400",
    suggestedQuery: "traditional African art collection, colorful patterns, cultural artwork",
  },
  {
    id: "marketplace-recipe-book",
    location: "Marketplace - Recipe E-book",
    description: "Traditional recipes and cooking imagery",
    dimensions: "400x300",
    purpose: "Product image",
    priority: "high",
    currentPlaceholder: "/placeholder.svg?height=300&width=400",
    suggestedQuery: "traditional recipe book, authentic cooking, cultural cuisine",
  },
  {
    id: "marketplace-jewelry",
    location: "Marketplace - Handcrafted Jewelry",
    description: "Unique handmade jewelry with traditional patterns",
    dimensions: "400x300",
    purpose: "Product image",
    priority: "high",
    currentPlaceholder: "/placeholder.svg?height=300&width=400",
    suggestedQuery: "handcrafted jewelry, traditional patterns, elegant jewelry display",
  },
  {
    id: "marketplace-music",
    location: "Marketplace - Cultural Music Collection",
    description: "Musical instruments and cultural music imagery",
    dimensions: "400x300",
    purpose: "Product image",
    priority: "high",
    currentPlaceholder: "/placeholder.svg?height=300&width=400",
    suggestedQuery: "traditional musical instruments, cultural music performance, world music",
  },
  {
    id: "marketplace-textile",
    location: "Marketplace - Textile Patterns",
    description: "Traditional textile designs and patterns",
    dimensions: "400x300",
    purpose: "Product image",
    priority: "high",
    currentPlaceholder: "/placeholder.svg?height=300&width=400",
    suggestedQuery: "traditional textile patterns, colorful fabric designs, cultural textiles",
  },

  // Community Images
  {
    id: "community-post-art",
    location: "Community - Digital Art Post",
    description: "Digital artwork with Yoruba patterns",
    dimensions: "600x400",
    purpose: "Community post image",
    priority: "medium",
    currentPlaceholder: "/placeholder.svg?height=400&width=600",
    suggestedQuery: "digital art with Yoruba patterns, traditional African motifs, modern digital design",
  },
  {
    id: "community-post-cooking",
    location: "Community - Cooking Post",
    description: "Jollof rice cooking process and ingredients",
    dimensions: "600x400",
    purpose: "Community post image",
    priority: "medium",
    currentPlaceholder: "/placeholder.svg?height=400&width=600",
    suggestedQuery: "jollof rice cooking, West African cuisine, traditional cooking process",
  },
  {
    id: "community-post-jewelry",
    location: "Community - Jewelry Post",
    description: "Handcrafted jewelry collection display",
    dimensions: "600x400",
    purpose: "Community post image",
    priority: "medium",
    currentPlaceholder: "/placeholder.svg?height=400&width=600",
    suggestedQuery: "handcrafted jewelry collection, Indian traditional jewelry, elegant display",
  },

  // Profile and Avatar Images
  {
    id: "user-avatars",
    location: "Throughout site - User Avatars",
    description: "Diverse user profile pictures representing diaspora communities",
    dimensions: "40x40, 80x80, 120x120",
    purpose: "User avatars",
    priority: "medium",
    currentPlaceholder: "/placeholder.svg?height=40&width=40",
    suggestedQuery: "diverse professional headshots, diaspora community members, friendly portraits",
  },

  // Funding and Investment Images
  {
    id: "funding-hero",
    location: "Funding Page - Hero Section",
    description: "Investment and growth imagery with global community theme",
    dimensions: "1200x600",
    purpose: "Hero image",
    priority: "high",
    currentPlaceholder: "/placeholder.svg",
    suggestedQuery: "global investment growth, diverse investors, financial success, community building",
  },
  {
    id: "investment-charts",
    location: "Funding Page - Investment Charts",
    description: "Professional financial charts and graphs",
    dimensions: "800x400",
    purpose: "Data visualization",
    priority: "medium",
    currentPlaceholder: "/placeholder.svg",
    suggestedQuery: "professional financial charts, investment growth graphs, data visualization",
  },

  // Feature Pages Images
  {
    id: "projects-hero",
    location: "Projects Page - Hero Section",
    description: "Team collaboration and project management imagery",
    dimensions: "1200x600",
    purpose: "Hero image",
    priority: "medium",
    currentPlaceholder: "/placeholder.svg",
    suggestedQuery: "team collaboration, project management, distributed teams, modern workspace",
  },
  {
    id: "business-hero",
    location: "Business Page - Hero Section",
    description: "Business development and consulting imagery",
    dimensions: "1200x600",
    purpose: "Hero image",
    priority: "medium",
    currentPlaceholder: "/placeholder.svg",
    suggestedQuery: "business consulting, professional meeting, entrepreneurship, business growth",
  },
  {
    id: "governance-hero",
    location: "Governance Page - Hero Section",
    description: "Community governance and democratic participation",
    dimensions: "1200x600",
    purpose: "Hero image",
    priority: "medium",
    currentPlaceholder: "/placeholder.svg",
    suggestedQuery: "community governance, democratic participation, voting, community leadership",
  },
  {
    id: "health-hero",
    location: "Health Page - Hero Section",
    description: "Health and wellness services imagery",
    dimensions: "1200x600",
    purpose: "Hero image",
    priority: "medium",
    currentPlaceholder: "/placeholder.svg",
    suggestedQuery: "health and wellness, telemedicine, community health, wellness services",
  },

  // Background and Decorative Images
  {
    id: "section-backgrounds",
    location: "Various sections - Background patterns",
    description: "Subtle cultural patterns for section backgrounds",
    dimensions: "Various",
    purpose: "Background decoration",
    priority: "low",
    currentPlaceholder: "CSS gradients",
    suggestedQuery: "subtle cultural patterns, geometric designs, background textures",
  },

  // Icons and Illustrations
  {
    id: "feature-illustrations",
    location: "Feature sections - Illustrations",
    description: "Custom illustrations for features and benefits",
    dimensions: "200x200",
    purpose: "Feature illustration",
    priority: "low",
    currentPlaceholder: "Lucide icons",
    suggestedQuery: "modern illustrations, feature icons, business illustrations, community graphics",
  },
]

// Summary statistics
export const imageSummary = {
  totalImages: imageRequirements.length,
  highPriority: imageRequirements.filter((img) => img.priority === "high").length,
  mediumPriority: imageRequirements.filter((img) => img.priority === "medium").length,
  lowPriority: imageRequirements.filter((img) => img.priority === "low").length,
  uniqueLocations: [...new Set(imageRequirements.map((img) => img.location.split(" - ")[0]))].length,
}
