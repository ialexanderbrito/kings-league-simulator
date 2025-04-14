import '@/styles/globals.css'
import { Analytics } from '@vercel/analytics/react'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider'
import { TeamThemeProvider } from '@/contexts/team-theme-context'
import { ButtonTop } from "@/components/ui/button-top"
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

// Melhorando os metadados para SEO
export const metadata: Metadata = {
  title: {
    default: 'Kings League Simulador | Simulação Não-Oficial',
    template: '%s | Kings League Simulador'
  },
  description: 'Simulador completo da Kings League com partidas ao vivo, classificação, estatísticas de jogadores e times, histórico de torneios e muito mais. Site não-oficial dedicado aos fãs da Kings League.',
  authors: [{ name: 'ialexanderbrito', url: 'https://ialexanderbrito.dev' }],
  creator: 'ialexanderbrito',
  publisher: 'Kings League Simulador',
  keywords: [
    'kings league', 'futebol', 'simulador kings league', 'estatísticas kings league',
    'campeonato', 'classificação kings league', 'times kings league', 'jogadores kings league',
    'torneio', 'esportes', 'simulador de partidas', 'resultados king league', 'tabela kings league'
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
    title: 'Kings League Simulador | Simulação Não-Oficial da Liga',
    description: 'Acompanhe resultados, estatísticas e simulações da Kings League. Confira a tabela de classificação, jogos, gols e desempenho dos times. Site não oficial criado por fãs.',
    siteName: 'Kings League Simulador',
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
    title: 'Kings League Simulador | Estatísticas e simulações',
    description: 'Acompanhe jogos, classificação e estatísticas da Kings League com este simulador não-oficial. Dados atualizados e interface intuitiva.',
    creator: '@ialexanderbrito',
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
  verification: {
    google: 'google-site-verification-code', // Adicione seu código de verificação aqui quando tiver
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
        {/* Google AdSense - implementação recomendada pelo Next.js */}
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4240296013936173`}
          crossOrigin="anonymous"
        />

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
            <ButtonTop />
          </TeamThemeProvider>
        </ThemeProvider>

        {/* Schema.org estruturado para mecanismos de busca */}
        <Script id="schema-org" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "SportsOrganization",
              "name": "Kings League Simulador",
              "url": "https://kings-league-simulator.vercel.app",
              "logo": "https://kings-league-simulator.vercel.app/favicon.svg",
              "description": "Simulador não-oficial da Kings League com estatísticas, partidas e classificações atualizadas",
              "sameAs": [
                "https://github.com/ialexanderbrito/kings-league-simulator"
              ],
              "potentialAction": {
                "@type": "ViewAction",
                "target": "https://kings-league-simulator.vercel.app"
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
