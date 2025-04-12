import Script from 'next/script'
import { TeamStanding } from '@/types/kings-league'

interface SportEventSchemaProps {
  teams?: Record<string, any>;
  standings?: TeamStanding[];
  eventName?: string;
  startDate?: string;
  location?: string;
  type: 'league' | 'match' | 'team' | 'player';
  teamId?: string;
  playerName?: string;
  playerPosition?: string;
  matchId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
}

export function SchemaMarkup({
  teams,
  standings,
  eventName = "Kings League",
  startDate,
  location = "Barcelona, Spain",
  type,
  teamId,
  playerName,
  playerPosition,
  matchId,
  homeTeamId,
  awayTeamId
}: SportEventSchemaProps) {

  // Formatar de acordo com o tipo de schema que queremos renderizar
  const getSchemaMarkup = () => {
    if (type === 'league' && teams && standings) {
      return {
        "@context": "https://schema.org",
        "@type": "SportsOrganization",
        "name": "Kings League",
        "url": "https://kings-league-simulator.vercel.app",
        "logo": "https://kings-league-simulator.vercel.app/favicon.svg",
        "description": "Simulador oficial Kings League com estatísticas, partidas e classificações",
        "sport": "Football",
        "memberOf": {
          "@type": "SportsOrganization",
          "name": "Kings League"
        },
        "event": {
          "@type": "SportsEvent",
          "name": eventName,
          "startDate": startDate || new Date().toISOString(),
          "location": {
            "@type": "Place",
            "name": location
          },
          "competitor": standings.slice(0, 5).map(standing => ({
            "@type": "SportsTeam",
            "name": teams[standing.teamId]?.name || standing.teamId,
            "image": teams[standing.teamId]?.logo || "/placeholder-logo.svg"
          }))
        }
      }
    }

    if (type === 'team' && teamId && teams) {
      const team = teams[teamId];
      return {
        "@context": "https://schema.org",
        "@type": "SportsTeam",
        "name": team?.name || teamId,
        "url": `https://kings-league-simulator.vercel.app/team/${teamId}`,
        "logo": team?.logo || "/placeholder-logo.svg",
        "description": `Time ${team?.name || teamId} da Kings League`,
        "sport": "Football",
        "memberOf": {
          "@type": "SportsOrganization",
          "name": "Kings League"
        }
      }
    }

    if (type === 'player' && playerName) {
      return {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": playerName,
        "url": `https://kings-league-simulator.vercel.app/player/${playerName.replace(/\s+/g, '-').toLowerCase()}`,
        "jobTitle": playerPosition || "Jogador",
        "memberOf": {
          "@type": "SportsTeam",
          "name": teams && teamId ? (teams[teamId]?.name || teamId) : "Kings League Team"
        }
      }
    }

    if (type === 'match' && homeTeamId && awayTeamId && teams) {
      const homeTeam = teams[homeTeamId];
      const awayTeam = teams[awayTeamId];

      return {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        "name": `${homeTeam?.name || homeTeamId} vs ${awayTeam?.name || awayTeamId}`,
        "url": `https://kings-league-simulator.vercel.app/match/${matchId}`,
        "startDate": startDate || new Date().toISOString(),
        "location": {
          "@type": "Place",
          "name": location
        },
        "homeTeam": {
          "@type": "SportsTeam",
          "name": homeTeam?.name || homeTeamId,
          "image": homeTeam?.logo || "/placeholder-logo.svg"
        },
        "awayTeam": {
          "@type": "SportsTeam",
          "name": awayTeam?.name || awayTeamId,
          "image": awayTeam?.logo || "/placeholder-logo.svg"
        }
      }
    }

    // Default schema
    return {
      "@context": "https://schema.org",
      "@type": "SportsOrganization",
      "name": "Kings League Simulator",
      "url": "https://kings-league-simulator.vercel.app",
      "logo": "https://kings-league-simulator.vercel.app/favicon.svg",
      "description": "Simulador não-oficial da Kings League com estatísticas, partidas e classificações atualizadas"
    }
  }

  return (
    <Script
      id="schema-markup"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(getSchemaMarkup()) }}
    />
  )
}