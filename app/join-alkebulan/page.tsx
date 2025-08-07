import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Shield, Globe, Zap, ArrowRight, Check, Sparkles, Heart, TrendingUp } from "lucide-react"

export default function JoinAlkebulanPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge className="bg-yellow-500 text-black hover:bg-yellow-600 mb-4">
            <Crown className="w-4 h-4 mr-2" />
            Join The New Alkebulan
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
            Your Digital
            <span className="text-yellow-500 block">African Identity</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Claim your unique Alkebulan name code and join a global community of African diaspora connecting, learning,
            and building together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-600 text-lg px-8 py-4">
              <Sparkles className="mr-2 h-5 w-5" />
              Claim Your Name Code
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-black text-lg px-8 py-4 bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Join The New Alkebulan?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience true digital ownership and connect with your heritage through our revolutionary platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* True Ownership */}
            <Card className="hover:shadow-lg transition-shadow border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Crown className="h-6 w-6 text-yellow-500" />
                </div>
                <CardTitle className="text-yellow-600 dark:text-yellow-400">True Ownership</CardTitle>
                <CardDescription>
                  Your Alkebulan name code is 100% yours. No intermediaries, no bureaucracy. It's your digital property
                  - uncensored and irrevocable.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Global Community */}
            <Card className="hover:shadow-lg transition-shadow border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-yellow-500" />
                </div>
                <CardTitle className="text-yellow-600 dark:text-yellow-400">Global Network</CardTitle>
                <CardDescription>
                  Connect with African diaspora worldwide. Share culture, trade, learn, and build lasting relationships
                  across continents.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Secure Identity */}
            <Card className="hover:shadow-lg transition-shadow border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-yellow-500" />
                </div>
                <CardTitle className="text-yellow-600 dark:text-yellow-400">Secure Identity</CardTitle>
                <CardDescription>
                  Advanced blockchain technology ensures your identity is protected, verified, and always under your
                  control.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Cultural Heritage */}
            <Card className="hover:shadow-lg transition-shadow border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-yellow-500" />
                </div>
                <CardTitle className="text-yellow-600 dark:text-yellow-400">Cultural Heritage</CardTitle>
                <CardDescription>
                  Celebrate and preserve African culture through digital storytelling, art, music, and traditional
                  knowledge sharing.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Economic Empowerment */}
            <Card className="hover:shadow-lg transition-shadow border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-yellow-500" />
                </div>
                <CardTitle className="text-yellow-600 dark:text-yellow-400">Economic Growth</CardTitle>
                <CardDescription>
                  Access exclusive investment opportunities, business partnerships, and financial services designed for
                  the diaspora community.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Innovation Hub */}
            <Card className="hover:shadow-lg transition-shadow border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-yellow-500" />
                </div>
                <CardTitle className="text-yellow-600 dark:text-yellow-400">Innovation Hub</CardTitle>
                <CardDescription>
                  Collaborate on cutting-edge projects, share knowledge, and drive technological advancement across
                  Africa.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-yellow-50 dark:bg-yellow-950/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What You Get</h2>
            <p className="text-muted-foreground text-lg">
              Exclusive benefits and features for Alkebulan community members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[
                "Unique Alkebulan name code",
                "Verified digital identity",
                "Access to exclusive marketplace",
                "Community governance voting rights",
                "Cultural heritage preservation tools",
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {[
                "Priority customer support",
                "Early access to new features",
                "Investment opportunity alerts",
                "Mentorship program access",
                "Global networking events",
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-yellow-500 mb-2">50K+</div>
              <div className="text-muted-foreground">Active Members</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-500 mb-2">180+</div>
              <div className="text-muted-foreground">Countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-500 mb-2">1M+</div>
              <div className="text-muted-foreground">Transactions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-500 mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-black">Ready to Claim Your Digital Identity?</h2>
          <p className="text-black/80 text-lg mb-8">
            Join thousands of diaspora members who have already secured their place in The New Alkebulan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-black text-yellow-500 hover:bg-gray-900 text-lg px-8 py-4">
              <Crown className="mr-2 h-5 w-5" />
              Get Your Name Code Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-yellow-500 text-lg px-8 py-4 bg-transparent"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
