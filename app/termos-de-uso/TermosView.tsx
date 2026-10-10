"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import KingsLeagueLogo from '@/components/kings-league-logo'
import {
  ArrowLeft,
  HeartHandshake,
  Scale,
  Cpu,
  Github,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'

export function TermosView() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-[#040405] text-white flex flex-col selection:bg-[var(--team-primary)] selection:text-black relative">
      {/* Iluminação Ambiente Dinâmica Padrão Oficial */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[140px] opacity-15"
          style={{
            background:
              "radial-gradient(circle, var(--team-primary, #F4AF23) 0%, rgba(244, 175, 35, 0.05) 50%, transparent 80%)",
          }}
        />
      </div>

      <Header
        loading={false}
        selectedTeam={selectedTeam}
        onTeamSelect={(id) => setSelectedTeam(id)}
        setActiveTab={() => {}}
      />

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl flex-1 flex flex-col relative z-10">
        {/* Header da Página - Padrão Oficial Tier List */}
        <div className="mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill mb-2">
            <KingsLeagueLogo width={14} height={18} className="drop-shadow-[0_0_6px_rgba(244,175,35,0.4)]" />
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-white">
              Projeto Comunitário • Não-Oficial
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Termos de Uso & <span className="text-[var(--team-primary,#F4AF23)]">Isenção Legal</span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Transparência absoluta sobre os objetivos, marcas e o caráter 100% gratuito e independente do simulador.
          </p>
        </div>

        {/* Barra de Controles & Navegação (Padrão TierControls) */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#09090d] p-2.5 sm:p-3 mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Link
              href="/"
              className="h-8 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/20 text-white text-xs font-semibold btn-press inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[var(--team-primary,#F4AF23)]" />
              <span>Voltar ao Simulador</span>
            </Link>
          </div>

          {/* Switcher entre Termos e Privacidade */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
            <span className="h-7 px-3 rounded-lg text-xs font-semibold inline-flex items-center bg-white/[0.1] text-white shadow-sm">
              Termos de Uso
            </span>
            <Link
              href="/politica-de-privacidade"
              className="h-7 px-3 rounded-lg text-xs font-semibold inline-flex items-center text-zinc-400 hover:text-white transition-colors btn-press"
            >
              Privacidade
            </Link>
          </div>
        </div>

        {/* Bento Grid: 3 Pilares Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-[#09090d] border border-white/[0.08]">
            <div
              className="pointer-events-none absolute inset-x-6 top-0 h-[1.5px] opacity-70"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--team-primary, #F4AF23) 50%, transparent)'
              }}
            />
            <div className="w-8 h-8 rounded-xl bg-[var(--team-primary,#F4AF23)]/10 border border-[var(--team-primary,#F4AF23)]/20 flex items-center justify-center text-[var(--team-primary,#F4AF23)] mb-3">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white mb-1">100% Comunitário</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Desenvolvido de fã para fãs da Kings League Brasil. Sem fins lucrativos, sem cobranças e de acesso livre.
            </p>
          </div>

          <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-[#09090d] border border-white/[0.08]">
            <div
              className="pointer-events-none absolute inset-x-6 top-0 h-[1.5px] opacity-70"
              style={{
                background: 'linear-gradient(90deg, transparent, #3b82f6 50%, transparent)'
              }}
            />
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Scale className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white mb-1">Fair Use Informativo</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Marcas, escudos e nomes pertencem a seus legítimos titulares (Kings Competition S.L. e organizadores).
            </p>
          </div>

          <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-[#09090d] border border-white/[0.08]">
            <div
              className="pointer-events-none absolute inset-x-6 top-0 h-[1.5px] opacity-70"
              style={{
                background: 'linear-gradient(90deg, transparent, #10b981 50%, transparent)'
              }}
            />
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <Cpu className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white mb-1">Simulações Lúdicas</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Cálculos probabilísticos para entretenimento esportivo. Sem relação com casas de apostas.
            </p>
          </div>
        </div>

        {/* Artigos e Diretrizes Detalhadas */}
        <div className="space-y-3 sm:space-y-4 mb-6">
          {/* Seção 1 */}
          <article className="p-5 sm:p-6 rounded-2xl bg-[#09090d] border border-white/[0.08]">
            <div className="flex items-start gap-3.5">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-[var(--team-primary,#F4AF23)]">
                01
              </span>
              <div className="space-y-2.5 flex-1">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Natureza do Projeto e Propósito Recreativo
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  O <strong className="text-white">Kings League Simulador</strong> é uma aplicação web interativa
                  desenvolvida de forma voluntária e independente por torcedores e entusiastas do formato inovador da
                  Kings League. Nosso objetivo é oferecer uma ferramenta recreativa onde os fãs podem testar
                  combinações de resultados, explorar estatísticas, simular chaveamentos e jogar desafios temáticos
                  (como o Modo 12 a 0).
                </p>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-zinc-400">
                    O acesso a todas as ferramentas é e sempre será gratuito para toda a comunidade.
                  </span>
                </div>
              </div>
            </div>
          </article>

          {/* Seção 2 */}
          <article className="p-5 sm:p-6 rounded-2xl bg-[#09090d] border border-white/[0.08]">
            <div className="flex items-start gap-3.5">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-[var(--team-primary,#F4AF23)]">
                02
              </span>
              <div className="space-y-2.5 flex-1">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Propriedade Intelectual & Isenção de Afiliação (Fair Use)
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  O nome <strong className="text-white">"Kings League"</strong>, bem como os escudos oficiais dos times,
                  marcas de patrocinadores da liga, nomes dos torneios e retratos dos presidentes e atletas, são de
                  propriedade exclusiva da <strong className="text-white">Kings Competition S.L.</strong>, da{" "}
                  <strong className="text-white">Kosmos Global Holding S.L.</strong> e de suas respectivas agremiações
                  e detentores legais.
                </p>
                <div className="p-3.5 rounded-xl bg-[var(--team-primary,#F4AF23)]/[0.04] border border-[var(--team-primary,#F4AF23)]/20 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-[var(--team-primary,#F4AF23)] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    <strong className="text-[var(--team-primary,#F4AF23)]">Aviso Legal Expresso:</strong> Este projeto não possui qualquer
                    relação societária, patrocínio, contrato de representação, chancela ou afiliação oficial com a
                    Kings League ou seus organizadores. Todos os elementos visuais são utilizados sob o princípio de{" "}
                    <em>Fair Use</em> (uso justo/legítimo), estritamente para identificação esportiva, análise
                    estatística e comentário comunitário sem fins concorrenciais ou comerciais.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Seção 3 */}
          <article className="p-5 sm:p-6 rounded-2xl bg-[#09090d] border border-white/[0.08]">
            <div className="flex items-start gap-3.5">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-[var(--team-primary,#F4AF23)]">
                03
              </span>
              <div className="space-y-2.5 flex-1">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Algoritmos Esportivos e Isenção de Apostas
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Todas as projeções de pontuação, probabilidades de classificação, critérios de desempate e sorteios
                  da roleta do simulador são gerados por algoritmos matemáticos e heurísticas esportivas independentes.
                </p>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Os resultados simulados são puramente hipotéticos e ilustrativos. Eles{" "}
                  <strong className="text-zinc-200">não representam conselhos de investimento</strong>, previsões
                  infalíveis ou incentivo a apostas financeiras esportivas. O futebol da Kings League é imprevisível
                  por natureza (Cartas Secretas, Pênalti Presidente, Dado do Minuto 18), e o simulador existe para
                  celebrar essa emoção.
                </p>
              </div>
            </div>
          </article>

          {/* Seção 4 */}
          <article className="p-5 sm:p-6 rounded-2xl bg-[#09090d] border border-white/[0.08]">
            <div className="flex items-start gap-3.5">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-[var(--team-primary,#F4AF23)]">
                04
              </span>
              <div className="space-y-2.5 flex-1">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Ausência de Publicidade Predatória ou Cobranças
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Diferente de portais que vendem assinaturas ou poluem a tela com banners invasivos de casas de apostas
                  e pop-ups, o Kings League Simulador mantém uma experiência limpa, leve e focada na usabilidade
                  da comunidade. Não comercializamos dados de visitantes e não impomos paywalls para liberar tabelas
                  ou simulações.
                </p>
              </div>
            </div>
          </article>

          {/* Seção 5 */}
          <article className="p-5 sm:p-6 rounded-2xl bg-[#09090d] border border-white/[0.08]">
            <div className="flex items-start gap-3.5">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-[var(--team-primary,#F4AF23)]">
                05
              </span>
              <div className="space-y-2.5 flex-1">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Código Aberto & Transparência Técnica
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  O projeto é construído em código aberto. A comunidade é ativamente encorajada a revisar, sugerir
                  melhorias, reportar eventuais divergências de regras ou contribuir diretamente com novas ideias de
                  jogabilidade e simulação através do nosso repositório oficial no GitHub.
                </p>
                <div className="pt-1.5">
                  <a
                    href="https://github.com/ialexanderbrito/kings-league-simulator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/20 text-xs font-semibold text-white btn-press"
                  >
                    <Github className="w-4 h-4" />
                    <span>Ver Repositório no GitHub</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Card Inferior Contextual de Redirecionamento */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#09090d] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--team-primary,#F4AF23)]/10 border border-[var(--team-primary,#F4AF23)]/20 flex items-center justify-center text-[var(--team-primary,#F4AF23)] flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">Quer saber como cuidamos da sua privacidade?</p>
              <p className="text-[11px] sm:text-xs text-zinc-400">Armazenamento local no navegador, zero login e zero coleta de dados sensíveis.</p>
            </div>
          </div>

          <Link
            href="/politica-de-privacidade"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/20 text-xs font-semibold text-white btn-press"
          >
            <span>Ver Política de Privacidade</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
