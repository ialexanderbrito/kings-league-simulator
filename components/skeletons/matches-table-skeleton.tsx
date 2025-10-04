import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function MatchesTableSkeleton() {
  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="border-b border-border pb-2">
        <div className="flex items-center gap-2 text-[var(--team-primary)]">
          <Calendar className="w-5 h-5" />
          <span className="text-lg font-medium text-foreground">Calendário e Resultados</span>
        </div>
        <p className="text-muted-foreground text-sm mt-1">Acompanhe as partidas e simule resultados</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4">
          <ScrollArea className="w-full pb-1">
            <div className="flex space-x-1 px-1 min-w-max pb-1">
              {Array(11).fill(0).map((_, i) => (
                <div key={i} className="flex-none">
                  <Skeleton className={`h-7 w-16 rounded-full ${i === 0 ? "bg-[var(--team-primary)]" : "bg-muted"}`} />
                </div>
              ))}
            </div>
            <ScrollBar
              orientation="horizontal"
              className="h-1.5 bg-transparent mt-1"
              thumbClassName="bg-[var(--team-primary)]/40"
            />
          </ScrollArea>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                <Skeleton className="h-3.5 w-32" />
              </div>

              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <div
                    key={i}
                    className="bg-muted/30 rounded-md p-3 border border-border hover:border-border/80 transition-colors"
                  >
                    <div className="grid grid-cols-[minmax(0,1.2fr),auto,minmax(0,1.2fr)] sm:grid-cols-[minmax(0,1.5fr),auto,minmax(0,1.5fr)] items-center gap-2 md:gap-4 w-full">
                      {/* Time da casa */}
                      <div className="flex items-center justify-end gap-1 sm:gap-2 min-w-0 mt-4">
                        <div className="flex-1 text-right overflow-hidden">
                          <Skeleton className="h-3.5 w-20 ml-auto mb-1" />
                          <Skeleton className="h-3 w-12 ml-auto hidden md:block" />
                        </div>
                        <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0" />
                      </div>

                      {/* Placar */}
                      <div className="flex flex-col items-center px-1 sm:px-2">
                        <Skeleton className="h-3 w-16 mb-1" />
                        <div className="flex items-center gap-1">
                          <Skeleton className="w-8 h-8 rounded" />
                          <span className="text-muted-foreground">:</span>
                          <Skeleton className="w-8 h-8 rounded" />
                        </div>
                      </div>

                      {/* Time visitante */}
                      <div className="flex items-center justify-start gap-1 sm:gap-2 mt-4">
                        <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0" />
                        <div className="flex-1 text-left overflow-hidden">
                          <Skeleton className="h-3.5 w-20 mb-1" />
                          <Skeleton className="h-3 w-12 hidden md:block" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}