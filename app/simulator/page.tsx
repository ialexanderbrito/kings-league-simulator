import { Metadata } from "next"
import { default as SimulatorPage } from "./Simulator"

export const metadata: Metadata = {
  title: 'Simulador Kings League Brasil 2025 | Simule Partidas e Preveja o Campeão',
  description: '⚽ SIMULE partidas da Kings League Brasil 2025 em tempo real! Altere placares, veja como fica a classificação, simule os playoffs e descubra quem será o CAMPEÃO! O simulador mais completo e interativo do Brasil com dados oficiais atualizados automaticamente.',
  keywords: [
    'simulador kings league', 'simulador kings league brasil', 'simular kings league',
    'simulador de partidas kings league', 'simulador jogos kings league',
    'como simular kings league', 'simulador futebol 7', 'simulador de futebol',
    'resultados kings league', 'palpites kings league', 'previsão kings league',
    'quem vai ganhar kings league', 'campeão kings league 2025',
    'simular playoffs kings league', 'simular classificação kings league',
    'prognóstico kings league', 'apostas kings league', 'previsões kings league',
    'tabela simulada kings league', 'simulação completa kings league'
  ],
  openGraph: {
    title: 'Simulador Kings League 2025 ⚽ | Simule e Preveja o Campeão',
    description: '🏆 Simule partidas da Kings League Brasil, altere placares, veja a nova classificação e descubra quem será o campeão! Simulador completo e GRÁTIS!',
    type: 'website',
    url: 'https://kings-league-simulator.vercel.app/simulator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Kings League 2025 ⚽',
    description: '🏆 Simule partidas e preveja o campeão da Kings League Brasil! 100% GRÁTIS!',
  },
  alternates: {
    canonical: 'https://kings-league-simulator.vercel.app/simulator',
  }
}

export default function Simulator() {
  return (
    <SimulatorPage />
  )
}