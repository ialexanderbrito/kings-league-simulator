import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import KingsLeagueLogo from "@/components/kings-league-logo"

interface ErrorStateProps {
  error: string
  debugInfo?: string | null
  onRetry: () => void
}

export function ErrorState({ error, debugInfo, onRetry }: ErrorStateProps) {
  return (
    <div className="container mx-auto px-4 py-8 bg-[#121212] min-h-screen">
      <div className="flex justify-center mb-8">
        <KingsLeagueLogo className="mx-auto" width={100} height={128} />
      </div>
      <h1 className="text-3xl font-bold text-center mb-8 text-[#F4AF23]">Simulador Kings League Brasil</h1>

      <div className="bg-red-900/60 backdrop-blur border border-red-700 text-white p-6 rounded-md max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold mb-2 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
          Erro ao carregar dados
        </h2>
        <p>{error}</p>
        {debugInfo && <p className="mt-2 text-xs text-red-400">{debugInfo}</p>}
        <Button className="mt-4 bg-red-700 hover:bg-red-600" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    </div>
  )
}