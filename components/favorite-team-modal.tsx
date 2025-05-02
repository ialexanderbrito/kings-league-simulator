import React from 'react';
import { Team } from '@/types/kings-league';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, HeartCrack, Star, Trophy } from 'lucide-react';

interface FavoriteTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  currentTeam: Team | null;
  newTeam: Team;
  isSwitching: boolean;
}

export function FavoriteTeamModal({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  currentTeam,
  newTeam,
  isSwitching,
}: FavoriteTeamModalProps) {
  const messages = {
    add: {
      title: "Escolher time do coração",
      description: "Quer mesmo definir o time abaixo como seu favorito? As cores do site serão adaptadas a este time.",
    },
    switch: {
      title: "Trocar de time do coração?",
      description: "Então você é desses que fica trocando de time quando a fase não está boa? Tem certeza que quer trocar seu time do coração?",
    },
  };

  const content = isSwitching ? messages.switch : messages.add;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[var(--team-primary)]">
            {isSwitching ? <HeartCrack className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
            {content.title}
          </DialogTitle>
          <DialogDescription>
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isSwitching && currentTeam && (
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-3 bg-[#252525] py-2 px-3 rounded-full">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-black/30 ring-1 ring-white/10">
                  <img
                    src={currentTeam.logo?.url || "/placeholder-logo.svg"}
                    alt={currentTeam.name}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-sm text-gray-300 flex items-center gap-1.5">
                  <HeartCrack className="h-4 w-4 text-red-400" />
                  {currentTeam.name}
                </span>
              </div>

              <div className="mx-3 text-gray-500">para</div>

              <div className="flex items-center gap-3 bg-[#252525] py-2 px-3 rounded-full">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-black/30 ring-1 ring-white/10">
                  <img
                    src={newTeam.logo?.url || "/placeholder-logo.svg"}
                    alt={newTeam.name}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-sm text-gray-300 flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-red-400" />
                  {newTeam.name}
                </span>
              </div>
            </div>
          )}

          {!isSwitching && (
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3 bg-[#252525] py-2 px-4 rounded-full">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-black/30 ring-1 ring-white/10">
                  <img
                    src={newTeam.logo?.url || "/placeholder-logo.svg"}
                    alt={newTeam.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className="text-white font-medium">{newTeam.name}</span>
                <Star className="h-4 w-4 text-[var(--team-primary)]" />
              </div>
            </div>
          )}

          {isSwitching && (
            <div className="mt-6 mb-2 text-sm text-amber-400 bg-amber-950/30 p-3 rounded-md border border-amber-800/30 flex items-start gap-2">
              <Trophy className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p>Torcedores de verdade acompanham seus times na vitória e na derrota. O time do coração é para vida toda!</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="border-white/10 hover:bg-[#252525] hover:text-white"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-[var(--team-primary)] hover:bg-[var(--team-primary)]/80 text-black"
            onClick={onConfirm}
          >
            {isSwitching ? 'Sim, trocar' : 'Definir como favorito'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}