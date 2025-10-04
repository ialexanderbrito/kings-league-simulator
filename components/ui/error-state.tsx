import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import KingsLeagueLogo from "@/components/kings-league-logo"
import Link from "next/link"

interface ErrorStateProps {
  error: string
  debugInfo?: string | null
  onRetry: () => void
}

export function ErrorState({ error, debugInfo, onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        {/* Logo */}
        <div className="mb-8 animate-in fade-in duration-500">
          <KingsLeagueLogo
            className="mx-auto"
            width={80}
            height={102}
            aria-label="Kings League Brasil Logo"
          />
        </div>

        {/* Conteúdo Principal */}
        <Card className="bg-gradient-to-br from-red-950/30 to-[#0f0f0f]/80 border border-red-900/30 backdrop-blur-sm shadow-2xl max-w-2xl w-full animate-in slide-in-from-bottom duration-700">
          <CardContent className="p-8 sm:p-12">
            {/* Ícone de Erro */}
            <div className="flex justify-center mb-6 animate-in zoom-in duration-500 delay-100">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
                <AlertTriangle
                  className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 relative"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Título */}
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-white animate-in fade-in duration-700 delay-200">
              Erro ao carregar dados
            </h2>

            {/* Descrição do Erro */}
            <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-4 mb-6 animate-in fade-in duration-700 delay-300">
              <p className="text-sm sm:text-base text-gray-300 text-center leading-relaxed">
                {error}
              </p>

              {debugInfo && (
                <details className="mt-4">
                  <summary className="text-xs text-red-400 cursor-pointer hover:text-red-300 transition-colors text-center">
                    Detalhes técnicos
                  </summary>
                  <pre className="mt-2 text-xs text-gray-500 bg-black/30 p-3 rounded overflow-x-auto">
                    {debugInfo}
                  </pre>
                </details>
              )}
            </div>

            {/* Sugestões */}
            <div className="bg-[#1a1a1a]/50 border border-[#333]/30 rounded-lg p-4 mb-6 animate-in fade-in duration-700 delay-400">
              <p className="text-sm text-gray-400 mb-3 font-medium">Possíveis soluções:</p>
              <ul className="text-sm text-gray-500 space-y-2 list-disc list-inside">
                <li>Verifique sua conexão com a internet</li>
                <li>Tente recarregar a página</li>
                <li>Aguarde alguns instantes e tente novamente</li>
              </ul>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in duration-700 delay-500">
              <Button
                onClick={onRetry}
                size="lg"
                className="flex-1 bg-gradient-to-r from-[#F4AF23] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#F4AF23] text-black font-semibold shadow-lg hover:shadow-[#F4AF23]/50 transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className="w-5 h-5 mr-2" aria-hidden="true" />
                Tentar novamente
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="flex-1 border-[#333] bg-[#1a1a1a]/50 hover:bg-[#1a1a1a] hover:border-[#F4AF23]/50 transition-all duration-300 hover:scale-105"
              >
                <Link href="/" className="flex items-center justify-center gap-2">
                  <Home className="w-5 h-5" aria-hidden="true" />
                  Voltar ao início
                </Link>
              </Button>
            </div>

            {/* Link de Suporte */}
            <div className="mt-6 pt-6 border-t border-[#333]/30 text-center animate-in fade-in duration-700 delay-600">
              <p className="text-xs text-gray-500">
                Problema persistindo?{' '}
                <a
                  href="https://github.com/ialexanderbrito/kings-league-simulator/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F4AF23] hover:text-[#f59e0b] underline transition-colors duration-200"
                >
                  Reporte o erro
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}