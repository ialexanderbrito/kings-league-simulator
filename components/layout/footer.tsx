import Link from 'next/link'
import { Separator } from "@/components/ui/separator"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-16 py-8 bg-gradient-to-b from-transparent to-black/40 backdrop-blur-sm border-t border-[#333]/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Sobre */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-lg font-semibold text-white">Kings League Simulator</h3>
            <p className="text-sm text-gray-400">
              Simulador não-oficial da Kings League, oferecendo estatísticas em tempo real,
              simulação de partidas e informações detalhadas sobre times e jogadores.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="https://github.com/ialexanderbrito/kings-league-simulator"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub Repository"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="https://twitter.com/ialexanderbrito"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter Profile"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-lg font-semibold text-white">Links Úteis</h3>
            <nav aria-label="Links de navegação do rodapé">
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Início
                  </Link>
                </li>
                {/* <li>
                  <Link href="/teams" className="text-gray-400 hover:text-white transition-colors">
                    Times
                  </Link>
                </li>
                <li>
                  <Link href="/standings" className="text-gray-400 hover:text-white transition-colors">
                    Classificação
                  </Link>
                </li>
                <li>
                  <Link href="/players" className="text-gray-400 hover:text-white transition-colors">
                    Jogadores
                  </Link>
                </li> */}
              </ul>
            </nav>
          </div>

          {/* Informações Legais */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-lg font-semibold text-white">Informações Legais</h3>
            <p className="text-sm text-gray-400">
              Este é um projeto não-oficial feito por fãs. Todos os nomes, logos e marcas registradas pertencem aos seus respectivos proprietários.
            </p>
            <p className="text-xs text-gray-500">
              Kings League é uma marca registrada de Kosmos. Este site não possui nenhuma afiliação oficial.
            </p>
          </div>
        </div>

        <Separator className="bg-gray-800 mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left">
          <p className="text-sm text-gray-400">
            © {currentYear} Kings League Simulator. Todos os direitos reservados.
          </p>

          <div className="mt-4 md:mt-0 flex items-center">
            <p className="text-sm text-gray-400">
              Desenvolvido com <span className="text-[var(--team-primary)]">♥</span> por
            </p>
            <a
              href="https://ialexanderbrito.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-md font-medium text-white hover:text-[var(--team-primary)] transition-colors group flex items-center gap-1.5"
            >
              ialexanderbrito
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}