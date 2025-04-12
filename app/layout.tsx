import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider'
import { TeamThemeProvider } from '@/contexts/team-theme-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kings League Simulator',
  description: 'Simulador da Kings League, explore partidas, classificação e estatísticas. Este site não possui vínculo com a Kings League oficial.',
  openGraph: {
    title: 'Kings League Simulator',
    description: 'Simulador da Kings League, explore partidas, classificação e estatísticas. Este site não possui vínculo com a Kings League oficial.',
    siteName: 'Kings League Simulator',
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
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="kings-league-theme"
        >
          <TeamThemeProvider>
            {children}
            <Toaster />
          </TeamThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
