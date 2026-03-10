import { StandingsTableSkeleton } from "@/components/skeletons/standings-table-skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center">
      <StandingsTableSkeleton />
    </div>
  )
}
