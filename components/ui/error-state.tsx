import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, Wifi, Clock, Bug } from "lucide-react"
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
        <Card className="bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 border border-[#333]/20 backdrop-blur-sm shadow-2xl max-w-2xl w-full animate-in slide-in-from-bottom duration-700">
          <CardContent className="p-8 sm:p-12 text-center">
            {/* Ícone de Erro */}
            <div className="mb-6 animate-in zoom-in duration-500 delay-100">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full scale-150" />
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-900/20 border border-red-500/30">
                  <AlertTriangle
                    className="w-12 h-12 sm:w-14 sm:h-14 text-red-500"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div className="h-1 w-24 mx-auto mt-6 bg-gradient-to-r from-transparent via-red-500/50 to-transparent rounded-full" />
            </div>

            {/* Título */}
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white animate-in fade-in duration-700 delay-200">
              Erro ao carregar dados
            </h2>

            {/* Descrição do Erro */}
            <p className="text-base sm:text-lg text-gray-400 mb-6 leading-relaxed animate-in fade-in duration-700 delay-300">
              {error}
            </p>

            {/* Sugestões */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 animate-in fade-in duration-700 delay-400">
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#1a1a1a]/50 border border-[#333]/30">
                <Wifi className="w-5 h-5 text-[var(--team-primary,#F4AF23)]" aria-hidden="true" />
                <span className="text-xs text-gray-500 text-center">Verifique sua conexão</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#1a1a1a]/50 border border-[#333]/30">
                <RefreshCw className="w-5 h-5 text-[var(--team-primary,#F4AF23)]" aria-hidden="true" />
                <span className="text-xs text-gray-500 text-center">Recarregue a página</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#1a1a1a]/50 border border-[#333]/30">
                <Clock className="w-5 h-5 text-[var(--team-primary,#F4AF23)]" aria-hidden="true" />
                <span className="text-xs text-gray-500 text-center">Aguarde e tente novamente</span>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center animate-in fade-in duration-700 delay-500">
              <Button
                onClick={onRetry}
                size="lg"
                className="bg-gradient-to-r from-[var(--team-primary,#F4AF23)] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[var(--team-primary,#F4AF23)] text-black font-semibold shadow-lg hover:shadow-[rgb(var(--team-primary-rgb),0.5)] transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className="w-5 h-5 mr-2" aria-hidden="true" />
                Tentar novamente
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-[#333] bg-[#1a1a1a]/50 hover:bg-[#1a1a1a] hover:border-[rgb(var(--team-primary-rgb),0.5)] transition-all duration-300 hover:scale-105"
              >
                <Link href="/" className="flex items-center gap-2">
                  <Home className="w-5 h-5" aria-hidden="true" />
                  Voltar ao início
                </Link>
              </Button>
            </div>

            {/* Detalhes técnicos */}
            {debugInfo && (
              <div className="mt-8 pt-6 border-t border-[#333]/30 animate-in fade-in duration-700 delay-600">
                <details className="group">
                  <summary className="flex items-center justify-center gap-2 text-xs text-gray-500 cursor-pointer hover:text-gray-400 transition-colors">
                    <Bug className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Detalhes técnicos</span>
                  </summary>
                  <pre className="mt-3 text-xs text-gray-600 bg-black/30 p-4 rounded-lg overflow-x-auto text-left border border-[#333]/20">
                    {debugInfo}
                  </pre>
                </details>
              </div>
            )}

            {/* Link de Suporte */}
            <div className="mt-6 pt-6 border-t border-[#333]/30 animate-in fade-in duration-700 delay-700">
              <p className="text-sm text-gray-500">
                Problema persistindo?{' '}
                <a
                  href="https://github.com/ialexanderbrito/kings-league-simulator/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--team-primary,#F4AF23)] hover:text-[#f59e0b] underline transition-colors duration-200"
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