import React from 'react';
import { Team } from '@/types/kings-league';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Sparkles, ArrowRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  // Frases engraçadas para quando o usuário troca de time
  const funnyPhrases = [
    "Tá trocando de time? Isso aí, a fidelidade durou quanto tempo mesmo? 😅",
    "Então é assim que funciona? Time perdeu, já era? Torcedor moderno demais! 🤔",
    "Seu time antigo vai sentir sua falta... ou não 😏",
    "Muda de time como quem troca de camisa, né? Literalmente! 👕",
    "O técnico do seu time antigo está chorando agora... 😢",
    "Já pensou em ser agente? Você troca de time melhor que muito jogador! ⚽",
    "Torcedor desde quando? Desde agora! 🆕",
    "Pelo menos é sincero. Respeito! 💯",
    "Seu time do coração vai virar seu time do 'lembrar com carinho'... 💔",
    "Até a tatuagem você vai ter que trocar agora! 😂",
  ];

  const randomPhrase = funnyPhrases[Math.floor(Math.random() * funnyPhrases.length)];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-border bg-card">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#F4AF23]/10">
              <Heart className="h-5 w-5 text-[#F4AF23]" aria-hidden="true" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              {isSwitching ? 'Trocar time do coração?' : 'Definir time favorito'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground leading-relaxed">
            {isSwitching
              ? 'Você está prestes a trocar seu time do coração. As cores do site serão atualizadas para refletir o novo time.'
              : 'Ao definir um time como favorito, as cores do site serão personalizadas de acordo com as cores do time escolhido.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Visualização da Troca */}
          <div className="flex items-center justify-center gap-4">
            {isSwitching && currentTeam && (
              <>
                {/* Time Atual */}
                <div className="flex flex-col items-center gap-3 flex-1">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted ring-2 ring-border shadow-lg">
                      <img
                        src={currentTeam.logo?.url || "/placeholder-logo.svg"}
                        alt={currentTeam.name}
                        className="object-contain w-full h-full p-2"
                        loading="lazy"
                      />
                    </div>
                    <Badge
                      variant="secondary"
                      className="absolute -top-2 -right-2 text-xs bg-muted text-muted-foreground"
                    >
                      Atual
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground text-center">
                    {currentTeam.name}
                  </p>
                </div>

                {/* Seta */}
                <div className="flex-shrink-0">
                  <ArrowRight className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
                </div>

                {/* Novo Time */}
                <div className="flex flex-col items-center gap-3 flex-1">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#F4AF23]/10 ring-2 ring-[#F4AF23]/50 shadow-lg shadow-[#F4AF23]/20">
                      <img
                        src={newTeam.logo?.url || "/placeholder-logo.svg"}
                        alt={newTeam.name}
                        className="object-contain w-full h-full p-2"
                        loading="lazy"
                      />
                    </div>
                    <Badge
                      variant="default"
                      className="absolute -top-2 -right-2 text-xs bg-[#F4AF23] text-black font-semibold"
                    >
                      Novo
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground text-center">
                    {newTeam.name}
                  </p>
                </div>
              </>
            )}

            {!isSwitching && (
              /* Apenas o Novo Time */
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#F4AF23]/10 ring-2 ring-[#F4AF23]/50 shadow-xl shadow-[#F4AF23]/20">
                    <img
                      src={newTeam.logo?.url || "/placeholder-logo.svg"}
                      alt={newTeam.name}
                      className="object-contain w-full h-full p-3"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#F4AF23] text-black font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" aria-hidden="true" />
                      Favorito
                    </Badge>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground mb-1">
                    {newTeam.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Seu novo time do coração
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Informação */}
          <div className={cn(
            "flex items-start gap-3 p-4 rounded-lg border",
            isSwitching
              ? "bg-amber-500/5 border-amber-500/20"
              : "bg-[#F4AF23]/5 border-[#F4AF23]/20"
          )}>
            <Info className={cn(
              "w-5 h-5 flex-shrink-0 mt-0.5",
              isSwitching ? "text-amber-500" : "text-[#F4AF23]"
            )} aria-hidden="true" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-foreground">
                {isSwitching ? randomPhrase : 'O que vai mudar?'}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {isSwitching
                  ? 'A personalização do site será transferida para o novo time. Você pode mudar novamente quando quiser (óbvio, né?).'
                  : 'As cores do site, destaques e elementos visuais serão personalizados com as cores do time escolhido.'
                }
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto bg-[#F4AF23] hover:bg-[#F4AF23]/90 text-black font-semibold"
          >
            {isSwitching ? 'Confirmar troca' : 'Definir como favorito'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}