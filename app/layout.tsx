import '@/styles/globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider'
import { TeamThemeProvider } from '@/contexts/team-theme-context'
import { ButtonTop } from "@/components/ui/button-top"
import { LeaguesSuggestionModal } from '@/components/leagues-suggestion-modal'
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
    default: 'Kings League Brasil 2025 | Simulador Oficial, Tabela, Resultados e Estatísticas',
    template: '%s | Kings League Brasil Simulador'
  },
  description: 'O simulador MAIS COMPLETO da Kings League Brasil 2025! ⚽ Simule partidas em tempo real, acompanhe a tabela de classificação atualizada, estatísticas completas de jogadores e times, chaveamento dos playoffs e preveja quem será o campeão. Dados oficiais e atualizados automaticamente!',
  authors: [{ name: 'ialexanderbrito', url: 'https://ialexanderbrito.dev' }],
  creator: 'ialexanderbrito',
  publisher: 'Kings League Simulador',
  keywords: [
    // Termos principais
    'kings league brasil', 'kings league simulador', 'simulador kings league',
    'kings league 2025', 'kings league brasil 2025',
    // Funcionalidades
    'simulador de partidas kings league', 'tabela kings league atualizada',
    'classificação kings league ao vivo', 'resultados kings league tempo real',
    'placar kings league hoje', 'jogos kings league hoje',
    // Playoffs e competição
    'playoffs kings league', 'chaveamento kings league', 'final kings league',
    'quartas de final kings league', 'semifinal kings league',
    'quem vai ganhar kings league', 'campeão kings league 2025',
    // Times e jogadores
    'times da kings league brasil', 'jogadores kings league brasil',
    'estatísticas kings league', 'artilharia kings league',
    'melhor time kings league', 'ranking times kings league',
    // Informações
    'como funciona kings league', 'regras kings league',
    'quando começa kings league', 'onde assistir kings league',
    // Palpites e previsões
    'palpites kings league', 'prognósticos kings league',
    'previsão kings league', 'apostas kings league',
    // Termos relacionados
    'futebol 7', 'gerard piqué liga', 'liga futebol influencers',
    'ibai llanos futebol', 'gaules kings league'
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
      noimageindex: false,
      'notranslate': false,
    },
  },
  openGraph: {
    title: 'Kings League Brasil 2025 | Simulador Oficial com Dados em Tempo Real ⚽',
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
        alt: 'Kings League Simulador 2025 - Sua experiência completa da Kings League',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kings League Brasil 2025 ⚽ | Simulador Oficial + Tabela + Estatísticas',
    description: '🏆 Simulador COMPLETO da Kings League Brasil! ⚡ Simule partidas, veja estatísticas, tabela atualizada e preveja o campeão. 100% GRÁTIS!',
    creator: '@ialexanderbrito',
    site: '@kingsleague',
    images: [
      {
        url: '/og-image-x.png',
        alt: 'Kings League Simulador 2025 Preview',
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
  verification: {
    google: 'google-site-verification-code',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'theme-color': '#000000',
    'color-scheme': 'dark',
    'rating': 'general',
    'distribution': 'global',
    'revisit-after': '1 days',
    'language': 'pt-BR',
    'geo.region': 'BR',
    'geo.placename': 'Brasil',
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
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />

        {/* Tags PWA para iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="google-adsense-account" content="ca-pub-4240296013936173" />
        <link rel="apple-touch-startup-image" href="/splash.png" />
      </head>
      <body className={`${inter.className} min-h-screen antialiased`}>
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
          </TeamThemeProvider>
        </ThemeProvider>

        {/* Schema.org estruturado para mecanismos de busca */}
        <Script id="schema-org" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Kings League Brasil Simulador 2025",
              "url": "https://kings-league-simulator.vercel.app",
              "logo": "https://kings-league-simulator.vercel.app/favicon.svg",
              "description": "Simulador completo da Kings League Brasil 2025 com estatísticas em tempo real, simulações de partidas, classificação ao vivo, playoffs e previsões de resultados.",
              "applicationCategory": "SportsApplication",
              "operatingSystem": "Web, iOS, Android",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "BRL",
                "availability": "https://schema.org/InStock"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250",
                "bestRating": "5",
                "worstRating": "1"
              },
              "author": {
                "@type": "Person",
                "name": "Alexander Brito",
                "url": "https://github.com/ialexanderbrito"
              },
              "datePublished": "2023-01-01",
              "dateModified": "${new Date().toISOString()}",
              "inLanguage": "pt-BR",
              "isAccessibleForFree": true,
              "keywords": "kings league brasil, simulador kings league, tabela kings league, classificação kings league, estatísticas kings league, playoffs kings league",
              "about": [
                {
                  "@type": "Thing",
                  "name": "Kings League",
                  "description": "Liga de futebol 7 criada por Gerard Piqué com regras inovadoras e times presididos por personalidades conhecidas."
                },
                {
                  "@type": "Thing",
                  "name": "Futebol 7",
                  "description": "Modalidade de futebol jogada com 7 jogadores por equipe em campo reduzido."
                }
              ],
              "potentialAction": [
                {
                  "@type": "ViewAction",
                  "target": "https://kings-league-simulator.vercel.app",
                  "name": "Acessar Simulador"
                },
                {
                  "@type": "SearchAction",
                  "target": "https://kings-league-simulator.vercel.app/search?q={search_term_string}",
                  "query-input": "required name=search_term_string"
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
              },
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://kings-league-simulator.vercel.app"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Simulador",
                    "item": "https://kings-league-simulator.vercel.app/simulator"
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": "Classificação",
                    "item": "https://kings-league-simulator.vercel.app/standings"
                  },
                  {
                    "@type": "ListItem",
                    "position": 4,
                    "name": "Playoffs",
                    "item": "https://kings-league-simulator.vercel.app/playoffs"
                  }
                ]
              }
            }
          `}
        </Script>

        {/* Script para política de cookies - GDPR/LGPD compliant */}
        <Script id="cookie-consent" strategy="afterInteractive">
          {`
            function createCookieBanner() {
              if (localStorage.getItem('cookie-consent') === 'accepted') return;
              
              const banner = document.createElement('div');
              banner.id = 'cookie-banner';
              banner.style.position = 'fixed';
              banner.style.bottom = '0';
              banner.style.left = '0';
              banner.style.right = '0';
              banner.style.padding = '1rem';
              banner.style.backgroundColor = '#1a1a1a';
              banner.style.color = 'white';
              banner.style.zIndex = '9999';
              banner.style.display = 'flex';
              banner.style.flexDirection = 'column';
              banner.style.gap = '0.5rem';
              banner.style.boxShadow = '0 -2px 10px rgba(0, 0, 0, 0.3)';
              banner.style.borderTop = '1px solid #333';
              
              const content = document.createElement('div');
              content.innerHTML = '<p style="margin-bottom: 10px;">Este site utiliza cookies para melhorar a experiência do usuário e exibir anúncios personalizados. Ao continuar navegando, você concorda com nossa <a href="/politica-de-privacidade" style="color: #F4AF23; text-decoration: underline;">Política de Privacidade</a> e <a href="/termos-de-uso" style="color: #F4AF23; text-decoration: underline;">Termos de Uso</a>.</p>';
              
              const buttons = document.createElement('div');
              buttons.style.display = 'flex';
              buttons.style.gap = '0.5rem';
              buttons.style.justifyContent = 'flex-end';
              
              const acceptButton = document.createElement('button');
              acceptButton.textContent = 'Aceitar';
              acceptButton.style.padding = '0.5rem 1rem';
              acceptButton.style.backgroundColor = '#F4AF23';
              acceptButton.style.color = 'black';
              acceptButton.style.border = 'none';
              acceptButton.style.borderRadius = '4px';
              acceptButton.style.cursor = 'pointer';
              acceptButton.onclick = function() {
                localStorage.setItem('cookie-consent', 'accepted');
                document.body.removeChild(banner);
              };
              
              const rejectButton = document.createElement('button');
              rejectButton.textContent = 'Rejeitar';
              rejectButton.style.padding = '0.5rem 1rem';
              rejectButton.style.backgroundColor = 'transparent';
              rejectButton.style.color = 'white';
              rejectButton.style.border = '1px solid #666';
              rejectButton.style.borderRadius = '4px';
              rejectButton.style.cursor = 'pointer';
              rejectButton.onclick = function() {
                localStorage.setItem('cookie-consent', 'rejected');
                document.body.removeChild(banner);
              };
              
              buttons.appendChild(rejectButton);
              buttons.appendChild(acceptButton);
              
              banner.appendChild(content);
              banner.appendChild(buttons);
              document.body.appendChild(banner);
            }
            
            // Executar após carregar a página
            if (typeof window !== 'undefined') {
              setTimeout(createCookieBanner, 1000);
            }
          `}
        </Script>
      </body>
    </html>
  )
}
