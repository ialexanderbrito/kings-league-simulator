import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import KingsLeagueLogo from "@/components/kings-league-logo"
import TeamCarousel from "@/components/team-carousel"
import { MatchesTableSkeleton } from "@/components/skeletons/matches-table-skeleton"
import { StandingsTableSkeleton } from "@/components/skeletons/standings-table-skeleton"
import { TableIcon } from "lucide-react"

export function LoadingState() {
  return (
    <div className="flex flex-col min-h-screen bg-[#121212] w-full overflow-x-hidden">
      <header className="bg-gradient-to-r from-black via-black/95 to-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#222] shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KingsLeagueLogo width={40} height={50} />
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#F4AF23] to-[#F7D380] bg-clip-text text-transparent">
              Kings League Simulator
            </h1>
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

      <div className="container mx-auto px-4 py-8 flex-grow max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,minmax(0,400px)] gap-6">
          <div className="w-full overflow-hidden">
            <MatchesTableSkeleton />
          </div>

          <div className="space-y-6 w-full">
            <Card className="bg-[#1a1a1a] border-[#333] text-white overflow-hidden w-full">
              <CardHeader className="py-3 px-4 border-b border-[#333] bg-[#1f1f1f]">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-200">
                  <TableIcon className="w-4 h-4 text-[#F4AF23]" />
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