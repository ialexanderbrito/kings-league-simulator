import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import KingsLeagueLogo from "@/components/kings-league-logo"
import TeamCarousel from "@/components/team-carousel"
import { MatchesTableSkeleton } from "@/components/skeletons/matches-table-skeleton"
import { StandingsTableSkeleton } from "@/components/skeletons/standings-table-skeleton"
import { TableIcon, Trophy } from "lucide-react"
import Link from "next/link"

export function LoadingState() {
  return (
    <div className="flex flex-col min-h-screen bg-background w-full overflow-x-hidden">
      <header
        className="backdrop-blur-md sticky top-0 z-50 border-b border-border/50 bg-background/80 transition-all duration-300"
        role="banner"
      >
        <div className="container mx-auto py-3 px-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="group flex items-center gap-3 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] focus:ring-offset-2 focus:ring-offset-background rounded-lg"
              aria-label="Página inicial do Kings League Simulador"
            >
              <div className="relative overflow-hidden rounded-lg p-1">
                <KingsLeagueLogo
                  width={36}
                  height={52}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--team-primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  <span className="text-[var(--team-primary)]">Kings</span> League
                </h1>
                <p className="text-xs text-muted-foreground -mt-0.5">Simulador</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1" role="main">
        <div className="container mx-auto px-4 py-4">
          <div
            className="pt-2 pb-6"
            role="region"
            aria-label="Carrossel de times"
            aria-live="polite"
            aria-busy="true"
          >
            <TeamCarousel
              teams={[]}
              onTeamSelect={() => { }}
              className="mb-6"
              loading={true}
            />
          </div>
        </div>

        <div className="container mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] xl:grid-cols-[1fr,420px] gap-4 lg:gap-6">
            <div
              className="w-full overflow-hidden"
              role="region"
              aria-label="Calendário de partidas"
              aria-live="polite"
              aria-busy="true"
            >
              <MatchesTableSkeleton />
            </div>

            <div className="space-y-6 w-full">
              <Card
                className="bg-card border-border shadow-lg overflow-hidden w-full"
                role="region"
                aria-label="Classificação dos times"
                aria-live="polite"
                aria-busy="true"
              >
                <CardHeader className="py-3 px-4 border-b border-border bg-muted/50">
                  <CardTitle className="text-lg flex items-center gap-2.5 text-foreground">
                    <div className="p-1.5 rounded-md bg-[var(--team-primary)]/10">
                      <TableIcon className="w-4 h-4 text-[var(--team-primary)]" aria-hidden="true" />
                    </div>
                    <span className="font-bold">Classificação</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <StandingsTableSkeleton />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}