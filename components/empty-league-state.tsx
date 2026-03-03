import { AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyLeagueStateProps {
  title?: string
  description?: string
  showTimestamp?: boolean
  variant?: "default" | "compact"
}

export function EmptyLeagueState({
  title = "Dados indisponíveis",
  description,
  showTimestamp = true,
  variant = "default",
}: EmptyLeagueStateProps) {
  const defaultDescription = (
    <>
      Os dados da liga ainda não estão disponíveis para este período.
      <br />
      <span className="block mt-3 text-gray-400 text-sm">
        Este simulador depende de dados fornecidos por fontes externas. Quando houver atualização de dados, o conteúdo será automaticamente sincronizado aqui.
      </span>
    </>
  )

  if (variant === "compact") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-[var(--team-primary]/10 border border-[var(--team-primary]/30 p-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-[var(--team-primary,#F4AF23)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--team-primary,#F4AF23)] mb-2">{title}</h2>
          <p className="text-sm text-gray-300 max-w-sm">
            {description || defaultDescription}
          </p>
          {showTimestamp && (
            <p className="text-xs text-gray-500 mt-4">
              Última verificação: {new Date().toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Card className="w-full max-w-lg bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10">
        <CardContent className="pt-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center justify-center rounded-full bg-[var(--team-primary]/10 border border-[var(--team-primary]/30 p-4">
              <AlertTriangle className="h-8 w-8 text-[var(--team-primary,#F4AF23)]" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-[var(--team-primary,#F4AF23)] text-center mb-4 tracking-tight">
            {title}
          </h2>

          {/* Description */}
          <p className="text-base text-gray-300 text-center mb-6 leading-relaxed">
            {description || defaultDescription}
          </p>

          {/* CTA Badge */}
          <div className="flex flex-col items-center gap-3">
            <span className="inline-block px-4 py-2 rounded-full bg-[var(--team-primary]/10 border border-[var(--team-primary]/20 text-[var(--team-primary,#F4AF23)] text-sm font-medium tracking-wide">
              Verifique novamente em breve
            </span>

            {showTimestamp && (
              <span className="text-xs text-gray-500">
                Última verificação: {new Date().toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

