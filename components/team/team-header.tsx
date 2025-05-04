import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Instagram, TwitchIcon, Youtube } from "lucide-react"
import type { Team, TeamDetails } from "@/types/kings-league"

interface TeamHeaderProps {
  team: Team
  teamDetails: TeamDetails | null
}

export function TeamHeader({ team, teamDetails }: TeamHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-black to-[#121212] border border-[#333]">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: teamDetails?.metaInformation?.loop_video_poster ?
          `url('${teamDetails.metaInformation.loop_video_poster}')` :
          'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}></div>

      <div className="relative z-10 p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-32 h-32 relative">
          {teamDetails?.logo ? (
            <img
              src={teamDetails.logo.url || "/placeholder.svg"}
              alt={team.name}
              className="w-full h-full object-contain"
              loading="eager"
            />
          ) : (
            <Skeleton className="w-full h-full rounded-full" />
          )}
        </div>

        <div className="text-center md:text-left flex-grow">
          <h1 className="text-3xl font-bold text-[var(--team-primary)] mb-2">{team.name}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
            <Badge style={{ backgroundColor: team.firstColorHEX }} className="text-white">
              Cor Principal
            </Badge>
            <Badge style={{ backgroundColor: team.secondColorHEX }} className="text-white">
              Cor Secundária
            </Badge>
          </div>

          {teamDetails?.metaInformation && (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-300">
              {teamDetails.metaInformation.instagram_url && (
                <a
                  href={teamDetails.metaInformation.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-[var(--team-primary)] transition-colors"
                  aria-label={`Instagram de ${team.name}`}
                >
                  <Instagram className="w-4 h-4" />
                  <span className="text-sm">Instagram</span>
                </a>
              )}
              {teamDetails.metaInformation.youtube_url && (
                <a
                  href={teamDetails.metaInformation.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-[var(--team-primary)] transition-colors"
                  aria-label={`YouTube de ${team.name}`}
                >
                  <Youtube className="w-4 h-4" />
                  <span className="text-sm">YouTube</span>
                </a>
              )}
              {teamDetails.metaInformation.twitch_url && (
                <a
                  href={teamDetails.metaInformation.twitch_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-[var(--team-primary)] transition-colors"
                  aria-label={`Twitch de ${team.name}`}
                >
                  <TwitchIcon className="w-4 h-4" />
                  <span className="text-sm">Twitch</span>
                </a>
              )}
            </div>
          )}
        </div>

        {teamDetails?.staff && teamDetails.staff.length > 0 && (
          <div className="text-center min-w-[170px]">
            <div className="mb-1 text-xs text-gray-400">Presidente</div>
            <div className="flex flex-col items-center">
              <div
                className="relative w-24 h-24 mb-2 bg-[#252525] border border-[#333] overflow-hidden"
                style={{
                  backgroundImage: "url('/bg-card-president.jpg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {teamDetails.staff[0].image?.url ? (
                  <img
                    src={teamDetails.staff[0].image.url}
                    alt={teamDetails.staff[0].shortName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#252525]/70 text-[var(--team-primary)] text-2xl font-bold">
                    {teamDetails.staff[0].shortName.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="text-sm font-semibold">{teamDetails.staff[0].shortName}</div>
              <div className="text-xs text-gray-400">Presidente</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function TeamHeaderSkeleton() {
  return (
    <div className="relative rounded-xl bg-gradient-to-b from-black to-[#121212] border border-[#333] p-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Skeleton className="w-28 h-28 rounded-md" />
        <div className="text-center md:text-left flex-grow">
          <Skeleton className="h-8 w-44 mb-4 mx-auto md:mx-0" />
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}