"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ListOrdered } from "lucide-react"

export function TierListSkeleton() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header
        loading={true}
        selectedTeam={null}
        onTeamSelect={() => { }}
        setActiveTab={() => { }}
      />

      <div className="container mx-auto px-4 py-6 sm:py-10">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <ListOrdered className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Tier List
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                Arraste os times para criar seu ranking personalizado
              </p>
            </div>
          </div>
        </div>

        {/* Controls Skeleton */}
        <div className="mb-6 p-4 bg-gray-900 bg-opacity-50 rounded-lg border border-gray-800">
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            <Skeleton className="h-11 w-40 bg-gray-800" />
            <Skeleton className="h-11 w-32 bg-gray-800" />
            <Skeleton className="h-11 w-44 bg-gray-800" />
            <Skeleton className="h-11 w-48 bg-gray-800" />
          </div>
        </div>

        {/* Tier Rows Skeleton */}
        <div className="space-y-4 mb-8">
          {[1, 2, 3, 4, 5].map((i) => {
            // Número fixo de skeletons para cada tier para evitar hydration mismatch
            const skeletonCounts = [3, 2, 4, 2, 3]
            const count = skeletonCounts[i - 1] || 2
            return (
              <Card
                key={i}
                className="overflow-hidden border-l-8 border-gray-700"
                style={{ backgroundColor: 'rgba(17, 17, 17, 0.8)' }}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-lg bg-gray-700" />
                      <Skeleton className="h-8 w-40 bg-gray-700" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-full bg-gray-700" />
                  </div>

                  {/* Teams Grid */}
                  <div className="min-h-[120px] flex flex-wrap gap-2 p-2 rounded-lg bg-black bg-opacity-30">
                    {Array.from({ length: count }).map((_, j) => (
                      <Skeleton
                        key={j}
                        className="w-24 h-28 rounded-lg bg-gray-700"
                      />
                    ))}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Team Pool Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-48 bg-gray-800" />
            <Skeleton className="h-8 w-24 rounded-full bg-gray-800" />
          </div>

          <div className="min-h-[200px] p-6 rounded-lg border-2 border-dashed border-gray-700 bg-gray-900 bg-opacity-30">
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {[...Array(6)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-24 h-28 rounded-lg bg-gray-700"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
