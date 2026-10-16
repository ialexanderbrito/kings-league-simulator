"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useLeague } from "@/contexts/league-context"
import { useLocale } from "@/contexts/locale-context"
import { Pitch } from "@/components/simulator-12a0/Pitch"
import { Challenge } from "@/components/simulator-12a0/DiceRoll"
import { TeamRoster } from "@/components/simulator-12a0/TeamRoster"
import { formations, Formation } from "@/lib/data/7a0-formations"
import { Player } from "@/types/kings-league"
import { getPlayerOverall, getPlayerPhotoUrl, getProxyImageUrl, cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CampaignUI } from "@/components/simulator-12a0/CampaignUI"
import { SimulatedTeam } from "@/lib/match-simulator"
import { useToast } from "@/hooks/use-toast"
import { fetchLeagueData } from "@/lib/fetch-league-data"
import {
  Trophy,
  RotateCcw,
  Shield,
  Swords,
  Sparkles,
  Dices,
  CheckCircle2,
  ArrowRight,
  Loader2
} from "lucide-react"
import KingsLeagueLogo from "@/components/kings-league-logo"

const GENERIC_LOGOS = [
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgc3Ryb2tlPSd3aGl0ZScgc3Ryb2tlLXdpZHRoPScxLjUnIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCc+PHBhdGggZmlsbD0ncmdiYSgyNTUsMjU1LDI1NSwwLjE1KScgZD0nTTEyIDIyQzYgMjIgMyAxNiAzIDEwVjRsOS0yIDkgMnY2YzAgNi0zIDEyLTkgMTJ6Jy8+PHBhdGggZmlsbD0nbm9uZScgZD0nTTEyIDE5LjVjLTQgMC01LjUtNC01LjUtOFY1LjVsNS41LTEuNSA1LjUgMS41djZjMCA0LTEuNSA4LTUuNSA4eicgc3Ryb2tlLXdpZHRoPScxJy8+PC9zdmc+",
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgc3Ryb2tlPSd3aGl0ZScgc3Ryb2tlLXdpZHRoPScxLjUnIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCc+PHBhdGggZmlsbD0ncmdiYSgyNTUsMjU1LDI1NSwwLjE1KScgZD0nTTQgMmgxNnYxMGMwIDYtOCAxMC04IDEwcy04LTQtOC0xMFYyeicvPjxwYXRoIGZpbGw9J25vbmUnIGQ9J002IDRoMTJ2OGMwIDQuNS02IDcuNS02IDcuNVM2IDE2LjUgNiAxMlY0eicgc3Ryb2tlLXdpZHRoPScxJy8+PC9zdmc+",
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgc3Ryb2tlPSd3aGl0ZScgc3Ryb2tlLXdpZHRoPScxLjUnIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCc+PHBhdGggZmlsbD0ncmdiYSgyNTUsMjU1LDI1NSwwLjE1KScgZD0nTTEyIDJsMTAgNXY3bC0xMCA4LTEwLThWN2wxMC01eicvPjxwYXRoIGZpbGw9J25vbmUnIGQ9J00xMiA0LjVsNy41IDMuNXY1LjVsLTcuNSA2LTcuNS02VjhsNy41LTMuNXonIHN0cm9rZS13aWR0aD0nMScvPjwvc3ZnPg==",
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgc3Ryb2tlPSd3aGl0ZScgc3Ryb2tlLXdpZHRoPScxLjUnIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCc+PGNpcmNsZSBmaWxsPSdyZ2JhKDI1NSwyNTUsMjU1LDAuMTUpJyBjeD0nMTInIGN5PScxMicgcj0nMTAnLz48Y2lyY2xlIGZpbGw9J25vbmUnIGN4PScxMicgY3k9JzEyJyByPSc3JyBzdHJva2Utd2lkdGg9JzEnLz48Y2lyY2xlIGZpbGw9J25vbmUnIGN4PScxMicgY3k9JzEyJyByPSc0JyBzdHJva2Utd2lkdGg9JzEnLz48L3N2Zz4=",
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgc3Ryb2tlPSd3aGl0ZScgc3Ryb2tlLXdpZHRoPScxLjUnIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCc+PHBhdGggZmlsbD0ncmdiYSgyNTUsMjU1LDI1NSwwLjE1KScgZD0nTTEyIDJjNCAwIDggMyA4IDN2OGMwIDUtOCA5LTggOXMtOC00LTgtOVY1YzAgMCA0LTMgOC0zeicvPjxwYXRoIGZpbGw9J25vbmUnIGQ9J00xMiA0LjVjMyAwIDUuNSAyIDUuNSAydjYuNWMwIDMuNS01LjUgNi41LTUuNSA2LjVzLTUuNS0zLTUuNS02LjV2LTYuNWMwIDAgMi41LTIgNS41LTJ6JyBzdHJva2Utd2lkdGg9JzEnLz48L3N2Zz4=",
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgc3Ryb2tlPSd3aGl0ZScgc3Ryb2tlLXdpZHRoPScxLjUnIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCc+PHBhdGggZmlsbD0ncmdiYSgyNTUsMjU1LDI1NSwwLjE1KScgZD0nTTQgMmgxNnYxMVEyMCAxOCAxMiAyMlE0IDE4IDQgMTFaJy8+PHBhdGggZmlsbD0nbm9uZScgZD0nTTYgNGgxMnY5UTE4IDE2IDEyIDE5LjVRNiAxNiA2IDlaJyBzdHJva2Utd2lkdGg9JzEnLz48L3N2Zz4="
];

