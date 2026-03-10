import type { Metadata } from 'next'
import { kingsLeagueApi } from '@/lib/api'

interface TeamLayoutProps {
  children: React.ReactNode
  params: Promise<{ teamId: string }>
}

export async function generateMetadata({ params }: TeamLayoutProps): Promise<Metadata> {
  const { teamId } = await params

  try {
    const teamData = await kingsLeagueApi.getTeamDetails(teamId)
    const teamName = teamData?.name || teamId
    const teamLogo = teamData?.logo?.url || '/favicon.svg'

    return {
      title: `${teamName} | Kings League Brasil — Elenco, Estatísticas e Jogos`,
      description: `Confira tudo sobre o ${teamName} na Kings League Brasil! Veja o elenco completo, estatísticas detalhadas, histórico de partidas e desempenho na temporada atual.`,
      openGraph: {
        title: `${teamName} | Kings League Brasil`,
        description: `Elenco, estatísticas e jogos do ${teamName} na Kings League Brasil.`,
        type: 'website',
        url: `https://kings-league-simulator.vercel.app/team/${teamId}`,
        images: teamLogo ? [{ url: teamLogo, alt: teamName }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${teamName} | Kings League Brasil`,
        description: `Confira tudo sobre o ${teamName} na Kings League Brasil!`,
      },
      alternates: {
        canonical: `https://kings-league-simulator.vercel.app/team/${teamId}`,
      },
    }
  } catch {
    return {
      title: 'Time | Kings League Brasil',
      description: 'Confira informações sobre os times da Kings League Brasil.',
    }
  }
}

export default function TeamLayout({ children }: TeamLayoutProps) {
  return children
}
