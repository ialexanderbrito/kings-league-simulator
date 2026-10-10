"use client"

import Link from "next/link"
import { ArrowUpRight, Github } from "lucide-react"
import KingsLeagueLogo from "@/components/kings-league-logo"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-20 pb-10 sm:pb-12 pt-6 w-full overflow-hidden select-none">
      {/* Linha de reflexo especular superior */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
        aria-hidden="true"
      />

      {/* Iluminação ambiente dourada sutil de fundo */}
      <div
        className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[160px] rounded-full blur-[100px] opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, var(--team-primary, #F4AF23) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Dock Liquid Glass Unificado */}
        <div className="liquid-glass rounded-3xl p-5 sm:p-6 md:px-8 md:py-6 border border-white/[0.08] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.14)] flex flex-col gap-5 sm:gap-6">
          {/* Top Bar: Identidade, Status e Ações */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
            {/* Brand + Status Live Badge */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="group inline-flex items-center gap-2.5 transition-[transform,opacity] duration-150 ease-out active:scale-[0.97]"
                aria-label="Ir para a página inicial"
              >
                <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center p-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] group-hover:border-[var(--team-primary,#F4AF23)]/40 transition-colors duration-150">
                  <KingsLeagueLogo size={18} className="drop-shadow-[0_0_6px_rgba(244,175,35,0.4)]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs sm:text-sm font-black text-white tracking-tight leading-none group-hover:text-[var(--team-primary,#F4AF23)] transition-colors duration-150">
                    Kings League <span className="text-[var(--team-primary,#F4AF23)]">Simulador</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase mt-0.5">
                    Brasil • Split 2026
                  </span>
                </div>
              </Link>

              {/* Live Pill Status */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="leading-none text-[10px] sm:text-[11px]">API Online</span>
              </div>
            </div>

            {/* Links Essenciais Minimalistas */}
            <nav aria-label="Navegação do rodapé" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-400">
              <Link
                href="/standings"
                prefetch={true}
                className="transition-[color,transform] duration-150 ease-out hover:text-white active:scale-[0.96]"
              >
                Classificação
              </Link>
              <Link
                href="/simulator"
                prefetch={true}
                className="transition-[color,transform] duration-150 ease-out hover:text-white active:scale-[0.96]"
              >
                Simulador
              </Link>
              <Link
                href="/teams"
                prefetch={true}
                className="transition-[color,transform] duration-150 ease-out hover:text-white active:scale-[0.96]"
              >
                Times
              </Link>
              <Link
                href="/termos-de-uso"
                prefetch={true}
                className="transition-[color,transform] duration-150 ease-out hover:text-white active:scale-[0.96]"
              >
                Termos
              </Link>
              <Link
                href="/politica-de-privacidade"
                prefetch={true}
                className="transition-[color,transform] duration-150 ease-out hover:text-white active:scale-[0.96]"
              >
                Privacidade
              </Link>
            </nav>

            {/* Socials & Assinatura do Criador */}
            <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end pt-2 md:pt-0 border-t border-white/[0.04] md:border-t-0">
              <div className="flex items-center gap-1.5">
                <a
                  href="https://github.com/ialexanderbrito/kings-league-simulator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.14] text-zinc-400 hover:text-white flex items-center justify-center transition-[transform,color,background-color,border-color] duration-150 ease-out active:scale-[0.95]"
                  aria-label="Código no GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://x.com/ialexanderbrito"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.14] text-zinc-400 hover:text-white flex items-center justify-center transition-[transform,color,background-color,border-color] duration-150 ease-out active:scale-[0.95]"
                  aria-label="Perfil no X / Twitter"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>

              {/* Pill do Autor com Micro-Interação */}
              <a
                href="https://ialexanderbrito.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] text-[11px] font-medium text-zinc-300 hover:text-white transition-[transform,color,background-color,border-color] duration-150 ease-out active:scale-[0.96]"
              >
                <span>por</span>
                <span className="font-semibold text-white group-hover:text-[var(--team-primary,#F4AF23)] transition-colors duration-150">
                  ialexanderbrito
                </span>
                <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150 ease-out" />
              </a>
            </div>
          </div>

          {/* Bottom Bar: Disclaimer Legal Minimalista em Linha Única */}
          <div className="pt-3 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500 leading-relaxed text-center sm:text-left">
            <p>
              © {currentYear} Kings League Simulador. Projeto independente de fãs, sem vínculo oficial com a Kings League ou Kosmos.
            </p>
            <p className="text-zinc-600 sm:text-zinc-500 text-[10px] sm:text-[11px] shrink-0">
              Marcas registradas pertencem aos seus titulares.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}