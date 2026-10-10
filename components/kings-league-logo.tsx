import React from 'react'

interface KingsLeagueLogoProps {
  className?: string
  width?: number
  height?: number
  size?: number
  'aria-label'?: string
}

export default function KingsLeagueLogo({
  className = '',
  width,
  height,
  size,
  'aria-label': ariaLabel = 'Kings League Simulador',
}: KingsLeagueLogoProps) {
  // Proportional scaling defaulting to clean 32px
  const resolvedWidth = size ?? width ?? 32
  const resolvedHeight = size ?? height ?? (width ? width : 32)

  return (
    <svg
      className={className}
      width={resolvedWidth}
      height={resolvedHeight}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        {/* Shield Border Gradient: Brilliant Gold to Amber */}
        <linearGradient id="kl-shield-border" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="30%" stopColor="#FDE047" />
          <stop offset="70%" stopColor="#F4AF23" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Shield Interior: Deep Dark Glass */}
        <linearGradient id="kl-shield-bg" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E1E24" />
          <stop offset="60%" stopColor="#0E0E12" />
          <stop offset="100%" stopColor="#050507" />
        </linearGradient>

        {/* Crown Gold Gradient */}
        <linearGradient id="kl-shield-crown" x1="7" y1="8" x2="25" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="25%" stopColor="#FEF08A" />
          <stop offset="60%" stopColor="#F4AF23" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Escudo Externo com Borda Dourada Líquida */}
      <path
        d="M16 2.5L26.5 6.2V15.8C26.5 22.3 22 27.4 16 29.5C10 27.4 5.5 22.3 5.5 15.8V6.2L16 2.5Z"
        fill="url(#kl-shield-bg)"
        stroke="url(#kl-shield-border)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Reflexo Sutil de Luz no Topo do Escudo */}
      <path
        d="M8.5 7.2L16 4.4L23.5 7.2"
        stroke="#FFFFFF"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.25"
      />

      {/* Coroa Pure Crown Interna com Recorte em Diamante */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.5 11.5L12 18.5L16 8.5L20 18.5L23.5 11.5L21.5 20.5H10.5L8.5 11.5ZM16 11.8L17.5 14.5L16 17.2L14.5 14.5L16 11.8Z"
        fill="url(#kl-shield-crown)"
        stroke="#FFFBEB"
        strokeWidth="0.4"
        strokeLinejoin="round"
      />

      {/* Barra de Base / Pedestal da Coroa */}
      <rect
        x="9.5"
        y="22"
        width="13"
        height="1.8"
        rx="0.9"
        fill="url(#kl-shield-crown)"
      />
      <rect
        x="11"
        y="22.3"
        width="10"
        height="0.6"
        rx="0.3"
        fill="#FFFFFF"
        opacity="0.4"
      />
    </svg>
  )
}
