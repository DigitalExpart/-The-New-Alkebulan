"use client"

import { useCart } from "@/components/commerce/cart-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart()
  const [placing, setPlacing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe")
  const [useDifferentBilling, setUseDifferentBilling] = useState(false)

  // Shipping fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [region, setRegion] = useState("")
  const [postal, setPostal] = useState("")
  const [country, setCountry] = useState("")

  // Billing fields (optional)
  const [bAddress, setBAddress] = useState("")
  const [bCity, setBCity] = useState("")
  const [bRegion, setBRegion] = useState("")
  const [bPostal, setBPostal] = useState("")
  const [bCountry, setBCountry] = useState("")

  // Card fields (UI only; Stripe Checkout handles secure entry)
  const [cardName, setCardName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const paypalClientId = useMemo(() => process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID, []) as string | undefined

  const stripeCheckout = async () => {
    try {
      setPlacing(true)
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerEmail: email,
          shipping: { firstName, lastName, address, city, region, postal, country },
          billing: useDifferentBilling
            ? { address: bAddress, city: bCity, region: bRegion, postal: bPostal, country: bCountry }
            : { address, city, region, postal, country },
          cardName,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Checkout failed")
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (e: any) {
      toast.error(e?.message || "Stripe checkout failed. Configure STRIPE_SECRET_KEY.")
      setPlacing(false)
    }
  }

  const initPayPal = async () => {
    if (!paypalClientId) {
      toast.error("PayPal not configured. Set NEXT_PUBLIC_PAYPAL_CLIENT_ID.")
      return
    }
    // load SDK if not present
    if (!(window as any).paypal) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script")
        script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD`
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error("Failed to load PayPal SDK"))
        document.body.appendChild(script)
      })
    }
    const paypal = (window as any).paypal
    paypal.Buttons({
      createOrder: (_: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{ amount: { value: subtotal.toFixed(2) } }],
        })
      },
      onApprove: (_: any, actions: any) => {
        return actions.order.capture().then(() => {
          clear()
          toast.success("Payment successful via PayPal")
          window.location.href = "/marketplace"
        })
      },
      onError: (err: any) => {
        console.error(err)
        toast.error("PayPal payment failed")
      },
    }).render("#paypal-button-container")
  }

  useEffect(() => {
    if (paymentMethod === "paypal" && items.length > 0) {
      // defer init to ensure container exists
      setTimeout(() => initPayPal().catch(console.error), 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod, subtotal, items.length])

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Billing & Shipping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <Input placeholder="State/Region" value={region} onChange={(e) => setRegion(e.target.value)} />
              <Input placeholder="Postal code" value={postal} onChange={(e) => setPostal(e.target.value)} />
            </div>
            <Input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />

            {/* Billing address toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={useDifferentBilling} onChange={(e) => setUseDifferentBilling(e.target.checked)} />
                Use a different billing address
              </label>
            </div>

            {useDifferentBilling && (
              <div className="mt-2 space-y-3 border rounded-md p-3">
                <p className="text-sm font-medium">Billing Address</p>
                <Input placeholder="Address" value={bAddress} onChange={(e) => setBAddress(e.target.value)} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input placeholder="City" value={bCity} onChange={(e) => setBCity(e.target.value)} />
                  <Input placeholder="State/Region" value={bRegion} onChange={(e) => setBRegion(e.target.value)} />
                  <Input placeholder="Postal code" value={bPostal} onChange={(e) => setBPostal(e.target.value)} />
                </div>
                <Input placeholder="Country" value={bCountry} onChange={(e) => setBCountry(e.target.value)} />
              </div>
            )}

            {/* Payment method */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Payment Method</p>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="payment_method" checked={paymentMethod === "stripe"} onChange={() => setPaymentMethod("stripe")} />
                  Card (Credit/Debit via Stripe)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="payment_method" checked={paymentMethod === "paypal"} onChange={() => setPaymentMethod("paypal")} />
                  PayPal
                </label>
              </div>
            </div>

            {paymentMethod === "stripe" && (
              <div className="space-y-3">
                <Input placeholder="Cardholder name" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                <Input placeholder="Card number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                  <Input placeholder="CVC" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} />
                </div>
                <p className="text-xs text-muted-foreground">Card details are processed securely by Stripe.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Payment selection moved to form; summary shows appropriate action */}
            <div className="space-y-3 max-h-60 overflow-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="truncate">{item.name}</p>
                    <p className="text-muted-foreground">x{item.quantity}</p>
                  </div>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground">Your cart is empty.</p>
              )}
            </div>
            <div className="flex items-center justify-between font-medium">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {paymentMethod === "stripe" ? (
              <Button className="w-full" onClick={stripeCheckout} disabled={placing || items.length === 0}>
                {placing ? "Redirecting..." : "Place Order"}
              </Button>
            ) : (
              <div className="space-y-2">
                <div id="paypal-button-container"></div>
                {!paypalClientId && (
                  <p className="text-xs text-red-500">PayPal not configured.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


