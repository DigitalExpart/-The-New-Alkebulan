"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

interface Session {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  capacity: number
  price?: number
}

interface RowAvailability {
  day: number
  start: string
  end: string
}

const DAY_OPTS = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
]

export default function MentorSchedulePage() {
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [capacity, setCapacity] = useState("1")
  const [price, setPrice] = useState("0")
  const [weeks, setWeeks] = useState("4")
  const [rows, setRows] = useState<RowAvailability[]>([])
  const [createProgram, setCreateProgram] = useState(true)
  const [programId, setProgramId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])

  const load = async () => {
    try {
      const { data: { session } } = await getSupabaseClient().auth.getSession()
      const userId = session?.user?.id
      if (!userId) return
      const { data, error } = await getSupabaseClient()
        .from('mentor_sessions')
        .select('*')
        .eq('mentor_user_id', userId)
        .order('start_time', { ascending: true })
      if (!error && data) setSessions(data as any)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const nextDateForDOW = (from: Date, dow: number) => {
    const date = new Date(from)
    const diff = (dow + 7 - date.getDay()) % 7
    date.setDate(date.getDate() + diff)
    return date
  }

  const onSubmit = async () => {
    try {
      const { data: { session } } = await getSupabaseClient().auth.getSession()
      const userId = session?.user?.id
      if (!userId) { toast.error('Please sign in'); return }

      const cap = Number(capacity) || 1
      const priceNum = Math.max(0, Number(price) || 0)
      const payloads: any[] = []

      if (rows.length > 0) {
        // Create a program first so all generated sessions are linked and paid as a whole
        let newProgramId: string | null = programId
        if (createProgram || !newProgramId) {
          const programInsert = await getSupabaseClient()
            .from('mentor_programs')
            .insert({
              mentor_user_id: userId,
              title: title || 'Mentorship Program',
              description,
              price_total: priceNum,
              capacity: cap
            })
            .select('id')
            .single()
          if (programInsert.error) throw programInsert.error
          newProgramId = programInsert.data.id
          setProgramId(newProgramId)
        }
        const weeksInt = Math.max(1, Math.min(12, parseInt(weeks || '4')))
        const base = new Date()
        for (let w = 0; w < weeksInt; w++) {
          for (const r of rows) {
            const date = new Date(base)
            date.setDate(base.getDate() + w * 7)
            const target = nextDateForDOW(date, r.day)
            const [sh, sm] = r.start.split(':').map(Number)
            const [eh, em] = r.end.split(':').map(Number)
            const sDate = new Date(target); sDate.setHours(sh, sm ?? 0, 0, 0)
            const eDate = new Date(target); eDate.setHours(eh, em ?? 0, 0, 0)
            if (eDate <= sDate) continue
            payloads.push({
              mentor_user_id: userId,
              title: title || `${DAY_OPTS.find(d=>d.value===r.day)?.label} Session`,
              description,
              start_time: sDate.toISOString(),
              end_time: eDate.toISOString(),
              capacity: cap,
              price: 0,
              program_id: newProgramId
            })
          }
        }
      } else {
        if (!start || !end) { toast.error('Provide single start/end time or add available days'); return }
        // Single session treated as program of one
        let newProgramId: string | null = programId
        if (createProgram || !newProgramId) {
          const programInsert = await getSupabaseClient()
            .from('mentor_programs')
            .insert({ mentor_user_id: userId, title, description, price_total: priceNum, capacity: cap })
            .select('id')
            .single()
          if (programInsert.error) throw programInsert.error
          newProgramId = programInsert.data.id
          setProgramId(newProgramId)
        }
        payloads.push({
          mentor_user_id: userId,
          title,
          description,
          start_time: start,
          end_time: end,
          capacity: cap,
          price: 0,
          program_id: newProgramId
        })
      }

      if (payloads.length === 0) { toast.error('No valid time ranges'); return }
      const { error } = await getSupabaseClient().from('mentor_sessions').insert(payloads)
      if (error) throw error
      toast.success(`Created ${payloads.length} session${payloads.length>1?'s':''}`)
      setTitle(""); setDescription(""); setStart(""); setEnd(""); setCapacity("1"); setPrice("0"); setRows([])
      load()
    } catch (e: any) {
      toast.error(e.message || 'Failed to create')
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Schedule Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />

            {/* Optional single-session inputs (used if no available days configured) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
              <Input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
            </div>

            <Input placeholder="Capacity" type="number" min={1} value={capacity} onChange={e => setCapacity(e.target.value)} />
            <Input placeholder="Program Price (USD)" type="number" min={0} step="0.01" value={price} onChange={e => setPrice(e.target.value)} />
            <div className="text-sm text-muted-foreground">This price will be charged once for the whole program. Individual sessions are marked as $0.</div>

            {/* Available days rows */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Available Days (optional). Add one or more rows: Day + start/end time. Sessions will be generated for the next N weeks.</p>
              {rows.map((r, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <select
                      className="w-full h-10 rounded-md bg-background border border-input px-3"
                      value={r.day}
                      onChange={e => setRows(prev => prev.map((x,i)=> i===idx ? { ...x, day: Number(e.target.value) } : x))}
                    >
                      {DAY_OPTS.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <Input type="time" value={r.start} onChange={e => setRows(prev => prev.map((x,i)=> i===idx ? { ...x, start: e.target.value } : x))} />
                  </div>
                  <div className="col-span-3">
                    <Input type="time" value={r.end} onChange={e => setRows(prev => prev.map((x,i)=> i===idx ? { ...x, end: e.target.value } : x))} />
                  </div>
                  <div className="col-span-2 text-right">
                    <Button variant="outline" onClick={() => setRows(prev => prev.filter((_,i)=>i!==idx))}>Remove</Button>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setRows(prev => [...prev, { day: 1, start: "09:00", end: "17:00" }])}>Add Available Day</Button>
                <Input placeholder="Weeks to generate (1-12)" type="number" min={1} max={12} value={weeks} onChange={e => setWeeks(e.target.value)} className="w-40" />
              </div>
            </div>

            <Button onClick={onSubmit}>Create Sessions</Button>
          </CardContent>
        </Card>

        <div className="mt-8 space-y-3">
          {sessions.map(s => (
            <Card key={s.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.title || 'Session'}</p>
                  <p className="text-sm text-muted-foreground">{new Date(s.start_time).toLocaleString()} - {new Date(s.end_time).toLocaleString()}</p>
                </div>
                <div className="text-sm text-muted-foreground">Capacity: {s.capacity} · Price: ${s.price?.toFixed?.(2) ?? '0.00'}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
