"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  const [isLogoAnimating, setIsLogoAnimating] = useState(false)

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLogoAnimating(true)
    setTimeout(() => {
      setIsLogoAnimating(false)
      window.location.href = "/"
    }, 2500)
  }

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
      `}</style>
      <footer className="dark:bg-[hsl(var(--background))] border-t border-[hsl(var(--border))] mt-auto bg-[#07370d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center space-x-3" onClick={handleLogoClick}>
                <div
                  className={`relative w-12 h-12 flex-shrink-0 transition-transform duration-200 ease-in-out cursor-pointer ${
                    isLogoAnimating ? "heartbeat-animation" : "hover:scale-110"
                  }`}
                >
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Scherm_afbeelding_2025-07-20_om_19.00.08-removebg-preview-5SfpVg1sZpmH7Z60mo8coZyoqelzmF.png"
                    alt="The New Alkebulan Logo"
                    width={48}
                    height={48}
                    className="rounded-full object-contain"
                  />
                </div>
                <span className="font-bold text-lg text-yellow-500">The New Alkebulan</span>
              </Link>
              <p className="dark:text-[hsl(var(--muted-foreground))] text-sm text-white">
                Empowering the African diaspora through community, culture, and connection. Building bridges across
                continents.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="dark:text-[hsl(var(--muted-foreground))] text-white hover:text-yellow-500 transition-colors">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link href="#" className="dark:text-[hsl(var(--muted-foreground))] text-white hover:text-yellow-500 transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link href="#" className="dark:text-[hsl(var(--muted-foreground))] text-white hover:text-yellow-500 transition-colors">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link href="#" className="dark:text-[hsl(var(--muted-foreground))] text-white hover:text-yellow-500 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link href="#" className="dark:text-[hsl(var(--muted-foreground))] text-white hover:text-yellow-500 transition-colors">
                  <Youtube className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold dark:text-[hsl(var(--foreground))] mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/communities"
                    className="dark:text-[hsl(var(--muted-foreground))] hover:text-yellow-500 transition-colors text-sm text-white"
                  >
                    Community
                  </Link>
                </li>
                <li>
                  <Link
                    href="/marketplace"
                    className="dark:text-[hsl(var(--muted-foreground))] hover:text-yellow-500 transition-colors text-sm text-white"
                  >
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link
                    href="/learning"
                    className="dark:text-[hsl(var(--muted-foreground))] text-white hover:text-yellow-500 transition-colors text-sm"
                  >
                    Learning Hub
                  </Link>
                </li>
                <li>
                  <Link
                    href="/business"
                    className="dark:text-[hsl(var(--muted-foreground))] text-white hover:text-yellow-500 transition-colors text-sm"
                  >
                    Business
                  </Link>
                </li>
                <li>
                  <Link
                    href="/health"
                    className="dark:text-[hsl(var(--muted-foreground))] text-white hover:text-yellow-500 transition-colors text-sm"
                  >
                    Health & Wellness
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold dark:text-[hsl(var(--foreground))] mb-4 text-white">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/help"
                    className="dark:text-[hsl(var(--muted-foreground))] text-white hover:text-yellow-500 transition-colors text-sm"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="dark:text-[hsl(var(--muted-foreground))] text-white hover:text-yellow-500 transition-colors text-sm"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="dark:text-[hsl(var(--muted-foreground))] text-white hover:text-yellow-500 transition-colors text-sm"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="dark:text-[hsl(var(--muted-foreground))] text-white hover:text-yellow-500 transition-colors text-sm"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/governance/about"
                    className="dark:text-[hsl(var(--muted-foreground))] text-white hover:text-yellow-500 transition-colors text-sm"
                  >
                    Governance
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold dark:text-[hsl(var(--foreground))] mb-4 text-white">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-yellow-500" />
                  <span className="dark:text-[hsl(var(--muted-foreground))] text-white text-sm">hello@newalkebulan.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-yellow-500" />
                  <span className="dark:text-[hsl(var(--muted-foreground))] text-white text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-yellow-500" />
                  <span className="dark:text-[hsl(var(--muted-foreground))] text-white text-sm">Global Community</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[hsl(var(--border))] mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="dark:text-[hsl(var(--muted-foreground))] text-white text-sm">
              © 2024 The New Alkebulan. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link
                href="/accessibility"
                className="dark:text-[hsl(var(--muted-foreground))] text-white hover:text-yellow-500 transition-colors text-sm"
              >
                Accessibility
              </Link>
              <Link
                href="/cookies"
                className="dark:text-[hsl(var(--muted-foreground))] text-white hover:text-yellow-500 transition-colors text-sm"
              >
                Cookie Policy
              </Link>
              <Link
                href="/sitemap"
                className="dark:text-[hsl(var(--muted-foreground))] text-white hover:text-yellow-500 transition-colors text-sm"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
