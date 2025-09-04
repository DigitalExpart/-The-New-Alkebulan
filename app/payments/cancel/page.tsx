export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-2xl font-semibold">Payment canceled</h1>
        <p className="text-muted-foreground">Your payment was canceled or failed. You can try again.</p>
        <a href="/" className="underline">Go back home</a>
      </div>
    </div>
  )
}


