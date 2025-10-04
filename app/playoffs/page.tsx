import { Metadata } from "next"
import { default as PlayoffsPage } from "./Playoffs"

export const metadata: Metadata = {
  title: 'Playoffs Kings League Brasil 2025 | Chaveamento Completo e Simulação',
  description: '🏆 Veja e SIMULE os playoffs da Kings League Brasil 2025! Confira o chaveamento completo atualizado, acompanhe quartas de final, semifinais e final. Simule os confrontos eliminatórios e descubra o caminho do seu time até o título!',
  keywords: [
    'playoffs kings league', 'playoffs kings league brasil', 'chaveamento kings league',
    'mata-mata kings league', 'eliminatórias kings league', 'oitavas kings league',
    'quartas de final kings league', 'semifinal kings league', 'final kings league',
    'confrontos kings league', 'tabela playoffs kings league',
    'chaveamento atualizado kings league', 'bracket kings league',
    'simular playoffs kings league', 'quem joga contra quem kings league',
    'caminho final kings league', 'kings league 2025 playoffs'
  ],
  openGraph: {
    title: 'Playoffs Kings League Brasil 2025 🏆 | Chaveamento Completo',
    description: '⚡ Acompanhe o mata-mata da Kings League Brasil! Veja o chaveamento, simule confrontos e descubra quem será o campeão!',
    type: 'website',
    url: 'https://kings-league-simulator.vercel.app/playoffs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Playoffs Kings League 2025 🏆',
    description: '⚡ Chaveamento completo + Simulação dos confrontos eliminatórios!',
  },
  alternates: {
    canonical: 'https://kings-league-simulator.vercel.app/playoffs',
  }
};

export default function Playoffs() {
  return (
    <PlayoffsPage />
  )
}