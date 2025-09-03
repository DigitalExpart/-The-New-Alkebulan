"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase"
import { UserAvatar } from "@/components/user-avatar"

interface SessionItem {
  id: string
  start_time: string
  end_time?: string
  price?: number
  title?: string
}

export default function PublicMentorProfilePage() {
  const params = useParams<{ userId: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState<string>("Mentor")
  const [headline, setHeadline] = useState<string>("")
  const [bio, setBio] = useState<string>("")
  const [expertise, setExpertise] = useState<string[]>([])
  const [rating, setRating] = useState<number>(0)
  const [yearsExperience, setYearsExperience] = useState<number | null>(null)
  const [workExperience, setWorkExperience] = useState<string>("")
  const [educationExperience, setEducationExperience] = useState<string>("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [workItems, setWorkItems] = useState<Array<{ company: string; role: string; years: number }>>([])
  const [eduItems, setEduItems] = useState<Array<{ university: string; country: string; course: string; graduationYear: number; degree: string }>>([])
  const [upcoming, setUpcoming] = useState<SessionItem[]>([])
  const [capacity, setCapacity] = useState<number | null>(null)
  const [joinedCount, setJoinedCount] = useState<number>(0)
  const [availabilityDays, setAvailabilityDays] = useState<string[]>([])
  const [programGroups, setProgramGroups] = useState<Array<{ programId: string | null; title: string; priceTotal?: number; capacity?: number; joined?: number; sessionIds: string[]; sessions: SessionItem[] }>>([])

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = getSupabaseClient()

        const [{ data: p, error: pErr }, { data: u, error: uErr }] = await Promise.all([
          supabase
            .from("mentor_profiles")
            .select("headline,bio,expertise,rating,years_experience,work_experience,education_experience,work_experience_json,education_experience_json")
            .eq("user_id", params.userId)
            .single(),
          supabase
            .from("profiles")
            .select("first_name,last_name,avatar_url")
            .eq("id", params.userId)
            .single(),
        ])

        if (!pErr && p) {
          setHeadline((p as any).headline || "")
          setBio((p as any).bio || "")
          setExpertise(Array.isArray((p as any).expertise) ? (p as any).expertise : [])
          setRating(Number((p as any).rating || 0))
          setYearsExperience((p as any).years_experience ?? null)
          setWorkExperience((p as any).work_experience || "")
          setEducationExperience((p as any).education_experience || "")
          try { setWorkItems(Array.isArray((p as any).work_experience_json) ? (p as any).work_experience_json : []) } catch { setWorkItems([]) }
          try { setEduItems(Array.isArray((p as any).education_experience_json) ? (p as any).education_experience_json : []) } catch { setEduItems([]) }
        }
        if (!uErr && u) {
          const first = (u as any).first_name || ""
          const last = (u as any).last_name || ""
          setName(`${first} ${last}`.trim() || "Mentor")
          setAvatarUrl((u as any).avatar_url || null)
        }

        const { data: sessions } = await supabase
          .from("mentor_sessions")
          .select("id,title,start_time,end_time,price,program_id")
          .eq("mentor_user_id", params.userId)
          .gte("start_time", new Date().toISOString())
          .order("start_time", { ascending: true })
        setUpcoming((sessions || []).map((s: any) => ({
          id: s.id,
          title: s.title,
          start_time: s.start_time,
          end_time: s.end_time,
          price: s.price,
        })))

        // derive availability days from upcoming sessions
        const daySet = new Set<string>()
        ;(sessions || []).forEach((s: any) => {
          const day = new Date(s.start_time).toLocaleDateString(undefined, { weekday: 'long' })
          daySet.add(day)
        })
        setAvailabilityDays(Array.from(daySet))

        // capacity and joined count (program or standalone)
        // group sessions by program
        const groupsMap: Record<string, { programId: string | null; title: string; price?: number; sessionIds: string[]; sessions: SessionItem[] }> = {}
        ;(sessions || []).forEach((s: any) => {
          const nonProgKey = `title:${(s.title || '').toLowerCase()}|price:${Number(s.price || 0)}`
          const key = s.program_id ? `prog:${s.program_id}` : nonProgKey
          const arr = groupsMap[key] || { programId: s.program_id || null, title: s.title || 'Session', price: s.price, sessionIds: [], sessions: [] }
          arr.sessionIds.push(s.id)
          arr.sessions.push({ id: s.id, title: s.title, start_time: s.start_time, end_time: s.end_time, price: s.price })
          groupsMap[key] = arr
        })

        const programIds = Object.values(groupsMap).map(g => g.programId).filter((x): x is string => Boolean(x))
        const progInfo: Record<string, { title: string; price_total: number; capacity: number }> = {}
        if (programIds.length > 0) {
          const { data: progs } = await supabase.from('mentor_programs').select('id,title,price_total,capacity').in('id', programIds)
          for (const p of progs || []) progInfo[(p as any).id] = { title: (p as any).title || 'Program', price_total: Number((p as any).price_total || 0), capacity: Number((p as any).capacity || 0) }
        }
        const groups: Array<{ programId: string | null; title: string; priceTotal?: number; capacity?: number; joined?: number; sessionIds: string[]; sessions: SessionItem[] }> = []
        for (const g of Object.values(groupsMap)) {
          if (g.programId) {
            const info = progInfo[g.programId]
            let joined = 0
            const { count } = await supabase.from('mentor_bookings').select('id', { count: 'exact', head: true }).eq('program_id', g.programId).eq('status','confirmed')
            joined = count || 0
            groups.push({ programId: g.programId, title: info?.title || 'Program', priceTotal: info?.price_total, capacity: info?.capacity, joined, sessionIds: g.sessionIds, sessions: g.sessions })
          } else {
            const singlePrice = g.price || g.sessions[0]?.price || 0
            const { count } = await supabase.from('mentor_bookings').select('id', { count: 'exact', head: true }).in('session_id', g.sessionIds).eq('status','confirmed')
            groups.push({ programId: null, title: g.title || g.sessions[0]?.title || 'Session', priceTotal: singlePrice, capacity: undefined, joined: count || 0, sessionIds: g.sessionIds, sessions: g.sessions })
          }
        }
        // set summary totals for header
        const capSum = groups.reduce((a, g) => a + (g.capacity || 0), 0)
        const joinSum = groups.reduce((a, g) => a + (g.joined || 0), 0)
        setCapacity(capSum || null)
        setJoinedCount(joinSum)
        // order groups: programs first by start time
        groups.sort((a, b) => (new Date(a.sessions[0].start_time).getTime()) - (new Date(b.sessions[0].start_time).getTime()))
        setProgramGroups(groups)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.userId])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <UserAvatar imageUrl={avatarUrl || undefined} size="lg" fallbackName={name} />
              <CardTitle className="text-2xl">{name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {headline && <p className="text-sm text-muted-foreground">{headline}</p>}
            {bio && <p className="text-sm">{bio}</p>}
            {expertise.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {expertise.map((x) => (
                  <Badge key={x} variant="outline">{x}</Badge>
                ))}
              </div>
            )}
            <div className="text-sm text-muted-foreground">Rating: {rating.toFixed(1)}</div>
            {availabilityDays.length > 0 && (
              <div className="text-sm">
                <span className="font-medium">Available days:</span> {availabilityDays.join(', ')}
              </div>
            )}
            {capacity !== null && (
              <div className="text-sm">
                <span className="font-medium">Capacity:</span> {joinedCount} joined / {capacity} total · {Math.max(0, (capacity || 0) - (joinedCount || 0))} left
              </div>
            )}
            {yearsExperience !== null && (
              <div className="text-sm">Years of experience: <span className="font-medium">{yearsExperience}</span></div>
            )}
            <div>
              <div className="text-sm font-medium">Work experience</div>
              {workItems.length === 0 && !workExperience && (
                <div className="text-sm text-muted-foreground">Not provided</div>
              )}
              {workItems.length > 0 && (
                <div className="space-y-1">
                  {workItems.map((w, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground">{w.company} — {w.role} · {w.years} yrs</div>
                  ))}
                </div>
              )}
            </div>
            {workExperience && (
              <div>
                <div className="text-sm font-medium">Work experience (summary)</div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">{workExperience}</div>
              </div>
            )}
            <div>
              <div className="text-sm font-medium">Educational experience</div>
              {eduItems.length === 0 && !educationExperience && (
                <div className="text-sm text-muted-foreground">Not provided</div>
              )}
              {eduItems.length > 0 && (
                <div className="space-y-1">
                  {eduItems.map((ed, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground">{ed.university} ({ed.country}) — {ed.course}, {ed.degree} · {ed.graduationYear}</div>
                  ))}
                </div>
              )}
            </div>
            {educationExperience && (
              <div>
                <div className="text-sm font-medium">Educational experience (summary)</div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">{educationExperience}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {programGroups.length === 0 && (
              <div className="text-sm text-muted-foreground">No upcoming sessions</div>
            )}
            {programGroups.map((g, idx) => (
              <div key={idx} className="border rounded-md">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="text-sm">
                    <div className="font-medium">
                      {g.title} {typeof g.priceTotal === 'number' ? `· $${Number(g.priceTotal).toFixed(2)}` : ''}
                    </div>
                    {g.joined !== undefined && (
                      <div className="text-xs text-muted-foreground">
                        {g.capacity !== undefined
                          ? `${g.joined} joined / ${g.capacity} total · ${Math.max(0, (g.capacity || 0) - (g.joined || 0))} left`
                          : `${g.joined} joined`}
                      </div>
                    )}
                  </div>
                  {/* Book any session in the group; for non-program groups, booking first session will enroll for the grouped series */}
                  <Button onClick={() => router.push(`/mentor/book/${g.sessions[0].id}`)}>Book</Button>
                </div>
                <div className="px-3 pb-3 text-xs text-muted-foreground space-y-1">
                  {g.sessions.map(s => (
                    <div key={s.id}>{new Date(s.start_time).toLocaleString()} {s.end_time ? `- ${new Date(s.end_time).toLocaleString()}` : ''}</div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


