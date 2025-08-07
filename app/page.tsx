"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingCart, BookOpen, TrendingUp, Heart, ArrowRight, Star, Shield, Sparkles } from "lucide-react"
import { BuildFutureSection } from "@/components/homepage/build-future-section"

export default function HomePage() {
  const [isLogoAnimating, setIsLogoAnimating] = useState(false)
  const [isAboutVisible, setIsAboutVisible] = useState(false)
  const [isMovementVisible, setIsMovementVisible] = useState(false)
  const [isInvestVisible, setIsInvestVisible] = useState(false)
  const logoRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)
  const movementRef = useRef<HTMLDivElement>(null)
  const investRef = useRef<HTMLDivElement>(null)
  const hasAnimatedOnLoad = useRef(false)

  // Trigger heartbeat animation
  const triggerHeartbeatAnimation = () => {
    setIsLogoAnimating(true)
    setTimeout(() => {
      setIsLogoAnimating(false)
    }, 2500)
  }

  // Intersection Observer for logo viewport entry
  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: "0px 0px -20px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === logoRef.current) {
          if (entry.isIntersecting && hasAnimatedOnLoad.current) {
            // Only animate on re-entry, not initial load
            triggerHeartbeatAnimation()
          }
        }
        if (entry.target === aboutRef.current) {
          if (entry.isIntersecting) {
            setIsAboutVisible(true)
          }
        }
        if (entry.target === movementRef.current) {
          if (entry.isIntersecting) {
            setIsMovementVisible(true)
          }
        }
        if (entry.target === investRef.current) {
          if (entry.isIntersecting) {
            setIsInvestVisible(true)
          }
        }
      })
    }, observerOptions)

    if (logoRef.current) {
      observer.observe(logoRef.current)
    }
    if (aboutRef.current) {
      observer.observe(aboutRef.current)
    }
    if (movementRef.current) {
      observer.observe(movementRef.current)
    }
    if (investRef.current) {
      observer.observe(investRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Initial page load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerHeartbeatAnimation()
      hasAnimatedOnLoad.current = true
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  const handleLogoClick = () => {
    triggerHeartbeatAnimation()
  }

  const features = [
    {
      icon: Users,
      title: "Community Connection",
      description: "Connect with the global African diaspora community",
      href: "/community",
    },
    {
      icon: ShoppingCart,
      title: "Marketplace",
      description: "Buy and sell products within our trusted community",
      href: "/marketplace",
    },
    {
      icon: BookOpen,
      title: "Learning Hub",
      description: "Access educational resources and mentorship programs",
      href: "/learning",
    },
    {
      icon: TrendingUp,
      title: "Business Growth",
      description: "Grow your business with our entrepreneurship tools",
      href: "/business",
    },
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Holistic health resources for mind, body, and spirit",
      href: "/health",
    },
    {
      icon: Shield,
      title: "Governance",
      description: "Participate in community decision-making processes",
      href: "/governance",
    },
  ]

  const stats = [
    { number: "50K+", label: "Community Members" },
    { number: "1000+", label: "Active Businesses" },
    { number: "500+", label: "Learning Resources" },
    { number: "25+", label: "Countries Represented" },
  ]

  return (
    <>
      <style jsx>{`
        @keyframes heartbeat {
          0% {
            transform: scale(1);
          }
          14% {
            transform: scale(1.6);
          }
          28% {
            transform: scale(1);
          }
          42% {
            transform: scale(1.6);
          }
          70% {
            transform: scale(1);
          }
        }
        
        .heartbeat-animation {
          animation: heartbeat 2.5s ease-in-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }

        .movement-gradient {
          background: linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 50%, hsl(var(--background)) 100%);
        }

        .invest-gradient {
          background: linear-gradient(135deg, #0f2419 0%, #142b20 25%, #1a3326 50%, #142b20 75%, #0f2419 100%);
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        .sparkle-effect {
          animation: sparkle 2s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
          }
        }

        .glow-effect {
          animation: glow 3s ease-in-out infinite;
        }
      `}</style>
      <div className="min-h-screen bg-background">
        {/* 1. Banner (Hero Section) */}
        <section className="relative overflow-hidden pt-20 pb-16">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <div
                  ref={logoRef}
                  className={`relative w-32 h-32 cursor-pointer transition-transform duration-200 ease-in-out ${
                    isLogoAnimating ? "heartbeat-animation" : "hover:scale-110"
                  }`}
                  onClick={handleLogoClick}
                >
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Scherm_afbeelding_2025-07-20_om_19.00.08-removebg-preview-5SfpVg1sZpmH7Z60mo8coZyoqelzmF.png"
                    alt="The New Alkebulan Logo"
                    width={128}
                    height={128}
                    className="rounded-full object-contain"
                  />
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Welcome to <span className="text-primary">The New Alkebulan</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Empowering the African diaspora through community, culture, and connection. Join our global network of
                entrepreneurs, learners, and changemakers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/join-alkebulan" className="flex items-center">
                    Join Our Community
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted bg-transparent"
                >
                  <Link href="/community">Explore Platform</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                    <div className="text-muted-foreground text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. What is The New Alkebulan Section */}
        <section className="py-20 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              ref={aboutRef}
              className={`text-center transition-all duration-1000 ${
                isAboutVisible ? "fade-in-up" : "opacity-0 translate-y-8"
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-12">What is The New Alkebulan?</h2>

              <div className="prose prose-lg max-w-none text-center">
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                  The New Alkebulan is more than a platform — it's a global digital home for people of African descent.
                  Spread across continents, yet united by shared history, culture, and a collective future vision.
                </p>

                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                  In a world where borders are fading and technology connects us like never before, The New Alkebulan
                  offers a central space where the African diaspora can thrive — economically, culturally, spiritually,
                  and educationally.
                </p>

                <p className="text-lg md:text-xl text-foreground leading-relaxed font-medium">
                  Here, you're not just building your future — you're helping shape a future for generations to come.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Everything You Need to Thrive (Features Section) */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Everything You Need to Thrive</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover our comprehensive platform designed to support every aspect of your journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 bg-card border-border">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-foreground">{feature.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={feature.href}
                      className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                    >
                      Learn more
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Invest in the Future Section */}
        <section className="py-20 invest-gradient relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              ref={investRef}
              className={`transition-all duration-1000 ${isInvestVisible ? "fade-in-up" : "opacity-0 translate-y-8"}`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Text Block */}
                <div className="text-left">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Invest in the Future of The New Alkebulan
                  </h2>

                  <p className="text-xl md:text-2xl italic text-primary mb-8">
                    You're not just funding a platform — you're fueling a movement.
                  </p>

                  <div className="prose prose-lg max-w-none">
                    <p className="text-lg text-gray-200 leading-relaxed mb-6">
                      Every contribution builds the digital foundation for a united African diaspora.
                    </p>

                    <p className="text-lg text-gray-200 leading-relaxed mb-6">
                      From decentralized education and finance to global commerce and culture — your investment powers a
                      future designed by us, for us.
                    </p>

                    <p className="text-lg text-gray-200 leading-relaxed mb-6">
                      Whether you're giving €10 or €10,000, you're shaping a new economic reality.
                    </p>

                    <p className="text-lg font-medium text-white leading-relaxed">
                      Built on <span className="text-primary font-bold">purpose</span>. Backed by{" "}
                      <span className="text-primary font-bold">vision</span>. Powered by{" "}
                      <span className="text-primary font-bold">the people</span>.
                    </p>
                  </div>
                </div>

                {/* Right Side - Action Box with CTA */}
                <div className="flex justify-center lg:justify-end">
                  <div className="relative">
                    {/* Sparkle Effects */}
                    <div className="absolute -top-4 -left-4 w-8 h-8 text-primary sparkle-effect">
                      <Sparkles className="w-full h-full" />
                    </div>
                    <div
                      className="absolute -bottom-4 -right-4 w-6 h-6 text-primary sparkle-effect"
                      style={{ animationDelay: "1s" }}
                    >
                      <Sparkles className="w-full h-full" />
                    </div>
                    <div
                      className="absolute top-1/2 -left-6 w-4 h-4 text-primary sparkle-effect"
                      style={{ animationDelay: "0.5s" }}
                    >
                      <Sparkles className="w-full h-full" />
                    </div>

                    {/* CTA Box */}
                    <Card className="bg-card/90 backdrop-blur-sm border-primary/30 p-8 text-center glow-effect max-w-sm">
                      <CardContent className="space-y-6">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                          <TrendingUp className="w-8 h-8 text-primary-foreground" />
                        </div>

                        <h3 className="text-2xl font-bold text-foreground mb-4">Be Part of History</h3>

                        <p className="text-muted-foreground mb-6">
                          Join visionary investors building the future of the African diaspora
                        </p>

                        <Button
                          size="lg"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-4"
                        >
                          <Link href="/funding" className="flex items-center justify-center">
                            👉 Become an Investor Now
                          </Link>
                        </Button>

                        <p className="text-sm text-muted-foreground">Starting from €10 • Secure • Transparent</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Build the Future With Us Section */}
        <BuildFutureSection />

        {/* 6. Join the Movement Section */}
        <section className="py-20 movement-gradient relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              ref={movementRef}
              className={`text-center transition-all duration-1000 ${
                isMovementVisible ? "fade-in-up" : "opacity-0 translate-y-8"
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">Join the Movement.</h2>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 max-w-3xl mx-auto">
                Because the revolution is not only{" "}
                <span className="font-bold text-muted-foreground">technological</span> — it's{" "}
                <span className="font-bold text-muted-foreground">social</span>,{" "}
                <span className="font-bold text-muted-foreground">cultural</span>, and{" "}
                <span className="font-bold text-muted-foreground">spiritual</span>. And it starts here.
              </p>

              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Why Now?</h3>

              <div className="prose prose-lg max-w-none text-center mb-12">
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Because Africa and its diaspora are no longer waiting for change — we're creating it. With{" "}
                  <span className="font-bold text-muted-foreground">purpose</span>,{" "}
                  <span className="font-bold text-muted-foreground">technology</span>, and{" "}
                  <span className="font-bold text-muted-foreground">unity</span>. The New Alkebulan is your space to be{" "}
                  <span className="font-bold text-muted-foreground">seen</span>, to{" "}
                  <span className="font-bold text-muted-foreground">contribute</span>, to{" "}
                  <span className="font-bold text-muted-foreground">lead</span>. Whether you're an{" "}
                  <span className="font-bold text-muted-foreground">entrepreneur</span>,{" "}
                  <span className="font-bold text-muted-foreground">artist</span>,{" "}
                  <span className="font-bold text-muted-foreground">investor</span>,{" "}
                  <span className="font-bold text-muted-foreground">student</span>,{" "}
                  <span className="font-bold text-muted-foreground">activist</span>, or{" "}
                  <span className="font-bold text-muted-foreground">visionary</span> — your impact matters.
                </p>
              </div>

              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg">
                <Link href="/auth/signup" className="flex items-center">
                  Join the Movement
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 7. Grey Thin Separator Line */}
        <div className="w-full h-px bg-border"></div>

        {/* 8. What Our Community Says (Testimonials Section) */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">What Our Community Says</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Amara Johnson",
                  role: "Entrepreneur",
                  content:
                    "The New Alkebulan has transformed how I connect with my heritage while growing my business.",
                  rating: 5,
                },
                {
                  name: "Kwame Asante",
                  role: "Student",
                  content:
                    "The learning resources and mentorship programs have been invaluable for my personal development.",
                  rating: 5,
                },
                {
                  name: "Zara Okafor",
                  role: "Health Coach",
                  content:
                    "I love how this platform integrates wellness with community connection. It's truly holistic.",
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-primary fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Ready to Join the Movement (CTA Section) */}
        <section className="py-16 bg-card">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Join the Movement?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Be part of a community that celebrates African heritage while building a prosperous future
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/auth/signup" className="flex items-center">
                Get Started Today
                <Sparkles className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  )
} 