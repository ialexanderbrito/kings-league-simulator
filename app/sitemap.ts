import { MetadataRoute } from 'next'
import { kingsLeagueApi } from '@/lib/api'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kings-league-simulator.vercel.app'
  const lastModified = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/simulator`,
      lastModified,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/standings`,
      lastModified,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/playoffs`,
      lastModified,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/teams`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tier-list`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/resultados-enquete`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/termos-de-uso`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politica-de-privacidade`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
    }
  ]

  // Adiciona URLs dinâmicas dos times
  try {
    const teams = await kingsLeagueApi.getSeasonTeams()
    const teamList = Array.isArray(teams) ? teams : (teams as any)?.teams ?? []

    const teamRoutes: MetadataRoute.Sitemap = teamList.map((team: any) => ({
      url: `${baseUrl}/team/${team.id}`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

    return [...staticRoutes, ...teamRoutes]
  } catch {
    return staticRoutes
  }
}