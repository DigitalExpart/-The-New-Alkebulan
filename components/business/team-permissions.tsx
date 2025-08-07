"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  UserPlus,
  MoreHorizontal,
  Mail,
  Shield,
  Eye,
  Trash2,
  Crown,
  UserX,
  Search,
  Filter,
  Grid3X3,
  GitBranch,
  MessageCircle,
  Phone,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronRight,
  Building2,
} from "lucide-react"
import type { TeamMember, Department } from "@/types/business"

interface TeamPermissionsProps {
  teamMembers?: TeamMember[]
  departments?: Department[]
}

export function TeamPermissions({ teamMembers = [], departments = [] }: TeamPermissionsProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "viewer">("viewer")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedLocation, setSelectedLocation] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"name" | "role" | "department" | "joined">("name")
  const [viewMode, setViewMode] = useState<"grid" | "chart">("grid")
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["1"]))

  // Get unique locations for filter
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(teamMembers.map((member) => member.location))]
    return uniqueLocations.sort()
  }, [teamMembers])

  // Filter and sort team members
  const filteredMembers = useMemo(() => {
    const filtered = teamMembers.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.functionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.specialization.some((spec) => spec.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesDepartment = selectedDepartment === "all" || member.department === selectedDepartment
      const matchesLocation = selectedLocation === "all" || member.location === selectedLocation

      return matchesSearch && matchesDepartment && matchesLocation
    })

    // Sort members
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "role":
          return a.hierarchyLevel - b.hierarchyLevel
        case "department":
          return a.department.localeCompare(b.department)
        case "joined":
          return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [teamMembers, searchQuery, selectedDepartment, selectedLocation, sortBy])

  // Build organizational hierarchy
  const organizationHierarchy = useMemo(() => {
    const memberMap = new Map(teamMembers.map((member) => [member.id, member]))
    const hierarchy: any = {}

    // Find root members (those without reportsTo)
    const rootMembers = teamMembers.filter((member) => !member.reportsTo)

    const buildHierarchy = (member: TeamMember): any => {
      const directReports = teamMembers.filter((m) => m.reportsTo === member.id).map(buildHierarchy)

      return {
        ...member,
        children: directReports,
      }
    }

    return rootMembers.map(buildHierarchy)
  }, [teamMembers])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4" />
      case "lead":
        return <Shield className="h-4 w-4" />
      case "manager":
        return <Building2 className="h-4 w-4" />
      case "admin":
        return <Shield className="h-4 w-4" />
      case "member":
        return <Users className="h-4 w-4" />
      case "viewer":
        return <Eye className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "lead":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "manager":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "admin":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "member":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      case "viewer":
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getDepartmentColor = (departmentName: string) => {
    const dept = departments.find((d) => d.name === departmentName)
    return dept?.color || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
  }

  const handleInvite = () => {
    console.log("Inviting:", inviteEmail, "as", inviteRole)
    setInviteEmail("")
    setInviteRole("viewer")
    setIsInviteOpen(false)
  }

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderOrgChartNode = (member: any, level = 0) => {
    const isExpanded = expandedNodes.has(member.id)
    const hasChildren = member.children && member.children.length > 0

    return (
      <div key={member.id} className="flex flex-col">
        <div
          className={`flex items-center space-x-2 p-3 rounded-lg border bg-card hover:shadow-md transition-shadow ${level > 0 ? "ml-8" : ""}`}
        >
          {hasChildren && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleNode(member.id)}>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}

          <Avatar className="h-10 w-10">
            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
            <AvatarFallback>
              {member.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium truncate">{member.name}</h4>
              <Badge className={`${getRoleColor(member.role)} flex items-center gap-1 text-xs`}>
                {getRoleIcon(member.role)}
                {member.role}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">{member.functionTitle}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className={`text-xs ${getDepartmentColor(member.department)}`}>
                {member.department}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {member.location}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {member.contactPreferences.email && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Mail className="h-4 w-4" />
              </Button>
            )}
            {member.contactPreferences.directMessage && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MessageCircle className="h-4 w-4" />
              </Button>
            )}
            {member.contactPreferences.phone && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Phone className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {member.children.map((child: any) => renderOrgChartNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Handle empty state
  if (!teamMembers || teamMembers.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team & Permissions
            </CardTitle>
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={(value: "admin" | "viewer") => setInviteRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin - Can manage products and orders</SelectItem>
                        <SelectItem value="viewer">Viewer - Can view reports and analytics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInvite} disabled={!inviteEmail}>
                      Send Invitation
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Team Members</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start building your team by inviting members to collaborate on your business.
            </p>
            <Button onClick={() => setIsInviteOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Your First Member
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team & Permissions
              <Badge variant="secondary" className="ml-2">
                {teamMembers.length} {teamMembers.length === 1 ? "member" : "members"}
              </Badge>
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(value: "grid" | "chart") => setViewMode(value)} className="w-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grid" className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="chart" className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Org Chart
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={(value: "admin" | "viewer") => setInviteRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin - Can manage products and orders</SelectItem>
                        <SelectItem value="viewer">Viewer - Can view reports and analytics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInvite} disabled={!inviteEmail}>
                      Send Invitation
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, role, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[150px]">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value: "name" | "role" | "department" | "joined") => setSortBy(value)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="role">Hierarchy</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="joined">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium truncate">{member.name}</h4>
                        {member.role !== "owner" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="h-4 w-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              {member.status === "pending" && (
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Resend Invitation
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                        {member.functionTitle}
                      </p>

                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{member.description}</p>

                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge className={`${getRoleColor(member.role)} flex items-center gap-1 text-xs`}>
                          {getRoleIcon(member.role)}
                          {member.role}
                        </Badge>
                        <Badge className={getStatusColor(member.status)} variant="outline">
                          {member.status}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3 mr-1" />
                          <Badge variant="outline" className={`text-xs ${getDepartmentColor(member.department)}`}>
                            {member.department}
                          </Badge>
                        </div>

                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {member.location}
                        </div>

                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <Separator className="my-2" />

                      <div className="flex flex-wrap gap-1 mb-2">
                        {member.specialization.slice(0, 2).map((spec, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {member.specialization.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{member.specialization.length - 2} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        {member.contactPreferences.email && (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Email">
                            <Mail className="h-3 w-3" />
                          </Button>
                        )}
                        {member.contactPreferences.directMessage && (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Direct Message">
                            <MessageCircle className="h-3 w-3" />
                          </Button>
                        )}
                        {member.contactPreferences.phone && (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Phone">
                            <Phone className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Click on the chevron icons to expand/collapse team hierarchies
            </div>
            {organizationHierarchy.map((member) => renderOrgChartNode(member))}
          </div>
        )}

        {filteredMembers.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No members found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Department Overview */}
        {departments.length > 0 && (
          <div className="mt-8">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Department Overview
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <Card key={dept.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={dept.color}>{dept.name}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {dept.memberCount} {dept.memberCount === 1 ? "member" : "members"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{dept.description}</p>
                    {dept.leadId && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={teamMembers.find((m) => m.id === dept.leadId)?.avatar || "/placeholder.svg"}
                              alt="Lead"
                            />
                            <AvatarFallback className="text-xs">
                              {teamMembers
                                .find((m) => m.id === dept.leadId)
                                ?.name.split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-medium">{teamMembers.find((m) => m.id === dept.leadId)?.name}</p>
                            <p className="text-xs text-muted-foreground">Department Lead</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Role Permissions Info */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-3">Role Permissions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Owner:</span>
                <span className="text-muted-foreground">Full access to all features and settings</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Lead:</span>
                <span className="text-muted-foreground">Department leadership and strategic decisions</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-green-600" />
                <span className="font-medium">Manager:</span>
                <span className="text-muted-foreground">Team management and operational oversight</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Admin:</span>
                <span className="text-muted-foreground">Can manage products, orders, and team members</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="font-medium">Member:</span>
                <span className="text-muted-foreground">Core team member with project access</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-slate-600" />
                <span className="font-medium">Viewer:</span>
                <span className="text-muted-foreground">Can view reports and analytics only</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
