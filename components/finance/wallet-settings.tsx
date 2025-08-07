"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, CreditCard, Smartphone, Plus, Settings, CheckCircle, AlertCircle, Copy } from "lucide-react"
import type { WalletConnection } from "@/types/finance"

interface WalletSettingsProps {
  walletConnections: WalletConnection[]
  selectedCurrency: "eur" | "usd" | "dmh"
  onCurrencyChange: (currency: "eur" | "usd" | "dmh") => void
}

export function WalletSettings({ walletConnections, selectedCurrency, onCurrencyChange }: WalletSettingsProps) {
  const [autoWithdraw, setAutoWithdraw] = useState(false)
  const [withdrawThreshold, setWithdrawThreshold] = useState("1000")
  const [notifications, setNotifications] = useState(true)

  const getWalletIcon = (type: WalletConnection["type"]) => {
    switch (type) {
      case "crypto":
        return <Wallet className="h-5 w-5" />
      case "bank":
        return <CreditCard className="h-5 w-5" />
      case "paypal":
        return <Smartphone className="h-5 w-5" />
      default:
        return <Wallet className="h-5 w-5" />
    }
  }

  const formatBalance = (balance: number | undefined, currency: string) => {
    if (balance === undefined) return "N/A"

    if (currency === "ETH" || currency === "BTC") {
      return `${balance.toFixed(4)} ${currency}`
    }

    const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : currency
    return `${symbol}${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Currency Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Currency Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Primary Display Currency</Label>
              <div className="flex space-x-2 mt-2">
                <Button
                  variant={selectedCurrency === "eur" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCurrencyChange("eur")}
                >
                  EUR (€)
                </Button>
                <Button
                  variant={selectedCurrency === "usd" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCurrencyChange("usd")}
                >
                  USD ($)
                </Button>
                <Button
                  variant={selectedCurrency === "dmh" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCurrencyChange("dmh")}
                >
                  DMH Tokens
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Connections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Connected Wallets & Accounts</CardTitle>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {walletConnections.map((wallet) => (
              <div key={wallet.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getWalletIcon(wallet.type)}
                    <div>
                      <div className="font-medium">{wallet.name}</div>
                      <div className="text-sm text-gray-500">
                        {wallet.type === "crypto" && wallet.address && (
                          <div className="flex items-center space-x-2">
                            <span>
                              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(wallet.address!)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        {wallet.type !== "crypto" && wallet.accountNumber && <span>{wallet.accountNumber}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {wallet.balance !== undefined && (
                      <div className="text-right">
                        <div className="font-medium">{formatBalance(wallet.balance, wallet.currency)}</div>
                        <div className="text-sm text-gray-500">Available</div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      {wallet.isConnected ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Disconnected
                        </Badge>
                      )}

                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Auto-withdraw Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Payment Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto-withdraw</Label>
                <p className="text-sm text-gray-500">Automatically withdraw funds when threshold is reached</p>
              </div>
              <Switch checked={autoWithdraw} onCheckedChange={setAutoWithdraw} />
            </div>

            {autoWithdraw && (
              <div>
                <Label htmlFor="threshold" className="text-sm font-medium">
                  Withdrawal Threshold
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="threshold"
                    type="number"
                    value={withdrawThreshold}
                    onChange={(e) => setWithdrawThreshold(e.target.value)}
                    className="w-32"
                  />
                  <span className="text-sm text-gray-500">EUR</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Funds will be automatically withdrawn to your primary account when balance exceeds this amount
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive email alerts for transactions and payments</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
