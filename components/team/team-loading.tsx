import React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MatchesListSkeleton } from "@/components/team/matches-list"
import { Calendar, Users, Trophy, Target, TrendingUp, Shield, Swords } from "lucide-react"

export function TeamLoading() {
  return (
    <div className="space-y-8">
      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-transparent" />

        <div className="relative p-6 md:p-10">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Logo Skeleton */}
            <div className="relative">
              <Skeleton className="w-28 h-28 md:w-36 md:h-36 rounded-2xl" />
            </div>

            {/* Info Skeleton */}
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>

              <Skeleton className="h-12 w-64 mx-auto lg:mx-0" />

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-16 h-4" />
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <Skeleton className="w-6 h-6 rounded-full" />
                </div>
                <Skeleton className="w-px h-5" />
                <div className="flex gap-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Skeleton className="h-14 w-40 rounded-xl" />
                <Skeleton className="h-14 w-36 rounded-xl" />
              </div>
            </div>

            {/* Quick Stats Skeleton */}
            <div className="grid grid-cols-2 gap-3">
              {[Trophy, Target, Swords, Users].map((Icon, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <Skeleton className="w-8 h-8 rounded-lg mb-2" />
                  <Skeleton className="h-7 w-10 mb-1" />
                  <Skeleton className="h-3 w-14" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards Skeleton */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[TrendingUp, Shield, Target, Users].map((Icon, i) => (
          <Card key={i} className="bg-[#0a0a0a] border-white/5 rounded-2xl overflow-hidden">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {Array(i === 3 ? 2 : i === 1 ? 3 : 4).fill(0).map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Tabs Skeleton */}
      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="w-full h-auto p-1.5 bg-[#0a0a0a] border border-white/5 rounded-2xl grid grid-cols-2 gap-2">
          <TabsTrigger
            value="matches"
            className="h-12 rounded-xl font-semibold text-sm data-[state=active]:bg-[var(--team-primary)] data-[state=active]:text-black transition-all duration-300 flex items-center justify-center gap-2"
            disabled
          >
            <Calendar className="w-4 h-4" />
            <Skeleton className="h-4 w-16" />
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="h-12 rounded-xl font-semibold text-sm data-[state=active]:bg-[var(--team-primary)] data-[state=active]:text-black transition-all duration-300 flex items-center justify-center gap-2"
            disabled
          >
            <Users className="w-4 h-4" />
            <Skeleton className="h-4 w-14" />
          </TabsTrigger>
        </TabsList>

        {/* Matches Tab Skeleton */}
        <TabsContent value="matches" className="mt-6">
          <MatchesListSkeleton />
        </TabsContent>

        {/* Roster Tab Skeleton */}
        <TabsContent value="team" className="mt-6">
          <Card className="bg-[#0a0a0a] border-white/5 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div>
                  <Skeleton className="h-6 w-36 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Legend Skeleton */}
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                  <Skeleton className="h-5 w-32 mb-3" />
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="w-5 h-5 rounded" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Players Skeleton */}
                {['Goleiros', 'Defensores', 'Meio-campistas', 'Atacantes'].map((position, idx) => (
                  <div key={position}>
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                      {Array(idx === 0 ? 2 : 4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="w-72 h-[420px] rounded-xl" />
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