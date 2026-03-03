import React, { useMemo } from 'react';
import { Team } from '@/types/kings-league';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';
import { getProxyImageUrl } from '@/lib/utils';

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
  const funnyPhrases = [
    "Tá trocando de time? A fidelidade durou quanto tempo mesmo?",
    "Time perdeu, já era? Torcedor moderno demais!",
    "Seu time antigo vai sentir sua falta... ou não",
    "Muda de time como quem troca de camisa, né?",
    "O técnico do seu time antigo está chorando agora...",
    "Já pensou em ser agente? Você troca de time melhor que muito jogador!",
    "Torcedor desde quando? Desde agora!",
    "Pelo menos é sincero. Respeito!",
    "Seu time do coração vai virar seu time do 'lembrar com carinho'...",
    "Até a tatuagem você vai ter que trocar agora!",
    "Amigo, isso é traição. Mas tá valendo!",
    "Seu time antigo nem sabe que você saiu dele ainda não.",
    "Trocou mais rápido do que jogador de seleção muda de técnico!",
    "A estabilidade emocional pediu para não ser mencionada.",
    "Seu time atual não merecia esse carinho todo.",
    "Bora ver se esse aqui não vai decepção também, hein?",
    "Você é mais volátil que a cotação do real!",
    "Nem gato de sete vidas muda de time assim!",
    "Coração de espinha de peixe, né?",
    "Seu time antigo vai ter que processar esse abandono.",
    "Vira e mexe aparece um novo capricho, né?",
    "Isso é pior que terminar uma relação pelo WhatsApp.",
    "Que volubilidade! Que falta de caráter!",
    "Seu time antigo tá aí esperando você voltar... ou não.",
    "Alguém avisa para a CBF que tem mais um apátrida aqui!",
    "Você é mais inconstante que previsão do tempo!",
    "Tá construindo um histórico de traições impressionante!",
    "Amor de verão com times mesmo. Que história!",
    "Seu time antigo vai precisar de terapia depois disso.",
    "Bora ver se você consegue ser fiel esse tempo!",
    "Você troca de time como meme sai de moda!",
    "A lealdade não é seu forte, não é?",
    "Seu novo time melhor festejar enquanto dura!",
    "Que giro de volante você fez, viu?",
    "Seu coração é mais colorido que tinta de Carnaval!",
    "Nem o próprio time acreditava que você sairia desse jeito!",
    "Bem-vindo ao clube dos infiéis... digo, dos dinâmicos!",
    "Seu time antigo tá aí marcando os pontos de ingratidão.",
    "Pior que ex que volta pedindo dinheiro emprestado!",
    "Você é mais impulsivo que compra em Black Friday!",
  ];

  const randomPhrase = useMemo(
    () => funnyPhrases[Math.floor(Math.random() * funnyPhrases.length)],
    [isSwitching]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Heart className="h-5 w-5 text-[var(--team-primary)]" aria-hidden="true" />
            {isSwitching ? 'Trocar time do coração?' : 'Definir time favorito'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isSwitching
              ? 'As cores do site serão atualizadas para o novo time.'
              : 'As cores do site serão personalizadas com as cores do time.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Visualização da Troca */}
          <div className="flex items-center justify-center gap-6">
            {isSwitching && currentTeam ? (
              <>
                {/* Time Atual */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 p-2">
                    <img
                      src={getProxyImageUrl(currentTeam.logo?.url)}
                      alt={currentTeam.name}
                      className="object-contain w-full h-full"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <span className="text-xs text-gray-500">Atual</span>
                </div>

                {/* Seta */}
                <ArrowRight className="w-5 h-5 text-gray-600" aria-hidden="true" />

                {/* Novo Time */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-16 h-16 rounded-xl overflow-hidden border-2 p-2"
                    style={{
                      backgroundColor: 'rgb(var(--team-primary-rgb), 0.1)',
                      borderColor: 'rgb(var(--team-primary-rgb), 0.5)'
                    }}
                  >
                    <img
                      src={getProxyImageUrl(newTeam.logo?.url)}
                      alt={newTeam.name}
                      className="object-contain w-full h-full"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <span className="text-xs text-[var(--team-primary)]">Novo</span>
                </div>
              </>
            ) : (
              /* Apenas o Novo Time */
              <div className="flex flex-col items-center gap-3">
                <div
                  className="relative w-20 h-20 rounded-xl overflow-hidden border-2 p-3"
                  style={{
                    backgroundColor: 'rgb(var(--team-primary-rgb), 0.1)',
                    borderColor: 'rgb(var(--team-primary-rgb), 0.5)'
                  }}
                >
                  <img
                    src={getProxyImageUrl(newTeam.logo?.url)}
                    alt={newTeam.name}
                    className="object-contain w-full h-full"
                    loading="lazy"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">{newTeam.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 justify-center mt-1">
                    <Sparkles className="w-3 h-3 text-[var(--team-primary)]" aria-hidden="true" />
                    Seu novo favorito
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          {isSwitching && (
            <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-gray-300 italic text-center">
                "{randomPhrase}"
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none border-white/10 hover:bg-white/5"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="flex-1 sm:flex-none font-medium"
            style={{
              backgroundColor: 'rgb(var(--team-primary-rgb))',
              color: '#000'
            }}
          >
            {isSwitching ? 'Confirmar' : 'Definir favorito'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}