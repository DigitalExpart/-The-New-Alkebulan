export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="flex flex-col items-center">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Scherm_afbeelding_2025-07-20_om_19.00.08-removebg-preview-5SfpVg1sZpmH7Z60mo8coZyoqelzmF.png"
            alt="The New Alkebulan Logo"
            className="h-16 w-16 animate-spin"
            style={{ animationDuration: `${0.9 + Math.random() * 1.2}s`, animationDirection: Math.random() > 0.5 ? "reverse" : "normal" }}
          />
          <p className="text-muted-foreground mt-3">Loading...</p>
        </div>
      </div>
    </div>
  )
}


