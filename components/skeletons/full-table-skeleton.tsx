import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function FullTableSkeleton() {
  return (
    <div className="space-y-8">
      <div className="bg-card rounded-lg">
        <div className="w-full overflow-x-hidden">
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow className="border-b border-border bg-transparent">
                <TableHead className="w-12 text-center text-xs text-muted-foreground font-normal py-3">P</TableHead>
                <TableHead className="w-8 px-0"></TableHead>
                <TableHead className="text-xs text-muted-foreground font-normal py-3">TIME</TableHead>
                <TableHead className="text-center text-xs text-muted-foreground font-normal w-20 py-3">V - D</TableHead>
                <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden md:table-cell">GP</TableHead>
                <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden md:table-cell">GC</TableHead>
                <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden md:table-cell">SG</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(10).fill(0).map((_, index) => (
                <TableRow
                  key={index}
                  className="cursor-pointer transition-colors hover:bg-muted/50 border-b border-border"
                >
                  {/* Position */}
                  <TableCell className="text-center font-medium py-2 w-12">
                    {index === 0 ? (
                      <Skeleton className="mx-auto w-6 h-6 rounded-full bg-emerald-500/20" />
                    ) : index < 7 ? (
                      <Skeleton className="mx-auto w-6 h-6 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--team-primary) 20%, transparent)' }} />
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

                  {/* Wins and losses (V - D) */}
                  <TableCell className="text-center py-2 w-20">
                    <Skeleton className="h-3 w-4 mx-auto" />
                  </TableCell>

                  {/* Goals For (GP) - hidden md */}
                  <TableCell className="text-center py-2 w-12 hidden md:table-cell">
                    <Skeleton className="h-3 w-4 mx-auto" />
                  </TableCell>

                  {/* Goals Against (GC) - hidden md */}
                  <TableCell className="text-center py-2 w-12 hidden md:table-cell">
                    <Skeleton className="h-3 w-4 mx-auto" />
                  </TableCell>

                  {/* Goal Difference (SG) - hidden md */}
                  <TableCell className="text-center py-2 w-12 hidden md:table-cell">
                    <Skeleton className="h-3 w-4 mx-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
