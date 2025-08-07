"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, Users } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background with African pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-red-900">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.3'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-2xl font-bold text-amber-900">🌍</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            My Alkebulan
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-normal text-amber-200 mt-2">
              Reclaiming Legacy & Identity
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-amber-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Explore the roots, rituals, and resilience of the African spirit — past, present and future.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-amber-900 font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Explore Heritage
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-amber-200 text-amber-100 hover:bg-amber-200 hover:text-amber-900 font-semibold px-8 py-3 rounded-full transition-all duration-300 bg-transparent"
          >
            <Users className="w-5 h-5 mr-2" />
            Connect with Community
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-amber-300">3000+</div>
            <div className="text-amber-100">Years of History</div>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-amber-300">2000+</div>
            <div className="text-amber-100">Languages & Dialects</div>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-amber-300">54</div>
            <div className="text-amber-100">Nations United</div>
          </div>
        </div>
      </div>
    </section>
  )
}
