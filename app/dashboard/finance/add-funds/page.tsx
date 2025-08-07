"use client"

import { useState } from "react"
import { AddFundsForm } from "@/components/payment/add-funds-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CreditCard, Shield, Zap, Clock, CheckCircle, Info } from "lucide-react"
import Link from "next/link"

export default function AddFundsPage() {
  const [currentBalance] = useState(1247.5) // This would come from user data
  const [newBalance, setNewBalance] = useState(currentBalance)

  const features = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "256-bit SSL encryption and PCI DSS compliance",
    },
    {
      icon: Zap,
      title: "Instant Processing",
      description: "Funds available immediately after payment",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer assistance",
    },
  ]

  const paymentMethods = [
    { name: "Credit Cards", description: "Visa, MasterCard, American Express", fee: "2.9% + $0.30" },
    { name: "Debit Cards", description: "All major debit cards accepted", fee: "1.9% + $0.30" },
    { name: "Bank Transfer", description: "Direct bank account transfer", fee: "Free (3-5 business days)" },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/dashboard/finance">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Finance
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Add Funds</h1>
          <p className="text-lg text-muted-foreground">Securely add money to your Diaspora Market Hub account</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <AddFundsForm currentBalance={currentBalance} onSuccess={setNewBalance} />
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Security Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                Why Choose Our Payment System?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment Methods & Fees */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                Payment Methods & Fees
              </CardTitle>
              <CardDescription>Transparent pricing with no hidden charges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentMethods.map((method, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm">{method.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {method.fee}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-blue-800">
                <Info className="h-5 w-5 mr-2" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-700">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>Minimum deposit: $5.00</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>Maximum deposit: $10,000 per transaction</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>Funds are available immediately</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>All transactions are encrypted and secure</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>24/7 fraud monitoring and protection</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardContent className="pt-6 text-center">
              <h4 className="font-medium mb-2">Need Help?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Our support team is here to assist you with any payment questions.
              </p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
