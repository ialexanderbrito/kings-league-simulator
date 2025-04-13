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

    window.addEventListener("scroll", toggleVisibility)

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
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--team-primary)] text-black shadow-lg transition-all duration-300",
        "hover:scale-110 active:scale-95",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none",
        className
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}