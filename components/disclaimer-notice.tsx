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
  const [visitCount, setVisitCount] = useState(0)

  useEffect(() => {
    setIsMounted(true)

    // Sempre mostrar se forceShow for true
    if (forceShow) {
      setIsVisible(true);
      return;
    }

    // Verificar quantas vezes o usuário visitou o site
    const visits = localStorage.getItem('@kl-simulador:visit-count')
    const currentVisits = visits ? parseInt(visits) : 0
    setVisitCount(currentVisits + 1)

    // Salvar a contagem de visitas atualizada
    localStorage.setItem('@kl-simulador:visit-count', (currentVisits + 1).toString())

    // Verificar se o disclaimer foi fechado
    const disclaimerClosed = localStorage.getItem('@kl-simulador:disclaimer-closed')

    // Mostrar sempre nas primeiras 3 visitas ou se nunca foi fechado
    if (currentVisits < 3 || !disclaimerClosed) {
      setIsVisible(true)
    }
  }, [forceShow])

  const handleClose = () => {
    setIsClosing(true)

    setTimeout(() => {
      if (!forceShow) {
        // Salvar que o usuário fechou o disclaimer
        localStorage.setItem('@kl-simulador:disclaimer-closed', 'true')
      }
      setIsVisible(false)
      setIsClosing(false)
    }, 300)
  }

  if (!isMounted || !isVisible) {
    return null
  }

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${isClosing ? 'opacity-0 transform translate-y-[-10px]' : 'opacity-100'}`}
    >
      <Alert className="mb-6 bg-[#1a1a1a] border-[#333] text-white relative">
        <Info className="h-4 w-4 text-gray-400" />
        <AlertTitle className="text-gray-200 pr-8 font-bold">Simulador Não Oficial</AlertTitle>
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
        <AlertDescription className="text-sm text-gray-300">
          Este é um simulador não oficial da Kings League, criado por fãs para fãs.
          Este site não possui qualquer afiliação, endosso ou vínculo oficial com a
          Kings League, seus organizadores, jogadores ou marcas associadas. Todos os
          nomes, logotipos e conteúdos relacionados à Kings League são propriedade de
          seus respectivos donos. Para mais informações, consulte nossos <a href="/termos-de-uso" className="text-blue-400 hover:underline">Termos de Uso</a> e <a href="/politica-de-privacidade" className="text-blue-400 hover:underline">Política de Privacidade</a>.
        </AlertDescription>
      </Alert>
    </div>
  )
}