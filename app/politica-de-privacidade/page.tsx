import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: 'Política de Privacidade | Kings League Simulador',
  description: 'Política de privacidade e uso de dados do Kings League Simulador, um projeto não-oficial criado por fãs.',
}

export default function PoliticaDePrivacidade() {
  return (
    <main className="bg-[#121212] min-h-screen text-white">
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Política de Privacidade</h1>

        <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--team-primary)]">1. Introdução</h2>
            <p className="mb-4">
              Esta Política de Privacidade descreve como o Kings League Simulador coleta, usa e compartilha informações
              quando você utiliza nosso site. Respeitamos sua privacidade e estamos comprometidos em proteger seus dados pessoais.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--team-primary)]">2. Informações que Coletamos</h2>
            <p className="mb-4">
              <strong>Informações de Uso:</strong> Coletamos informações sobre como você interage com nosso site,
              incluindo as páginas que você visita, o tempo gasto no site e suas preferências de uso.
            </p>
            <p className="mb-4">
              <strong>Cookies e Tecnologias Similares:</strong> Utilizamos cookies e tecnologias semelhantes para
              melhorar sua experiência, entender como o site é utilizado e personalizar conteúdo.
            </p>
            <p className="mb-4">
              <strong>Armazenamento Local:</strong> Armazenamos algumas informações localmente em seu dispositivo
              para melhorar o desempenho e lembrar suas preferências (como times favoritos e configurações do simulador).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--team-primary)]">3. Como Usamos as Informações</h2>
            <p className="mb-4">
              Utilizamos as informações coletadas para:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Fornecer, manter e melhorar o funcionamento do site</li>
              <li>Personalizar sua experiência com base nas suas preferências</li>
              <li>Analisar como os usuários interagem com o site para melhorias futuras</li>
              <li>Detectar e prevenir problemas técnicos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--team-primary)]">4. Publicidade</h2>
            <p className="mb-4">
              Nosso site pode exibir anúncios fornecidos pelo Google AdSense e outros parceiros de publicidade.
              Esses serviços podem coletar e utilizar informações (não incluindo seu nome, endereço, email ou
              número de telefone) sobre suas visitas a este e outros sites para fornecer anúncios sobre produtos
              e serviços que possam ser de seu interesse.
            </p>
            <p className="mb-4">
              O Google AdSense utiliza cookies para exibir anúncios com base em suas visitas anteriores a nosso site
              e outros sites. Você pode optar por desativar o uso de cookies para publicidade personalizada visitando as
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline"> configurações de anúncios do Google</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--team-primary)]">5. Compartilhamento de Informações</h2>
            <p className="mb-4">
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto nas seguintes circunstâncias:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Com provedores de serviços que nos ajudam a operar o site (como serviços de análise e publicidade)</li>
              <li>Para cumprir obrigações legais</li>
              <li>Para proteger os direitos, propriedade ou segurança do Kings League Simulador e seus usuários</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--team-primary)]">6. Análise de Dados</h2>
            <p className="mb-4">
              Utilizamos o Google Analytics para analisar o uso do nosso site. O Google Analytics coleta informações sobre
              o uso do site através de cookies. As informações coletadas (incluindo seu endereço IP) são transmitidas e
              armazenadas pelo Google em seus servidores. O Google utiliza essas informações para avaliar seu uso do site,
              compilar relatórios sobre a atividade do site e fornecer outros serviços relacionados à atividade do site e uso da internet.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--team-primary)]">7. Seus Direitos</h2>
            <p className="mb-4">
              Você tem o direito de:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Solicitar acesso aos seus dados pessoais</li>
              <li>Solicitar a correção de dados imprecisos</li>
              <li>Solicitar a exclusão de seus dados (quando aplicável)</li>
              <li>Opor-se ao processamento de seus dados</li>
              <li>Solicitar a restrição do processamento de seus dados</li>
              <li>Retirar o consentimento a qualquer momento</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--team-primary)]">8. Alterações nesta Política</h2>
            <p className="mb-4">
              Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos você sobre quaisquer
              alterações publicando a nova Política de Privacidade nesta página e, se as alterações forem significativas,
              forneceremos um aviso mais proeminente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[var(--team-primary)]">9. Contato</h2>
            <p className="mb-4">
              Se você tiver dúvidas ou preocupações sobre esta Política de Privacidade, entre em contato conosco
              através da seção de contato do site.
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