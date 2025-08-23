"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export function RouteProgressOverlay() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  // Hide overlay when the route has changed
  useEffect(() => {
    if (show) {
      // small delay to avoid flash
      const id = window.setTimeout(() => setShow(false), 150)
      return () => window.clearTimeout(id)
    }
  }, [pathname])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Only consider left-clicks without modifier keys
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const target = e.target as Element | null
      if (!target) return
      const anchor = target.closest('a') as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute('href') || ''
      if (!href || href.startsWith('#') || anchor.target === '_blank') return
      // Internal links only
      const isInternal = href.startsWith('/') && !href.startsWith('//')
      if (!isInternal) return
      // If navigating to a different path
      if (href !== pathname) {
        setShow(true)
        // Safety timeout in case navigation is interrupted
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
        timeoutRef.current = window.setTimeout(() => setShow(false), 12000)
      }
    }

    const onPopState = () => {
      setShow(true)
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => setShow(false), 12000)
    }

    document.addEventListener('click', onClick, true)
    window.addEventListener('popstate', onPopState)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', onPopState)
    }
  }, [pathname])

  if (!show) return null
  return (
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
  )
}


