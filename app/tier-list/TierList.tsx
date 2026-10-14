"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Team, TierListData } from "@/types/kings-league"
import { fetchLeagueData } from "@/lib/fetch-league-data"
import {
  getTierList,
  saveTierList,
  clearTierList,
  getInitialTierListData,
  encodeTierListToURL,
  decodeTierListFromURL,
  createNewTier,
  moveTierUp,
  moveTierDown,
  resetTeamsToPool,
  addTierAbove,
  addTierBelow,
  clearTierTeams,
  applyPreset,
  PresetTemplate,
} from "@/lib/tier-list-manager"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import { TierRow } from "@/components/tier-list/tier-row"
import { TeamDraggable } from "@/components/tier-list/team-draggable"
import { TeamPool } from "@/components/tier-list/team-pool"
import { TierControls } from "@/components/tier-list/tier-controls"
import { TierListSkeleton } from "@/components/skeletons/tier-list-skeleton"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { snapdom } from "@zumer/snapdom"
import { toast } from "sonner"
import KingsLeagueLogo from "@/components/kings-league-logo"
import { useLeague } from "@/contexts/league-context"
import { useLocale } from "@/contexts/locale-context"
import { AppleEmoji } from "@/components/ui/apple-emoji"
import { GradientTitle } from "@/components/ui/gradient-title"

