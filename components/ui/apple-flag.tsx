"use client"

import React from "react"
import { getAppleEmojiUrl } from "@/lib/apple-emoji"
import { cn } from "@/lib/utils"

export interface AppleFlagProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Código ISO do país ('BR', 'ES', 'MX', 'IT', etc.),
   * chave especial ('WORLD', 'GLOBAL') ou emoji unicode direto ('🇧🇷', '🇪🇸').
   */
  country?: string
  /**
   * Se fornecido, usado como alias/alternativa a `country`.
   */
  emoji?: string
  /**
   * Tamanho pré-definido ou valor numérico em pixels.
   * @default "md" (20px)
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number
  /**
   * Classes extras do Tailwind
   */
  className?: string
  /**
   * Rótulo de acessibilidade
   */
  alt?: string
}

const SIZE_MAP: Record<string, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
}

/**
 * Componente oficial de bandeira no padrão Apple Emoji.
 * Garante que em qualquer dispositivo (especialmente Windows, onde bandeiras Unicode não aparecem),
 * a bandeira seja exibida com o design nítido, curvo e com iluminação característica da Apple.
 */
export function AppleFlag({
  country,
  emoji,
  size = "md",
  className,
  alt,
  ...props
}: AppleFlagProps) {
  const identifier = country || emoji || "WORLD"
  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size] || 20
  const url = getAppleEmojiUrl(identifier)

  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center shrink-0 align-middle select-none",
        className
      )}
      style={{ width: `${pixelSize}px`, height: `${pixelSize}px` }}
      role="img"
      aria-label={alt || `Bandeira ${identifier}`}
    >
      <span
        aria-hidden="true"
        className="font-emoji leading-none"
        style={{ fontSize: `${pixelSize * 0.9}px` }}
      >
        {emoji || country || "🌐"}
      </span>
      <img
        src={url}
        alt=""
        aria-hidden="true"
        width={pixelSize}
        height={pixelSize}
        loading="lazy"
        decoding="async"
        onLoad={(event) => {
          const fallback = event.currentTarget.previousElementSibling as HTMLElement | null
          if (fallback) fallback.style.visibility = "hidden"
        }}
        onError={(event) => {
          event.currentTarget.style.display = "none"
        }}
        className="absolute inset-0 h-full w-full object-contain pointer-events-none drop-shadow-sm"
        {...props}
      />
    </span>
  )
}
