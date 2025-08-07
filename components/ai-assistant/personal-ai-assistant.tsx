"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Bot,
  Send,
  FileText,
  ImageIcon,
  BookOpen,
  Loader2,
  Upload,
  Sparkles,
  MessageCircle,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "text" | "summary" | "analysis" | "recommendation"
}

interface ContentSummary {
  title: string
  type: "video" | "article" | "course"
  duration?: string
  keyPoints: string[]
  summary: string
  difficulty: "beginner" | "intermediate" | "advanced"
}

interface ImageAnalysis {
  description: string
  tags: string[]
  insights: string[]
  suggestions: string[]
  culturalContext?: string
}

interface LearningRecommendation {
  id: string
  title: string
  type: "course" | "video" | "ebook" | "audio"
  category: string
  difficulty: string
  duration: string
  reason: string
  matchScore: number
}

export function PersonalAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your personal AI assistant. I'm here to help you with learning, content analysis, and personalized recommendations. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [contentUrl, setContentUrl] = useState("")
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock user data - in real app this would come from context
  const user = {
    id: 1,
    name: "John Doe",
    avatar: "/placeholder.svg?height=32&width=32",
    learningProgress: {
      completedCourses: 8,
      currentLevel: "intermediate",
      interests: ["entrepreneurship", "digital-marketing", "cultural-studies"],
      preferredLanguage: "en",
    },
  }

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "nl", name: "Nederlands", flag: "🇳🇱" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(inputMessage),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const generateAIResponse = (input: string): string => {
    // Mock AI responses based on input
    const responses = [
      "I understand you're looking for guidance. Based on your learning profile, I'd recommend focusing on advanced entrepreneurship concepts. Would you like me to suggest some specific courses?",
      "That's a great question! Let me help you explore this topic further. Based on your interests in cultural studies and business, I can provide some personalized insights.",
      "I can see you're making excellent progress in your learning journey. Here are some recommendations that align with your current level and interests.",
      "That's an interesting perspective! Let me analyze this in the context of your cultural background and learning goals.",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleContentSummary = async () => {
    if (!contentUrl.trim()) return

    setIsLoading(true)

    // Simulate content analysis
    setTimeout(() => {
      const mockSummary: ContentSummary = {
        title: "Entrepreneurship in the Diaspora - Module 3",
        type: "course",
        duration: "45 minutes",
        keyPoints: [
          "Building networks across cultures",
          "Maintaining cultural identity in business",
          "Leveraging diaspora connections",
          "Overcoming cultural barriers",
        ],
        summary:
          "This module explores how diaspora entrepreneurs can build successful businesses while maintaining their cultural identity. It covers networking strategies, cultural bridge-building, and leveraging community connections for business growth.",
        difficulty: "intermediate",
      }

      const summaryMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `**Content Summary Generated**\n\n**${mockSummary.title}**\n\n**Key Points:**\n${mockSummary.keyPoints.map((point) => `• ${point}`).join("\n")}\n\n**Summary:** ${mockSummary.summary}\n\n**Duration:** ${mockSummary.duration} | **Difficulty:** ${mockSummary.difficulty}`,
        timestamp: new Date(),
        type: "summary",
      }

      setMessages((prev) => [...prev, summaryMessage])
      setContentUrl("")
      setIsLoading(false)
    }, 2000)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageAnalysis = async () => {
    if (!uploadedImage) return

    setIsLoading(true)

    // Simulate image analysis
    setTimeout(() => {
      const mockAnalysis: ImageAnalysis = {
        description:
          "This appears to be a traditional African textile pattern featuring geometric designs in vibrant colors. The artwork shows intricate craftsmanship with cultural significance.",
        tags: ["textile", "african-art", "traditional", "geometric", "cultural", "handmade"],
        insights: [
          "The geometric patterns suggest West African textile traditions",
          "Color palette indicates ceremonial or festive use",
          "Craftsmanship level suggests professional artisan work",
          "Design elements show cultural storytelling aspects",
        ],
        suggestions: [
          "Consider exploring similar traditional textile courses",
          "This style would work well for digital art adaptations",
          "Research the cultural history behind these patterns",
          "Connect with other textile artists in the community",
        ],
        culturalContext:
          "This pattern style is commonly found in Kente cloth traditions from Ghana and similar weaving techniques across West Africa.",
      }

      const analysisMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `**Image Analysis Complete**\n\n**Description:** ${mockAnalysis.description}\n\n**Key Insights:**\n${mockAnalysis.insights.map((insight) => `• ${insight}`).join("\n")}\n\n**Cultural Context:** ${mockAnalysis.culturalContext}\n\n**Suggestions:**\n${mockAnalysis.suggestions.map((suggestion) => `• ${suggestion}`).join("\n")}\n\n**Tags:** ${mockAnalysis.tags.join(", ")}`,
        timestamp: new Date(),
        type: "analysis",
      }

      setMessages((prev) => [...prev, analysisMessage])
      setUploadedImage(null)
      setImagePreview(null)
      setIsLoading(false)
    }, 2500)
  }

  const generateLearningRecommendations = async () => {
    setIsLoading(true)

    // Simulate personalized recommendations
    setTimeout(() => {
      const mockRecommendations: LearningRecommendation[] = [
        {
          id: "1",
          title: "Advanced Digital Marketing for Global Audiences",
          type: "course",
          category: "Marketing",
          difficulty: "Advanced",
          duration: "6h 15m",
          reason: "Based on your completed entrepreneurship course and interest in global business",
          matchScore: 95,
        },
        {
          id: "2",
          title: "Cultural Identity in Modern Business",
          type: "ebook",
          category: "Personal Development",
          difficulty: "Intermediate",
          duration: "3h read",
          reason: "Aligns with your cultural studies interests and business focus",
          matchScore: 88,
        },
        {
          id: "3",
          title: "Cross-Cultural Communication Masterclass",
          type: "video",
          category: "Communication",
          difficulty: "Intermediate",
          duration: "2h 30m",
          reason: "Perfect for your diaspora entrepreneurship journey",
          matchScore: 82,
        },
      ]

      const recommendationsContent = mockRecommendations
        .map(
          (rec) =>
            `**${rec.title}** (${rec.type})\n📊 Match: ${rec.matchScore}% | ⏱️ ${rec.duration} | 📈 ${rec.difficulty}\n💡 ${rec.reason}\n`,
        )
        .join("\n")

      const recommendationMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `**Personalized Learning Recommendations**\n\nBased on your profile and progress, here are my top recommendations:\n\n${recommendationsContent}`,
        timestamp: new Date(),
        type: "recommendation",
      }

      setMessages((prev) => [...prev, recommendationMessage])
      setIsLoading(false)
    }, 2000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[500px] lg:w-[600px] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <SheetTitle>Personal AI Assistant</SheetTitle>
                  <SheetDescription>Your intelligent learning companion</SheetDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span className="hidden sm:inline">{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
              <TabsTrigger value="chat" className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Summary</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Learn</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 flex flex-col min-h-0">
              <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0">
                <ScrollArea className="flex-1 px-6">
                  <div className="space-y-4 py-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.role === "assistant" && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                            {message.role === "assistant" && (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => copyToClipboard(message.content)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        {message.role === "user" && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="p-6 pt-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask me anything about your learning journey..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      disabled={isLoading}
                    />
                    <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="summary" className="flex-1 flex flex-col m-0 p-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Content Summarizer
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Content URL or Title</label>
                        <Input
                          placeholder="Paste URL or enter content title..."
                          value={contentUrl}
                          onChange={(e) => setContentUrl(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={handleContentSummary}
                        disabled={isLoading || !contentUrl.trim()}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing Content...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Summary
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>How it works</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>• Paste a URL to any video, article, or course</li>
                        <li>• AI analyzes the content and extracts key points</li>
                        <li>• Get a concise summary with difficulty level</li>
                        <li>• Save time and focus on what matters most</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="flex-1 flex flex-col m-0 p-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Image Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Upload Image</label>
                        <div
                          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {imagePreview ? (
                            <div className="space-y-2">
                              <img
                                src={imagePreview || "/placeholder.svg"}
                                alt="Preview"
                                className="max-h-32 mx-auto rounded-lg object-cover"
                              />
                              <p className="text-sm text-muted-foreground">Click to change image</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Click to upload an image for analysis</p>
                            </div>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <Button onClick={handleImageAnalysis} disabled={isLoading || !uploadedImage} className="w-full">
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing Image...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Analyze Image
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>• Detailed description and cultural context</li>
                        <li>• Automatic tagging and categorization</li>
                        <li>• Artistic and technical insights</li>
                        <li>• Personalized learning suggestions</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="flex-1 flex flex-col m-0 p-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Learning Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Completed Courses:</span>
                          <p className="text-muted-foreground">{user.learningProgress.completedCourses}</p>
                        </div>
                        <div>
                          <span className="font-medium">Current Level:</span>
                          <p className="text-muted-foreground capitalize">{user.learningProgress.currentLevel}</p>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-sm">Interests:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {user.learningProgress.interests.map((interest) => (
                            <Badge key={interest} variant="secondary">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button onClick={generateLearningRecommendations} disabled={isLoading} className="w-full">
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Recommendations...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Get Personalized Recommendations
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendation Engine</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>• Based on your learning history and progress</li>
                        <li>• Considers your cultural background and interests</li>
                        <li>• Matches difficulty level to your current skills</li>
                        <li>• Updates as you complete more content</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
