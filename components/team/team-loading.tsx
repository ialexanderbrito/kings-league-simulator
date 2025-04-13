import React from "react"
import { TeamHeaderSkeleton } from "@/components/team/team-header"
import { StatisticsSkeleton } from "@/components/team/team-stats"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MatchesListSkeleton } from "@/components/team/matches-list"

export function TeamLoading() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho do time */}
      <TeamHeaderSkeleton />

      {/* Estatísticas */}
      <StatisticsSkeleton />

      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#1a1a1a]">
          <TabsTrigger
            value="matches"
            className="data-[state=active]:bg-gray-600 data-[state=active]:text-black"
            disabled
          >
            <Skeleton className="h-5 w-20" />
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="data-[state=active]:bg-gray-600 data-[state=active]:text-black"
            disabled
          >
            <Skeleton className="h-5 w-20" />
          </TabsTrigger>
        </TabsList>

        {/* Aba de Partidas */}
        <TabsContent value="matches" className="mt-0">
          <MatchesListSkeleton />
        </TabsContent>

        {/* Aba de Elenco */}
        <TabsContent value="team" className="mt-0">
          <Card className="bg-[#1a1a1a] border-[#333] text-white">
            <CardHeader className="pb-2 border-b border-[#333]">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="py-4">
              <div className="space-y-6">
                <div className="mb-4 p-3 bg-[#252525] border border-[#333] rounded-lg">
                  <Skeleton className="h-5 w-32 mb-3" />
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#333] rounded"></div>
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ))}
                  </div>
                </div>

                {['Goleiros', 'Defensores', 'Meio-campistas', 'Atacantes'].map((position) => (
                  <div key={position} className="mb-6">
                    <Skeleton className="h-6 w-32 mb-3" />
                    <div className="flex flex-wrap justify-center sm:justify-start gap-6">
                      {Array(position === 'Goleiros' ? 2 : 4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="w-72 h-[420px] rounded-lg" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}