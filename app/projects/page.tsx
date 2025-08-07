"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProjectCard } from "@/components/projects/project-card"
import { ProjectFiltersComponent } from "@/components/projects/project-filters"
import { ProjectDetailModal } from "@/components/projects/project-detail-modal"
import { CreateProjectFormComponent } from "@/components/projects/create-project-form"
import { sampleProjects } from "@/data/projects-data"
import type { Project, ProjectFilters, ProjectSortBy, CreateProjectForm } from "@/types/project"
import { FolderOpen, TrendingUp, Users, Target, Lightbulb, Globe, Heart, Zap } from "lucide-react"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(sampleProjects)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [filters, setFilters] = useState<ProjectFilters>({
    search: "",
    category: "All",
    region: "All",
    status: "All",
    teamSize: "Any",
    impactScale: "Any",
  })
  const [sortBy, setSortBy] = useState<ProjectSortBy>("Most Viewed")

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    const filtered = projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.tags.some((tag) => tag.toLowerCase().includes(filters.search.toLowerCase()))

      const matchesCategory = filters.category === "All" || project.category === filters.category
      const matchesRegion = filters.region === "All" || project.region === filters.region
      const matchesStatus = filters.status === "All" || project.status === filters.status

      const matchesTeamSize =
        filters.teamSize === "Any" ||
        (filters.teamSize === "Small (1-5)" && project.teamSize <= 5) ||
        (filters.teamSize === "Medium (6-15)" && project.teamSize >= 6 && project.teamSize <= 15) ||
        (filters.teamSize === "Large (16+)" && project.teamSize >= 16)

      const matchesImpactScale = filters.impactScale === "Any" || project.impactScale === filters.impactScale

      return matchesSearch && matchesCategory && matchesRegion && matchesStatus && matchesTeamSize && matchesImpactScale
    })

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "Most Viewed":
          return b.views - a.views
        case "Newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "Top Rated":
          return b.rating - a.rating
        case "Ending Soon":
          if (!a.endDate && !b.endDate) return 0
          if (!a.endDate) return 1
          if (!b.endDate) return -1
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        case "Most Funded":
          const aFunding = a.funding ? a.funding.raised / a.funding.target : 0
          const bFunding = b.funding ? b.funding.raised / b.funding.target : 0
          return bFunding - aFunding
        default:
          return 0
      }
    })

    return filtered
  }, [projects, filters, sortBy])

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project)
    setIsDetailModalOpen(true)
  }

  const handleJoinProject = (projectId: string) => {
    console.log("Joining project:", projectId)
    // Implement join project logic
  }

  const handleFollowProject = (projectId: string) => {
    console.log("Following project:", projectId)
    // Implement follow project logic
  }

  const handleCreateProject = (projectData: CreateProjectForm) => {
    console.log("Creating project:", projectData)
    // Implement create project logic
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "All",
      region: "All",
      status: "All",
      teamSize: "Any",
      impactScale: "Any",
    })
  }

  // Calculate stats
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "Active").length,
    totalFunding: projects.reduce((sum, p) => sum + (p.funding?.raised || 0), 0),
    totalMembers: projects.reduce((sum, p) => sum + p.teamSize, 0),
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <FolderOpen className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Projects</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Build with purpose. Collaborate with community. Create impact.
          </p>
          <CreateProjectFormComponent onSubmit={handleCreateProject} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{stats.totalProjects}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold">{stats.activeProjects}</p>
                </div>
                <Zap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Funding</p>
                  <p className="text-2xl font-bold">${(stats.totalFunding / 1000000).toFixed(1)}M</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold">{stats.totalMembers}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <ProjectFiltersComponent
            filters={filters}
            sortBy={sortBy}
            onFiltersChange={setFilters}
            onSortChange={setSortBy}
            onClearFilters={clearFilters}
            resultsCount={filteredAndSortedProjects.length}
          />
        </div>

        {/* Projects Grid */}
        {filteredAndSortedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredAndSortedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewDetails={handleViewDetails}
                onJoinProject={handleJoinProject}
                onFollowProject={handleFollowProject}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or create a new project to get started.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-8 text-center">
            <Lightbulb className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Have a Project Idea?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join our community of innovators and changemakers. Start your project today and connect with like-minded
              individuals who share your vision for positive impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CreateProjectFormComponent onSubmit={handleCreateProject} />
              <Button variant="outline" size="lg">
                <Globe className="mr-2 h-4 w-4" />
                Explore Community
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-center mb-8">Why Choose Our Platform?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-yellow-600 mb-2" />
                <CardTitle className="text-lg">Global Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with diaspora professionals and local innovators worldwide to build impactful solutions.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-yellow-600 mb-2" />
                <CardTitle className="text-lg">Purpose-Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Focus on projects that create meaningful change and positive impact in communities.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Heart className="h-8 w-8 text-yellow-600 mb-2" />
                <CardTitle className="text-lg">Community Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get support, funding, and resources from a community that believes in your vision.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Project Detail Modal */}
        <ProjectDetailModal
          project={selectedProject}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onJoinProject={handleJoinProject}
          onFollowProject={handleFollowProject}
        />
      </div>
    </div>
  )
}
