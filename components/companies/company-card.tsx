"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building2, MapPin, Users, Calendar, ExternalLink, Verified, Star, DollarSign } from "lucide-react"
import type { Company } from "@/types/company"

interface CompanyCardProps {
  company: Company
}

export function CompanyCard({ company }: CompanyCardProps) {
  const tags: string[] = Array.isArray((company as any).tags) ? (company as any).tags : []
  const initials = ((company?.name ?? "C").split(" ").map((word) => word?.[0] || "").join("") || "C").slice(0, 2)
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-white/20">
              <AvatarImage src={company?.logo || "/placeholder.svg"} alt={`${company?.name || "Company"} logo`} />
              <AvatarFallback className="bg-green-600 text-white font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white group-hover:text-yellow-400 transition-colors">
                  {company?.name || "Company"}
                </h3>
                {company?.verified && <Verified className="h-4 w-4 text-blue-400" />}
                {company?.featured && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
              </div>
              <div className="flex items-center gap-2 text-sm text-green-100">
                <MapPin className="h-3 w-3" />
                {company?.location || ""}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-green-100 line-clamp-3">{company?.description || ""}</p>

        {/* Industry & Size */}
        <div className="flex items-center gap-4 text-sm text-green-100">
          <div className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {company?.industry || ""}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {(company?.size || "")} {company?.size ? "employees" : ""}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-green-100">
            <Calendar className="h-3 w-3" />
            Founded {company?.founded || ""}
          </div>
          <div className="flex items-center gap-1 text-yellow-400 font-semibold">
            <DollarSign className="h-3 w-3" />
            {company?.revenue || ""}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="secondary" className="text-xs bg-white/10 text-white border-white/20">
              +{tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            asChild
          >
            <a href={company.website} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              Visit Website
            </a>
          </Button>
          <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-green-900 font-semibold" asChild>
            <Link href={`/marketplace/companies/${company.id}/chat`}>Connect</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
