import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Table, Trophy, Search } from 'lucide-react'
import KingsLeagueLogo from '@/components/kings-league-logo'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Página não encontrada | Kings League Simulador',
  description: 'A página que você está procurando não foi encontrada. Retorne para a página inicial do Kings League Simulador.',
}

export default function NotFound() {
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
            {/* Código de Erro */}
            <div className="mb-6 animate-in zoom-in duration-500 delay-100">
              <h1 className="text-8xl sm:text-9xl font-black mb-2 bg-gradient-to-r from-[#F4AF23] via-[#f59e0b] to-[#F4AF23] bg-clip-text text-transparent animate-pulse-slow">
                404
              </h1>
              <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-[#F4AF23] to-transparent rounded-full" />
            </div>

            {/* Título */}
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white animate-in fade-in duration-700 delay-200">
              Página não encontrada
            </h2>

            {/* Descrição */}
            <p className="text-base sm:text-lg text-gray-400 mb-8 leading-relaxed animate-in fade-in duration-700 delay-300">
              Ops! Parece que você tentou acessar uma página que não existe ou foi movida.
              Não se preocupe, você pode voltar para o início ou explorar outras seções.
            </p>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center animate-in fade-in duration-700 delay-400">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-[#F4AF23] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#F4AF23] text-black font-semibold shadow-lg hover:shadow-[#F4AF23]/50 transition-all duration-300 hover:scale-105"
              >
                <Link href="/" className="flex items-center gap-2">
                  <Home className="w-5 h-5" aria-hidden="true" />
                  Página Inicial
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-[#333] bg-[#1a1a1a]/50 hover:bg-[#1a1a1a] hover:border-[#F4AF23]/50 transition-all duration-300 hover:scale-105"
              >
                <Link href="/standings" className="flex items-center gap-2">
                  <Table className="w-5 h-5" aria-hidden="true" />
                  Classificação
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-[#333] bg-[#1a1a1a]/50 hover:bg-[#1a1a1a] hover:border-[#F4AF23]/50 transition-all duration-300 hover:scale-105"
              >
                <Link href="/simulator" className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" aria-hidden="true" />
                  Simulador
                </Link>
              </Button>
            </div>

            {/* Links Rápidos */}
            <div className="mt-8 pt-8 border-t border-[#333]/30 animate-in fade-in duration-700 delay-500">
              <p className="text-sm text-gray-500 mb-3">Links úteis:</p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link
                  href="/teams"
                  className="text-gray-400 hover:text-[#F4AF23] transition-colors duration-200 hover:underline"
                >
                  Times
                </Link>
                <span className="text-gray-600">•</span>
                <Link
                  href="/playoffs"
                  className="text-gray-400 hover:text-[#F4AF23] transition-colors duration-200 hover:underline"
                >
                  Playoffs
                </Link>
                <span className="text-gray-600">•</span>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-[#F4AF23] transition-colors duration-200 hover:underline"
                >
                  Início
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mensagem de Ajuda */}
        <p className="mt-8 text-sm text-gray-500 animate-in fade-in duration-700 delay-600 text-center">
          Se você acredita que isso é um erro, por favor{' '}
          <a
            href="https://github.com/ialexanderbrito/kings-league-simulator/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F4AF23] hover:text-[#f59e0b] underline transition-colors duration-200"
          >
            reporte o problema
          </a>
        </p>
      </div>
    </div>
  )
}