import '@/styles/globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider'
import { TeamThemeProvider } from '@/contexts/team-theme-context'
import { ButtonTop } from "@/components/ui/button-top"
import { LeaguesSuggestionModal } from '@/components/leagues-suggestion-modal'
import { CookieConsentBanner } from '@/components/cookie-consent-banner'
import Script from 'next/script'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Melhoria de desempenho para carregamento de fontes
  variable: '--font-inter'
})

// Definindo Viewport separadamente para melhor organização
export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

// Metadados otimizados para SEO
export const metadata: Metadata = {
  title: {
    default: 'Kings League Brasil | Simulador Oficial, Tabela, Resultados e Estatísticas',
    template: '%s | Kings League Brasil Simulador'
  },
  description: 'O simulador MAIS COMPLETO da Kings League Brasil! ⚽ Simule partidas em tempo real, acompanhe a tabela de classificação atualizada, estatísticas completas de jogadores e times, chaveamento dos playoffs e preveja quem será o campeão. Dados oficiais e atualizados automaticamente!',
  authors: [{ name: 'ialexanderbrito', url: 'https://ialexanderbrito.dev' }],
  creator: 'ialexanderbrito',
  publisher: 'Kings League Simulador',
  keywords: [
    'kings league brasil', 'kings league simulador', 'simulador kings league',
    'simulador de partidas kings league', 'tabela kings league atualizada',
    'classificação kings league ao vivo', 'resultados kings league tempo real',
    'placar kings league hoje', 'jogos kings league hoje',
    'playoffs kings league', 'chaveamento kings league', 'final kings league',
    'quartas de final kings league', 'semifinal kings league',
    'quem vai ganhar kings league', 'campeão kings league',
    'times da kings league brasil', 'jogadores kings league brasil',
    'estatísticas kings league', 'artilharia kings league',
    'melhor time kings league', 'ranking times kings league',
    'como funciona kings league', 'regras kings league',
    'quando começa kings league', 'onde assistir kings league',
    'palpites kings league', 'prognósticos kings league',
    'previsão kings league',
    'futebol 7', 'gerard piqué liga', 'liga futebol influencers',
    'gaules kings league'
  ],
  category: 'Esportes',
  applicationName: 'Kings League Simulador',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Kings League Brasil | Simulador Oficial com Dados em Tempo Real ⚽',
    description: '🏆 O MELHOR simulador da Kings League Brasil! Simule partidas, veja a tabela atualizada, estatísticas completas, playoffs e preveja o campeão. Totalmente GRÁTIS e com dados oficiais atualizados automaticamente!',
    siteName: 'Kings League Brasil Simulador',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://kings-league-simulator.vercel.app',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kings League Simulador - Sua experiência completa da Kings League',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kings League Brasil ⚽ | Simulador Oficial + Tabela + Estatísticas',
    description: '🏆 Simulador COMPLETO da Kings League Brasil! ⚡ Simule partidas, veja estatísticas, tabela atualizada e preveja o campeão. 100% GRÁTIS!',
    creator: '@ialexanderbrito',
    site: '@kingsleague',
    images: [
      {
        url: '/og-image-x.png',
        alt: 'Kings League Simulador Preview',
        width: 1200,
        height: 630,
      }
    ],
  },
  alternates: {
    canonical: 'https://kings-league-simulator.vercel.app',
    languages: {
      'pt-BR': 'https://kings-league-simulator.vercel.app',
    },
  },
  manifest: '/manifest.json',
  metadataBase: new URL('https://kings-league-simulator.vercel.app'),
  other: {
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'color-scheme': 'dark',
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

        {/* Preconnect para melhorar performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />

        <meta name="google-adsense-account" content="ca-pub-4240296013936173" />
      </head>
      <body className={`${inter.className} min-h-screen antialiased`} suppressHydrationWarning>
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4240296013936173`}
          crossOrigin="anonymous"
        />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-GCWCQ08JFR"
          strategy="afterInteractive"
          id="google-analytics"
        />
        <Script
          id="google-analytics-config"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GCWCQ08JFR');
          `}
        </Script>

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="kings-league-theme"
        >
          <TeamThemeProvider>
            {children}
            <Toaster />
            <ButtonTop />
            <LeaguesSuggestionModal />
            <CookieConsentBanner />
          </TeamThemeProvider>
        </ThemeProvider>

        {/* Schema.org estruturado para mecanismos de busca */}
        <script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Kings League Brasil Simulador",
              "url": "https://kings-league-simulator.vercel.app",
              "logo": "https://kings-league-simulator.vercel.app/favicon.svg",
              "description": "Simulador completo da Kings League Brasil com estatísticas em tempo real, simulações de partidas, classificação ao vivo, playoffs e previsões de resultados.",
              "applicationCategory": "SportsApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "BRL",
                "availability": "https://schema.org/InStock"
              },
              "author": {
                "@type": "Person",
                "name": "Alexander Brito",
                "url": "https://github.com/ialexanderbrito"
              },
              "inLanguage": "pt-BR",
              "isAccessibleForFree": true,
              "potentialAction": [
                {
                  "@type": "ViewAction",
                  "target": "https://kings-league-simulator.vercel.app",
                  "name": "Acessar Simulador"
                },
                {
                  "@type": "InteractAction",
                  "target": "https://kings-league-simulator.vercel.app/simulator",
                  "name": "Simular Partidas"
                }
              ],
              "mainEntity": {
                "@type": "SportsOrganization",
                "name": "Kings League Brasil",
                "sport": "Football",
                "memberOf": {
                  "@type": "SportsOrganization",
                  "name": "Kings League"
                }
              }
            })
          }}
        />
      </body>
    </html>
  )
}
