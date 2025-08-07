"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, MapPin, AlertTriangle, BookOpen, Users, FileText, Globe, Lock, Zap } from "lucide-react"
import { InteractiveAfricaMap } from "@/components/land-ownership/interactive-africa-map"
import { landOwnershipFacts, protectionStrategies } from "@/data/land-ownership-data"
import type { LandParcel } from "@/types/land-ownership"

export default function LandOwnershipPage() {
  const [savedParcels, setSavedParcels] = useState<LandParcel[]>([])

  const handleParcelSave = (parcel: Partial<LandParcel>) => {
    const newParcel: LandParcel = {
      ...parcel,
      id: parcel.id || `parcel_${Date.now()}`,
      userId: "current_user", // This would come from auth
      name: parcel.name || "Unnamed Parcel",
      country: parcel.country || "Unknown",
      coordinates: parcel.coordinates || { lat: 0, lng: 0 },
      registrationStatus: parcel.registrationStatus || "unregistered",
      documentationLevel: parcel.documentationLevel || "none",
      createdAt: parcel.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: parcel.isPublic || false,
    }
    setSavedParcels((prev) => [...prev, newParcel])
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Protecting Your Land</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Secure your ancestral and community land through documentation, mapping, and legal protection. Join the
          movement to preserve African land rights for future generations.
        </p>
      </div>

      {/* Section 1: Why Land Ownership Protection Matters */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Why Land Ownership Protection Matters</h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            Land fraud and exploitation are critical issues across Africa, particularly affecting vulnerable
            communities. Clear ownership documentation, accurate mapping, and increased visibility are essential tools
            in protecting ancestral and community lands from illegal seizure and exploitation.
          </p>
        </div>

        {/* Key Facts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {landOwnershipFacts.map((fact, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="text-4xl mb-2">{fact.icon}</div>
                <CardTitle className="text-lg">{fact.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{fact.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Colonial Legacy & Modern Challenges */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <AlertTriangle className="w-5 h-5" />
              The Challenge We Face
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Colonial Legacies
                </h4>
                <p className="text-sm text-muted-foreground">
                  Colonial-era policies systematically ignored customary ownership systems, leaving millions without
                  formal documentation of their ancestral lands.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Foreign Investment Pressure
                </h4>
                <p className="text-sm text-muted-foreground">
                  Rising interest from foreign investors in African land has led to large-scale acquisitions that often
                  displace local communities without fair compensation.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Documentation Gaps
                </h4>
                <p className="text-sm text-muted-foreground">
                  Lack of proper documentation makes it difficult to prove ownership, leaving communities vulnerable to
                  land grabbing and fraudulent sales.
                </p>
              </div>
            </div>

            <Separator />

            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
              <blockquote className="italic text-center">
                <p className="mb-2">
                  "When we lost our land documentation in the conflict, we thought we had lost everything. But through
                  community mapping and digital records, we were able to reclaim our ancestral home."
                </p>
                <footer className="text-sm font-medium">— Amara Kone, Community Leader, Mali</footer>
              </blockquote>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 2: Interactive Map */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
            <MapPin className="w-8 h-8 text-primary" />
            Interactive Africa Map
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Search for your location, mark your land parcels, and connect with local authorities. This tool helps you
            document and protect your land rights through digital mapping.
          </p>
        </div>

        <InteractiveAfricaMap onParcelSave={handleParcelSave} savedParcels={savedParcels} />
      </section>

      {/* Section 3: Protection Strategies */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Land Protection Strategies</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Learn proven methods to secure and protect your land rights through documentation, community action, and
            modern technology solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {protectionStrategies.map((strategy, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">{strategy.title}</CardTitle>
                <p className="text-muted-foreground">{strategy.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Action Steps:</h4>
                  <ul className="space-y-2">
                    {strategy.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-primary">{stepIndex + 1}</span>
                        </div>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Educational Resources & Next Steps */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Take Action Today</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Start protecting your land rights with these immediate actions and educational resources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <BookOpen className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Learn More</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Access comprehensive guides on land registration, fraud prevention, and legal rights.
              </p>
              <Button className="w-full">Educational Resources</Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Connect Locally</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Find and connect with local land authorities, legal aid, and community organizations.
              </p>
              <Button variant="outline" className="w-full bg-transparent">
                Find Local Support
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Blockchain Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Future-proof your land records with blockchain-based ownership verification.
              </p>
              <Button variant="outline" className="w-full bg-transparent">
                <Badge variant="secondary" className="mr-2">
                  Coming Soon
                </Badge>
                Join Waitlist
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center space-y-6">
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="py-12">
            <h2 className="text-3xl font-bold mb-4">Protect Your Heritage</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of Africans who are securing their land rights through documentation, community action, and
              modern technology. Your land is your legacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8">
                <MapPin className="w-5 h-5 mr-2" />
                Start Mapping Your Land
              </Button>
              <Button size="lg" variant="outline" className="px-8 bg-transparent">
                <Users className="w-5 h-5 mr-2" />
                Join Community Network
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
