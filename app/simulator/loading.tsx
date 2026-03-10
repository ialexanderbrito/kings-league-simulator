import { MatchesTableSkeleton } from "@/components/skeletons/matches-table-skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center">
      <MatchesTableSkeleton />
    </div>
  )
}
