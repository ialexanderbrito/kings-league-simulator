import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"


export function StandingsTableSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--team-primary)]">Classificação</h2>
        <Skeleton className="h-8 w-28 hidden sm:block" />
      </div>

      <div className="bg-card rounded-lg">
        <div className="w-full overflow-x-auto">
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow className="border-b border-border bg-transparent">
                <TableHead className="w-12 text-center text-xs text-muted-foreground font-normal py-3">P</TableHead>
                <TableHead className="w-8 px-0"></TableHead>
                <TableHead className="text-xs text-muted-foreground font-normal py-3">TIME</TableHead>
                <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3">PTS</TableHead>
                <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden sm:table-cell">PJ</TableHead>
                <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden sm:table-cell">V</TableHead>
                <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden sm:table-cell">VP</TableHead>
                <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden sm:table-cell">DP</TableHead>
                <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden sm:table-cell">D</TableHead>
                <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden md:table-cell">GP</TableHead>
                <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden md:table-cell">GC</TableHead>
                <TableHead className="text-center text-xs text-muted-foreground font-normal w-12 py-3 hidden md:table-cell">SG</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(12).fill(0).map((_, index) => (
                <TableRow key={index} className="cursor-pointer transition-colors hover:bg-muted/50 border-b border-border">
                  <TableCell className="text-center font-medium py-2 w-12">
                    <div className="flex items-center justify-center h-full">
                      <Badge
                        className="w-6 h-6 flex items-center justify-center p-0 text-xs font-medium rounded-full"
                        style={index === 0 ? { backgroundColor: "#22c55e", color: "white" } : index >= 1 && index <= 6 ? { backgroundColor: "#F4AF23", color: "black" } : {}}
                      >
                        <Skeleton className="h-3 w-3 bg-current" />
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell className="w-8 px-0"></TableCell>

                  <TableCell className="py-2">
                    <div className="flex items-center gap-2 min-w-0 max-w-[180px] sm:max-w-full">
                      <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                      <Skeleton className="h-4 w-28 flex-1" />
                    </div>
                  </TableCell>

                  <TableCell className="text-center font-bold text-[#F4AF23] text-sm py-2 w-12">
                    <Skeleton className="h-4 w-4 mx-auto" />
                  </TableCell>

                  <TableCell className="text-center text-xs text-foreground py-2 hidden sm:table-cell w-12">
                    <Skeleton className="h-3 w-3 mx-auto" />
                  </TableCell>

                  <TableCell className="text-center text-xs text-foreground py-2 hidden sm:table-cell w-12">
                    <Skeleton className="h-3 w-3 mx-auto" />
                  </TableCell>

                  <TableCell className="text-center text-xs text-foreground py-2 hidden sm:table-cell w-12">
                    <Skeleton className="h-3 w-3 mx-auto" />
                  </TableCell>

                  <TableCell className="text-center text-xs text-foreground py-2 hidden sm:table-cell w-12">
                    <Skeleton className="h-3 w-3 mx-auto" />
                  </TableCell>

                  <TableCell className="text-center text-xs text-foreground py-2 hidden sm:table-cell w-12">
                    <Skeleton className="h-3 w-3 mx-auto" />
                  </TableCell>

                  <TableCell className="text-center text-xs text-foreground py-2 hidden md:table-cell w-12">
                    <Skeleton className="h-3 w-3 mx-auto" />
                  </TableCell>

                  <TableCell className="text-center text-xs text-foreground py-2 hidden md:table-cell w-12">
                    <Skeleton className="h-3 w-3 mx-auto" />
                  </TableCell>

                  <TableCell className="text-center text-xs text-foreground py-2 hidden md:table-cell w-12">
                    <Skeleton className="h-3 w-3 mx-auto" />
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