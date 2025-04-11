import { Skeleton } from "@/components/ui/skeleton"

export function PlayerCardSkeleton() {
  // Simulamos um card médio/padrão
  const cardStyle = {
    borderColor: "#333",
    headerBg: "bg-gradient-to-r from-zinc-700 to-zinc-900",
    ratingBg: "bg-zinc-700",
    ratingText: "text-white",
    imageBg: "bg-gradient-to-b from-zinc-700/30 to-zinc-900/20"
  }

  return (
    <div className="group relative h-full w-72" style={{ minHeight: '420px' }}>
      <div
        className="h-full rounded-lg overflow-hidden border transition-all duration-300 shadow-lg"
        style={{ borderColor: cardStyle.borderColor, borderWidth: "2px" }}
      >
        <div className={`p-3 ${cardStyle.headerBg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${cardStyle.ratingBg} ${cardStyle.ratingText} font-bold text-xl`}>
                <Skeleton className="h-6 w-6" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-4 w-8 rounded-sm" />
                  <Skeleton className="h-3 w-6" />
                </div>
              </div>
            </div>

            <Skeleton className="w-10 h-4 rounded-full" />
          </div>
        </div>

        <div className={`relative h-48 ${cardStyle.imageBg} flex items-center justify-center`}>
          <Skeleton className="h-40 w-32" />
        </div>

        <div className="p-3 bg-[#1a1a1a]">
          <div className="flex justify-end mb-2">
            <Skeleton className="h-6 w-24 rounded" />
          </div>

          <div className="mb-3 pb-3 border-b border-[#333]">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-gray-400">Idade</div>
                <Skeleton className="h-3 w-10 mt-1" />
              </div>
              <div>
                <div className="text-gray-400">Altura</div>
                <Skeleton className="h-3 w-12 mt-1" />
              </div>
              <div>
                <div className="text-gray-400">Posição</div>
                <Skeleton className="h-3 w-14 mt-1" />
              </div>
            </div>
          </div>

          {/* Simulando atributos ou estatísticas */}
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="mb-1 last:mb-0">
                <div className="flex justify-between text-xs text-gray-300 mb-0.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-6" />
                </div>
                <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
                  <Skeleton className="h-full rounded-full" style={{ width: `${60 + Math.random() * 30}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}