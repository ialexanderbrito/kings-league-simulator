import { Metadata } from "next"
import { default as PlayoffsPage } from "./Playoffs"

export const metadata: Metadata = {
  title: 'Playoffs da Kings League 2025 | Chaveamento e Simulação Completa',
  description: 'Veja e simule os playoffs da Kings League 2025. Confira o chaveamento atualizado, acompanhe os confrontos eliminatórios e descubra o caminho do seu time até a grande final.',
  keywords: ['playoffs kings league', 'chaveamento kings league', 'mata-mata kings league', 'eliminatórias kings league', 'final kings league', 'semifinal kings league', 'kings league 2025'],
  openGraph: {
    title: 'Playoffs Kings League 2025 | Chaveamento e Confrontos Diretos',
    description: 'Acompanhe o mata-mata da Kings League 2025 em tempo real. Simule resultados dos confrontos eliminatórios e veja quem chegará à grande final.',
    type: 'website',
  }
};

export default function Playoffs() {
  return (
    <PlayoffsPage />
  )
}