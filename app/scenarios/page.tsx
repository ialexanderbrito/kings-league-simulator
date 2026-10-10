import { Metadata } from "next"
import { default as ScenariosPage } from "./Scenarios"

export const metadata: Metadata = {
  title: "Cenários Kings League Brasil | Compare Simulações por Time",
  description:
    "Monte cenários de próximos jogos da Kings League, aplique presets, ajuste partidas manualmente e compare o impacto para o seu time.",
  keywords: [
    "cenarios kings league",
    "simulador de cenarios",
    "comparar simulacoes kings league",
    "proximos jogos kings league",
    "simulacao por time",
  ],
  openGraph: {
    title: "Cenários Kings League Brasil | Compare Simulações",
    description:
      "Crie e compare cenários de partidas para descobrir como seu time pode terminar a temporada.",
    type: "website",
    url: "https://kings-league-simulator.vercel.app/scenarios",
  },
  alternates: {
    canonical: "https://kings-league-simulator.vercel.app/scenarios",
  },
}

export default function Scenarios() {
  return <ScenariosPage />
}
