"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/layout/footer'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermosDeUso() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Header
        loading={false}
        selectedTeam={selectedTeam}
        onTeamSelect={(id) => setSelectedTeam(id)}
        setActiveTab={() => { }}
      />

      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-4xl">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-gray-500 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </Link>

        <div className="text-center space-y-4 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--team-primary)]/10 border border-[var(--team-primary)]/20">
            <FileText className="w-4 h-4 text-[var(--team-primary)]" />
            <span className="text-sm font-medium text-[var(--team-primary)]">Informações Legais</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white">Termos de Uso</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Diretrizes e condições para uso do Kings League Simulador.
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#111] p-6 sm:p-8 shadow-2xl">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--team-primary)]">1. Aceitação dos Termos</h2>
            <p className="mb-4">
              Ao acessar e utilizar o Kings League Simulador, você concorda em cumprir e estar sujeito a estes Termos de Uso.
              Se você não concordar com qualquer parte destes termos, por favor, não utilize o site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--team-primary)]">2. Isenção de Responsabilidade</h2>
            <p className="mb-4">
              O Kings League Simulador é um projeto não-oficial criado por fãs e não possui qualquer afiliação,
              endosso ou vínculo oficial com a Kings League, Kosmos, ou seus organizadores.
            </p>
            <p className="mb-4">
              Todos os nomes, logotipos, marcas registradas e conteúdos relacionados à Kings League
              são propriedade de seus respectivos donos e são utilizados aqui apenas para fins informativos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--team-primary)]">3. Uso do Conteúdo</h2>
            <p className="mb-4">
              Todos os dados e informações disponibilizados no Kings League Simulador são para uso pessoal e não comercial.
              Não é permitido reproduzir, duplicar, copiar, vender, revender ou explorar qualquer parte do conteúdo
              para fins comerciais sem autorização expressa.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--team-primary)]">4. Conteúdo de Terceiros</h2>
            <p className="mb-4">
              O site pode conter links para sites de terceiros que não são de propriedade ou controlados pelo Kings League Simulador.
              Não temos controle e não assumimos responsabilidade pelo conteúdo, políticas de privacidade ou práticas de
              quaisquer sites de terceiros.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--team-primary)]">5. Publicidade</h2>
            <p className="mb-4">
              O Kings League Simulador pode exibir anúncios fornecidos por serviços de publicidade de terceiros.
              Esses anunciantes podem usar cookies e tecnologias semelhantes para coletar informações sobre suas visitas
              a este e outros sites para fornecer anúncios sobre produtos e serviços de seu interesse.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--team-primary)]">6. Direitos Autorais</h2>
            <p className="mb-4">
              O conteúdo original criado para o Kings League Simulador, incluindo texto, gráficos, logos,
              imagens e código de software é propriedade do desenvolvedor do site e está protegido por leis de direitos autorais.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--team-primary)]">7. Alterações aos Termos</h2>
            <p className="mb-4">
              Reservamos o direito de modificar ou substituir estes termos a qualquer momento. É sua responsabilidade
              verificar periodicamente se houve alterações. O uso contínuo do site após a publicação de quaisquer
              modificações constituirá sua aceitação das alterações.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--team-primary)]">8. Contato</h2>
            <p className="mb-4">
              Se você tiver alguma dúvida sobre estes Termos de Uso, por favor entre em contato através da seção de contato do site.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Button asChild className="bg-[var(--team-primary)] text-black hover:bg-[var(--team-primary)]/90 font-semibold">
            <Link href="/">
              Voltar para a página inicial
            </Link>
          </Button>
        </div>
      </div>

      <Footer />
    </main>
  )
}