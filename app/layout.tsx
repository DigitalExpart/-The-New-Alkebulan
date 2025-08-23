import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/components/commerce/cart-context"
import { WishlistProvider } from "@/components/commerce/wishlist-context"
import { RouteProgressOverlay } from "@/components/route-progress-overlay"
import { AIAssistantProvider } from "@/components/ai-assistant/ai-assistant-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { PrototypePopup } from "@/components/prototype-popup"
import { FriendRequestNotification } from "@/components/notifications/friend-request-notification"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "The New Alkebulan - Empowering Global Communities",
  description:
    "A platform connecting diaspora communities through marketplace innovation, continuous learning, and collaborative growth.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`${inter.className} font-agrandir-regular`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={false}
          storageKey="the-new-alkebulan-theme"
        >
          <CartProvider>
            <WishlistProvider>
              <AuthProvider>
                <AIAssistantProvider>
                <div className="min-h-screen flex flex-col theme-transition">
                  <Navbar />
                  <main className="flex-1 pt-16 theme-transition">{children}</main>
                  <Footer />
                </div>
                <RouteProgressOverlay />
                <PrototypePopup />
                <FriendRequestNotification />
                <Toaster position="top-right" />
                </AIAssistantProvider>
              </AuthProvider>
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
