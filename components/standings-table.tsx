"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { TeamStanding } from "@/types/kings-league"
import { ChevronsDown, ChevronsUp, Download, Heart } from "lucide-react"
import html2canvas from "html2canvas"
import { useRef } from "react"
import { useTeamTheme } from "@/contexts/team-theme-context"
import { cn } from "@/lib/utils"

interface StandingsTableProps {
  standings: TeamStanding[]
  onTeamSelect: (teamId: string) => void
  previousStandings?: TeamStanding[]
}

export default function StandingsTable({ standings, onTeamSelect, previousStandings }: StandingsTableProps) {
  const tableRef = useRef<HTMLDivElement>(null)
  const { primaryColor, favoriteTeam } = useTeamTheme()

  const downloadClassification = async () => {
    if (!tableRef.current) return

    const element = tableRef.current

    // Criando um clone do elemento para manipulação
    const clone = element.cloneNode(true) as HTMLElement
    clone.style.backgroundColor = '#121212'
    clone.style.padding = '16px'
    clone.style.width = '400px'
    clone.style.height = '580px' // Definindo altura fixa
    clone.style.borderRadius = '12px'
    clone.style.position = 'fixed'
    clone.style.left = '-9999px'
    clone.style.top = '0'
    document.body.appendChild(clone)

    try {
      const canvas = await html2canvas(clone, {
        backgroundColor: '#121212',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Ajustando estilos no clone para garantir alinhamento correto
          const rows = clonedDoc.querySelectorAll('tr')
          rows.forEach(row => {
            const cells = row.querySelectorAll('td, th')
            cells.forEach(cell => {
              if (cell instanceof HTMLElement) {
                cell.style.padding = '8px 6px'
                cell.style.verticalAlign = 'middle'
                cell.style.whiteSpace = 'normal'
                cell.style.height = '48px' // Altura fixa para as células
                cell.style.lineHeight = '1'
              }
            })
          })

          // Ajustando posições nos círculos
          const positions = clonedDoc.querySelectorAll('.rounded-full')
          positions.forEach(pos => {
            if (pos instanceof HTMLElement) {
              pos.style.width = '24px'
              pos.style.height = '24px'
              pos.style.display = 'inline-flex'
              pos.style.alignItems = 'center'
              pos.style.justifyContent = 'center'
              pos.style.margin = '0'
              pos.style.padding = '0'
              pos.style.fontSize = '12px'
              pos.style.lineHeight = '1'
              pos.style.textAlign = 'center'
            }
          })

          // Ajustando nomes dos times para evitar cortes e alinhar com o logo
          const teamContainers = clonedDoc.querySelectorAll('.team-container')
          teamContainers.forEach(container => {
            if (container instanceof HTMLElement) {
              container.style.display = 'flex'
              container.style.alignItems = 'center'
              container.style.gap = '8px'
              container.style.minWidth = '0'
              container.style.width = '100%'
              container.style.maxWidth = '220px'
            }
          })

          // Ajustando logos dos times
          const logos = clonedDoc.querySelectorAll('.team-logo')
          logos.forEach(logo => {
            if (logo instanceof HTMLElement) {
              logo.style.width = '24px'
              logo.style.height = '24px'
              logo.style.flexShrink = '0'
              logo.style.display = 'flex'
              logo.style.alignItems = 'center'
              logo.style.justifyContent = 'center'
              logo.style.marginRight = '8px'
            }
          })

          // Ajustando os textos dos nomes dos times
          const teamNames = clonedDoc.querySelectorAll('.team-container span')
          teamNames.forEach(name => {
            if (name instanceof HTMLElement) {
              name.style.whiteSpace = 'nowrap'
              name.style.overflow = 'hidden'
              name.style.textOverflow = 'ellipsis'
              name.style.fontSize = '12px'
              name.style.lineHeight = '1'
              name.style.textAlign = 'left'
            }
          })

          // Ajustando os textos nas células
          const cells = clonedDoc.querySelectorAll('td')
          cells.forEach(cell => {
            if (cell instanceof HTMLElement) {
              cell.style.textAlign = 'center'
              cell.style.verticalAlign = 'middle'
              cell.style.padding = '8px 4px'
              cell.style.lineHeight = '1'
            }
          })

          // Ajustando cabeçalhos
          const headers = clonedDoc.querySelectorAll('th')
          headers.forEach(header => {
            if (header instanceof HTMLElement) {
              header.style.textAlign = 'center'
              header.style.padding = '12px 4px'
              header.style.verticalAlign = 'middle'
              header.style.lineHeight = '1'
            }
          })
        }
      })

      // Criar um novo canvas com tamanho fixo
      const watermarkedCanvas = document.createElement('canvas')
      const ctx = watermarkedCanvas.getContext('2d')
      if (!ctx) return

      // Configurar o tamanho do canvas com a marca d'água
      watermarkedCanvas.width = 400
      watermarkedCanvas.height = 580

      // Desenhar o fundo
      ctx.fillStyle = '#121212'
      ctx.fillRect(0, 0, watermarkedCanvas.width, watermarkedCanvas.height)

      // Desenhar a tabela centralizada
      const scale = Math.min(400 / canvas.width, 580 / canvas.height)
      const x = (400 - canvas.width * scale) / 2
      const y = (580 - canvas.height * scale) / 2
      ctx.drawImage(canvas, x, y, canvas.width * scale, canvas.height * scale)

      // Adicionar a marca d'água com fonte menor
      ctx.fillStyle = '#666666'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('kings-league-simulator.vercel.app', watermarkedCanvas.width / 2, 560)

      // Converter para URL e fazer download
      const url = watermarkedCanvas.toDataURL('image/png', 1.0)
      const link = document.createElement('a')
      link.download = 'kings-league-classificacao.png'
      link.href = url
      link.click()
    } finally {
      document.body.removeChild(clone)
    }
  }

  // Função para determinar a cor de fundo baseada na posição
  const getPositionStyle = (standing: TeamStanding, index: number) => {
    if (index === 0) {
      // Primeiro colocado - semifinal
      return { backgroundColor: "#4ade80", color: "white" }
    } else if (index >= 1 && index <= 6) {
      // 2º ao 7º - quartas de final
      return { backgroundColor: "var(--team-primary)", color: "black" }
    }
    return {}
  }

  // Função para determinar a mudança de posição
  const getPositionChange = (team: TeamStanding, currentIndex: number) => {
    // Verificar se temos classificação anterior para comparar
    if (!previousStandings || previousStandings.length === 0) return null

    const previousIndex = previousStandings.findIndex((t) => t.id === team.id)
    if (previousIndex === -1) return null

    const change = previousIndex - currentIndex // Invertemos a lógica aqui
    if (change === 0) return null

    return {
      value: Math.abs(change),
      direction: change > 0 ? "up" : "down", // Se a diferença é positiva, o time subiu
    }
  }

  // Verificar se o time atual é o time favorito do usuário
  const isFavoriteTeam = (teamId: string) => {
    return favoriteTeam?.id === teamId
  }

  return (
    <>
      <div className="space-y-4">
        <div className="w-full" ref={tableRef}>
          <div className="bg-[#121212] rounded-lg">
            <div className="w-full overflow-x-hidden">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="border-b border-[#333] bg-transparent">
                    <TableHead className="w-12 text-center text-xs text-gray-400 font-normal py-3">P</TableHead>
                    <TableHead className="w-8 px-0"></TableHead>
                    <TableHead className="text-xs text-gray-400 font-normal py-3">TIME</TableHead>
                    <TableHead className="text-center text-xs text-gray-400 font-normal w-16 py-3">PTS</TableHead>
                    <TableHead className="text-center text-xs text-gray-400 font-normal w-12 py-3 hidden sm:table-cell">J</TableHead>
                    <TableHead className="text-center text-xs text-gray-400 font-normal w-12 py-3 hidden sm:table-cell">SG</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.map((team, index) => {
                    const positionStyle = getPositionStyle(team, index)
                    const positionChange = getPositionChange(team, index)
                    const isTeamFavorite = isFavoriteTeam(team.id)

                    return (
                      <TableRow
                        key={team.id}
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-[#1f1f1f] border-b border-[#333]",
                          isTeamFavorite && "hover:bg-[var(--team-primary)] hover:bg-opacity-20"
                        )}
                        onClick={() => onTeamSelect(team.id)}
                      >
                        <TableCell className="text-center font-medium py-2 w-12">
                          <div className="flex items-center justify-center h-full">
                            <Badge
                              style={positionStyle}
                              className="w-6 h-6 flex items-center justify-center p-0 text-xs font-medium rounded-full"
                            >
                              {index + 1}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="w-8 px-0">
                          {positionChange && (
                            <div className="flex items-center justify-center h-full">
                              {positionChange.direction === "up" ? (
                                <ChevronsUp className="w-3 h-3 text-green-400" />
                              ) : (
                                <ChevronsDown className="w-3 h-3 text-red-400" />
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="team-container flex items-center gap-2 min-w-0 max-w-[180px] sm:max-w-full">
                            {team.logo && (
                              <div className="team-logo w-6 h-6 flex-shrink-0 flex items-center justify-center">
                                <img
                                  src={team.logo.url || "/placeholder.svg"}
                                  alt={team.name}
                                  width={24}
                                  height={24}
                                  className="object-contain"
                                />
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <span
                                className="font-medium text-xs truncate"
                                title={team.name} // Tooltip nativo para mostrar nome completo
                              >
                                {team.name}
                              </span>
                              {isTeamFavorite && (
                                <Heart className="w-3 h-3 text-red-400 flex-shrink-0" fill="currentColor" />
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-[var(--team-primary)] text-sm py-2 w-16">{team.points}</TableCell>
                        <TableCell className="text-center text-xs text-gray-300 py-2 hidden sm:table-cell w-12">{team.played}</TableCell>
                        <TableCell className="text-center text-xs text-gray-300 py-2 hidden sm:table-cell w-12">{team.goalDifference}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 px-2 py-2">
          <div className="text-xs text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5">
              <Badge style={{ backgroundColor: "#4ade80" }} className="w-2.5 h-2.5 p-0 rounded-full shadow-sm"></Badge>
              <span>Playoff: Semifinal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge style={{ backgroundColor: "var(--team-primary)" }} className="w-2.5 h-2.5 p-0 rounded-full shadow-sm"></Badge>
              <span>
                Playoff: Quartas
              </span>
            </div>
            {favoriteTeam && (
              <div className="flex items-center gap-1.5">
                <Heart className="w-2.5 h-2.5 text-red-400 flex-shrink-0" fill="currentColor" />
                <span>Seu time do coração</span>
              </div>
            )}
          </div>

          {/* <Button
            variant="outline"
            className="text-xs gap-2 border-[#333] hover:bg-[#1f1f1f] text-gray-300"
            onClick={downloadClassification}
          >
            <Download className="w-4 h-4" />
            Baixar Classificação
          </Button> */}
        </div>
      </div>
    </>
  )
}
