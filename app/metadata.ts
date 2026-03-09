import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kings League Brasil 2026 | Simulador Completo + Tabela Atualizada + Estatísticas',
  description: '⚽ O MELHOR simulador da Kings League Brasil 2026! Simule partidas em tempo real, acompanhe a classificação atualizada automaticamente, veja estatísticas completas de todos os jogadores e times, chaveamento dos playoffs e preveja quem será o campeão da temporada. 100% GRÁTIS com dados oficiais!',
  keywords: [
    // Principais termos de busca
    'Kings League Brasil', 'Kings League simulador', 'simulador Kings League Brasil', 
    'Kings League 2026', 'Kings League Brasil 2026',
    // Tabela e classificação
    'tabela Kings League', 'tabela Kings League Brasil', 'classificação Kings League', 
    'classificação Kings League atualizada', 'pontos Kings League', 'ranking Kings League',
    'tabela de classificação Kings League 2026',
    // Times
    'times da Kings League', 'times da Kings League Brasil', 'equipes Kings League',
    'melhores times Kings League', 'times Kings League 2026',
    // Jogos e partidas
    'jogos da Kings League', 'jogos Kings League hoje', 'partidas Kings League',
    'resultados Kings League', 'placar Kings League', 'Kings League ao vivo',
    'resultados Kings League hoje', 'Kings League tempo real',
    // Playoffs
    'playoffs Kings League', 'chaveamento Kings League', 'mata-mata Kings League',
    'final Kings League', 'quartas de final Kings League', 'semifinal Kings League',
    // Previsões
    'quem vai ganhar Kings League', 'campeão Kings League 2026', 
    'palpites Kings League', 'prognósticos Kings League', 'previsão Kings League',
    // Estatísticas
    'estatísticas Kings League', 'artilharia Kings League', 'artilheiros Kings League',
    'assistências Kings League', 'jogadores Kings League', 'estatísticas jogadores Kings League',
    // Simulador
    'simulador de partidas Kings League', 'simular jogos Kings League',
    'simulador futebol 7', 'como simular Kings League',
    // Informações gerais
    'como funciona Kings League', 'regras Kings League', 'quando começa Kings League',
    'onde assistir Kings League', 'Kings League Brasil transmissão',
    // Termos relacionados
    'futebol 7', 'Gerard Piqué liga', 'liga futebol influencers Brasil',
    'Ibai Llanos futebol', 'Gaules Kings League', 'Cellbit Kings League'
  ],
  openGraph: {
    title: 'Kings League Brasil 2026 ⚽ | Simulador Oficial + Tabela + Estatísticas',
    description: '🏆 SIMULADOR COMPLETO da Kings League Brasil! Simule partidas, veja a tabela atualizada, estatísticas de jogadores, chaveamento dos playoffs e descubra quem será o campeão. Totalmente GRÁTIS com dados oficiais!',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kings League Brasil 2026 - Simulador Oficial com Tabela e Estatísticas em Tempo Real',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
    siteName: 'Kings League Brasil Simulador',
    url: 'https://kings-league-simulator.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kings League Brasil 2026 ⚽ | Simulador + Tabela + Stats',
    description: '🏆 O simulador MAIS COMPLETO da Kings League Brasil! Simule partidas, tabela atualizada e estatísticas. 100% GRÁTIS!',
    images: ['/og-image-x.png'],
    creator: '@ialexanderbrito',
    site: '@kingsleague',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    }
  },
  alternates: {
    canonical: 'https://kings-league-simulator.vercel.app',
    languages: {
      'pt-BR': 'https://kings-league-simulator.vercel.app',
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
  category: 'Sports',
  other: {
    'revisit-after': '1 days',
    'distribution': 'global',
    'rating': 'general',
    'language': 'pt-BR',
    'geo.region': 'BR',
    'geo.placename': 'Brasil',
  }
}