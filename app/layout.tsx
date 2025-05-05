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
    default: 'Kings League Simulador Oficial 2025 | Simule Partidas e Resultados',
    template: '%s | Kings League Simulador 2025'
  },
  description: 'Simulador oficial da Kings League 2025! Simule partidas, acompanhe classificação ao vivo, estatísticas de jogadores e times. O mais completo simulador brasileiro da Kings League com dados em tempo real.',
  authors: [{ name: 'ialexanderbrito', url: 'https://ialexanderbrito.dev' }],
  creator: 'ialexanderbrito',
  publisher: 'Kings League Simulador',
  keywords: [
    'kings league simulador', 'simulador kings league', 'kings league brasil',
    'kings league 2025', 'simulador de jogos kings league', 'tabela kings league',
    'classificação kings league', 'times kings league', 'jogadores kings league',
    'kings league resultados', 'chaveamento kings league', 'playoffs kings league',
    'kings league partidas', 'quem vai ganhar kings league', 'palpites kings league',
    'prognósticos kings league', 'estatísticas kings league', 'como funciona kings league',
    'times da kings league', 'jogos kings league', 'futebol 7'
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
    title: 'Kings League Simulador 2025 | O Simulador Mais Completo da Kings League',
    description: 'Simule partidas, acompanhe resultados em tempo real e descubra quem será o campeão da Kings League. O simulador perfeito para quem ama a Kings League!',
    siteName: 'Kings League Simulador',
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
    title: 'Kings League Simulador 2025 | Simule Jogos, Resultados e Playoffs',
    description: 'Simulador completo da Kings League com dados ao vivo, estatísticas, playoffs e muito mais. Descubra quem será o campeão!',
    creator: '@ialexanderbrito',
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
              "@type": "SportsOrganization",
              "name": "Kings League Simulador Oficial 2025",
              "url": "https://kings-league-simulator.vercel.app",
              "logo": "https://kings-league-simulator.vercel.app/favicon.svg",
              "description": "Simulador completo da Kings League 2025 com estatísticas em tempo real, simulações de partidas, classificação ao vivo e playoffs.",
              "foundingDate": "2023-01-01",
              "keywords": "kings league, simulador, futebol, estatísticas, simulador kings league, tabela kings league, classificação kings league",
              "sameAs": [
                "https://github.com/ialexanderbrito/kings-league-simulator"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "BR"
              },
              "founder": {
                "@type": "Person",
                "name": "Alexander Brito",
                "url": "https://github.com/ialexanderbrito"
              },
              "about": {
                "@type": "Thing",
                "name": "Kings League",
                "description": "Liga de futebol 7 criada por Gerard Piqué com regras inovadoras e times presididos por personalidades conhecidas."
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "https://kings-league-simulator.vercel.app"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "BRL",
                "availability": "https://schema.org/InStock"
              },
              "potentialAction": [
                {
                  "@type": "ViewAction",
                  "target": "https://kings-league-simulator.vercel.app"
                },
                {
                  "@type": "SearchAction",
                  "target": "https://kings-league-simulator.vercel.app/search?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              ]
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
