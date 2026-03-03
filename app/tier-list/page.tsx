import { Metadata } from "next"
import { default as TierListPage } from "./TierList"

export const metadata: Metadata = {
  title: 'Tier List Kings League Brasil | Crie e Compartilhe Seu Ranking de Times',
  description: '🏆 Crie sua TIER LIST personalizada dos times da Kings League Brasil! Arraste e solte os times, customize os nomes e cores das categorias, e compartilhe com seus amigos. Totalmente GRATUITO e interativo!',
  keywords: [
    'tier list kings league', 'tier list kings league brasil', 'ranking kings league',
    'classificar times kings league', 'melhores times kings league',
    'tier list times futebol', 'tier maker kings league', 'tier list futebol 7',
    'criar tier list kings league', 'ranking times kings league brasil',
    'tier list personalizada', 'tier list customizável',
    'compartilhar tier list', 'tier list online grátis',
    'avaliar times kings league', 'análise times kings league'
  ],
  openGraph: {
    title: 'Tier List Kings League Brasil 🏆 | Crie e Compartilhe Seu Ranking',
    description: '⚡ Crie sua tier list dos times da Kings League! Arraste, solte, customize e compartilhe com amigos. 100% GRÁTIS!',
    type: 'website',
    url: 'https://kings-league-simulator.vercel.app/tier-list',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tier List Kings League Brasil - Crie e Compartilhe Seu Ranking',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tier List Kings League Brasil 🏆',
    description: '⚡ Crie sua tier list dos times da Kings League! Arraste, solte e compartilhe. 100% GRÁTIS!',
  },
  alternates: {
    canonical: 'https://kings-league-simulator.vercel.app/tier-list',
  },
  robots: {
    index: true,
    follow: true,
  }
}

export default function TierList() {
  return <TierListPage />
}
