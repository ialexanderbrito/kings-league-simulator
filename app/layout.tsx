import { Analytics } from '@vercel/analytics/react'
import { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'Kings League Simulator',
  description: 'Simulador oficial da Kings League, onde você pode acompanhar partidas, classificação e estatísticas dos times.',
  keywords: 'kings league, futebol, simulador, esportes, campeonato',
  authors: [{ name: 'ialexanderbrito', url: 'https://ialexanderbrito.dev' }],
  creator: 'ialexanderbrito',
  publisher: 'Kings League',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://kings-league-simulator.vercel.app',
    title: 'Kings League Simulator',
    description: 'Simulador oficial da Kings League, acompanhe partidas e estatísticas',
    siteName: 'Kings League Simulator',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kings League Simulator Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kings League Simulator',
    description: 'Simulador oficial da Kings League, acompanhe partidas e estatísticas',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.svg" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
