import { TeamsGridSkeleton } from "@/components/skeletons/teams-grid-skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        <TeamsGridSkeleton />
      </div>
    </div>
  )
}
