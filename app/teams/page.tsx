import { Metadata } from "next"
import { default as TeamsPage } from "./Teams"

export const metadata: Metadata = {
  title: 'Times da Kings League 2026 | Elenco, Estatísticas e Dados Completos',
  description: 'Conheça todos os times da Kings League 2026, seus presidentes, jogadores, estatísticas e histórico. Dados completos e atualizados dos 12 times que disputam a temporada atual.',
  keywords: ['times kings league', 'elenco kings league', 'jogadores kings league', 'presidentes kings league', 'equipes kings league', 'plantéis kings league', 'clubes kings league', 'kings league 2026'],
  openGraph: {
    title: 'Todos os Times da Kings League 2026 | Dados Completos',
    description: 'Explore todos os times que disputam a Kings League 2026. Conheça elencos, presidentes, estatísticas e desempenho de cada equipe na temporada atual.',
    type: 'website',
  }
}

export default function Teams() {
  return (
    <TeamsPage />
  )
}