import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Instagram, TwitchIcon, Youtube, User } from "lucide-react"
import type { Team, TeamDetails } from "@/types/kings-league"

interface TeamHeaderProps {
  team: Team
  teamDetails: TeamDetails | null
}

export function TeamHeader({ team, teamDetails }: TeamHeaderProps) {
  const president = teamDetails?.staff?.find((member) => member.role === "president")
  const coach = teamDetails?.staff?.find((member) => member.role === "coach")

  const socialLinks = [
    {
      url: teamDetails?.metaInformation?.instagram_url,
      icon: Instagram,
      label: "Instagram",
      name: "Instagram",
    },
    {
      url: teamDetails?.metaInformation?.youtube_url,
      icon: Youtube,
      label: "YouTube",
      name: "YouTube",
    },
    {
      url: teamDetails?.metaInformation?.twitch_url,
      icon: TwitchIcon,
      label: "Twitch",
      name: "Twitch",
    },
  ].filter((link) => link.url)

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden relative">
      {/* Background pattern opcional */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${team.firstColorHEX}15 0%, ${team.secondColorHEX}10 50%, transparent 100%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Logo do Time */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 relative">
              {teamDetails?.logo ? (
                <img
                  src={teamDetails.logo.url || "/placeholder.svg"}
                  alt={`Logo do ${team.name}`}
                  className="w-full h-full object-contain"
                  loading="eager"
                />
              ) : (
                <Skeleton className="w-full h-full rounded-lg" />
              )}
            </div>
          </div>

          {/* Informações do Time */}
          <div className="flex-grow text-center sm:text-left space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {team.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              {/* Cores do Time */}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-full border border-border"
                  style={{ backgroundColor: team.firstColorHEX }}
                  aria-label="Cor principal do time"
                  title="Cor principal"
                />
                <div
                  className="w-5 h-5 rounded-full border border-border"
                  style={{ backgroundColor: team.secondColorHEX }}
                  aria-label="Cor secundária do time"
                  title="Cor secundária"
                />
              </div>

              {/* Redes Sociais */}
              {socialLinks.length > 0 && (
                <nav aria-label="Redes sociais do time" className="flex items-center gap-2">
                  {socialLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={`${link.label} do ${team.name}`}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </a>
                    )
                  })}
                </nav>
              )}
            </div>
          </div>

          {/* Staff (Presidente e Técnico) - Compacto */}
          {(president || coach) && (
            <div className="flex items-center gap-3 sm:gap-4">
              {president && (
                <div className="flex items-center gap-2">
                  <div
                    className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden bg-muted border border-border"
                    style={{
                      backgroundImage: "url('/bg-card-president.jpg')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {president.image?.url ? (
                      <img
                        src={president.image.url}
                        alt={president.shortName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                        <User className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs text-muted-foreground">Presidente</div>
                    <div className="text-sm font-semibold text-foreground">{president.shortName}</div>
                  </div>
                </div>
              )}

              {coach && (
                <div className="flex items-center gap-2">
                  <div
                    className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden bg-muted border border-border"
                    style={{
                      backgroundImage: "url('/bg-card-president.jpg')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {coach.image?.url ? (
                      <img
                        src={coach.image.url}
                        alt={coach.shortName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                        <User className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs text-muted-foreground">Técnico</div>
                    <div className="text-sm font-semibold text-foreground">{coach.shortName}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function TeamHeaderSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Logo Skeleton */}
        <div className="flex-shrink-0">
          <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg" />
        </div>

        {/* Informações Skeleton */}
        <div className="flex-grow space-y-2 text-center sm:text-left">
          <Skeleton className="h-7 sm:h-8 w-40 mx-auto sm:mx-0" />

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="flex gap-1.5">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="w-5 h-5 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="w-4 h-4 rounded" />
            </div>
          </div>
        </div>

        {/* Staff Skeleton */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-md" />
          <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-md" />
        </div>
      </div>
    </div>
  )
}