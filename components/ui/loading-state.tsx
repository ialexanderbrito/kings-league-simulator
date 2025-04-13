import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import KingsLeagueLogo from "@/components/kings-league-logo"
import TeamCarousel from "@/components/team-carousel"
import { MatchesTableSkeleton } from "@/components/skeletons/matches-table-skeleton"
import { StandingsTableSkeleton } from "@/components/skeletons/standings-table-skeleton"
import { TableIcon, Trophy } from "lucide-react"
import Link from "next/link"

export function LoadingState() {
  return (
    <div className="flex flex-col min-h-screen bg-[#121212] w-full overflow-x-hidden">
      <header className="backdrop-blur-md sticky top-0 z-50 border-b border-white/5 transition-all duration-300">
        <div className="container mx-auto py-2.5 px-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
            >
              <div className="relative overflow-hidden rounded-md">
                <KingsLeagueLogo
                  width={36}
                  height={52}
                  className="transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--team-primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  <span className="text-[var(--team-primary)]">Kings</span> League
                </h1>
                <p className="text-xs text-gray-400 -mt-0.5">Simulador</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4">
        <div className="pt-2 pb-6">
          <TeamCarousel
            teams={[]}
            onTeamSelect={() => { }}
            className="mb-6"
            loading={true}
          />
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,minmax(0,400px)] gap-6">
          <div className="w-full overflow-hidden">
            <MatchesTableSkeleton />
          </div>

          <div className="space-y-6 w-full">
            <Card className="bg-[#1a1a1a] border-[#333] text-white overflow-hidden w-full">
              <CardHeader className="py-3 px-4 border-b border-[#333] bg-[#1f1f1f]">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-200">
                  <TableIcon className="w-4 h-4 text-[var(--team-primary)]" />
                  Classificação
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <StandingsTableSkeleton />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}