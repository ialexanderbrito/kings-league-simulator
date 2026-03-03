import { useState } from "react"
import { snapdom } from "@zumer/snapdom"

interface CaptureOptions {
  filename?: string
  quality?: number
  format?: "png" | "jpg" | "webp"
  showOverlay?: boolean
  overlayDelay?: number
}

export function useSimulationCapture() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCaptureOverlay, setShowCaptureOverlay] = useState(false)

  const captureAndDownload = async (
    elementId: string,
    options: CaptureOptions = {}
  ) => {
    const {
      filename = `kings-league-simulacao-${new Date().toISOString().split('T')[0]}.png`,
      quality = 1,
      format = "png",
      showOverlay = true,
      overlayDelay = 300
    } = options

    setIsCapturing(true)
    setError(null)

    try {
      const element = document.getElementById(elementId)
      
      if (!element) {
        throw new Error(`Elemento com ID '${elementId}' não encontrado`)
      }

      // Mostra o overlay se necessário
      if (showOverlay) {
        setShowCaptureOverlay(true)
        // Aguarda um momento para o overlay renderizar
        await new Promise(resolve => setTimeout(resolve, overlayDelay))
      }

      // Captura o elemento usando snapdom
      const capture = await snapdom(element, {
        scale: window.devicePixelRatio || 2,
        useProxy: 'https://proxy.corsfix.com/?'
      })
      const canvas = await capture.toCanvas()

      // Remove o overlay após a captura
      if (showOverlay) {
        setShowCaptureOverlay(false)
      }

      // Converte canvas para blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob),
          `image/${format}`,
          quality
        )
      })

      if (!blob) {
        throw new Error("Falha ao gerar imagem")
      }

      // Cria um link temporário para download
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Limpa o objeto URL
      setTimeout(() => URL.revokeObjectURL(url), 100)

      setIsCapturing(false)
      return true
    } catch (err) {
      console.error("Erro ao capturar simulação:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido ao capturar imagem")
      setIsCapturing(false)
      setShowCaptureOverlay(false)
      return false
    }
  }

  const captureToClipboard = async (elementId: string) => {
    setIsCapturing(true)
    setError(null)

    try {
      const element = document.getElementById(elementId)
      
      if (!element) {
        throw new Error(`Elemento com ID '${elementId}' não encontrado`)
      }

      // Captura o elemento usando snapdom
      const capture = await snapdom(element, {
        scale: window.devicePixelRatio || 2,
        useProxy: 'https://proxy.corsfix.com/?'
      })
      const canvas = await capture.toCanvas()

      // Converte canvas para blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob),
          'image/png',
          1
        )
      })

      if (!blob) {
        throw new Error("Falha ao gerar imagem")
      }

      // Copia para a área de transferência (apenas em navegadores compatíveis)
      if (navigator.clipboard && ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ])
        setIsCapturing(false)
        return true
      } else {
        throw new Error("Navegador não suporta copiar imagem para área de transferência")
      }
    } catch (err) {
      console.error("Erro ao copiar simulação:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido ao copiar imagem")
      setIsCapturing(false)
      return false
    }
  }

  return {
    captureAndDownload,
    captureToClipboard,
    isCapturing,
    showCaptureOverlay,
    error,
  }
}
