import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: 'Termos de Uso | Kings League Simulador',
  description: 'Termos de uso e condições para utilização do Kings League Simulador, um projeto não-oficial criado por fãs.',
}

export default function TermosDeUso() {
  return (
    <main className="bg-[#121212] min-h-screen text-white">

      <div className="container mx-auto px-4 max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Termos de Uso</h1>

        <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg">
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
          <Button asChild variant="default" className="bg-[var(--team-primary)] hover:bg-[var(--team-primary)]/80">
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