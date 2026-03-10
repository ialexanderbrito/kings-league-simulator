import { Metadata } from "next"
import { default as TeamsPage } from "./Teams"

export const metadata: Metadata = {
  title: 'Times da Kings League Brasil | Elenco, Estatísticas e Dados Completos',
  description: 'Conheça todos os times da Kings League Brasil, seus presidentes, jogadores, estatísticas e histórico. Dados completos e atualizados dos times que disputam a temporada atual.',
  keywords: ['times kings league', 'elenco kings league', 'jogadores kings league', 'presidentes kings league', 'equipes kings league', 'plantéis kings league', 'clubes kings league', 'kings league brasil'],
  openGraph: {
    title: 'Todos os Times da Kings League Brasil | Dados Completos',
    description: 'Explore todos os times que disputam a Kings League Brasil. Conheça elencos, presidentes, estatísticas e desempenho de cada equipe na temporada atual.',
    type: 'website',
  }
}

export default function Teams() {
  return (
    <TeamsPage />
  )
}