"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"
import { Globe, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export const LEAGUES = [
  { id: "espanha", name: "Espanha", flag: "ES" },
  { id: "italia", name: "Itália", flag: "IT" },
  { id: "mexico", name: "México", flag: "MX" },
  { id: "alemanha", name: "Alemanha", flag: "DE" },
  { id: "franca", name: "França (Ainda não iniciada)", flag: "FR" },
  { id: "mena", name: "MENA (Ainda não iniciada)", flag: "MENA" },
  { id: "todas", name: "Todas as ligas", flag: "ALL" },
  { id: "apenas-brasil", name: "Apenas Brasil", flag: "BR" },
]

function CountryFlag({ code }: { code: string }) {
  if (code === "MENA" || code === "ALL") {
    return (
      <div className="w-6 h-4 rounded-[3px] bg-emerald-800 flex items-center justify-center flex-shrink-0">
        <Globe className="w-3 h-3 text-emerald-300" />
      </div>
    )
  }
  return (
    <img
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      alt={code}
      className="w-6 h-4 rounded-[3px] object-cover flex-shrink-0"
      loading="lazy"
    />
  )
}

const MODAL_SHOWN_KEY = "@kl-simulator:leagues-poll-v2-shown"
const VOTE_SUBMITTED_KEY = "@kl-simulator:leagues-poll-v2-submitted"

export function LeaguesSuggestionModal() {
  const [open, setOpen] = useState(false)
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const isRelevantRoute = pathname === "/simulator" || pathname === "/tier-list"
    const modalPreviouslyShown = localStorage.getItem(MODAL_SHOWN_KEY) === "true"
    const alreadyVoted = localStorage.getItem(VOTE_SUBMITTED_KEY) === "true"

    const now = new Date()
    const start = new Date('2026-03-09T00:00:00-03:00')
    const end = new Date('2026-03-30T23:59:59-03:00')
    const isSurveyActive = now >= start && now <= end

    if (isRelevantRoute && !modalPreviouslyShown && !alreadyVoted && isSurveyActive) {
      const timer = setTimeout(() => {
        setOpen(true)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [pathname])

  const handleSubmit = async () => {
    if (!selectedLeague) {
      setOpen(false)
      localStorage.setItem(MODAL_SHOWN_KEY, "true")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        leagues: selectedLeague
      };

      const response = await fetch('/api/league-suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar sugestão');
      }

      localStorage.setItem(VOTE_SUBMITTED_KEY, "true");
      localStorage.setItem(MODAL_SHOWN_KEY, "true");

      await new Promise(resolve => setTimeout(resolve, 500));

      setOpen(false);

      toast({
        title: "Obrigado pelo seu voto!",
        description: "Sua preferência por " + LEAGUES.find(l => l.id === selectedLeague)?.name + " foi registrada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar voto",
        description: "Não foi possível registrar sua preferência. Tente novamente mais tarde.",
        variant: "destructive",
      });
      setOpen(false);
      localStorage.setItem(MODAL_SHOWN_KEY, "true");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[400px] max-h-[90dvh] overflow-y-auto bg-[#0a0a0a] border-white/10 text-white p-0">
        {/* Header compacto */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <div className="p-2 rounded-lg bg-[var(--team-primary)]/10">
            <Globe className="w-5 h-5 text-[var(--team-primary)]" />
          </div>
          <DialogHeader className="space-y-0.5 text-left flex-1">
            <DialogTitle className="text-base font-bold text-white">
              Simulador de outras ligas?
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Queremos saber sua opinião!
            </DialogDescription>
          </DialogHeader>
        </div>

        <p className="text-[13px] text-gray-400 leading-relaxed px-5">
          Você gostaria que tivéssemos suporte para outras ligas ou prefere que foquemos apenas no Brasil?
        </p>

        {/* Opções */}
        <div className="px-5 py-3">
          <RadioGroup value={selectedLeague || ''} onValueChange={setSelectedLeague} className="space-y-1.5">
            {LEAGUES.map(league => (
              <label
                key={league.id}
                htmlFor={league.id}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all duration-150",
                  selectedLeague === league.id
                    ? "border-[var(--team-primary)]/40 bg-[var(--team-primary)]/10"
                    : "border-white/5 hover:border-white/10 hover:bg-white/[0.03]"
                )}
              >
                <RadioGroupItem
                  id={league.id}
                  value={league.id}
                  className="border-white/20 text-[var(--team-primary)] data-[state=checked]:border-[var(--team-primary)] flex-shrink-0"
                />
                <CountryFlag code={league.flag} />
                <span className="text-sm text-gray-200">
                  {league.name}
                </span>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Botões */}
        <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setOpen(false)
              localStorage.setItem(MODAL_SHOWN_KEY, "true")
            }}
            className="text-gray-500 hover:text-white hover:bg-white/5 text-xs"
          >
            Pular
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedLeague}
            className="bg-[var(--team-primary)] text-black hover:bg-[var(--team-primary)]/90 font-semibold gap-1.5 text-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar voto"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}