import '@/styles/globals.css'
import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider'
import { TeamThemeProvider } from '@/contexts/team-theme-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kings League Simulator',
  description: 'Simulador da Kings League, explore partidas, classificação e estatísticas. Este site não possui vínculo com a Kings League oficial.',
  authors: [{ name: 'ialexanderbrito', url: 'https://ialexanderbrito.dev' }],
  creator: 'ialexanderbrito',
  publisher: 'Kings League Simulator',
  keywords: 'kings league, futebol, simulador, esportes, campeonato, estatísticas futebol, simulador de torneio',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Kings League Simulator',
    description: 'Simulador da Kings League, explore partidas, classificação e estatísticas. Este site não possui vínculo com a Kings League oficial.',
    siteName: 'Kings League Simulator',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://kings-league-simulator.vercel.app',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kings League Simulator - Simulador Não Oficial',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kings League Simulator',
    description: 'Simulador da Kings League, explore partidas, classificação e estatísticas. Sem vínculo com a Kings League oficial.',
    images: ['/og-image-x.png'],
  },
  alternates: {
    canonical: 'https://kings-league-simulator.vercel.app',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4240296013936173" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="kings-league-theme"
        >
          <TeamThemeProvider>
            {children}
            <Analytics />
            <Toaster />
          </TeamThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
