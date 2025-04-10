"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Info, X } from "lucide-react"

interface DisclaimerNoticeProps {
  forceShow?: boolean;
}

export default function DisclaimerNotice({ forceShow = false }: DisclaimerNoticeProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Só executa no lado do cliente
    setIsMounted(true)

    // Se forceShow for true, exibimos independentemente do localStorage
    if (forceShow) {
      setIsVisible(true);
      return;
    }

    // Verifica se o usuário já fechou o disclaimer anteriormente
    const disclaimerClosed = localStorage.getItem('disclaimer-closed')
    if (!disclaimerClosed) {
      setIsVisible(true)
    }
  }, [forceShow])

  const handleClose = () => {
    // Inicia a animação de fechamento
    setIsClosing(true)

    // Após a animação, esconde o componente e salva no localStorage
    setTimeout(() => {
      if (!forceShow) {
        localStorage.setItem('disclaimer-closed', 'true')
      }
      setIsVisible(false)
      setIsClosing(false)
    }, 300) // Tempo da transição
  }

  // Se não estiver montado (SSR) ou não estiver visível, não renderiza nada
  if (!isMounted || !isVisible) {
    return null
  }

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${isClosing ? 'opacity-0 transform translate-y-[-10px]' : 'opacity-100'
        }`}
    >
      <Alert className="mb-6 bg-[#1a1a1a] border-[#333] text-white relative">
        <Info className="h-4 w-4 text-gray-400" />
        <AlertTitle className="text-gray-200 pr-8">Simulador Não Oficial</AlertTitle>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 rounded-full p-0 text-gray-400 hover:text-white hover:bg-[#333]"
          onClick={handleClose}
          aria-label="Fechar aviso"
        >
          <X className="h-4 w-4 mr-7" />
          <span className="sr-only">Fechar</span>
        </Button>
        <AlertDescription className="text-sm text-gray-400">
          Este é um simulador não oficial da Kings League, criado por fãs para fãs.
          Este site não possui qualquer afiliação, endosso ou vínculo oficial com a
          Kings League, seus organizadores, jogadores ou marcas associadas. Todos os
          nomes, logotipos e conteúdos relacionados à Kings League são propriedade de
          seus respectivos donos.
        </AlertDescription>
      </Alert>
    </div>
  )
}