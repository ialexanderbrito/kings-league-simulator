import { TeamLoading } from "@/components/team/team-loading"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#030303]">
      <div className="container mx-auto px-4 py-8">
        <TeamLoading />
      </div>
    </div>
  )
}
