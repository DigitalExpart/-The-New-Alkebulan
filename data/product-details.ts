import type { Product, ProductReview } from "@/types/product"

export const sampleProduct: Product = {
  id: 1,
  title: "African Art Digital Collection",
  shortDescription: "Beautiful collection of traditional African art pieces digitized for modern use.",
  description: `This comprehensive digital collection features over 50 high-resolution African art pieces, carefully curated and digitized from traditional sources. Each piece comes with detailed cultural context and historical background.

The collection includes:
• Traditional masks and sculptures
• Contemporary African paintings
• Textile patterns and designs
• Ceremonial artifacts
• Modern interpretations of classic themes

Perfect for designers, educators, cultural enthusiasts, and anyone looking to incorporate authentic African artistic elements into their projects. All images are provided in multiple formats and resolutions for maximum versatility.`,
  price: 45,
  originalPrice: 60,
  images: [
    "/placeholder.svg?height=600&width=600&text=African+Art+Main",
    "/placeholder.svg?height=600&width=600&text=African+Art+2",
    "/placeholder.svg?height=600&width=600&text=African+Art+3",
    "/placeholder.svg?height=600&width=600&text=African+Art+4",
  ],
  category: "Digital Art",
  rating: 4.8,
  reviews: 124,
  tags: ["Art", "Digital", "Culture", "African", "Traditional"],
  featured: true,
  creator: {
    name: "Amara Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    location: "Lagos, Nigeria",
    rating: 4.8,
    totalSales: 1247,
    responseTime: "Usually responds within 2 hours",
  },
  stock: {
    status: "in-stock",
    quantity: 999,
  },
  shipping: {
    type: "instant",
    estimate: "Instant download after purchase",
    cost: 0,
  },
  specifications: {
    "File Formats": "PNG, JPG, SVG, AI",
    Resolution: "Up to 4K (4096x4096px)",
    "Total Files": "50+ individual pieces",
    "File Size": "2.3 GB total",
    License: "Commercial use allowed",
    Compatibility: "All design software",
  },
  faqs: [
    {
      question: "Can I use these for commercial projects?",
      answer:
        "Yes, the commercial license allows you to use these art pieces in client work, products for sale, and commercial applications.",
      date: "2024-01-15",
    },
    {
      question: "What file formats are included?",
      answer:
        "Each piece comes in PNG (transparent background), JPG (white background), SVG (vector), and AI (Adobe Illustrator) formats.",
      date: "2024-01-10",
    },
    {
      question: "Are there any usage restrictions?",
      answer:
        "You cannot resell the individual art pieces as-is, but you can incorporate them into your own designs and products.",
      date: "2024-01-08",
    },
  ],
}

export const sampleReviews: ProductReview[] = [
  {
    id: 1,
    userId: "user1",
    userName: "Sarah Chen",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    title: "Absolutely stunning collection!",
    comment:
      "The quality and authenticity of these pieces is incredible. I've used several in my design projects and clients love them. The cultural context provided with each piece is also very valuable.",
    date: "2024-01-20",
    verified: true,
    helpful: 23,
    images: ["/placeholder.svg?height=200&width=200&text=Review+Image+1"],
  },
  {
    id: 2,
    userId: "user2",
    userName: "Marcus Thompson",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    title: "Great variety and quality",
    comment:
      "Really impressed with the diversity of art styles included. The file formats are perfect for my workflow. Only minor complaint is that I wish there were even more pieces!",
    date: "2024-01-18",
    verified: true,
    helpful: 15,
    reply: {
      author: "Amara Johnson",
      message:
        "Thank you for the feedback! I'm working on Volume 2 which will include 30+ additional pieces. Stay tuned!",
      date: "2024-01-19",
    },
  },
  {
    id: 3,
    userId: "user3",
    userName: "Elena Rodriguez",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    title: "Perfect for my cultural center project",
    comment:
      "Used these for educational materials at our community cultural center. The historical context and high resolution made them perfect for both digital and print use.",
    date: "2024-01-15",
    verified: true,
    helpful: 8,
  },
  {
    id: 4,
    userId: "user4",
    userName: "David Kim",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    title: "Excellent value for money",
    comment:
      "The collection is comprehensive and well-organized. Download was instant and all files were exactly as described. Will definitely purchase more from this creator.",
    date: "2024-01-12",
    verified: true,
    helpful: 12,
  },
]

export const relatedProducts: Product[] = [
  {
    id: 2,
    title: "Traditional Recipe E-book",
    description: "Authentic family recipes passed down through generations",
    price: 25,
    images: ["/placeholder.svg?height=300&width=400"],
    category: "Food & Culture",
    rating: 4.9,
    reviews: 89,
    tags: ["Recipes", "Culture", "Food"],
    creator: {
      name: "Chef Kwame",
      avatar: "/placeholder.svg?height=40&width=40",
      location: "Accra, Ghana",
      rating: 4.9,
    },
    stock: { status: "in-stock" },
    shipping: { type: "instant", estimate: "Instant download" },
  },
  {
    id: 3,
    title: "Handcrafted Jewelry Set",
    description: "Unique handmade jewelry featuring traditional patterns",
    price: 120,
    images: ["/placeholder.svg?height=300&width=400"],
    category: "Jewelry",
    rating: 4.7,
    reviews: 56,
    tags: ["Handmade", "Jewelry", "Traditional"],
    creator: {
      name: "Maya Patel",
      avatar: "/placeholder.svg?height=40&width=40",
      location: "Mumbai, India",
      rating: 4.7,
    },
    stock: { status: "limited-stock", quantity: 3 },
    shipping: { type: "standard", estimate: "3-5 business days" },
  },
  {
    id: 4,
    title: "Cultural Music Collection",
    description: "Curated collection of traditional and contemporary music",
    price: 35,
    images: ["/placeholder.svg?height=300&width=400"],
    category: "Music",
    rating: 4.6,
    reviews: 78,
    tags: ["Music", "Culture", "Audio"],
    creator: {
      name: "Carlos Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      location: "Mexico City, Mexico",
      rating: 4.6,
    },
    stock: { status: "in-stock" },
    shipping: { type: "instant", estimate: "Instant download" },
  },
  {
    id: 5,
    title: "Textile Design Patterns",
    description: "Digital patterns inspired by traditional textiles",
    price: 55,
    images: ["/placeholder.svg?height=300&width=400"],
    category: "Design",
    rating: 4.8,
    reviews: 92,
    tags: ["Patterns", "Textile", "Design"],
    creator: {
      name: "Fatima Al-Zahra",
      avatar: "/placeholder.svg?height=40&width=40",
      location: "Marrakech, Morocco",
      rating: 4.8,
    },
    stock: { status: "in-stock" },
    shipping: { type: "instant", estimate: "Instant download" },
  },
]
