"use client"

import { useState, useEffect } from "react"
import PlayerCard from "./player-card"
import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { shuffle } from "@/lib/utils"
import type { Player, Team } from "@/types/kings-league"

interface FeaturedPlayersProps {
  teams: Team[]
}

export default function FeaturedPlayers({ teams }: FeaturedPlayersProps) {
  const [featuredPlayers, setFeaturedPlayers] = useState<Player[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Na montagem do componente, seleciona os jogadores destacados
    const getHighlightedPlayers = () => {
      const allPlayers: Player[] = []

      teams.forEach(team => {
        if (team.players && team.players.length) {
          team.players.forEach(player => {
            if (player) {
              // Adiciona referência ao time no objeto do jogador
              allPlayers.push({
                ...player,
                teamId: team.id,
                teamName: team.name,
                teamColors: {
                  primary: team.colors.primary,
                  secondary: team.colors.secondary
                }
              })
            }
          })
        }
      })

      // Embaralha e pega os 6 primeiros jogadores
      return shuffle(allPlayers).slice(0, 6)
    }

    setFeaturedPlayers(getHighlightedPlayers())
    setIsLoading(false)
  }, [teams])

  const filterPlayersByTeam = (teamId: string) => {
    setSelectedTeam(teamId)

    if (teamId === "all") {
      // Reembaralha todos os jogadores
      const allPlayers: Player[] = []
      teams.forEach(team => {
        if (team.players && team.players.length) {
          team.players.forEach(player => {
            if (player) {
              allPlayers.push({
                ...player,
                teamId: team.id,
                teamName: team.name,
                teamColors: {
                  primary: team.colors.primary,
                  secondary: team.colors.secondary
                }
              })
            }
          })
        }
      })
      setFeaturedPlayers(shuffle(allPlayers).slice(0, 6))
    } else {
      // Filtra jogadores do time selecionado
      const teamData = teams.find(t => t.id === teamId)
      if (teamData && teamData.players) {
        const teamPlayers = teamData.players.map(player => ({
          ...player,
          teamId: teamData.id,
          teamName: teamData.name,
          teamColors: {
            primary: teamData.colors.primary,
            secondary: teamData.colors.secondary
          }
        }))
        setFeaturedPlayers(shuffle(teamPlayers).slice(0, 6))
      }
    }
  }

  const refreshPlayers = () => {
    filterPlayersByTeam(selectedTeam)
  }

  if (isLoading) {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="w-full aspect-[3/5] bg-zinc-900 rounded-md"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Jogadores em Destaque</h2>
        <Button onClick={refreshPlayers} variant="outline" size="sm">
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 w-full h-auto flex flex-wrap overflow-x-auto">
          <TabsTrigger
            value="all"
            onClick={() => filterPlayersByTeam("all")}
          >
            Todos os Times
          </TabsTrigger>

          {teams.map((team) => (
            <TabsTrigger
              key={team.id}
              value={team.id}
              onClick={() => filterPlayersByTeam(team.id)}
              className="flex items-center gap-2"
            >
              {team.logo && (
                <span className="w-4 h-4 relative">
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="w-full h-full object-contain"
                  />
                </span>
              )}
              {team.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedTeam} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                teamColors={{
                  primary: player.teamColors?.primary || "#F4AF23",
                  secondary: player.teamColors?.secondary || "#000000"
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}