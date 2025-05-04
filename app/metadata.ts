import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kings League Simulador Oficial 2025 | Simule Partidas, Tabela e Playoffs',
  description: 'Simulador completo da Kings League 2025 no Brasil! Simule partidas, veja a classificação em tempo real, estatísticas de jogadores e times, chaveamento dos playoffs e preveja o campeão. Totalmente atualizado e gratuito!',
  keywords: [
    'Kings League', 'Kings League Brasil', 'simulador Kings League', 'Kings League simulador', 
    'tabela Kings League', 'classificação Kings League', 'times da Kings League', 
    'jogos da Kings League', 'Kings League 2025', 'placar Kings League',
    'quem vai ganhar Kings League', 'playoffs Kings League', 'chaveamento Kings League',
    'como funciona Kings League', 'regras Kings League', 'simulador de partidas Kings League',
    'estatísticas Kings League', 'jogadores Kings League', 'Kings League ao vivo'
  ],
  openGraph: {
    title: 'Kings League Simulador Brasil 2025 | Simulação Completa da Liga',
    description: 'O simulador mais completo da Kings League 2025! Simule partidas, veja a classificação, estatísticas e descubra quem será o campeão da temporada.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kings League Simulador 2025 - Sua experiência completa da Kings League',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kings League Simulador Brasil 2025 | Simulação Completa da Liga',
    description: 'O simulador mais completo da Kings League! Simule partidas, veja a classificação, estatísticas e descubra quem será o campeão.',
    images: ['/og-image-x.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
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
  }
}