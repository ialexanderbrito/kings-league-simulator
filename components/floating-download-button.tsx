"use client"

import { Download } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSimulationCapture } from "@/hooks/use-simulation-capture"
import { useToast } from "@/hooks/use-toast"

export function FloatingDownloadButton() {
  const { captureAndDownload, isCapturing } = useSimulationCapture()
  const { toast } = useToast()
  const pathname = usePathname()

  // Mostrar apenas na rota /simulator
  if (pathname !== '/simulator') {
    return null
  }

  const handleDownloadSimulation = async () => {
    const success = await captureAndDownload('simulation-content', {
      filename: `kings-league-simulacao-${new Date().toISOString().split('T')[0]}.png`,
      quality: 1,
      format: 'png'
    })

    if (success) {
      toast({
        title: "Simulação salva! 🎉",
        description: "Sua simulação foi baixada com sucesso. Compartilhe com seus amigos!",
        variant: "default",
      })
    } else {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a simulação. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <button
      onClick={handleDownloadSimulation}
      disabled={isCapturing}
      className={cn(
        "fixed bottom-6 right-6 z-30",
        "flex items-center gap-3 px-5 h-14 rounded-2xl",
        "bg-[#111111] hover:bg-[#1a1a1a]",
        "border border-white/10 hover:border-white/20",
        "shadow-2xl shadow-black/50",
        "text-gray-300 hover:text-white font-medium text-sm",
        "transition-all duration-200",
        "md:hidden", // Apenas no mobile, pois no desktop já tem o botão no header
        isCapturing && "opacity-50 cursor-not-allowed"
      )}
      aria-label="Baixar simulação como imagem"
    >
      {isCapturing ? (
        <>
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span>Gerando...</span>
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          <span>Baixar simulação</span>
        </>
      )}
    </button>
  )
}
