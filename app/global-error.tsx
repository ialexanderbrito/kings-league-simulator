"use client"

import { useEffect } from "react"
import { ErrorState } from "@/components/ui/error-state"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Erro crítico na aplicação capturado:", error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body className="bg-[#060608] text-white">
        <ErrorState
          title="Falha na inicialização"
          error={error?.message || "Ocorreu uma instabilidade crítica no carregamento do simulador."}
          debugInfo={error?.digest ? `Digest: ${error.digest}` : (error?.stack || null)}
          onRetry={reset}
        />
      </body>
    </html>
  )
}