export default function TierList() {
  const { selectedLeague, selectedSeasonId } = useLeague()
  const { t, locale } = useLocale()
  const tierScope = `${selectedLeague.id}-${selectedSeasonId}`
  const [teams, setTeams] = useState<Team[]>([])
  const [tierListData, setTierListData] = useState<TierListData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [selectedPoolTeamId, setSelectedPoolTeamId] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const tierListRef = useRef<HTMLDivElement>(null)

  // Configurar sensores para drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 6,
      },
    })
  )

  // Carregar times da API via cache compartilhado
  useEffect(() => {
    let isMounted = true

    async function loadTeams() {
      try {
        setLoading(true)
        const leagueData = await fetchLeagueData({
          seasonId: selectedSeasonId,
          competitionId: selectedLeague.competitionId,
        })
        if (!isMounted) return

        const teamsArray = Array.isArray(leagueData?.teams) ? leagueData.teams : []
        const sortedTeams = [...teamsArray].sort((a: Team, b: Team) =>
          (a.name || "").localeCompare(b.name || "")
        )
        setTeams(sortedTeams)
      } catch (error) {
        console.error('Erro ao carregar times:', error)
        toast.error(t.tier.loadError)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadTeams()

    return () => {
      isMounted = false
    }
  }, [selectedSeasonId, selectedLeague.competitionId, t])

  // Carregar tier list salva ou da URL
  useEffect(() => {
    if (teams.length === 0) return

    const allTeamIds = teams.map((t) => t.id)

    // Tentar carregar da URL primeiro
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const dataParam = params.get('data')

      if (dataParam) {
        const decodedData = decodeTierListFromURL(dataParam)
        if (decodedData) {
          setTierListData(decodedData)
          setLoading(false)
          toast.success(t.tier.loadedFromLink)
          return
        }
      }
    }

    // Senão, carregar do localStorage
    const savedData = getTierList(tierScope)
    if (savedData) {
      const validIds = new Set(allTeamIds)
      const assignedIds = new Set<string>()
      setTierListData({
        tiers: savedData.tiers.map((tier) => ({
          ...tier,
          teams: tier.teams.filter((id) => validIds.has(id) && !assignedIds.has(id)),
        })).map((tier) => {
          tier.teams.forEach((id) => assignedIds.add(id))
          return tier
        }),
        unassigned: Array.from(new Set([
          ...savedData.unassigned.filter((id) => validIds.has(id)),
          ...allTeamIds.filter((id) => !assignedIds.has(id)),
        ])),
      })
    } else {
      setTierListData(getInitialTierListData(allTeamIds, locale))
    }

    setLoading(false)
  }, [teams, tierScope])

  // Salvar automaticamente no localStorage
  useEffect(() => {
    if (tierListData && !loading) {
      saveTierList(tierListData, tierScope)
    }
  }, [tierListData, loading, tierScope])

  // Handlers de drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string)
    setSelectedPoolTeamId(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragId(null)

    if (!over || !tierListData) return

    const teamId = active.id as string
    const overId = over.id as string

    // De onde o time está vindo
    let fromTierId: string | 'unassigned' = 'unassigned'
    if (tierListData.unassigned.includes(teamId)) {
      fromTierId = 'unassigned'
    } else {
      const fromTier = tierListData.tiers.find((t) => t.teams.includes(teamId))
      if (fromTier) fromTierId = fromTier.id
    }

    const toTierId: string | 'unassigned' = overId
    if (fromTierId === toTierId) return

    const newData = JSON.parse(JSON.stringify(tierListData)) as TierListData

    // Remover da origem
    if (fromTierId === 'unassigned') {
      newData.unassigned = newData.unassigned.filter((id) => id !== teamId)
    } else {
      const fromTier = newData.tiers.find((t) => t.id === fromTierId)
      if (fromTier) {
        fromTier.teams = fromTier.teams.filter((id) => id !== teamId)
      }
    }

    // Adicionar no destino
    if (toTierId === 'unassigned') {
      newData.unassigned.push(teamId)
    } else {
      const toTier = newData.tiers.find((t) => t.id === toTierId)
      if (toTier) {
        toTier.teams.push(teamId)
      }
    }

    setTierListData(newData)
  }

  // Quick-Link instantâneo
  const handleQuickAssign = (teamId: string, toTierId: string) => {
    if (!tierListData) return

    const newData = JSON.parse(JSON.stringify(tierListData)) as TierListData

    newData.unassigned = newData.unassigned.filter((id) => id !== teamId)
    newData.tiers.forEach((t) => {
      t.teams = t.teams.filter((id) => id !== teamId)
    })

    const targetTier = newData.tiers.find((t) => t.id === toTierId)
    if (targetTier) {
      targetTier.teams.push(teamId)
      setTierListData(newData)
    }

    setSelectedPoolTeamId(null)
  }

  // Remover time de uma tier e retornar ao banco
  const handleRemoveTeamFromTier = (teamId: string) => {
    if (!tierListData) return

    const newData = JSON.parse(JSON.stringify(tierListData)) as TierListData

    newData.tiers.forEach((tier) => {
      tier.teams = tier.teams.filter((id) => id !== teamId)
    })

    if (!newData.unassigned.includes(teamId)) {
      newData.unassigned.push(teamId)
    }

    setTierListData(newData)
  }

  // Adicionar nova tier
  const handleAddTier = () => {
    if (!tierListData) return

    const newTier = createNewTier(
      `tier-${Date.now()}`,
      tierListData.tiers.length
    )

    setTierListData({
      ...tierListData,
      tiers: [...tierListData.tiers, newTier],
    })

    toast.success(t.tier.added)
  }

  // Remover tier
  const handleRemoveTier = (tierId: string) => {
    if (!tierListData) return

    const tier = tierListData.tiers.find((t) => t.id === tierId)
    if (!tier) return

    const newData = {
      ...tierListData,
      tiers: tierListData.tiers.filter((t) => t.id !== tierId),
      unassigned: [...tierListData.unassigned, ...tier.teams],
    }

    setTierListData(newData)
    toast.success(t.tier.removed)
  }

  // Adicionar tier imediatamente acima
  const handleAddTierAbove = (tierId: string) => {
    if (!tierListData) return
    const newData = addTierAbove(tierListData, tierId)
    setTierListData(newData)
    toast.success(t.tier.addedAbove)
  }

  // Adicionar tier imediatamente abaixo
  const handleAddTierBelow = (tierId: string) => {
    if (!tierListData) return
    const newData = addTierBelow(tierListData, tierId)
    setTierListData(newData)
    toast.success(t.tier.addedBelow)
  }

  // Esvaziar times de uma tier específica
  const handleClearTier = (tierId: string) => {
    if (!tierListData) return
    const newData = clearTierTeams(tierListData, tierId)
    setTierListData(newData)
    toast.success(t.tier.teamsReturned)
  }

  // Aplicar modelo pronto
  const handleApplyPreset = (preset: PresetTemplate) => {
    if (!tierListData) return
    const newData = applyPreset(tierListData, preset)
    setTierListData(newData)
    setSelectedPoolTeamId(null)
    toast.success(t.tier.presetApplied.replace('{preset}', preset.name))
  }

  // Atualizar nome da tier diretamente
  const handleUpdateTierName = (tierId: string, newName: string) => {
    if (!tierListData) return

    const newTiers = tierListData.tiers.map((tier) =>
      tier.id === tierId ? { ...tier, name: newName } : tier
    )

    setTierListData({
      ...tierListData,
      tiers: newTiers,
    })
  }

  // Atualizar cor da tier
  const handleUpdateTierColor = (tierId: string, newColor: string) => {
    if (!tierListData) return

    const newTiers = tierListData.tiers.map((tier) =>
      tier.id === tierId ? { ...tier, color: newColor } : tier
    )

    setTierListData({
      ...tierListData,
      tiers: newTiers,
    })
  }

  // Mover tier para cima
  const handleMoveTierUp = (tierId: string) => {
    if (!tierListData) return
    const newData = moveTierUp(tierListData, tierId)
    setTierListData(newData)
  }

  // Mover tier para baixo
  const handleMoveTierDown = (tierId: string) => {
    if (!tierListData) return
    const newData = moveTierDown(tierListData, tierId)
    setTierListData(newData)
  }

  // Limpar apenas posições dos times
  const handleResetPositions = () => {
    if (!tierListData) return
    const newData = resetTeamsToPool(tierListData)
    setTierListData(newData)
    setSelectedPoolTeamId(null)
    toast.success(t.tier.allTeamsReturned)
  }

  // Resetar tudo para o padrão
  const handleReset = () => {
    if (!teams.length) return

    const allTeamIds = teams.map((t) => t.id)
    const newData = getInitialTierListData(allTeamIds, locale)

    setTierListData(newData)
    clearTierList(tierScope)
    setSelectedPoolTeamId(null)

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname)
    }

    toast.success(t.tier.resetSuccess)
  }

  // Baixar como imagem PNG limpa em alta resolução
  const handleDownload = async () => {
    if (!tierListRef.current) return

    setIsDownloading(true)
    const toastId = toast.loading(t.tier.downloadingHighRes)

    try {
      // Ativar modo de captura (mostra cabeçalho oficial e marca d'água, oculta botões de edição)
      tierListRef.current.classList.add('capture-mode')

      // Aguardar aplicação dos estilos no DOM
      await new Promise((resolve) => setTimeout(resolve, 150))

      const capture = await snapdom(tierListRef.current, {
        scale: 2,
        useProxy: 'https://proxy.corsfix.com/?',
      })
      const canvas = await capture.toCanvas()

      // Converte para Blob e inicia download
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png', 1)
      })

      if (!blob) throw new Error('Falha ao gerar blob de imagem')

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = 'kings-league-tier-list.png'
      link.href = url
      link.click()

      setTimeout(() => URL.revokeObjectURL(url), 2000)

      toast.success(t.tier.imageDownloaded, { id: toastId })
    } catch (error) {
      console.error('Erro ao gerar imagem:', error)
      toast.error(t.tier.imageError, { id: toastId })
    } finally {
      tierListRef.current?.classList.remove('capture-mode')
      setIsDownloading(false)
    }
  }

  // Compartilhar via link
  const handleShare = async () => {
    if (!tierListData) {
      toast.error(t.tier.noTierToShare)
      return
    }

    const toastId = toast.loading(t.tier.generatingLink)

    try {
      const encoded = encodeTierListToURL(tierListData)
      if (!encoded) {
        toast.error(t.tier.linkError, { id: toastId })
        return
      }

      const url = `${window.location.origin}${window.location.pathname}#data=${encoded}`

      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: t.tier.shareTitle.replace('{league}', selectedLeague.name),
            text: t.tier.shareText.replace('{league}', selectedLeague.name),
            url: url,
          })
          toast.success(t.tier.shareSuccess, { id: toastId })
          return
        } catch (shareError: unknown) {
          if (shareError instanceof Error && shareError.name === 'AbortError') {
            toast.dismiss(toastId)
            return
          }
        }
      }

      await navigator.clipboard.writeText(url)
      toast.success(t.tier.linkCopied, { id: toastId })
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
      toast.error(t.tier.linkError, { id: toastId })
    }
  }

  const getTeamById = useCallback(
    (id: string): Team | undefined => {
      return teams.find((t) => t.id === id)
    },
    [teams]
  )

  const activeDragTeam = activeDragId ? getTeamById(activeDragId) : null

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
  }

  if (loading) {
    return <TierListSkeleton />
  }

  if (!tierListData) {
    return (
      <main className="min-h-screen bg-[#040405] text-white">
        <Header
          loading={false}
          selectedTeam={selectedTeam}
          onTeamSelect={handleTeamSelect}
          setActiveTab={() => {}}
        />
        <div className="flex items-center justify-center py-24">
          <p className="text-zinc-400 text-sm">{t.errors.load}</p>
        </div>
        <Footer />
      </main>
    )
  }

  const totalTeamsCount = teams.length

  return (
    <main className="min-h-screen bg-[#040405] text-white flex flex-col selection:bg-[var(--team-primary)] selection:text-black">
      <Header
        loading={false}
        selectedTeam={selectedTeam}
        onTeamSelect={handleTeamSelect}
        setActiveTab={() => {}}
      />

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl flex-1 flex flex-col">
        {/* Header da Página - Estilo idêntico ao da Home */}
        <div className="mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill mb-2">
            <KingsLeagueLogo width={14} height={18} className="drop-shadow-[0_0_6px_rgba(244,175,35,0.4)]" />
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-white">
              {t.tier.officialMaker}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            <GradientTitle title={t.pages.tierTitle} />
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {t.pages.tierDescription}
          </p>
        </div>

        {/* Barra de Controles Minimalista */}
        <TierControls
          onAddTier={handleAddTier}
          onApplyPreset={handleApplyPreset}
          onResetPositions={handleResetPositions}
          onReset={handleReset}
          onDownload={handleDownload}
          onShare={handleShare}
          isDownloading={isDownloading}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Banco de Times Disponíveis (Dock Compacto) */}
          <div className="mb-4 sm:mb-6">
            <TeamPool
              teams={
                tierListData.unassigned
                  .map((id) => getTeamById(id))
                  .filter(Boolean) as Team[]
              }
              allTiers={tierListData.tiers}
              selectedTeamId={selectedPoolTeamId}
              onSelectTeam={(teamId) => setSelectedPoolTeamId(teamId)}
              onQuickAssign={handleQuickAssign}
              onRecallAll={handleResetPositions}
              totalTeamsCount={totalTeamsCount}
            />
          </div>

          {/* Tabela Oficial TierMaker */}
          <div
            ref={tierListRef}
            className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#09090d] shadow-2xl mb-8 divide-y divide-white/[0.06]"
          >
            {/* Cabeçalho oficial com design de transmissão esportiva */}
            <div className="relative overflow-hidden px-4 py-3 sm:px-6 sm:py-4.5 bg-[#07070b] border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              {/* Linha de acento dourada sutil no topo do card */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--team-primary,#F4AF23)] to-transparent opacity-80 pointer-events-none" />

              {/* Identidade Kings League */}
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                <div className="relative shrink-0 flex items-center justify-center">
                  <KingsLeagueLogo width={28} height={34} className="sm:w-8 sm:h-[38px] drop-shadow-[0_0_12px_rgba(244,175,35,0.45)]" />
                </div>
                <div className="flex flex-col justify-center select-none min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm sm:text-lg font-black uppercase text-white tracking-wider leading-tight">
                      {selectedLeague.name}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-[var(--team-primary,#F4AF23)] text-black whitespace-nowrap shadow-sm leading-none">
                      {t.nav.tierList}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-zinc-400 font-semibold uppercase tracking-wider truncate mt-0.5 leading-tight">
                    {t.tier.communityRanking}
                  </span>
                </div>
              </div>

              {/* Badge Oficial do Simulador */}
              <div className="flex items-center gap-2 select-none self-end sm:self-auto shrink-0">
                <div className="flex flex-col items-end justify-center px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
                    <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-widest text-zinc-400 leading-none whitespace-nowrap">
                      {t.common.officialSimulator.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-[var(--team-primary,#F4AF23)] leading-none tracking-tight whitespace-nowrap">
                    klsimulator.vercel.app
                  </span>
                </div>
              </div>
            </div>

            {/* Linhas de Tier */}
            {tierListData.tiers.map((tier, index) => (
              <TierRow
                key={tier.id}
                tier={tier}
                teams={
                  tier.teams
                    .map((id) => getTeamById(id))
                    .filter(Boolean) as Team[]
                }
                onUpdateName={handleUpdateTierName}
                onUpdateColor={handleUpdateTierColor}
                onRemove={handleRemoveTier}
                onAddAbove={handleAddTierAbove}
                onAddBelow={handleAddTierBelow}
                onClearTier={handleClearTier}
                onMoveUp={handleMoveTierUp}
                onMoveDown={handleMoveTierDown}
                canRemove={tierListData.tiers.length > 1}
                canMoveUp={index > 0}
                canMoveDown={index < tierListData.tiers.length - 1}
                selectedPoolTeamId={selectedPoolTeamId}
                onQuickAssign={(tierId) => {
                  if (selectedPoolTeamId) {
                    handleQuickAssign(selectedPoolTeamId, tierId)
                  }
                }}
                onRemoveTeam={handleRemoveTeamFromTier}
              />
            ))}

            {/* Marca d'água / Assinatura oficial no rodapé */}
            <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-[#050508] border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-xs gap-2.5 sm:gap-4 select-none text-center sm:text-left">
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center sm:justify-start">
                <AppleEmoji emoji="CROWN" size="sm" alt="" />
                <span className="text-zinc-400 font-medium text-xs">
                  {t.tier.createYourTierAt}
                </span>
                <span className="font-mono font-bold text-xs text-[var(--team-primary,#F4AF23)] bg-white/[0.04] border border-white/10 px-2 sm:px-2.5 py-0.5 rounded break-all sm:break-normal">
                  klsimulator.vercel.app/tier-list
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                {selectedLeague.name} • {t.common.officialSimulator}
              </div>
            </div>
          </div>

          {/* Drag Overlay para o escudo em movimento */}
          <DragOverlay>
            {activeDragTeam && (
              <TeamDraggable team={activeDragTeam} isDragging />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <Footer />
    </main>
  )
}
