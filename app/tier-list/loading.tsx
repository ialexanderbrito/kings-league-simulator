import { TierListSkeleton } from "@/components/skeletons/tier-list-skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center">
      <TierListSkeleton />
    </div>
  )
}
