"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, BookOpen, Users, TreePine, Plus, Save, Calendar } from "lucide-react"

export function PersonalConnectionSection() {
  const [reflection, setReflection] = useState("")
  const [reflectionCategory, setReflectionCategory] = useState("identity")
  const [savedReflections, setSavedReflections] = useState([
    {
      id: "1",
      date: "2024-01-15",
      reflection:
        "Learning about Ubuntu philosophy has made me reflect on how interconnected we all are. It's changed how I approach relationships and community involvement.",
      category: "philosophy",
    },
    {
      id: "2",
      date: "2024-01-10",
      reflection:
        "Discovering my potential connection to the Akan people through their values of wisdom and craftsmanship resonates deeply with my own interests in art and learning.",
      category: "ancestry",
    },
  ])

  const [favoriteProverbs] = useState([
    "Ubuntu: I am because we are",
    "However far the stream flows, it never forgets its source",
    "It takes a village to raise a child",
  ])

  const [favoriteTribes] = useState(["Yoruba", "Akan", "Zulu"])

  const saveReflection = () => {
    if (reflection.trim()) {
      const newReflection = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        reflection: reflection.trim(),
        category: reflectionCategory,
      }
      setSavedReflections([newReflection, ...savedReflections])
      setReflection("")
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      identity: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      philosophy: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      ancestry: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      culture: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      spirituality: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <section className="py-16 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-rose-600 mr-3" />
            <h2 className="text-3xl sm:text-4xl font-bold text-rose-900 dark:text-rose-100">Personal Connection</h2>
          </div>
          <p className="text-lg text-rose-700 dark:text-rose-300 max-w-3xl mx-auto">
            Build your personal connection to African heritage through reflection, favorites, and ancestral exploration.
          </p>
        </div>

        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="favorites" className="flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              My Favorites
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              Cultural Journal
            </TabsTrigger>
            <TabsTrigger value="ancestry" className="flex items-center">
              <TreePine className="w-4 h-4 mr-2" />
              Ancestry Explorer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Favorite Proverbs */}
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-rose-200 dark:border-rose-800">
                <CardHeader>
                  <CardTitle className="text-xl text-rose-900 dark:text-rose-100 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Favorite Proverbs
                  </CardTitle>
                  <CardDescription className="text-rose-600 dark:text-rose-400">
                    Wisdom that resonates with you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {favoriteProverbs.map((proverb, index) => (
                      <div
                        key={index}
                        className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-lg border border-rose-200 dark:border-rose-800"
                      >
                        <blockquote className="text-sm italic text-rose-800 dark:text-rose-200">"{proverb}"</blockquote>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 text-rose-600 border-rose-300 hover:bg-rose-50 bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add More Proverbs
                  </Button>
                </CardContent>
              </Card>

              {/* Favorite Tribes */}
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-rose-200 dark:border-rose-800">
                <CardHeader>
                  <CardTitle className="text-xl text-rose-900 dark:text-rose-100 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Favorite Tribes & Peoples
                  </CardTitle>
                  <CardDescription className="text-rose-600 dark:text-rose-400">
                    Cultures you feel connected to
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {favoriteTribes.map((tribe) => (
                      <Badge key={tribe} className="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                        {tribe}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-rose-600 border-rose-300 hover:bg-rose-50 bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Explore More Tribes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="journal">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* New Reflection */}
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-rose-200 dark:border-rose-800">
                <CardHeader>
                  <CardTitle className="text-xl text-rose-900 dark:text-rose-100">New Reflection</CardTitle>
                  <CardDescription className="text-rose-600 dark:text-rose-400">
                    Share your thoughts on African culture and identity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-rose-800 dark:text-rose-200 mb-2 block">
                        Category
                      </label>
                      <select
                        value={reflectionCategory}
                        onChange={(e) => setReflectionCategory(e.target.value)}
                        className="w-full p-2 border border-rose-300 rounded-md bg-white dark:bg-gray-800 text-rose-900 dark:text-rose-100"
                      >
                        <option value="identity">Cultural Identity</option>
                        <option value="philosophy">Philosophy & Wisdom</option>
                        <option value="ancestry">Ancestral Connection</option>
                        <option value="culture">Cultural Practices</option>
                        <option value="spirituality">Spirituality</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-rose-800 dark:text-rose-200 mb-2 block">
                        Your Reflection
                      </label>
                      <Textarea
                        placeholder="What aspects of African culture resonate with you? How do you connect with your heritage? Share your thoughts..."
                        value={reflection}
                        onChange={(e) => setReflection(e.target.value)}
                        className="min-h-[120px] border-rose-300 focus:border-rose-500"
                      />
                    </div>

                    <Button
                      onClick={saveReflection}
                      disabled={!reflection.trim()}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Reflection
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Saved Reflections */}
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-rose-200 dark:border-rose-800">
                <CardHeader>
                  <CardTitle className="text-xl text-rose-900 dark:text-rose-100">Your Reflections</CardTitle>
                  <CardDescription className="text-rose-600 dark:text-rose-400">
                    Your journey of cultural discovery
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {savedReflections.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-rose-50 dark:bg-rose-900/30 rounded-lg border border-rose-200 dark:border-rose-800"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getCategoryColor(item.category)} size="sm">
                            {item.category}
                          </Badge>
                          <div className="flex items-center text-xs text-rose-600 dark:text-rose-400">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(item.date).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm text-rose-800 dark:text-rose-200">{item.reflection}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ancestry">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ancestry Connections */}
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-rose-200 dark:border-rose-800">
                <CardHeader>
                  <CardTitle className="text-xl text-rose-900 dark:text-rose-100 flex items-center">
                    <TreePine className="w-5 h-5 mr-2" />
                    Potential Ancestral Connections
                  </CardTitle>
                  <CardDescription className="text-rose-600 dark:text-rose-400">
                    Based on cultural affinity and research
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/30 rounded-lg border border-rose-200 dark:border-rose-800">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-rose-900 dark:text-rose-100">West Africa</h4>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          High Confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-rose-700 dark:text-rose-300 mb-2">
                        Strong cultural resonance with Yoruba and Akan traditions
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" size="sm">
                          Yoruba
                        </Badge>
                        <Badge variant="outline" size="sm">
                          Akan
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 bg-rose-50 dark:bg-rose-900/30 rounded-lg border border-rose-200 dark:border-rose-800">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-rose-900 dark:text-rose-100">Southern Africa</h4>
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Medium Confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-rose-700 dark:text-rose-300 mb-2">
                        Ubuntu philosophy alignment suggests possible connections
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" size="sm">
                          Zulu
                        </Badge>
                        <Badge variant="outline" size="sm">
                          Xhosa
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4 text-rose-600 border-rose-300 hover:bg-rose-50 bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Upload DNA Results
                  </Button>
                </CardContent>
              </Card>

              {/* Family Tree Builder */}
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-rose-200 dark:border-rose-800">
                <CardHeader>
                  <CardTitle className="text-xl text-rose-900 dark:text-rose-100">Family Tree Builder</CardTitle>
                  <CardDescription className="text-rose-600 dark:text-rose-400">
                    Document your known family history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TreePine className="w-16 h-16 text-rose-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-rose-900 dark:text-rose-100 mb-2">
                      Start Your Family Tree
                    </h3>
                    <p className="text-sm text-rose-600 dark:text-rose-400 mb-4">
                      Begin documenting your family history and ancestral connections
                    </p>
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Family Members
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
