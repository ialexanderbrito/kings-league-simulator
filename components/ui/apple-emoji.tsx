"use client"

import React, { useState } from "react"
import { getAppleEmojiUrl } from "@/lib/apple-emoji"
import { cn } from "@/lib/utils"

export interface AppleEmojiProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Emoji direto ('🥇', '🥈', '🥉', '🏆', '🔥', '👑', '🇧🇷') ou identificador ('MEDAL_1', 'TROPHY').
   */
  emoji: string
  /**
   * Tamanho em pixels ou pré-definido ('sm' = 16, 'md' = 20, 'lg' = 24, 'xl' = 32)
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number
  className?: string
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
 * Componente oficial para renderização de qualquer emoji no estilo icônico da Apple.
 */
export function AppleEmoji({
  emoji,
  size = "md",
  className,
  alt,
  ...props
}: AppleEmojiProps) {
  const [hasError, setHasError] = useState(false)

  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size] || 20
  const url = getAppleEmojiUrl(emoji)

  if (hasError || !url) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center font-emoji select-none leading-none align-middle",
          className
        )}
        style={{ fontSize: `${pixelSize * 0.9}px` }}
        role="img"
        aria-label={alt || emoji}
      >
        {emoji}
      </span>
    )
  }

  return (
    <img
      src={url}
      alt={alt || emoji}
      width={pixelSize}
      height={pixelSize}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      className={cn(
        "inline-block object-contain shrink-0 align-middle select-none pointer-events-none drop-shadow-sm",
        className
      )}
      style={{
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
      }}
      {...props}
    />
  )
}
