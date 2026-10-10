import { Sparkles, CalendarClock } from "lucide-react"

interface EmptyLeagueStateProps {
  title?: string
  description?: string
  showTimestamp?: boolean
  variant?: "default" | "compact"
}

export function EmptyLeagueState({
  title = "Dados em sincronização",
  description,
  showTimestamp = true,
  variant = "default",
}: EmptyLeagueStateProps) {
  const defaultDescription =
    "Os dados da Kings League estão sendo preparados para esta rodada. Assim que as fontes oficiais publicarem as informações, o simulador será atualizado automaticamente."

  if (variant === "compact") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh] px-4 text-center">
        <div className="liquid-glass-pill inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--team-primary,#F4AF23)] border border-[var(--team-primary)]/20">
          <Sparkles className="w-3.5 h-3.5 text-[var(--team-primary,#F4AF23)]" />
          <span>Sincronizando</span>
        </div>
        <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
        <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
          {description || defaultDescription}
        </p>
        {showTimestamp && (
          <p className="text-[10px] text-zinc-500 mt-3 font-mono">
            Última checagem: {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="liquid-glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 text-center border border-white/[0.08] shadow-[0_24px_50px_-15px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-200">
        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill mb-5 text-[11px] font-semibold uppercase tracking-wider text-[var(--team-primary,#F4AF23)] border border-[var(--team-primary)]/20">
          <Sparkles className="w-3 h-3 text-[var(--team-primary,#F4AF23)]" />
          <span>Aguardando Dados Oficiais</span>
        </div>

        {/* Minimal Liquid Icon */}
        <div className="w-13 h-13 mx-auto mb-4 rounded-2xl liquid-glass flex items-center justify-center border border-white/10 shadow-lg">
          <CalendarClock className="w-6 h-6 text-[var(--team-primary,#F4AF23)]" aria-hidden="true" />
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-2">
          {title}
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto mb-5">
          {description || defaultDescription}
        </p>

        {/* Footer info pill */}
        {showTimestamp && (
          <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-zinc-500 font-mono">
            <span>Sincronização em tempo real ativa</span>
          </div>
        )}
      </div>
    </div>
  )
}
