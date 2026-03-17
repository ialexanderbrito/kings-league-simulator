"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ButtonTopProps {
  showAtHeight?: number
  className?: string
}

export function ButtonTop({ showAtHeight = 300, className }: ButtonTopProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > showAtHeight) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility, { passive: true })

    toggleVisibility()

    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [showAtHeight])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      className={cn(
        "fixed z-50 flex items-center justify-center",
        "bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))]",
        "h-10 w-10 sm:h-11 sm:w-11 rounded-xl",
        "bg-card/95 supports-[backdrop-filter]:bg-card/80 backdrop-blur-md",
        "border border-border/70",
        "text-[var(--team-primary,#F4AF23)]",
        "shadow-2xl shadow-black/40",
        "transition-all duration-300",
        "hover:scale-105 hover:-translate-y-0.5 hover:border-[var(--team-primary,#F4AF23)]/40 hover:text-[var(--team-primary,#F4AF23)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--team-primary,#F4AF23)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "active:scale-95",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none",
        className
      )}
    >
      <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
    </button>
  )
}