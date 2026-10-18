import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Modo 12a0 | Draft Tático & Desafio de Campanha Kings League",
  description: "Monte sua escalação 7v7, role o dado para sortear os clubes, escale craques e lendas e vença a campanha no modo 12a0 da Kings League Brasil! 100% Grátis.",
  openGraph: {
    title: "Modo 12a0 Kings League Brasil | Draft Tático & Campanha",
    description: "Monte sua seleção 7v7, enfrente os desafios da liga e conquiste a vitória perfeita na Kings League Brasil! 100% GRÁTIS.",
    type: "website",
    url: "https://kings-league-simulator.vercel.app/12a0",
    images: [
      {
        url: "/og-12a0.png",
        width: 1200,
        height: 630,
        alt: "Modo 12a0 Kings League Brasil - Draft Tático e Campanha",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Modo 12a0 Kings League Brasil | Draft Tático & Campanha",
    description: "Monte sua seleção 7v7, enfrente os desafios da liga e vença a campanha! 100% GRÁTIS.",
    images: [
      {
        url: "/og-12a0.png",
        width: 1200,
        height: 630,
        alt: "Modo 12a0 Kings League Brasil Preview",
      },
    ],
  },
  alternates: {
    canonical: "https://kings-league-simulator.vercel.app/12a0",
  },
}

export default function DozeAZeroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
