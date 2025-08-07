import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Scan, Fingerprint, ShieldCheck, AlertTriangle } from "lucide-react"

export const metadata: Metadata = {
  title: "Biometric Verification | Diaspora Market Hub",
  description: "Secure your account with facial recognition",
}

export default function BiometricVerificationPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
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
                  <Link
                    href="/profile/account-protection"
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Account Protection
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-sm font-medium text-gray-500">Biometric Verification</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Back Button */}
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/profile/account-protection" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Account Protection
            </Link>
          </Button>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Biometric Verification</CardTitle>
              <CardDescription>Secure your account with facial recognition</CardDescription>
            </div>
            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
              Not Started
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4">
                  <Scan className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Set Up Biometric Verification</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                  Enhance your account security with biometric verification. This allows for faster login and stronger
                  protection.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 hover:border-blue-200 transition-all duration-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Scan className="h-5 w-5 text-blue-500" />
                    Facial Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Use your device's camera to verify your identity with facial recognition.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Set Up Face ID</Button>
                </CardFooter>
              </Card>

              <Card className="border-2 hover:border-blue-200 transition-all duration-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-blue-500" />
                    Fingerprint
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Use your device's fingerprint scanner to verify your identity.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Set Up Fingerprint</Button>
                </CardFooter>
              </Card>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <div>
                  <h3 className="font-medium">Enhanced Security</h3>
                  <p className="text-sm text-gray-500">
                    Biometric verification adds an extra layer of security to your account.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <div>
                  <h3 className="font-medium">Important Note</h3>
                  <p className="text-sm text-gray-500">
                    Your biometric data is securely stored on your device only and is never transmitted to our servers.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full sm:w-auto bg-transparent">
              Learn More About Biometrics
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
