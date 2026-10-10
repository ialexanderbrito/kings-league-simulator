import { Metadata } from 'next'
import { PrivacidadeView } from './PrivacidadeView'

export const metadata: Metadata = {
  title: 'Política de Privacidade & Dados | Kings League Simulador',
  description: 'Privacidade e transparência total: zero coleta de dados pessoais, armazenamento local no navegador e compromisso comunitário do Kings League Simulador.',
  alternates: {
    canonical: 'https://kings-league-simulator.vercel.app/politica-de-privacidade',
  },
  openGraph: {
    title: 'Política de Privacidade & Dados | Kings League Simulador',
    description: 'Sem login, sem rastreadores abusivos. Suas simulações pertencem a você no seu navegador.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PoliticaDePrivacidadePage() {
  return <PrivacidadeView />
}