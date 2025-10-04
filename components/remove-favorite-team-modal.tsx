import React from 'react';
import { Team } from '@/types/kings-league';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeartOff, AlertTriangle, Undo2 } from 'lucide-react';

interface RemoveFavoriteTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  team: Team;
}

export function RemoveFavoriteTeamModal({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  team,
}: RemoveFavoriteTeamModalProps) {
  // Frases engraçadas para quando o usuário remove o time favorito
  const funnyPhrases = [
    "Abandonando o barco? O capitão sempre é o último a sair! 🚢",
    "Vai mesmo abandonar o time na má fase? Que isso, guerreiro! 😰",
    "O diretor de marketing está chorando agora... 😭",
    "Torcedor de verdade não abandona o time! Ou será que abandona? 🤔",
    "Tá abandonando o barco na primeira derrota? Calma lá! ⛵",
    "Seu presidente vai ficar decepcionado... 😞",
    "As copas já estão garantidas e você quer sair? 🏆",
    "Desistindo na primeira dificuldade? Eita! 😅",
    "Quem ama não desiste na primeira disputa de pênaltis! ⚽💔",
    "Torcedor desde quando? Desde ontem? 🆕",
    "É sério mesmo? Nem a pré-temporada terminou... 😂",
    "Até logo, torcedor! Foi bom enquanto durou. 👋",
    "O mascote do time vai sentir sua falta... 🦁",
    "Pelo menos leve uma camiseta de recordação! 👕",
    "Time é que nem família: a gente não escolhe... Ops, você tá escolhendo! 😬",
    "O WhatsApp do grupo da torcida vai ficar vazio... 📱",
    "Já pensou em ser político? Muda de lado fácil assim! 🎭",
  ];

  const randomPhrase = funnyPhrases[Math.floor(Math.random() * funnyPhrases.length)];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-border bg-card">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-destructive/10">
              <HeartOff className="h-5 w-5 text-destructive" aria-hidden="true" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Remover time favorito?
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground leading-relaxed">
            Você está prestes a remover <span className="font-semibold text-foreground">{team.name}</span> como
            seu time do coração. O site voltará ao tema padrão.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Visualização do Time */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-muted ring-2 ring-border shadow-xl relative">
                <img
                  src={team.logo?.url || "/placeholder-logo.svg"}
                  alt={team.name}
                  className="object-contain w-full h-full p-3"
                  loading="lazy"
                />
                {/* Overlay de remoção */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                  <HeartOff className="w-10 h-10 text-destructive" aria-hidden="true" />
                </div>
              </div>
              <Badge
                variant="destructive"
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 font-semibold"
              >
                Será removido
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground mb-1">
                {team.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Seu time favorito atual
              </p>
            </div>
          </div>

          {/* Aviso */}
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-amber-500/5 border-amber-500/20">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" aria-hidden="true" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">
                {randomPhrase}
              </p>
              <div className="space-y-1 text-muted-foreground leading-relaxed">
                <p className="font-medium text-foreground text-xs">O que vai acontecer:</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>As cores do site voltarão ao padrão amarelo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>A personalização será removida</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>Você pode escolher outro time a qualquer momento</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto gap-2"
          >
            <Undo2 className="w-4 h-4" />
            Manter como favorito
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            className="w-full sm:w-auto"
          >
            Sim, remover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}