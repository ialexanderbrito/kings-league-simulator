import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Página não encontrada | Kings League Simulador',
  description: 'A página que você está procurando não foi encontrada. Retorne para a página inicial do Kings League Simulador.',
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-white px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold mb-4 text-[var(--team-primary,#f59e0b)]">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Página não encontrada</h2>
        <p className="mb-8 text-gray-400">
          A página que você está procurando pode ter sido removida, teve seu nome alterado ou está temporariamente indisponível.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default" className="bg-[var(--team-primary,#f59e0b)] hover:bg-[var(--team-primary,#f59e0b)]/80">
            <Link href="/">
              Voltar para a página inicial
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/standings">
              Ver classificação
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}