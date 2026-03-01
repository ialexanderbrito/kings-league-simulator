import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function FullTableSkeleton() {
  return (
    <div className="space-y-8">
      {/* Simulates 2 groups */}
      {Array(2).fill(0).map((_, groupIndex) => (
        <div key={groupIndex}>
          <div className="flex items-center justify-between mb-2 px-4">
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="bg-card rounded-lg">
            <div className="w-full overflow-x-hidden">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="border-b border-border bg-transparent">
                    <TableHead className="w-12 text-center text-xs text-muted-foreground font-normal py-3">P</TableHead>
                    <TableHead className="w-8 px-0"></TableHead>
                    <TableHead className="text-xs text-muted-foreground font-normal py-3">TIME</TableHead>
                    <TableHead className="text-center text-xs text-muted-foreground font-normal w-16 py-3">PTS</TableHead>
                    <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden sm:table-cell">J</TableHead>
                    <TableHead className="text-center text-xs text-muted-foreground font-normal w-10 py-3">V</TableHead>
                    <TableHead className="text-center text-xs text-muted-foreground font-normal w-10 py-3 hidden sm:table-cell">VP</TableHead>
                    <TableHead className="text-center text-xs text-muted-foreground font-normal w-10 py-3 hidden sm:table-cell">DP</TableHead>
                    <TableHead className="text-center text-xs text-muted-foreground font-normal w-10 py-3">D</TableHead>
                    <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden md:table-cell">GP</TableHead>
                    <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden md:table-cell">GC</TableHead>
                    <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden md:table-cell">SG</TableHead>
                    <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3">SC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array(6).fill(0).map((_, index) => (
                    <TableRow
                      key={index}
                      className="cursor-pointer transition-colors hover:bg-muted/50 border-b border-border"
                    >
                      {/* Position */}
                      <TableCell className="text-center font-medium py-2 w-12">
                        {index === 0 ? (
                          <Skeleton className="mx-auto w-6 h-6 rounded-full bg-emerald-500/20" />
                        ) : index < 7 ? (
                          <Skeleton className="mx-auto w-6 h-6 rounded-full bg-[#F4AF23]/20" />
                        ) : (
                          <Skeleton className="mx-auto w-4 h-4" />
                        )}
                      </TableCell>

                      {/* Favorite icon column */}
                      <TableCell className="w-8 px-0"></TableCell>

                      {/* Team name */}
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
                          <Skeleton className="h-4 w-24 sm:w-32" />
                        </div>
                      </TableCell>

                      {/* Points */}
                      <TableCell className="text-center py-2 w-16">
                        <Skeleton className="h-4 w-6 mx-auto bg-[#F4AF23]/20" />
                      </TableCell>

                      {/* Games Played - hidden sm */}
                      <TableCell className="text-center py-2 w-12 hidden sm:table-cell">
                        <Skeleton className="h-3 w-4 mx-auto" />
                      </TableCell>

                      {/* Wins */}
                      <TableCell className="text-center py-2 w-10">
                        <Skeleton className="h-3 w-4 mx-auto" />
                      </TableCell>

                      {/* Penalty Wins - hidden sm */}
                      <TableCell className="text-center py-2 w-10 hidden sm:table-cell">
                        <Skeleton className="h-3 w-4 mx-auto" />
                      </TableCell>

                      {/* Penalty Losses - hidden sm */}
                      <TableCell className="text-center py-2 w-10 hidden sm:table-cell">
                        <Skeleton className="h-3 w-4 mx-auto" />
                      </TableCell>

                      {/* Losses */}
                      <TableCell className="text-center py-2 w-10">
                        <Skeleton className="h-3 w-4 mx-auto" />
                      </TableCell>

                      {/* Goals For - hidden md */}
                      <TableCell className="text-center py-2 w-12 hidden md:table-cell">
                        <Skeleton className="h-3 w-4 mx-auto" />
                      </TableCell>

                      {/* Goals Against - hidden md */}
                      <TableCell className="text-center py-2 w-12 hidden md:table-cell">
                        <Skeleton className="h-3 w-4 mx-auto" />
                      </TableCell>

                      {/* Goal Difference - hidden md */}
                      <TableCell className="text-center py-2 w-12 hidden md:table-cell">
                        <Skeleton className="h-3 w-4 mx-auto" />
                      </TableCell>

                      {/* SC (Super Challenge) */}
                      <TableCell className="text-center py-2 w-12">
                        <Skeleton className="h-3 w-4 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}