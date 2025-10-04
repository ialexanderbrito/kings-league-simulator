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

export const LEAGUES = [
  { id: "espanha", name: "Espanha" },
  { id: "americas", name: "Americas" },
  { id: "italia", name: "Itália" },
  { id: "franca", name: "França" },
  { id: "alemanha", name: "Alemanha" },
  { id: "nenhum", name: "Nenhum, apenas o Brasil" },
]

const MODAL_SHOWN_KEY = "@kl-simulator:leagues-suggestion-modal-shown"
const VOTE_SUBMITTED_KEY = "@kl-simulator:league-suggestion-submitted"

// Datas da pesquisa
const SURVEY_START_DATE = new Date('2025-05-04T00:00:00')
const SURVEY_END_DATE = new Date('2025-06-04T23:59:59')

export function LeaguesSuggestionModal() {
  const [open, setOpen] = useState(false)
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const isRelevantRoute = pathname === "/simulator" || pathname === "/playoffs"
    const modalPreviouslyShown = localStorage.getItem(MODAL_SHOWN_KEY) === "true"
    const alreadyVoted = localStorage.getItem(VOTE_SUBMITTED_KEY) === "true"

    const currentDate = new Date()
    const isSurveyActive = currentDate >= SURVEY_START_DATE && currentDate <= SURVEY_END_DATE

    if (isRelevantRoute && !modalPreviouslyShown && !alreadyVoted && isSurveyActive) {
      const timer = setTimeout(() => {
        setOpen(true)
      }, 1000)

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

      // Salva que o voto foi submetido antes de qualquer outra operação
      localStorage.setItem(VOTE_SUBMITTED_KEY, "true");
      localStorage.setItem(MODAL_SHOWN_KEY, "true");

      // Pequeno delay antes de fechar o modal
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fecha o modal antes de mostrar o toast
      setOpen(false);

      toast({
        title: "Obrigado pela sua sugestão!",
        description: "Sua preferência por " + LEAGUES.find(l => l.id === selectedLeague)?.name + " foi registrada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar sugestão",
        description: "Não foi possível registrar sua preferência. Tente novamente mais tarde.",
        variant: "destructive",
      });
      // Fecha o modal mesmo em caso de erro
      setOpen(false);
      localStorage.setItem(MODAL_SHOWN_KEY, "true");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] bg-[#0a0a0a] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-[var(--team-primary)]">Sugestão de nova liga</DialogTitle>
          <DialogDescription className="text-gray-300">
            Gostaríamos de saber qual outra liga você gostaria de ver no nosso simulador.
            Selecione uma liga de sua preferência:
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={selectedLeague || ''} onValueChange={setSelectedLeague} className="space-y-4">
            {LEAGUES.map(league => (
              <div key={league.id} className="flex items-center space-x-3">
                <RadioGroupItem
                  id={league.id}
                  value={league.id}
                  className="border-[#333] text-[var(--team-primary)] focus:ring-[var(--team-primary)]"
                />
                <label
                  htmlFor={league.id}
                  className="text-sm font-medium text-gray-200 leading-none cursor-pointer hover:text-white"
                >
                  {league.name}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedLeague}
            className="bg-[var(--team-primary)] text-black hover:bg-[var(--team-primary)]/90"
          >
            {isSubmitting ? "Enviando..." : "Enviar sugestão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}