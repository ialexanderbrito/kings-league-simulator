import { Metadata } from "next"
import { default as StandingsPage } from "./Standings"

export const metadata: Metadata = {
  title: 'Classificação Kings League Brasil | Tabela Atualizada em Tempo Real',
  description: '📊 Acompanhe a tabela de classificação COMPLETA e ATUALIZADA da Kings League Brasil! Veja pontos, jogos, vitórias, empates, derrotas, gols marcados, gols sofridos e saldo de gols de todos os times. Dados atualizados automaticamente após cada partida!',
  keywords: [
    'classificação kings league', 'tabela kings league', 'tabela kings league brasil',
    'pontos kings league', 'ranking kings league',
    'tabela atualizada kings league', 'classificação ao vivo kings league',
    'posição times kings league', 'líder kings league', 'lanterna kings league',
    'artilheiros kings league', 'artilharia kings league', 'goleadores kings league',
    'estatísticas times kings league', 'saldo de gols kings league',
    'quantos pontos tem kings league', 'quem está em primeiro kings league'
  ],
  openGraph: {
    title: 'Tabela Kings League Brasil 📊 | Classificação Atualizada',
    description: '🏆 Veja a classificação completa da Kings League Brasil! Pontos, jogos, vitórias e estatísticas detalhadas de todos os times. Atualização automática!',
    type: 'website',
    url: 'https://kings-league-simulator.vercel.app/standings',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tabela Kings League Brasil 📊',
    description: '🏆 Classificação completa e atualizada! Veja pontos, jogos e estatísticas de todos os times.',
  },
  alternates: {
    canonical: 'https://kings-league-simulator.vercel.app/standings',
  }
}

export default function Standings() {
  return (
    <StandingsPage />
  )
}