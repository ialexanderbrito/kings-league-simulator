"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Team, TierListData, TierItem } from "@/types/kings-league"
import {
  getTierList,
  saveTierList,
  clearTierList,
  getInitialTierListData,
  encodeTierListToURL,
  decodeTierListFromURL,
  createNewTier,
} from "@/lib/tier-list-manager"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
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
import { ListOrdered } from "lucide-react"

export default function TierList() {
  const [teams, setTeams] = useState<Team[]>([])
  const [tierListData, setTierListData] = useState<TierListData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const tierListRef = useRef<HTMLDivElement>(null)

  // Configurar sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    })
  )

  // Carregar times da API
  useEffect(() => {
    async function loadTeams() {
      try {
        const response = await fetch('/api/teams')
        if (!response.ok) throw new Error('Erro ao carregar times')

        const data = await response.json()
        // API retorna array diretamente, não objeto com .teams
        const teamsArray = Array.isArray(data) ? data : data.teams || []
        const sortedTeams = teamsArray.sort((a: Team, b: Team) =>
          a.name.localeCompare(b.name)
        )
        setTeams(sortedTeams)
      } catch (error) {
        console.error('Erro ao carregar times:', error)
        toast.error('Erro ao carregar times. Tente novamente mais tarde.')
      }
    }

    loadTeams()
  }, [])

  // Carregar tier list salva ou da URL
  useEffect(() => {
    if (teams.length === 0) return

    const allTeamIds = teams.map(t => t.id)

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
          toast.success('Tier list carregada do link!')
          return
        }
      }
    }

    // Senão, carregar do localStorage
    const savedData = getTierList()
    if (savedData) {
      setTierListData({
        tiers: savedData.tiers,
        unassigned: savedData.unassigned
      })
    } else {
      // Criar tier list inicial
      setTierListData(getInitialTierListData(allTeamIds))
    }

    setLoading(false)
  }, [teams])

  // Salvar automaticamente no localStorage
  useEffect(() => {
    if (tierListData && !loading) {
      saveTierList(tierListData)
    }
  }, [tierListData, loading])

  // Handlers de drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragId(null)

    if (!over || !tierListData) return

    const teamId = active.id as string
    const overId = over.id as string

    // Encontrar de onde o time está vindo
    let fromTierId: string | 'unassigned' = 'unassigned'
    if (tierListData.unassigned.includes(teamId)) {
      fromTierId = 'unassigned'
    } else {
      const fromTier = tierListData.tiers.find(t => t.teams.includes(teamId))
      if (fromTier) fromTierId = fromTier.id
    }

    // Determinar para onde está indo
    let toTierId: string | 'unassigned' = overId

    // Se não mudou de lugar, não fazer nada
    if (fromTierId === toTierId) return

    // Criar nova estrutura de dados
    const newData = JSON.parse(JSON.stringify(tierListData)) as TierListData

    // Remover do local de origem
    if (fromTierId === 'unassigned') {
      newData.unassigned = newData.unassigned.filter(id => id !== teamId)
    } else {
      const fromTier = newData.tiers.find(t => t.id === fromTierId)
      if (fromTier) {
        fromTier.teams = fromTier.teams.filter(id => id !== teamId)
      }
    }

    // Adicionar no destino
    if (toTierId === 'unassigned') {
      newData.unassigned.push(teamId)
    } else {
      const toTier = newData.tiers.find(t => t.id === toTierId)
      if (toTier) {
        toTier.teams.push(teamId)
      }
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
      tiers: [...tierListData.tiers, newTier]
    })

    toast.success('Nova tier adicionada!')
  }

  // Remover tier
  const handleRemoveTier = (tierId: string) => {
    if (!tierListData) return

    const tier = tierListData.tiers.find(t => t.id === tierId)
    if (!tier) return

    // Mover times da tier para não atribuídos
    const newData = {
      ...tierListData,
      tiers: tierListData.tiers.filter(t => t.id !== tierId),
      unassigned: [...tierListData.unassigned, ...tier.teams]
    }

    setTierListData(newData)
    toast.success('Tier removida!')
  }

  // Atualizar nome da tier
  const handleUpdateTierName = (tierId: string, newName: string) => {
    if (!tierListData) return

    const newTiers = tierListData.tiers.map(tier =>
      tier.id === tierId ? { ...tier, name: newName } : tier
    )

    setTierListData({
      ...tierListData,
      tiers: newTiers
    })
  }

  // Atualizar cor da tier
  const handleUpdateTierColor = (tierId: string, newColor: string) => {
    if (!tierListData) return

    const newTiers = tierListData.tiers.map(tier =>
      tier.id === tierId ? { ...tier, color: newColor } : tier
    )

    setTierListData({
      ...tierListData,
      tiers: newTiers
    })
  }

  // Resetar tier list
  const handleReset = () => {
    if (!teams.length) return

    const allTeamIds = teams.map(t => t.id)
    const newData = getInitialTierListData(allTeamIds)

    setTierListData(newData)
    clearTierList()

    // Limpar URL
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname)
    }

    toast.success('Tier list resetada!')
  }

  // Baixar como imagem
  const handleDownload = async () => {
    if (!tierListRef.current) return

    try {
      toast.loading('Gerando imagem...', { id: 'download' })

      // Adicionar classe para modo de captura (ocultar elementos interativos)
      tierListRef.current.classList.add('capture-mode')

      // Aguardar um pouco para aplicar os estilos
      await new Promise(resolve => setTimeout(resolve, 100))

      // Capturar a tier list usando snapdom com proxy para CORS
      const capture = await snapdom(tierListRef.current, {
        scale: 2,
        useProxy: 'https://proxy.corsfix.com/?'
      })
      const canvas = await capture.toCanvas()

      // Remover classe de captura
      tierListRef.current.classList.remove('capture-mode')

      // Criar canvas final com watermark
      const finalCanvas = document.createElement('canvas')
      const ctx = finalCanvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')

      const watermarkHeight = 60
      finalCanvas.width = canvas.width
      finalCanvas.height = canvas.height + watermarkHeight

      // Fundo
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height)

      // Desenhar tier list
      ctx.drawImage(canvas, 0, 0)

      // Watermark
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, canvas.height, finalCanvas.width, watermarkHeight)

      // Linha separadora
      ctx.strokeStyle = '#F4AF23'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, canvas.height)
      ctx.lineTo(finalCanvas.width, canvas.height)
      ctx.stroke()

      // Texto do watermark
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Criado em klsimulator.vercel.app/tier-list', finalCanvas.width / 2, canvas.height + watermarkHeight / 2)

      // Ícone decorativo (coroa)
      ctx.fillStyle = '#F4AF23'
      ctx.font = '28px system-ui'
      const textWidth = ctx.measureText('Criado em klsimulator.vercel.app/tier-list').width
      ctx.fillText('👑', (finalCanvas.width / 2) - (textWidth / 2) - 40, canvas.height + watermarkHeight / 2)

      const link = document.createElement('a')
      link.download = 'tier-list-kings-league.png'
      link.href = finalCanvas.toDataURL('image/png')
      link.click()

      toast.success('Imagem baixada com sucesso!', { id: 'download' })
    } catch (error) {
      console.error('Erro ao gerar imagem:', error)
      // Garantir que a classe seja removida em caso de erro
      tierListRef.current?.classList.remove('capture-mode')
      toast.error('Erro ao gerar imagem. Tente novamente.', { id: 'download' })
    }
  }

  // Compartilhar via URL
  const handleShare = async () => {
    if (!tierListData) return

    try {
      const encoded = encodeTierListToURL(tierListData)
      const url = `${window.location.origin}${window.location.pathname}#data=${encoded}`

      // Tentar usar Web Share API se disponível (mobile)
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Minha Tier List Kings League',
            text: 'Confira minha tier list da Kings League!',
            url: url,
          })
          toast.success('Compartilhado com sucesso!')
          return
        } catch (shareError) {
          // Se o usuário cancelar ou não suportar, tentar clipboard
          console.log('Web Share cancelado ou não suportado, usando clipboard')
        }
      }

      // Fallback: copiar para clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url)
        toast.success('Link copiado para a área de transferência!')
      } else {
        // Fallback para navegadores antigos
        const textArea = document.createElement('textarea')
        textArea.value = url
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          document.execCommand('copy')
          toast.success('Link copiado para a área de transferência!')
        } catch {
          toast.error('Não foi possível copiar o link. URL: ' + url)
        }

        document.body.removeChild(textArea)
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
      toast.error('Erro ao gerar link de compartilhamento.')
    }
  }

  // Obter team por ID
  const getTeamById = useCallback((id: string): Team | undefined => {
    return teams.find(t => t.id === id)
  }, [teams])

  // Obter time sendo arrastado
  const activeDragTeam = activeDragId ? getTeamById(activeDragId) : null

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId)
  }

  if (loading) {
    return <TierListSkeleton />
  }

  if (!tierListData) {
    return (
      <main className="min-h-screen bg-[#0a0a0a]">
        <Header
          loading={false}
          selectedTeam={selectedTeam}
          onTeamSelect={handleTeamSelect}
          setActiveTab={() => { }}
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-white">Erro ao carregar tier list</p>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header
        loading={false}
        selectedTeam={selectedTeam}
        onTeamSelect={handleTeamSelect}
        setActiveTab={() => { }}
      />

      <div className="container mx-auto px-4 py-6 sm:py-10">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <ListOrdered className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Tier List
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                Arraste os times para criar seu ranking personalizado
              </p>
            </div>
          </div>
        </div>

        {/* Controles */}
        <TierControls
          onAddTier={handleAddTier}
          onReset={handleReset}
          onDownload={handleDownload}
          onShare={handleShare}
          canShare={true}
        />

        {/* Tier List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div ref={tierListRef} className="space-y-4 mb-8">
            {tierListData.tiers.map((tier) => (
              <TierRow
                key={tier.id}
                tier={tier}
                teams={tier.teams.map(id => getTeamById(id)).filter(Boolean) as Team[]}
                onUpdateName={handleUpdateTierName}
                onUpdateColor={handleUpdateTierColor}
                onRemove={handleRemoveTier}
                canRemove={tierListData.tiers.length > 1}
              />
            ))}
          </div>

          {/* Pool de times não atribuídos */}
          <TeamPool
            teams={tierListData.unassigned.map(id => getTeamById(id)).filter(Boolean) as Team[]}
          />

          {/* Drag Overlay */}
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
