export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-2xl font-semibold">Payment successful</h1>
        <p className="text-muted-foreground">Thank you! Your payment has been confirmed.</p>
        <a href="/" className="underline">Go back home</a>
      </div>
    </div>
  )
}


