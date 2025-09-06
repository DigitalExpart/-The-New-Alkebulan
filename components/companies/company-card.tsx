"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building2, MapPin, Users, Calendar, ExternalLink, Verified, Star, DollarSign, Pencil, Trash2 } from "lucide-react"
import type { Company } from "@/types/company"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface CompanyCardProps {
  company: Company
}

export function CompanyCard({ company }: CompanyCardProps) {
  const { profile } = useAuth()
  const tags: string[] = Array.isArray((company as any).tags) ? (company as any).tags : []
  const initials = ((company?.name ?? "C").split(" ").map((word) => word?.[0] || "").join("") || "C").slice(0, 2)
  const isAdmin = Boolean(profile?.is_admin === true || profile?.role === 'admin' || (Array.isArray(profile?.selected_roles) && profile?.selected_roles.includes('admin')))

  const handleDelete = async () => {
    if (!isAdmin) return
    if (!confirm(`Delete ${company.name}?`)) return
    try {
      // Return deleted row to verify that deletion occurred
      const { data, error } = await supabase!
        .from('companies')
        .delete()
        .eq('id', (company as any).id)
        .select('id')
        .single()
      if (error) throw error
      if (!data) {
        toast.error('Delete failed: not found or not permitted')
        return
      }
      toast.success('Company deleted')
      // Soft refresh: remove card visually by reloading current page data
      if (typeof window !== 'undefined') window.location.reload()
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed')
    }
  }
  return (
    <Card className="dark:bg-white/10 dark:backdrop-blur-sm dark:border-white/20 hover:bg-white/15 transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 dark:border-2 dark:border-white/20 border-2 border-dark-border">
              <AvatarImage src={company?.logo || "/placeholder.svg"} alt={`${company?.name || "Company"} logo`} />
              <AvatarFallback className="dark:bg-green-600 dark:text-white font-bold text-black">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold dark:text-white group-hover:text-yellow-400 transition-colors">
                  {company?.name || "Company"}
                </h3>
                {company?.verified && <Verified className="h-4 w-4 dark:text-blue-400" />}
                {company?.featured && <Star className="h-4 w-4 dark:text-yellow-400 fill-current" />}
              </div>
              <div className="flex items-center gap-2 text-sm dark:text-green-100">
                <MapPin className="h-3 w-3" />
                {company?.location || ""}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm dark:text-green-100 line-clamp-3">{company?.description || ""}</p>

        {/* Industry & Size */}
        <div className="flex items-center gap-4 text-sm dark:text-green-100">
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
          <div className="flex items-center gap-1 dark:text-green-100">
            <Calendar className="h-3 w-3" />
            Founded {company?.founded || ""}
          </div>
          <div className="flex items-center gap-1 dark:text-yellow-400 font-semibold">
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
              className="text-xs dark:bg-white/10 dark:text-white dark:border-white/20 hover:bg-white/20"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full dark:bg-white/10 dark:border-white/20 dark:text-white border-dark-card/70 hover:bg-white/20 dark:hover:text-white hover:text-gold-dark"
            asChild
          >
            <a href={company.website} target="_blank" rel="noopener noreferrer" aria-label="Visit Website">
              <ExternalLink className="h-3 w-3 mr-1" />
              Website
            </a>
          </Button>
          <Button size="sm" className="w-full bg-yellow-400 hover:bg-yellow-500 text-green-900 font-semibold" asChild>
            <Link href={`/marketplace/companies/${company.id}/chat`}>Connect</Link>
          </Button>
          {isAdmin && (
            <>
              <Button size="sm" variant="outline" className="w-full" asChild>
                <Link href={`/marketplace/companies/${company.id}/edit`}>
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Link>
              </Button>
              <Button size="sm" variant="destructive" className="w-full" onClick={handleDelete}>
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
