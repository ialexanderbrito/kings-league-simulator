import React from "react"

interface GradientTitleProps {
  title: string
  highlight?: string
  className?: string
}

export const TITLE_GRADIENT_CLASS =
  "bg-gradient-to-r from-[var(--team-primary)] via-amber-300 to-[var(--team-primary)] bg-clip-text text-transparent"

/**
 * Renderiza títulos com o destaque oficial em gradiente dourado da Kings League
 * bg-gradient-to-r from-[var(--team-primary)] via-amber-300 to-[var(--team-primary)] bg-clip-text text-transparent
 */
export function GradientTitle({ title, highlight, className }: GradientTitleProps) {
  if (!title) return null

  // Destaque explícito
  if (highlight && title.includes(highlight)) {
    const parts = title.split(highlight)
    return (
      <span className={className}>
        {parts[0]}
        <span className={TITLE_GRADIENT_CLASS}>{highlight}</span>
        {parts.slice(1).join(highlight)}
      </span>
    )
  }

  // Destaques automáticos dos títulos das páginas
  const autoTargets = ["Kings League", "12a0", "Presidentes", "Presidents"]
  for (const target of autoTargets) {
    if (title.includes(target)) {
      const parts = title.split(target)
      return (
        <span className={className}>
          {parts[0]}
          <span className={TITLE_GRADIENT_CLASS}>{target}</span>
          {parts.slice(1).join(target)}
        </span>
      )
    }
  }

  return <span className={className}>{title}</span>
}
