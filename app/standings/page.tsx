import { Metadata } from "next"
import { default as StandingsPage } from "./Standings"

export const metadata: Metadata = {
  title: 'Classificação da Kings League 2025 | Tabela Completa e Atualizada',
  description: 'Acompanhe a tabela de classificação completa e atualizada da Kings League 2025. Confira pontos, jogos, vitórias, derrotas, gols marcados e saldo de gols de todos os times.',
  keywords: ['classificação kings league', 'tabela kings league', 'pontos kings league', 'ranking kings league', 'artilheiros kings league', 'times kings league', 'kings league 2025'],
  openGraph: {
    title: 'Tabela de Classificação Kings League 2025 | Dados Atualizados',
    description: 'Veja a classificação completa da Kings League 2025 com estatísticas detalhadas de todos os times. Dados atualizados em tempo real após cada rodada.',
    type: 'website',
  }
}

export default function Standings() {
  return (
    <StandingsPage />
  )
}