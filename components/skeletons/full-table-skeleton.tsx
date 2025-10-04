import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TableIcon } from "lucide-react"

export function FullTableSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <Card className="bg-card border-border shadow-lg mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2 text-foreground">
              <TableIcon className="w-5 h-5 text-[var(--team-primary)]" />
              <Skeleton className="h-6 w-40" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="border-b border-border bg-muted/30">
                      <TableHead className="w-12 text-center text-xs text-muted-foreground font-normal">P</TableHead>
                      <TableHead className="w-8 px-0"></TableHead>
                      <TableHead className="text-xs text-muted-foreground font-normal">TIME</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-12">PTS</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-12">PJ</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-12">V</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-12">VP</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-12">DP</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-12">D</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-12">GP</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-12">GC</TableHead>
                      <TableHead className="text-center text-xs text-muted-foreground font-normal w-12">SG</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array(12).fill(0).map((_, index) => (
                      <TableRow
                        key={index}
                        className="cursor-pointer transition-colors hover:bg-muted/50 border-b border-border"
                      >
                        {/* Posição */}
                        <TableCell className="font-medium text-center py-2">
                          <div className="flex flex-col items-center justify-center">
                            <div className="flex items-center mb-0.5">
                              <Badge
                                className="w-6 h-6 flex items-center justify-center p-0 text-xs font-medium rounded-full"
                                style={index === 0 ? { backgroundColor: "#4ade80", color: "white" } :
                                  index >= 1 && index <= 6 ? { backgroundColor: "#F4AF23", color: "black" } : {}}
                              >
                                <Skeleton className="h-3 w-3 bg-gray-500" />
                              </Badge>
                            </div>
                          </div>
                        </TableCell>

                        {/* Ícone favorito */}
                        <TableCell className="py-2 w-8 px-1"></TableCell>

                        {/* Nome do time */}
                        <TableCell className="py-2">
                          <div className="team-container flex items-center gap-2 min-w-0">
                            <Skeleton className="w-6 h-6 rounded-full" />
                            <Skeleton className="h-4 w-24 sm:w-36" />
                          </div>
                        </TableCell>

                        {/* Pontos */}
                        <TableCell className="text-center font-bold text-[var(--team-primary)] text-sm py-2 w-12">
                          <Skeleton className="h-4 w-4 mx-auto" />
                        </TableCell>

                        {/* Partidas Jogadas */}
                        <TableCell className="text-center text-xs text-foreground py-2 w-12">
                          <Skeleton className="h-3 w-3 mx-auto" />
                        </TableCell>

                        {/* Vitórias no tempo normal */}
                        <TableCell className="text-center text-xs text-foreground py-2 w-12">
                          <Skeleton className="h-3 w-3 mx-auto" />
                        </TableCell>

                        {/* Vitórias nos Pênaltis */}
                        <TableCell className="text-center text-xs text-foreground py-2 w-12">
                          <Skeleton className="h-3 w-3 mx-auto" />
                        </TableCell>

                        {/* Derrotas nos Pênaltis */}
                        <TableCell className="text-center text-xs text-foreground py-2 w-12">
                          <Skeleton className="h-3 w-3 mx-auto" />
                        </TableCell>

                        {/* Derrotas */}
                        <TableCell className="text-center text-xs text-foreground py-2 w-12">
                          <Skeleton className="h-3 w-3 mx-auto" />
                        </TableCell>

                        {/* Gols Pró */}
                        <TableCell className="text-center text-xs text-foreground py-2 w-12">
                          <Skeleton className="h-3 w-3 mx-auto" />
                        </TableCell>

                        {/* Gols Contra */}
                        <TableCell className="text-center text-xs text-foreground py-2 w-12">
                          <Skeleton className="h-3 w-3 mx-auto" />
                        </TableCell>

                        {/* Saldo de Gols */}
                        <TableCell className="text-center text-xs text-foreground py-2 w-12">
                          <Skeleton className="h-3 w-3 mx-auto" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2">
                <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-center gap-1.5">
                    <Badge style={{ backgroundColor: "#22c55e" }} className="w-2.5 h-2.5 p-0 rounded-full shadow-sm"></Badge>
                    <span>Playoff: Semifinal</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge style={{ backgroundColor: "#F4AF23" }} className="w-2.5 h-2.5 p-0 rounded-full shadow-sm"></Badge>
                    <span>Playoff: Quartas</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <div className="space-y-2">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}