"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import KingsLeagueLogo from '@/components/kings-league-logo'
import {
  ArrowLeft,
  ShieldCheck,
  HardDrive,
  EyeOff,
  Cookie,
  Github,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Lock,
  Globe2
} from 'lucide-react'

export function PrivacidadeView() {
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
              Privacidade por Princípio • Zero Coleta
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Política de Privacidade & <span className="text-[var(--team-primary,#F4AF23)]">Dados</span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Sem cadastros, sem senhas e sem venda de informações. Suas simulações e preferências ficam guardadas no seu próprio navegador.
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
            <Link
              href="/termos-de-uso"
              className="h-7 px-3 rounded-lg text-xs font-semibold inline-flex items-center text-zinc-400 hover:text-white transition-colors btn-press"
            >
              Termos de Uso
            </Link>
            <span className="h-7 px-3 rounded-lg text-xs font-semibold inline-flex items-center bg-white/[0.1] text-white shadow-sm">
              Privacidade
            </span>
          </div>
        </div>

        {/* Bento Grid: 3 Pilares de Privacidade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-[#09090d] border border-white/[0.08]">
            <div
              className="pointer-events-none absolute inset-x-6 top-0 h-[1.5px] opacity-70"
              style={{
                background: 'linear-gradient(90deg, transparent, #10b981 50%, transparent)'
              }}
            />
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <EyeOff className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white mb-1">Sem Contas ou Senhas</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Você navega e simula sem fornecer e-mail, telefone, CPF ou qualquer dado pessoal sensível.
            </p>
          </div>

          <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-[#09090d] border border-white/[0.08]">
            <div
              className="pointer-events-none absolute inset-x-6 top-0 h-[1.5px] opacity-70"
              style={{
                background: 'linear-gradient(90deg, transparent, #06b6d4 50%, transparent)'
              }}
            />
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
              <HardDrive className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white mb-1">Armazenamento Local</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Chaveamentos e progresso do 12 a 0 são salvos no seu próprio navegador via <code className="text-zinc-300">localStorage</code>.
            </p>
          </div>

          <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-[#09090d] border border-white/[0.08]">
            <div
              className="pointer-events-none absolute inset-x-6 top-0 h-[1.5px] opacity-70"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--team-primary, #F4AF23) 50%, transparent)'
              }}
            />
            <div className="w-8 h-8 rounded-xl bg-[var(--team-primary,#F4AF23)]/10 border border-[var(--team-primary,#F4AF23)]/20 flex items-center justify-center text-[var(--team-primary,#F4AF23)] mb-3">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white mb-1">Zero Venda de Dados</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Não comercializamos dados com corretores ou redes de anúncios invasivos (como Google AdSense).
            </p>
          </div>
        </div>

        {/* Diretrizes Detalhadas */}
        <div className="space-y-3 sm:space-y-4 mb-6">
          {/* Seção 1 */}
          <article className="p-5 sm:p-6 rounded-2xl bg-[#09090d] border border-white/[0.08]">
            <div className="flex items-start gap-3.5">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-emerald-400">
                01
              </span>
              <div className="space-y-2.5 flex-1">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Nossa Filosofia: Minimização e Respeito aos Fãs
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Acreditamos firmemente que a melhor e mais segura política de privacidade é{" "}
                  <strong className="text-white">não coletar dados desnecessários</strong>. Como o Kings League
                  Simulador é uma ferramenta interativa e recreativa, não há necessidade de forçar a criação de perfis
                  ou coletar dados pessoais para que você aproveite o app.
                </p>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-zinc-400">
                    O simulador funciona imediatamente ao abrir a página, sem telas de cadastro ou pedidos de permissão abusivos.
                  </span>
                </div>
              </div>
            </div>
          </article>

          {/* Seção 2 */}
          <article className="p-5 sm:p-6 rounded-2xl bg-[#09090d] border border-white/[0.08]">
            <div className="flex items-start gap-3.5">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-emerald-400">
                02
              </span>
              <div className="space-y-2.5 flex-1">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Como Funciona o Armazenamento Local no seu Navegador
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Para que você não perca suas rodadas simuladas, escalações do Modo 12 a 0 ou o time selecionado no
                  cabeçalho ao fechar o navegador, utilizamos a tecnologia de{" "}
                  <strong className="text-white">localStorage</strong> do seu próprio dispositivo:
                </p>
                <ul className="space-y-1.5 text-xs text-zinc-300 pl-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span><strong className="text-white">Cenários e Chaveamentos:</strong> Os placares que você simula na tabela e no mata-mata.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span><strong className="text-white">Campanhas do Modo 12 a 0:</strong> O time sorteado, a rodada atual e o histórico de vitórias da sua run.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span><strong className="text-white">Preferência de Time:</strong> O tema e cores do time ativo que você escolheu no topo.</span>
                  </li>
                </ul>
                <p className="text-xs text-zinc-400 pt-1 leading-relaxed">
                  Essas informações residem única e exclusivamente no disco do seu próprio navegador. Elas não são
                  enviadas nem salvas em servidores remotos. Se você limpar os dados de navegação ou usar o modo anônimo,
                  essas informações são apagadas no seu dispositivo.
                </p>
              </div>
            </div>
          </article>

          {/* Seção 3 */}
          <article className="p-5 sm:p-6 rounded-2xl bg-[#09090d] border border-white/[0.08]">
            <div className="flex items-start gap-3.5">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-emerald-400">
                03
              </span>
              <div className="space-y-2.5 flex-1">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Dados de Partidas e APIs Públicas
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  As estatísticas, calendários de jogos oficiais, elencos dos 10 times e posições na tabela são
                  consumidos a partir de fontes e APIs públicas da Kings League.
                </p>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Essas consultas são cacheadas em servidores de borda (Edge Cache / Vercel) com validação de ETag para
                  garantir respostas rápidas e menor consumo de banda. Em momento algum essas consultas esportivas são
                  vinculadas a identificadores pessoais seus.
                </p>
              </div>
            </div>
          </article>

          {/* Seção 4 */}
          <article className="p-5 sm:p-6 rounded-2xl bg-[#09090d] border border-white/[0.08]">
            <div className="flex items-start gap-3.5">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-emerald-400">
                04
              </span>
              <div className="space-y-2.5 flex-1">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Zero Cookies: Arquitetura 100% Cookieless
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  <strong className="text-white">Não utilizamos cookies no simulador.</strong> Não há cookies de
                  publicidade direcionada, rastreadores entre sites (cross-site tracking), pixels de terceiros ou
                  gerenciamento de sessão.
                </p>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Para fins técnicos de monitoramento de estabilidade da infraestrutura e contagem agregada de visitas,
                  nossas ferramentas analíticas operam em modo estritamente sem cookies (<code className="text-zinc-300">client_storage: 'none'</code> com IP anonimizado).
                  Toda e qualquer persistência é feita exclusivamente no <code className="text-zinc-300">localStorage</code> do seu navegador.
                </p>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-zinc-400">
                    Por sermos 100% livres de cookies invasivos, dispensamos completamente banners de consentimento ou pop-ups bloqueando sua tela.
                  </span>
                </div>
              </div>
            </div>
          </article>

          {/* Seção 5 */}
          <article className="p-5 sm:p-6 rounded-2xl bg-[#09090d] border border-white/[0.08]">
            <div className="flex items-start gap-3.5">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-emerald-400">
                05
              </span>
              <div className="space-y-2.5 flex-1">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Seus Direitos e Autonomia (LGPD)
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Em total consonância com os preceitos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018):
                </p>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Como não mantemos registros de conta ou banco de dados relacional com dados pessoais identificáveis,
                  você tem o poder soberano sobre qualquer dado da aplicação: para resetar todas as suas simulações e
                  escolhas, basta clicar em "Limpar Dados de Navegação" no seu navegador ou utilizar uma janela privada.
                </p>
              </div>
            </div>
          </article>

          {/* Seção 6 */}
          <article className="p-5 sm:p-6 rounded-2xl bg-[#09090d] border border-white/[0.08]">
            <div className="flex items-start gap-3.5">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-emerald-400">
                06
              </span>
              <div className="space-y-2.5 flex-1">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Transparência de Código & Contato
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Toda a lógica da aplicação pode ser inspecionada diretamente pela comunidade em nosso repositório no
                  GitHub. Caso tenha dúvidas, sugestões ou deseje enviar um feedback sobre nossa governança comunitária,
                  fique à vontade para abrir uma issue ou entrar em contato.
                </p>
                <div className="pt-1.5">
                  <a
                    href="https://github.com/ialexanderbrito/kings-league-simulator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/20 text-xs font-semibold text-white btn-press"
                  >
                    <Github className="w-4 h-4" />
                    <span>Inspecionar Código no GitHub</span>
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
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">Quer consultar os termos de uso e isenção?</p>
              <p className="text-[11px] sm:text-xs text-zinc-400">Entenda o princípio de fair use e nosso propósito comunitário.</p>
            </div>
          </div>

          <Link
            href="/termos-de-uso"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/20 text-xs font-semibold text-white btn-press"
          >
            <span>Ver Termos de Uso</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
