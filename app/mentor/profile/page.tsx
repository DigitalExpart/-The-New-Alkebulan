"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { getSupabaseClient } from "@/lib/supabase"
import { UserAvatar } from "@/components/user-avatar"
import { toast } from "sonner"

export default function MentorProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [headline, setHeadline] = useState("")
  const [bio, setBio] = useState("")
  const [expertise, setExpertise] = useState<string>("")
  const [timezone, setTimezone] = useState("")
  const [yearsExperience, setYearsExperience] = useState<string>("")
  const [workExperience, setWorkExperience] = useState<string>("")
  const [educationExperience, setEducationExperience] = useState<string>("")
  const [profileName, setProfileName] = useState<string>("Mentor")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  type WorkItem = { company: string; role: string; years: number }
  type EducationItem = { university: string; country: string; course: string; graduationYear: number; degree: string }
  const [workItems, setWorkItems] = useState<WorkItem[]>([])
  const [eduItems, setEduItems] = useState<EducationItem[]>([])
  const [wiCompany, setWiCompany] = useState("")
  const [wiRole, setWiRole] = useState("")
  const [wiYears, setWiYears] = useState("")
  const [edUniversity, setEdUniversity] = useState("")
  const [edCountry, setEdCountry] = useState("")
  const [edCourse, setEdCourse] = useState("")
  const [edGradYear, setEdGradYear] = useState("")
  const [edDegree, setEdDegree] = useState("")

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
        const { data: profile } = await getSupabaseClient()
          .from('profiles')
          .select('first_name,last_name,avatar_url')
          .eq('id', userId)
          .single()
        if (data) {
          setHeadline(data.headline || "")
          setBio(data.bio || "")
          setExpertise((data.expertise || []).join(', '))
          setTimezone(data.timezone || "")
          setYearsExperience((data.years_experience ?? "").toString() || "")
          setWorkExperience(data.work_experience || "")
          setEducationExperience(data.education_experience || "")
          try { setWorkItems(Array.isArray(data.work_experience_json) ? data.work_experience_json : []) } catch { setWorkItems([]) }
          try { setEduItems(Array.isArray(data.education_experience_json) ? data.education_experience_json : []) } catch { setEduItems([]) }
        }
        if (profile) {
          const first = (profile as any).first_name || ""
          const last = (profile as any).last_name || ""
          setProfileName(`${first} ${last}`.trim() || "Mentor")
          setAvatarUrl((profile as any).avatar_url || null)
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
        timezone,
        years_experience: yearsExperience ? Number(yearsExperience) : null,
        work_experience: workExperience || null,
        education_experience: educationExperience || null,
        work_experience_json: workItems,
        education_experience_json: eduItems
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
            <div className="flex items-center gap-4 mb-2">
              <UserAvatar imageUrl={avatarUrl || undefined} size="lg" fallbackName={profileName} />
              <div>
                <div className="text-xl font-semibold">{profileName}</div>
                <div className="text-sm text-muted-foreground">This information is shown on your public mentor page</div>
              </div>
            </div>
            <CardTitle>Complete Mentor Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Headline (e.g., Business Strategy Mentor)" value={headline} onChange={e => setHeadline(e.target.value)} />
            <Textarea placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} />
            <Input placeholder="Expertise (comma-separated)" value={expertise} onChange={e => setExpertise(e.target.value)} />
            <Input placeholder="Timezone (e.g., UTC+1, PST)" value={timezone} onChange={e => setTimezone(e.target.value)} />
            <Input placeholder="Years of experience" type="number" value={yearsExperience} onChange={e => setYearsExperience(e.target.value)} />
            {/* Structured Work Experience */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Add Work Experience</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input placeholder="Company" value={wiCompany} onChange={e => setWiCompany(e.target.value)} />
                <Input placeholder="Role" value={wiRole} onChange={e => setWiRole(e.target.value)} />
                <Input placeholder="Years" type="number" value={wiYears} onChange={e => setWiYears(e.target.value)} />
              </div>
              <Textarea placeholder="Work experience (free text, optional)" value={workExperience} onChange={e => setWorkExperience(e.target.value)} />
              <div>
                <Button type="button" variant="outline" onClick={() => {
                  if (!wiCompany || !wiRole || !wiYears) { toast.error('Enter company, role and years'); return }
                  const years = Number(wiYears)
                  if (!Number.isFinite(years) || years < 0) { toast.error('Invalid years'); return }
                  setWorkItems([...workItems, { company: wiCompany, role: wiRole, years }])
                  setWiCompany(""); setWiRole(""); setWiYears("")
                }}>Add Work Item</Button>
              </div>
              {workItems.length > 0 && (
                <div className="space-y-1">
                  {workItems.map((w, idx) => (
                    <div key={idx} className="flex items-center justify-between border rounded-md px-3 py-2 text-sm">
                      <div>{w.company} — {w.role} · {w.years} yrs</div>
                      <Button type="button" variant="ghost" onClick={() => setWorkItems(workItems.filter((_, i) => i !== idx))}>Remove</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Structured Education Experience */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Add Education</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input placeholder="University" value={edUniversity} onChange={e => setEdUniversity(e.target.value)} />
                <Input placeholder="Country" value={edCountry} onChange={e => setEdCountry(e.target.value)} />
                <Input placeholder="Course of Study" value={edCourse} onChange={e => setEdCourse(e.target.value)} />
                <Input placeholder="Year of Graduation" type="number" value={edGradYear} onChange={e => setEdGradYear(e.target.value)} />
                <Input placeholder="Degree" value={edDegree} onChange={e => setEdDegree(e.target.value)} />
              </div>
              <div>
                <Button type="button" variant="outline" onClick={() => {
                  if (!edUniversity || !edCountry || !edCourse || !edGradYear || !edDegree) { toast.error('Fill all education fields'); return }
                  const graduationYear = Number(edGradYear)
                  if (!Number.isFinite(graduationYear)) { toast.error('Invalid graduation year'); return }
                  setEduItems([...eduItems, { university: edUniversity, country: edCountry, course: edCourse, graduationYear, degree: edDegree }])
                  setEdUniversity(""); setEdCountry(""); setEdCourse(""); setEdGradYear(""); setEdDegree("")
                }}>Add Education Item</Button>
              </div>
              {eduItems.length > 0 && (
                <div className="space-y-1">
                  {eduItems.map((ed, idx) => (
                    <div key={idx} className="flex items-center justify-between border rounded-md px-3 py-2 text-sm">
                      <div>{ed.university} ({ed.country}) — {ed.course}, {ed.degree} · {ed.graduationYear}</div>
                      <Button type="button" variant="ghost" onClick={() => setEduItems(eduItems.filter((_, i) => i !== idx))}>Remove</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
