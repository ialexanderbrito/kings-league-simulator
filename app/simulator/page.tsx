import { Metadata } from "next"
import { default as SimulatorPage } from "./Simulator"

export const metadata: Metadata = {
  title: 'Simulador da Kings League 2025 | Simule Resultados em Tempo Real',
  description: 'Use o simulador oficial da Kings League 2025 e preveja resultados de partidas, classificação, playoffs e o campeão da temporada. O melhor simulador brasileiro para a Kings League com dados atualizados.',
  keywords: ['simulador kings league', 'resultados kings league', 'palpites kings league', 'tabela kings league', 'kings league 2025', 'kings league simulador', 'simulador de futebol'],
  openGraph: {
    title: 'Simulador da Kings League 2025 | Preveja o Campeão',
    description: 'Simule partidas, resultados e descubra quem será o campeão da Kings League 2025 com o simulador mais completo da liga.',
    type: 'website',
  }
}

export default function Simulator() {
  return (
    <SimulatorPage />
  )
}