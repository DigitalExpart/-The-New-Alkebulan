"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import {
  DnaIcon as DNA,
  TreePine,
  Star,
  ShoppingCart,
  Clock,
  MapPin,
  Users,
  Heart,
  Camera,
  Plus,
  Edit,
  Calendar,
  Globe,
  Award,
  Sparkles,
  CheckCircle,
  Circle,
  Package,
  FlaskConical,
  FileText,
} from "lucide-react"
import {
  dnaTestKit,
  mockDNATestStatus,
  mockEthnicityResults,
  mockTribalConnections,
  mockHeritageInsights,
  mockFamilyMembers,
  getHeritageProgress,
  getCompletedSteps,
  getTotalSteps,
} from "@/data/heritage-data"
import type { FamilyMember } from "@/types/heritage"

export function HeritageSection() {
  const [heritageProgress, setHeritageProgress] = useState(0)
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMember, setNewMember] = useState<Partial<FamilyMember>>({
    name: "",
    relationship: "",
    birthDate: "",
    birthPlace: "",
    biography: "",
    legacyNotes: "",
  })

  useEffect(() => {
    setHeritageProgress(getHeritageProgress())
  }, [])

  const handleAddMember = () => {
    if (newMember.name && newMember.relationship) {
      // In a real app, this would save to a database
      console.log("Adding new family member:", newMember)
      setIsAddingMember(false)
      setNewMember({
        name: "",
        relationship: "",
        birthDate: "",
        birthPlace: "",
        biography: "",
        legacyNotes: "",
      })
    }
  }

  const StepIcon = ({ isCompleted, isActive }: { isCompleted: boolean; isActive: boolean }) => {
    if (isCompleted) {
      return <CheckCircle className="w-6 h-6 text-green-500" />
    } else if (isActive) {
      return <Circle className="w-6 h-6 text-blue-500 fill-blue-100" />
    } else {
      return <Circle className="w-6 h-6 text-gray-300" />
    }
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <DNA className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">My Heritage</CardTitle>
              <p className="text-gray-600 dark:text-gray-300">Discover your roots and build your family legacy</p>
            </div>
          </div>
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">{heritageProgress}% Complete</Badge>
        </div>
        <Progress value={heritageProgress} className="mt-4" />
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="dna-testing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dna-testing" className="flex items-center gap-2">
              <DNA className="w-4 h-4" />
              DNA Testing
            </TabsTrigger>
            <TabsTrigger value="my-results" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              My Results
            </TabsTrigger>
            <TabsTrigger value="family-tree" className="flex items-center gap-2">
              <TreePine className="w-4 h-4" />
              Family Tree
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dna-testing" className="space-y-6">
            {/* DNA Test Progress */}
            <Card className="border border-amber-200 bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-amber-600" />
                  DNA Test Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">
                      Step {mockDNATestStatus.currentStep} of {getTotalSteps()}
                    </span>
                    <span className="text-sm text-gray-500">{getCompletedSteps()} completed</span>
                  </div>

                  <div className="space-y-3">
                    {mockDNATestStatus.steps.map((step, index) => {
                      const isActive = index === mockDNATestStatus.currentStep
                      const isCompleted = step.isCompleted

                      return (
                        <div key={step.id} className="flex items-start gap-3">
                          <StepIcon isCompleted={isCompleted} isActive={isActive} />
                          <div className="flex-1">
                            <h4
                              className={`font-medium ${isCompleted ? "text-green-700 dark:text-green-400" : isActive ? "text-blue-700 dark:text-blue-400" : "text-gray-500"}`}
                            >
                              {step.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{step.description}</p>
                            {step.completedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Completed: {new Date(step.completedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DNA Kit Product Showcase */}
            <Card className="border border-amber-200 bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-600" />
                  {dnaTestKit.name}
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">{dnaTestKit.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Images Carousel */}
                <Carousel className="w-full max-w-md mx-auto">
                  <CarouselContent>
                    {dnaTestKit.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-square rounded-lg overflow-hidden">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`${dnaTestKit.name} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>

                {/* Features */}
                <div>
                  <h4 className="font-semibold mb-3">What's Included:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {dnaTestKit.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing and CTA */}
                <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-amber-600">${dnaTestKit.price}</span>
                      <span className="text-sm text-gray-500">{dnaTestKit.currency}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Processing time: {dnaTestKit.processingTime}
                    </p>
                  </div>
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Order Kit
                  </Button>
                </div>

                {/* Reviews */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(dnaTestKit.averageRating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{dnaTestKit.averageRating}</span>
                    <span className="text-sm text-gray-500">({dnaTestKit.totalReviews.toLocaleString()} reviews)</span>
                  </div>

                  <div className="space-y-4">
                    {dnaTestKit.reviews.slice(0, 2).map((review) => (
                      <div key={review.id} className="border-l-4 border-amber-200 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={review.userAvatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {review.userName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{review.userName}</span>
                          {review.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <div className="flex items-center gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-results" className="space-y-6">
            {mockDNATestStatus.currentStep >= 5 ? (
              <>
                {/* Ethnicity Breakdown */}
                <Card className="border border-amber-200 bg-white dark:bg-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-amber-600" />
                      Ethnicity Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockEthnicityResults.map((result, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{result.region}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{result.percentage}%</span>
                              <Badge variant="secondary" className="text-xs">
                                {result.confidence}% confidence
                              </Badge>
                            </div>
                          </div>
                          <Progress value={result.percentage} className="h-3" />
                          <p className="text-sm text-gray-600 dark:text-gray-300">{result.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tribal Connections */}
                <Card className="border border-amber-200 bg-white dark:bg-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-amber-600" />
                      Tribal Connections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockTribalConnections.map((connection, index) => (
                        <Card key={index} className="border border-gray-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{connection.tribe}</CardTitle>
                              <Badge className="bg-amber-100 text-amber-800">{connection.matchPercentage}% match</Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {connection.region}
                            </p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm mb-3">{connection.description}</p>
                            <div>
                              <h5 className="font-medium text-sm mb-2">Cultural Notes:</h5>
                              <ul className="text-xs space-y-1">
                                {connection.culturalNotes.map((note, noteIndex) => (
                                  <li key={noteIndex} className="flex items-start gap-2">
                                    <div className="w-1 h-1 bg-amber-500 rounded-full mt-2"></div>
                                    <span>{note}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Heritage Insights */}
                <Card className="border border-amber-200 bg-white dark:bg-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      Heritage Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockHeritageInsights.map((insight, index) => (
                        <Card key={index} className="border border-gray-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">
                                {insight.category}
                              </Badge>
                              <CardTitle className="text-lg">{insight.title}</CardTitle>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{insight.description}</p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <ul className="text-sm space-y-2">
                              {insight.details.map((detail, detailIndex) => (
                                <li key={detailIndex} className="flex items-start gap-2">
                                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2"></div>
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-xs text-gray-500">Related regions:</span>
                              {insight.relatedRegions.map((region, regionIndex) => (
                                <Badge key={regionIndex} variant="secondary" className="text-xs">
                                  {region}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border border-amber-200 bg-white dark:bg-slate-800">
                <CardContent className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Results Not Ready Yet</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Your DNA analysis is still in progress. Results will be available once your sample has been
                    processed.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>
                      Estimated completion:{" "}
                      {mockDNATestStatus.estimatedCompletion
                        ? new Date(mockDNATestStatus.estimatedCompletion).toLocaleDateString()
                        : "TBD"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="family-tree" className="space-y-6">
            {/* Family Tree Overview */}
            <Card className="border border-amber-200 bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TreePine className="w-5 h-5 text-amber-600" />
                    My Family Tree
                  </CardTitle>
                  <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Family Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Family Member</DialogTitle>
                        <DialogDescription>Add a new family member to your tree</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            value={newMember.name || ""}
                            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                            placeholder="Full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="relationship">Relationship *</Label>
                          <Input
                            id="relationship"
                            value={newMember.relationship || ""}
                            onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                            placeholder="e.g., Mother, Uncle, Cousin"
                          />
                        </div>
                        <div>
                          <Label htmlFor="birthDate">Birth Date</Label>
                          <Input
                            id="birthDate"
                            type="date"
                            value={newMember.birthDate || ""}
                            onChange={(e) => setNewMember({ ...newMember, birthDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="birthPlace">Birth Place</Label>
                          <Input
                            id="birthPlace"
                            value={newMember.birthPlace || ""}
                            onChange={(e) => setNewMember({ ...newMember, birthPlace: e.target.value })}
                            placeholder="City, State/Country"
                          />
                        </div>
                        <div>
                          <Label htmlFor="biography">Biography</Label>
                          <Textarea
                            id="biography"
                            value={newMember.biography || ""}
                            onChange={(e) => setNewMember({ ...newMember, biography: e.target.value })}
                            placeholder="Tell their story..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleAddMember} className="flex-1">
                            Add Member
                          </Button>
                          <Button variant="outline" onClick={() => setIsAddingMember(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Family Members by Generation */}
                <div className="space-y-8">
                  {/* Grandparents Generation */}
                  <div>
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-600" />
                      Grandparents Generation
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockFamilyMembers
                        .filter((member) => member.generation === 3)
                        .map((member) => (
                          <Card
                            key={member.id}
                            className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedMember(member)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={member.photo || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {member.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h5 className="font-medium">{member.name}</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{member.relationship}</p>
                                  {member.birthDate && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(member.birthDate).getFullYear()}
                                      {member.deathDate && ` - ${new Date(member.deathDate).getFullYear()}`}
                                    </p>
                                  )}
                                  {member.birthPlace && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {member.birthPlace}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>

                  {/* Parents Generation */}
                  <div>
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-amber-600" />
                      Parents Generation
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockFamilyMembers
                        .filter((member) => member.generation === 2)
                        .map((member) => (
                          <Card
                            key={member.id}
                            className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedMember(member)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={member.photo || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {member.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h5 className="font-medium">{member.name}</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{member.relationship}</p>
                                  {member.birthDate && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(member.birthDate).getFullYear()}
                                    </p>
                                  )}
                                  {member.birthPlace && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {member.birthPlace}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>

                  {/* Your Generation */}
                  <div>
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-amber-600" />
                      Your Generation
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockFamilyMembers
                        .filter((member) => member.generation === 1)
                        .map((member) => (
                          <Card
                            key={member.id}
                            className="border border-amber-200 bg-amber-50 dark:bg-amber-900/20 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedMember(member)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={member.photo || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {member.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h5 className="font-medium">{member.name}</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{member.relationship}</p>
                                  {member.birthDate && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(member.birthDate).getFullYear()}
                                    </p>
                                  )}
                                  {member.birthPlace && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {member.birthPlace}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Family Member Detail Modal */}
            <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
              <DialogContent className="max-w-2xl">
                {selectedMember && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={selectedMember.photo || "/placeholder.svg"} />
                          <AvatarFallback>
                            {selectedMember.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl">{selectedMember.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{selectedMember.relationship}</p>
                        </div>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Basic Info */}
                      <div className="grid grid-cols-2 gap-4">
                        {selectedMember.birthDate && (
                          <div>
                            <Label className="text-sm font-medium">Birth Date</Label>
                            <p className="text-sm">{new Date(selectedMember.birthDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        {selectedMember.deathDate && (
                          <div>
                            <Label className="text-sm font-medium">Death Date</Label>
                            <p className="text-sm">{new Date(selectedMember.deathDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        {selectedMember.birthPlace && (
                          <div className="col-span-2">
                            <Label className="text-sm font-medium">Birth Place</Label>
                            <p className="text-sm">{selectedMember.birthPlace}</p>
                          </div>
                        )}
                      </div>

                      {/* Biography */}
                      {selectedMember.biography && (
                        <div>
                          <Label className="text-sm font-medium">Biography</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{selectedMember.biography}</p>
                        </div>
                      )}

                      {/* Legacy Notes */}
                      {selectedMember.legacyNotes && (
                        <div>
                          <Label className="text-sm font-medium">Legacy Notes</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{selectedMember.legacyNotes}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Camera className="w-4 h-4 mr-2" />
                          Add Photo
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
