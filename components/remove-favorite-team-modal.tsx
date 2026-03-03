import React, { useMemo } from 'react';
import { Team } from '@/types/kings-league';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HeartOff } from 'lucide-react';
import { getProxyImageUrl } from '@/lib/utils';

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
    "Abandonando o barco? O capitão sempre é o último a sair!",
    "Vai mesmo abandonar o time na má fase?",
    "O diretor de marketing está chorando agora...",
    "Torcedor de verdade não abandona o time!",
    "Tá abandonando o barco na primeira derrota?",
    "Seu presidente vai ficar decepcionado...",
    "As copas já estão garantidas e você quer sair?",
    "Desistindo na primeira dificuldade?",
    "Quem ama não desiste na primeira disputa de pênaltis!",
    "É sério mesmo? Nem a pré-temporada terminou...",
    "Até logo, torcedor! Foi bom enquanto durou.",
    "O mascote do time vai sentir sua falta...",
    "Pelo menos leve uma camiseta de recordação!",
    "Relacionamento terminado. Status: é complicado.",
    "Seu time vai te apagar das fotos do Instagram!",
    "A arquibancada ficou mais vazia agora...",
    "Nem deu tempo de comprar a camisa oficial!",
    "Quem ama, fica. Quem vai embora... bem, você escolheu.",
    "Isso vai doer mais no time do que no seu coração!",
    "Sua carteirinha de sócio-torcedor tá tristinha agora.",
    "O hino do time vai tocar em câmera lenta na sua cabeça.",
    "Partindo para outras cores, né? Que fase!",
    "O estádio vai sentir um vazio... ou não.",
    "Seus ídolos vão te esquecer rapidinho!",
    "Até as bandeiras abaixaram de tristeza.",
    "Você era o 12º jogador e agora... nada.",
    "A diretoria vai ter que refazer os planos sem você.",
    "Nem os gols memoráveis vão te segurar?",
    "Saindo pela porta dos fundos do estádio...",
    "Já pode devolver a camisa 10 do coração!",
    "O técnico pediu demissão quando soube da notícia.",
    "Nem o gandula acredita que você tá indo embora!",
    "Você vai aparecer na lista de 'ex-torcedores ilustres'.",
    "As cores do time vão desbotar da sua memória.",
    "A torcida organizada te tirou do grupo do WhatsApp.",
    "Nem o juiz daria cartão amarelo pra essa decisão... direto o vermelho!",
    "Sua fidelidade teve menos duração que técnico de time pequeno.",
    "O estádio vai fazer uma cerimônia de despedida... ou não.",
    "Isso é mais triste que rebaixamento na última rodada.",
    "Você vai virar lenda urbana: 'o torcedor que saiu'.",
    "A camisa do time já foi pro brechó da memória!",
    "Partiu vida nova sem as cores do time, né?",
    "O amor acabou mais rápido que contrato de técnico interino!",
  ];

  const randomPhrase = useMemo(
    () => funnyPhrases[Math.floor(Math.random() * funnyPhrases.length)],
    [open]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <HeartOff className="h-5 w-5 text-red-500" aria-hidden="true" />
            Remover time favorito?
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            O site voltará ao tema padrão amarelo.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Visualização do Time */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 p-3">
              <img
                src={getProxyImageUrl(team.logo?.url)}
                alt={team.name}
                className="object-contain w-full h-full opacity-50"
                loading="lazy"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <HeartOff className="w-8 h-8 text-red-500/80" aria-hidden="true" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white">{team.name}</p>
              <p className="text-xs text-gray-500">Será removido como favorito</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <p className="text-sm text-gray-300 italic text-center mb-3">
              "{randomPhrase}"
            </p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-500" />
                As cores voltarão ao padrão
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-500" />
                Você pode escolher outro time depois
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none border-white/10 hover:bg-white/5"
          >
            Manter favorito
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            className="flex-1 sm:flex-none"
          >
            Remover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}