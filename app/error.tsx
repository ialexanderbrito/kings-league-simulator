"use client"

import { useEffect } from "react"
import { ErrorState } from "@/components/ui/error-state"
import { useLocale } from "@/contexts/locale-context"

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorBoundaryProps) {
  const { locale } = useLocale()
  useEffect(() => {
    console.error("Erro capturado pela rota:", error)
  }, [error])

  return (
    <ErrorState
      title={locale === "en" ? "Something went wrong" : locale === "es" ? "Algo salió mal" : "Algo não saiu como esperado"}
      error={error?.message || (locale === "en" ? "An unexpected error occurred while loading this view." : locale === "es" ? "Ocurrió un error inesperado al cargar esta vista." : "Ocorreu uma falha inesperada ao carregar esta visualização.")}
      debugInfo={error?.digest ? `Digest: ${error.digest}` : (error?.stack || null)}
      onRetry={reset}
    />
  )
}
