"use client"

import { useEffect } from "react"
import { ErrorState } from "@/components/ui/error-state"

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Erro capturado pela rota:", error)
  }, [error])

  return (
    <ErrorState
      title="Algo não saiu como esperado"
      error={error?.message || "Ocorreu uma falha inesperada ao carregar esta visualização."}
      debugInfo={error?.digest ? `Digest: ${error.digest}` : (error?.stack || null)}
      onRetry={reset}
    />
  )
}
