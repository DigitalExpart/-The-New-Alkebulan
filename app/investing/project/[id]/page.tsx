"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

export default function InvestingProjectDetailPage() {
  const params = useParams()
  const [p, setP] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      if (!supabase) return
      const { data } = await supabase
        .from('projects')
        .select('id,title,description,funding_goal,current_funding,category,image_url,return_rate_min,return_rate_max,status')
        .eq('id', params.id as string)
        .maybeSingle()
      setP(data)
    }
    load()
  }, [params.id])

  if (!p) return (
    <div className="container mx-auto px-4 py-8">
      <p className="text-muted-foreground">Loading project…</p>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          {p.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image_url} alt={p.title || 'project'} className="w-full h-64 object-cover" />
          )}
          <CardHeader>
            <CardTitle className="text-2xl">{p.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{p.description}</p>
            <div className="flex gap-3 mb-4">
              <Badge variant="secondary">{p.category || 'N/A'}</Badge>
              <Badge variant="secondary">{p.return_rate_min ?? '-'}% – {p.return_rate_max ?? '-'}%</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>Goal</span><span>${(p.funding_goal ?? 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span>Raised</span><span>${(p.current_funding ?? 0).toLocaleString()}</span></div>
              <Progress value={((Number(p.current_funding) || 0) / (Number(p.funding_goal) || 1)) * 100} />
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invest</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Investment flow coming soon.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


