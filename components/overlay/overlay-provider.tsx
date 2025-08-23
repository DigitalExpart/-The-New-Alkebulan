"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"

type OverlayCtx = {
  showOverlay: () => void
  hideOverlay: () => void
}

const Ctx = createContext<OverlayCtx | null>(null)

export function useOverlay() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useOverlay must be used within OverlayProvider")
  return ctx
}

export function OverlayProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [show, setShow] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const hideOverlay = () => setShow(false)
  const showOverlay = () => {
    setShow(true)
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => setShow(false), 12000)
  }

  // hide on route commit
  useEffect(() => {
    if (show) {
      const id = window.setTimeout(() => setShow(false), 150)
      return () => window.clearTimeout(id)
    }
  }, [pathname])

  // auto show on internal link clicks / back-forward
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = (e.target as Element | null)?.closest('a') as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute('href') || ''
      const isInternal = href.startsWith('/') && !href.startsWith('//')
      if (!isInternal || !href || href.startsWith('#') || anchor.target === '_blank') return
      if (href !== pathname) showOverlay()
    }
    const onPopState = () => showOverlay()
    document.addEventListener('click', onClick, true)
    window.addEventListener('popstate', onPopState)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', onPopState)
    }
  }, [pathname])

  return (
    <Ctx.Provider value={{ showOverlay, hideOverlay }}>
      {children}
      {show && (
        <div className="fixed inset-0 z-[60] backdrop-blur-sm bg-background/60 flex items-center justify-center">
          <div className="text-center">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Scherm_afbeelding_2025-07-20_om_19.00.08-removebg-preview-5SfpVg1sZpmH7Z60mo8coZyoqelzmF.png"
              alt="Loading"
              className="h-14 w-14 animate-spin"
              style={{ animationDuration: `${0.9 + Math.random() * 1.2}s`, animationDirection: Math.random() > 0.5 ? "reverse" : "normal" }}
            />
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}


