"use client"

import { useState, useEffect } from 'react'
import { X, Cookie, Shield, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const COOKIE_CONSENT_KEY = '@kl-simulator:cookie-consent'

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Verificar se o usuário já deu consentimento
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)

    if (!consent) {
      // Mostrar o banner após um pequeno delay para melhor UX
      const timer = setTimeout(() => {
        setIsVisible(true)
        setTimeout(() => setIsAnimating(true), 100)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setIsAnimating(false)
    setTimeout(() => setIsVisible(false), 300)

    // Analytics event (se necessário)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cookie_consent', {
        consent_action: 'accepted'
      })
    }
  }

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected')
    setIsAnimating(false)
    setTimeout(() => setIsVisible(false), 300)

    // Analytics event (se necessário)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cookie_consent', {
        consent_action: 'rejected'
      })
    }
  }

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => setIsVisible(false), 300)
  }

  if (!isVisible) return null

  return (
    <>
      {/* Overlay para focar atenção no banner */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] transition-opacity duration-300",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Banner de Cookies */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 transition-all duration-300 ease-out",
          isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}
        role="dialog"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-description"
        aria-modal="true"
      >
        <div className="container mx-auto max-w-5xl">
          <Card className="bg-card border-border shadow-2xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Ícone */}
                <div className="flex-shrink-0 hidden sm:flex items-start">
                  <div className="p-3 rounded-xl bg-[#F4AF23]/10">
                    <Cookie className="w-6 h-6 text-[#F4AF23]" aria-hidden="true" />
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 sm:hidden">
                      <Cookie className="w-5 h-5 text-[#F4AF23] flex-shrink-0" aria-hidden="true" />
                      <h2
                        id="cookie-banner-title"
                        className="text-base sm:text-lg font-bold text-foreground"
                      >
                        Cookies & Privacidade
                      </h2>
                    </div>
                    <h2
                      id="cookie-banner-title"
                      className="hidden sm:block text-lg font-bold text-foreground"
                    >
                      Cookies & Privacidade
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={handleClose}
                      aria-label="Fechar banner de cookies"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <p
                    id="cookie-banner-description"
                    className="text-sm text-muted-foreground mb-4 leading-relaxed"
                  >
                    Utilizamos cookies essenciais e de análise para melhorar sua experiência
                    de navegação e entender como você interage com o simulador.
                    Não coletamos dados para anúncios personalizados.
                  </p>

                  {/* Detalhes dos Cookies */}
                  <div className="text-xs text-muted-foreground/80 mb-4 space-y-1">
                    <p>
                      <span className="font-semibold text-foreground">Cookies essenciais:</span> Necessários para o funcionamento do site
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">Cookies analíticos:</span> Google Analytics para análise de tráfego
                    </p>
                  </div>

                  {/* Links de Política */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-xs sm:text-sm">
                    <Link
                      href="/politica-de-privacidade"
                      className="flex items-center gap-1.5 text-[#F4AF23] hover:text-[#F4AF23]/80 transition-colors group"
                    >
                      <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="underline-offset-2 group-hover:underline">
                        Política de Privacidade
                      </span>
                    </Link>

                    <div className="w-px h-4 bg-border" aria-hidden="true" />

                    <Link
                      href="/termos-de-uso"
                      className="flex items-center gap-1.5 text-[#F4AF23] hover:text-[#F4AF23]/80 transition-colors group"
                    >
                      <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="underline-offset-2 group-hover:underline">
                        Termos de Uso
                      </span>
                    </Link>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReject}
                      className="w-full sm:w-auto text-sm"
                    >
                      Rejeitar Cookies
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAccept}
                      className="w-full sm:w-auto bg-[#F4AF23] hover:bg-[#F4AF23]/90 text-black font-semibold text-sm"
                    >
                      Aceitar e Continuar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
