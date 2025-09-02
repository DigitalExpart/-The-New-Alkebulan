"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

export default function MentorProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [headline, setHeadline] = useState("")
  const [bio, setBio] = useState("")
  const [expertise, setExpertise] = useState<string>("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [timezone, setTimezone] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await getSupabaseClient().auth.getSession()
        const userId = session?.user?.id
        if (!userId) return
        const { data } = await getSupabaseClient()
          .from('mentor_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
        if (data) {
          setHeadline(data.headline || "")
          setBio(data.bio || "")
          setExpertise((data.expertise || []).join(', '))
          setHourlyRate(data.hourly_rate?.toString() || "")
          setTimezone(data.timezone || "")
        }
      } catch (e) {
        // ignore if no profile
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const { data: { session } } = await getSupabaseClient().auth.getSession()
      const userId = session?.user?.id
      if (!userId) { toast.error('Please sign in'); return }
      const payload = {
        user_id: userId,
        headline,
        bio,
        expertise: expertise.split(',').map(s => s.trim()).filter(Boolean),
        hourly_rate: hourlyRate ? Number(hourlyRate) : null,
        timezone
      }
      const upsert = await getSupabaseClient()
        .from('mentor_profiles')
        .upsert(payload, { onConflict: 'user_id' })
        .select('*')
        .single()
      if (upsert.error) throw upsert.error
      toast.success('Mentor profile saved')
    } catch (e: any) {
      toast.error(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Complete Mentor Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Headline (e.g., Business Strategy Mentor)" value={headline} onChange={e => setHeadline(e.target.value)} />
            <Textarea placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} />
            <Input placeholder="Expertise (comma-separated)" value={expertise} onChange={e => setExpertise(e.target.value)} />
            <Input placeholder="Hourly rate (USD)" type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} />
            <Input placeholder="Timezone (e.g., UTC+1, PST)" value={timezone} onChange={e => setTimezone(e.target.value)} />
            <div className="flex gap-2 flex-wrap">
              {(expertise.split(',').map(s => s.trim()).filter(Boolean)).map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
            <div className="pt-2">
              <Button onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
