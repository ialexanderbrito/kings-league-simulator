import React from 'react';
import { Team } from '@/types/kings-league';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HeartOff, Frown, Ship, Trophy } from 'lucide-react';

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
  const funnyPhrases = [
    "Vai mesmo abandonar o time na má fase?",
    "O diretor de marketing está chorando agora...",
    "Torcedor de verdade não abandona o time!",
    "Tá abandonando o barco na primeira derrota?",
    "Seu presidente vai ficar decepcionado...",
    "As copas já estão lá e você quer sair?",
    "Desistindo na primeira dificuldade?",
    "Quem ama não desiste na primeira disputa de penâltis!",
    "Torcedor desde quando? Ontem?",
    "É sério mesmo? Nem a pré-temporada terminou...",
  ];

  const randomPhrase = funnyPhrases[Math.floor(Math.random() * funnyPhrases.length)];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <HeartOff className="h-5 w-5" />
            Abandonar o time do coração?
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja remover <span className="font-medium text-white">{team.name}</span> como seu time do coração?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-[#252525] rounded-full relative">
              <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-black/50 ring-1 ring-white/10 relative">
                <Image
                  src={team.logo?.url || "/placeholder-logo.svg"}
                  alt={team.name}
                  fill
                  className="object-contain"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Frown className="h-10 w-10 text-red-400/70" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 mb-2 text-amber-400 bg-amber-950/30 p-4 rounded-md border border-amber-800/30 flex items-start gap-2.5">
            <Ship className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{randomPhrase}</p>
          </div>

          <div className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <Trophy className="h-3 w-3" />
            <p>O site voltará às cores padrão se você continuar</p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="border-white/10 hover:bg-[#252525] hover:text-white"
            onClick={onCancel}
          >
            Continuar como torcedor
          </Button>
          <Button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={onConfirm}
          >
            Sim, abandonar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}