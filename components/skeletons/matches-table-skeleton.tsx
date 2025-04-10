import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MatchesTableSkeleton() {
  return (
    <Card className="bg-[#1a1a1a] border-[#333] text-white">
      <CardHeader className="border-b border-[#333] bg-[#1f1f1f] py-3 px-4">
        <CardTitle className="text-lg flex items-center gap-2 text-gray-200">
          <Calendar className="w-4 h-4 text-[#F4AF23]" />
          <span>Calendário e Resultados</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex overflow-x-auto pb-2 space-x-1">
              {Array(11).fill(0).map((_, i) => (
                <div key={i} className="flex-none">
                  <Skeleton className="h-7 w-16 rounded" />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-[#252525] rounded-md p-3 border border-[#333]">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 sm:flex-auto">
                        <Skeleton className="h-3.5 w-20 mb-1" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 my-2">
                      <Skeleton className="h-6 w-6" />
                      <Skeleton className="h-5 w-10" />
                      <Skeleton className="h-6 w-6" />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="flex-1 sm:flex-auto order-2 sm:order-1 text-right">
                        <Skeleton className="h-3.5 w-20 mb-1 ml-auto" />
                        <Skeleton className="h-3 w-12 ml-auto" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full order-1 sm:order-2" />
                    </div>
                  </div>

                  <div className="mt-2 flex justify-center">
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}