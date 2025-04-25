import { Metadata } from "next"
import { default as SimulatorPage } from "./Simulator"

export const metadata: Metadata = {
  title: 'Simulador',
  description: 'Simulador de Campeonato - Simule os resultados do seu campeonato favorito',
}

export default function Simulator() {
  return (
    <SimulatorPage />
  )
}