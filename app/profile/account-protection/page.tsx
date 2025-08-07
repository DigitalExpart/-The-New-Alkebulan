import type { Metadata } from "next"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { InfoIcon, Shield } from "lucide-react"
import { VerificationCard } from "@/components/verification/verification-card"
import { VerificationStats } from "@/components/verification/verification-stats"
import { userVerification } from "@/data/verification-methods"

export const metadata: Metadata = {
  title: "Account Protection | Diaspora Market Hub",
  description: "Verify your identity and secure your account",
}

export default function AccountProtectionPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        {/* Header with breadcrumbs */}
        <div className="flex flex-col gap-1">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link
                  href="/"
                  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link href="/profile" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Profile
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-sm font-medium text-gray-500">Account Protection</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Main Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Stay Safe, Be Protected</h1>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Premium
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">With our Verification technology</p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Bank-level security</span>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Completing verification helps protect your account and enables additional platform features. All information
            is encrypted and securely stored.
          </AlertDescription>
        </Alert>

        {/* Verification Stats */}
        <VerificationStats verification={userVerification} />

        {/* Verification Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userVerification.methods.map((method) => (
            <VerificationCard key={method.id} method={method} baseUrl="/profile/account-protection" />
          ))}
        </div>

        {/* Security Tips */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Security Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Use a strong password</h3>
              <p className="text-sm text-gray-500">
                Create a unique password with a mix of letters, numbers, and symbols.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Enable two-factor authentication</h3>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account with 2FA.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