type PlayStyle = "Defensivo" | "Equilibrado" | "Ofensivo"
type Difficulty = "Clássico" | "Lendas"
type GamePhase = "draft" | "simulation" | "finished"

export default function DozeAZeroPage() {
  const { selectedLeague, setLeague } = useLeague()
  const { t, locale } = useLocale()
  const { toast } = useToast()
  const [gamePhase, setGamePhase] = useState<GamePhase>("draft")
  const [formation, setFormation] = useState<Formation>(formations[0])
  const [playStyle, setPlayStyle] = useState<PlayStyle>("Equilibrado")
  const [difficulty, setDifficulty] = useState<Difficulty>("Clássico")

  const styleLabels: Record<PlayStyle, string> = {
    "Defensivo": t.page.campaign.styleDefensive,
    "Equilibrado": t.page.campaign.styleBalanced,
    "Ofensivo": t.page.campaign.styleOffensive,
  }
  const diffLabels: Record<Difficulty, string> = {
    "Clássico": t.page.campaign.diffClassic,
    "Lendas": t.page.campaign.diffLegends,
  }

  if (selectedLeague.id !== "brazil") {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
        <Header loading={false} />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 text-center space-y-4 backdrop-blur-xl shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto text-amber-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{t.ui.exclusive12a0}</h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {t.ui.onlyBrazil}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <Button
                onClick={() => setLeague("brazil")}
                className="w-full bg-[var(--team-primary,#F4AF23)] hover:bg-[var(--team-primary,#F4AF23)]/90 text-black font-bold text-xs rounded-xl"
              >
                {t.ui.switchBrazil}
              </Button>
              <Link
                href="/simulator"
                className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
              >
                {t.ui.goSimulator}
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const [activeSlotId, setActiveSlotId] = useState<string | null>(null)
  const [activePlayerToPlace, setActivePlayerToPlace] = useState<Player | null>(null)
  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, Player | null>>({})

  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinChallenge, setSpinChallenge] = useState<Challenge | null>(null)
  const [rollsLeft, setRollsLeft] = useState<number>(3)
  const [drawnChallenges, setDrawnChallenges] = useState<string[]>([])

  useEffect(() => {
    const hasStarted = Object.values(selectedPlayers).filter(Boolean).length > 0
    if (!hasStarted) {
      setRollsLeft(difficulty === "Clássico" ? 3 : 1)
    }
  }, [difficulty, selectedPlayers])

  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [teamDetailsCache, setTeamDetailsCache] = useState<Record<string, any>>({})
  const [validPlayers, setValidPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  // Estados de Simulação
  const [campaignData, setCampaignData] = useState<{ userTeam: SimulatedTeam, otherTeams: SimulatedTeam[] } | null>(null)
  const [teamNameInput, setTeamNameInput] = useState<string>("")
  const [presidentNameInput, setPresidentNameInput] = useState<string>("")
  const [selectedLogoIndex, setSelectedLogoIndex] = useState<number>(0)

  const getTeamDisplayData = (originalName: string, comp: string): { name: string, presidents?: string, overrideTeamId?: string, overrideSeasonId?: string, overrideLogo?: string } => {
    const name = originalName.toLowerCase();

    if (name.includes("capim")) {
      if (comp === "KC Brazil") return { name: "Capim FC", presidents: "Jon Vlogs + Luva de Pedreiro", overrideSeasonId: "33" };
      return { name: "Capim FC", presidents: "Jon Vlogs + Luva de Pedreiro" };
    }
    if (name.includes("dendele") || name.includes("dendelê")) {
      if (comp === "KC Brazil") return { name: "Dendele FC", presidents: "Paulinho o Loko + LuquEt4", overrideSeasonId: "33" };
      return { name: "Dendele FC", presidents: "Paulinho o Loko + LuquEt4" };
    }
    if (name.includes("furia")) {
      return { name: "Furia FC", presidents: "Neymar + Cris Guedes" };
    }
    if (name.includes("g3x")) {
      return { name: "G3X FC", presidents: "Gaules + Kelvin" };
    }
    if (name.includes("nyvelados")) {
      if (comp === "Split 2") return { name: "Nyvelados FC", presidents: "Nyvi Estephan + Falcão" };
      if (comp === "KC Brazil") return { name: "Nyvelados FC", presidents: "Nyvi Estephan", overrideSeasonId: "33" };
      return { name: "Nyvelados FC", presidents: "Nyvi Estephan" };
    }
    if (name.includes("podpah") || name.includes("funkbol")) {
      if (comp === "Split 2") return { name: "Podpah Funkbol Clube", presidents: "Igão + Michel Elias + MC Hariel" };
      if (comp === "KC Brazil") return { name: "Podpah Funkbol Clube", presidents: "Kond + Michel Elias + MC Hariel", overrideSeasonId: "33" };
      return { name: "Podpah Funkbol Clube", presidents: "Kond + Michel Elias + MC Hariel" };
    }
    if (name.includes("fluxo")) {
      if (comp === "Split 2") return { name: "Fluxo FC", presidents: "Cerol + Nobru + Toguro" };
      if (comp === "KC Brazil") return { name: "Fluxo FC", presidents: "Cerol + Nobru", overrideSeasonId: "33" };
      return { name: "Fluxo FC", presidents: "Cerol + Nobru" };
    }
    if (name.includes("loud")) {
      if (comp === "Split 2") return { name: "LOUD SC", presidents: "Coringa + Brabox" };
      if (comp === "KC Brazil") return { name: "LOUD SC", presidents: "Coringa + Renato Vicente", overrideSeasonId: "33" };
      return { name: "LOUD SC", presidents: "Coringa" };
    }
    if (name.includes("desimpain")) {
      if (comp === "Split 1") return { name: "DesimpaiN", presidents: "Toguro + Yuri 22" };
      if (comp === "Split 2") return { name: "DesimpaiN", presidents: "Renato Vicente" };
      if (comp === "KC Brazil") return { name: "DesimpaiN", presidents: "Toguro", overrideSeasonId: "33" };
    }
    if (name.includes("dibrados") || name.includes("elite")) {
      if (comp === "Split 2") return { name: "Dibrados FC", presidents: "Allan Stag + Lucas Tylty" };
      if (comp === "Split 1") return {
        name: "FC Real Elite",
        presidents: "Ludmilla + Allan Stag",
        overrideTeamId: "166",
        overrideLogo: "https://kingsleague-cdn.kama.football/account/production/team/94906999.png",
        overrideSeasonId: "33"
      };
      if (comp === "KC Brazil") return {
        name: "FC Real Elite",
        presidents: "Ludmilla + Whindersson Nunes + Lucas Freestyle",
        overrideTeamId: "166",
        overrideLogo: "https://kingsleague-cdn.kama.football/account/production/team/94906999.png",
        overrideSeasonId: "33"
      };
    }

    if (comp === "KC Brazil" && !name.includes("furia") && !name.includes("g3x")) {
      return { name: originalName, presidents: undefined, overrideSeasonId: "33" };
    }

    return { name: originalName, presidents: undefined };
  }

  useEffect(() => {
    async function loadChallenges() {
      try {
        const data = await fetchLeagueData()
        if (data?.teams) {
          const comps = ["KC Brazil", "Split 1", "Split 2"]
          const compToSeason: Record<string, string> = {
            "KC Brazil": "162",
            "Split 1": "33",
            "Split 2": "61"
          }
          const loadedChallenges = data.teams.flatMap((t: any) =>
            comps.map((comp) => {
              const display = getTeamDisplayData(t.name, comp);
              return {
                id: `${t.id}-${comp}`,
                teamId: display.overrideTeamId || t.id,
                teamName: display.name,
                competition: comp,
                logo: display.overrideLogo || t.logo?.url,
                seasonId: display.overrideSeasonId || compToSeason[comp],
                presidents: display.presidents
              };
            })
          )
          setChallenges(loadedChallenges)
        }
      } catch (e) {
        console.error("Erro ao carregar desafios", e)
      } finally {
        setLoading(false)
      }
    }
    loadChallenges()
  }, [])

  useEffect(() => {
    if (!currentChallenge) return

    async function loadTeamPlayers() {
      if (teamDetailsCache[currentChallenge!.id]) {
        setValidPlayers(teamDetailsCache[currentChallenge!.id].players || [])
        return
      }

      setValidPlayers([])

      try {
        const url = currentChallenge!.seasonId
          ? `/api/team-details/${currentChallenge!.teamId}?seasonId=${currentChallenge!.seasonId}`
          : `/api/team-details/${currentChallenge!.teamId}`;
        const res = await fetch(url)
        const teamDetails = await res.json()
        setTeamDetailsCache(prev => ({ ...prev, [currentChallenge!.id]: teamDetails }))
        setValidPlayers(teamDetails.players || [])
      } catch (e) {
        console.error("Erro ao carregar jogadores do time", e)
      }
    }

    loadTeamPlayers()
  }, [currentChallenge, teamDetailsCache])

  const getAverage = (list: Player[]) => list.length > 0 ? Math.round(list.reduce((acc, p) => acc + getPlayerOverall(p), 0) / list.length) : "?"

  const handlePlayerSelectFromRoster = (player: Player) => {
    setActivePlayerToPlace(player)
  }

  const handleSlotClick = (slotId: string) => {
    if (selectedPlayers[slotId]) return

    if (!activePlayerToPlace) {
      if (!selectedPlayers[slotId]) setActiveSlotId(slotId)
      return
    }

    const slot = formation.slots.find(s => s.id === slotId)
    if (slot) {
      if (slot.role === "goalkeeper" && activePlayerToPlace.role !== "goalkeeper") {
        toast({ title: t.ui.positionInvalid, description: `${t.ui.goalkeeper}: ${t.ui.positionInvalid.toLowerCase()}`, variant: "destructive" })
        return
      }
      if (slot.role === "defender" && activePlayerToPlace.role !== "defender") {
        toast({ title: t.ui.positionInvalid, description: `${t.ui.defenders}: ${t.ui.positionInvalid.toLowerCase()}`, variant: "destructive" })
        return
      }
      if (slot.role === "midfielder" && activePlayerToPlace.role !== "midfielder") {
        toast({ title: t.ui.positionInvalid, description: `${t.ui.midfielders}: ${t.ui.positionInvalid.toLowerCase()}`, variant: "destructive" })
        return
      }
      if (slot.role === "forward" && activePlayerToPlace.role !== "forward") {
        toast({ title: t.ui.positionInvalid, description: `${t.ui.forwards}: ${t.ui.positionInvalid.toLowerCase()}`, variant: "destructive" })
        return
      }
    }

    const isAlreadySelected = Object.values(selectedPlayers).some(p => p?.id === activePlayerToPlace.id)
    if (isAlreadySelected) {
      toast({ title: t.ui.duplicatePlayer, description: t.ui.selected, variant: "destructive" })
      return
    }

    setSelectedPlayers(prev => ({
      ...prev,
      [slotId]: activePlayerToPlace
    }))

    setActivePlayerToPlace(null)
    setActiveSlotId(null)
    setCurrentChallenge(null)
  }

  const handleSwapSlots = (sourceId: string, targetId: string) => {
    if (sourceId === targetId || gamePhase !== "draft") return;

    const sourceSlot = formation.slots.find(s => s.id === sourceId);
    const targetSlot = formation.slots.find(s => s.id === targetId);

    if (!sourceSlot || !targetSlot) return;

    if (sourceSlot.role !== targetSlot.role) {
      toast({ title: t.ui.incompatiblePosition, description: t.ui.roleFull, variant: "destructive" });
      return;
    }

    setSelectedPlayers(prev => ({
      ...prev,
      [sourceId]: prev[targetId] || null,
      [targetId]: prev[sourceId] || null
    }));
  }

  const isComplete = formation.slots.every(slot => selectedPlayers[slot.id])
  const filledCount = Object.values(selectedPlayers).filter(Boolean).length
  const hasStarted = filledCount > 0

  const selectedList = Object.values(selectedPlayers).filter(Boolean) as Player[]
  const attackPlayers = selectedList.filter(p => p.role === "forward" || p.role === "midfielder")
  const defensePlayers = selectedList.filter(p => p.role === "defender" || p.role === "goalkeeper")

  const attackScore = getAverage(attackPlayers)
  const defenseScore = getAverage(defensePlayers)
  const teamScore = getAverage(selectedList)

  const topPlayer = useMemo(() => {
    if (selectedList.length === 0) return null
    return [...selectedList].sort((a, b) => getPlayerOverall(b) - getPlayerOverall(a))[0]
  }, [selectedList])

  const handleResetDraft = () => {
    setSelectedPlayers({})
    setActiveSlotId(null)
    setActivePlayerToPlace(null)
    setCurrentChallenge(null)
    setSpinChallenge(null)
    setIsSpinning(false)
    setRollsLeft(difficulty === "Clássico" ? 3 : 1)
    setDrawnChallenges([])
    setValidPlayers([])
    toast({ title: t.ui.lineupReset, description: t.ui.reset })
  }

  const handleStartNewDraft = () => {
    setSelectedPlayers({})
    setActiveSlotId(null)
    setActivePlayerToPlace(null)
    setCurrentChallenge(null)
    setSpinChallenge(null)
    setIsSpinning(false)
    setRollsLeft(difficulty === "Clássico" ? 3 : 1)
    setDrawnChallenges([])
    setValidPlayers([])
    setTeamNameInput("")
    setPresidentNameInput("")
    setSelectedLogoIndex(0)
    setCampaignData(null)
    setGamePhase("draft")
    toast({
      title: t.page.campaign.toastNewDraft,
      description: t.page.campaign.toastNewDraftDesc
    })
  }


  const fullRoles: string[] = []
  const allRoles = ["goalkeeper", "defender", "midfielder", "forward"]
  allRoles.forEach(role => {
    const totalSlots = formation.slots.filter(s => s.role === role).length
    const filledSlots = formation.slots.filter(s => s.role === role && selectedPlayers[s.id]).length
    if (totalSlots > 0 && filledSlots >= totalSlots) {
      fullRoles.push(role)
    }
  })

  const startSpinAnimation = (finalChallenge: Challenge) => {
    setIsSpinning(true)
    setValidPlayers([])
    let count = 0
    const interval = setInterval(() => {
      setSpinChallenge(challenges[Math.floor(Math.random() * challenges.length)])
      count++
      if (count >= 10) {
        clearInterval(interval)
        setIsSpinning(false)
        setCurrentChallenge(finalChallenge)
        setActivePlayerToPlace(null)
        setDrawnChallenges(prev => [...prev, finalChallenge.teamName])
      }
    }, 90)
  }

  const getRandomChallenge = (list: Challenge[]) => {
    if (list.length === 0) return null
    let available = list.filter(c => !drawnChallenges.includes(c.teamName))
    if (available.length === 0) {
      available = list
      setDrawnChallenges([])
    }

    const uniqueTeamNames = Array.from(new Set(available.map(c => c.teamName)))
    const randomlySelectedName = uniqueTeamNames[Math.floor(Math.random() * uniqueTeamNames.length)]

    const teamVariants = available.filter(c => c.teamName === randomlySelectedName)
    return teamVariants[Math.floor(Math.random() * teamVariants.length)]
  }

  const startSimulation = async () => {
    setGamePhase("simulation")

    let finalAttackScore = typeof attackScore === "number" ? attackScore : 80;
    let finalDefenseScore = typeof defenseScore === "number" ? defenseScore : 80;

    const numForwards = formation.slots.filter(s => s.role === "forward").length;
    const numDefenders = formation.slots.filter(s => s.role === "defender").length;

    if (numForwards === 0) {
      finalAttackScore -= 15;
    } else if (numForwards >= 3) {
      finalAttackScore *= 1.05;
      finalDefenseScore *= 0.90;
    }

    if (numDefenders === 0) {
      finalDefenseScore -= 15;
    } else if (numDefenders === 1) {
      finalDefenseScore *= 0.90;
    } else if (numDefenders >= 3) {
      finalDefenseScore *= 1.05;
      finalAttackScore *= 0.95;
    }

    finalAttackScore = Math.min(finalAttackScore, 99);
    finalDefenseScore = Math.min(finalDefenseScore, 99);

    const userSimTeam: SimulatedTeam = {
      id: "user-team",
      name: teamNameInput.trim() || t.page.campaign.yourTeam,
      logo: GENERIC_LOGOS[selectedLogoIndex],
      competition: "SELEÇÃO 12a0",
      overall: typeof teamScore === "number" ? teamScore : 80,
      players: selectedList,
      playStyle: playStyle,
      attackScore: finalAttackScore,
      defenseScore: finalDefenseScore,
      presidents: presidentNameInput.trim() || undefined,
    }

    const shuffledChallenges = [...challenges].sort(() => Math.random() - 0.5)
    const selectedNames = new Set<string>()
    const uniqueChallengesPool = []

    for (const c of shuffledChallenges) {
      if (!selectedNames.has(c.teamName)) {
        selectedNames.add(c.teamName)
        uniqueChallengesPool.push(c)
      }
      if (uniqueChallengesPool.length === 9) break
    }

    const opponents: SimulatedTeam[] = []

    for (const challenge of uniqueChallengesPool) {
      let players: Player[] = []
      if (teamDetailsCache[challenge.id]) {
        players = teamDetailsCache[challenge.id].players || []
      } else {
        try {
          const url = challenge.seasonId
            ? `/api/team-details/${challenge.teamId}?seasonId=${challenge.seasonId}`
            : `/api/team-details/${challenge.teamId}`;
          const res = await fetch(url)
          const data = await res.json()
          setTeamDetailsCache(prev => ({ ...prev, [challenge.id]: data }))
          players = data.players || []
        } catch (e) {
          console.error("Failed to fetch opponent players", e)
        }
      }

      const randomStyles = ["Defensivo", "Equilibrado", "Ofensivo"] as const;
      const opponentStyle = randomStyles[Math.floor(Math.random() * randomStyles.length)];
      const oppOverall = getAverage(players) === "?" ? 75 : getAverage(players) as number;

      opponents.push({
        id: challenge.id,
        name: challenge.teamName,
        competition: challenge.competition,
        logo: challenge.logo,
        overall: oppOverall,
        players: players,
        playStyle: opponentStyle,
        attackScore: oppOverall,
        defenseScore: oppOverall,
        presidents: challenge.presidents
      })
    }

    setCampaignData({ userTeam: userSimTeam, otherTeams: opponents })
  }

  return (
    <main className="min-h-screen bg-[#040405] text-white flex flex-col selection:bg-[var(--team-primary)] selection:text-black">
      <Header
        loading={loading}
        selectedTeam={null}
        onTeamSelect={() => { }}
        setActiveTab={() => { }}
      />

      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-amber-500/[0.04] via-amber-500/[0.01] to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl flex-1 flex flex-col relative z-10">
        {/* Header da Página - Padrão Oficial Tier List */}
        <div className="mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill mb-2">
            <KingsLeagueLogo width={14} height={18} className="drop-shadow-[0_0_6px_rgba(244,175,35,0.4)]" />
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-white">
              {t.common.officialSimulator} • {t.page.campaign.challenge} 12a0
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            {t.page.campaign.challenge}{" "}
            <span className="bg-gradient-to-r from-[var(--team-primary)] via-amber-300 to-[var(--team-primary)] bg-clip-text text-transparent">
              12a0
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {t.page.campaign.allRounds}
          </p>
        </div>

        {gamePhase === "draft" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
            {/* Esquerda: Configurações ou Elenco */}
            <div className="xl:col-span-4">
              {!currentChallenge && !isSpinning ? (
                isComplete ? (
                  /* Equipe Pronta - Painel de Identidade do Clube & Destaque Tático */
                  <div className="liquid-glass-panel rounded-3xl p-5 sm:p-6 h-[740px] flex flex-col justify-between border border-white/[0.08] relative overflow-hidden">
                    <div className="space-y-4 my-auto">
                      <div className="text-center">
                        <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(245,158,11,0.25)] mb-3">
                          <CheckCircle2 className="w-7 h-7 text-amber-400" />
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 mb-1.5">
                          <CheckCircle2 className="w-3 h-3" /> {t.page.campaign.confirmed}
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">{t.page.campaign.ready}</h2>
                        <p className="text-xs text-zinc-400 font-medium mt-1">{t.page.campaign.confirmed}</p>
                      </div>

                      {/* Card de Identidade do Clube */}
                      <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-amber-400/15 border border-amber-400/30 p-2 flex items-center justify-center shrink-0">
                            <img
                              src={GENERIC_LOGOS[selectedLogoIndex]}
                              alt="Escudo"
                              className="w-full h-full object-contain filter drop-shadow"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">{t.page.campaign.yourTeam}</span>
                            <h3 className="text-base font-black text-white uppercase truncate leading-tight">
                              {teamNameInput || t.page.campaign.yourTeam}
                            </h3>
                            {presidentNameInput && (
                              <p className="text-[10px] text-zinc-400 font-medium truncate mt-0.5">
                                {t.page.campaign.president}: {presidentNameInput}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300">
                                {formation.name.replace(" (Falso 9)", "")}
                              </span>
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                                {styleLabels[playStyle]}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Destaque do Esquadrão */}
                        {topPlayer && (
                          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-amber-400/30">
                                <img
                                  src={getPlayerPhotoUrl(topPlayer.image?.url)}
                                  alt={topPlayer.shortName}
                                  className="w-full h-full object-cover object-top"
                                />
                              </div>
                              <div className="min-w-0 text-left">
                                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5" /> {t.page.campaign.starPlayer}
                                </span>
                                <div className="text-xs font-bold text-white truncate">{topPlayer.shortName}</div>
                              </div>
                            </div>
                            <span className="text-xs font-black text-amber-400 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 shrink-0">
                              {getPlayerOverall(topPlayer)} OVR
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Parâmetros do Desafio */}
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-left space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400 font-medium">{t.page.campaign.gameMode}:</span>
                          <span className="text-white font-bold">{diffLabels[difficulty]}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400 font-medium">{t.page.campaign.campaignStatus}:</span>
                          <span className="text-emerald-400 font-bold">{t.page.campaign.readyKickoff}</span>
                        </div>
                      </div>
                    </div>

                    {/* Botão Secundário para Reiniciar Escalação */}
                    <div className="pt-3 border-t border-white/[0.06]">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleResetDraft}
                        className="btn-press w-full h-11 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-xl border border-white/[0.08]"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-2" /> {t.page.campaign.resetLineup}
                      </Button>
                    </div>
                  </div>
                ) : hasStarted ? (
                  /* Em Andamento: Botão de Sortear Próximo */
                  <div className="liquid-glass-panel rounded-3xl p-5 sm:p-6 h-[740px] flex flex-col justify-between border border-white/[0.08] text-center relative overflow-hidden">
                    <div className="my-auto space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto shadow-inner">
                        <Dices className="w-7 h-7 text-amber-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{t.page.campaign.nextRound}</h3>
                      <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                        {t.page.campaign.draftedOf.replace("{count}", String(filledCount)).replace("{total}", String(formation.slots.length))}
                      </p>
                    </div>

                    <Button
                      variant="brand"
                      onClick={() => {
                        if (challenges.length > 0 && !isSpinning) {
                          const random = getRandomChallenge(challenges)
                          if (random) startSpinAnimation(random)
                        }
                      }}
                      disabled={isSpinning}
                      className="btn-press w-full h-12 text-xs font-black uppercase tracking-wider rounded-xl disabled:opacity-50"
                    >
                      <Dices className="w-4 h-4 mr-2" /> {t.page.campaign.rollNextTeam}
                    </Button>
                  </div>
                ) : (
                  /* Setup Inicial (Formação, Estilo, Dificuldade, Nome, Escudo) */
                  <div className="liquid-glass-panel rounded-3xl p-5 sm:p-6 h-[740px] flex flex-col justify-between border border-white/[0.08] relative overflow-hidden">
                    <div className="space-y-4 overflow-y-auto pr-1 scrollbar-minimal">
                      {/* Formação */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">
                          {t.page.campaign.tacticalFormation}
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {formations.map((f) => (
                            <button
                              key={f.id}
                              onClick={() => {
                                if (!hasStarted) {
                                  setFormation(f)
                                  setSelectedPlayers({})
                                  setActiveSlotId(null)
                                  setActivePlayerToPlace(null)
                                }
                              }}
                              disabled={hasStarted}
                              className={cn(
                                "py-2 px-1 text-[11px] font-bold rounded-xl border transition-all text-center select-none active:scale-[0.96]",
                                formation.id === f.id
                                  ? "bg-amber-400 text-black border-amber-300 shadow-[0_2px_10px_rgba(245,158,11,0.3)] font-black"
                                  : "bg-white/[0.03] text-zinc-300 border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]",
                                hasStarted && formation.id !== f.id && "opacity-30 cursor-not-allowed"
                              )}
                            >
                              {f.name.replace(" (Falso 9)", "")}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Estilo de Jogo */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">
                          {t.page.campaign.pitchPosture}
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["Defensivo", "Equilibrado", "Ofensivo"] as PlayStyle[]).map((style) => (
                            <button
                              key={style}
                              onClick={() => {
                                if (!hasStarted) setPlayStyle(style)
                              }}
                              disabled={hasStarted}
                              className={cn(
                                "py-2 px-1 text-[11px] font-bold rounded-xl border transition-all text-center select-none active:scale-[0.96]",
                                playStyle === style
                                  ? "bg-amber-400 text-black border-amber-300 shadow-[0_2px_10px_rgba(245,158,11,0.3)] font-black"
                                  : "bg-white/[0.03] text-zinc-300 border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]",
                                hasStarted && playStyle !== style && "opacity-30 cursor-not-allowed"
                              )}
                            >
                              {styleLabels[style]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dificuldade */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">
                          {t.page.campaign.gameMode}
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(["Clássico", "Lendas"] as Difficulty[]).map((diff) => (
                            <button
                              key={diff}
                              onClick={() => {
                                if (!hasStarted) setDifficulty(diff)
                              }}
                              disabled={hasStarted}
                              className={cn(
                                "py-2 px-2 text-[11px] font-bold rounded-xl border transition-all text-center select-none active:scale-[0.96]",
                                difficulty === diff
                                  ? "bg-amber-400 text-black border-amber-300 shadow-[0_2px_10px_rgba(245,158,11,0.3)] font-black"
                                  : "bg-white/[0.03] text-zinc-300 border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]",
                                hasStarted && difficulty !== diff && "opacity-30 cursor-not-allowed"
                              )}
                            >
                              {diffLabels[diff]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Nome do Time */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">
                          {t.page.campaign.yourTeam}
                        </span>
                        <input
                          type="text"
                          maxLength={18}
                          value={teamNameInput}
                          onChange={(e) => setTeamNameInput(e.target.value.toUpperCase())}
                          placeholder={t.page.campaign.yourTeam.toUpperCase()}
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white font-bold text-xs uppercase tracking-wider placeholder:text-zinc-600 outline-none focus:border-amber-400/60 focus:bg-white/[0.05] transition-all"
                        />
                      </div>

                      {/* Nome do Presidente */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">
                          {t.page.campaign.president}
                        </span>
                        <input
                          type="text"
                          maxLength={24}
                          value={presidentNameInput}
                          onChange={(e) => setPresidentNameInput(e.target.value.toUpperCase())}
                          placeholder="EX: NEYMAR, GAULES OU SEU NOME"
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2 text-white font-bold text-xs uppercase tracking-wider placeholder:text-zinc-600 outline-none focus:border-amber-400/60 focus:bg-white/[0.05] transition-all"
                        />
                      </div>

                      {/* Escudo */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">
                          Escudo
                        </span>
                        <div className="grid grid-cols-6 gap-2">
                          {GENERIC_LOGOS.map((logo, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedLogoIndex(index)}
                              className={cn(
                                "aspect-square rounded-xl flex items-center justify-center border transition-all p-2 select-none active:scale-[0.94]",
                                selectedLogoIndex === index
                                  ? "bg-amber-400 border-amber-300 shadow-[0_2px_10px_rgba(245,158,11,0.4)]"
                                  : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]"
                              )}
                            >
                              <img
                                src={logo}
                                alt={`Escudo ${index + 1}`}
                                className={cn("w-full h-full object-contain", selectedLogoIndex === index ? "brightness-0" : "opacity-80")}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/[0.06]">
                      <Button
                        variant="brand"
                        onClick={() => {
                          if (challenges.length > 0 && !isSpinning) {
                            const random = getRandomChallenge(challenges)
                            if (random) startSpinAnimation(random)
                          }
                        }}
                        disabled={isSpinning}
                        className="btn-press w-full h-12 text-xs font-black uppercase tracking-wider rounded-xl disabled:opacity-50"
                      >
                        <Dices className="w-4 h-4 mr-2" /> {t.page.campaign.rollFirstTeam}
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                /* Time Sorteado Ativo + Elenco */
                <div className="liquid-glass-panel rounded-3xl p-5 h-[740px] flex flex-col justify-between border border-white/[0.08] relative overflow-hidden">
                  {/* Card do Time Sorteado */}
                  <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-3.5 mb-3 text-center min-h-[110px] flex flex-col justify-center items-center shadow-inner relative overflow-hidden">
                    {isSpinning && spinChallenge ? (
                      <div className="w-full flex flex-col items-center justify-center">
                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> {t.page.campaign.drawingTeam}
                        </span>
                        <div className="flex items-center justify-center gap-3 opacity-60">
                          {spinChallenge.logo && (
                            <img src={getProxyImageUrl(spinChallenge.logo)} alt="Spinning" className="w-10 h-10 object-contain" />
                          )}
                          <div className="text-left">
                            <h2 className="text-base font-black uppercase text-white truncate max-w-[160px]">{spinChallenge.teamName}</h2>
                            <p className="text-[10px] font-bold text-amber-400 uppercase">{spinChallenge.competition}</p>
                          </div>
                        </div>
                      </div>
                    ) : currentChallenge ? (
                      <div className="w-full flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 min-w-0">
                          {currentChallenge.logo && (
                            <div className="w-11 h-11 relative shrink-0">
                              <img
                                src={getProxyImageUrl(currentChallenge.logo)}
                                alt={currentChallenge.teamName}
                                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                              />
                            </div>
                          )}
                          <div className="text-left min-w-0">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">{t.page.campaign.team}</span>
                            <h2 className="text-lg font-black uppercase text-white leading-tight truncate">{currentChallenge.teamName}</h2>
                            {currentChallenge.presidents && (
                              <p className="text-[10px] text-zinc-400 truncate leading-snug">{currentChallenge.presidents}</p>
                            )}
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/20 shrink-0">
                          {currentChallenge.competition}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Botões de Re-sorteio */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5 px-1">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{t.page.campaign.drawAgain}</span>
                      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">
                        {t.page.campaign.rollsAvailable.replace("{count}", String(rollsLeft))}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="glass"
                        disabled={rollsLeft <= 0 || isSpinning}
                        onClick={() => {
                          if (rollsLeft > 0 && !isSpinning) {
                            const sameCompetition = challenges.filter(c => c.competition === currentChallenge?.competition && c.teamName !== currentChallenge?.teamName)
                            const list = sameCompetition.length > 0 ? sameCompetition : challenges
                            const random = getRandomChallenge(list)
                            if (random) {
                              setRollsLeft(prev => prev - 1)
                              startSpinAnimation(random)
                            }
                          }
                        }}
                        className="font-bold text-[10px] h-9 rounded-xl uppercase disabled:opacity-30"
                      >
                        <RotateCcw className="w-3 h-3 mr-1.5" /> {t.page.campaign.anotherTeam}
                      </Button>
                      <Button
                        variant="glass"
                        disabled={rollsLeft <= 0 || isSpinning}
                        onClick={() => {
                          if (rollsLeft > 0 && !isSpinning) {
                            const diffCompetition = challenges.filter(c => c.competition !== currentChallenge?.competition)
                            const list = diffCompetition.length > 0 ? diffCompetition : challenges
                            const random = getRandomChallenge(list)
                            if (random) {
                              setRollsLeft(prev => prev - 1)
                              startSpinAnimation(random)
                            }
                          }
                        }}
                        className="font-bold text-[10px] h-9 rounded-xl uppercase disabled:opacity-30"
                      >
                        <RotateCcw className="w-3 h-3 mr-1.5" /> {t.page.campaign.anotherCup}
                      </Button>
                    </div>
                  </div>

                  {/* Elenco do Time */}
                  <div className="flex-1 overflow-hidden flex flex-col border border-white/[0.06] rounded-2xl bg-black/20 p-2">
                    <div className="px-2 py-1 mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {activePlayerToPlace ? (
                          <span className="text-amber-300 font-black animate-pulse flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" /> {t.page.campaign.clickPitchToLineup.replace("{player}", activePlayerToPlace.shortName)}
                          </span>
                        ) : (
                          t.page.campaign.selectAPlayer
                        )}
                      </span>
                    </div>

                    <div className={cn("flex-1 overflow-hidden transition-opacity duration-150", isSpinning ? "opacity-30 pointer-events-none" : "opacity-100")}>
                      {validPlayers.length === 0 || isSpinning ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">{t.page.campaign.loadingRoster}</span>
                        </div>
                      ) : (
                        <TeamRoster
                          validPlayers={validPlayers}
                          onPlayerSelect={handlePlayerSelectFromRoster}
                          disabled={isComplete}
                          activePlayerId={activePlayerToPlace?.id ? String(activePlayerToPlace.id) : undefined}
                          showOverall={difficulty === "Clássico"}
                          selectedPlayerIds={Object.values(selectedPlayers).map(p => p?.id ? String(p.id) : undefined).filter(Boolean) as string[]}
                          fullRoles={fullRoles}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Centro: Campo Tático 7v7 */}
            <div className="xl:col-span-5 flex items-center justify-center h-[740px]">
              <Pitch
                formation={formation}
                selectedPlayers={selectedPlayers}
                activeSlotId={activeSlotId}
                activePlayerToPlace={activePlayerToPlace}
                onSlotClick={handleSlotClick}
                onSwapSlots={handleSwapSlots}
                showOverall={difficulty === "Clássico"}
                playStyle={playStyle}
              />
            </div>

            {/* Direita: Box Score & Resumo da Equipe */}
            <div className="xl:col-span-3">
              <div className="liquid-glass-panel rounded-3xl p-5 sm:p-6 h-[740px] flex flex-col justify-between border border-white/[0.08] relative overflow-hidden">
                {/* Header do Box Score */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {t.page.campaign.boxScore}
                    </span>
                    <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                      {filledCount}/{formation.slots.length}
                    </span>
                  </div>

                  {/* Métricas Principais Liquid */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-2.5 text-center">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">{t.page.campaign.overall}</span>
                      <span className="text-xl font-black text-amber-400">
                        {difficulty === "Lendas" && !isComplete ? "?" : teamScore}
                      </span>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-2.5 text-center">
                      <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest block mb-0.5">{t.page.campaign.attack}</span>
                      <span className="text-xl font-black text-white">
                        {difficulty === "Lendas" && !isComplete ? "?" : attackScore}
                      </span>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-2.5 text-center">
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block mb-0.5">{t.page.campaign.defense}</span>
                      <span className="text-xl font-black text-white">
                        {difficulty === "Lendas" && !isComplete ? "?" : defenseScore}
                      </span>
                    </div>
                  </div>

                  {/* Lista das 7 Posições com Status */}
                  <div className="space-y-2 mt-4">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">
                      {t.page.campaign.tacticalLineup}
                    </span>

                    {formation.slots.map(slot => {
                      const player = selectedPlayers[slot.id]
                      const playerOvr = player ? getPlayerOverall(player) : null
                      return (
                        <div
                          key={slot.id}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-xl border text-xs transition-colors",
                            player
                              ? "bg-white/[0.03] border-white/[0.08]"
                              : "bg-black/20 border-white/[0.04] text-zinc-500"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300 w-9 text-center">
                              {slot.position}
                            </span>
                            <span className={cn("truncate font-semibold", player ? "text-white" : "text-zinc-600 italic")}>
                              {player ? player.shortName : t.page.campaign.emptySlot}
                            </span>
                          </div>

                          {player && difficulty === "Clássico" && playerOvr !== null && (
                            <span className={cn(
                              "text-[10px] font-black px-1.5 py-0.2 rounded-full",
                              playerOvr >= 90 ? "text-amber-400 bg-amber-400/10" : "text-zinc-400"
                            )}>
                              {playerOvr}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Botão de Simulação ao Concluir */}
                <div className="pt-4 border-t border-white/[0.06]">
                  {isComplete ? (
                    <Button
                      variant="brand"
                      onClick={startSimulation}
                      className="btn-press w-full h-12 text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-[var(--team-primary,#F4AF23)]/20"
                    >
                      <Trophy className="w-4 h-4 mr-2" /> {t.page.campaign.simulate12a0}
                    </Button>
                  ) : (
                    <div className="text-center py-2 text-zinc-500 text-[11px] font-medium">
                      {t.page.campaign.lineupRemainingToUnlock.replace("{count}", String(formation.slots.length - filledCount))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fase de Simulação da Campanha */}
        {gamePhase === "simulation" && campaignData && (
          <CampaignUI
            userTeam={campaignData.userTeam}
            otherTeams={campaignData.otherTeams}
            difficulty={difficulty}
            onResetToDraft={handleStartNewDraft}
          />
        )}
      </div>

      <Footer />
    </main>
  )
}
