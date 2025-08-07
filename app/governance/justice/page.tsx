"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Scale,
  FileText,
  AlertTriangle,
  Eye,
  Gavel,
  Upload,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  MessageCircle,
  Flag,
  Plus,
  Edit,
  Trash2,
  Download,
  ExternalLink,
  Shield,
  BookOpen,
  Video,
  ImageIcon,
  File,
} from "lucide-react"
import {
  naturalLawPrinciples,
  sampleIncidentReports,
  sampleCaseFileEntries,
  samplePublicMisconductPosts,
  sampleCourtRequests,
  justiceStats,
} from "@/data/justice-data"

export default function JusticePage() {
  const [activeTab, setActiveTab] = useState("natural-law")
  const [expandedPrinciples, setExpandedPrinciples] = useState<string[]>([])
  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    isAnonymous: false,
  })
  const [caseFileForm, setCaseFileForm] = useState({
    title: "",
    description: "",
    date: "",
    category: "",
    tags: "",
  })
  const [courtRequestForm, setCourtRequestForm] = useState({
    incidentId: "",
    caseSummary: "",
    naturalLawPrinciples: [] as string[],
    desiredOutcome: "",
    priority: "medium",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilters, setSelectedFilters] = useState({
    category: "",
    region: "",
    dateRange: "",
  })

  const togglePrinciple = (id: string) => {
    setExpandedPrinciples((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-4 h-4" />
      case "video":
        return <Video className="w-4 h-4" />
      case "image":
        return <ImageIcon className="w-4 h-4" />
      case "article":
        return <BookOpen className="w-4 h-4" />
      default:
        return <File className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      fundamental: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      rights: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      responsibilities: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      procedures: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      under_review: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      submitted: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      scheduled: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      in_progress: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      dismissed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Scale className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Justice System</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          A comprehensive platform for natural law education, incident reporting, case management, and community
          justice.
        </p>
      </div>

      {/* Justice Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{justiceStats.totalReports}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved Cases</p>
                <p className="text-2xl font-bold">{justiceStats.resolvedCases}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Cases</p>
                <p className="text-2xl font-bold">{justiceStats.activeInvestigations}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Community Trust</p>
                <p className="text-2xl font-bold">{justiceStats.communityTrust}%</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Resolution</p>
                <p className="text-2xl font-bold">{justiceStats.averageResolutionTime}</p>
              </div>
              <Calendar className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold">{justiceStats.userSatisfaction}%</p>
              </div>
              <ThumbsUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="natural-law" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Natural Law
          </TabsTrigger>
          <TabsTrigger value="report-incident" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Report Incident
          </TabsTrigger>
          <TabsTrigger value="case-file" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            My Case File
          </TabsTrigger>
          <TabsTrigger value="public-misconduct" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Public Misconduct
          </TabsTrigger>
          <TabsTrigger value="natural-court" className="flex items-center gap-2">
            <Gavel className="w-4 h-4" />
            Natural Court
          </TabsTrigger>
        </TabsList>

        {/* Natural Law Tab */}
        <TabsContent value="natural-law" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Natural Law Principles
              </CardTitle>
              <CardDescription>Learn about the fundamental principles that guide our justice system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {naturalLawPrinciples.map((principle) => (
                  <Card key={principle.id} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{principle.title}</h3>
                          <Badge className={getCategoryColor(principle.category)}>{principle.category}</Badge>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => togglePrinciple(principle.id)}>
                          {expandedPrinciples.includes(principle.id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-muted-foreground">{principle.description}</p>
                    </CardHeader>

                    {expandedPrinciples.includes(principle.id) && (
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Examples */}
                          <div>
                            <h4 className="font-medium mb-2">Practical Examples:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {principle.examples.map((example, index) => (
                                <li key={index}>{example}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Resources */}
                          {principle.resources.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Resources:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {principle.resources.map((resource) => (
                                  <div key={resource.id} className="flex items-center gap-2 p-2 border rounded-lg">
                                    {getResourceIcon(resource.type)}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{resource.title}</p>
                                      <p className="text-xs text-muted-foreground">{resource.description}</p>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      <ExternalLink className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Related Principles */}
                          {principle.relatedPrinciples.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Related Principles:</h4>
                              <div className="flex flex-wrap gap-2">
                                {principle.relatedPrinciples.map((relatedId) => {
                                  const related = naturalLawPrinciples.find((p) => p.id === relatedId)
                                  return related ? (
                                    <Badge key={relatedId} variant="outline" className="cursor-pointer">
                                      {related.title}
                                    </Badge>
                                  ) : null
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Incident Tab */}
        <TabsContent value="report-incident" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Report an Incident
              </CardTitle>
              <CardDescription>Submit a secure report of injustice or misconduct</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="incident-title">Subject/Title *</Label>
                    <Input
                      id="incident-title"
                      placeholder="Brief description of the incident"
                      value={reportForm.title}
                      onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incident-category">Category *</Label>
                    <Select
                      value={reportForm.category}
                      onValueChange={(value) => setReportForm({ ...reportForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discrimination">Discrimination</SelectItem>
                        <SelectItem value="harassment">Harassment</SelectItem>
                        <SelectItem value="fraud">Fraud</SelectItem>
                        <SelectItem value="violence">Violence</SelectItem>
                        <SelectItem value="corruption">Corruption</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incident-description">Description *</Label>
                  <Textarea
                    id="incident-description"
                    placeholder="Provide detailed information about the incident..."
                    rows={4}
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="incident-date">Date *</Label>
                    <Input
                      id="incident-date"
                      type="date"
                      value={reportForm.date}
                      onChange={(e) => setReportForm({ ...reportForm, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incident-time">Time</Label>
                    <Input
                      id="incident-time"
                      type="time"
                      value={reportForm.time}
                      onChange={(e) => setReportForm({ ...reportForm, time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incident-location">Location</Label>
                    <Input
                      id="incident-location"
                      placeholder="Where did this occur?"
                      value={reportForm.location}
                      onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>File Upload</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
                    <p className="text-xs text-muted-foreground">
                      Supports images, documents, and videos (max 10MB each)
                    </p>
                    <Button variant="outline" className="mt-2 bg-transparent">
                      Choose Files
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={reportForm.isAnonymous}
                    onCheckedChange={(checked) => setReportForm({ ...reportForm, isAnonymous: checked as boolean })}
                  />
                  <Label htmlFor="anonymous" className="text-sm">
                    Submit anonymously (your identity will be protected)
                  </Label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    Submit Report
                  </Button>
                  <Button type="button" variant="outline">
                    Save Draft
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Case File Tab */}
        <TabsContent value="case-file" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">My Case File</h2>
              <p className="text-muted-foreground">Manage your personal justice-related documents and entries</p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Entry
            </Button>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search case file entries..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="evidence">Evidence</SelectItem>
                    <SelectItem value="correspondence">Correspondence</SelectItem>
                    <SelectItem value="legal_document">Legal Documents</SelectItem>
                    <SelectItem value="witness_statement">Witness Statements</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Case File Entries */}
          <div className="space-y-4">
            {sampleCaseFileEntries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{entry.title}</h3>
                        <Badge className={getCategoryColor(entry.category)}>{entry.category.replace("_", " ")}</Badge>
                      </div>
                      <p className="text-muted-foreground">{entry.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {entry.tags.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Public Misconduct Tab */}
        <TabsContent value="public-misconduct" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Public Misconduct Reports</h2>
              <p className="text-muted-foreground">Community-reported incidents and misconduct cases</p>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="Search reports..." className="pl-10" />
                </div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="discrimination">Discrimination</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="fraud">Fraud</SelectItem>
                    <SelectItem value="violence">Violence</SelectItem>
                    <SelectItem value="corruption">Corruption</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="central">Central District</SelectItem>
                    <SelectItem value="north">North District</SelectItem>
                    <SelectItem value="south">South District</SelectItem>
                    <SelectItem value="east">East District</SelectItem>
                    <SelectItem value="west">West District</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Public Reports */}
          <div className="space-y-4">
            {samplePublicMisconductPosts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{post.title}</h3>
                        <Badge className={getCategoryColor(post.category)}>{post.category}</Badge>
                        <Badge variant="outline">{post.type}</Badge>
                      </div>
                      <p className="text-muted-foreground">{post.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {post.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.region}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-green-600">
                          <ThumbsUp className="w-4 h-4" />
                          {post.reactions.support}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-orange-600">
                          <AlertCircle className="w-4 h-4" />
                          {post.reactions.concern}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-600">
                          <MessageCircle className="w-4 h-4" />
                          {post.reactions.question}
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments.length} Comments
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Natural Court Tab */}
        <TabsContent value="natural-court" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Natural Court</h2>
              <p className="text-muted-foreground">Request formal hearings under Natural Law principles</p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Request
            </Button>
          </div>

          {/* Court Request Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="w-5 h-5" />
                Submit Court Request
              </CardTitle>
              <CardDescription>Request a formal hearing for your case under Natural Law</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="incident-reference">Reference Incident (Optional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a previously reported incident" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleIncidentReports.map((report) => (
                        <SelectItem key={report.id} value={report.id}>
                          {report.title} - {new Date(report.date).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="case-summary">Case Summary *</Label>
                  <Textarea
                    id="case-summary"
                    placeholder="Provide a comprehensive summary of your case..."
                    rows={4}
                    value={courtRequestForm.caseSummary}
                    onChange={(e) => setCourtRequestForm({ ...courtRequestForm, caseSummary: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Relevant Natural Law Principles *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-4">
                    {naturalLawPrinciples.map((principle) => (
                      <div key={principle.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`principle-${principle.id}`}
                          checked={courtRequestForm.naturalLawPrinciples.includes(principle.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCourtRequestForm({
                                ...courtRequestForm,
                                naturalLawPrinciples: [...courtRequestForm.naturalLawPrinciples, principle.id],
                              })
                            } else {
                              setCourtRequestForm({
                                ...courtRequestForm,
                                naturalLawPrinciples: courtRequestForm.naturalLawPrinciples.filter(
                                  (id) => id !== principle.id,
                                ),
                              })
                            }
                          }}
                        />
                        <Label htmlFor={`principle-${principle.id}`} className="text-sm">
                          {principle.title}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desired-outcome">Desired Outcome *</Label>
                  <Textarea
                    id="desired-outcome"
                    placeholder="What resolution are you seeking?"
                    rows={3}
                    value={courtRequestForm.desiredOutcome}
                    onChange={(e) => setCourtRequestForm({ ...courtRequestForm, desiredOutcome: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select
                    value={courtRequestForm.priority}
                    onValueChange={(value) => setCourtRequestForm({ ...courtRequestForm, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Non-urgent matter</SelectItem>
                      <SelectItem value="medium">Medium - Standard processing</SelectItem>
                      <SelectItem value="high">High - Urgent attention needed</SelectItem>
                      <SelectItem value="critical">Critical - Immediate action required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Evidence Upload</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Upload supporting evidence and documents</p>
                    <Button variant="outline">Choose Files</Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    Submit Court Request
                  </Button>
                  <Button type="button" variant="outline">
                    Save Draft
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Existing Court Requests */}
          <Card>
            <CardHeader>
              <CardTitle>My Court Requests</CardTitle>
              <CardDescription>Track the status of your submitted requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleCourtRequests.map((request) => (
                  <Card key={request.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(request.status)}>{request.status.replace("_", " ")}</Badge>
                            <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{request.caseSummary}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Timeline: {request.estimatedTimeline}
                            </div>
                            {request.assignedArbitrator && (
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {request.assignedArbitrator}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardHeader>
                    {request.hearingDate && (
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">
                            Hearing scheduled for {new Date(request.hearingDate).toLocaleDateString()} at{" "}
                            {new Date(request.hearingDate).toLocaleTimeString()}
                          </span>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
