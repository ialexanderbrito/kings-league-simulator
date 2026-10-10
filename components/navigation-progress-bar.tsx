"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname } from "next/navigation"

export function NavigationProgressBar() {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)

  // Quando a rota (pathname) muda, finaliza a barra de progresso
  useEffect(() => {
    if (isNavigating) {
      setProgress(100)
      const timer = setTimeout(() => {
        setIsNavigating(false)
        setProgress(0)
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [pathname])

  // Escuta cliques em links internos para dar feedback visual instantâneo (<16ms)
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Ignora se tecla modificadora estiver pressionada (abrir em nova aba)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const target = (e.target as HTMLElement)?.closest("a")
      if (!target) return

      const href = target.getAttribute("href")
      const targetAttr = target.getAttribute("target")

      // Apenas links internos na mesma aba e diferentes da rota atual
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("//") &&
        targetAttr !== "_blank" &&
        href !== pathname &&
        href !== `${pathname}#` &&
        !href.startsWith("#")
      ) {
        setIsNavigating(true)
        setProgress(25)
      }
    }

    document.addEventListener("click", handleDocumentClick, { capture: true })
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true })
    }
  }, [pathname])

  // Animação progressiva durante o carregamento da rota
  useEffect(() => {
    if (!isNavigating) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 60) return prev + Math.floor(Math.random() * 15) + 10
        if (prev < 85) return prev + Math.floor(Math.random() * 5) + 3
        return prev // Aguarda o pathname mudar para ir a 100
      })
    }, 150)

    // Timeout de segurança para caso a navegação seja cancelada
    const safetyTimeout = setTimeout(() => {
      setIsNavigating(false)
      setProgress(0)
    }, 8000)

    return () => {
      clearInterval(interval)
      clearTimeout(safetyTimeout)
    }
  }, [isNavigating])

  if (!isNavigating && progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-opacity duration-200"
      style={{ opacity: progress === 100 ? 0 : 1 }}
      aria-hidden="true"
    >
      <div
        className="h-[3px] bg-gradient-to-r from-amber-500 via-[var(--team-primary,#F4AF23)] to-yellow-300 shadow-[0_0_12px_rgba(244,175,35,0.9)] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "150ms" : "200ms",
        }}
      />
    </div>
  )
}
