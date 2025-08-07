"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Code, Palette, Users, Zap } from "lucide-react"

export function BuildFutureSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.1 },
    )

    const section = document.getElementById("build-future-section")
    if (section) {
      observer.observe(section)
    }

    return () => observer.disconnect()
  }, [])

  // Featured roles data
  const featuredRoles = [
    {
      id: 1,
      title: "Web Developer (React/Next.js)",
      shortDescription: "Build responsive web applications that connect our global diaspora community.",
      area: "Tech",
      icon: Code,
    },
    {
      id: 2,
      title: "Web3 & Blockchain Developer",
      shortDescription: "Help us implement secure, decentralized features across the platform.",
      area: "Tech",
      icon: Zap,
    },
    {
      id: 3,
      title: "UI/UX Designer",
      shortDescription: "Design intuitive interfaces that celebrate African culture and heritage.",
      area: "Creative",
      icon: Palette,
    },
    {
      id: 4,
      title: "AI Engineer / LLM Integrator",
      shortDescription: "Integrate cutting-edge AI to personalize the diaspora experience.",
      area: "Tech",
      icon: Users,
    },
  ]

  return (
    <section id="build-future-section" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Build the Future With Us</h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            The New Alkebulan isn't built by one person — it's shaped by visionaries like you. Join the creators,
            developers, strategists, and builders who are making this digital homeland a reality.
          </p>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {featuredRoles.map((role, index) => (
            <Card
              key={role.id}
              className="bg-card border-border hover:shadow-lg transition-all duration-300 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <role.icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="mb-2">
                    {role.area}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{role.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{role.shortDescription}</p>
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div
          className={`text-center transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Button asChild variant="outline" size="lg" className="border-border hover:bg-muted bg-transparent">
            <Link href="/join-the-team">
              See All Roles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
